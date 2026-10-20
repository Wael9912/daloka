# Sudanese rhythm and sound content

The code is done when the YM928 plays Sudanese sounds over Sudanese rhythms. What makes the app Sudanese is the content, and that is the biggest non-code task. Everything here is CC BY-SA 4.0 and listed in `CREDITS.md`.

## Styles (built in, drafts)

| Style | Character | Tempo | Tracks | Status |
| --- | --- | --- | --- | --- |
| Tum Tum | Lively dance, deep kick, 3-3-2 pulse | 138 | drums, perc, bass, chord, lead riff | draft, needs an ear check |
| Daloka | Women's wedding drum, dum/tak | 118 | daloka, claps, bass, chord | draft |
| Sayra | Groom's procession, march, brass stabs | 104 | drums, perc, bass, brass chord | draft |
| Haqiba | Classic Omdurman song, riq + claps | 92 | light perc, bass, strings pad, oud arpeggio | draft |
| Mardoum | Kordofan / Darfur dance, tabl 3-3-2 | 150 | tabl, kick, bass, accordion chord | draft |

Workflow per style (from the plan):

1. Pick 2 to 3 reference recordings; note the tempo and the accent pattern.
2. Edit the grid in the exported pack (⚙ → *Export built-in styles*, or `js/styles.js`). Patterns are written over C major.
3. Import the pack, play along with the recording, correct the feel. `node tools/style_lint.mjs pack.json` catches format errors.
4. When a style is right, copy it back into `js/styles.js` so it ships built in.

Swing and humanize per part are not in v1 of the browser app; the grid is straight 16ths. Add them to `styledsl.js` (a per-track `swing` and `humanize` field) when the first style is good enough to need them.

## Sound bank `daloka-sudan.sf2`

Built on the desktop with [Polyphone](https://www.polyphone-soundfonts.com/) (GPL-3) from WAV samples, then imported in the app (⚙ → *Import SF2*).

- **Percussion kit** (bank 128, program 0), mapped to the notes `js/styledsl.js` uses: 36 tum-tum kick, 38 daloka dum, 40 daloka tak, 41 tabl low, 48 tabl high, 39 clap, 42 shaker, 46 open shaker, 37 tik, 56 bell, 49 crash, 45 tom.
- **Melodic** (bank 0): 24 oud, 105 tambour/rababa, 21 accordion, 65 alto sax, 48 violin section, 81 Sudanese synth lead, 33 bass, 0 piano, 16 organ, 61 brass. These are the GM programs the app prefers for each style voice, so a bank with these numbers needs no configuration.

Sample sources: own recordings first (best), CC0/CC-BY libraries, musicians through Zain Record. Until a Sudanese bank exists, the free GeneralUser GS bank gives decent Western instruments and a GM kit.
