# Tasks 5 and 6 · Fix report

30 September 2026, branch `arabic`. The three review reports were applied
under `.superpowers/arabic/fix-rulings.md`. No English on the page was changed.
70 Arabic strings changed (61 dictionary entries, 1 new key, 8 update-notice
fields).

## 1. Counts

| Report | Findings | Applied as proposed | Applied in a changed form | Rejected or left |
|---|---|---|---|---|
| Accuracy (findings table) | 23 | 18 | 5 | 0 |
| Accuracy (consistency groups) | 11 | 9 | 2 (grades, by R15) | 0 |
| Accuracy ("change" verdicts on unsure items) | 14 | 13 | 1 (C29, by R15) | 0 |
| Fluency (findings table) | 41 | 29 | 8 | 4 |
| Fluency (page-wide terms) | 7 | 6 | 0 | 1 (وكيل, by R5) |
| Visual | 12 | 8 | 3 (Arabic only) | 1 (V11, owner's call) |

Tool items from part C: both done, 6 tests added (94 tests, all pass).

## 2. Rejected or changed findings

### Accuracy

| Key | What happened | Reason |
|---|---|---|
| `doc.commitment.sb` | Applied with الجوال: `PDF · يُوقَّع عند استلام الجوال المحجوز` | R1. |
| `updates.2026-09-13-class-pdfs.text` | Applied, and "phone" became جوال، الجوالات | R1. |
| `updates.2026-09-13-student-council.text` | The three single grades stay digits, not words | R15: the string lists grades, so every grade in it is a digit. The meaning fix (فهو في منصبه بالفعل) and المدرجين في القائمة المختصرة were applied. |
| `s2.lead` | الصفان 9 و10, and the two later single grades are now الصف 9 and الصف 10 | R15, same rule. The reviewer wanted the later two left as words. |
| `results.sub` | One string from both reports: `718 نتيجة في 20 مادة، حققها 192 من الطلاب المتقدمين للاختبارات، لدى جميع هيئات الاختبارات مجتمعة` | R12 for the term, the fluency order for the sentence. |

### Fluency

| # | Key | What happened | Reason |
|---|---|---|---|
| 1 | online notice `textAr` | Applied except two phrases. "تُقام كالمعتاد أيضاً" stays, and "ويسجّل الدخول برقم S" stays | "في مواعيدها المعتادة" says "at their usual times", which is one reading of an ambiguous English sentence (see section 4). The accuracy review ruled to keep it faithful. "He signs in" is what the English says; "يدخل إليها" is not. |
| 6 | `s7.attendance.li2` | الاستئذان applied. "يجب تقديم" and "لا يمكن تنفيذ" kept | "must be made" is an obligation and "cannot be processed" is weaker than لا تُقبل (accuracy item C14). |
| 7, 8 | `s7.lvl.c.a`, `contacts.deputy.cs` | Rejected | R5: نائب مدير المدرسة stays. Question for the school. |
| 12 | Student Council `textAr` | Merged with the accuracy finding | Fluency wording (المقاعد المتاحة: ممثل لكل صف، ونائب للرئيس، interviews moved forward in the sentence), accuracy meaning (في منصبه بالفعل, المدرجين في القائمة المختصرة). Digits by R15. |
| 18 | `s4.progress.li2` | Rejected, string unchanged | The proposal turns one document ("a results and support plan") into two (a statement of results and a support plan). Accuracy item B5 says keep it as one. Question for the school. |
| 20 | `results.sub` | Merged, see above | R12. |
| 25 | `s7.lvl.c.d` | `مغادرة حرم المدرسة` instead of `الخروج من المدرسة دون إذن` | "Without permission" is not in the English. حرم المدرسة answers the same worry. |
| 26 | `s6.offer.li4` | `تخصيص جزء من الوقت للمجتمع المحلي` instead of التطوع | The English calls it "a standing expectation", so "volunteering" contradicts it (accuracy item B19). The calque بذل الوقت and the repeated heading are both gone. |
| 30 | `contacts.counsellor.rl` | `دعم الراحة النفسية والسلوك` | R6. |
| 34 | `doc.commitment.t` | `نموذج التعهد بالالتزام بسياسة منع الجوال` | The finding's link word, plus R1 and R2. |
| 39 | `s3.g10.maths.*` | Rejected | The accuracy review asked for the opposite, the board alone, in all four maths keys. That matches the English and the form, and it won on consistency. |

Fluency's nine challenged rules: 1 (الجوال), 3 (تمييز), 4 (percent digits), 5
(grade digits) and 8 (year with a slash) were adopted by R1, R3, R17, R15 and
R16. 2, 6, 7 and 9 were kept as they are by R4, R6, R14 and R18.

### Visual

| id | What happened |
|---|---|
| V1 | Fixed. `.ccard a` is no longer plaintext. Mr. Noor's phone link got the key `contacts.activity.tel` so its number carries `<span dir="ltr">`. Both icons now sit at the right edge on every card. |
| V2 | Fixed. `data-pdf-en` on both Parent Guide links. |
| V3 | Fixed. Class labels are isolated and line up at the right edge. |
| V4 | Fixed in the strings: `subj.islamic`, `subj.social`, `subj.business`, `subj.cs` wrap their bracket in `<span dir="ltr">`. The maths keys now hold one word in the bracket and need no span. |
| V5 | Fixed for both languages with one `@media (max-width: 359px)` rule beside the button's own rules: bar padding 8px, emblem 32px, gap 8px, button padding 8px. Brand is one line plus the small line at 320px in both languages. Nothing applies from 360px up, and the 380px English comparison confirms it. |
| V6 | Fixed. 12px in Arabic for `h4`, table headings and group rows, the pair labels, `.tt-grp .lb`, `.materials .lb`, `.ustrip .hd`, `.bell .lb`, `.ccard .cs`; 11px for the small brand line, the countdown labels and the بالإنجليزية tag. No overflow at 320, 380 or 800px. |
| V7 | Fixed. Every percentage in an Arabic string is `<span dir="ltr">…%</span>`, so the sign is always on the right. |
| V8 | Fixed in Arabic only (`.uitem a` does not wrap). |
| V9 | Fixed in Arabic only (`.strip` radius 18px). |
| V10 | Fixed in Arabic only. The heading of a figures column is left-aligned over its figures. The suggested selector would also have moved the "Curriculum" heading away from its start-aligned cells, so the rule targets the last column, and the middle one only where it holds figures. |
| V11 | Not changed. The spec (decision 4) asks for Latin runs in Cairo in Arabic mode. Owner's decision. |
| V12 | Fixed by R16: the year is `2026/2027` in all four places. The eleven class pills stay untagged. |

One addition of my own: `html[dir="rtl"] h4 { text-transform: none; }`. The
uppercase rule turned "Edexcel" into "EDEXCEL" inside an Arabic heading.

**Nits that also exist in English, left alone there:**

1. V8: an update's link can break away from its arrow at a line end.
2. V9: a full pill radius on an "In short" strip of four or more lines crowds the first word into the corner.
3. V10: a column heading is start-aligned while the figures under it are end-aligned, so at 800px they sit far apart.
4. (From V3) a mentor row that wraps leaves a lone middot at the end of its first line.

## 3. Rulings applied

| # | What it touched |
|---|---|
| R1 | `s7.phones.title`, `.li1`, `.li2`, `.th.held`, `doc.phonepolicy.t`, `doc.commitment.t`, `doc.commitment.sb`, class-pdfs notice. "عبر الهاتف" kept in `s7.attendance.li2`. حجز kept. **The school's own form was checked first.** `assets/phone-policy-commitment-form.pdf` reads, on its Arabic side: "وأتعهد بعدم استخدام الجوال بالمدرسة مرة أخرى وأن استأجر خزانة اذا احتجت الجوال بعد المدرسة". The school says الجوال, so the ruling stands as written. |
| R2 | **Commitment form.** Its printed heading is "Violation for using the phone during school time" and under it "Commitment / تعهد" (one word, stretched with tatweels in the file). The text layer is readable. A card titled only تعهد would not tell a parent which form it is, and `s7.phones.li2` calls it نموذج التعهد, so `doc.commitment.t` is `نموذج التعهد بالالتزام بسياسة منع الجوال`: the form's own word, the school's own word for the phone. **Semester 1 letter.** Its Arabic page is headed "الخطة الدراسية وتوقعاتنا من الطالب", under it "الفصل الدراسي الأول للعام الدراسي 2026/2027". The heading line extracts cleanly (the body shows the usual ligature damage, الدرايس for الدراسي, but the title does not). `doc.letter.t` now carries that title exactly. Neither document has a second card in `s7` beyond these keys. |
| R3 | `strip.mark`, `bell.markAll`. |
| R4, R5, R6 | Nothing changed for مقر البنين, مدير المدرسة, نائب مدير المدرسة, المرشد الطلابي. `contacts.counsellor.rl` moved to الراحة النفسية. |
| R7 | `s4.progress.li3`, `s5.sub`, `s5.early.p`. `s7.lvl.b.a` left. |
| R8 | `s7.attendance.li2`, `contacts.affairs.rl`. |
| R9 | `doc.daily.sb`. |
| R10 | `menu.pathway`, `doc.weekly9.t`, `doc.weekly10.t`. |
| R11 | `s5.sheets.p`. |
| R12 | `results.sub`, glossary. |
| R13 | `doc.alevel.sb`, `doc.pathway.sb`. |
| R14, R18 | Nothing changed. |
| R15 | `s2.lead`, `s2.step3.g`, Student Council notice. |
| R16 | `start.options.d`, `s3.form.sb` (now `2026/2027`, as `doc.options.sb` and `doc.alevel.sb` already were). |
| R17 | `s4.lead` (50%), `s4.progress.li3` (60%), `s3.equiv.note` (40%, 60%). Each figure was checked against the English word. |

Checker notes: no entry carried `"nums": false` or `"numsAr": false` before
this task, and none was added. No entry needed `"latin": true`: every current
key whose Arabic has no Arabic letter (`js.arrow`, the phone number of
`contacts.activity.tel`) has English with no letters either.

The spec's glossary and writing rules were amended to match: Candidates, mobile
phone and the policy name, Mark as read, Mark all as read, intervention,
academic, well-being, early dismissal, Summer schedule, grade against mark,
class and classroom, the timetable in full, the grade-number rule, the
academic-year form, percentages, bracketed English, `A-Level` and `IGCSE`, and
the new checker rule.

## 4. English source issues for the owner

Each was translated faithfully. Nothing in the English was changed.

1. `updates.2026-09-27-online-week.text`: "Periods 1 to 3 today run as normal too." "As normal" can mean in school as normal or at the normal times online, and "today" was only true on 27 September. The Arabic keeps the same ambiguity (تُقام كالمعتاد). The notice leaves the New window on 1 October; if it is ever reissued, say which.
2. `s3.short`: "Choose Arabic or Accounting", while the table directly below lists Arabic as compulsory. The optional one is IGCSE Arabic and the compulsory one is the Ministry subject. A parent can read this as a contradiction in either language.
3. `s7.lvl.c.d`: "leaving school grounds". Every student leaves the grounds daily; the policy presumably means without permission. The Arabic says حرم المدرسة and adds nothing.
4. `contacts.affairs.rl`: "Absence, dismissal and student affairs". "Dismissal" here is rendered الاستئذان (permission to leave early), the only dismissal process the page describes. If it also means the ordinary end-of-day dismissal, the English should say so.
5. Percentages: "sixty per cent" in `s4.progress.li3` and "60%" in `s5.early.p` for the same threshold; "fifty per cent" in `s4.lead`; "Forty per cent ... sixty per cent" in `s3.equiv.note`; "100%" in `results.stat4`. The Arabic now uses digits throughout.
6. The academic year is written "2026/27" in most places and "2026-2027" in `start.options.d`, `s3.form.sb`, `doc.options.sb`, `doc.alevel.sb`.
7. "IG" in `menu.pathway`, `doc.weekly9.t`, `doc.weekly10.t`; "IGCSE" everywhere else. The Arabic says IGCSE.
8. "A-Level" in `s2.sub`; "A-Levels" in `s2.step3.h`, `doc.alevel.sb`, `doc.pathway.sb`.
9. The same choice is "Mathematics (Cambridge)" in Grade 9 (`s3.g9.maths.*`) and "Maths Cambridge" in Grade 10 (`s3.g10.maths.*`).
10. `s4.progress.li2`: "a results and support plan". One document or two?
11. `s5.early.p`: "a named intervention plan". In the student's name, or with a named member of staff? The Arabic says a plan of his own (خاصة به).
12. `s3.boards.share1`: "advanced level study". The Arabic now says A-Level by name, which is what the phrase means in a British section.
13. `s4.guide.t`: "British stream", where the rest of the page says "British Section".
14. `s6.allyear`: "Qur'an Memorisation", while `s3.hifdh.*` calls it the "Hifdh Programme" and spells the word "Quran". The Arabic uses one name for both.
15. `doc.commitment.t`: "Phone Policy Commitment Form". The form's own English heading is "Violation for using the phone during school time · Commitment".
16. `s6.offer.li4`: "Giving time locally, as a standing expectation" does not say whether the service is voluntary. The Arabic avoids "volunteering" for that reason.

## 5. Questions for the school

| # | Question | Keys | Arabic on the page now |
|---|---|---|---|
| 1 | What does the school call "Homeroom", the "homeroom mentor" and the "Mentorship Programme" in Arabic? | `schedule.note`, `doc.daily.sb`, `s5.mentor.*`, `s5.mentors.*`, `s6.allyear`, `contacts.sub`, mentors notice | حصة الريادة، رائد الفصل، برنامج رائد الفصل |
| 2 | What are the Arabic job titles of the Head of School and the Deputy Head of the British Section? A parent could take مدير المدرسة for the head of all of Al-Rowad. Is the deputy وكيل المدرسة? | `contacts.head.cs`, `contacts.deputy.cs`, `s7.lvl.b.a`, `s7.lvl.c.a`, `ask.note` | مدير المدرسة، نائب مدير المدرسة |
| 3 | Is the counsellor المرشد الطلابي or, as the Ministry now says, الموجّه الطلابي? | `contacts.counsellor.cs`, `s7.phones.li4`, `s7.lvl.b.a` | المرشد الطلابي |
| 4 | Is "Activity Supervisor" مشرف النشاط or رائد النشاط? | `contacts.activity.cs` | مشرف النشاط |
| 5 | What does the school call its boys site in Arabic: مقر البنين, مبنى البنين or قسم البنين? | `banner.place`, `start.*`, `schedule.sub`, `doc.*`, `contacts.campus` | مقر البنين |
| 6 | What is "UK High School" on the contacts heading: a building, a department, or the secondary stage? | `contacts.campus` | الثانوية البريطانية |
| 7 | What is the "Grade 9 Prayer Assembly Competition", and what is its Arabic name? The translation is a guess. | `s6.allyear` | مسابقة ملتقى الصلاة للصف التاسع |
| 8 | What does MyAIS itself call an early dismissal request in Arabic? | `s7.attendance.li2`, `contacts.affairs.rl` | الاستئذان |
| 9 | What is the school's Arabic name for "Social Studies (KSAH)", and what does KSAH stand for? | `subj.social` | الدراسات الاجتماعية |
| 10 | Is the twice-a-semester email one document (a results and support plan) or two? | `s4.progress.li2` | خطة النتائج والدعم |
| 11 | Does a "named intervention plan" mean a plan in the student's name or one with a named member of staff? And is الخطة العلاجية the school's own term? | `s5.early.p`, `s5.sub`, `s4.progress.li3` | خطة علاجية خاصة به |
| 12 | Does "alternative placement" mean a move to another school? | `s7.lvl.c.a` | النقل إلى بيئة تعليمية بديلة |
| 13 | Does the Student Academic Progress Sheet have an Arabic name? | `s5.sheets.h`, `s5.sheets.p` | سجلات التقدم، سجل للتقدم الدراسي |
| 14 | Names to confirm: Remah Camp, Pakistan International School, dodgeball, and whether "IGCSE distinctions" is a named award. | `s6.sem2.li1`, `s6.sem1.li2`, `s6.sem1.li7`, `s6.sem1.li1` | مخيم رماح، المدرسة الباكستانية العالمية، كرة المراوغة، تقدير الامتياز |
| 15 | The student's "S number" and his "class folders" on Schoology: is there an Arabic name for the first, and are the folders for his form class or for each subject? | online notice | رقم S الخاص به، مجلدات فصل ابنكم |
| 16 | The Commitment Form prints only تعهد as its Arabic title. Is the fuller card title acceptable? | `doc.commitment.t` | نموذج التعهد بالالتزام بسياسة منع الجوال |
| 17 | On 27 September, were periods 1 to 3 held in school or online? (Only if the notice is reissued.) | online notice | تُقام كالمعتاد أيضاً |

Answered by the school's own documents and no longer open: the word for the
phone (الجوال) and the Arabic title of the Semester 1 letter.

## 6. Verification

`node --test tools/i18n.test.mjs`

```
# tests 94
# suites 0
# pass 94
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

`node tools/check.mjs`

```
ok   14 internal anchors resolve
ok   26 asset links exist
ok   10 update entries are well formed
ok   11 class timetables match their filenames
ok   English and Arabic are in step
ok   15 script strings have their English

all checks passed
```

`bash tools/render-check.sh`

```
ok   countdown is hidden
ok   no thank-you message shown
ok   updates strip present
ok   bell button not hidden
ok   bell list rendered
ok   change log rendered
ok   change log section not hidden
ok   change log nav not hidden
ok   English page is left to right
ok   language button not hidden
ok   English page marked ready
ok   Arabic page is right to left
ok   Arabic hero title
ok   Arabic cover lifted by applyLang
ok   Arabic page is not left hidden
ok   Arabic bell list rendered
ok   Arabic dates rendered
ok   no English month in an Arabic date

-- mobile viewport check, English (tools/shot.mjs) --
ok   page: measured scrollWidth=380 clientWidth=380 innerWidth=380
ok   page: no horizontal overflow at 380px width
ok   bell open: measured scrollWidth=380 clientWidth=380 innerWidth=380
ok   bell open: no horizontal overflow at 380px width
ok   language switched en to ar and back, page restored exactly

-- mobile viewport check, Arabic (tools/shot.mjs --lang=ar) --
ok   page: measured scrollWidth=380 clientWidth=380 innerWidth=380
ok   page: no horizontal overflow at 380px width
ok   the page opened right to left from ?lang=ar
ok   bell open: measured scrollWidth=380 clientWidth=380 innerWidth=380
ok   bell open: no horizontal overflow at 380px width
ok   language switched ar to en and back, page restored exactly

all render checks passed
```

(The four "screenshot written" lines are left out; they name a temp folder.)

`node tools/i18n.mjs check` and `pairs`

```
ok   367 strings have Arabic in step with their English
wrote docs/arabic/translation-review.html and translation-review.md
```

The review file reads "367 strings · 0 missing Arabic". Its first row is now
`AIS Parent Hub · British Section | بوابة أولياء الأمور · القسم البريطاني`, and
the card titles read `🗓️ · Class Timetables`.

**English at 380px against `main`.** Both captured at 380px, device scale 2,
in 800px slices with a real device-metrics override: 25 page slices, the open
menu, the open bell, 5 slices of subject options with Grade 9 selected and 4
with Grade 10. Compared pixel for pixel with Pillow, no tolerance.

```
36 pairs, 33 identical
DIFF en380-01.png (430, 26, 548, 86)
DIFF en380-bell.png (430, 26, 548, 86)
DIFF en380-menu.png (430, 26, 548, 86)
```

The three that differ do so in one rectangle, the language button. Page height
is 19,592px in both.

**Arabic, measured overflow** (`scrollWidth` / `clientWidth`): 320/320,
380/380, 800/800, and 380/380 and 800/800 with the menu open and with the bell
open. No element outside the viewport.

**Looked at by eye after the fixes:** contacts (all seven cards), the mentor
lists, subject options for both grades, results, assessment, policies, the top
of the page with the strip and Start here, the change log, the document
library, the open menu, the open bell, the 320px top bar in both languages, and
two 800px slices.

**Screens for the owner**, in `docs/arabic/screens/` (untracked, 62 files):
`ar-380-01.png` to `ar-380-24.png`, `ar-380-menu.png`, `ar-380-bell.png`,
`ar-380-tab9-01..05.png`, `ar-380-tab10-01..04.png`; `ar-800-01.png` to
`ar-800-18.png`, `ar-800-menu.png`, `ar-800-bell.png`,
`ar-800-tab9-01..04.png`, `ar-800-tab10-01..03.png`.

Not checked: real phones (iOS Safari and Android Chrome shape Arabic and treat
`unicode-bidi` with small differences; V1 and V3 deserve one look on an
iPhone), and the page with Google Fonts blocked.

## 7. Files changed

- `index.html`: 61 Arabic entries, the new key `contacts.activity.tel`, 8 update-notice Arabic fields, `data-pdf-en` on two links, the additions to the right-to-left block, one `@media (max-width: 359px)` rule.
- `tools/i18n.mjs`: `pairs` separator; rule 1 "untranslated", with `"latin": true` for a dictionary entry and `"latinAr": true` for an update entry as the escapes.
- `tools/i18n.test.mjs`: 6 new tests; one old fixture that used Latin letters as stand-in Arabic now carries `latin: true`.
- `docs/superpowers/specs/2026-09-30-arabic-language-design.md`: glossary, writing rules, checker rule 1, the `pairs` row.
- `docs/arabic/translation-review.html`, `docs/arabic/translation-review.md`: regenerated.
- `docs/arabic/reports/task-5-6-fix-report.md`: this report.

Not touched and not committed by this task: `CLAUDE.md`, `README.md`,
`docs/arabic/LOG.md` (edited by others while this ran), `docs/arabic/screens/`.

## 8. Final fix wave

30 September 2026, after the whole-branch code review
(`final-code-review.md`) and the re-review of the first fix wave
(`fix-wave-re-review.md`). Tests were written first in each case and seen to
fail before the code changed.

### Fixed

| Finding | What was done |
|---|---|
| Important 1, notices have no hash | Each `updatesData` entry now carries `hAr`: the first eight hex characters of the SHA-1 of its English `title`, `text` and `label` together, with the same whitespace normalisation as dictionary entries. Rule 3 fails a notice with Arabic whose `hAr` is missing or no longer matches, naming the entry and the exact command, `node tools/i18n.mjs stamp updates.<id>`. `merge` stamps it when it writes a notice's Arabic; `stamp` accepts `updates.<id>`; `stamp --all` covers notices. The ten live entries are stamped. No `id` changed. The page script reads named fields only and ignores `hAr`; the toggle round trip and the render checks confirm it. 7 tests: a reworded title, text or label fails; whitespace alone does not; stamping clears it; Arabic with no `hAr` fails; `merge` stamps; an unknown id is refused. |
| Minor 1, output cut at 8192 bytes | `process.exitCode` in place of `process.exit`. A test captures `extract` from a child process, checks it is longer than 8192 bytes and parses all of it; another checks exit 0 and exit 1 still come through. |
| Minor 4, `:has()` in a selector list | Split into two rules, so the last-column heading keeps its alignment on a browser without `:has()`. |
| Minor 5, `inset` | Line 272 is not on `main`: it is the language button's outline, added on this branch. Rewritten as `top: 7px; right: 0; bottom: 7px; left: 0`. The 380px comparison below shows the button unchanged. |
| Minor 2, toggling mid-page moves the reader | On a tap of the button only: before the swap the script notes the first keyed element that starts below the bar's row and its distance from the top; after the swap and the repaint it scrolls, with `scroll-behavior` set to `auto` for that one call, so the element is there again. It does it once more when `document.fonts.ready` resolves, unless the reader has scrolled or tapped again, because a face that lands late moves the text a second time (seen: 142px). Nothing happens on first load or at the very top. The bar is measured by its row, since with the bell or the menu open the bar as a whole reaches far down the screen (that was the first version's bug, caught by the test). `tools/shot.mjs` now asserts it beside the toggle-twice check, in both languages, with `overflow-anchor: none` injected for the test, the bell open, at `s4.progress.title`, `s7.phones.title` and `contacts.campus`: before the fix the reader moved 72 to 914px, now 0px in all twelve toggles. |
| Re-review nit, `results.sub` | The no-break space is in. At 380px the line now breaks before المتقدمين للاختبارات, which stay together (seen in `ar-380-04.png`). |
| Minor 6, rule 5 ignores other attributes | Rule 5 now also fails an Arabic tag carrying an attribute its English tag does not have, and a direction span or `<bdi>` carrying anything but `dir`. 2 tests. The live page passes unchanged. |
| Minor 11, CLI test runs on the real page | The command line takes `I18N_PAGE`; the CLI tests run on a copy in a temp folder and assert it is not written to. |
| Item 9, documents | `CLAUDE.md` ("English and Arabic move together") and `README.md` ("Arabic", the timetable recipe and "Recording a change") now describe the notice hash and state the gap that the four mentor lists and the class pills are skipped whole. The spec's rules 3 and 5 say the same. |

### Left, with the reason

| Finding | Reason |
|---|---|
| Re-review, `s3.boards.share1` | No change, by instruction: A-Level is what "advanced level study" means here. It stays listed as English source issue 12. |
| Minor 3, Cairo downloaded by English readers | Not acted on, by instruction. |
| Minor 7, text inside mentor lists and pills escapes rule 9 | Accepted by the review; now documented as a known gap. Keying each row would put staff names into the dictionary for no gain. |
| Minor 8, a script error before the last line now stops the updates painting in English | Would mean a second first-paint path for the updates. No such error exists, and a change there is a risk to the English page, which this wave must not take. |
| Minor 9, the bell's English `aria-label` captured with a count in it | Harmless: `refresh()` rewrites it after every swap, as the markup comment says. |
| Minor 10, no `lang="en"` on Latin names in Arabic mode | Needs a screen reader on a real phone to judge; it touches some forty elements of the English markup. Left for the owner. |
| Minor 12, no tests for `check.mjs` rules 9 to 11 | Test coverage only; outside this wave. |
| Minor 13, two commits without the co-author line | Not acted on, by instruction. |
| Minor 14, the 1.5 second cover on a slow connection | Accepted by design. |

### Verification

`node --test tools/i18n.test.mjs`

```
# tests 105
# suites 0
# pass 105
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

`node tools/check.mjs`

```
ok   14 internal anchors resolve
ok   26 asset links exist
ok   10 update entries are well formed
ok   11 class timetables match their filenames
ok   English and Arabic are in step
ok   15 script strings have their English

all checks passed
```

`bash tools/render-check.sh` (the four "screenshot written" lines left out)

```
ok   countdown is hidden
ok   no thank-you message shown
ok   updates strip present
ok   bell button not hidden
ok   bell list rendered
ok   change log rendered
ok   change log section not hidden
ok   change log nav not hidden
ok   English page is left to right
ok   language button not hidden
ok   English page marked ready
ok   Arabic page is right to left
ok   Arabic hero title
ok   Arabic cover lifted by applyLang
ok   Arabic page is not left hidden
ok   Arabic bell list rendered
ok   Arabic dates rendered
ok   no English month in an Arabic date

-- mobile viewport check, English (tools/shot.mjs) --
ok   page: measured scrollWidth=380 clientWidth=380 innerWidth=380
ok   page: no horizontal overflow at 380px width
ok   bell open: measured scrollWidth=380 clientWidth=380 innerWidth=380
ok   bell open: no horizontal overflow at 380px width
ok   language switched en to ar and back, page restored exactly
ok   switching language at s4.progress.title kept the place, within 0px
ok   switching language at s7.phones.title kept the place, within 0px
ok   switching language at contacts.campus kept the place, within 0px

-- mobile viewport check, Arabic (tools/shot.mjs --lang=ar) --
ok   page: measured scrollWidth=380 clientWidth=380 innerWidth=380
ok   page: no horizontal overflow at 380px width
ok   the page opened right to left from ?lang=ar
ok   bell open: measured scrollWidth=380 clientWidth=380 innerWidth=380
ok   bell open: no horizontal overflow at 380px width
ok   language switched ar to en and back, page restored exactly
ok   switching language at s4.progress.title kept the place, within 0px
ok   switching language at s7.phones.title kept the place, within 0px
ok   switching language at contacts.campus kept the place, within 0px

all render checks passed
```

`node tools/i18n.mjs pairs`, then `check`

```
wrote docs/arabic/translation-review.html and translation-review.md
ok   367 strings have Arabic in step with their English
```

The two review files came out byte-identical to the committed ones: the only
string that changed gained a no-break space, which the review shows as a space.

**English at 380px against `main`**, same method as section 6, captured again
after every change in this wave:

```
36 pairs, 33 identical
DIFF en380-01.png (430, 26, 548, 86)
DIFF en380-bell.png (430, 26, 548, 86)
DIFF en380-menu.png (430, 26, 548, 86)
```

Only the language button differs.

**Screens refreshed** in `docs/arabic/screens/` (untracked, 63 files): the same
62 as before, plus `ar-320-01.png`, the top of the page at 320px, where the
brand sits on one line beside the button. No overflow at 320, 380 or 800px.
Looked at after this wave: `ar-320-01.png`, `ar-380-04.png` (the results line
and the button's outline) and `ar-380-10.png` (table headings over their
figures).

Still not checked: a real iPhone. The keep-place fix was verified in Chrome
with scroll anchoring switched off, which is the iOS condition, but not on iOS
itself.

### Files changed in this wave

`index.html`, `tools/i18n.mjs`, `tools/i18n.test.mjs`, `tools/shot.mjs`,
`CLAUDE.md`, `README.md`,
`docs/superpowers/specs/2026-09-30-arabic-language-design.md`, this report.
