# Accuracy review · Tests and exams

Branch `exams`, commit 7425d2e, `git diff main..exams`. Reviewed 10 October 2026.
Read only: nothing but this file was written.

**Summary: 17 findings. 1 must-fix, 6 should-fix, 10 nits.** Every date, day
name, subject and bell time on the page matches the sources. The must-fix is
about the documentation: it says something about `newUntil` that the code does
not do. The should-fixes are an Arabic house rule broken in four strings, one
English sentence that is true but misleading, two facts whose only source is
the portal, glossary entries that were never added, and two README
instructions for the next round that would go wrong.

## Findings

### 1. must-fix · `newUntil` cannot extend the New window, so both values do nothing

- **Where:** `index.html`, `updatesData` entries `2026-10-10-midterm`
  (`"newUntil": "2026-10-28"`) and `2026-10-10-holiday`
  (`"newUntil": "2026-10-25"`). The claim appears in the `#exams` HTML comment
  ("The window appears here, in the hero button's data-until and in the
  notices' newUntil: move them together"), in README "Updating the exam
  schedule" ("four places that move together ... the `newUntil` of the two
  notices"; step 3 "Add one notice ... with `newUntil` on the last test day"),
  and in the CLAUDE.md fifth-coupling paragraph.
- **What is wrong:** the renderer computes
  `isNew: age >= 0 && age <= NEW_DAYS && (!until || today <= until)` with
  `NEW_DAYS = 14` (index.html around line 3319). `newUntil` can only shorten
  the 14-day window, as the comment above `updatesData` and CLAUDE.md's
  architecture bullet both say ("ends that window early"). Both notices are
  dated 2026-10-10, so both stop being New after **Saturday 24 October**,
  whatever `newUntil` says. The midterm notice drops out of the strip and the
  bell count before the tests resume on 27 and 28 October. The holiday
  notice's `2026-10-25` is one day past the cap, so it also does nothing.
- **Source:** the code itself.
- **Suggested fix:** decide what is wanted. (a) If 24 October is acceptable,
  keep the values but correct the HTML comment, the README paragraph, step 3
  and the CLAUDE.md coupling: `newUntil` only ends the window early, and a
  round longer than 14 days from the notice date needs a second, later notice
  (for example a "Mid-Term Tests resume on Tuesday 27 October" notice dated
  the day it goes live). The window then sits in the subtitle, the lead, the
  hero `data-until` and the notice title and text, not in `newUntil`. (b) If
  the notice should stay New until 28 October, that is a code change to
  the renderer and to `check.mjs`, outside this review. Either way, the
  midterm notice's own `title` and `text` state the window ("18 to 28
  October"), so they belong in the list of places that move together. The
  README list leaves them out.

### 2. should-fix · Arabic grades listed together are written as words, against the spec's rule

- **Where:** `i18nAr`, keys `exams.g910.h`, `exams.g1112.h`, `exams.lead`,
  `exams.bell.p`.
- **What is wrong:** the Arabic writing rules
  (`docs/superpowers/specs/2026-09-30-arabic-language-design.md`) say: "Two or
  more grades listed together, or a range, take digits: الصفين 9 و10 ... If
  one string holds any such list, every grade in that string is written in
  digits." The page already follows this: `s2.lead` has الصفان 9 و10 and
  الصف 9, and `s2.step3.g` has الصفان 11 و12. The new strings use ordinal
  words.
- **Suggested fix (exact Arabic):**
  - `exams.g910.h`: `الصفان 9 و10`
  - `exams.g1112.h`: `الصفان 11 و12، المسار العلمي`
  - `exams.lead`: change `وفي الصفين التاسع والعاشر` to `وفي الصفين 9 و10`.
    For the full string, which also takes finding 10, see finding 10.
  - `exams.bell.p`: change `وللصف التاسع جدول` to `وللصف 9 جدول`, because
    the same string holds the range من 10 إلى 12. For the full replacement,
    see finding 3.

### 3. should-fix · "periods 1 and 2 are shorter" is true but misleading: every period is shorter

- **Where:** `index.html`, `exams.bell.p` (English and Arabic).
- **What is wrong:** the Daily Schedule (`assets/daily-schedule-summer-2026-27.pdf`)
  has 40-minute periods: 06:45 to 07:25, 07:25 to 08:05, and so on. On the
  Zero Period bell, **all eight** periods are 35 minutes, in both tables. As
  written, a parent will read that only periods 1 and 2 are cut. The sentence
  also says "their break falls at different times". Only the first break
  differs (8:55 to 9:15 against 10:05 to 10:25). The 12:10 to 12:30 break is
  the same in both tables.
- **Source:** the bell sheet, both tables (every period is 35 minutes), and
  the Daily Schedule (40 minutes).
- **Suggested fix, English:** `On a day with a test, the school day follows
  the Zero Period bell below instead of the usual timetable: every period is
  35 minutes instead of 40, the test fills Zero Period, and lessons carry on
  afterwards until 1:05 PM. Grade 9 has one table and Grades 10 to 12
  another, because their morning break falls at different times. On a day
  without a test, the usual timetable runs.`
- **Arabic (exact; it also takes findings 2 and 8):**
  `في يوم الاختبار يسير اليوم الدراسي وفق جدول الحصة الصفرية أدناه بدلاً من الجدول الدراسي المعتاد: تصبح مدة كل حصة 35 دقيقة بدلاً من 40، ويشغل الاختبار الحصة الصفرية، ثم تستمر الدراسة بعده حتى 1:05 ظهراً. وللصف 9 جدول، وللصفوف من 10 إلى 12 جدول آخر، لأن موعد الفسحة الأولى يختلف بينهما. وفي الأيام التي لا اختبار فيها يُعمل بالجدول الدراسي المعتاد.`
  Then run `node tools/i18n.mjs stamp exams.bell.p`.

### 4. should-fix · Two facts come only from the portal, which the docs call "a cross-check, not a source"

- **Where:** `exams.lead` ("students should be in their seats by 7:50 AM")
  and `exams.bell.note` ("Phones, electronic devices and smartwatches are not
  allowed in the test room").
- **What is wrong:** neither fact is in the two schedule sheets, the bell
  sheet, the calendar, or what the Head of Section confirmed. Both come from
  the portal's rules box: "Students must be seated in their designated
  examination rooms by 7:50 AM" and "Electronic devices and smartwatches are
  strictly prohibited in the exam hall". The new CLAUDE.md row says the
  portal "is a cross-check, not a source", and neither LOG.md nor README
  records where these two lines came from. "Phones" is the page's own
  addition. It is reasonable, since phones are electronic devices and the
  phone policy already applies, but nothing states it for the test room.
- **Suggested fix:** confirm both rules with the Head of Section, or name
  the portal's rules box as their source in the CLAUDE.md row and in LOG.md.
  Without one of those, the next person to update the round cannot tell
  where they came from.

### 5. should-fix · New Arabic terms were not added to the glossary

- **Where:** the glossary in
  `docs/superpowers/specs/2026-09-30-arabic-language-design.md`, which this
  diff does not touch. CLAUDE.md says the glossary "is the authority for
  terms ... change a term there first". LOG.md D8 says "Both are new to the
  glossary", but neither was added.
- **What is missing:** Zero Period = الحصة الصفرية; holiday = إجازة; Tests
  and exams = الاختبارات; Science stream = المسار العلمي; test day = يوم
  الاختبار; test room = قاعة الاختبار; smartwatches = الساعات الذكية.
- **Opinion on the two flagged terms:**
  - **الحصة الصفرية** is right. It is the term Saudi schools and Ministry
    circulars use, it is a direct match for the school's own English, and
    a parent who knows the English sheet will connect the two. It reads
    oddly that a "zero" period sits between periods 2 and 3, but that is the
    school's naming, not the translation's. Optional: on its first mention
    in `exams.lead`, write `الحصة الصفرية (Zero Period)`, so an Arabic
    reader can match it to the English sheet and WhatsApp message. That
    bracket would need `<span dir="ltr">` because it is two words.
  - **إجازة** is right and natural. It is standard Saudi usage (إجازة رسمية,
    إجازة نهاية الأسبوع). Nothing better exists. عطلة is understood but less
    usual in Saudi school notices.
- **Suggested fix:** add these rows to the glossary table in the same commit.

### 6. should-fix · The README "between rounds" step leaves a cross-reference pointing at a bell that has been removed

- **Where:** README "Updating the exam schedule", last paragraph. LOG.md D10.
  `index.html`, `schedule.exams`.
- **What is wrong:** D10 makes the line under the `#schedule` note
  permanent ("Permanent, not retired after the round"). It says that on a
  test day "the school day follows the Zero Period bell instead. See Tests
  and exams". The README's between-rounds step says "the tables and the bell
  come out". After that, `schedule.exams` points to a section with no bell,
  and it would make a claim about a different round, such as the Semester 1
  exams, that no source supports.
- **Suggested fix:** in the README between-rounds paragraph, add: "and take
  out the `schedule.exams` line under the timetable note, with its Arabic, or
  reword it for the next round once its bell is known". Then change D10 to
  "kept for as long as a round with a Zero Period bell is on the page".

### 7. should-fix · The README's suggested "next round" subtitle is wrong for Grades 11 and 12 and uses a term the page does not use

- **Where:** README, between-rounds paragraph: `"Next: Semester One
  Examinations, from Tuesday 29 December 2026"`.
- **What is wrong:** 29 December 2026 is a Tuesday, which is right. But the
  parents' calendar gives that date for "Grade 9IG and 10IG" only. Grades 11AS
  and 12A2 have "Semester 1 Exams (Mock Exams)" in weeks 15 and 16, from
  Sunday 29 November 2026, a month earlier. The section's subtitle covers
  Grades 9 to 12, so the suggested line would misdate the next round for
  Grades 11 and 12. The page's term for that assessment is also "Final
  Examination" (`s4.final`, glossary الاختبار النهائي), not "Semester One
  Examinations".
- **Suggested fix:** replace the example with "Next: Grades 11 and 12 mock
  examinations from Sunday 29 November 2026; Grades 9 and 10 Final
  Examinations from Tuesday 29 December 2026", or tell the editor to take
  each grade group's next round from the calendar separately.

### 8. nit · Arabic `exams.bell.p` uses a bare الجدول for the class timetable, and its last clause is stiff

- **Where:** `exams.bell.p` (Arabic).
- **What is wrong:** the glossary gives الجدول الدراسي for the class
  timetable and keeps bare الجدول for Table A, B, C of a form. The string has
  `بدلاً من الجدول المعتاد` and `يسير الجدول المعتاد`. Also, `في اليوم الذي
  فيه اختبار` and `يسير الجدول` are understood but read as translated.
  `في يوم الاختبار` and `يُعمل بالجدول` are what a Saudi school notice would
  say, and `schedule.sub` already uses يُعمل بها.
- **Suggested fix:** the full replacement in finding 3 covers this.

### 9. nit · Arabic `schedule.exams` reads as translated

- **Where:** `schedule.exams` (Arabic).
- **Suggested fix (exact):**
  `وفي يوم الاختبار يسير اليوم الدراسي وفق جدول الحصة الصفرية بدلاً من ذلك. انظروا قسم <a href="#exams">الاختبارات</a>.`
  The tags and `href` are unchanged. Then run `stamp schedule.exams`.

### 10. nit · Arabic `exams.lead`: "يحمل 10 درجات" is a calque of "carries 10 marks"

- **Where:** `exams.lead` (Arabic).
- **Suggested fix (exact; it also takes finding 2):**
  `تُعقد اختبارات منتصف الفصل الدراسي الأول من الأحد 18 أكتوبر إلى الأربعاء 28 أكتوبر 2026. ويُجرى كل اختبار في الحصة الصفرية من 7:55 إلى 8:55 صباحاً، وعلى الطلاب أن يكونوا في مقاعدهم بحلول 7:50 صباحاً. وتشمل الاختبارات مواد IGCSE و A-Level. وفي الصفين 9 و10، كل اختبار منها هو اختبار منتصف الفصل الذي تُخصَّص له 10 درجات من درجات الربع الأول، كما هو مبيّن في <a href="#s4">طريقة احتساب الدرجات</a>.`

### 11. nit · "Zero Period, the test" and الحصة الصفرية، الاختبار read as two items in a list

- **Where:** `exams.l.zero`, English and Arabic.
- **What is wrong:** the comma makes "the test" look like a second item.
  The portal writes "Zero Period (Test)".
- **Suggested fix:** English `Zero Period (test)`. Arabic
  `الحصة الصفرية (الاختبار)`. If the English stays as it is, the Arabic alone
  can still become `الحصة الصفرية: وقت الاختبار`.

### 12. nit · CLAUDE.md fifth coupling: wrong attribution, and one coupling that does not exist

- **Where:** CLAUDE.md, the "fifth coupling" paragraph.
- **What is wrong:** (a) It says the Zero Period rule was "confirmed by the
  user on 10 October 2026". README and the CLAUDE.md sources row give the
  Head of Section as the source for the 10 October facts, and LOG.md item 5
  names Mr. Farhan. Use one attribution. (b) It says the bell tables and the
  `schedule.exams` line "are a pair: a new bell sheet changes both". The
  cross-reference has no times in it, so a new bell sheet does not change
  it. What does change it is a round with no Zero Period bell (finding 6).
- **Suggested fix:** "confirmed by the Head of Section on 10 October 2026",
  and "a round without a Zero Period bell removes or rewords the
  `schedule.exams` line".

### 13. nit · LOG.md D12 describes the cream and white swap wrongly

- **Where:** `docs/exams/LOG.md`, D12: "The sections between the new one and
  the next emblem band had their cream and white swapped".
- **What the code does:** five sections were swapped: `#results` (alt to
  plain), then, past the first emblem band, `#s2` (to alt), `#s3` (to plain),
  `#s4` (to alt) and `#s5` (to plain). The swap runs to the **second**
  band. As a result `#s5` and `#s6` are now both white on either side of
  that band. On `main`, the sections just after each band were both white
  (`#s2`, `#s6`), so if a band resets the alternation, swapping `#results`
  alone was enough. The change is cosmetic, but the LOG should say what
  was done.
- **Suggested fix:** reword D12 to name the five sections, or limit the swap
  to `#results`.

### 14. nit · The Zero Period row borrows the group-heading style, so the most important time is the smallest text in the table

- **Where:** `index.html`, both bell tables, `<tr class="grp">` on the Zero
  Period row. CSS `table.data tr.grp td` (around line 879).
- **What is wrong:** `tr.grp` was written for colspan group headings. It sets
  10px, uppercase and tracked, so in English the row prints "ZERO PERIOD, THE
  TEST" and "7:55 – 8:55 AM" at 10px against 13px everywhere else. No doc
  mentions this use. In Arabic it is 12px, untracked, with no visible
  uppercase effect, so the Arabic is fine.
- **Suggested fix:** a dedicated class (for example `tr.zero td { background:
  var(--gold-tint-2); font-weight: 700; color: var(--navy-deep); }`), or
  accept and note it.

### 15. nit · The test-day bell has no Salah row; the usual day does

- **Where:** `#exams` bell tables, compared with the `#schedule` note.
- **What is noted:** the Daily Schedule ends with Salah 12:35 to 1:05. The
  bell sheet has a second 20-minute break, 12:10 to 12:30, and no Salah row.
  The page copies the sheet faithfully and claims nothing about Salah, so
  nothing is wrong. A parent who compares the two may still ask. Worth one
  question to the school: is the 12:10 break the Salah break on test days?

### 16. nit · The lead drops two details the calendar gives

- **Where:** `exams.lead`, "The tests cover the IGCSE and A-Level subjects."
- **Source:** the parents' calendar, week 9 (Sunday 18/10/2026): "Mid-Term 1
  Test G9-12 · Material Covered weeks 1-7 for IGCSE and A Levels subjects
  only".
- **What is noted:** the sentence is faithful to the calendar, and LOG item
  6 shows the omission of the Ministry quizzes is deliberate. It does leave
  out "weeks 1 to 7", the most useful thing a parent can know when helping
  with revision. Optional: `The tests cover the IGCSE and A-Level subjects
  only, and the material taught in weeks 1 to 7.` Its Arabic: `وتقتصر
  الاختبارات على مواد IGCSE و A-Level، وتشمل ما دُرِّس من الأسبوع 1 إلى
  الأسبوع 7.`

### 17. nit · README's list of places that state the window is incomplete

- **Where:** README, "The window is stated in four places".
- **What is wrong:** apart from finding 1, the window is also in the
  midterm notice's `title` ("18 to 28 October") and `text`, and in the hero
  comment ("Wednesday 28 October 2026"). A notice that is live can be
  reworded but not re-dated, so the README should say these change only
  with a new notice.

## Verified correct

**Sources read:** both schedule PDFs (`pdftotext -layout`; created in Word
2010, one page each, matching CLAUDE.md's "one Word page each"); the bell
sheet docx (both tables, extracted row by row); the parents' calendar; the
portal's `const S` and `const BELL` data and its rules text; the Daily
Schedule.

**A. Facts**
- Day of the week for every date, checked with Python: Sun 18, Mon 19, Tue
  20, Wed 21, Thu 22, Sun 25, Mon 26, Tue 27, Wed 28 October 2026 are all
  correct. 29 December 2026 is a Tuesday.
- Grades 9 and 10 table against the sheet, row by row: Biology, English,
  Chemistry, ICT / CS (page: Computer Science or ICT), Physics, Math (page:
  Mathematics), Arabic / Accounting (page: Arabic or Accounting). Same days,
  same order. It matches the portal's `g910uk` rows.
- Grades 11 and 12 Science table against the sheet: Biology / CS (page:
  Biology or Computer Science), English, Chemistry, Arabic, Physics, Math. It
  matches the portal's `sci` rows. Correctly, there is no 28 October row.
- The rows are the authority, and the window follows them: Grades 9 and 10
  end Wed 28, Grades 11 and 12 end Tue 27. The sheets' headings (26 and 25
  October) are, as known, two days short. The subtitle, the lead, the
  notice, the hero `data-until="2026-10-28T23:59:00+03:00"` and the HTML
  comment all say 28 October.
- The holiday (Sun 25) and buffer day (Mon 26) rows and notice agree with
  the Head of Section's confirmation. "Lessons resume on Monday 26 October as
  usual, with no test that day" is right.
- Test time 7:55 to 8:55 AM in the lead and the notice matches all three
  sources.
- Grade 9 bell against the sheet's Grades 4-9 table, all 12 rows, minute
  for minute: correct. The Grades 10 to 12 bell against the sheet's Grades
  10-12 table, all 12 rows: correct. Assembly is written Homeroom, as
  documented. The portal's note "Grade 9 follows Grades 4–9; Grade 10
  follows Grades 10–12" agrees with the assignment.
- Every Arabic time cell (15 keys `exams.t.*`) gives the same times as its
  English, with من … إلى …, صباحاً and ظهراً correct, including `من 11:35
  صباحاً إلى 12:10 ظهراً`.
- "10 marks of Quarter 1" agrees with `#s4` (Mid-Term Test, Quarter 1, 10).
  The calendar's "End of Quarter - I" in week 10 confirms these tests belong
  to Quarter 1.
- "Mid-Term Tests run from 18 to 28 October" in the notice title, the hero
  label and the cross-reference all agree with the section.
- Grades 11 and 12 streams: the portal also lists a Grades 11–12 UK Art
  stream. LOG D5 records that the boys roster has the Science stream only,
  so the page is right not to carry it. The calendar's week 8 row also says
  "Mid-Term 1 Test G9-12". The schedule sheets supersede it, and the page
  follows them.

**B. Arabic**
- The Arabic of every new string, both notices included, carries the same
  facts and numbers as its English, with nothing added or dropped (apart
  from the grade-digit form in finding 2).
- Modern Standard Arabic throughout, with the respectful plural (انظروا،
  تجدون).
- No السنة for a grade. Ranges use من … إلى … throughout. Western digits
  only. No em dash, Arabic-Indic digit or tatweel (also enforced by the
  check).
- Glossary terms used exactly: حصة الريادة، الفسحة، اختبار منتصف الفصل،
  الفصل الدراسي الأول، الربع الأول، الصف التاسع، الصفوف من 9 إلى 12،
  السياسات، الجوالات، الحصة.
- Subject cells reuse the existing `subj.*` keys and carry their English in
  brackets, as the options tables do. Two-word brackets, `(Computer
  Science)`, are wrapped in `<span dir="ltr">`, matching `subj.cs`.
- Latin runs: `مواد IGCSE و A-Level.` resolves correctly in a right-to-left
  paragraph, because the strong و separates the two Latin runs. The notices
  contain no Latin.
- `docs/arabic/translation-review.md` and `.html` are fresh: regenerating
  them in a scratch copy gave byte-identical files.

**C. English rules**
- No em dash in `index.html`, README.md, CLAUDE.md or LOG.md. En dashes are
  used only in the time ranges in the bell tables, which is allowed.
- No "Year" for a grade, and no "tonight".
- "Semester One" and "Mid-Term Test(s)" match `#s4` (`s4.sem1.title`,
  `s4.midterm`). The page's older "Semester 1" (documents band) and "first
  semester" (`#s6`) were already inconsistent before this change.
- The notices follow the existing notices' style, with no sign-off, as none
  of the existing notices has one.

**D. Documentation against the code**
- These keys exist and are used as described: `exams.*`, `subj.maths`,
  `menu.exams`, `hero.cta.exams` and `schedule.exams`.
- The menu entry sits after Class timetables, matching the section order.
- The `tr.off` class is on the four holiday and buffer rows, styled muted
  and weight 400.
- `table.data.plain` (four tables) keeps `td.s` on one line.
- The RTL rule `html[dir="rtl"] table.data.plain thead th:last-child {
  text-align: right; }` sits in the override block and outranks the general
  last-column rule. The `:has()` rule does not match the plain tables.
- `.bells` goes to two columns at 720px, as its comment says.
- The countdown stays off: there is no `data-doors` or `data-end`.
- Both notices are dated 2026-10-10 (today, not in the future), with
  `titleAr`, `textAr`, `labelAr` and `hAr`.
- The CLAUDE.md sources row's dates (26 and 25 October against 28 and 27)
  are right.
- LOG D2, D3, D4, D6, D7, D9, D10 and D11 match the code (D10 and D12 apart,
  as noted).

**E. Checks**
- `node tools/check.mjs`: all checks passed, exit 0. It reports 15 internal
  anchors, 26 asset links, 13 update entries, 11 class timetables, and
  English and Arabic in step.
- `node --test tools/i18n.test.mjs`: 105 tests, 105 passed, 0 failed.
- The browser checks were not run, as instructed.
