// Hologram physics: every point hangs on a damped spring from its place in
// the reconstruction, and the pointer pushes them aside in screen space.
// One invocation per point; the render pass reads the offsets as an
// instanced vertex buffer.

struct Frame {
  viewProj: mat4x4f,
  camRight: vec4f, // xyz; w = time (s)
  camUp: vec4f,    // xyz; w = device pixel ratio
  res: vec4f,      // xy = canvas px; z = arrival 0→1; w = collapse 0→1
  pointer: vec4f,  // xy = ndc; z = 1 while hovering the hologram; w = strength
  misc: vec4f,     // x = dt; y = aspect; z = scan-plane x; w = pulse (-1 = none)
}

@group(0) @binding(0) var<uniform> F: Frame;
@group(0) @binding(1) var<storage, read> baseBuf: array<vec4f>;
@group(0) @binding(2) var<storage, read_write> offsBuf: array<vec4f>;
@group(0) @binding(3) var<storage, read_write> velBuf: array<vec4f>;

@compute @workgroup_size(64)
fn simulate(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= arrayLength(&baseBuf)) {
    return;
  }
  let dt = F.misc.x;
  var off = offsBuf[i].xyz;
  var vel = velBuf[i].xyz;

  // Spring home, critically-ish damped.
  var force = -26.0 * off - 6.5 * vel;

  if (F.pointer.z > 0.5) {
    let world = baseBuf[i].xyz + off;
    let clip = F.viewProj * vec4f(world, 1.0);
    if (clip.w > 0.0) {
      var d = clip.xy / clip.w - F.pointer.xy;
      d.x *= F.misc.y; // aspect-correct distance
      let r2 = dot(d, d);
      let push = F.pointer.w * exp(-r2 / 0.02);
      // Away from the pointer, in the plane of the screen.
      let dir = F.camRight.xyz * d.x + F.camUp.xyz * d.y;
      let len = max(length(dir), 1e-4);
      force += (dir / len) * push * 9.0;
    }
  }

  vel += force * dt;
  off += vel * dt;
  offsBuf[i] = vec4f(off, 0.0);
  velBuf[i] = vec4f(vel, 0.0);
}
