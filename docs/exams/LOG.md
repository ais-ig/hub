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
| D12 | The sections between the new one and the next emblem band had their cream and white swapped, so the alternation holds. | Inserting a section shifts the pattern. | Cosmetic; swap back if a different order is preferred. |

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
