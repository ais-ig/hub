# Task 6 · Visual critique of the Arabic mode

Reviewed 30 September 2026 on branch `arabic` at `e8e2b5f`. Read-only: nothing in
`index.html` or `tools/` was changed. Every capture used a real
`Emulation.setDeviceMetricsOverride` (a copy of `tools/shot.mjs`, adapted), after
`document.fonts.ready` and an explicit `document.fonts.load` of Cairo and Poppins
in all four weights.

Scratch folder, referred to below as `$S`:
`/private/tmp/claude-501/-Users-mohamaddabbagh-Cooking-Rowad-meet---greet-26/022d75e1-1b96-4efc-9934-925c1b7be974/scratchpad/visual`

## 1. Verdict

The Arabic page is in good shape and nothing is broken. It is genuinely mirrored,
set in Cairo (confirmed per node with `CSS.getPlatformFontsForNode`, no system
fallback apart from the emoji), letters join everywhere, no letter-spacing
survives, and nothing overflows at 320, 380, 800 or 1100px. Numerals, `2026/27`,
`A*`, times, phone numbers, emails and the emblem all keep their own order.

Two things are wrong and should be fixed before it goes out: the contact cards
put their icons on different sides from one line to the next, and the parent
guide PDF is English but carries no `بالإنجليزية` tag. Four more are rough
(mentor list, bracketed English subject names, the top bar at 320px, 10px Arabic
labels). The rest are nits, several of which exist in English too.

The English page at 380px is pixel-identical to `main` apart from the language
button.

## 2. Findings

Worst first. "Tried" means the fix was injected in the browser only (never
written to the repo) and the result captured in `$S/img/fixtest-*.png`.

| id | severity | where | what you see | what it should be | suggested fix |
|---|---|---|---|---|---|
| V1 | wrong | `#contacts`, `.ccard a`, every width. `ar380-22.png`, `ar380-23.png`, `ar800-17.png` | The envelope sits to the LEFT of each email, in the middle of the card, at a different x on every card (182 to 266px at 380). The phone icon sits at the RIGHT edge (331 to 347px) when the line has `تحويلة`, and on the left again on the one line with no extension (Mr. Mohamed Noor). Cause: `unicode-bidi: plaintext` on `a[href^="tel:"], a[href^="mailto:"]` makes each block link take its direction from its first strong letter, so Latin-only lines become left-to-right lines that are then right-aligned. | Both icons at the right edge of the card, one above the other, as they line up on the left in English. | Stop the contact links being plaintext: add `html[dir="rtl"] .ccard a { unicode-bidi: normal; }` after the plaintext rule (line 1218). Emails then stay intact on their own (only `.` and `@` between Latin letters). The one phone line with no extension and no `<span dir="ltr">` (Mr. Mohamed Noor, `050 855 1006`) then needs the span in the markup, or its three groups reverse. Tried: `fixtest-contacts-01.png`, all icons at the right edge, numbers intact. |
| V2 | wrong | `#materials` Start here card (line 1502) and `#s8` row (line 2155), `assets/meet-and-greet-parent-guide-boys-2026-27.pdf` | No `بالإنجليزية` tag, on a card whose Arabic title is `دليل أولياء الأمور`. `pdftotext` finds 4,831 Latin letters and 0 Arabic in the file. Every other English PDF has the tag. | Tagged like the others. | Add `data-pdf-en` to both links. (The two untagged links that are right to be untagged: the commitment form, which has Arabic text in it, and the Semester 1 letter, described as bilingual. The eleven class pills are untagged too; see V12.) |
| V3 | rough | `#mentors`, `ul.ticks[data-i18n-skip] li`, all widths. `ar380-12.png`, `ar380-13.png` | The class label (`9A`, `10B`) floats mid-line at a different x on every row (144 to 221px), because `9A Mr. Name` is one Latin run. A parent scanning for the class cannot run an eye down a column. On rows that wrap, a lone `·` hangs at the left of the first line. | Class label first, at the right edge, in a column, as it is at the left in English. | `html[dir="rtl"] ul.ticks[data-i18n-skip] li > b { unicode-bidi: isolate; }`. Tried: `fixtest-mentors-01.png`, every label's right edge lands at x=310. The hanging `·` on wrapped rows remains; it exists in English too. |
| V4 | rough | `#s3`, `table.data td.s`, the choice pairs and the Grade 10 option cards, 380px. `ar380-06.png`, `ar380-07.png`, `ar380-tab10-02.png` | When the English name in brackets wraps, the brackets look inside out to anyone reading the English: `Islamic)` then `(Studies`; `Cambridge)` then `(Mathematics`; `Maths)` then `(Cambridge`; `Social)` then `(Studies, KSAH`; `Business)` then `(Studies`. Correct by the bidi rules, but it reads as a mistake. Fine at 800px and up, where nothing wraps. | `(Islamic` then `Studies)`. | In the Arabic strings wrap the bracketed English: `الدراسات الإسلامية <span dir="ltr">(Islamic Studies)</span>`. The checker ignores `<span dir="ltr">`. Applies to every `subj.*` and `s3.g9.*` / `s3.g10.*` string with two or more English words. Tried: `fixtest-s3-01.png`, `fixtest-g10-01.png`. |
| V5 | rough | Top bar, `.brand`, 320px, BOTH languages. `ar320-top.png`, `en320-top.png`, `main320-top.png` | With the language button in the bar the brand no longer fits on one line at 320px. Arabic: `بوابة أولياء` / `الأمور` / `القسم البريطاني`, three lines, 46px tall in a 56px bar. English: `AIS Parent` / `Hub` / `BRITISH SECTION`. On `main` at 320px the English brand is one line (29px). Nothing overflows and nothing is clipped; it is cramped. At 380px both fit on one line. | One title line plus the small line. | `@media (max-width: 350px) { .brand small { display: none; } .langbtn { padding: 0 8px; } }`, or drop the brand to 13px under 350px. This is the one place the English page changed beyond the button itself, and only below 380px. |
| V6 | rough | Small labels in Arabic: `table.data thead th` (10px), `.pair .lb` (`اختاروا واحدة`, 10px), the `بالإنجليزية` tag (10px), `.ccard .cs` (11px), group headings such as `نماذج اختيار المواد` | These were 10px UPPERCASE tracked Latin, which reads larger than its size. `text-transform` does nothing to Arabic and tracking is off, so the same rule now gives 10px bold Arabic, the smallest text on the page and hard to read on a phone. Letters are joined and correct. | About 12px in Arabic. | `html[dir="rtl"] table.data thead th, html[dir="rtl"] .pair .lb { font-size: 12px; }` and `font-size: 11px` on the tag. Recheck the three-column tables at 380px afterwards: `الربع الثاني` is `nowrap`. |
| V7 | nit | `#results`, stat captions. `ar380-04.png` | The big figures read `58.4%` with the sign on the right; the caption under the fourth card reads `%100`, sign on the left (the Arabic convention). Same in `#s5`: `%60`. Both are legitimate; side by side they look inconsistent. | One convention. | Wrap in the strings: `<span dir="ltr">100%</span>`, `<span dir="ltr">60%</span>`. |
| V8 | nit | Update strip and `#changelog` links. `ar380-02.png`, `ar800-15.png` | The link breaks across lines: `عرض` at the end of one line, `الجداول الدراسية ←` on the next; at 800px an arrow sits alone on its own line (`تحديث رواد الفصول`). | Link and arrow together. | `html[dir="rtl"] .uitem a, html[dir="rtl"] .bitem a { white-space: nowrap; }`, or join label and arrow with a no-break space where line 3125 builds them. English wraps the same way. |
| V9 | nit, both languages | `.strip` summary pill in `#s3`. `ar380-06.png`, `sbs-06.png` | `border-radius: 999px` on six lines of text: the gold `باختصار` sits about 3px from the curved corner. English is worse (`In short` touches the curve). | A rounded box once the text runs past two lines. | `border-radius: 18px` on `.strip`, or only on the long one. Changes English too, so it is the owner's call. |
| V10 | nit, both languages | `table.data`, second and third columns, clearest at 800px. `ar800-12.png`, `en800-13.png` | Headers are start-aligned and `td.num` is end-aligned, so in the phone table `مدة حجز الهاتف` sits about 300px from `24 ساعة`. English has the same gap mirrored. | Header over its values. | Arabic only: `html[dir="rtl"] table.data thead th:not(:first-child) { text-align: left; }`. For both: `text-align: end` on those headers, which changes English. |
| V11 | nit | Latin text in Arabic mode | With `'Cairo', 'Poppins'` first, every Latin run and every digit is drawn in Cairo's Latin: staff names, emails, `IGCSE`, the class pills. Only the `English` button is Poppins. It looks coherent, and the spec asks for exactly this stack, but the brand rule says Poppins only. | Owner's decision. | If Poppins is wanted for Latin: `html[lang="ar"] body { font-family: 'Poppins', 'Cairo', sans-serif; }`. Poppins has no Arabic glyphs, so Arabic falls through to Cairo. Digits become Poppins too; check the look of mixed lines before adopting. |
| V12 | nit | Content consistency | The same options form is dated `2026-2027` on the Start here card and in `#s3`, and `2026/2027` in `#s8`. All render in the right order. The eleven class pills open English PDFs with no tag; the full-timetable button beside them has one, which is probably enough. | One form of the year. | String change only; check whether English has the same difference. |

Checked and found right, so nobody has to check again:

- Mirroring: journey-map line, dots and coloured card border on the right; gold
  tick dots on the right; level borders on the right; update items and unread
  bell items bordered on the right; bell count badge on the left of the bell;
  table columns run right to left; tabs start at the right with Grade 9; class
  pills run 9A to 9D from the right; contact grid fills from the right at 800
  and 1100px; `←` arrows point left; the external-link arrow is flipped to `↖`.
- Not mirrored, correctly: the emblem in the bar, the hero, the watermark, the
  bands and the footer; all numerals (Western digits throughout); `A*` (star to
  the right of the A in all four places, measured); `2026/27`, `2025/26`,
  `+966 50 519 9115`, `054 987 4933`, times such as `6:30` and `12:35`.
- Countdown cell order: days on the right, then hours, minutes, seconds to the
  left. That is what an Arabic reader expects for labelled cells, which are read
  right to left like the rest of the line. Left as is.
- Language button: fits at 380px in both languages (Arabic: brand 209 to 364,
  button 106 to 173, bell 60 to 104, menu 16 to 60). At 320px it fits but see V5.
- `بالإنجليزية` tag: present on 4 of 5 PDF cards in Start here, on the full
  timetable button, and on 14 of 18 PDF rows (V2 accounts for one card and one
  row; the other three rows are the bilingual ones); readable; never collides. On rows
  with a long title it drops to its own line under the title, which reads fine.
- Line height: no descender or diacritic touches the next line anywhere, including
  the tanwin in `اطرحوا سؤالاً` and `صباحاً`. Headings are 1.2, body 1.5 to 1.6.
- Side-scrolling tables: none. No table is wider than its card at 380 or 320px,
  so there is no scroll position to get wrong.
- Brand: text and fills use only deep navy, navy, gold, white and the existing
  greys and gold tints; weights in use are 400, 500 and 700 only.

## 3. English regression

`git show main:index.html` was written to `$S/main.html` with `assets` symlinked
beside it. Both pages were captured at 380px, device scale 2, in 800px slices:
25 full-page slices, the open menu, the open bell, and 4 slices of the subject
options section with Grade 10 selected. Each pair was compared pixel for pixel
with Pillow (`ImageChops.difference`, exact match, no tolerance).

- 28 of 31 pairs are identical. Page height is 19,592px in both.
- The 3 that differ (slice 1, menu, bell) differ in one rectangle only: device
  pixels (430, 26) to (548, 86), which is the language button, 215 to 274px
  across and 13 to 43px down. Masks saved as `diff-01.png`, `diff-menu.png`,
  `diff-bell.png`.

So at 380px English is unchanged apart from the button. At 320px it is not: see V5.

## 4. Behaviour checks

**Countdown** (scratch copies `cd-future.html`, `cd-under.html`, `cd-past.html`,
each with `data-doors` and `data-end` added to the hero):

- Future: `تفتح الأبواب بعد`, cells `20 يوم` · `07 ساعة` · `48 دقيقة` · `37 ثانية`
  from right to left, no overflow. `cd-future-ar.png`.
- Between doors and end: `اللقاء جارٍ الآن` / `تفضلوا بالدخول.` `cd-under-ar.png`.
- After end: `شكراً لحضوركم` / `نأمل أن اللقاء كان مفيداً لكم.` `cd-past-ar.png`.
- Language note, not visual: the unit labels are fixed singulars, so `20 يوم`
  is right but `3 يوم` or `5 ساعة` would not be. Acceptable for a countdown.

**Real origin** (`python3 -m http.server` on a free port, stopped afterwards):

| step | lang / dir | `location.search` | `aisHub.lang` | h1 |
|---|---|---|---|---|
| open `?lang=ar` | ar / rtl | empty | `ar` | بوابة أولياء الأمور |
| reload | ar / rtl | empty | `ar` | بوابة أولياء الأمور |
| open with no query | ar / rtl | empty | `ar` | بوابة أولياء الأمور |
| open `?lang=en` | en / ltr | empty | `en` | Parent Hub |
| reload | en / ltr | empty | `en` | Parent Hub |
| open `?lang=ar#contacts` | ar / rtl | empty, `#contacts` kept | `ar` | بوابة أولياء الأمور |
| tap the button, then reload | en / ltr | empty, `#contacts` kept | `en` | Parent Hub |

All as designed. The page title also switches (`بوابة أولياء الأمور · مدارس الرواد العالمية`).

**Tabs, menu, bell:** both tabs switch their panel in Arabic; the menu and the
bell open with no overflow at 380px; the bell panel scrolls inside itself.

## 5. What was captured

All under `$S/img/`. Scripts: `$S/cap.mjs` (the adapted driver),
`$S/shot-original-copy.mjs` (untouched copy), results in `$S/results-*.json`.

| files | what |
|---|---|
| `ar380-01.png` to `ar380-24.png` | Arabic, 380px, whole page |
| `ar380-menu.png`, `ar380-bell.png` | Arabic, 380px, menu open, bell open |
| `ar380-tab9-01..05.png`, `ar380-tab10-01..04.png` | Arabic, 380px, subject options with each tab |
| `ar320-top.png`, `ar320-menu.png`, `en320-top.png`, `en320-menu.png`, `main320-top.png` | 320px top bar and hero |
| `ar800-01.png` to `ar800-18.png`, `ar800-tab10-01..03.png` | Arabic, 800px |
| `ar1100-01.png` to `ar1100-17.png`, `ar1100-tab10-01..03.png` | Arabic, 1100px |
| `en380-01..25.png`, `en380-menu.png`, `en380-bell.png`, `en380-tab10-01..04.png` | English, 380px, this branch |
| `main380-*.png` (same set) | English, 380px, `main` |
| `diff-01.png`, `diff-menu.png`, `diff-bell.png` | pixel-difference masks |
| `en800-01.png` to `en800-18.png` | English, 800px, for comparing V10 |
| `cd-future-ar/en.png`, `cd-under-ar/en.png`, `cd-past-ar/en.png` | countdown states |
| `http-ar.png`, `http-ar-reload.png`, `http-en.png` | the real-origin check |
| `sbs-06.png`, `sbs-en-13-23.png`, `crop-*.png` | side-by-side and zoomed crops |
| `fixtest-mentors-*.png`, `fixtest-contacts-*.png`, `fixtest-s3-*.png`, `fixtest-g10-*.png` | V1, V3, V4 and V10 fixes injected in the browser |

Measured overflow (`scrollWidth` / `clientWidth`): Arabic 320/320, 380/380,
800/800, 1100/1100; with menu open and bell open 380/380; English 320/320 and
380/380; `main` 380/380.

## 6. What could not be checked

- **Real phones.** Everything is headless Chrome on macOS. iOS Safari and Android
  Chrome shape Arabic with their own engines, and Safari treats
  `unicode-bidi: plaintext` and `isolate` with small differences. V1 and V3
  should be looked at on an iPhone after fixing.
- **Offline or blocked Google Fonts.** Cairo loaded here. If it fails, Arabic
  falls to the system face (Geeza Pro, Noto Naskh), whose metrics differ; that
  fallback layout was not captured.
- **Viewed by eye versus compared by machine.** Viewed: all 24 Arabic 380px
  slices, menu, bell, Grade 10 slices 1 to 3, the 320px shots, all 18 slices at
  800px, all 17 at 1100px, four of the six countdown shots, one real-origin shot,
  and the fix tests. Not opened by eye: the `tab9` slices (the same state as
  full-page slices 6 to 10), the Grade 10 slices at 800 and 1100px except one,
  and most English slices, which were compared with `main` by pixel difference
  and seen only in the two side-by-sides and `en800-13.png`.
- **Whether the parent guide is truly English only (V2).** Judged from the text
  layer; a scanned Arabic page would not show there.
- **Hover, focus rings and the read/unread transition** in the bell and strip
  were not exercised in Arabic; `tools/shot.mjs --lang=ar` covers the toggle.
- **The Arabic wording itself** is out of scope here; only where it changes the
  look (V4, V7, V12) is it mentioned.
- **Screen readers.** `aria-label` values were not audited.
