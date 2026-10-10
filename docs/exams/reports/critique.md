# Critique · Tests and exams (`#exams`), branch `exams` at 7425d2e

10 October 2026. I read the page as a parent and as an editor, checked it against the sources and looked at every screenshot. I edited nothing except this file.

## Summary

The section is in good shape. It follows the house pattern: title, grey subtitle, gold bar, cards, `table.data`. It uses only the brand tokens and Poppins 400, 500 and 700. The bell tables stack at 380px and sit side by side at 800px, and the right-to-left layout is correct in both screenshots: headings and cells start at the right and the header row lines up with its cells. A parent of a Grade 9 boy can find his test days in well under a minute: hero button, then the first table.

He cannot find out when his son arrives and leaves. The one time the lead gives, "in their seats by 7:50 AM", reads like an arrival time and contradicts the bell table. The bell paragraph says only Periods 1 and 2 get shorter, but every period does. The section also leaves out the one rule a parent has to act on, the Sihati note for a make-up test. That rule comes from the section's own Q1 schedule sheet. The README recipe has two contradictions, and the glossary was not updated with the new terms. The Arabic is sound and uses the respectful plural throughout, but four strings read as translations.

Checked and fine: no em dashes in the diff, no new colours or weights, the commit has no attribution line, and `translation-review.*` was regenerated.

Every rewrite below that changes English needs `node tools/i18n.mjs stamp <key>` after its Arabic is changed. A notice needs `stamp updates.<id>`. A new key needs `merge`.

## Points

### 1. Must-fix · `exams.lead` · when to arrive and leave is missing, and "7:50" misleads

The lead names three times: 7:55, 8:55 and 7:50. It never says the day starts at 6:30 as usual. A parent who reads "students should be in their seats by 7:50 AM" can reasonably drop his son at 7:45. The sentence also contradicts the bell table, where Period 2 runs to 7:55. It comes from the IT portal's student rules, so it belongs to the student, not the parent. The sentence "The tests cover the IGCSE and A-Level subjects" is also wrong; see point 5.

Replace with:

> The Semester One Mid-Term Tests run from Sunday 18 to Wednesday 28 October 2026. Each test is from 7:55 to 8:55 AM, after Periods 1 and 2, so the school day still starts at 6:30 AM and ends at 1:05 PM. In Grades 9 and 10, each test is worth 10 of the 20 marks for Quarter 1; see <a href="#s4">How marks are built</a>.

> تُعقد اختبارات منتصف الفصل الدراسي الأول من الأحد 18 إلى الأربعاء 28 أكتوبر 2026. ويُجرى كل اختبار من 7:55 إلى 8:55 صباحاً بعد الحصتين الأولى والثانية، ولذلك يبدأ اليوم الدراسي في 6:30 صباحاً وينتهي في 1:05 ظهراً كالمعتاد. وفي الصفين التاسع والعاشر، يُحتسب كل اختبار من 10 درجات من أصل 20 درجة للربع الأول، كما هو مبيّن في <a href="#s4">طريقة احتساب الدرجات</a>.

The Arabic rewrite also removes the stray "و" in the current Arabic, which ends a line on its own before "A-Level" at 380px.

### 2. Must-fix · `exams.bell.p` · "periods 1 and 2 are shorter" is wrong

In the Daily Schedule every period is 40 minutes. On the Zero Period bell every period, 1 to 8, is 35 minutes in both tables. A parent reading this would think only the first two lessons change. The paragraph is also the stiffest sentence in the section.

> On a test day every period is 35 minutes instead of 40, to make room for the hour-long test after Period 2. The day still starts at 6:30 AM and ends at 1:05 PM. Grade 9 takes its first break at a different time from Grades 10 to 12, so each has its own table below. On a day without a test, the usual timetable runs.

> في يوم الاختبار تكون مدة كل حصة 35 دقيقة بدلاً من 40، ليتسع اليوم للاختبار الذي يستغرق ساعة بعد الحصة الثانية. ويبدأ اليوم الدراسي في 6:30 صباحاً وينتهي في 1:05 ظهراً كالمعتاد. وتختلف الفسحة الأولى للصف التاسع في موعدها عن الصفوف من 10 إلى 12، ولذلك لكل منهما جدول أدناه. وفي الأيام التي لا اختبار فيها، يُطبَّق الجدول المعتاد.

### 3. Must-fix · whole section · the make-up rule is missing

`~/Downloads/Midterm_Test_Schedule_Quarter_1_2026-2027_-_British_Section_(Boys).docx` is the section's own sheet, addressed to students. Its "Important Information" says: "In case of absence from any mid-term test, bring a sick leave note from Sihati within 3 days in order to sit for the make-up test." Of everything a parent might do during test weeks, this is the one with a deadline and a consequence. The page says nothing about it, and `#s7` covers only MyAIS absence requests.

First confirm with Mr. Farhan that the rule applies to this round. Then add a keyed `<p class="small">`, `exams.absence`, under the Grades 11 and 12 card:

> If your son misses a test through illness, he can sit a make-up test once he brings a sick note from Sihati, within 3 days of the test.

> وإذا تغيّب ابنكم عن اختبار بسبب المرض، يمكنه أداء الاختبار التعويضي بعد إحضار تقرير إجازة مرضية من تطبيق صحتي خلال 3 أيام من موعد الاختبار.

### 4. Must-fix · `docs/superpowers/specs/2026-09-30-arabic-language-design.md`, Glossary · new terms are not in it

LOG D8 says الحصة الصفرية and إجازة are "new to the glossary", but the branch does not touch the spec. CLAUDE.md makes the glossary the authority and says to change a term there first, under a "never violate" heading. Add these rows:

| English | Arabic |
|---|---|
| Tests and exams (section), Test | الاختبارات، اختبار |
| Zero Period | الحصة الصفرية |
| Holiday | إجازة |
| Test room | قاعة الاختبار |
| Science stream | المسار العلمي |
| Make-up test (if point 3 is taken) | الاختبار التعويضي |

### 5. Should-fix · `exams.lead` · "The tests cover the IGCSE and A-Level subjects" is inaccurate and leaves things out

This challenges your decision 6, with a new argument. The same Q1 sheet lists Grade 12's Monday test as "English MoE", so not every test in the window is IGCSE or A-Level. The sheet also says: "Quran (all grades) and Arabic MoE (grades 9IG and 10IG) tests will take place in weeks 9 and 10 in their respective classes." These are tests in the same two weeks, not quizzes. A Grade 9 parent told that the tests "cover the IGCSE and A-Level subjects" will be surprised by a Quran test. Point 1 already removes the sentence. If the school is content for parents to know, add:

> Quran tests for every grade, and Arabic (Ministry of Education) tests for Grades 9 and 10, are held in class during the same two weeks.

> وتُعقد اختبارات القرآن الكريم لجميع الصفوف، واختبارات اللغة العربية (وزارة التعليم) للصفين التاسع والعاشر، داخل الفصول خلال الأسبوعين نفسيهما.

If the school would rather not say this, simply removing the inaccurate sentence is enough.

### 6. Should-fix · the Zero Period row in both bell tables · the most important row is in the smallest type

The row reuses `tr.grp`, which is a group-header style: 10px, uppercase and tracked. In English the row shows as "ZERO PERIOD, THE TEST" in the smallest text in the section, and it reads like a heading rather than a row. The label "Zero Period, the test" is also awkward in both languages.

- Label `exams.l.zero`: **Test (Zero Period)** / **الاختبار (الحصة الصفرية)**.
- Style: replace `class="grp"` with `class="test"` and add one rule beside the other "tests and exams" rules: `table.data tr.test td { background: var(--gold-tint-2); font-weight: 700; color: var(--navy-deep); }`. This keeps the existing gold-tint highlight, as in `tr.semtot`, at normal size. It has no left or right, so it needs no RTL mirror.

### 7. Should-fix · Arabic that reads translated

The respectful plural is right everywhere. These four strings read as translations:

- `schedule.exams`: "وفي اليوم الذي فيه اختبار، يسير اليوم الدراسي ... بدلاً من ذلك. انظروا الاختبارات." Rewrite to match how the page already cross-refers ("في قسم الدعم"):
  > أما في أيام الاختبارات فيُطبَّق جدول الحصة الصفرية، وتجدونه في قسم <a href="#exams">الاختبارات</a>.
- `exams.bell.note`: "انظروا السياسات" is the same calque. See point 10 for the full rewrite, which ends "وللمزيد راجعوا قسم <a href="#s7">السياسات</a>."
- `exams.bell.h`: "اليوم الدراسي في يوم الاختبار" repeats اليوم. Use **اليوم الدراسي في أيام الاختبارات**. The English is unchanged, so no stamp is needed.
- `exams.lead`: "كل اختبار منها هو اختبار منتصف الفصل الذي يحمل 10 درجات" is a word-for-word rendering of "carries 10 marks". It is fixed in point 1.

### 8. Should-fix · notice `2026-10-10-midterm` · too long for the strip, and it leads with jargon

On a phone the text runs to five lines. It opens with "Zero Period", which means nothing to a parent and comes after Period 2. It ends "are on the page", which is vague. The Arabic puts two من…إلى ranges back to back. The title is good. The notice should say the one thing a parent needs, which is the time and that the day is otherwise normal.

- text: **For Grades 9 to 12, each test is from 7:55 to 8:55 AM. The school day still starts at 6:30 AM and ends at 1:05 PM.**
- textAr: **لطلاب الصفوف من 9 إلى 12، يُجرى كل اختبار من 7:55 إلى 8:55 صباحاً. ويبقى اليوم الدراسي من 6:30 صباحاً إلى 1:05 ظهراً كالمعتاد.**

The holiday notice is the right length and says one thing. One optional tightening, because "resume" suggests a longer break:

- text: **Sunday 25 October is a holiday. Monday 26 October is a normal school day with no test, and the Mid-Term Tests continue on Tuesday 27 October.**
- textAr: **يوم الأحد 25 أكتوبر إجازة. ويوم الاثنين 26 أكتوبر يوم دراسي عادي بلا اختبار، وتستمر اختبارات منتصف الفصل يوم الثلاثاء 27 أكتوبر.**

### 9. Should-fix · README "Updating the exam schedule" · three problems a maintainer would hit

a. **`newUntil` cannot extend the New window.** The script computes `isNew = age <= 14 && today <= newUntil`. Both notices are dated 10 October, so their New window ends on 24 October whatever `newUntil` says. The values 2026-10-28 and 2026-10-25 do nothing. The tests notice leaves the strip before the last three test days, while the hero button stays up until 28 October. That outcome is acceptable, but step 3 ("newUntil on the last test day") reads as if `newUntil` keeps a notice new. Reword step 3 to: "Set `newUntil` to the last test day. It only ever shortens the 14-day New window, so a notice dated more than 14 days before the last test drops out of the strip early; if that matters, post a reminder notice nearer the time."

b. **The "between rounds" paragraph contradicts D10.** It says "the tables and the bell come out". But `schedule.exams`, which LOG D10 makes permanent, would then send parents to a Zero Period bell that is not there. Pick one. Either the line is part of the swap and is removed and restored with the bell, which needs a note in the recipe and in CLAUDE.md's fifth coupling. Or the between-rounds state keeps the bell card. The first is simpler.

c. **Orphan keys.** Step 1 says to add new `exams.d.*` keys. When a round is swapped, the old date keys leave the page, and `check.mjs` fails on an Arabic entry that has no key on the page. Add to step 1: "Delete from `i18nAr` every `exams.*` entry whose key is no longer on the page; the check names them."

Apart from these, the recipe is followable, and its length suits a job done twice a semester. The first paragraph repeats the CLAUDE.md sources row and could be cut to its first two sentences.

### 10. Nit · `exams.bell.note` · the useful part is buried

Phones are already banned all day under `#s7`, so the new information here is smartwatches. The school's own sheet adds stationery and blue pen, which is useful to a parent the night before a test.

> Students bring their own stationery and answer in blue pen. No phone, smartwatch or other electronic device is allowed in the test room; see <a href="#s7">Policies</a>.

> يُحضر الطلاب أدواتهم الكتابية الخاصة، ويكتبون إجاباتهم بالقلم الأزرق. ولا يُسمح بالجوال ولا بالساعة الذكية ولا بأي جهاز إلكتروني آخر في قاعة الاختبار، وللمزيد راجعوا قسم <a href="#s7">السياسات</a>.

### 11. Nit · Grades 11 and 12 table · it stops on 27 October while the subtitle and notice say "Grades 9 to 12 ... to 28 October"

A Grade 11 parent may wonder about Wednesday. Add a muted last row: `<tr class="off"><td class="s" data-i18n="exams.d.1028">Wednesday 28 October</td><td data-i18n="exams.s.notest">No test, lessons as usual</td></tr>`. Both keys already exist, so this needs no new Arabic.

### 12. Nit · `tr.off` contrast · the holiday is the surprise, and it is the faintest row

`--muted` (#8A8375) on white is about 3.8:1, under the 4.5:1 AA level for text this size. Use `table.data tr.off td, table.data tr.off td.s { color: var(--ink-soft); }` (#666, about 5.7:1). Keep weight 400 so the rows still read as "nothing to sit".

### 13. Nit · D7, the Grade 9 bell · lower risk than the log suggests

The IT portal's bell panel says, in so many words, "Grade 9 follows Grades 4–9; Grade 10 follows Grades 10–12". So the split is the school's own statement, not an inference. It is still worth Mr. Farhan's yes. CLAUDE.md's fifth coupling could cite that sentence as the source.

### 14. Gate before pushing · the holiday

The LOG already makes this a condition. I agree, and repeat it because it is the only point here that cannot be fixed after the push. Do not push until the school's own message about Sunday 25 October has gone out, or Mr. Farhan says the hub may carry it first. The hub is the parents' reference copy, not the place to announce. If the push slips past 10 October, re-date both notices to the push day, per CLAUDE.md. Because of point 9a, re-dating also moves their New window later, which helps.
