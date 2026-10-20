# Changelog

## 0.3.1 — 2026-10-20
- The style picker accepts `.set` / `.mid` too and sniffs the real format: a Yamaha file under any name imports; an ORG 24 or Korg file is named as such in the error instead of a generic failure.

## 0.3.0 — 2026-10-20
- **Yamaha style import** (`js/sty.js`): any PSR / Tyros / Genos style file (.sty, .prs, .sst; SFF1 and SFF2) plays as a Daloka style — SMF0 sections by marker (Intro, Main A/B, Fill In AA/BB, Ending; Main C/D + Fill CC/DD become a second "(C/D)" style), CASM Ctab for the source chord and the transposition table, GM program changes on the part channels (chord 2 / phrase 2 on channels 6 / 7). Settings → *Import Yamaha styles*; files persist in IndexedDB; a "Yamaha styles" group on the main screen.
- ORG 24 (Sofeh) `.Set` files were examined and are a closed format (own binary, rhythms in a private block, no MIDI inside); they are not supported. Details in `docs/CONTENT.md`.
- Fix: the self-update reload from 0.2.1 also fired on a first visit; it now only reloads when an older worker was in control.

## 0.2.1 — 2026-10-20
- Updates reach the phone: a new build reloads the page once as soon as its service worker takes over, and the install fetch bypasses the HTTP cache; the version is shown on the start screen.

## 0.2.0 — 2026-10-20
- Sudanese set rebuilt from published descriptions (`docs/CONTENT.md` lists the sources): Tum Tum as the triple 6/8 with the «dum tak dum, two on the mambo» figure and claps in 3 against 2; Daloka · Sayra 4/4; Mardoum fast 6/8; Jarari slow 6/8; Karachi 2/4 starting on tak; Dalib with the tambour; Haqiba with the riq. Western: Pop, Rock, Ballad, Reggae, Slow 6/8.
- Drum map moved to GM numbers with the three bangaz (dum 63, tak 60, mambo 64), kashkoush 70, shatam 76, riq 54; a GM SoundFont now plays the right family of sound; the built-in kit synthesises the same numbers.
- Simpler screen: rhythms grouped Sudanese / Western, one big START, INTRO · A · B · FILL · END, tempo shown as ♩. for 6/8, right-hand sound and chord up front, everything else under "More"; a one-line hint under the keys; a first-run toast.
- Install: an **Install app** button in the top bar (uses the browser prompt, or shows the Chrome steps); manifest `id` / `display_override`.
- Screen stays on while the app is open (Wake Lock, toggle in Settings); audio, MIDI and wake lock re-arm on return to the app.
- Stability: the sequencer timer runs in a Worker (immune to tab-timer throttling), look-ahead 200 ms, 28-voice cap.
- Key feel: native sample rate (no resampler on Android), faster attacks on strings / sax / brass / accordion / flute, a gentler velocity curve, on-screen keys looked up from a map.

## 0.1.0 — 2026-10-20
- First build as a browser app (PWA): Web MIDI input, on-screen keys, built-in synth + Sudanese percussion kit, SF2 import, sequencer with intro / main A-B / fill A-B / ending / sync start, chord-following bass/chord/pad/phrase, 10 styles (Tum Tum, Daloka, Sayra, Haqiba, Mardoum, Pop, Rock, Ballad, Reggae, 6/8), 8 setups, Arabic/English, offline cache.
