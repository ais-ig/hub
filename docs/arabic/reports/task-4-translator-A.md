# Task 4 report · translator A

Batch A: Start here, shared labels, class timetables, IGCSE results, the IG
pathway, subject options, subject names.

## Counts

- Keys translated: 120 of 120 in `.superpowers/arabic/en-A.json`. None
  missing, none extra.
- Output: `.superpowers/arabic/ar-A.json`.
- Validation: `node .superpowers/arabic/validate-A.mjs`, which applies
  `mergeAr` in memory and runs `checkAll`. `index.html` was not written.
  - Rule 5 (tags): 0 failures.
  - Rule 7 (forbidden characters): 0 failures.
  - Rule 6 (numbers): 17 failures, all left on purpose. Every one is a grade
    number that the glossary requires as a word (`الصف التاسع`, not `الصف 9`).
    These keys need `"nums": false` when merged:
    `common.grade9`, `common.grade10`, `common.grade11`, `common.grade12`,
    `start.g9.t`, `start.g10.t`, `s2.sub`, `s2.lead`, `s2.step1.g`,
    `s2.step2.g`, `s2.step3.g`, `s3.short`, `s3.g9.compulsory.note`,
    `s3.g10.compulsory.note`, `s3.hifdh.p1`, `s3.hifdh.p2` (Grade 1,
    `الصف الأول`), `s3.form.li3`.
  - In those 17 strings no other digit is present in the English, so setting
    `nums: false` hides nothing else. I checked each by eye.

## Term list

Terms that recur and are not in the glossary.

| English | Arabic |
|---|---|
| Class timetables (plural, as the menu) | الجداول الدراسية |
| class (9A, a boy's class) | الفصل |
| all classes | جميع الفصول |
| in effect from | يُعمل بها اعتباراً من |
| issued (date) | صدر في |
| the evening (of 9 September) | اللقاء الذي أقيم مساء … |
| Parent Guide | دليل أولياء الأمور |
| Presentation | العرض التقديمي |
| slides | شرائح العرض |
| Open the form | فتح النموذج |
| staff | منسوبو (القسم) |
| staff contacts | بيانات التواصل |
| grade (an exam result: 9, A*) | التقدير |
| top grades | أعلى التقديرات |
| mark, marks | الدرجة، الدرجات |
| full marks | الدرجة الكاملة |
| subject results | نتيجة مادة |
| exam board | هيئة الاختبارات / الهيئة |
| examination, exam | الاختبار |
| external examinations | الاختبارات الخارجية |
| exam hall | قاعة الاختبار |
| programme | البرنامج |
| syllabus | المقرر الدراسي |
| curriculum | المنهج |
| MoE | وزارة التعليم |
| compulsory subjects | المواد الإلزامية |
| optional subjects | المواد الاختيارية |
| periods per week | عدد الحصص في الأسبوع |
| Choose one | اختاروا واحدة |
| or | أو |
| pair (of subjects) | مادتان (من كل مادتين) |
| to tick | وضع علامة |
| tick box | خانة |
| row (of a table) | السطر (never الصف, which is the grade) |
| Table A, B, C | الجدول A، B، C |
| paper (exam paper) | الورقة |
| session (exam session) | الدورة |
| Modular | نظام الوحدات |
| calculator | الآلة الحاسبة |
| qualification | المؤهل |
| equivalent | ما يعادله |
| deadline | الموعد النهائي |
| print and sign | للطباعة والتوقيع |
| In short | باختصار |
| Students (label) | الطلاب |
| Mathematics | الرياضيات |
| Arabic | اللغة العربية |
| English | اللغة الإنجليزية |
| Social Studies | الدراسات الاجتماعية |
| PE | التربية البدنية |
| Physics, Chemistry, Biology | الفيزياء، الكيمياء، الأحياء |
| Business Studies | دراسات الأعمال |
| Accounting | المحاسبة |
| Computer Science | علوم الحاسب |
| ICT | تقنية المعلومات والاتصالات |
| critical thinking, creativity, collaboration | التفكير الناقد، الإبداع، التعاون |
| Academic Year 2026-2027 (written that way in the English) | العام الدراسي `<span dir="ltr">2026-2027</span>` |

Two distinctions the other batches should hold to:

- **التقدير against الدرجة.** A grade awarded by an exam board (9, A*) is
  تقدير. A mark that is added up (200 marks, how marks are built) is درجة.
  The reviewed hero already uses الدرجات for "marks".
- **الفصل is the class, الصف is the grade, السطر is a table row.** الفصل
  الدراسي is still the semester, by the glossary. Context keeps them apart in
  my batch; batch B (assessment) should watch for a sentence holding both.

## Unsure

1. `common.grade9` to `common.grade12`, and every "Grade 9" in a sentence.
   Arabic: `الصف التاسع` and so on, as the glossary rules. Alternative:
   `الصف 9`. The word form fails rule 6 on 17 keys and needs `nums: false`.
   The glossary itself writes `الصفوف من 9 إلى 12` with digits, so digits and
   words now sit side by side in `#schedule` (sub line in digits, group
   labels in words).
2. `schedule.pill.*` (aria-label). English "Grade 9A class timetable".
   Arabic `الجدول الدراسي للفصل 9A`. Alternative `الجدول الدراسي للصف التاسع،
   الفصل A`. I kept the class name whole, as the parent sees it on the pill.
   How an Arabic screen reader voices "9A" was not tested.
3. `start.guide.d` and `start.deck.d`. English "the evening of 9 September
   2026". Arabic `اللقاء الذي أقيم مساء 9 سبتمبر 2026`. Alternative `أمسية 9
   سبتمبر 2026`. I named it as the meeting, following the reviewed countdown
   strings, which render "the evening" as اللقاء. It adds the noun "meeting"
   that the English leaves unsaid.
4. `start.guide.d`. "staff contacts" became `بيانات التواصل مع منسوبي القسم
   البريطاني`. Alternative `أرقام التواصل مع موظفي القسم`. منسوبو is the usual
   Saudi institutional word; the school may prefer الكادر or الموظفين.
5. `start.sub`. "the full library" became `قائمة المستندات الكاملة`, to agree
   with the section name جميع المستندات. Alternative `المكتبة الكاملة`.
6. `start.g9.t`, `start.g10.t`. Arabic `نموذج اختيار مواد IGCSE للصف التاسع`.
   The glossary term is `نموذج اختيار المواد`; placing IGCSE forced `مواد`
   without the article. Batch C has the same title under `doc.g9options.t`
   and must match this wording exactly. Alternative `نموذج اختيار المواد
   (IGCSE) · الصف التاسع`.
7. `start.options.d`, `s3.form.sb`. English writes "Academic Year 2026-2027".
   I kept `2026-2027` inside `<span dir="ltr">` so both years survive rule 6.
   The glossary form is `2026/27`. It is a name, not a range, so I did not
   write من … إلى.
8. `schedule.note`. "break from 9:25 to 9:55" has no AM in English; I added
   `صباحاً` once after 9:55 to match the spec's time format. "with break"
   became `وتتخللها الفسحة`.
9. `results.title`. English "IGCSE results 2025/26". Arabic `نتائج IGCSE
   للعام 2025/26`. Alternative with `للعام الدراسي`, or the bare year.
10. `results.sub`. "718 subject results from 192 candidates" became `718
    نتيجة مادة حققها 192 من الطلاب المتقدمين`. The glossary term for
    candidates reads a little heavy here; `192 طالباً` would be lighter.
    "all boards combined" became `لجميع هيئات الاختبارات مجتمعة`.
11. `results.stat1` to `results.stat4`. Each follows a large figure in its
    own span, so each is a phrase, not a sentence. "grades" is التقديرات.
    A Saudi parent may expect الدرجات for 9 to 1; I kept الدرجات for marks.
    `results.stat4` follows the figure 6: `مواد كانت نتائجها 100% بالتقديرات
    من 9 إلى 4`. Check it reads well under the big "6".
12. `results.students`. "24 with five or more top grades" became `24 طالباً
    نالوا أعلى التقديرات في خمس مواد أو أكثر`. I turned "five top grades" into
    "top grades in five subjects", which is what it means. "top grades" is
    not defined in this string; the stat tile above defines it as 9, 8 or A*.
    "Edexcel IGCSE Mathematics" became `مادة الرياضيات في Edexcel IGCSE`.
13. `s2.title`. "Two years, one programme" became `عامان وبرنامج واحد`. The
    menu item for this section is `مسار IG لابنكم`; the two differ in English
    too.
14. `s2.step1.p`. "the two-year syllabus" became `المقرر الدراسي الممتد على
    عامين`. Alternative `المنهج`. I kept المنهج for "curriculum" in the tables.
15. `s2.step3.h`. "A-Levels and beyond" became `A-Level وما بعده`, singular
    Latin form per the spec's list.
16. `s2.step2.p`. "that matter beyond the exam hall" became `وهي مهارات
    تتجاوز أهميتها قاعة الاختبار`.
17. `s3.cur.moe`. "MoE" became `وزارة التعليم`. It sits in a narrow table
    column ten times. Alternative `الوزارة` if the column is tight at 380px.
18. `subj.social`. English "Social Studies (KSAH)". Arabic `الدراسات
    الاجتماعية (Social Studies, KSAH)`. I do not know what KSAH stands for
    (probably Saudi history) and left it in Latin. The school's Arabic name
    for the subject may be `الاجتماعيات` or `الدراسات الاجتماعية والمواطنة`.
19. `subj.islamic`. Glossary `الدراسات الإسلامية`. Note only: the Ministry's
    own name is the same, so no doubt, but see 20.
20. `subj.arabic`. `اللغة العربية (Arabic)`. The same key serves the MoE
    Arabic (1 period, compulsory) and the IGCSE Arabic (3 periods, optional).
    The English has the same ambiguity; nothing was added.
21. `subj.business`. `دراسات الأعمال`. Alternative `إدارة الأعمال`, which is
    commoner in Saudi schools but is not what the IGCSE subject is called.
22. `subj.cs`, `subj.ict`. `علوم الحاسب` and `تقنية المعلومات والاتصالات`,
    Saudi usage. Alternatives `علوم الحاسوب`, `تكنولوجيا المعلومات`.
23. `subj.pe`. `التربية البدنية (PE)`. The Ministry now says `التربية البدنية
    والدفاع عن النفس`; I kept the plain form.
24. `s3.g9.maths.*`, `s3.g10.maths.*`. English "Mathematics (Cambridge)" and
    "Maths Cambridge". Arabic `الرياضيات<br>(Cambridge Mathematics)` and
    `الرياضيات (Maths Cambridge)`, so that the bracket holds the English name
    as the subject rule asks. Alternative `الرياضيات<br>(Cambridge)`, shorter
    and closer to the English. The Grade 10 chips are narrow; check the wrap.
25. Ruling 6 of Task 3 stands: the bracketed English shows in the choice
    pairs and the chips as well as the two tables. The chips become long
    (`تقنية المعلومات والاتصالات (ICT)` beside its number). The owner may want
    Arabic alone there.
26. `s3.g9.optional.intro`, `s3.form.li2`. "pair" became `من كل مادتين` and
    `معروضة مادتين مادتين لتختاروا إحداهما`. Alternative `زوج` / `أزواج`,
    which is literal but reads oddly of school subjects. "Tick one subject in
    each row" uses `سطر` for row, because `صف` is the grade.
27. `s3.choose`. `اختاروا واحدة` (feminine, for مادة). 
28. `s3.short`. "Grade 9 only: the optional Hifdh Programme" became `للصف
    التاسع فقط: برنامج تحفيظ القرآن الكريم، وهو اختياري`. "a Maths board"
    became `هيئة اختبار الرياضيات`.
29. `s3.hifdh.p1`. "ticked separately" became `توضع له علامة في خانة مستقلة`.
    "adds nothing to the week" became `فلا يضيف أي حصة إلى الأسبوع`, which
    names the unit the English leaves implied.
30. `s3.hifdh.p2`. "runs from Grade 1 and carries no entry conditions" became
    `قائم من الصف الأول، وليست له شروط قبول`. "Grade 1" is a word here.
31. `s3.boards.title`. `الرياضيات: Cambridge أو Edexcel`. 
32. `s3.boards.intro`. "timing" became `التوقيت`, left as bare as the English.
    It means when the papers are sat.
33. `s3.boards.share1`. "advanced level study" became `الدراسة في المستوى
    المتقدم`. If the deck means A-Level specifically, it should read
    `لدراسة A-Level`.
34. `s3.boards.share2`. The English has no subject ("Designed by subject
    experts"). I supplied `مناهج`: `مناهج أعدّها خبراء في المادة`. The thing
    designed could equally be the qualification.
35. `s3.boards.cam1`, `edx1`. "session" became `الدورة`. Alternative `دورة
    الاختبارات` in full, or `الجلسة`, which would wrongly suggest one sitting.
36. `s3.boards.edx1`. "Modular." became `نظام الوحدات.` Alternative `نظام
    مرحلي`. Neither is an established parent-facing term; the sentence after
    it explains it.
37. `s3.boards.edx2`. "Paper 1H and Paper 2H" became `الورقة 1H والورقة 2H`,
    codes in `<span dir="ltr">`. Alternative: keep "Paper 1H" wholly in Latin.
38. `s3.equiv.title`, `s3.equiv.th.*`. `ما يعادل تقديرات Edexcel`, `تقدير
    IGCSE`, `ما يعادله`.
39. `s3.equiv.note`. Percentages are words in English and words in Arabic
    (`أربعون في المئة`, `ستون في المئة`). "target" became `تستهدف`.
40. `s3.form.li1` to `li3`. "Table A" became `الجدول A`, keeping the letter
    printed on the English form.
41. `s3.form.li4`. "the week comes to 40 periods" became `يكون مجموع الأسبوع
    40 حصة`.
42. `s3.form.li5`. "return it by the deadline printed on it" became `أعيدوه
    قبل انتهاء الموعد النهائي المطبوع عليه`. The bold run is the deadline
    phrase, as in English.
43. `schedule.stamp`. "issued" became `صدر في`.

## Glossary friction

- **Grade 9 as `الصف التاسع`** against `الصفوف من 9 إلى 12`. Both are
  glossary forms, and they meet in one section. It also costs 17 `nums:
  false` exemptions in this batch alone. Not wrong, but the owner should
  know the number check is switched off for those keys.
- **`الطلاب المتقدمون` for Candidates** is heavy in `results.sub`, where it is
  declined as `من الطلاب المتقدمين`. It could also be misread as "advanced
  students". `الطلاب المتقدمون للاختبار` is unambiguous but longer.
- **`فتح الملف` for Open PDF** drops the word PDF. Fine in context; the
  `بالإنجليزية` tag sits beside it.
- **`نموذج اختيار المواد`** cannot take "IGCSE" without changing shape (see
  Unsure 6).
- **`الفصل`** is the class (from `رائد الفصل`) while `الفصل الدراسي` is the
  semester. No clash inside batch A.
- **`حصة الريادة` for Homeroom** reads naturally in `schedule.note`; the
  glossary already flags it for the school's own wording.
- **`خارج الصف`, `مع من تتواصلون`** do not occur in this batch.
