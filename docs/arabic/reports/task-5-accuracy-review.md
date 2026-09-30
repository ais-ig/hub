# Task 5 · Accuracy review of the Arabic

Reviewer did not write any of the Arabic. All 366 pairs in
`docs/arabic/translation-review.md` were read against the English; raw strings
with tags were read from the `i18nAr` block and `updatesData` in `index.html`.

## 1. Verdict

The translation is trustworthy. Every number, date, time, phone number,
extension, percentage and name was compared and none is wrong; no condition,
exception or "who does what" is lost in the policy, assessment or timetable
text. It is weakest in two places: a handful of cross-batch inconsistencies
(how grades are written, التقدير against الدرجة, the academic-year format), and
the school's own vocabulary (job titles, event and document names), which no
translator could know and which the school must confirm. Two strings can be
read the wrong way and should be fixed before release.

23 findings. No `number or name`, `rule` or `bidi` finding.

## 2. Findings

Proposed Arabic is the complete replacement string. For `updates.*` rows it is
the `textAr` field of that `updatesData` entry.

| Key | Severity | English | Current Arabic | Proposed Arabic | Reason |
|---|---|---|---|---|---|
| `doc.commitment.sb` | wrong meaning | PDF · signed when a phone is collected | `PDF · يُوقَّع عند استلام الهاتف` | `PDF · يُوقَّع عند استلام الهاتف المحجوز` | As written it can be read as "signed when the school takes the phone", the opposite actor and moment. المحجوز is the word `s7.phones.li2` uses for the confiscated phone, so it can only mean the parent collecting it. |
| `results.sub` | wrong meaning | 718 subject results from 192 candidates across 20 subjects, all boards combined | `718 نتيجة مادة حققها 192 من الطلاب المتقدمين في 20 مادة، لجميع هيئات الاختبارات مجتمعة` | `718 نتيجة مادة حققها 192 طالباً تقدّموا للاختبارات في 20 مادة، لجميع هيئات الاختبارات مجتمعة` | The glossary term was used exactly, but الطلاب المتقدمين reads first as "the advanced students", which would mean the figures cover a selected group. This is the only place the term occurs. Amend the glossary entry for Candidates to الطلاب المتقدمون للاختبارات. |
| `s7.lvl.c.d` | missing or added content | Violence, bullying, leaving school grounds. | `العنف، التنمر، مغادرة المدرسة.` | `العنف، التنمر، مغادرة حرم المدرسة.` | "Grounds" dropped. مغادرة المدرسة also describes going home at 1:05; حرم المدرسة carries "leaving the premises". "Without permission" is not in the English and is not added. |
| `s3.hifdh.p1` | glossary | ... inside the three Quran periods already on the timetable ... | `اختياري، وتوضع له علامة في خانة مستقلة في نموذج الصف التاسع. يُنفَّذ <b>ضمن حصص القرآن الكريم الثلاث المدرجة أصلاً في الجدول</b>، فلا يضيف أي حصة إلى الأسبوع ولا يحل محل أي مادة أخرى.` | `اختياري، وتوضع له علامة في خانة مستقلة في نموذج الصف التاسع. يُنفَّذ <b>ضمن حصص القرآن الكريم الثلاث المدرجة أصلاً في الجدول الدراسي</b>، فلا يضيف أي حصة إلى الأسبوع ولا يحل محل أي مادة أخرى.` | Timetable is الجدول الدراسي. Bare الجدول in this section is also "Table A / B / C" of the form (`s3.form.li1` to `li3`), so a parent can read it as "already in the table". |
| `updates.2026-09-13-class-pdfs.text` | glossary | ... some phones opened the full timetable at the first page instead. | `الضغط على فصل ابنكم يفتح الآن جدول ذلك الفصل وحده، على أي هاتف. في السابق كانت بعض الهواتف تفتح الجدول الكامل عند الصفحة الأولى.` | `الضغط على فصل ابنكم يفتح الآن جدول ذلك الفصل وحده، على أي هاتف. في السابق كانت بعض الهواتف تفتح الجدول الدراسي الكامل عند الصفحة الأولى.` | "The full timetable" is الجدول الدراسي الكامل in `schedule.full`, the button this notice is about. |
| `updates.2026-09-13-student-council.text` | consistency | ... the Grade 12 Vice President. The Grade 10 Representative is already in place, so there is no Grade 10 seat this round. Shortlisted students are interviewed the following week. | `يمكن لطلاب الصفوف 9 و11 و12 الترشح حتى يوم الأربعاء 16 سبتمبر الساعة 11:59 مساءً بتوقيت السعودية. المقاعد المتاحة هي ممثل كل صف من الصفوف 9 و11 و12، ونائب الرئيس من الصف 12. أما ممثل الصف 10 فقد تم اختياره، ولذلك لا يوجد مقعد للصف 10 في هذه الدورة. وتُجرى المقابلات مع الطلاب المختارين في القائمة المختصرة في الأسبوع التالي.` | `يمكن لطلاب الصفوف 9 و11 و12 الترشح حتى يوم الأربعاء 16 سبتمبر الساعة 11:59 مساءً بتوقيت السعودية. المقاعد المتاحة هي ممثل كل صف من الصفوف 9 و11 و12، ونائب الرئيس من الصف الثاني عشر. أما ممثل الصف العاشر فهو في منصبه بالفعل، ولذلك لا يوجد مقعد للصف العاشر في هذه الدورة. وتُجرى المقابلات مع الطلاب المدرجين في القائمة المختصرة في الأسبوع التالي.` | Three single grades written with digits (الصف 12, الصف 10 twice); the rule is the ordinal word. The checker now accepts the words. Also "already in place" was rendered "has been chosen", which asserts how he got the seat; "في منصبه بالفعل" says only what the English says. المدرجين is plainer than المختارين في. |
| `s2.lead` | consistency | Grades 9 and 10 are not two separate years. ... | `الصفان التاسع والعاشر ليسا عامين منفصلين، بل هما برنامج IGCSE واحد متصل، والمواد التي تُختار في بداية الصف التاسع تستمر مع الطالب حتى الاختبارات الخارجية في نهاية الصف العاشر.` | `الصفان 9 و10 ليسا عامين منفصلين، بل هما برنامج IGCSE واحد متصل، والمواد التي تُختار في بداية الصف التاسع تستمر مع الطالب حتى الاختبارات الخارجية في نهاية الصف العاشر.` | Two grades listed together take digits (as batch C wrote الصفين 9 و10). The two single grades later in the sentence stay as words. |
| `s2.step3.g` | consistency | Goal · Grades 11 and 12 | `الهدف · الصفان الحادي عشر والثاني عشر` | `الهدف · الصفان 11 و12` | Same rule. Also shorter on the timeline label. |
| `s6.lead` | consistency | Grades and certificates open the door. ... | `الدرجات والشهادات تفتح الباب. أما ما يقوم به الطالب إلى جانبها فهو ما يملأ طلب الالتحاق بالجامعة، ثم أول مقابلة شخصية بعد ذلك.` | `التقديرات والشهادات تفتح الباب. أما ما يقوم به الطالب إلى جانبها فهو ما يملأ طلب الالتحاق بالجامعة، ثم أول مقابلة شخصية بعد ذلك.` | Exam grades are التقدير everywhere in batch A; الدرجة is a mark. |
| `s6.sem1.li1` | consistency | <b>Excellence Awards.</b> Recognising top achievers and IGCSE distinctions. | `<b>جوائز التميّز.</b> تكريم المتفوقين والحاصلين على درجات الامتياز في IGCSE.` | `<b>جوائز التميّز.</b> تكريم المتفوقين والحاصلين على تقدير الامتياز في IGCSE.` | Same: a distinction is a grade, not a mark. |
| `start.options.d` | consistency | Academic Year 2026-2027. Print, complete and sign. | `العام الدراسي <span dir="ltr">2026-2027</span>. اطبعوا النموذج واملؤوه ووقّعوه.` | `العام الدراسي <span dir="ltr">2026/2027</span>. اطبعوا النموذج واملؤوه ووقّعوه.` | Batch A wrote `2026-2027`, batch B `2026/2027` for the same English. One form: the slash, which matches the glossary's `2026/27`, avoids a dash and keeps both years for the number check. |
| `s3.form.sb` | consistency | PDF · Academic Year 2026-2027 · print and sign | `PDF · العام الدراسي <span dir="ltr">2026-2027</span> · للطباعة والتوقيع` | `PDF · العام الدراسي <span dir="ltr">2026/2027</span> · للطباعة والتوقيع` | Same. |
| `doc.timetables.sb` | consistency | PDF · boys campus · in effect from 27 September 2026 · 11 pages | `PDF · مقر البنين · سارية من 27 سبتمبر 2026 · 11 صفحة` | `PDF · مقر البنين · يُعمل بها اعتباراً من 27 سبتمبر 2026 · 11 صفحة` | "In effect from" is يُعمل بها اعتباراً من in `start.timetables.d` and `schedule.sub`, about the same file. |
| `s3.g9.maths.cambridge` | consistency | Mathematics<br>(Cambridge) | `الرياضيات<br>(Cambridge Mathematics)` | `الرياضيات<br>(Cambridge)` | Grade 9 has "Cambridge Mathematics", Grade 10 "Maths Cambridge" for the same choice. The board name alone matches the English, the form and `s3.boards.title`, and is shorter in the pair card. |
| `s3.g9.maths.edexcel` | consistency | Mathematics<br>(Edexcel) | `الرياضيات<br>(Edexcel Mathematics)` | `الرياضيات<br>(Edexcel)` | Same. |
| `s3.g10.maths.cambridge` | consistency | Maths Cambridge | `الرياضيات (Maths Cambridge)` | `الرياضيات (Cambridge)` | Same. Narrow chip. |
| `s3.g10.maths.edexcel` | consistency | Maths Edexcel | `الرياضيات (Maths Edexcel)` | `الرياضيات (Edexcel)` | Same. |
| `s5.partner.p` | consistency | ... what we see in the classroom meets what you see at home. ... | `المدرسة وأولياء الأمور والطلاب، معاً من أجل نجاح الطالب. ولا تنجح المتابعة المذكورة أعلاه إلا حين يلتقي ما نراه في الصف بما ترونه في البيت. تواصلوا مع رائد الفصل مبكراً، ولا تؤجلوا ذلك.` | `المدرسة وأولياء الأمور والطلاب، معاً من أجل نجاح الطالب. ولا تنجح المتابعة المذكورة أعلاه إلا حين يلتقي ما نراه في الفصل بما ترونه في البيت. تواصلوا مع رائد الفصل مبكراً، ولا تؤجلوا ذلك.` | الصف is the grade in running prose; the room and the group are الفصل. (The two fixed glossary phrases أعمال الصف and خارج الصف stay.) |
| `contacts.counsellor.rl` | consistency | Well-being and behaviour support | `دعم الصحة النفسية والسلوك` | `دعم الراحة النفسية والسلوك` | "Well-being" is الراحة النفسية in `s5.mentor.intro` and `s5.mentor.li2`. الصحة النفسية is "mental health", stronger and more clinical than the English. Fluency reviewer to confirm the wording reads naturally on a contact card. |
| `doc.alevel.sb` | consistency | PDF · A-Levels · Academic Year 2026-2027 | `PDF · <span dir="ltr">A-Levels</span> · العام الدراسي <span dir="ltr">2026/2027</span>` | `PDF · <span dir="ltr">A-Level</span> · العام الدراسي <span dir="ltr">2026/2027</span>` | The spec's Latin form is `A-Level`, used in `s2.sub` and `s2.step3.h`. An English plural s inside Arabic is noise. |
| `doc.pathway.sb` | consistency | PDF · the IGCSE and A-Levels booklet | `PDF · كتيّب IGCSE و <span dir="ltr">A-Levels</span>` | `PDF · كتيّب IGCSE و<span dir="ltr">A-Level</span>` | Same. |
| `results.title` | style | IGCSE results 2025/26 | `نتائج IGCSE للعام <span dir="ltr">2025/26</span>` | `نتائج IGCSE للعام الدراسي <span dir="ltr">2025/26</span>` | The rules give العام الدراسي for an academic year; `s4.guide.sb` has the same slip and can stay or follow. |
| `doc.deck.sb` | style | PDF · the slides from 9 September 2026, 31 pages | `PDF · شرائح العرض في 9 سبتمبر 2026، 31 صفحة` | `PDF · شرائح عرض اللقاء في 9 سبتمبر 2026، 31 صفحة` | "The slides on 9 September" has lost what the date belongs to; `start.deck.d` names the meeting. |

### Bidi

Every raw string was read for unwrapped Latin or numeric runs. None reorders.
`2026/27`, `2025/26`, `A*`, `1H`, `2H`, `Edexcel IGCSE`, phone numbers, the
domain and the footer number are wrapped. The unwrapped runs (`IGCSE`, `AS`,
`A2`, `A-Level`, `Cambridge`, `Edexcel`, `MyAIS`, `Zoom`, `Schoology`, `9A`
in the aria-labels, `100%`, `60%`, times such as `6:30`, the email address in
the online-week notice) are each a single Latin or numeric run between Arabic
words and keep their order. `js.desc` carries `2026/27` without a span because
a meta description cannot hold markup; it resolves as one number run.

## 3. Consistency groups

| Term | One form | Keys that change |
|---|---|---|
| A single grade in prose or a title | Ordinal word: الصف العاشر، الصف الثاني عشر | `updates.2026-09-13-student-council.text` (الصف 12, الصف 10 twice) |
| Two or more grades together, or a range | Digits: الصفان 9 و10، الصفين 11 و12، الصفوف 9 و11 و12، الصفوف من 9 إلى 12 | `s2.lead`, `s2.step3.g` |
| Exam grade against mark | التقدير for a grade (9, A*, distinction); الدرجة for a mark or score | `s6.lead`, `s6.sem1.li1`. `s5.short` (تنخفض الدرجة) stays: it is the school score. |
| "Academic Year 2026-2027" | العام الدراسي `<span dir="ltr">2026/2027</span>` | `start.options.d`, `s3.form.sb` (the two `doc.*` keys already have it) |
| "in effect from" | يُعمل بها اعتباراً من | `doc.timetables.sb` |
| Timetable | الجدول الدراسي in full on first mention in a string; bare الجدول only for a form's Table A, B, C | `s3.hifdh.p1`, `updates.2026-09-13-class-pdfs.text` |
| Maths by board | الرياضيات (Cambridge), الرياضيات (Edexcel) | `s3.g9.maths.cambridge`, `s3.g9.maths.edexcel`, `s3.g10.maths.cambridge`, `s3.g10.maths.edexcel` |
| Classroom, class | الفصل | `s5.partner.p` |
| Well-being | الراحة النفسية | `contacts.counsellor.rl` |
| A-Level | `A-Level`, never `A-Levels` | `doc.alevel.sb`, `doc.pathway.sb` |
| Candidates | طلاب تقدّموا للاختبارات / الطلاب المتقدمون للاختبارات | `results.sub`, and the glossary row |

Checked and already consistent across batches: الجداول الدراسية (menu, hero
button, section title, start card, library heading); اطرحوا سؤالاً (all five
keys); the two options-form titles in `start.*` and `doc.*`; الفصل الدراسي
always written in full for semester and term; الفصل for a class; السطر for a
table row; حصة الريادة and رائد الفصل; المرشد الطلابي; مدير المدرسة and نائب
مدير المدرسة; منسوبو; اضغطوا على; every menu item against its section heading
(where they differ, the English differs in the same way).

## 4. Unsure items adjudicated

### Translator A

1. `common.grade9` to `grade12`: keep. Ordinal words are the rule for a single grade.
2. `schedule.pill.*`: keep. The class name stays whole, as on the pill.
3. `start.guide.d`, `start.deck.d`: keep. Naming اللقاء matches the countdown strings and adds no fact.
4. `start.guide.d` منسوبي: keep. Standard Saudi institutional word; same in batch B.
5. `start.sub`: keep. قائمة المستندات الكاملة points at جميع المستندات.
6. `start.g9.t`, `start.g10.t`: keep. Batch B matched it exactly.
7. `start.options.d`, `s3.form.sb`: change to `2026/2027` in the LTR span (findings).
8. `schedule.note`: keep. صباحاً after 9:55 is correct and required by the time format.
9. `results.title`: change to للعام الدراسي (findings, style).
10. `results.sub`: change (findings). The translator's own doubt was right.
11. `results.stat1` to `stat4`: keep. Each reads correctly under its figure; التقديرات is right.
12. `results.students`: keep. "Top grades in five subjects" is what the English means.
13. `s2.title`: keep.
14. `s2.step1.p`: keep. المقرر for syllabus, المنهج for curriculum.
15. `s2.step3.h`: keep. `A-Level` is the spec's form.
16. `s2.step2.p`: keep.
17. `s3.cur.moe`: keep, unless the visual review finds the column too tight; then الوزارة.
18. `subj.social`: ask the school for its Arabic subject name and what KSAH stands for.
19. `subj.islamic`: keep.
20. `subj.arabic`: keep. The ambiguity is the English's.
21. `subj.business`: keep. دراسات الأعمال is the IGCSE subject.
22. `subj.cs`, `subj.ict`: keep. Saudi usage.
23. `subj.pe`: keep.
24. `s3.g9.maths.*`, `s3.g10.maths.*`: change to the board name alone in the bracket (findings).
25. Bracketed English on chips and pairs: keep; a layout question for the visual review and the owner, not an accuracy one.
26. `s3.g9.optional.intro`, `s3.form.li2`: keep. مادتين reads better than زوج; سطر is right for row.
27. `s3.choose`: keep.
28. `s3.short`: keep.
29. `s3.hifdh.p1`: keep the wording; change الجدول to الجدول الدراسي (findings).
30. `s3.hifdh.p2`: keep.
31. `s3.boards.title`: keep.
32. `s3.boards.intro`: keep.
33. `s3.boards.share1`: keep. المستوى المتقدم is also the literal Arabic of "Advanced Level".
34. `s3.boards.share2`: keep. مناهج is a safe supplied subject.
35. `s3.boards.cam1`, `edx1` الدورة: keep. الجلسة would be wrong.
36. `s3.boards.edx1` نظام الوحدات: keep. The next sentence explains it.
37. `s3.boards.edx2`: keep.
38. `s3.equiv.*`: keep. التقدير is right here, whatever the context note said.
39. `s3.equiv.note`: keep. Words in English, the right words in Arabic.
40. `s3.form.li1` to `li3` الجدول A: keep.
41. `s3.form.li4`: keep.
42. `s3.form.li5`: keep.
43. `schedule.stamp`: keep.

### Translator B

1. Quarter and semester ordinals: keep. They match the grade rule.
2. `doc.options.sb`, `doc.alevel.sb`: keep `2026/2027`; batch A's two keys move to it.
3. `s4.guide.t` المسار البريطاني: keep. "Stream" is not "Section" in the English either, and المسار البريطاني is the usual Saudi name for a stream.
4. `s4.lead`, `s4.sem1.note` درجة العام: keep. Arabic needs the noun; no fact added.
5. `s4.progress.li2`: keep as one document. Ask only if the school's email is in fact two items.
6. `s4.progress.li3`: keep. Same rule, same threshold.
7. `s4.progress.title`: keep.
8. `s5.early.p` باسمه: keep, and see school question 9 on what "named" means. الفصل الدراسي for "term" is right.
9. `s5.mock.p` دورة الصيف: keep. Do not add months.
10. `s5.sheets.*`: keep; ask the school whether the sheet has an Arabic name.
11. Well-being: keep الراحة النفسية in `s5.*`; `contacts.counsellor.rl` moves to it (findings). أحوال الطلاب عامةً for "group well-being" is looser but acceptable.
12. `s5.mentor.li1` shared concerns: keep.
13. `s5.mentors.note` pastoral: keep. The alternative would send parents to the counsellor.
14. `s5.mentor.title`, `s6.allyear` برنامج رائد الفصل: ask the school (question 1).
15. `s5.title`: keep.
16. `s6.sub`: keep.
17. `s6.lead` مقابلة شخصية: keep; only الدرجات changes (findings).
18. `s6.offer.li3`: keep. المراعي is the company's own Arabic name; MACTECH stays Latin.
19. `s6.offer.li4`: keep. Avoiding التطوع was right.
20. `s6.sem1.li1`: change درجات to تقدير (findings); ask whether "distinction" is a named award.
21. `s6.sem1.li2`: ask the school to confirm the Arabic name of Pakistan International School.
22. `s6.sem1.li4` to `li6`: keep. ملتقى الصحة العالمي and سيتي سكيب العالمي are the events' own Arabic names; Black Hat MEA stays Latin.
23. `s6.sem1.li7` كرة المراوغة: keep; the school may prefer دودج بول.
24. `s6.sem2.li1` رماح: keep; confirm the spelling with the school.
25. `s6.sem2.li3`: keep. Matches `js.title`.
26. `s6.sem2.li5`, `li6`: keep.
27. `s6.sem2.li7` اليوم الترفيهي: keep.
28. `s6.allyear` مسابقة ملتقى الصلاة: ask the school (question 5). Do not publish on a guess.
29. `doc.commitment.*`: change the sub-line (findings); ask for the form's own Arabic title.
30. `doc.letter.t`: ask the school for the letter's own Arabic title.
31. `doc.daily.*`: keep. جدول اليوم الدراسي stays clear of الجدول الدراسي.
32. `doc.guide.sb`: keep.
33. `doc.pathway.t`: keep.
34. `doc.weekly9.t`, `doc.weekly10.t`: keep.
35. `doc.deck.sb`: change (findings, style).
36. `doc.timetables.sb`: change to يُعمل بها اعتباراً من (findings).
37. `s4.sub` ربعاً بعد ربع: keep.

### Translator C

1. `s7.phones.week1` أسبوع واحد: keep.
2. Online-week "Periods 1 to 3 today run as normal too": keep; the ambiguity is the English's. The notice leaves the New window on 1 October, so fix both languages only if it is reissued.
3. "S number" رقم S الخاص به: keep; ask the school if it has an Arabic name.
4. "class folders on Schoology": keep; ask whether these are form-class or subject folders.
5. "lessons" as الدراسة عن بُعد in the title: keep. It is the phrase parents know.
6. Email sentence reworded: keep. Nothing added, and the address sits safely mid-line.
7. Head of School مدير المدرسة: ask the school (question 2).
8. Deputy Head نائب مدير المدرسة: ask the school, with 7.
9. Counsellor المرشد الطلابي: keep; ask only if the school has moved to الموجّه الطلابي.
10. Activity Supervisor مشرف النشاط: keep. Avoiding رائد was right.
11. Floor Supervisor مشرف الدور: keep.
12. `contacts.campus` الثانوية البريطانية: ask the school (question 4).
13. Early dismissal الانصراف المبكر: keep; use MyAIS's own Arabic label if it has one.
14. "cannot be processed" لا يمكن تنفيذ: keep. لا تُقبل would be stronger than the English.
15. Confiscation الحجز: keep. المصادرة would suggest the phone is not returned.
16. "parent or guardian" أحد الوالدين أو ولي الأمر: keep. It mirrors the rule.
17. Singular ولي الأمر in the policy lines: keep. يُطلب ... الحضور is the right strength.
18. "lunchtimes" أوقات الغداء: keep. The policy says it.
19. Level A, B, C in Latin: keep. They match the documents.
20. مخالفات supplied in the level names: keep.
21. `s7.lvl.a.d`: keep. Uniform correctly read as the noun.
22. "reflection time": keep.
23. "behavioural contract" عقد سلوكي: keep. Avoiding تعهد was right.
24. "safeguarding log" سجل حماية الطلاب: keep.
25. "suspension or alternative placement": keep; ask what the policy means by alternative placement (question 9).
26. `s7.lvl.c.d`: change to مغادرة حرم المدرسة (findings). Do not add دون إذن unless the English gains it.
27. `s7.behaviour.title` المجتمع المدرسي: keep.
28. `contacts.counsellor.rl`: change to الراحة النفسية (findings).
29. Digits for grades in the Student Council notice: change the three single grades to words (findings). "Vice President from Grade 12" is the right reading.
30. "already in place": change to فهو في منصبه بالفعل (findings).
31. "Shortlisted": change to المدرجين في القائمة المختصرة (findings).
32. "apply" الترشح: keep.
33. `updates.2026-09-13-mentors.text`: keep. Words and digits are each where the rule puts them.
34. "Find your son's mentor" اعرفوا: keep.
35. `year-hub.title` بوابتكم: keep.
36. `year-hub.text`: keep.
37. `live.*` انطلاق: keep.
38. `updates-bell.label`, `changelog.title`: keep.
39. `ask.note` صف ابنكم وفصله: keep. The distinction holds across the page.
40. `contacts.sub` في خدمتكم: keep. A small warming, acceptable.
41. `footer.l2`: keep.

## 5. Questions only the school can answer

1. What does the school call "Homeroom", the "homeroom mentor" and the "Mentorship Programme" in Arabic? The page uses حصة الريادة, رائد الفصل and برنامج رائد الفصل.
2. What are the Arabic job titles of the Head of School and the Deputy Head of School of the British Section? The page says مدير المدرسة and نائب مدير المدرسة, which a parent could take to mean the head of all of Al-Rowad. Is it وكيل?
3. Is the counsellor المرشد الطلابي or الموجّه الطلابي, and is "Activity Supervisor" مشرف النشاط or رائد النشاط?
4. What is "UK High School" on the contacts heading: a building name, a department, or the secondary stage? The page says الثانوية البريطانية.
5. What is the "Grade 9 Prayer Assembly Competition", and what is its Arabic name? The translator guessed.
6. The phone Commitment Form and the Semester 1 letter "Curriculum and Classroom Expectations" both exist in Arabic. What are their Arabic titles as printed?
7. What does MyAIS call an early dismissal request in Arabic (الاستئذان, الانصراف المبكر)?
8. What is the school's Arabic name for "Social Studies (KSAH)", and what does KSAH stand for?
9. In the policies: does a "named intervention plan" mean a plan in the student's name or one with a named member of staff, and does "alternative placement" mean a move to another school?
10. Names to confirm: Remah Camp (رماح), Pakistan International School (المدرسة الباكستانية العالمية), dodgeball (كرة المراوغة or دودج بول), and whether "IGCSE distinctions" is a named award.
11. Should the page say الجوال, as Saudi school circulars do, instead of the glossary's الهاتف المحمول?
12. The student's "S number" and his "class folders" on Schoology: is there an Arabic name for the first, and are the second his form class or his subjects?

## 6. Judged correct, worth a second look

- `s4.midterm` اختبار منتصف الفصل (glossary). It is the one place bare الفصل means semester, against the page rule that bare الفصل is a class. It is a set phrase and will be read correctly; اختبار منتصف الفصل الدراسي would be strictly consistent but is long for a table cell.
- `s3.g9.compulsory.note`, `s3.g10.compulsory.note`: "Periods are per week" became عدد الحصص في الأسبوع, a label rather than a sentence. Correct, slightly clipped. The fluency review may prefer الحصص محسوبة في الأسبوع.
- `s3.form.li5`: "by the deadline" became قبل انتهاء الموعد النهائي. It includes the deadline day, as the English does, but is wordy.
- `s5.mentor.li1`: "group well-being" as أحوال الطلاب عامةً is the loosest rendering that was let stand.
- `s4.guide.sb`: التقويم الدراسي للعام 2026/27 is fine; it could follow `results.title` to للعام الدراسي but then repeats الدراسي.
- `hero.sub`: adds برنامج before IGCSE. Harmless and reads better; noted because it is the first line a parent sees.
- `updates.2026-09-13-student-council.text`: الدورة is "this round" here and "exam session" in the options section. Context keeps them apart.
