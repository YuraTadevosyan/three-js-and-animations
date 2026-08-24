/**
 * Offline checks for the biology layer.
 *
 * The 3D scenes cannot be asserted on without a browser, but everything that
 * decides *what* they draw — the genetic code, ORF detection, sanitising
 * pasted input, secondary-structure assignment, backbone geometry — is pure
 * data and can be. Run with `npm run check:bio`.
 */
import { analyse, sanitise, reverseComplementOf, findOrfs, meltingTemp } from '../src/app/bio/analysis';
import { SequenceStore } from '../src/app/bio/store';
import { P53_CDS, P53_PEPTIDE, GENETIC_CODE } from '../src/app/bio/sequence';
import { structureFor, predictHelices, foldPeptide, CA_SPACING } from '../src/app/bio/fold';

let failures = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${name}${detail ? '  — ' + detail : ''}`);
};

console.log('\n-- default sequence is unchanged by the new pipeline --');
const base = analyse(P53_CDS);
check('length 180', base.length === 180, `${base.length}`);
check('one ORF found', base.orfs.length === 1, `${base.orfs.length}`);
check('coding came from the ORF', base.coding.fromOrf);
check('peptide round-trips to real p53', base.coding.peptide === P53_PEPTIDE);
check('codon count matches residues', base.coding.codons.length === P53_PEPTIDE.length);

console.log('\n-- sanitising real-world paste --');
const messy = sanitise('>sp|P04637|P53_HUMAN\naug gcc\txyz\nTTT');
check('FASTA header dropped + U->T + whitespace', messy.dna === 'ATGGCCTTT', messy.dna);
check('non-nucleotides counted', messy.rejected === 3, `${messy.rejected}`);
const capped = sanitise('A'.repeat(900));
check('capped at 600', capped.dna.length === 600 && capped.truncated);

console.log('\n-- reverse complement --');
check('ATGC -> GCAT', reverseComplementOf('ATGC') === 'GCAT', reverseComplementOf('ATGC'));
check('palindrome GAATTC (EcoRI site)', reverseComplementOf('GAATTC') === 'GAATTC');

console.log('\n-- ORF detection --');
const withStop = 'CCC' + 'ATG' + 'GCT'.repeat(12) + 'TAA' + 'GGGGG';
const orfs = findOrfs(withStop);
check('finds the ORF', orfs.length === 1, `${orfs.length}`);
check('starts at the ATG', orfs[0]!.start === 3, `${orfs[0]!.start}`);
check('terminated at the stop', orfs[0]!.terminated);
check('12 alanines after Met', orfs[0]!.peptide === 'M' + 'A'.repeat(12), orfs[0]!.peptide);
check('short ORFs ignored', findOrfs('ATGGCTTAA').length === 0);

console.log('\n-- genetic code sanity --');
check('64 codons', Object.keys(GENETIC_CODE).length === 64, `${Object.keys(GENETIC_CODE).length}`);
check('3 stops', Object.values(GENETIC_CODE).filter((r) => r === '*').length === 3);
check('20 amino acids', new Set(Object.values(GENETIC_CODE).filter((r) => r !== '*')).size === 20);

console.log('\n-- melting temperature --');
check('Wallace below 14nt: ATGC = 12', meltingTemp('ATGC') === 12, `${meltingTemp('ATGC')}`);
check('GC formula above 13nt', Math.abs(meltingTemp('ATGC'.repeat(5))! - 51.85) < 0.5, `${meltingTemp('ATGC'.repeat(5))}`);
check('empty is null', meltingTemp('') === null);

console.log('\n-- secondary structure --');
const known = structureFor(P53_PEPTIDE);
check('p53 uses the known annotation', !known.predicted);
check('helix spans residues 17-29', known.structure.slice(16, 29).every((s) => s === 'helix'));
check('residue 16 is coil', known.structure[15] === 'coil');
check('MDM2 contacts flagged', known.highlights.length === 3);

const custom = structureFor('AAAEEELLLMMMAAAEEE');
check('custom peptide is predicted', custom.predicted);
check('high-propensity run predicted helical', custom.structure.filter((s) => s === 'helix').length > 8,
  `${custom.structure.filter((s) => s === 'helix').length}`);
check('proline/glycine run stays coil',
  predictHelices('PGPGPGPGPGPGPGPG').every((s) => s === 'coil'));

console.log('\n-- folding geometry --');
const fold = foldPeptide(P53_PEPTIDE, known.structure);
check('one position per residue', fold.positions.length === P53_PEPTIDE.length);
check('all finite', fold.positions.every((p) => p.every(Number.isFinite)));
const gaps = fold.positions.slice(1).map((p, i) => {
  const q = fold.positions[i]!;
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
});
check('every Ca-Ca step is the real 3.8 A',
  gaps.every((g) => Math.abs(g - CA_SPACING) < 0.01),
  `min ${Math.min(...gaps).toFixed(2)} max ${Math.max(...gaps).toFixed(2)}`);
const helixGaps = gaps.slice(17, 27);
check('helix run keeps its shape', helixGaps.every((g) => Math.abs(g - CA_SPACING) < 0.01));

console.log('\n-- store behaviour --');
const store = new SequenceStore();
check('starts on the default', store.isDefault && !store.isFallback);
const v0 = store.version;
store.set(P53_CDS + '\n  ');   // same bases, different text
check('whitespace edit does not bump version', store.version === v0);
store.set('ATGGCTGCTGCTTAA');
check('real edit bumps version', store.version === v0 + 1);
check('renderDna follows the edit', store.renderDna === 'ATGGCTGCTGCTTAA');
store.set('');
check('empty falls back to p53', store.isFallback && store.renderDna === P53_CDS);
store.randomise(90);
check('random starts with ATG', store.renderDna.startsWith('ATG'));
check('random is 90 bases', store.analysis.length === 90, `${store.analysis.length}`);
store.reset();
check('reset restores the default', store.isDefault);

console.log(failures === 0 ? '\nALL PASS\n' : `\n${failures} FAILURE(S)\n`);
process.exit(failures === 0 ? 0 : 1);
