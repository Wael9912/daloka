# Changelog

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
