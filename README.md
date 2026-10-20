# Daloka — Sudanese arranger keyboard in the browser

**دلوكة** turns a USB-MIDI keyboard (first target: the YM928) plugged into an Android phone into a Sudanese and Western arranger keyboard. It is a plain web app: no install step, no app store, no build tools, no dependencies. It works offline once opened, and can be installed to the home screen as a PWA.

- **Sound module:** a built-in synth (oud, tambour, accordion, sax, strings, brass, piano, organ, bass, lead, flute) and a Sudanese percussion kit; import any `.sf2` sound bank for real sampled instruments.
- **Arranger:** the left hand (below the split point) plays chords; drums, percussion, bass, chord and pad parts follow them.
- **Sudanese styles:** Tum Tum, Daloka, Sayra, Haqiba, Mardoum. **Western:** Pop, Rock, Ballad, Reggae, 6/8. Each has intro, main A/B, fill A/B, ending.
- **Live controls:** start/stop, sync start, fill, variation, tempo, transpose, split point, eight saved setups.
- **Open content:** import your own `.sf2` banks and style packs (`.json`); export the built-in styles to edit them.
- **Arabic (RTL) and English.**

## Use it on Android

Web MIDI and the install prompt need a secure page (HTTPS, or `localhost`). Three ways:

1. **Hosted (easiest):** open the GitHub Pages URL of this repo in **Chrome**, tap ⋮ → *Add to Home screen*. Plug the keyboard in with a USB OTG cable, open the app, tap **Connect keyboard**.
2. **From your Mac on the same Wi-Fi, over HTTPS:** run `./serve.sh https` (needs `mkcert` once), then open `https://<mac-ip>:8443` on the phone and accept the certificate.
3. **USB cable + adb:** `adb reverse tcp:8787 tcp:8787`, then `./serve.sh` on the Mac and open `http://localhost:8787` on the phone (localhost counts as secure).

Without a keyboard the on-screen keys work everywhere (touch, multi-finger). On a computer, `a s d f g h j k` play the upper octave, `z x c v b n m` the lower, space = start/stop.

## Playing

| Zone | What it does |
| --- | --- |
| Left of the split (default F#3) | Chord zone. Fingered: play the chord. One finger: root = major, root + white key below = 7th, root + black key below = minor. |
| Right of the split | Upper voice (+ Layer adds the lower voice on top). |
| **SYNC START** | The style starts on the next chord you play. |
| **FILL** | Plays the fill of the current variation on the next bar, then returns. |
| **MAIN A / B** | Switches variation through a fill. |
| **ENDING** | Plays the ending on the next bar and stops. |
| Setups 1–8 | Tap to load, hold to save the whole setup (style, tempo, voices, split, mixer). |

## Sound banks

The app ships with a synth so it plays out of the box. For sampled instruments, open ⚙ → *Import SF2 sound bank* and pick any SoundFont 2 file (for example the free GeneralUser GS). It is stored in the browser (IndexedDB) and loaded on every start. Style voices then prefer the GM programs of the bank (oud → 24 nylon guitar, tambour → 105 banjo, accordion → 21, strings → 48, brass → 61, sax → 65, bass → 33, drums → bank 128).

A Sudanese bank `daloka-sudan.sf2` (daloka, tabl, tum-tum, claps, oud, tambour, Sudanese lead) is the main non-code task; see `docs/CONTENT.md`.

## Style packs

A style pack is a JSON array of styles. Export the built-in pack from ⚙ → *Export built-in styles*, edit it, and import it back; an imported style with the same `id` replaces the built-in one. The format is documented at the top of `js/styledsl.js`: one text grid per track, written over C major. Example of a drum track and a bass track for one bar of 4/4 (16 steps):

```json
"mainA": {
  "bars": 1,
  "drums": { "K": "x..x..x.x..x..x.", "C": "....x.......x...", "S": "x.x.x.x.x.x.x.x." },
  "bass":  "C2 . . C2 . . G2 . C2 . . C2 . . G2 ."
}
```

Drum letters: `K` kick, `D` dum, `T` tak, `L` tabl low, `H` tabl high, `C` clap, `S` shaker, `O` open hat, `R` rim, `B` bell, `Z` crash, `M` tom. `x` hit, `X` accent, `o` soft. Pitched tokens: `C2`, `C3+E3+G3` (chord), `C2:4` (4 steps long), `.` rest, `-` tie, `!` accent, `?` soft.

Validate a pack from the command line:

```
node tools/style_lint.mjs my-pack.json
```

## Develop

```
./serve.sh            # http://localhost:8787
node tests/run.mjs    # engine tests: chord detection ×12 keys, DSL, sequencer, 10,000-bar drift
```

Files: `index.html`, `css/app.css`, `js/` (`app.js` UI · `engine.js` routing · `synth.js` built-in sounds · `sf2.js` SoundFont loader · `sequencer.js` · `chord.js` · `styledsl.js` · `styles.js` · `midi.js` · `audio.js` · `store.js` · `i18n.js`), `sw.js` + `manifest.webmanifest` (PWA).

Latency: Chrome on Android with `latencyHint: 'interactive'` gives roughly 20–40 ms key-to-sound on a mid-range phone, worse on cheap phones. A native app (the original plan, `docs/PLAN.md`) is the path to under 20 ms if that ever matters more than zero-install.

## License

Code: GPL-3.0. Styles and sounds: CC BY-SA 4.0. Every bundled sample must have an entry in `CREDITS.md`.
