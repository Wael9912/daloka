// node tests/run.mjs — engine logic tests (no browser needed).
import { detectChord, transposeNote, chordName, CHORD_TYPES } from '../js/chord.js';
import { compileStyle, lintPack, noteNumber } from '../js/styledsl.js';
import { STYLE_PACK } from '../js/styles.js';
import { Sequencer } from '../js/sequencer.js';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log('FAIL', msg); } };
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg}: got ${JSON.stringify(a)} want ${JSON.stringify(b)}`);

// ── chord detection: every type in all 12 keys, fingered, three voicings ──
for (let root = 0; root < 12; root++) {
  for (const [type, def] of Object.entries(CHORD_TYPES)) {
    const base = 48 + root;
    const rootPos = def.intervals.map((i) => base + i);
    const c1 = detectChord(rootPos, 'fingered');
    eq(c1 && [c1.root, c1.type], [root, type], `fingered ${chordName({ root, type })} root position`);
    // first inversion (lowest note raised an octave)
    const inv = [...rootPos.slice(1), rootPos[0] + 12];
    const c2 = detectChord(inv, 'fingered');
    if (type === 'aug') ok(c2 && c2.type === 'aug', 'aug inversion is still aug (symmetric chord)');
    else eq(c2 && [c2.root, c2.type], [root, type], `fingered ${chordName({ root, type })} 1st inversion`);
    // octave-doubled root
    const c3 = detectChord([...rootPos, base + 12], 'fingered');
    eq(c3 && [c3.root, c3.type], [root, type], `fingered ${chordName({ root, type })} doubled root`);
  }
  // one-finger mode
  const r = 48 + root;
  eq(detectChord([r], 'single').type, 'maj', 'single: 1 key = major');
  eq(detectChord([r, r - 3], 'single').type, 'min', 'single: black key below = minor');
  eq(detectChord([r, r - 2], 'single').type, 'dom7', 'single: white key below = 7th');
  eq(detectChord([r, r - 2, r - 3], 'single').type, 'min7', 'single: both = m7');
  eq(detectChord([r], 'single').root, root, 'single: root');
}
ok(detectChord([], 'fingered') === null, 'empty = null');
ok(detectChord([60, 61], 'fingered') === null, 'C + C# = no chord');

// ── transposition ──
eq(transposeNote(36, 'none', { root: 7, type: 'maj' }), 36, 'none keeps');
eq(transposeNote(36, 'root', { root: 7, type: 'maj' }), 31, 'root G folds down');
eq(transposeNote(36, 'root', { root: 2, type: 'maj' }), 38, 'root D goes up');
eq(transposeNote(52, 'chord', { root: 0, type: 'min' }), 51, 'E over C minor = Eb');
eq(transposeNote(52, 'chord', { root: 9, type: 'min' }), 48, 'E over A minor = C');
eq(transposeNote(55, 'chord', { root: 0, type: 'dim' }), 54, 'G over C dim = Gb');
eq(transposeNote(59, 'chord', { root: 0, type: 'dom7' }), 58, 'B over C7 = Bb');
eq(transposeNote(59, 'chord', { root: 0, type: 'maj7' }), 59, 'B over Cmaj7 = B');
eq(transposeNote(52, 'chord', { root: 0, type: 'sus4' }), 53, 'E over Csus4 = F');

// ── style DSL ──
eq(noteNumber('C4'), 60, 'C4 = 60');
eq(noteNumber('A0'), 21, 'A0 = 21');
eq(noteNumber('Bb2'), 46, 'Bb2 = 46');
const problems = lintPack(STYLE_PACK);
eq(problems, [], 'built-in pack lints clean');
eq(STYLE_PACK.length, 10, 'ten built-in styles');
const tum = compileStyle(STYLE_PACK[0]);
eq(tum.parts.mainA.beats, 8, 'Tum Tum main A = 2 bars of 4');
ok(tum.parts.mainA.events.some((e) => e.track === 'drums' && e.n === 36 && e.t === 0), 'kick on beat 1');
ok(tum.parts.mainA.events.every((e) => e.t < 8), 'no event past part end');
const six = compileStyle(STYLE_PACK.find((s) => s.id === 'six8'));
eq(six.beatsPerBar, 3, '6/8 = 3 quarter beats per bar');
eq(six.steps, 12, '6/8 = 12 steps per bar');
const bal = compileStyle(STYLE_PACK.find((s) => s.id === 'ballad'));
const longBass = bal.parts.mainA.events.find((e) => e.track === 'bass' && e.t === 0);
ok(longBass && Math.abs(longBass.d - 8 * 0.25 * 0.8) < 1e-9, 'C2:8 lasts 8 steps × gate');
ok(lintPack([{ id: 'x', name: 'x', tracks: { drums: { role: 'drums', channel: 9, transpose: 'none' } }, parts: {} }]).length > 0, 'lint catches missing parts');

// ── sequencer: part chaining, fills, ending, zero drift ──
function makeSeq() {
  let now = 0;
  const played = [];
  const timers = [];
  const seq = new Sequencer({
    clock: { now: () => now },
    sink: { noteOn: (ch, n, v, t, d) => played.push({ ch, n, v, t, d }), allOff: () => {} },
    setTimer: (fn) => { timers.push(fn); return timers.length; },
    clearTimer: () => { timers.length = 0; },
  });
  const advance = (dt) => { now += dt; for (const f of [...timers]) f(); };
  return { seq, played, advance, now: () => now };
}
{
  const { seq, played, advance } = makeSeq();
  seq.setStyle(tum);
  seq.setTempo(120);               // 0.5 s per beat, 2 s per bar, mainA = 4 s
  seq.setChord({ root: 7, type: 'maj' });
  seq.start();
  const parts = [];
  seq.on((type, d) => { if (type === 'part') parts.push(d); });
  seq.fill('B');
  for (let i = 0; i < 400; i++) advance(0.05);   // 20 s
  eq(parts.slice(0, 3), ['fillA', 'mainB', 'mainB'], 'fill then main B, then main B repeats');
  const bass = played.filter((e) => e.ch === 2);
  ok(bass.length > 0 && bass.every((e) => [31, 38, 33, 35, 42].includes(e.n)), 'bass follows G major (root folded down)');
  seq.ending();
  for (let i = 0; i < 100; i++) advance(0.05);
  ok(parts.includes('ending') && !seq.playing, 'ending stops the sequencer');
}
{
  // Drift: 10,000 bars of main A chained by arithmetic must land exactly on bar boundaries.
  const { seq, played, advance } = makeSeq();
  seq.setStyle(tum);
  seq.setTempo(240);               // 1 s per bar
  seq.start();
  const total = 10000;
  for (let i = 0; i < total * 20 + 40; i++) advance(0.05);
  const t0 = played[0].t;
  const kicks = played.filter((e) => e.ch === 9 && e.n === 36 && Math.abs((e.t - t0) - Math.round(e.t - t0)) < 1e-6);
  const expected = kicks.filter((e) => e.t - t0 <= total).length;
  ok(expected === total + 1, `kick lands on every bar line over ${total} bars (${expected})`);
  let maxErr = 0;
  for (const e of played) maxErr = Math.max(maxErr, Math.abs((e.t - t0) * 16 - Math.round((e.t - t0) * 16)));
  ok(maxErr < 1e-6, `max timing error ${maxErr} s`);
}
{
  const { seq, played, advance } = makeSeq();
  seq.setStyle(tum);
  seq.armSyncStart(true);
  advance(1);
  ok(played.length === 0 && !seq.playing, 'sync start waits');
  seq.start();
  ok(seq.playing && !seq.syncArmed, 'start clears sync arm');
}

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
