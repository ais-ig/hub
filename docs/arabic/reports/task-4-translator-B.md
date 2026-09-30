# Task 4 · Translator B

Batch B: document library (`doc.*`), Assessment (`s4.*`), Support and homeroom
mentors (`s5.*`), Beyond the books (`s6.*`).

## Counts

- Keys in `en-B.json`: 102. Keys in `ar-B.json`: 102. Missing 0, extra 0.
- Validation: `node .superpowers/arabic/validate-B.mjs` applies `mergeAr` in
  memory and runs `checkAll`. `index.html` was not written.
- Rule 5 (tags): 0 failures. Rule 7 (forbidden characters): 0 failures.
- Rule 6 (numbers): 12 failures, all left on purpose. Each is an ordinal that
  is a digit in English and a word in Arabic. These keys need `"nums": false`
  at merge time.

| Key | English | Arabic | Why a word |
|---|---|---|---|
| `doc.g9options.t`, `doc.weekly9.t`, `s6.allyear` | Grade 9 | الصف التاسع | Glossary form |
| `doc.g10options.t`, `doc.weekly10.t` | Grade 10 | الصف العاشر | Glossary form |
| `doc.g11options.t` | Grade 11 | الصف الحادي عشر | Glossary form |
| `doc.g12options.t` | Grade 12 | الصف الثاني عشر | Glossary form |
| `s4.th.q1`, `s4.th.q2` | Quarter 1, Quarter 2 | الربع الأول، الربع الثاني | My choice, see Unsure 1 |
| `s4.sem1.note` | Quarters 3 and 4 | الربعين الثالث والرابع | My choice, see Unsure 1 |
| `doc.letter.sb`, `doc.weekly.sb` | Semester 1 | الفصل الدراسي الأول | My choice, see Unsure 1 |

Every weight, mark, percentage, date and page count written in digits is kept
in the same digits (60%, 27 سبتمبر 2026, 11 صفحة, 31 صفحة, 3 صفحات, 9 إلى 12).
The marks in the assessment table (6, 4, 10, 20, 30, 50%) sit in unkeyed cells
and are untouched.

## Term list

Terms not in the glossary, as used throughout this batch.

| English | Arabic |
|---|---|
| marks | الدرجات |
| How marks are built | طريقة احتساب الدرجات (matches `hero.desc`) |
| Summative assessment | التقييم الختامي |
| Formative assessment | التقييم التكويني |
| Assessment breakdown | توزيع درجات التقييم |
| Quarter 1, 2, 3, 4 | الربع الأول، الثاني، الثالث، الرابع |
| Semester One, first semester, Semester 1 | الفصل الدراسي الأول |
| Semester Two, second semester | الفصل الدراسي الثاني |
| term (as in "during the term") | الفصل الدراسي |
| Quarter total | مجموع الربع |
| per cent (in words) | في المئة |
| Reports | التقارير |
| overall score | الدرجة الكلية |
| intervention | التدخل |
| intervention plan / support plan | خطة تدخل / خطة دعم |
| Mock exams | الاختبارات التجريبية |
| summer session | دورة الصيف |
| Student Academic Progress Sheet | سجل التقدم الأكاديمي للطالب |
| Progress sheets | سجلات التقدم |
| Homeroom Mentorship Programme, Mentorship Programme | برنامج رائد الفصل |
| class (9A, 10B) | الفصل |
| classroom | الصف |
| well-being | الراحة النفسية |
| one-to-one sessions | جلسات فردية |
| Academic calendar | التقويم الدراسي |
| Parent Calendar | تقويم أولياء الأمور |
| Parent Assessment Guide | دليل التقييم لأولياء الأمور |
| Parent Guide (Meet & Greet) | دليل أولياء الأمور للقاء التعريفي |
| Presentation (deck) | العرض التقديمي |
| Daily Schedule | جدول اليوم الدراسي |
| Summer (schedule) | التوقيت الصيفي |
| Options forms (heading) | نماذج اختيار المواد |
| Guides and links | أدلة وروابط |
| weekly plans | الخطط الأسبوعية |
| letter to parents | خطاب المدرسة إلى أولياء الأمور |
| staff | منسوبو المدرسة |
| pages | صفحة / صفحات |
| Activities | الأنشطة |
| Student leadership | القيادة الطلابية |
| Community service | خدمة المجتمع |
| Off-site | خارج المدرسة |
| careers | المجالات المهنية |
| Qur'an Memorisation | تحفيظ القرآن الكريم |
| All year | على مدار العام |
| In short | باختصار |
| English, Biology, Chemistry, Physics, Mathematics, Arabic | اللغة الإنجليزية، الأحياء، الكيمياء، الفيزياء، الرياضيات، اللغة العربية |

Bidi choices: `2026/27`, `2026/2027` and `A-Levels` are wrapped in
`<span dir="ltr">`. `A-Levels` is wrapped in `doc.alevel.sb` so that
`PDF · A-Levels ·` does not fuse into one left-to-right run.

## Unsure

1. **`s4.th.q1`, `s4.th.q2`, `s4.sem1.note`, `doc.letter.sb`, `doc.weekly.sb`**.
   English "Quarter 1", "Quarters 3 and 4", "Semester 1". Arabic: الربع الأول,
   الربعين الثالث والرابع, الفصل الدراسي الأول. Alternative: الربع 1, الفصل
   الدراسي 1, which passes rule 6 unaided. I judged the ordinal word to be what a
   school writes, and it agrees with the glossary's الصف التاسع. It costs five
   `"nums": false` exemptions.
2. **`doc.options.sb`, `doc.alevel.sb`**. English "Academic Year 2026-2027".
   Arabic: العام الدراسي `2026/2027` in an LTR span. The English uses a hyphen;
   I used a slash because of the no-dash rule for ranges and to sit close to the
   glossary's 2026/27, while keeping both four-digit years for rule 6.
   Alternative: `2026-2027` inside the LTR span, or the glossary's `2026/27`
   with `nums: false`.
3. **`s4.guide.t`**. "British stream" → المسار البريطاني. Alternative: القسم
   البريطاني. The glossary reserves المسار for "Pathway"; "stream" is the
   external guide's own word and may simply mean the British Section.
4. **`s4.lead`, `s4.sem1.note`**. "worth fifty per cent of the year", "make the
   year" → من درجة العام, يكوّنان درجة العام. I added درجة ("the year's mark")
   because Arabic needs a noun there. It adds no fact, but it is an addition.
5. **`s4.progress.li2`**. "a results and support plan" → خطة النتائج والدعم.
   The English is ambiguous between one document (a "results and support plan")
   and two things (results, and a support plan). I read it as one document.
   Alternative: النتائج وخطة الدعم.
6. **`s4.progress.li3`**. "triggers the intervention" → بدأ التدخل الموضّح في
   قسم الدعم, built as a conditional (إذا كانت ... بدأ). Same rule, same
   threshold, different sentence shape. "overall score" → الدرجة الكلية;
   alternative المجموع الكلي.
7. **`s4.progress.title`**. "How progress reaches you" → كيف نطلعكم على تقدّم
   ابنكم. I named ابنكم, which the English leaves implied.
8. **`s5.early.p`**. "a named intervention plan" → خطة تدخل باسمه (a plan in
   the student's own name). "Named" could instead mean a plan with a named
   member of staff responsible. Alternative: خطة تدخل محددة. Also "picked up
   during the term" → نرصده خلال الفصل الدراسي; "term" and "semester" are both
   الفصل الدراسي here, which I believe is what the school means.
9. **`s5.mock.p`**. "the summer session" → دورة الصيف, meaning the May/June
   exam series. Alternative: دورة اختبارات مايو ويونيو, clearer but adds months
   the English does not state.
10. **`s5.sheets.h`, `s5.sheets.p`**. "Student Academic Progress Sheet" → سجل
    التقدم الأكاديمي للطالب. Alternatives: استمارة or كشف متابعة. The school may
    have its own Arabic name for this sheet.
11. **`s5.mentor.intro`, `s5.mentor.li1`, `s5.mentor.li2`**. "well-being" →
    راحته النفسية; "emotional and social well-being" → راحته النفسية
    والاجتماعية; "group well-being" → أحوال الطلاب عامةً. Alternatives: الصحة
    النفسية, جودة الحياة, الرفاه. None is a settled school term, and the group
    use is rendered more loosely than the other two.
12. **`s5.mentor.li1`**. "shared concerns" → ما يشغلهم من أمور مشتركة.
    Alternative: الملاحظات المشتركة.
13. **`s5.mentors.note`**. "anything academic or pastoral" → كل ما يتعلق
    بدراسته أو برعايته وشؤونه في المدرسة. "Pastoral" has no single Arabic
    school word. Alternatives: الجانب التربوي, الإرشاد الطلابي. The second
    risks pointing parents at the counsellor rather than the mentor.
14. **`s5.mentor.title`, `s6.allyear`**. "Homeroom Mentorship Programme" and
    "the Mentorship Programme" → برنامج رائد الفصل, built from the glossary's
    رائد الفصل. Alternatives: برنامج الريادة, برنامج الإرشاد الطلابي.
15. **`s5.title`**. "How we keep track of your child" → كيف نتابع ابنكم.
    Straightforward, flagged only because it is a section heading.
16. **`s6.sub`**. "Building a profile" → بناء ملف الطالب. Alternative: بناء
    السيرة الذاتية, narrower than the English.
17. **`s6.lead`**. "a first interview" → أول مقابلة شخصية. مقابلة شخصية is the
    Saudi term for an admissions or job interview.
18. **`s6.offer.li3`**. "Industry trips" → زيارات ميدانية صناعية; "Almarai" →
    المراعي (the company's Arabic name); MACTECH left in Latin because I do not
    know its Arabic name. Alternative heading: رحلات إلى قطاع الصناعة والأعمال.
19. **`s6.offer.li4`**. "Giving time locally, as a standing expectation" → بذل
    الوقت في خدمة المجتمع المحلي، وهو أمر ننتظره من طلابنا دائماً. Alternative:
    التطوع في المجتمع المحلي. I avoided التطوع because "expectation" suggests it
    is not purely voluntary.
20. **`s6.sem1.li1`**. "IGCSE distinctions" → درجات الامتياز في IGCSE. If
    "distinction" is a specific award (for example a Cambridge or Pearson
    outstanding learner award), the Arabic should name it.
21. **`s6.sem1.li2`**. "Pakistan International School" → المدرسة الباكستانية
    العالمية. This is the name I believe the Riyadh school uses in Arabic; not
    verified.
22. **`s6.sem1.li4`, `s6.sem1.li5`, `s6.sem1.li6`**. Event names: Global Health
    Exhibition → ملتقى الصحة العالمي and Cityscape Global → سيتي سكيب العالمي
    (the events' own Arabic names, from memory, not verified). Black Hat MEA
    left in Latin; alternative بلاك هات الشرق الأوسط وأفريقيا. "careers" →
    المجالات المهنية.
23. **`s6.sem1.li7`**. "Dodgeball" → كرة المراوغة. Students may know it as
    دودج بول.
24. **`s6.sem2.li1`**. "Desert Trip. Remah Camp" → رحلة برية. مخيم رماح. I
    assumed Remah is رماح, the area north-east of Riyadh. Verify the spelling.
25. **`s6.sem2.li3`**. "AIS Chess Tournament" → بطولة مدارس الرواد للشطرنج. AIS
    expanded to the school's Arabic name, as `js.title` does. Alternative: بطولة
    AIS للشطرنج.
26. **`s6.sem2.li5`**, **`s6.sem2.li6`**. SPARK and STEM kept in Latin as
    proper names. "Student business ideas" → أفكار مشاريع تجارية يقدّمها
    الطلاب. Alternative for STEM Fair: معرض العلوم والتقنية والهندسة
    والرياضيات, too long for a list label.
27. **`s6.sem2.li7`**. "Fun Day" → اليوم الترفيهي. Alternative: اليوم المفتوح,
    common in Saudi schools but not quite the same event.
28. **`s6.allyear`**. "Grade 9 Prayer Assembly Competition" → مسابقة ملتقى
    الصلاة للصف التاسع. **Least confident item in the batch.** I do not know
    what this competition is. If it is the short talk students give after
    prayer, مسابقة كلمة الصلاة may be right. The owner should supply the
    school's name for it. "Qur'an Memorisation" → تحفيظ القرآن الكريم, the same
    words as the glossary's Hifdh Programme without برنامج.
29. **`doc.commitment.t`, `doc.commitment.sb`**. "Phone Policy Commitment
    Form" → نموذج التعهد بسياسة الهواتف; "signed when a phone is collected" →
    يُوقَّع عند استلام الهاتف. "Collected" means the parent collecting a
    confiscated phone; استلام carries that, but could be read as the school
    taking the phone. Alternative: يُوقَّع عند استلام ولي الأمر للهاتف, which
    adds words the English lacks. This file is bilingual or Arabic (no
    `data-pdf-en`), so its real Arabic title should replace mine if it differs.
30. **`doc.letter.t`**. "Curriculum and Classroom Expectations" → المنهج
    الدراسي والتوقعات الصفية. The letter is issued in Arabic and English, so it
    has an Arabic title of its own that I have not seen. Use that title.
31. **`doc.daily.t`, `doc.daily.sb`**. "Daily Schedule" → جدول اليوم الدراسي,
    to keep it apart from الجدول الدراسي (class timetable). Alternative: الجدول
    اليومي. "Summer" → التوقيت الصيفي. Alternative: الصيفي alone.
32. **`doc.guide.sb`**. "teachers by class, staff contacts" → المعلمون حسب
    الفصل، وبيانات التواصل مع منسوبي المدرسة. منسوبو المدرسة is Saudi usage for
    staff; alternative الكادر الإداري.
33. **`doc.pathway.t`**. "The British Curriculum Pathway" → مسار المنهج
    البريطاني. Batch A may have a wording for the pathway section this should
    match.
34. **`doc.weekly9.t`, `doc.weekly10.t`**. "IG weekly plans" → الخطط الأسبوعية
    لمواد IG. "IG" kept as in the reviewed `menu.pathway`. I added مواد.
35. **`doc.deck.sb`**. "the slides from 9 September 2026" → شرائح العرض في 9
    سبتمبر 2026.
36. **`doc.timetables.sb`**. "in effect from" → سارية من. Alternative: يُعمل
    بها من.
37. **`s4.sub`**. "quarter by quarter" → ربعاً بعد ربع. Alternative: لكل ربع.

## Glossary friction

- **Homeroom mentor = رائد الفصل.** Reads naturally in Saudi usage and I had no
  trouble with it in `s5.*`. The possessive in `s5.mentors.title`, رائد فصل
  ابنكم, is correct but a little heavy as a heading.
- **Homeroom = حصة الريادة.** Used in `s5.mentor.li1` and `doc.daily.sb`. It
  works, but الريادة now appears on the page in two senses: homeroom (حصة
  الريادة) and entrepreneurship (ريادة الأعمال in `s6.sem2.li5`). A parent will
  not confuse them, but a reviewer should know it is deliberate.
- **الفصل carries three meanings.** الفصل الدراسي is the semester, اختبار منتصف
  الفصل is the Mid-Term Test, and رائد الفصل makes الفصل the class. In
  `s5.mentor.li1`, "لقاءات أسبوعية مع الفصل" means the class while the same list
  speaks of الفصل الدراسي two items later. I wrote الفصل الدراسي in full every
  time it means semester or term and kept bare الفصل for the class only.
- **Beyond the books = خارج الصف.** Fine as a heading. Note that several
  activities listed under it are described as "off-site", which I rendered
  خارج المدرسة, so the two phrases sit close together.
- **Mid-Term Test = اختبار منتصف الفصل.** The school runs one in each quarter
  (10 marks in Quarter 1 and 10 in Quarter 2), so "mid-semester" is not
  literally true of the Arabic name any more than of the English one. No change
  proposed; the English has the same oddity.
- **Grade N in words** forces a `"nums": false` on every string that names a
  single grade, seven in this batch.
