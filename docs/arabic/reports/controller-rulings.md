# Controller rulings for the fix wave

The three review reports sometimes disagree with each other, with the glossary
or with the spec's rules. These rulings settle every such case. They override
the reports and the glossary where they differ.

## How to combine the two language reports

- Apply every finding in both reports unless a ruling below says otherwise or
  you can show the finding is wrong (then record it under "Rejected" with the
  reason).
- Where both reports propose a string for the same key: the accuracy report
  wins on meaning, numbers, names and consistency; the fluency report wins on
  wording. Write one string that carries both.
- Never apply a wording change that alters meaning, drops a condition or
  changes a number. Reread the English for every string you touch.
- Do not change any English on the page. If a reviewer found the English itself
  ambiguous or inconsistent, translate it faithfully and list it in your report
  under "English source issues for the owner".

## Terms

| # | Ruling |
|---|---|
| R1 | Mobile phone is **الجوال** (plural الجوالات), not الهاتف المحمول. The policy is **سياسة منع الجوال**. Keep "عبر الهاتف" where it means a phone call. Confiscation stays **حجز**. First extract the text of `assets/phone-policy-commitment-form.pdf` (it is bilingual; `pdftotext` is installed): if the school's own Arabic there uses a different word for the phone, use the school's word instead and say so in your report. |
| R2 | The same PDF and `assets/parent-letter-semester-1-2026-27.pdf` are bilingual. Use the Arabic title each prints for itself in `doc.commitment.t` and `doc.letter.t` (and the matching `s7` card if any). If the extracted Arabic is unreadable (reversed or garbled letters are common in PDF text layers; judge carefully), keep the current translation and say so. |
| R3 | "Mark as read" is **تمييز كمقروء**; "Mark all as read" is **تمييز الكل كمقروء**. |
| R4 | "Boys campus" stays **مقر البنين**. This is a question for the school. |
| R5 | Head of School and Deputy Head stay **مدير المدرسة** and **نائب مدير المدرسة**. Do not change to وكيل. This is a question for the school. |
| R6 | The counsellor stays **المرشد الطلابي**. "Well-being" is **الراحة النفسية**. |
| R7 | "Intervention" in the academic sense is **الخطة العلاجية / خطة علاجية**. Leave "تدخل مدير المدرسة" where it means the Head stepping in. |
| R8 | "Early dismissal" is **الاستئذان**. |
| R9 | "Summer" schedule is **الدوام الصيفي**. |
| R10 | "IG" in a heading or title is written **IGCSE** in the Arabic. |
| R11 | "Academic" as in academic progress is **الدراسي**. |
| R12 | "Candidates" is **الطلاب المتقدمون للاختبارات** (declined as the sentence needs). |
| R13 | `A-Level`, never `A-Levels`. |
| R14 | الربع stays. حصة الريادة and رائد الفصل stay. |

## Numbers

| # | Ruling |
|---|---|
| R15 | A single grade in prose or a title is the ordinal word: الصف التاسع. Two or more grades listed together, or a range, use digits: الصفين 9 و10، الصفوف من 9 إلى 12. **If one string contains any multi-grade list, every grade in that string is written in digits**, so the Student Council notice keeps its digits throughout. |
| R16 | The academic year is written with a slash and carries the same digits as its English: `<span dir="ltr">2026/27</span>` where the English has 2026/27, `<span dir="ltr">2026/2027</span>` where the English has 2026-2027. In update notices (plain text, no tags) write it without the span. |
| R17 | Percentages are written in digits in the Arabic even where the English spells them out: 60%, 50%, 40%. The checker allows extra numbers in the Arabic. Make sure the figure matches the English word exactly. |
| R18 | Countdown units stay singular (يوم، ساعة، دقيقة، ثانية). |

## Checker notes

- The checker accepts Arabic number words from one to twelve in place of a
  digit, so الصف التاسع satisfies "Grade 9". Remove any `"nums": false` or
  `"numsAr": false` that is no longer needed; keep one only where the check
  truly cannot pass, and list each one kept with the reason.
- After changing Arabic, the entry's hash does not change (it fingerprints the
  English), so `stamp` is not needed unless you changed which English a key
  covers, which you must not.
- The simplest safe way to change strings is a JSON file of key → new Arabic
  and `node tools/i18n.mjs merge <file>`; it accepts `updates.<id>.title`,
  `.text` and `.label` keys too.
