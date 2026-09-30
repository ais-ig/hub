# Task 7 report · documentation

Status: DONE_WITH_CONCERNS (two items could not be verified in the code and
were left out of the documents; see the end).

Only `CLAUDE.md` and `README.md` were edited. Every statement added was
checked against `index.html`, `tools/i18n.mjs`, `tools/check.mjs`,
`tools/shot.mjs` and `tools/render-check.sh` as they stood on branch `arabic`
at the time of writing, not against the reports. No counts of strings, keys or
tests are quoted in either document, and no Arabic wording beyond the rules
themselves.

## CLAUDE.md

- **What this project is.** One sentence added: the page opens in English and
  can be read in Arabic, right to left, since 30 September 2026.
- **Architecture.** The bullet "English only. No language toggle, no RTL."
  is replaced by four bullets:
  1. English and Arabic, English first: reversed on 30 September 2026 at the
     school's request, with an explicit "do not restore it"; the toggle,
     `?lang=ar` and `?lang=en`, `localStorage` key `aisHub.lang`.
  2. The Arabic is a dictionary: `data-i18n`, `data-i18n-attr`, the `i18nAr`
     and `i18nEn` blocks, the hash `h`, and why this shape was chosen over
     side-by-side markup or a second page.
  3. Right-to-left is one override block at the end of the stylesheet.
  4. Arabic can never blank the page: `i18n-wait`, the 1.5 second timer, the
     English fallbacks.
- **Design direction.** One departure added: the pathway hub is English only;
  the Arabic mode mirrors the design and does not redraw it.
- **Brand rules.** "Poppins only" became "Poppins only for English", and a
  Cairo bullet was added (same four weights, the school site's face, Latin
  runs also Cairo in Arabic mode, no third typeface).
- **Writing rules.** A paragraph naming the spec's glossary as the authority,
  and eight Arabic rules, including that update notices are plain text.
- **New section "English and Arabic move together"**, placed after the
  existing couplings and notes and before "Workflow expectations", so nothing
  existing moved. It gives the steps for each case (edit a sentence, add a
  string, a read attribute, a script string, an update notice,
  `data-i18n-skip`, `data-pdf-en`, new CSS), lists what `tools/check.mjs`
  fails on, names the stale hash as the failure to expect, notes how the
  timetable and schedule couplings reach the Arabic, describes the review
  files, and says the class timetable page of the 27 September spec should
  adopt the same mechanism.
- **New subsection "Arabic traps"**: dashed ranges, phone numbers and emails
  and `A*`, letter-spacing, `history.replaceState` on `file://`.
- **Workflow expectations.** Two bullets added: the 380px check in both
  languages with `tools/shot.mjs --lang=ar`, and that an English change is not
  done until its Arabic is.

Nothing unrelated was removed or reworded. The only deleted lines are the old
"English only" bullet, the old "Poppins only" bullet, and the one "Parents open
it on a phone" line, which was re-written with a sentence added.

## README.md

- **Opening.** One line added saying the page can be read in Arabic.
- **Adding a document.** One sentence: a new card or row needs keys, Arabic and
  `data-pdf-en` where the file is English only.
- **Updating the timetable.** Steps 4 and 6 now say the "in effect from" and
  issued lines are keyed strings needing their Arabic, and that the notice is
  written in both languages.
- **Recording a change.** The required fields now include `titleAr` and
  `textAr`, with `labelAr` beside a `label`, all plain text.
- **Checking your work.** The description of each script was brought up to
  date, a `shot.mjs --lang=ar` entry was added, and one line on
  `node --test tools/i18n.test.mjs`.
- **New section "Arabic"**: what exists, how to view it, how it is held, the
  recipes as commands (change a sentence and `stamp`, add a string and
  `merge`, update notice fields, `data-i18n-skip`, `data-pdf-en`, `extract`
  and `check`), the review file and `pairs`, where the glossary lives, the
  mirror rule for CSS and the `file://` note.
- **The previous Parent Information Hub.** One sentence added: the present
  Arabic was built afresh and takes nothing from the archived hub's toggle.

## Statements in the old documents that were false, and the amendment

| Where | Old statement | Now |
|---|---|---|
| `CLAUDE.md`, Architecture | "English only. No language toggle, no RTL. Every document the school produces for these grades is English." | Replaced by the new locked decision, stating that the old one was reversed at the school's request. |
| `CLAUDE.md`, Brand rules | "Poppins only, weights 300 / 400 / 500 / 700." | "Poppins only for English", plus Cairo for Arabic. |
| `README.md`, Recording a change | "`id`, `date`, `title` and `text` are required" | `titleAr` and `textAr` are required too, and `labelAr` with a `label`; rule 8 of the tool fails without them. |
| `README.md`, Checking your work, `check.mjs` | The list omitted the per-class timetable check (already there before this work) and the Arabic rules; "only the allowed Poppins weights". | Both added; "allowed font weights", since the rule tests every `font-weight` and so covers Cairo as well. |
| `README.md`, Checking your work, `render-check.sh` | "Finishes by running tools/shot.mjs." | Describes the Arabic DOM assertions and that `shot.mjs` runs in both languages. |
| `README.md`, Checking your work, `shot.mjs` | Did not mention the language toggle assertion or `--lang=ar`. | Both added. |

Left as it is, and still true: `CLAUDE.md` "No dependency beyond Google Fonts"
(Cairo comes from the same request); "Poppins 700 is the heaviest weight" in
the design departures (it is a comparison with the pathway hub's English).

## Verified in the code

- `node tools/i18n.mjs` with no arguments prints
  `usage: node tools/i18n.mjs extract | merge <file>... | stamp <key>... | stamp --all | pairs | check`
  and exits 2; a bare `stamp` does the same with the stamp usage line.
- `merge` takes JSON files of key to Arabic (a string, or `{ ar, nums }`),
  refuses unknown keys, stamps each entry; `pairs` writes
  `docs/arabic/translation-review.html` and `.md`.
- The nine rules and their messages, in `checkAll`; the two extra `i18nEn`
  and `EN` table checks and the month and `{n}` shape checks, in `check.mjs`.
- The head script, `aisHub.lang`, `i18n-wait`, the 1500 ms timer, the Cairo
  and Poppins font request, the `html[lang="ar"]` and `html[dir="rtl"]` block,
  `letter-spacing: 0 !important`, `unicode-bidi: plaintext` on `tel:`,
  `mailto:` and `table.data td.num`, the `data-pdf-en` tag rules.
- Update notices are written with `textContent`, so they are plain text.
- `?lang=` is removed with `history.replaceState` inside `try`/`catch`, whose
  comment says some browsers refuse it on a local file. That the clean-up
  works on a real origin is taken from the Task 6 visual critique, which
  tested it on `python3 -m http.server`; I did not rerun that.
- No `?v=` link sits inside an Arabic string today; the timetable links are
  on elements, not inside keyed sentences. The documents therefore say only
  that an `href` inside a keyed sentence is compared, which rule 5 does.
- `node tools/check.mjs` passed at the time of writing.

## Could not verify, so left out

- **The `"latin": true` rule** (an Arabic entry with no Arabic letters fails
  unless it carries `"latin": true`). It was not in `tools/i18n.mjs` when I
  wrote the documents, so neither document mentions it. Once it lands, add
  one clause to the list of failures in `CLAUDE.md`, "English and Arabic move
  together", and one line to the README's "Leave something in Latin letters".
- **The separator in the `pairs` output.** Not in the code yet; the documents
  describe `pairs` only by what it writes.

## Other notes

- The dashed-range trap is stated as the spec gives it. The English banner
  still reads "6:30 AM – 1:05 PM" with an en dash, which is correct in
  English; the rule is for the Arabic string only.
- The list of PDFs that do not take `data-pdf-en` (the Semester 1 letter, the
  commitment form, the parent guide, the class pills) matches the page now. If
  the fixer changes decision D17, that sentence in `CLAUDE.md` changes too.
- `docs/arabic/LOG.md` was modified in the working tree by someone else and is
  not in this commit.

## Reconciliation

After the fixer's commit `e9ac676`. Each point was checked in the code first.

1. **Parent guide and `data-pdf-en`.** Listing every `assets/*.pdf` link on
   the page without the attribute gives: the Semester 1 parent letter (one
   link), the phone policy commitment form (two rows) and the eleven class
   pills. `CLAUDE.md` now states exactly that list, dated, and says the parent
   guide carries the marker and why the first decision was reversed.
   `README.md` names the letter, the form and the pills.
2. **The untranslated rule.** Read in `tools/i18n.mjs` (`leftInLatin`, reported
   as `i18n 1 untranslated`) and its three tests. It fails an entry, or a
   notice's Arabic field, whose visible text has no Arabic letter, unless the
   English has no letters, the entry carries `"latin": true`, or the notice
   carries `"latinAr": true`. Added to the failure list in `CLAUDE.md` and to
   the README's "Leave something in Latin letters". No entry on the page uses
   either flag today.
3. **`pairs` separator.** The README's description of the review file now says
   tags are stripped. The middot separator itself is not described: neither
   document goes into the file's format that far.
4. **CSS outside the block.** `CLAUDE.md`, "Right-to-left is one override
   block", now names the exception. Stated slightly wider than the brief,
   because the code shows it: the language button's own rules also sit with
   the top bar, since the button shows in both languages, and the
   `@media (max-width: 359px)` rule sits beside them.
5. **`h4` and `text-transform`.** `html[dir="rtl"] h4 { text-transform: none; }`
   is in the block; added to "Arabic traps".
6. **Glossary.** Neither document quoted a term that changed. The terms quoted
   (الصف, السنة, العام الدراسي, القسم البريطاني, يمكنكم, ابنكم, اطرحوا, الصف
   التاسع, من … إلى …) stand in the amended spec. The spec's new rule that a
   single grade is an ordinal word and a list of grades takes digits is
   consistent with what `CLAUDE.md` says and is left to the spec.
7. `node tools/check.mjs`: all checks passed.

The two "could not verify" items above are now closed.
