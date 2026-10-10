# Tests and exams on the Parent Hub · work log

10 October 2026. Branch `exams`, local only; nothing is pushed. `git diff
main..exams` shows all of it. `main` is untouched.

## What was asked

Mr. Farhan forwarded two pages built by the IT department, a school-wide
mid-term schedule page and a boys-section roster, and asked whether the
first could be embedded in the hub and the second used internally. You chose
to rebuild the British Section's slice of the schedule natively in the hub,
in both languages, and to defer the internal tool.

## Decisions you made in chat

1. A permanent "Tests and exams" section after Class timetables, swapped each
   round; a self-retiring hero button; the countdown stays off.
2. No iframe and no link to the portal page.
3. The two PDFs sent to parents are not hosted: their headings end the window
   two days early. Corrected files can be added later.
4. The Section follows the Zero Period bell on each grade's test days, from
   `Zero Period- Mid Term Tests.docx`.
5. Sunday 25 October is a holiday and Monday 26 October a buffer day with no
   test, per Mr. Farhan on 10 October. Both appear as rows and the holiday
   as a notice. Before pushing, confirm with him that the school's own
   announcement goes out, so the hub is not where a family first hears of it.
6. The page says the tests cover the IGCSE and A-Level subjects, the parents'
   calendar's own words, and nothing about quizzes for the Ministry subjects.
   **Changed after review, see D13 below.**

## Decisions I made for you

| # | Decision | Why | To reverse |
|---|---|---|---|
| D1 | Section title "Tests and exams"; Arabic الاختبارات, one word, not الاختبارات والامتحانات. | In Saudi school usage اختبارات covers both; the pair reads as a redundancy. | Change `exams.title` and `menu.exams` in `i18nAr`, then `stamp`. |
| D2 | Two-column tables, day and subject, with the time stated once in the lead. | The time is the same on every row; four columns are tight at 380px, more so in Arabic. | Add a column and key its cells. |
| D3 | The two empty days are rows: "Holiday, no school" and "No test, lessons as usual", muted. The word buffer stays off the page. | A gap in a list of dates invites the question; a row answers it. | Delete the two `tr.off` rows. |
| D4 | Subject names as the hub writes them: Mathematics, Computer Science or ICT, Arabic or Accounting, Biology or Computer Science. In Arabic each carries its English in brackets, as every subject on the page does (the Arabic log's D16). | One name per subject across the page. | Edit the `exams.s.*` and `subj.maths` strings. |
| D5 | The Grade 11 and 12 heading keeps "Science stream", as the sheet parents received says. | The boys campus has only the Science stream in Grades 11 and 12 (the roster shows AS(SCI) and A2(SCI) only), but parents hold a sheet that says it. | Edit `exams.g1112.h`. |
| D6 | The bell's 6:30 row is Homeroom, not Assembly. | The Daily Schedule, the timetable note and the glossary call that slot Homeroom; two words for one slot would confuse. | Edit `exams.l.hr` in both languages. |
| D7 | Grade 9 is given the Grades 4 to 9 bell and Grades 10 to 12 the other, as the bell sheet and the portal's note have it. **This is the one assumption to check with Mr. Farhan**: Grade 9 IG sits in the UK High School with Grades 10 to 12, and on a test day the two bells put its break at a different time from theirs. | It is what the school's own sheet says, and what you confirmed in outline. | If Grade 9 follows the Grades 10 to 12 bell: delete the Grade 9 table, retitle the other "Grades 9 to 12", and drop the sentence about two tables from `exams.bell.p` in both languages. |
| D8 | Zero Period in Arabic is الحصة الصفرية; holiday is إجازة. Both are new to the glossary. | The school's Arabic WhatsApp message gives no term for Zero Period. | Replace in `i18nAr`. |
| D9 | "Semester One", not "Semester 1", in the new English. | The assessment section already says Semester One, and it keeps the digit check out of the Arabic ordinal. | None needed. |
| D10 | A one-line cross-reference under the timetable note: on a test day the school day follows the Zero Period bell. Permanent, not retired after the round. | The timetable note states period times that are wrong on a test day. | Delete the `schedule.exams` paragraph and its Arabic. |
| D11 | Two notices rather than one: the tests, and the holiday. Both dated 10 October 2026. | A holiday deserves its own line in the bell. | Delete `2026-10-10-holiday`. If you push on a later day, change the two `date` fields only. |
| D12 | Five sections, IGCSE results, Your IG pathway, Subject options, How marks are built and Support, had their cream and white swapped, through the first emblem band up to the second, so the alternation holds after the new section. | Inserting a section shifts the pattern. | Cosmetic; swap back if a different order is preferred. |

## Open with the school

- Corrected schedule sheets with the right end dates, if they are to be
  hosted (you said not to chase this).
- Whether the 25 October holiday has been announced to parents, before this
  is pushed.
- D7 above, the Grade 9 bell.
- The Arabic terms in D8, for the school's own wording.

## Checks run

`node tools/check.mjs`: all passed. `bash tools/render-check.sh`: all passed,
English and Arabic, no overflow at 380px with the page and with the bell
open, language switch restores the page. `node tools/i18n.mjs pairs`
regenerated `docs/arabic/translation-review.*`.

## Review, 10 October 2026

Two Opus agents reviewed commit 7425d2e: an accuracy review against the
sources (`docs/exams/reports/accuracy-review.md`, 17 findings) and a critique
as a parent and editor (`docs/exams/reports/critique.md`, 14 points). Every
fact on the page matched the sources. What changed in the second commit:

- **The Section's own Quarter 1 sheet was a source I had not read.**
  `~/Downloads/Midterm_Test_Schedule_Quarter_1_2026-2027_-_British_Section_(Boys).docx`,
  issued to students on 5 October, in the Section's own template. Its grids
  match the two parent sheets row for row. Its "Important Information" list
  gave the page a "Before a test" card: stationery and blue pen, no electronic
  devices, and the rule a parent has to act on, a Sihati sick leave note within
  3 days to sit the make-up test.
- **The lead was rewritten.** The portal's "seated by 7:50 AM" went: it is a
  student instruction, it is in none of the Section's sheets, and beside the
  bell table it read as an arrival time. In its place the lead says the day
  still starts at 6:30 and ends at 1:05, and that each test is worth 10 of
  the 20 marks of Quarter 1.
- **The bell paragraph was wrong.** It said periods 1 and 2 are shorter; every
  period is 35 minutes on a test day, against 40. Fixed, and "their break"
  became "their morning break", the only one that differs.
- **The test row** in the bell tables had borrowed the 10px group-heading
  style. It now has its own `tr.test` rule at normal size, and reads "Test
  (Zero Period)".
- **Grades 11 and 12** gained a muted Wednesday 28 October row, since the
  subtitle and the notice say the window runs to the 28th.
- **Muted rows** moved from `--muted` (about 3.8:1 on white) to `--ink-soft`
  (about 5.7:1), so the holiday row passes AA contrast.
- **Both notices were shortened** to the one thing a parent needs.
- **Arabic.** Grades listed together are digits, as the spec rules and the
  page already does (الصفان 9 و10). Four strings that read as translations were
  rewritten: the cross-reference under the timetable note, the bell
  paragraph, the lead's marks sentence, and the bell card heading.
- **The glossary** in the Arabic spec gained the new terms, which D8 had
  promised and the first commit forgot.
- **`newUntil` cannot extend the New window**, only shorten it. Both notices
  are dated 10 October, so they stop counting as new on 24 October, before
  the last tests on 27 and 28 October. The README, CLAUDE.md and the section
  comment said the window lived in `newUntil`; they no longer do. The values
  stay, since they are harmless and follow the house convention.
- **README** now tells the next editor to delete orphaned `exams.*` Arabic
  entries, keeps the bell card between rounds so the timetable cross-reference
  still points at something, and no longer gives a next-round date that was
  right for Grades 9 and 10 only.

### More decisions I made for you

| # | Decision | Why | To reverse |
|---|---|---|---|
| D13 | The page now says Quran tests for every grade, and Arabic MoE tests for Grades 9 and 10, take place in class during the same two weeks. This changes decision 6. | The Section's own sheet states it, to students, for this round. The earlier line, "the tests cover the IGCSE and A-Level subjects", came from the calendar and was contradicted by that sheet (Quran and Arabic MoE tests in class; Grade 12's English test is English MoE). | Delete the `exams.lead2` paragraph and its Arabic entry. |
| D14 | The "Before a test" card carries the Sihati make-up rule, stationery and blue pen, and the device ban, from the Section's sheet. "Smartwatch" is named because the portal's rules box names it and a smartwatch is an electronic device. | A parent has to act on the Sihati rule within 3 days. | Delete the card and its three `exams.prep.*` entries. |
| D15 | Grade 12's Monday test is written "English", as on the parents' sheet, though the Section's sheet says "English MoE". | The two grades share one table and the parents' sheet says English. | Split the row or add "(Grade 12: English MoE)". |
| D16 | The bell card stays between rounds, and D10's cross-reference line with it. | The line points to the bell; removing one without the other leaves a dangling pointer. | Remove both together. |

### Still open with the school, after review

- Is the 12:10 to 12:30 break on a test day the Salah break? The bell sheet
  has no Salah row; the page copies it and claims nothing.
- A reminder notice near 24 October ("Mid-Term Tests resume Tuesday 27
  October"), dated the day it goes live, if the tests notice should be back in
  the strip for the last three test days.
- The holiday gate (item 5 above) and D7 (the Grade 9 bell) stand.

### Checks after the second commit

`node tools/check.mjs` all passed. `bash tools/render-check.sh` all passed
in both languages. Captures of the revised section at 800px and 380px in both
languages were looked at.


## Third pass, 10 October 2026, after the user's review

The user read the two lead paragraphs and asked where each came from.

- **The marks sentence** had said "In Grades 9 and 10, each test is worth 10
  of the 20 marks for Quarter 1". The restriction was mine: `#s4` is written
  for Grades 9 and 10, so I kept to its scope. The source is not the mid-term
  material at all but the Teachers' Guide assessment breakdown
  (`~/Downloads/Assessment_Breakdown_Teachers_Guide_British_Section_2026-2027_TABLES.pdf`),
  which is Section-wide, and the school's Parent Assessment Guide for Grades
  9 to 12, linked from `#s4`, gives the same 10 of 20 in Quarters 1 and 3
  for every subject. The sentence now names no grade, as the user asked.
- **The Quran and Arabic MoE line** (D13) is gone. Its only source was the
  Section's own student-facing sheet, and the user ruled that the Section's
  internal files are not sources for the page: they were not shared with or
  reviewed by the Head of Section, who said the school's own material is what
  goes to parents. The same rule removed the "Before a test" card (D14):
  stationery and blue pen, and the Sihati make-up rule, were on that sheet
  alone. The device rule survives as the second lead paragraph, because the
  IT portal's rules box, which the Head of Section forwarded, states it
  ("Electronic devices and smartwatches are strictly prohibited in the exam
  hall") and the hub's own phone policy backs it.
- **D15 is moot.** With the Section's sheet out, the parents' sheet is the
  only source for Grade 12's Monday test, and it says English.
- **Source rule, for next time.** Only material the school issued to parents
  or the Head of Section forwarded goes on the page. Recorded in CLAUDE.md,
  in the Tests and exams row of the content sources.

| # | Decision | Why | To reverse |
|---|---|---|---|
| D17 | The marks sentence names no grade. | Section-wide in the Teachers' Guide; Grades 9 to 12 in the Parent Assessment Guide. | Put "In Grades 9 and 10," back in both languages and stamp `exams.lead`. |
| D18 | The device rule is the second lead paragraph, `exams.lead2`, not a card. | One rule does not fill a card, and the "Before a test" heading promised more than one. | Give it a card and a heading key again. |

The glossary rows added for the card (make-up test, Sihati, test room) stay:
a later round may need them, and a glossary row costs nothing.

### Checks after the third pass

`node tools/check.mjs` all passed. `bash tools/render-check.sh` all passed
in both languages. The section was captured again at 380px and 800px in both
languages and looked at.
