import { Backdrop } from '../gl/backdrop';
import { LabelSet } from '../gl/labels';
import { m4TRS, mat4, mulberry32, saturate, smoothstep } from '../gl/math';
import {
  ATOM_STRIDE, AtomBatch, AtomWriter, BOND_STRIDE, BondBatch, BondWriter,
} from '../gl/molecule';
import { PARTICLE_STRIDE, ParticleField } from '../gl/particles';
import type { FocusHint, FrameContext, Stage } from '../gl/stage';

/**
 * A slice of the p53 network.
 *
 * These are real, well-characterised interactions. The shape of the graph is
 * the point: p53 sits at the centre, damage sensors feed into it, it drives a
 * set of effector genes, and one of those effectors — MDM2 — turns around and
 * destroys it. That negative feedback loop is why p53 levels spike and settle
 * rather than climbing forever.
 */
type EdgeKind = 'activates' | 'inhibits' | 'transcribes';

interface Node {
  id: string;
  role: 'hub' | 'sensor' | 'regulator' | 'effector';
  /** Rough functional description, kept short enough for the caption line. */
  note: string;
}

const NODES: readonly Node[] = [
  { id: 'TP53', role: 'hub', note: 'the transcription factor itself' },
  { id: 'ATM', role: 'sensor', note: 'senses double-strand breaks' },
  { id: 'ATR', role: 'sensor', note: 'senses replication stress' },
  { id: 'CHEK2', role: 'sensor', note: 'kinase relaying the damage signal' },
  { id: 'TP53BP1', role: 'sensor', note: 'damage-site adaptor' },
  { id: 'MDM2', role: 'regulator', note: 'ubiquitin ligase, marks p53 for destruction' },
  { id: 'MDM4', role: 'regulator', note: 'blocks p53 transactivation' },
  { id: 'USP7', role: 'regulator', note: 'deubiquitinase, rescues both' },
  { id: 'CREBBP', role: 'regulator', note: 'acetylates and activates' },
  { id: 'SIRT1', role: 'regulator', note: 'deacetylates and quiets' },
  { id: 'CDKN1A', role: 'effector', note: 'p21 — halts the cell cycle' },
  { id: 'GADD45A', role: 'effector', note: 'growth arrest and repair' },
  { id: 'SFN', role: 'effector', note: '14-3-3σ — holds the G2 arrest' },
  { id: 'BAX', role: 'effector', note: 'punches holes in mitochondria' },
  { id: 'BBC3', role: 'effector', note: 'PUMA — commits to apoptosis' },
  { id: 'PTEN', role: 'effector', note: 'dampens survival signalling' },
];

const EDGES: ReadonlyArray<readonly [string, string, EdgeKind]> = [
  ['ATM', 'TP53', 'activates'],
  ['ATM', 'CHEK2', 'activates'],
  ['ATR', 'TP53', 'activates'],
  ['ATR', 'CHEK2', 'activates'],
  ['CHEK2', 'TP53', 'activates'],
  ['TP53BP1', 'TP53', 'activates'],
  ['ATM', 'TP53BP1', 'activates'],
  ['ATM', 'MDM2', 'inhibits'],
  ['MDM2', 'TP53', 'inhibits'],
  ['MDM4', 'TP53', 'inhibits'],
  ['MDM2', 'MDM4', 'inhibits'],
  ['USP7', 'MDM2', 'activates'],
  ['USP7', 'TP53', 'activates'],
  ['CREBBP', 'TP53', 'activates'],
  ['SIRT1', 'TP53', 'inhibits'],
  ['TP53', 'MDM2', 'transcribes'],
  ['TP53', 'CDKN1A', 'transcribes'],
  ['TP53', 'GADD45A', 'transcribes'],
  ['TP53', 'SFN', 'transcribes'],
  ['TP53', 'BAX', 'transcribes'],
  ['TP53', 'BBC3', 'transcribes'],
  ['TP53', 'PTEN', 'transcribes'],
  ['CDKN1A', 'GADD45A', 'activates'],
  ['BBC3', 'BAX', 'activates'],
  ['PTEN', 'MDM2', 'inhibits'],
];

const ROLE_COLOR: Record<Node['role'], readonly [number, number, number]> = {
  hub: [1.0, 0.78, 0.34],
  sensor: [0.42, 0.86, 1.0],
  regulator: [1.0, 0.44, 0.56],
  effector: [0.40, 1.0, 0.70],
};

const EDGE_COLOR: Record<EdgeKind, readonly [number, number, number]> = {
  activates: [0.36, 0.78, 1.0],
  inhibits: [1.0, 0.40, 0.52],
  transcribes: [0.44, 1.0, 0.72],
};

const PULSES_PER_EDGE = 3;

/**
 * Scale 9 — the interactome.
 *
 * Back out from the molecule to what it does. One gene, the network it sits in,
 * and the feedback loop that keeps it in check.
 */
export class InteractomeStage implements Stage {
  readonly id = 'interactome';
  readonly label = 'Connections';
  readonly scale = '10⁻⁸ m';
  readonly caption =
    'One gene never acts alone. Damage sensors switch p53 on, p53 switches on the genes that arrest or kill the cell — and one of them, MDM2, switches p53 back off.';
  readonly detail = 'p53 network · sensors, regulators, effectors';

  private readonly nodes = new AtomBatch(3);
  private readonly edges = new BondBatch(6);
  private readonly pulses = new ParticleField();
  private readonly labels = new LabelSet(NODES.map((node) => node.id));
  private readonly backdrop = new Backdrop();
  private readonly model = mat4();

  private readonly positions: Array<[number, number, number]> = [];
  private readonly degree = new Map<string, number>();
  private readonly nodeWriter = new AtomWriter(new Float32Array(NODES.length * ATOM_STRIDE));
  private readonly edgeWriter = new BondWriter(new Float32Array(EDGES.length * BOND_STRIDE));
  private readonly pulseData = new Float32Array(EDGES.length * PULSES_PER_EDGE * PARTICLE_STRIDE);

  init(gl: WebGL2RenderingContext): void {
    this.dispose();

    this.nodes.init(gl);
    this.edges.init(gl);
    this.pulses.init(gl);
    this.labels.init(gl);
    this.backdrop.init(gl);

    this.layout();
  }

  /**
   * Force-directed layout, solved once at init.
   *
   * Repulsion between every pair, springs along edges, and a pull toward the
   * origin that scales with distance so the graph stays inside frame. Running
   * it here rather than per frame means the network is stable — the viewer can
   * come back to this stage and find it exactly as they left it.
   */
  private layout(): void {
    const random = mulberry32(0x9e3d);
    const count = NODES.length;
    const positions: Array<[number, number, number]> = [];

    for (let i = 0; i < count; i++) {
      // Seed on a sphere; TP53 starts at the centre and mostly stays there.
      if (NODES[i]!.role === 'hub') {
        positions.push([0, 0, 0]);
        continue;
      }
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * 2.399963229728653;
      positions.push([
        Math.cos(theta) * r * 1.4 + (random() - 0.5) * 0.1,
        y * 1.4 + (random() - 0.5) * 0.1,
        Math.sin(theta) * r * 1.4 + (random() - 0.5) * 0.1,
      ]);
    }

    const indexOf = new Map<string, number>();
    NODES.forEach((node, i) => indexOf.set(node.id, i));

    for (const [a, b] of EDGES) {
      this.degree.set(a, (this.degree.get(a) ?? 0) + 1);
      this.degree.set(b, (this.degree.get(b) ?? 0) + 1);
    }

    const velocity: Array<[number, number, number]> = positions.map(() => [0, 0, 0]);

    for (let step = 0; step < 400; step++) {
      const cooling = 1 - step / 400;

      for (let i = 0; i < count; i++) {
        const vi = velocity[i]!;
        const pi = positions[i]!;

        for (let j = i + 1; j < count; j++) {
          const pj = positions[j]!;
          let dx = pi[0] - pj[0];
          let dy = pi[1] - pj[1];
          let dz = pi[2] - pj[2];
          let d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < 1e-4) {
            // Coincident nodes have no separation direction; nudge them apart.
            dx = random() - 0.5;
            dy = random() - 0.5;
            dz = random() - 0.5;
            d2 = 0.01;
          }
          const force = 0.55 / d2;
          const d = Math.sqrt(d2);
          const vj = velocity[j]!;
          vi[0] += (dx / d) * force;
          vi[1] += (dy / d) * force;
          vi[2] += (dz / d) * force;
          vj[0] -= (dx / d) * force;
          vj[1] -= (dy / d) * force;
          vj[2] -= (dz / d) * force;
        }

        // Centring pull, stronger the further out a node drifts.
        const dist = Math.hypot(pi[0], pi[1], pi[2]);
        const pull = 0.06 * dist;
        if (dist > 1e-5) {
          vi[0] -= (pi[0] / dist) * pull;
          vi[1] -= (pi[1] / dist) * pull;
          vi[2] -= (pi[2] / dist) * pull;
        }
      }

      for (const [a, b] of EDGES) {
        const i = indexOf.get(a)!;
        const j = indexOf.get(b)!;
        const pi = positions[i]!;
        const pj = positions[j]!;
        const dx = pj[0] - pi[0];
        const dy = pj[1] - pi[1];
        const dz = pj[2] - pi[2];
        const d = Math.hypot(dx, dy, dz) || 1e-4;
        const force = (d - 1.25) * 0.09;
        const vi = velocity[i]!;
        const vj = velocity[j]!;
        vi[0] += (dx / d) * force;
        vi[1] += (dy / d) * force;
        vi[2] += (dz / d) * force;
        vj[0] -= (dx / d) * force;
        vj[1] -= (dy / d) * force;
        vj[2] -= (dz / d) * force;
      }

      for (let i = 0; i < count; i++) {
        const v = velocity[i]!;
        const p = positions[i]!;
        // The hub is anchored: the whole point of the picture is p53 at centre.
        const anchor = NODES[i]!.role === 'hub' ? 0.06 : 1;
        p[0] += v[0] * 0.055 * cooling * anchor;
        p[1] += v[1] * 0.055 * cooling * anchor;
        p[2] += v[2] * 0.055 * cooling * anchor;
        v[0] *= 0.72;
        v[1] *= 0.72;
        v[2] *= 0.72;
      }
    }

    // Normalise the result to a known radius.
    //
    // Where a force solver settles depends on how repulsion, springs and the
    // centring pull happen to balance, which is not something to leave the
    // framing of the final shot to. Rescaling afterwards keeps the graph inside
    // the frame — and keeps its labels readable — whatever the solver decides.
    let extent = 0;
    for (const p of positions) extent = Math.max(extent, Math.hypot(p[0], p[1], p[2]));
    const scale = extent > 1e-4 ? 1.85 / extent : 1;
    for (const p of positions) {
      p[0] *= scale;
      p[1] *= scale;
      p[2] *= scale;
    }

    this.positions.length = 0;
    this.positions.push(...positions);
  }

  private nodePosition(index: number, time: number): [number, number, number] {
    const p = this.positions[index]!;
    // A slow independent bob per node so the graph breathes.
    return [
      p[0] + Math.sin(time * 0.5 + index * 1.7) * 0.03,
      p[1] + Math.sin(time * 0.43 + index * 2.3) * 0.03,
      p[2] + Math.cos(time * 0.47 + index * 1.1) * 0.03,
    ];
  }

  update(ctx: FrameContext): void {
    const reveal = smoothstep(0.0, 0.45, ctx.local);
    const indexOf = new Map<string, number>();
    NODES.forEach((node, i) => indexOf.set(node.id, i));

    // --- Nodes -------------------------------------------------------------
    const nodeWriter = this.nodeWriter;
    nodeWriter.reset();
    NODES.forEach((node, i) => {
      const [x, y, z] = this.nodePosition(i, ctx.time);
      const links = this.degree.get(node.id) ?? 1;
      const radius = 0.05 + Math.sqrt(links) * 0.026;
      const pulse = node.role === 'hub' ? 0.5 + 0.35 * Math.sin(ctx.time * 1.6) : 0.22;
      const appear = saturate((reveal - i * 0.02) * 4);
      nodeWriter.push(x, y, z, radius * appear, ROLE_COLOR[node.role], pulse);
    });
    this.nodes.upload(nodeWriter.data, nodeWriter.count);

    // --- Edges -------------------------------------------------------------
    const edgeWriter = this.edgeWriter;
    edgeWriter.reset();
    EDGES.forEach(([a, b, kind], i) => {
      const ia = indexOf.get(a)!;
      const ib = indexOf.get(b)!;
      const pa = this.nodePosition(ia, ctx.time);
      const pb = this.nodePosition(ib, ctx.time);
      const appear = saturate((reveal - 0.12 - i * 0.012) * 3.5);
      if (appear <= 0.001) return;

      // Grow each edge out from its source as it appears.
      edgeWriter.push(
        pa[0], pa[1], pa[2],
        pa[0] + (pb[0] - pa[0]) * appear,
        pa[1] + (pb[1] - pa[1]) * appear,
        pa[2] + (pb[2] - pa[2]) * appear,
        kind === 'transcribes' ? 0.0075 : 0.006,
        EDGE_COLOR[kind],
        0.35,
        0.5 * appear,
      );
    });
    this.edges.upload(edgeWriter.data, edgeWriter.count);

    // --- Signal pulses travelling along the edges --------------------------
    const pulseData = this.pulseData;
    let pulseCount = 0;
    EDGES.forEach(([a, b, kind], i) => {
      const ia = indexOf.get(a)!;
      const ib = indexOf.get(b)!;
      const pa = this.nodePosition(ia, ctx.time);
      const pb = this.nodePosition(ib, ctx.time);
      const color = EDGE_COLOR[kind];

      for (let k = 0; k < PULSES_PER_EDGE; k++) {
        const t = ((ctx.time * 0.32 + i * 0.17 + k / PULSES_PER_EDGE) % 1);
        const p = pulseCount * PARTICLE_STRIDE;
        pulseData[p] = pa[0] + (pb[0] - pa[0]) * t;
        pulseData[p + 1] = pa[1] + (pb[1] - pa[1]) * t;
        pulseData[p + 2] = pa[2] + (pb[2] - pa[2]) * t;
        // Fade in and out at the ends so pulses don't blink at the nodes.
        pulseData[p + 3] = 0.03 * Math.sin(t * Math.PI) * reveal;
        pulseData[p + 4] = color[0];
        pulseData[p + 5] = color[1];
        pulseData[p + 6] = color[2];
        pulseData[p + 7] = i * 3.1 + k;
        pulseCount++;
      }
    });
    this.pulses.upload(pulseData, pulseCount);

    // --- Labels ------------------------------------------------------------
    this.labels.place(
      NODES.map((node, i) => {
        const [x, y, z] = this.nodePosition(i, ctx.time);
        const links = this.degree.get(node.id) ?? 1;
        return {
          label: node.id,
          x,
          y: y + 0.05 + Math.sqrt(links) * 0.026,
          z,
          size: node.role === 'hub' ? 0.115 : 0.082,
          color: ROLE_COLOR[node.role],
          opacity: saturate((reveal - 0.25 - i * 0.015) * 4) * 0.95,
        };
      }),
    );

    const zoom = Math.pow(2, -0.1 + ctx.local * 0.55);
    m4TRS(this.model, 0, 0, -0.4 + ctx.local * 1.6, ctx.time * 0.08, zoom);
  }

  render(ctx: FrameContext): void {
    this.backdrop.render(
      ctx.gl,
      {
        top: [0.016, 0.030, 0.070],
        bottom: [0.003, 0.007, 0.020],
        glow: [0.16, 0.34, 0.64],
        density: 0.7,
        glowX: 0.0,
        glowY: 0.0,
      },
      ctx.time,
      ctx.alpha,
      ctx.width / ctx.height,
    );

    this.edges.draw(ctx, this.model, ctx.alpha, { roughness: 0.55, translucency: 0.6 });
    this.nodes.draw(ctx, this.model, ctx.alpha, { roughness: 0.26, translucency: 0.45 });
    this.pulses.draw(ctx, this.model, ctx.alpha * 0.9, { drift: 0, swirl: 0.1 });
    this.labels.draw(ctx, this.model);
  }

  focus(): FocusHint {
    return { distance: 6.0, aperture: 5.5 };
  }

  dispose(): void {
    this.nodes.dispose();
    this.edges.dispose();
    this.pulses.dispose();
    this.labels.dispose();
    this.backdrop.dispose();
    this.degree.clear();
  }
}
