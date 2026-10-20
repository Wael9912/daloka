// Daloka — app controller. Wires MIDI/screen keys → chord zone + voices,
// the sequencer transport, setups (registrations), imports and the UI.

import { createAudio } from './audio.js';
import { Engine, CH } from './engine.js';
import { Sequencer } from './sequencer.js';
import { MidiInput } from './midi.js';
import { STYLE_PACK } from './styles.js';
import { compileStyle, lintPack } from './styledsl.js';
import { detectChord, chordName, NOTE_NAMES } from './chord.js';
import { t } from './i18n.js';
import * as store from './store.js';

export const VERSION = '0.1.0';

// GM programs to prefer for each built-in voice name when an SF2 is loaded.
const GM_FOR = { piano: 0, organ: 16, accordion: 21, oud: 24, tambour: 105, strings: 48, brass: 61, sax: 65, flute: 73, bass: 33, lead: 81 };
const TRACK_LABEL = { drums: 'drumsTrack', perc: 'percTrack', bass: 'bassTrack', chord: 'chordTrack', pad: 'padTrack', phrase: 'phraseTrack' };

const $ = (id) => document.getElementById(id);

const settings = Object.assign({
  lang: (navigator.language || '').startsWith('ar') ? 'ar' : 'en',
  styleId: 'tumtum', tempo: null, transpose: 0, split: 54, chordMode: 'fingered',
  lowerOn: false, layer: false, keysShown: true,
  programs: {}, bus: { keys: 0.8, style: 0.8, drums: 0.8, master: 0.9 }, mute: {},
  regs: [null, null, null, null, null, null, null, null],
}, store.loadSettings());

let audio, engine, seq, midi;
let styles = [];                 // compiled styles (built-in + imported)
let importedPack = null;
const held = new Map();          // raw note → channels it sounds on
const chordNotes = new Set();    // raw notes in the chord zone
let lastChord = null;
let deferredInstall = null;

// ───────────────────────── boot ─────────────────────────
function boot() {
  applyLang();
  $('gateBtn').addEventListener('click', startAudio, { once: true });
  $('langBtn').addEventListener('click', () => { settings.lang = settings.lang === 'ar' ? 'en' : 'ar'; persist(); applyLang(); renderAll(); });
  $('version').textContent = VERSION;
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; $('installBtn').hidden = false; });
  $('installBtn').addEventListener('click', async () => { if (!deferredInstall) return; deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; $('installBtn').hidden = true; });
}

async function startAudio() {
  audio = createAudio();
  await audio.resume();
  engine = new Engine(audio);
  seq = new Sequencer({
    clock: { now: () => audio.ctx.currentTime },
    sink: { noteOn: (ch, n, v, t0, d) => engine.noteOn(ch, n, v, t0, d), allOff: () => engine.allOff() },
  });
  seq.on(onSeqEvent);
  for (const [k, v] of Object.entries(settings.bus)) (k === 'master' ? audio.setMaster(v) : audio.setBus(k, v));
  seq.mute = settings.mute || {};

  await loadStoredFiles();
  buildStyles();
  selectStyle(settings.styleId, { keepPrograms: Object.keys(settings.programs).length > 0 });
  if (settings.tempo) seq.setTempo(settings.tempo);
  restorePrograms();

  midi = new MidiInput({
    onNote: ({ note, vel, on }) => (on ? noteOn(note, vel) : noteOff(note)),
    onSustain: (on) => { engine.setSustain(CH.upper, on); engine.setSustain(CH.lower, on); },
    onBend: (semis) => { engine.setBend(CH.upper, semis); engine.setBend(CH.lower, semis); },
    onAllOff: () => panic(),
    onState: (list) => renderMidi(list),
  });
  $('midiBtn').addEventListener('click', connectMidi);
  connectMidi(true);

  bindUI();
  renderAll();
  $('gate').remove();
  requestAnimationFrame(beatLoop);
  // Keep the audio context alive when the tab comes back.
  document.addEventListener('visibilitychange', () => { if (!document.hidden) audio.resume(); });
}

async function connectMidi(silent = false) {
  if (!midi.supported) { if (!silent) toast(t(settings.lang, 'midiUnsupported'), 5000); renderMidi([]); return; }
  try { renderMidi(await midi.connect()); }
  catch (err) { if (!silent) toast(`${t(settings.lang, 'error')}: ${err.message}`); renderMidi([]); }
}

async function loadStoredFiles() {
  try {
    const sf2 = await store.getFile('sf2');
    if (sf2 && sf2.buf) engine.loadSF2(sf2.buf, sf2.name);
  } catch (_) { /* no IndexedDB */ }
  try { importedPack = await store.getFile('styles'); } catch (_) { importedPack = null; }
}

// ───────────────────────── styles ─────────────────────────
function buildStyles() {
  styles = STYLE_PACK.map(compileStyle);
  if (importedPack && !lintPack(importedPack).length) {
    for (const src of importedPack) {
      const st = compileStyle(src);
      st.imported = true;
      const i = styles.findIndex((s) => s.id === st.id);
      if (i >= 0) styles[i] = st; else styles.push(st);
    }
  }
}

function currentStyle() { return styles.find((s) => s.id === settings.styleId) || styles[0]; }

function selectStyle(id, { keepPrograms = false } = {}) {
  const st = styles.find((s) => s.id === id) || styles[0];
  settings.styleId = st.id;
  seq.setStyle(st);
  settings.tempo = st.tempo;
  if (!keepPrograms) applyStyleVoices(st);
  persist();
  renderStyles();
  renderStatus();
  renderVoices();
}

/** Pick each style voice from the SF2 when it has the GM program, else the built-in. */
function programFor(voiceName) {
  if (engine.hasSF2) {
    const gm = GM_FOR[voiceName];
    if (gm !== undefined && engine.sf2.findPreset(0, gm) >= 0) return { kind: 'sf2', bank: 0, program: gm };
  }
  return { kind: 'synth', name: voiceName in GM_FOR ? voiceName : 'lead' };
}

function applyStyleVoices(st) {
  const v = st.voices || {};
  for (const role of ['upper', 'lower', 'bass', 'chord', 'pad', 'phrase']) {
    const prog = programFor(v[role] || (role === 'bass' ? 'bass' : role === 'upper' ? 'lead' : 'strings'));
    engine.setProgram(CH[role], prog);
    settings.programs[CH[role]] = engine.programKey(CH[role]);
  }
  for (const ch of [CH.drums, CH.perc]) {
    const kit = engine.hasSF2 && engine.sf2.findPreset(128, 0) >= 0 ? { kind: 'sf2', bank: 128, program: 0 } : { kind: 'synth', name: 'kit' };
    engine.setProgram(ch, kit);
    settings.programs[ch] = engine.programKey(ch);
  }
}

function restorePrograms() {
  for (const [ch, key] of Object.entries(settings.programs)) {
    if (!engine.setProgram(+ch, Engine.parseKey(key))) {
      engine.setProgram(+ch, +ch === 9 || +ch === 10 ? { kind: 'synth', name: 'kit' } : { kind: 'synth', name: 'lead' });
      settings.programs[ch] = engine.programKey(+ch);
    }
  }
}

// ───────────────────────── keys ─────────────────────────
function noteOn(note, vel) {
  if (held.has(note)) noteOff(note);
  const chans = [];
  if (note < settings.split) {
    chordNotes.add(note);
    const chord = detectChord([...chordNotes], settings.chordMode);
    if (chord) { lastChord = chord; seq.setChord(chord); }
    if (seq.syncArmed && !seq.playing) seq.start();
    if (settings.lowerOn) chans.push(CH.lower);
  } else {
    chans.push(CH.upper);
    if (settings.layer) chans.push(CH.lower);
  }
  for (const ch of chans) engine.noteOn(ch, note + settings.transpose, vel);
  held.set(note, chans.map((ch) => [ch, note + settings.transpose]));
  renderKey(note, true);
}

function noteOff(note) {
  chordNotes.delete(note);
  const chans = held.get(note);
  if (chans) for (const [ch, n] of chans) engine.noteOff(ch, n);
  held.delete(note);
  renderKey(note, false);
}

function panic() {
  engine.allOff();
  held.clear();
  chordNotes.clear();
  document.querySelectorAll('.key.on').forEach((k) => k.classList.remove('on'));
}

// ───────────────────────── sequencer events ─────────────────────────
function onSeqEvent(type) {
  if (type === 'transport' || type === 'part' || type === 'pending' || type === 'variation' || type === 'sync') renderTransport();
  if (type === 'chord') renderStatus();
  if (type === 'tempo') renderStatus();
}

// ───────────────────────── UI binding ─────────────────────────
function bindUI() {
  document.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => act(b.dataset.act)));
  $('startBtn').addEventListener('click', () => { if (seq.playing) seq.stop(); else seq.start(); });
  $('introBtn').addEventListener('click', () => { if (!seq.playing) seq.start({ intro: true }); });
  $('mainABtn').addEventListener('click', () => seq.setVariation('A'));
  $('mainBBtn').addEventListener('click', () => seq.setVariation('B'));
  $('fillBtn').addEventListener('click', () => seq.fill());
  $('endingBtn').addEventListener('click', () => seq.ending());
  $('syncBtn').addEventListener('click', () => seq.armSyncStart(!seq.syncArmed));
  $('lowerOnBtn').addEventListener('click', () => { settings.lowerOn = !settings.lowerOn; persist(); renderVoices(); });
  $('layerBtn').addEventListener('click', () => { settings.layer = !settings.layer; persist(); renderVoices(); });
  $('chordModeBtn').addEventListener('click', () => { settings.chordMode = settings.chordMode === 'fingered' ? 'single' : 'fingered'; persist(); renderVoices(); });
  $('panicBtn').addEventListener('click', panic);
  $('upperSel').addEventListener('change', (e) => setChannelProgram(CH.upper, e.target.value));
  $('lowerSel').addEventListener('change', (e) => setChannelProgram(CH.lower, e.target.value));
  $('keysToggle').addEventListener('click', () => { settings.keysShown = !settings.keysShown; persist(); renderKeyboard(); });

  $('settingsBtn').addEventListener('click', () => { renderSettings(); $('settings').showModal(); });
  $('closeSettings').addEventListener('click', () => $('settings').close());
  $('sf2File').addEventListener('change', importSF2);
  $('sf2Remove').addEventListener('click', async () => { await store.deleteFile('sf2'); engine.sf2.font = null; engine.sf2.buffers.clear(); applyStyleVoices(currentStyle()); renderSettings(); renderVoices(); });
  $('styleFile').addEventListener('change', importStyles);
  $('styleExport').addEventListener('click', () => { const o = $('styleExportOut'); o.hidden = !o.hidden; o.textContent = JSON.stringify(STYLE_PACK, null, 1); });
  $('styleRemove').addEventListener('click', async () => { await store.deleteFile('styles'); importedPack = null; buildStyles(); selectStyle(settings.styleId); renderSettings(); });
  document.querySelectorAll('input[data-bus]').forEach((r) => r.addEventListener('input', () => {
    const v = +r.value; settings.bus[r.dataset.bus] = v; persist();
    r.dataset.bus === 'master' ? audio.setMaster(v) : audio.setBus(r.dataset.bus, v);
  }));

  // Registrations: tap = load, hold = save.
  const regs = $('regBtns');
  regs.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const b = document.createElement('button');
    b.className = 'btn'; b.textContent = String(i + 1); b.dataset.i = i;
    let timer = null, longed = false;
    const down = () => { longed = false; timer = setTimeout(() => { longed = true; saveReg(i); }, 600); };
    const up = () => { clearTimeout(timer); if (!longed) loadReg(i); };
    b.addEventListener('pointerdown', down);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointerleave', () => clearTimeout(timer));
    b.addEventListener('contextmenu', (e) => e.preventDefault());
    regs.appendChild(b);
  }
  buildKeyboard();
  // Computer keyboard for desktop testing: a s d f g h j k = C D E F G A B C (upper), z x c v b n m = lower octave.
  const map = { z: 48, s: 49, x: 50, d: 51, c: 52, v: 53, g: 54, b: 55, h: 56, n: 57, j: 58, m: 59, q: 60, '2': 61, w: 62, '3': 63, e: 64, r: 65, '5': 66, t: 67, '6': 68, y: 69, '7': 70, u: 71, i: 72 };
  window.addEventListener('keydown', (e) => { if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return; if (map[e.key] !== undefined) noteOn(map[e.key], 100); if (e.key === ' ') { e.preventDefault(); seq.toggle(); } });
  window.addEventListener('keyup', (e) => { if (map[e.key] !== undefined) noteOff(map[e.key]); });
}

function act(a) {
  if (a === 'tempo+') seq.setTempo(seq.tempo + 2);
  if (a === 'tempo-') seq.setTempo(seq.tempo - 2);
  if (a.startsWith('tempo')) settings.tempo = seq.tempo;
  if (a === 'trans+') settings.transpose = Math.min(12, settings.transpose + 1);
  if (a === 'trans-') settings.transpose = Math.max(-12, settings.transpose - 1);
  if (a === 'split+') settings.split = Math.min(84, settings.split + 1);
  if (a === 'split-') settings.split = Math.max(36, settings.split - 1);
  persist();
  renderStatus();
  renderKeyboard();
}

function setChannelProgram(ch, key) {
  engine.setProgram(ch, Engine.parseKey(key));
  settings.programs[ch] = engine.programKey(ch);
  persist();
}

// ───────────────────────── registrations ─────────────────────────
function snapshot() {
  return { styleId: settings.styleId, tempo: seq.tempo, transpose: settings.transpose, split: settings.split, chordMode: settings.chordMode,
    lowerOn: settings.lowerOn, layer: settings.layer, programs: { ...settings.programs }, bus: { ...settings.bus }, mute: { ...settings.mute } };
}

function saveReg(i) {
  settings.regs[i] = snapshot();
  settings.activeReg = i;
  persist();
  renderRegs();
  toast(`${t(settings.lang, 'saved')} ${i + 1}`);
}

function loadReg(i) {
  const r = settings.regs[i];
  if (!r) return;
  Object.assign(settings, { transpose: r.transpose, split: r.split, chordMode: r.chordMode, lowerOn: r.lowerOn, layer: r.layer, programs: { ...r.programs }, bus: { ...r.bus }, mute: { ...r.mute } });
  settings.activeReg = i;
  selectStyle(r.styleId, { keepPrograms: true });
  seq.setTempo(r.tempo); settings.tempo = r.tempo;
  restorePrograms();
  seq.mute = settings.mute;
  for (const [k, v] of Object.entries(settings.bus)) (k === 'master' ? audio.setMaster(v) : audio.setBus(k, v));
  persist();
  renderAll();
  toast(`${t(settings.lang, 'loaded')} ${i + 1}`);
}

// ───────────────────────── imports ─────────────────────────
async function importSF2(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const buf = await file.arrayBuffer();
    engine.loadSF2(buf, file.name);
    await store.putFile('sf2', { name: file.name, buf });
    applyStyleVoices(currentStyle());
    persist();
    renderSettings(); renderVoices();
    toast(`${t(settings.lang, 'imported')}: ${engine.sf2.name}`);
  } catch (err) {
    toast(`${t(settings.lang, 'error')}: ${err.message}`, 5000);
  }
  e.target.value = '';
}

async function importStyles(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const pack = JSON.parse(await file.text());
    const list = Array.isArray(pack) ? pack : [pack];
    const problems = lintPack(list);
    if (problems.length) { toast(`${t(settings.lang, 'lintErrors')}: ${problems.slice(0, 3).join(' · ')}`, 7000); return; }
    importedPack = list;
    await store.putFile('styles', list);
    buildStyles();
    selectStyle(list[0].id);
    renderSettings();
    toast(`${t(settings.lang, 'imported')}: ${list.map((s) => s.name).join(', ')}`);
  } catch (err) {
    toast(`${t(settings.lang, 'error')}: ${err.message}`, 5000);
  }
  e.target.value = '';
}

// ───────────────────────── rendering ─────────────────────────
function applyLang() {
  const lang = settings.lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(lang, el.dataset.i18n); });
}

function renderAll() { renderStyles(); renderStatus(); renderTransport(); renderVoices(); renderRegs(); renderKeyboard(); }

function renderStyles() {
  const box = $('styleChips');
  box.innerHTML = '';
  for (const st of styles) {
    const b = document.createElement('button');
    b.className = 'btn' + (st.id === settings.styleId ? ' on' : '');
    b.innerHTML = `${settings.lang === 'ar' ? st.name_ar : st.name}<small>${st.tempo} · ${st.meter[0]}/${st.meter[1]}${st.imported ? ' ✎' : ''}</small>`;
    b.addEventListener('click', () => selectStyle(st.id));
    box.appendChild(b);
  }
  const on = box.querySelector('.btn.on');
  if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center' });
}

function noteLabel(n) { return NOTE_NAMES[n % 12] + (Math.floor(n / 12) - 1); }

function renderStatus() {
  $('tempoVal').textContent = seq.tempo;
  $('transVal').textContent = (settings.transpose > 0 ? '+' : '') + settings.transpose;
  $('splitVal').textContent = noteLabel(settings.split);
  $('chordVal').textContent = chordName(seq.chord);
}

function renderTransport() {
  const p = seq.playing ? seq.part : null;
  const set = (id, on, pending = false) => { const b = $(id); b.classList.toggle('on', !!on); b.classList.toggle('pending', !!pending); };
  set('introBtn', p === 'intro');
  set('mainABtn', seq.playing ? p === 'mainA' : seq.variation === 'A', seq.pendingVariation === 'A' && seq.variation !== 'A');
  set('mainBBtn', seq.playing ? p === 'mainB' : seq.variation === 'B', seq.pendingVariation === 'B' && seq.variation !== 'B');
  set('fillBtn', p === 'fillA' || p === 'fillB', seq.pending === 'fill');
  set('endingBtn', p === 'ending', seq.pending === 'ending');
  set('syncBtn', seq.syncArmed);
  const s = $('startBtn');
  s.classList.toggle('on', seq.playing);
  s.textContent = t(settings.lang, seq.playing ? 'stop' : 'start');
  if (!seq.playing) $('beat').querySelectorAll('i').forEach((i) => i.classList.remove('on'));
}

function fillSelect(sel, ch) {
  const forDrums = ch === 9 || ch === 10;
  sel.innerHTML = '';
  for (const p of engine.programList(forDrums)) {
    const o = document.createElement('option');
    o.value = p.kind === 'sf2' ? `sf2:${p.bank}:${p.program}` : `synth:${p.name}`;
    o.textContent = settings.lang === 'ar' ? p.label_ar : p.label;
    sel.appendChild(o);
  }
  sel.value = engine.programKey(ch);
}

function renderVoices() {
  fillSelect($('upperSel'), CH.upper);
  fillSelect($('lowerSel'), CH.lower);
  $('lowerOnBtn').classList.toggle('on', settings.lowerOn);
  $('layerBtn').classList.toggle('on', settings.layer);
  const cm = $('chordModeBtn');
  cm.classList.toggle('on', true);
  cm.textContent = t(settings.lang, settings.chordMode === 'single' ? 'single' : 'fingered');
}

function renderRegs() {
  $('regBtns').querySelectorAll('button').forEach((b, i) => {
    b.classList.toggle('filled', !!settings.regs[i]);
    b.classList.toggle('on', settings.activeReg === i);
  });
}

function renderMidi(list) {
  const btn = $('midiBtn');
  btn.classList.toggle('on', list.length > 0);
  $('midiLabel').textContent = list.length ? list.map((d) => d.name).join(', ') : t(settings.lang, midi.supported ? 'midiConnect' : 'midiNone');
  $('midiInfo').textContent = list.length ? list.map((d) => `${d.manufacturer} ${d.name}`.trim()).join(' · ') : (midi.supported ? t(settings.lang, 'midiNone') : t(settings.lang, 'midiUnsupported'));
}

function renderSettings() {
  $('sf2Info').textContent = engine.hasSF2 ? `${engine.sf2.name} — ${engine.sf2.presets.length} presets` : t(settings.lang, 'noSF2');
  $('sf2Remove').hidden = !engine.hasSF2;
  $('styleRemove').hidden = !importedPack;
  const pv = $('partVoices');
  pv.innerHTML = '';
  for (const role of ['bass', 'chord', 'pad', 'phrase', 'drums', 'perc']) {
    const label = document.createElement('label');
    label.textContent = t(settings.lang, TRACK_LABEL[role]);
    const sel = document.createElement('select');
    fillSelect(sel, CH[role]);
    sel.addEventListener('change', () => setChannelProgram(CH[role], sel.value));
    label.appendChild(sel);
    pv.appendChild(label);
  }
  const tm = $('trackMutes');
  tm.innerHTML = '';
  for (const trackName of Object.keys(currentStyle().tracks)) {
    const b = document.createElement('button');
    b.className = 'btn tog' + (settings.mute[trackName] ? '' : ' on');
    b.textContent = t(settings.lang, TRACK_LABEL[currentStyle().tracks[trackName].role] || trackName);
    b.addEventListener('click', () => { settings.mute[trackName] = !settings.mute[trackName]; seq.mute = settings.mute; persist(); renderSettings(); });
    tm.appendChild(b);
  }
  document.querySelectorAll('input[data-bus]').forEach((r) => { r.value = settings.bus[r.dataset.bus]; });
  $('latencyVal').textContent = audio.latencyMs();
  $('installBtn').hidden = !deferredInstall;
  renderMidi(midi.list());
}

// ───────────────────────── on-screen keyboard ─────────────────────────
const KB_LOW = 48, KB_HIGH = 72; // C3..C5
function buildKeyboard() {
  const kb = $('keyboard');
  kb.innerHTML = '';
  const whites = [];
  for (let n = KB_LOW; n <= KB_HIGH; n++) if (![1, 3, 6, 8, 10].includes(n % 12)) whites.push(n);
  const w = 100 / whites.length;
  for (const n of whites) {
    const k = document.createElement('div');
    k.className = 'key'; k.dataset.note = n; k.textContent = n % 12 === 0 ? noteLabel(n) : '';
    kb.appendChild(k);
  }
  for (let n = KB_LOW; n <= KB_HIGH; n++) {
    if (![1, 3, 6, 8, 10].includes(n % 12)) continue;
    const idx = whites.filter((x) => x < n).length;
    const k = document.createElement('div');
    k.className = 'key black'; k.dataset.note = n;
    k.style.left = `${idx * w - w * 0.3}%`; k.style.width = `${w * 0.6}%`;
    kb.appendChild(k);
  }
  const active = new Map(); // pointerId → note
  const keyAt = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.classList.contains('key') ? +el.dataset.note : null; };
  kb.addEventListener('pointerdown', (e) => { const n = keyAt(e.clientX, e.clientY); if (n === null) return; e.preventDefault(); active.set(e.pointerId, n); noteOn(n, 100); });
  kb.addEventListener('pointermove', (e) => {
    if (!active.has(e.pointerId)) return;
    const n = keyAt(e.clientX, e.clientY);
    const prev = active.get(e.pointerId);
    if (n !== null && n !== prev) { noteOff(prev); active.set(e.pointerId, n); noteOn(n, 100); }
  });
  const end = (e) => { if (!active.has(e.pointerId)) return; noteOff(active.get(e.pointerId)); active.delete(e.pointerId); };
  kb.addEventListener('pointerup', end);
  kb.addEventListener('pointercancel', end);
  kb.addEventListener('pointerleave', end);
}

function renderKeyboard() {
  const kb = $('keyboard');
  kb.classList.toggle('hidden', !settings.keysShown);
  $('keysToggle').textContent = t(settings.lang, settings.keysShown ? 'hideKeys' : 'showKeys');
  kb.querySelectorAll('.key').forEach((k) => {
    const n = +k.dataset.note;
    k.classList.toggle('lower', n < settings.split);
    k.classList.toggle('split', n === settings.split);
  });
}

function renderKey(note, on) {
  const k = $('keyboard').querySelector(`.key[data-note="${note}"]`);
  if (k) k.classList.toggle('on', on);
}

function beatLoop() {
  if (seq && seq.playing) {
    const pos = seq.position();
    const bpb = seq.style.beatsPerBar;
    const leds = $('beat').querySelectorAll('i');
    leds.forEach((led, i) => {
      const on = i < bpb && i === pos.beat && pos.frac < 0.5;
      led.classList.toggle('on', on);
      led.classList.toggle('one', i === 0);
    });
  }
  requestAnimationFrame(beatLoop);
}

// ───────────────────────── misc ─────────────────────────
let toastTimer = null;
function toast(msg, ms = 2500) {
  const el = $('toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, ms);
}

function persist() { store.saveSettings(settings); }

boot();
