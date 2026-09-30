# Fix wave re-review · commit `e9ac676`

30 September 2026, branch `arabic`. Reviewer did not write or fix any of the
Arabic. Read-only: nothing but this file was created or changed.

Method: the `i18nAr` block and `updatesData` were extracted from
`e9ac676~1` and `e9ac676` and compared by script. 70 strings differ (61
changed dictionary entries, the new key `contacts.activity.tel`, 8 update
fields), which matches the fixer's count. `index.html` is unchanged between
`e9ac676` and `HEAD`. Each of the 70 was read against the English from
`node tools/i18n.mjs extract`. `node tools/i18n.mjs check` passes (367
strings). The 62 screenshots were written after the last change to
`index.html` (12:02 against 12:01), so they show the fixed page.

## Verdict

**Clean, with one string for the owner to decide.** No number, date, name or
condition was lost or changed in any of the 70 strings. No leftover of any old
term. All four language rejections and the visual one were right. Every visual
finding that can be seen in the screenshots is fixed and nothing new is broken.

## 1. Changed strings with a problem

One, low severity.

| Key | Problem | English | Current Arabic | Proposed Arabic |
|---|---|---|---|---|
| `s3.boards.share1` | Narrowed. The English says "advanced level study" in lower case; the Arabic now names the qualification. The accuracy review ruled "keep" on the old wording (Translator A item 33), and the rulings say an ambiguous English is translated faithfully and listed for the owner. The fixer did list it (source issue 12) but also changed it, which is not how it treated the same situation in `s4.progress.li2` and the online notice. It is almost certainly what the school means, so this is a decision, not an error. | Both prepare students for advanced level study. | `كلتاهما تُعدّ الطلاب لدراسة A-Level.` | If the owner does not confirm A-Level: `كلتاهما تُعدّ الطلاب للدراسة في المستوى المتقدم.` If the owner confirms, keep the current string. |

Read and let stand, recorded so nobody rechecks them:

- `s5.mentor.intro` adds الشخصي to "development" (ونموّه الشخصي). A qualifier, added so the word is not read as physical growth. No fact added.
- `s6.allyear` drops "run throughout" (كلها مستمرة طوال العام). The bold label already says على مدار العام; nothing is lost.
- `updates.2026-09-09-live.text`: "the one link to keep" is now "the only link you need to keep" (تحتاجون إلى حفظه). Same advice.
- `s6.offer.li3` swaps the order of the two company names. Both names intact.
- `s2.lead` now reads الصف 9 and الصف 10 for the two single grades. Less natural than the words, but it is exactly what R15 orders.
- `doc.commitment.t` is longer than the one word (تعهد) the form prints, against the letter of R2. The fixer explained why and raised it as school question 16. Reasonable.
- `doc.letter.t`: checked against the PDF. Its Arabic heading is `الخطة الدراسية وتوقعاتنا من الطالب`, as the string now says. The commitment form does say الجوال.
- `results.sub`: 718, 20 and 192 are each attached to the right noun. See the line-break nit in section 4.

## 2. Findings the fixer said it applied

All confirmed in the committed strings.

- **Accuracy, `wrong meaning` and `missing or added content`:** `doc.commitment.sb` (المحجوز added, with الجوال), `results.sub` (للاختبارات added), `s7.lvl.c.d` (حرم المدرسة). All three applied.
- **Accuracy, the other 20 findings:** all applied; `s2.lead` and the Student Council notice in the R15 form.
- **Fluency 1 to 12:** 2, 3, 4, 5, 9, 10, 11 applied as proposed; 1, 6 and 12 applied in the changed form the fixer describes, and each change keeps the English (he "signs in", "must be made", "cannot be processed"); 7 and 8 rejected (section 3).
- **Fluency 13 to 41:** spot-checked all; each is as the fix report says.

Leftover search across all 367 strings and the 29 Arabic update fields:

| Old term | Result |
|---|---|
| الهاتف المحمول / الهواتف المحمولة / الهواتف | None. The one remaining الهاتف is "عبر الهاتف" in `s7.attendance.li2`, a phone call, kept by R1. |
| تحديد كمقروء | None. |
| التدخل (academic) | None. The one remaining is "تدخل مدير المدرسة" in `s7.lvl.b.a`, kept by R7. |
| الانصراف المبكر / الانصراف | None. |
| التوقيت الصيفي | None. (التوقيت in `s3.boards.intro` means exam timing.) |
| الطلاب المتقدمون without للاختبارات | None. |
| `A-Levels` | None. |
| bare `IG` | None. |
| الأكاديمي, الصحة النفسية | None. |
| R15 | No string mixes a digit list of grades with an ordinal grade word. |
| R16 | No `2026-2027` left; all four are `2026/2027` in a span. `js.desc` carries `2026/27` without a span, correctly (meta description). |
| R17 | No في المئة left. All six percentages are digits in `<span dir="ltr">`, and 40, 50, 60, 60, 60, 100 each match the English. |
| Multi-word English bracket without a span | None. |
| `tel:` link without a key | None. |

No leftovers.

## 3. The rejections

| Finding | Fixer's decision | Judgement |
|---|---|---|
| Fluency 7, `s7.lvl.c.a` (وكيل المدرسة) | Rejected | Right. R5 forbids the change and sends it to the school. |
| Fluency 8, `contacts.deputy.cs` | Rejected | Right, same ruling. |
| Fluency 18, `s4.progress.li2` | Rejected | Right. The proposal makes one document into two; accuracy item B5 says keep it as one, and accuracy wins on meaning. The awkwardness the fluency reviewer saw in خطة النتائج والدعم is real, but it cannot be fixed until the school answers question 10. |
| Fluency 39, `s3.g10.maths.*` | Rejected | Right. The accuracy finding (board name alone in all four keys) matches the English and the form, and removes the inconsistency the fluency reviewer was pointing at. |
| Visual V11 (Latin in Cairo) | Not changed | Right. Spec decision 4 asks for exactly this; it is the owner's call, not a defect. |

No disagreement.

## 4. The visual fixes, by eye

**Opened:** all 62 images in `docs/arabic/screens/`. `ar-380-01` to `-24`,
`ar-380-menu`, `ar-380-bell`, `ar-380-tab9-01` to `-05`, `ar-380-tab10-01` to
`-04`, `ar-800-01` to `-18`, `ar-800-menu`, `ar-800-bell`, `ar-800-tab9-01` to
`-04`, `ar-800-tab10-01` to `-03`.

| id | Seen in | Result |
|---|---|---|
| V1 | `ar-380-22`, `-23`, `ar-800-17` | Fixed. On all seven cards the envelope and the phone sit at the right edge, one above the other. Each line reads phone, number, middot, تحويلة, extension, in that order. Every number keeps its digit groups, including Mr. Mohamed Noor's `050 855 1006`. Emails intact. |
| V2 | `ar-380-02` (card), `ar-380-18`, `ar-800-13` (row) | Fixed. The tag is on both. |
| V3 | `ar-380-12`, `-13`, `ar-800-10` | Fixed. 9A to 12B sit in a column at the right edge. The lone middot on rows that wrap remains, as the fixer says; English has it too. |
| V4 | `ar-380-06`, `-07`, `ar-380-tab9-01`, `-02`, `ar-380-tab10-01`, `-02` | Fixed. `(Islamic` then `Studies)`, `(Social` then `Studies, KSAH)`, `(Business` then `Studies)`; `(Computer Science)` and `(Business Studies)` whole on their own line in the Grade 10 cards. Maths shows the board alone. |
| V5 | not in the set | Cannot be confirmed by eye: no 320px capture was saved. The `@media (max-width: 359px)` rule is in the commit, and the 380px top bar (`ar-380-01`) is unchanged and fits. |
| V6 | tables, pair labels, tags throughout | Fixed. Table headings, اختاروا واحدة, group labels and the tag are legible; `الربع الثاني` still fits its column at 380px (`ar-380-10`). |
| V7 | `ar-380-04`, `-09`, `-10`, `-11`, `-12` | Fixed. `100%`, `40%`, `60%`, `50%` all carry the sign on the right, matching the large figures. |
| V8 | `ar-380-02`, `-20`, `-21`, `ar-800-15`, `-16` | Fixed. Every update link stays with its arrow. |
| V9 | `ar-380-06`, `-12`, `-15` | Fixed. Rounded box; باختصار clear of the corner. |
| V10 | `ar-380-10`, `-16`, `ar-800-05`, `-08`, `-12` | Fixed. مدة حجز الجوال sits over `24 ساعة`; الربع الأول and الربع الثاني over their figures; المنهج stays over its start-aligned cells. |
| V11 | | Not changed, by decision. |
| V12 | `ar-380-03`, `-09`, `-18` | Fixed. `2026/2027` everywhere the form is dated. |

Also checked: the `h4` no longer capitalises `Edexcel` (`ar-380-08`, "الرياضيات: Cambridge أو Edexcel" reads in order); the reworded labels all fit (`مسار ابنكم في IGCSE` in the menu, `تمييز كمقروء` and `تمييز الكل كمقروء`, `نموذج التعهد بالالتزام بسياسة منع الجوال` on one line at 380px, `الدعم والخطط العلاجية`); the sentence-final full stop after `a.bakr@ais.sch.sa` falls on the left of the address, where it belongs; `+966 50 519 9115` in the footer is in order; letters join everywhere; nothing is clipped or overlapping; borders, dots, arrows and the timeline are mirrored.

**New problems:** none that are wrong. Two nits, neither worth holding the work for:

1. `ar-380-04`, `results.sub`: at 380px the line breaks between `المتقدمين` and `للاختبارات`, so the first line ends on exactly the words ("الطلاب المتقدمين") the accuracy review said could be misread as "the advanced students". A no-break space between the two words keeps them together: `718 نتيجة في 20 مادة، حققها 192 من الطلاب المتقدمين&nbsp;للاختبارات، لدى جميع هيئات الاختبارات مجتمعة`. Fine at 800px.
2. `ar-380-19`, `doc.pathway.sb`: the و now touches the Latin word (`وA-Level`). Correct Arabic typography and in the right order; it only looks tight.

Not checkable from the screenshots: 320px (V5), real phones, the countdown states.
