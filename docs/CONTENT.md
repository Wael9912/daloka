# Sudanese rhythm and sound content

The code is done when the YM928 plays Sudanese sounds over Sudanese rhythms. What makes the app Sudanese is the content. Everything here is CC BY-SA 4.0 and listed in `CREDITS.md`.

## The Sudanese set (0.2.0) and what it is built on

Version 0.1.0 wrote every Sudanese style in 4/4 with a 3-3-2 kick, which is why none of it sounded Sudanese. 0.2.0 rebuilt the set from published descriptions. What the sources establish, and what the grid does with it:

| Style | Metre | Tempo | What the sources say | How the grid plays it |
| --- | --- | --- | --- | --- |
| **تم تم Tum Tum** | 6/8 | ♩. 104 | A *triple* rhythm ("3 beats on the daluka"), fast, girls'/women's wedding songs from Kosti in the 1930s; built on a 3:2 cross-rhythm. On the bangaz the figure is «دم – تك – دم ثم ضربتان على المامبو». | dum on eighths 1 and 3, tak on 2, two mambo strokes on 4–5; claps on every quarter (three a bar, the 3 against the drum's 2); shaker on eighths; bass on the dum and mambo; chord on the off-eighths. |
| **دلوكة · سيرة Daloka / Sayra** | 4/4 | 104 | "The Sayra rhythm, also called the Daloka or Ardha rhythm, is found across all of Sudan"; musicians write it in 4/4 (Kabli «الجنزير في النجومي», Hamad El Rayah «عجبوني الليلة جو»). The daloka's base pattern is compound; the shatam (thin sticks) and claps sit on top. | dum on 1 and the "and" of 3, taks on 2 / 2-and / 4, mambo on 1 and 3, claps on 2 and 4, shatam on the off-beats. |
| **مردوم Mardoum** | 6/8 | ♩. 112 | Baggara (Misiriya, Hawazma, Kinana) of Kordofan; "the 6/8 rhythmic pattern" Abdel Gadir Salim brought into the modern song («اللوري حل بي»); fast and strong, foot-stomping; kept by feet, kashkoush shakers, whistles and the kirir, with claps; compared to flamenco (a hemiola). | stomp (kick) on the dotted-quarters, nugara low on 1 / 4 / 5-and, nugara high on the off-eighths, kashkoush on the 12-pulse bell pattern, claps on the quarters (3 against 2). |
| **جراري Jarari** | 6/8 | ♩. 76 | Abbala camel-herders (Kababish, Kawahla, Dar Hamid) of north Kordofan and north Darfur; "slow, light", drawn from the camel's gait; originally voice, feet and claps, no instruments. | the Mardoum family slowed down and softened: dum on the dotted-quarters, soft taks, claps on 1 and 4, long bass and strings. |
| **كراتشي Karachi** | 2/4 | 126 | A 2/4 rhythm that, unlike most, *starts on tak*: «تك – تك – دم –»; slow it is heavy, fast it is cheerful; Kamal Tarbas brought it into Sudanese song («طبيعة الدنيا»). | tak on 1 and 1-and, dum (with the mambo) on 2, rest; claps on 2. |
| **دليب Dalib** | 4/4 | 96 | Northern Sudan, Shaiqiya and Bedayriya; sung with the tambour, chorus and daloka (Wardi «بنحب من بلدنا»). | moderate daloka 4/4 with a pentatonic tambour ostinato as the phrase track. |
| **حقيبة Haqiba** | 4/4 | 88 | Omdurman song of the 1920s–40s: singer, riq, claps and the shayyalin chorus. | riq on eighths (accent on 1 and 3), claps on 2 and 4, soft daloka, oud arpeggio, strings. |

Tempo for the 6/8 styles is shown as the dotted-quarter value (♩.) the way a Yamaha/Korg player reads it; the sequencer keeps quarter BPM inside.

**Still a draft, and why:** the sources give metre, feel, instruments and the bangaz syllables, but no stroke-by-stroke transcription of any of these. The grids are a faithful reading of the descriptions plus the usual Sudanese keyboard practice (bangaz + claps + shaker under accordion/oud stabs). They need the owner's ear against recordings; the workflow below is unchanged.

Sources consulted (2026-10-20):
- Arabic Wikipedia, [موسيقى سودانية](https://ar.wikipedia.org/wiki/موسيقى_سودانية) (Sayra = Daloka = Ardha in 4/4; Mardoum 6/8 via Abdel Gadir Salim; Karachi via Kamal Tarbas; Dalib + tambour; the regional instrument list; "over 60 rhythms")
- Arabic Wikipedia, [إيقاع التم تم](https://ar.wikipedia.org/wiki/إيقاع_التم_تم) (the «دم – تك – دم ثم ضربتان على المامبو» figure; Kosti, 1930s; fast)
- Arabic Wikipedia, [إيقاع كراتشي](https://ar.wikipedia.org/wiki/إيقاع_كراتشي) (2/4, starts on tak: «تك – تك – دم»)
- Arab Music Magazine, [الموسيقى السودانية.. التمتم والجراري والمردوم](https://www.arabmusicmagazine.com/item/803-2020-10-13-14-06-07) (Tum Tum fast like cattle, Jarari calm like camels, Mardoum/flamenco, Dalib)
- Al-Rakoba / Sudanile, [ومضات عن الأغنية الكردفانية (7)](https://www.alrakoba.net/31721574/) (Mardoum kept by feet, kashkoush, whistles, kirir; faster and stronger than Jarari; Abbala vs Baggara)
- Wikipedia, [Music of Sudan](https://en.wikipedia.org/wiki/Music_of_Sudan) and [Rhythm in Sub-Saharan Africa](https://en.wikipedia.org/wiki/Rhythm_in_Sub-Saharan_Africa) (Tum Tum as a 3:2 cross-rhythm; pentatonic scales)
- ISS blog, [Revolution and music: women singing out in Sudan](https://issblog.nl/2019/08/12/creative-development-revolution-and-music-women-singing-out-in-sudan-by-azza-ahmed-a-aziz-and-katarzyna-grabska/) ("3 beats on the daluka … known as the tumtum")
- The Sudanist, [The Genres of Sudanese Music](https://thesudanist.com/the-genres-of-sudanese-music/) (daluka, tar, shatam, dinger; aghani al-banat)
- EMI Music blog, [ألحان سودانية قديمة في ثوب حديث](https://emimusic.ph/blog/) (modern production tempos: Tum Tum ≈ 96–102, Daloka ≈ 80–88, Mardoum ≈ 85–92; 2/4 and 6/8 with syncopation)

## Keyboard sets from elsewhere (0.3.0)

The owner asked for the ORG 24 "Sudanese sets" (`.Set` files for Sofeh Sunrise's ORG 2024 Android app). Examined 2026-10-20 on a free set from sofeh.com (`fyp2 REZA 99 OFFICIAL.Set`, 204 MB): the file starts with the string «Music Studio music», holds its samples as MP3 frames and raw PCM, and its rhythms in a private block near the end (names like Variation / Intro / Fill / Ending, no MIDI chunks at all). Sofeh's forum confirms the format is only readable by their Music Studio (Windows) and ORG 24; Korg Pa `.STY` is equally closed (OC31-compressed blocks). Korg stays closed. **ORG 24 is now READ (0.4.0)** — the owner's own `Motaso.Set` made it possible. The layout, as reverse-engineered (little-endian throughout):

- Header `Music Studio Music` …, then the version as `\r1.2.8\r`. Every object is tagged `int32 len | "Name\r<version>\r"`.
- **Instruments** come first, tagged by name. After a header of varying length, a chain of **samples**: `u8 root | 32-byte name (0x20 + text) | u16 rate | u8 16 | u8 channels | u32 rate | u32 0 | u32 frames | u32 0 | u32 volume | 2×u32 0 | u32 cents | u32 loop (2 = on) | u32 loopStart | u32 loopEnd | 4×u32 0 | int16 PCM`. A multisample is played by the sample with the nearest root.
- `Normal`, `Master`, `Up 1–3`, `Low` are keyboard setups.
- **Rhythm**: eight 2508-byte track records (`Wave`, `Bass`, `Acc. 1–5`, `Drum`; byte 153 hints at the instrument), then **patterns** tagged with the track name (`Percussion` included): a 535-byte header (`u32 partId`, `u16 1`, `u16 track type 8–15`, …, `u32 row count` at 527) followed by **note rows** of 24 bytes `i32 kind (2 on / 1 off) | u32 id | i32 note | i32 velocity | i32 time | i32 duration`, 1000 ticks per bar.
- A **part table** near the end: `u32 partId | u32 owner | 32-byte name ("Variation 1", "Intro 1", "Fill 1", …) | u8 type | 3 flags | u32 0 | u32 length in ticks | u32 link`.
- Not decoded: tempo (not found), the Wave loop track, the rhythm's own percussion sound table (123 untagged objects), envelopes.

What is open enough: the **Yamaha style format** (SFF1/SFF2, documented by jososoft.dk), which Sudanese keyboardists trade as `.sty` files for the PSR-3000 / S970 / A3000 ("ايقاعات سودانية ياماها", the Yamahas Sudanese Musicians group, the sudaneseonline rhythm threads). `js/sty.js` imports them: sections by marker, CASM Ctab per channel (source chord root/type, NTR, NTT), program changes. Limits of v1: Note Limits / High Key / retrigger rules are ignored, every non-bypass NTT becomes Daloka's chord re-map, and XG drum notes above the GM kit (e.g. 77, 68, 30) fall to a generic membrane in the built-in kit — a GM SoundFont plays them properly.

## Workflow per style (unchanged)

1. Pick 2 to 3 reference recordings; note the tempo and the accent pattern.
2. Edit the grid in the exported pack (⚙ → *Export built-in styles*, or `js/styles.js`). Patterns are written over C major. Drum letters: `D` dum, `T` tak, `M` mambo, `K` kick, `A` snare, `L`/`H` nugara low/high, `C` clap, `J` shaker, `W` shatam, `R` riq, `S` hat, `O` open hat, `B` bell, `Z` crash, `N` tom.
3. Import the pack, play along with the recording, correct the feel. `node tools/style_lint.mjs pack.json` catches format errors.
4. When a style is right, copy it back into `js/styles.js` so it ships built in.

Swing and humanize per part are not in the browser app yet; the grid is straight 16ths.

## Sound bank `daloka-sudan.sf2`

Built on the desktop with [Polyphone](https://www.polyphone-soundfonts.com/) (GPL-3) from WAV samples, then imported in the app (⚙ → *Import SF2*).

- **Percussion kit** (bank 128, program 0) on the GM numbers the grids use, so a plain GM bank already plays the right family of sound: 63 daloka/bangaz dum (GM open high conga), 60 tak (high bongo), 64 mambo (low conga), 36 kick, 38 snare, 41/48 nugara low/high (toms), 39 clap, 70 kashkoush (maracas), 76 shatam (wood block), 54 riq (tambourine), 42/46 hats, 56 bell, 49 crash, 45 tom.
- **Melodic** (bank 0): 24 oud, 105 tambour/rababa, 21 accordion, 65 alto sax, 48 violin section, 81 Sudanese synth lead, 33 bass, 0 piano, 16 organ, 61 brass, 73 flute. These are the GM programs the app prefers for each style voice, so a bank with these numbers needs no configuration.

Sample sources: own recordings first (best), CC0/CC-BY libraries, musicians through Zain Record. Until a Sudanese bank exists, the free GeneralUser GS bank gives decent Western instruments and a GM kit whose congas/bongos stand in for the bangaz.
