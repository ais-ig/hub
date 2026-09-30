# Task 4 · Translator C

Batch C: policies (`s7.*`), the "All documents" heading (`s8.*`), the change log
heading, "Ask a question", contacts, footer, and the ten update notices.

## Counts

- Keys in `en-C.json`: 93. Keys translated in `ar-C.json`: 93. None missing, none extra.
- Validation: `node .superpowers/arabic/validate-C.mjs` applies `mergeAr` in
  memory and runs `checkAll`. `index.html` was not written.
  - Rule 5 (tags): 0 failures on my keys.
  - Rule 7 (forbidden characters): 0.
  - Rule 8 (update notices): 0. No `updates.*` value contains a tag.
  - Rule 6 (numbers): 1 failure, left on purpose: `s7.phones.week1`
    ("1 week" → `أسبوع واحد`). It needs `"nums": false` at merge time. See Unsure 1.
  - The other 222 failures in the run are rule 1 "missing" for batches A and B,
    which are not merged in my in-memory run.

## Term list

Recurring terms not in the glossary, as used throughout this batch.

| English | Arabic chosen |
|---|---|
| class (9A, a boy's class) | الفصل (فصل ابنكم) |
| grade and class | الصف والفصل |
| lesson (in the online-week notice) | الحصة |
| online (lessons) | عن بُعد |
| timetables (heading, plural) | الجداول الدراسية |
| See the timetables | عرض الجداول الدراسية |
| revised (timetable) | عُدِّل / المعدّلة |
| takes effect / took effect | يبدأ العمل به / بدأ العمل به |
| tap | اضغطوا على |
| the page | الصفحة |
| the hub (short for Parent Hub) | البوابة |
| went live | انطلاق / انطلقت |
| form | النموذج |
| email (noun) | البريد الإلكتروني |
| attendance | الحضور |
| absence | الغياب |
| early dismissal | الانصراف المبكر |
| dismissal (contact card) | الانصراف |
| confiscated phone / phone held | الهاتف المحجوز / حجز الهاتف |
| confiscation period | مدة الحجز |
| incident (phone table), violation | المخالفة |
| lockers | الخزائن |
| parent or guardian | أحد الوالدين أو ولي الأمر |
| parents (as the party called in or contacted) | ولي الأمر |
| families | الأسر |
| Level A / B / C | المستوى A / B / C |
| Response: | الإجراء: |
| counsellor, Student Counsellor | المرشد الطلابي |
| referral | إحالة |
| behavioural contract | عقد سلوكي |
| safeguarding log | سجل حماية الطلاب |
| suspension | الإيقاف عن الدراسة |
| alternative placement | النقل إلى بيئة تعليمية بديلة |
| Head of School | مدير المدرسة |
| Deputy Head (of School) | نائب مدير المدرسة |
| Student Affairs | شؤون الطلاب |
| Activity Supervisor | مشرف النشاط |
| Floor Supervisor | مشرف الدور |
| First / Second floor | الدور الأول / الدور الثاني |
| ext. | تحويلة |
| section team | فريق القسم |
| Everything in one place | كل شيء في مكان واحد |
| What's changed this year | سجل التحديثات لهذا العام |
| Back to top | العودة إلى الأعلى |
| Representative (Student Council) | ممثل الصف |
| Vice President (Student Council) | نائب الرئيس |
| seat | مقعد |
| apply (Student Council) | الترشح (from the glossary's الترشح لمجلس الطلاب) |
| WhatsApp | واتساب |
| Riyadh | الرياض |

## Unsure

1. `s7.phones.week1` · "1 week" · `أسبوع واحد`. Alternative: `7 أيام` (changes
   the number) or `1 أسبوع` (not Arabic anyone writes). The word form is right;
   rule 6 objects, so the entry needs `"nums": false`.
2. `updates.2026-09-27-online-week.text` · "Periods 1 to 3 today run as normal
   too." · `والحصص من 1 إلى 3 اليوم تُقام كالمعتاد أيضاً.` The English is
   ambiguous: it can mean the first three periods today are in school as usual,
   or that they also run online at their usual times. I kept the same
   ambiguity rather than choose. The owner should say which it is; the Arabic
   reader will ask the same question.
3. Same key · "he signs in with his S number" · `ويسجّل الدخول برقم S الخاص به`.
   Alternative: `برقمه الطلابي (S)`. I do not know what the school calls this
   number in Arabic.
4. Same key · "your son's class folders on Schoology" ·
   `مجلدات فصل ابنكم على Schoology`. If "class" here means each subject's course
   on Schoology rather than his form class, it should be `مجلدات مواد ابنكم`.
5. Same key · "lessons" · I used `الحصص` in the body and `الدراسة عن بُعد` in
   the title ("lessons are online this week"), which is the phrase Saudi
   parents know from Ministry announcements. Literal alternative for the
   title: `الحصص عن بُعد هذا الأسبوع`.
6. Same key · "email a.bakr@ais.sch.sa" ·
   `فراسلوا العنوان a.bakr@ais.sch.sa بالبريد الإلكتروني`. Reworded so the
   address sits mid-sentence and the full stop does not attach to a Latin run
   in plain text. No meaning added.
7. `contacts.head.cs`, `ask.note`, `s7.lvl.b.a` · "Head of School" ·
   `مدير المدرسة`. Alternatives: `مدير القسم البريطاني`, `رئيس القسم`. He
   heads the British Section, not the whole of Al-Rowad, so a parent may take
   `مدير المدرسة` to mean someone else. The school's own Arabic title should
   decide.
8. `contacts.deputy.cs`, `s7.lvl.c.a` · "Deputy Head" · `نائب مدير المدرسة`.
   Saudi schools usually say `وكيل المدرسة`. Depends on the ruling for item 7.
9. `contacts.counsellor.cs`, `s7.phones.li4`, `s7.lvl.b.a` · "counsellor" ·
   `المرشد الطلابي`. The Ministry's current title is `الموجّه الطلابي`; many
   schools and parents still say `المرشد الطلابي`.
10. `contacts.activity.cs` · "Activity Supervisor" · `مشرف النشاط`. Saudi
    schools often say `رائد النشاط`. I avoided `رائد` so it is not confused
    with `رائد الفصل`.
11. `contacts.floor1.cs`, `contacts.floor2.cs` · "Floor Supervisor" ·
    `مشرف الدور`. Alternative `مشرف الطابق`. `الدور` is the Saudi usage.
    Whether "First floor" is the ground floor plus one is unchanged from the
    English.
12. `contacts.campus` · "Boys campus · UK High School" ·
    `مقر البنين · الثانوية البريطانية`. I do not know whether "UK High School"
    is a building name, a department name or a stage. Alternative:
    `المرحلة الثانوية · القسم البريطاني`, or leaving "UK High School" in Latin
    if it is a proper name on the signage.
13. `s7.attendance.li2`, `contacts.affairs.rl` · "early dismissal",
    "dismissal" · `الانصراف المبكر`, `الانصراف`. Saudi schools commonly call
    the request `الاستئذان`. If MyAIS labels it in Arabic, use its label.
14. `s7.attendance.li2` · "cannot be processed" · `لا يمكن تنفيذ الطلبات`.
    Alternative `لا تُقبل الطلبات`, which is more natural but reads slightly
    stronger than the English.
15. `s7.phones.*` · "confiscated", "confiscation" · `المحجوز`, `الحجز`.
    Literal alternative `المُصادَر`, `المصادرة`, which in Arabic suggests the
    phone is not coming back. Saudi schools also say `سحب الجوال`. The table
    heading "Phone held for" is `مدة حجز الهاتف`, so one root serves both.
16. `s7.phones.li2` · "to a parent or guardian in person" ·
    `إلى أحد الوالدين أو ولي الأمر شخصياً`. In Arabic `ولي الأمر` alone
    already covers both; I kept both to mirror the rule exactly.
17. `s7.phones.li4`, `s7.lvl.a.a`, `s7.lvl.c.a` · "parents are asked to come
    in", "parent contact", "parent meetings" · singular `ولي الأمر` rather
    than the glossary plural `أولياء الأمور`, because each case concerns one
    student's own guardian. "asked to come in" is `يُطلب من ولي الأمر الحضور
    إلى المدرسة`; the usual Saudi wording `يُستدعى ولي الأمر` is sterner than
    the English.
18. `s7.phones.li1` · "lunchtimes" · `أوقات الغداء`. With a 6:30 to 1:05 day
    the school may have no lunch period in Arabic usage; kept because the
    policy says it.
19. `s7.lvl.*.n` · "Level A/B/C" · `المستوى A`, `B`, `C` in Latin so they
    match the English policy documents. Alternative `المستوى أ / ب / ج`.
20. `s7.lvl.a.n`, `.b.n`, `.c.n` · "Minor", "Repeated or disruptive", "Serious
    safety concern" · `مخالفات بسيطة`, `مخالفات متكررة أو مخلّة بالنظام`,
    `مخالفات جسيمة تمس السلامة`. I supplied the noun `مخالفات`, which Arabic
    needs; the English has bare adjectives.
21. `s7.lvl.a.d` · "Uniform, low-level disruption." ·
    `مخالفة الزي المدرسي، الإخلال البسيط بالنظام.` "Uniform" alone would read
    as a good thing in Arabic, so it is `مخالفة الزي المدرسي`.
22. `s7.lvl.a.a` · "reflection time" · `وقت للتأمل في السلوك`. No settled
    Saudi term. Alternative `جلسة تأمل` or `وقت لمراجعة الذات`.
23. `s7.lvl.b.a` · "behavioural contract" · `عقد سلوكي`. Saudi schools often
    say `تعهد سلوكي`; I avoided `تعهد` because `نموذج التعهد` is the phone
    commitment form in the glossary.
24. `s7.lvl.c.a` · "safeguarding log" · `تسجيل في سجل حماية الطلاب`.
    "Safeguarding" has no fixed Arabic; alternative `سجل حماية الطفل`.
25. `s7.lvl.c.a` · "possible suspension or alternative placement" ·
    `واحتمال الإيقاف عن الدراسة أو النقل إلى بيئة تعليمية بديلة`. "Alternative
    placement" is a British term; the Arabic may read as transfer to another
    school, which may or may not be what the policy means. Alternative for
    suspension: `الفصل المؤقت`.
26. `s7.lvl.c.d` · "leaving school grounds" · `مغادرة المدرسة`. The English
    implies without permission; I did not add `دون إذن` because the English
    does not say it. The owner may want it added in both languages.
27. `s7.behaviour.title` · "Behaviour and community" ·
    `السلوك والمجتمع المدرسي`. I added `المدرسي`; bare `المجتمع` reads as
    society at large.
28. `contacts.counsellor.rl` · "Well-being and behaviour support" ·
    `دعم الصحة النفسية والسلوك`. Alternative `الرعاية الطلابية ودعم السلوك`.
    "Well-being" has no single Arabic; `الصحة النفسية` may sound more clinical
    than intended.
29. `updates.2026-09-13-student-council.text` · "Grades 9, 11 and 12",
    "Grade 12 Vice President" · digits kept (`الصفوف 9 و11 و12`,
    `نائب الرئيس من الصف 12`) because rule 6 requires them, against the
    glossary's `الصف التاسع`. I read "Grade 12 Vice President" as the Vice
    President seat, filled from Grade 12.
30. Same key · "The Grade 10 Representative is already in place" ·
    `أما ممثل الصف 10 فقد تم اختياره`. "In place" may mean appointed rather
    than chosen; alternative `موجود بالفعل`.
31. Same key · "Shortlisted students are interviewed the following week" ·
    `وتُجرى المقابلات مع الطلاب المختارين في القائمة المختصرة في الأسبوع التالي`.
    Alternative `الطلاب المرشحين مبدئياً`.
32. Same key and its title and label · "apply", "applications" · `الترشح`,
    following the glossary's `الترشح لمجلس الطلاب`. Literal alternative
    `التقديم`.
33. `updates.2026-09-13-mentors.text` · "Six of the seven Grade 9 and 10
    classes" · `ستة من الفصول السبعة في الصفين 9 و10`. Words for six and
    seven as in English, digits for the grades.
34. `updates.2026-09-13-mentors.label` · "Find your son's mentor" ·
    `اعرفوا رائد فصل ابنكم`. Alternative `ابحثوا عن رائد فصل ابنكم`.
35. `updates.2026-09-13-year-hub.title` · "your hub for the year" ·
    `بوابتكم طوال العام`, using the glossary's `بوابة` for hub.
36. `updates.2026-09-13-year-hub.text` · "the page has moved on from that
    evening" · `لم تعد الصفحة خاصة بتلك الأمسية`. Meaning kept, idiom dropped.
37. `updates.2026-09-09-live.*` · "went live", "opened" · `انطلاق`, `انطلقت`.
    Alternative `أُطلقت`.
38. `updates.2026-09-13-updates-bell.label` and `changelog.title` · "See
    what's changed", "What's changed this year" · built on the glossary's
    `سجل التحديثات`: `عرض سجل التحديثات`, `سجل التحديثات لهذا العام`.
39. `ask.note` · "Please include your child's grade and class" ·
    `نرجو ذكر صف ابنكم وفصله`. Relies on الصف = grade and الفصل = class, which
    must hold across all three batches. Note that the glossary also uses
    `الفصل الدراسي` for semester; context keeps them apart here.
40. `contacts.sub` · "For anything beyond them, the section team is here." ·
    `ولكل ما يتجاوزهم، فريق القسم في خدمتكم.` "is here" rendered as "at your
    service", a small warming of the tone.
41. `footer.l2` · `ais.sch.sa` and the phone number are each wrapped in
    `<span dir="ltr">`. In English the footer number is written
    `+966 50 519 9115`; kept exactly.

## Glossary friction

- **Grade 9 → الصف التاسع** conflicts with rule 6 wherever the English writes
  the grade as a digit. In the update notices I wrote `الصف 10`, `الصفين 9 و10`,
  `الصفوف 9 و11 و12`. These read acceptably, but they differ from the ordinal
  form the glossary gives. Batches A and B will meet the same conflict and
  should resolve it the same way.
- **No Mobile Phone Policy → الهواتف المحمولة.** Saudi parents and Saudi
  school circulars say `الجوال`. `الهاتف المحمول` is correct and understood but
  reads as translated. I followed the glossary (`الهواتف المحمولة`, then
  `الهاتف` alone).
- **Parents → أولياء الأمور** does not fit the policy lines about one
  student's guardian; singular `ولي الأمر` used there (Unsure 17).
- **Semester → الفصل الدراسي** and **Homeroom mentor → رائد الفصل** put two
  senses on `الفصل`. No clash inside this batch, but `فصل ابنكم` (class) will
  sit near `الفصل الدراسي` (semester) elsewhere on the page.
- **Class timetable → الجدول الدراسي.** Fine. For "the full timetable" (the
  combined file) I wrote `الجدول الكامل`.
