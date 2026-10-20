// Routes every channel to the built-in synth or the loaded SF2, by program.
// program: { kind: 'synth', name } | { kind: 'sf2', bank, program }

import { Synth, SYNTH_PRESETS } from './synth.js';
import { SF2Player } from './sf2.js';
import { OrgSampler } from './orgsampler.js';

export const CH = { upper: 0, lower: 1, bass: 2, chord: 3, pad: 4, phrase: 5, drums: 9, perc: 10 };

export class Engine {
  constructor(audio) {
    this.audio = audio;
    this.synth = new Synth(audio.ctx, audio.routeFor);
    this.sf2 = new SF2Player(audio.ctx, audio.routeFor);
    this.org = new OrgSampler(audio.ctx, audio.routeFor);
    this.programs = {};
    for (const ch of Object.values(CH)) this.setProgram(ch, { kind: 'synth', name: ch === 9 || ch === 10 ? 'kit' : 'lead' });
  }

  get hasSF2() { return !!this.sf2.font; }

  loadSF2(arrayBuffer, name) { return this.sf2.load(arrayBuffer, name); }
  get hasOrg() { return this.org.loaded; }
  loadOrg(parsed, bytes, name) { this.org.load(parsed, bytes, name); }

  /** All selectable programs: built-in presets first, then the SF2 presets. */
  programList(forDrums = false) {
    const out = [];
    if (forDrums) out.push({ kind: 'synth', name: 'kit', label: 'Built-in kit', label_ar: 'الطقم المدمج' });
    else for (const [name, p] of Object.entries(SYNTH_PRESETS)) out.push({ kind: 'synth', name, label: p.label, label_ar: p.label_ar });
    if (this.org.loaded) {
      for (const inst of this.org.instruments) {
        if (forDrums !== !!inst.isKit) continue;
        out.push({ kind: 'org', index: inst.index, label: `${inst.name} (set)`, label_ar: `${inst.name} (سيت)` });
      }
    }
    if (this.sf2.font) {
      for (const p of this.sf2.presets) {
        if (forDrums ? p.bank !== 128 : p.bank === 128) continue;
        out.push({ kind: 'sf2', bank: p.bank, program: p.program, label: `${p.name} (${p.bank}:${p.program})`, label_ar: `${p.name} (${p.bank}:${p.program})` });
      }
    }
    return out;
  }

  setProgram(ch, prog) {
    if (prog.kind === 'org') {
      if (!this.org.loaded || !this.org.instruments[prog.index]) return false;
      this.org.setProgram(ch, prog.index);
    } else if (prog.kind === 'sf2') {
      const idx = this.sf2.findPreset(prog.bank, prog.program);
      if (idx < 0) return false;
      this.sf2.setProgram(ch, idx);
    } else {
      this.synth.setProgram(ch, prog.name);
    }
    this.programs[ch] = prog;
    return true;
  }

  programKey(ch) {
    const p = this.programs[ch];
    return p ? (p.kind === 'sf2' ? `sf2:${p.bank}:${p.program}` : p.kind === 'org' ? `org:${p.index}` : `synth:${p.name}`) : 'synth:lead';
  }

  static parseKey(key) {
    const parts = key.split(':');
    if (parts[0] === 'sf2') return { kind: 'sf2', bank: +parts[1], program: +parts[2] };
    if (parts[0] === 'org') return { kind: 'org', index: +parts[1] };
    return { kind: 'synth', name: parts[1] };
  }

  _inst(ch) { const k = this.programs[ch] && this.programs[ch].kind; return k === 'sf2' ? this.sf2 : k === 'org' ? this.org : this.synth; }

  noteOn(ch, n, v, t, d = null) { if (n >= 0 && n <= 127) this._inst(ch).noteOn(ch, n, v, t, d); }
  noteOff(ch, n, t) { this._inst(ch).noteOff(ch, n, t); }
  setSustain(ch, on) { this.synth.setSustain(ch, on); this.sf2.setSustain(ch, on); this.org.setSustain(ch, on); }
  setBend(ch, semis) { this.synth.setBend(ch, semis); this.sf2.setBend(ch, semis); this.org.setBend(ch, semis); }
  allOff(ch = null) { this.synth.allOff(ch); this.sf2.allOff(ch); this.org.allOff(ch); }
}
