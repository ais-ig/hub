# Arabic for the Parent Hub

Design, 30 September 2026. Part 1 was presented in chat; the user then left and
asked for the rest to be decided and built without them, for local review.
Decisions taken on their behalf are listed in `docs/arabic/LOG.md`.

## The problem

The school received a request for the hub in Arabic. The page is English only,
by a locked decision in `CLAUDE.md`. Many parents read Arabic more easily than
English, and the page now carries urgent notices (online lessons, timetable
changes) that they need to understand at once.

## Outcome

A parent can read the whole hub in Arabic, right to left, by tapping one button
or by opening a link ending `?lang=ar`. English stays the default and stays
exactly as it is. The two languages cannot silently drift apart.

## Decisions

1. **Add Arabic, keep English.** One toggle in the top bar.
2. **English opens first.** The choice is remembered per browser in
   `localStorage` under `aisHub.lang`. `?lang=ar` and `?lang=en` override and
   are remembered. Printed QR codes keep working.
3. **One file.** The Arabic is a JSON block inside `index.html`, keyed by
   `data-i18n`. English stays in the markup and is what a browser without
   JavaScript shows.
4. **Cairo** for Arabic, weights 300, 400, 500 and 700, from Google Fonts. It is
   the face the school's own site uses. In Arabic mode Latin runs (IGCSE, class
   names, digits) are also set in Cairo, so a line does not mix two faces. In
   English mode Poppins stays the only face.
5. **Western digits** in Arabic text, as on the school's site.
6. **Right-to-left is an override block.** All RTL CSS sits under
   `html[dir="rtl"]` at the end of the stylesheet. Existing rules are not
   rewritten, so the English layout cannot change.
7. **Toggling happens in place**, with no reload.
8. **PDFs stay English** and say so in Arabic mode.
9. **Drift is caught by a script**, not by memory.

## What the parent sees

- A text button in the top bar, before the bell: `العربية` in English mode,
  `English` in Arabic mode. It carries `lang` for the language it names.
- In Arabic: `<html lang="ar" dir="rtl">`, Cairo, mirrored layout. The journey
  map line, coloured card borders and update-item borders move to the right.
  Arrows point left. Letter-spacing is removed, because tracking breaks Arabic
  joining. Section order, colours and the emblem do not change.
- Everything is translated: top bar, menu, hero, banner, countdown, all twelve
  sections, update notices, contacts, footer, screen-reader labels, page title
  and meta description.
- Each document card or row that opens an English PDF shows a small
  `بالإنجليزية` tag.

## Arabic writing rules

- Modern Standard Arabic. Clear, warm, institutional. No dialect.
- Address the reader in the respectful plural: يمكنكم, ابنكم.
- "Grade" is الصف. Never السنة for a grade. العام الدراسي is the academic year.
- No em dashes. No Arabic-Indic digits. No tatweel.
- Every number in the English appears in the Arabic with the same digits.
- Ranges of time or number are written من … إلى …, never with a dash, because
  a dashed range reverses visually in a right-to-left line.
- Times: `6:30 صباحاً`, `1:05 ظهراً`.
- Dates: `27 سبتمبر 2026`, `الأحد 27 سبتمبر`. Months: يناير فبراير مارس أبريل
  مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر.
- Stay in Latin letters: IGCSE, AS, A2, A-Level, exam boards and syllabus
  codes, class names (9A to 12B), staff names, emails, phone numbers, Schoology,
  Zoom, PDF.
- Any Latin or numeric run that could reorder (phone numbers, emails, class
  names next to punctuation, `2026/27`) is wrapped in `<span dir="ltr">`.
- Subject names in the options tables: Arabic, then the English in brackets,
  e.g. `الأحياء (Biology)`. Elsewhere Arabic alone.
- Institutional content signs القسم البريطاني.

### Glossary

Translators and reviewers use these and nothing else for these terms.

| English | Arabic |
|---|---|
| Parent Hub | بوابة أولياء الأمور |
| Al-Rowad International Schools | مدارس الرواد العالمية |
| British Section | القسم البريطاني |
| Academic Year 2026/27 | العام الدراسي 2026/27 |
| Grade 9, 10, 11, 12 | الصف التاسع، العاشر، الحادي عشر، الثاني عشر |
| Grades 9 to 12 | الصفوف من 9 إلى 12 |
| Boys campus | مقر البنين |
| Parents | أولياء الأمور |
| your child, your son | ابنكم |
| Class timetable | الجدول الدراسي |
| Period | الحصة |
| Break | الفسحة |
| Salah | الصلاة |
| Homeroom | حصة الريادة |
| Homeroom mentor | رائد الفصل |
| Subject options | اختيار المواد |
| Options form | نموذج اختيار المواد |
| Core, compulsory | إلزامي |
| Optional | اختياري |
| Pathway | المسار |
| Results | النتائج |
| Candidates | الطلاب المتقدمون |
| Assessment | التقييم |
| Continuous assessment | التقييم المستمر |
| Classwork | أعمال الصف |
| Homework | الواجبات المنزلية |
| Quarter | الربع |
| Semester | الفصل الدراسي |
| Mid-Term Test | اختبار منتصف الفصل |
| Final Examination | الاختبار النهائي |
| Support | الدعم |
| Policies | السياسات |
| No Mobile Phone Policy | سياسة منع الهواتف المحمولة |
| Commitment form | نموذج التعهد |
| Behaviour | السلوك |
| Student Council | مجلس الطلاب |
| Islamic Studies | الدراسات الإسلامية |
| Quran | القرآن الكريم |
| Hifdh Programme | برنامج تحفيظ القرآن الكريم |
| Meet & Greet | اللقاء التعريفي |
| Updates | التحديثات |
| New | جديد |
| Mark as read | تحديد كمقروء |
| What's changed | سجل التحديثات |
| Start here | ابدأوا من هنا |
| All documents | جميع المستندات |
| Open PDF | فتح الملف |
| Available soon | متاح قريباً |
| Ask a question | اطرحوا سؤالاً |
| Who to speak to | مع من تتواصلون |
| Beyond the books | خارج الصف |
| Apply for Student Council | الترشح لمجلس الطلاب |
| in English (PDF tag) | بالإنجليزية |

"Homeroom" and "Homeroom mentor" are the two terms most likely to need the
school's own wording. They are flagged in the log for the user.

## How it is built

### Markup

- Every element whose text a parent reads gets `data-i18n="<key>"`. The key
  names the section and the item: `hero.title`, `s4.cw.note`. Its Arabic
  replaces the element's `innerHTML`.
- Keys go on the smallest element that holds a whole sentence or label. A keyed
  element never contains another keyed element, never contains an element with
  an `id`, and never contains an element a script attaches a listener to.
- Attributes are translated with `data-i18n-attr="aria-label:<key>"`, several
  separated by `;`.
- Decorative emoji in their own `aria-hidden` span stay outside the keyed
  element where the markup allows; otherwise the Arabic string repeats the span.

### The dictionary

```html
<script type="application/json" id="i18nAr">
{
  "hero.title": { "h": "3fa1c2d9", "ar": "بوابة أولياء الأمور" },
  ...
}
</script>
```

`h` is the first eight hex characters of the SHA-1 of the English source for
that key: the element's `innerHTML` (or the attribute value) with runs of
whitespace collapsed to one space and the ends trimmed. An entry may carry
`"nums": false` to exempt it from the number check where a number is rightly
written as a word.

Strings that only JavaScript writes (the updates heading, "New", "Unread:",
month names, the bell's label, countdown messages, the page title and meta
description) have no element to carry them. Their English lives in a second
block, `<script type="application/json" id="i18nEn">`, keyed `js.*`, and their
Arabic in `i18nAr` like any other key.

### Update notices

Each `updatesData` entry gains `titleAr`, `textAr` and, where it has a `label`,
`labelAr`. The renderer reads the Arabic fields in Arabic mode and falls back to
English if one is missing. `id`s do not change, so read state is shared between
languages.

### Script

- A few lines in `<head>`, before the stylesheet paints: read `?lang`, then
  `localStorage`, default `en`. If Arabic, set `lang` and `dir` on `<html>` and
  add the class `i18n-wait`, which hides `<body>` with `visibility: hidden`.
  This prevents a flash of English. A timer removes the class after 1.5 seconds
  whatever happens, so a script error can never leave a blank page.
- At the end of `<body>`: `applyLang(lang)`. For Arabic it saves each keyed
  element's English once, then writes the Arabic. For English it restores. It
  sets `lang`, `dir`, the title, the meta description and the toggle's label,
  stores the choice, removes `i18n-wait`, and calls the repaint hooks.
- The updates renderer is split into a one-time setup (listeners, storage) and a
  `paint()` that clears and refills the bell, the strip and the change log in
  the current language. `applyLang` calls `paint()` and the countdown's `tick()`.
  The strip stays hidden if the visitor already dismissed it in this page view.
- A missing key, or a malformed block, leaves that element in English. The page
  never shows a key name or an empty element.
- `?lang=` is removed from the address bar with `history.replaceState` after it
  is read, so a parent who then shares the page shares the plain link.

### CSS

- Cairo is added to the existing Google Fonts request. The browser fetches its
  files only when Arabic text is on screen.
- `html[lang="ar"] body { font-family: 'Cairo', 'Poppins', sans-serif; }`
- One block at the end of the stylesheet, every selector under
  `html[dir="rtl"]`, mirrors the physical properties: `left`/`right` offsets,
  `padding-left`, `margin-right`, `border-left`, asymmetric shorthands, and
  sets `letter-spacing: 0`.
- Allowed weights stay 300, 400, 500 and 700.

## Keeping the two in step

`tools/i18n.mjs`, no dependencies:

| Command | Does |
|---|---|
| `extract` | Prints every key with its English source, as JSON. |
| `merge <file>...` | Writes key to Arabic maps from files into the `i18nAr` block and stamps `h`. |
| `stamp <key...>` or `stamp --all` | Re-stamps `h` for the named keys after their Arabic has been brought up to date. A bare `stamp` does nothing, so stale Arabic cannot be waved through by accident. |
| `pairs` | Writes `docs/arabic/translation-review.html` and `.md`. |
| `check` | The rules below. Exit 1 on any failure. |

`check` is also run by `tools/check.mjs`. It fails when:

1. A `data-i18n` or `data-i18n-attr` key has no Arabic, or an Arabic entry has
   no key on the page.
2. A key is used on two elements with different English.
3. `h` does not match the current English. The message names the key and says
   to update the Arabic, then run `stamp`.
4. A keyed element contains another keyed element or an element with an `id`.
5. The Arabic's tags differ from the English's: same elements, same `href`,
   `class`, `target`, `rel` and `download`, in the same order. `<span dir="ltr">`
   and `<bdi>` in the Arabic are ignored. This is what stops a bumped `?v=` on a
   timetable link being missed in Arabic.
6. A number in the English is absent from the Arabic, unless `"nums": false`.
   Update notices are checked the same way, with `"numsAr": false` on the entry
   as the escape.
7. The Arabic contains an em dash, an Arabic-Indic digit or a tatweel.
8. An `updatesData` entry lacks `titleAr` or `textAr`, or has `label` without
   `labelAr`.
9. A visible text node in `<body>` with two or more Latin letters sits outside
   every keyed element, outside the allow list (class pills, emoji, script and
   style). This catches new English added without a key. The same applies to
   `aria-label`, `alt`, `title` and `placeholder` attributes: one with two or
   more Latin letters needs a `data-i18n-attr` pair on its element.

`tools/shot.mjs` takes `--lang=ar` and then loads the page in Arabic, asserts
`dir="rtl"`, asserts no horizontal overflow at 380px, and writes `w380-ar.png`.
`tools/render-check.sh` runs both languages.

## Documentation

`CLAUDE.md` changes with the code:

- "English only" becomes "English and Arabic", with the mechanism and the rule
  that every English change is followed by its Arabic and `stamp`.
- "Poppins only" gains Cairo for Arabic.
- The writing rules gain the Arabic rules and point at the glossary here.
- The workflow section adds the 380px check in Arabic.

`README.md` gains a short "Arabic" section: how to add a string, how to update
one, how to add a bilingual update notice, how to regenerate the review file.

## Out of scope

- The class timetable page in the pending 27 September spec.
- Arabic PDFs.
- A third language.
- Detecting the phone's language.
- An update notice announcing Arabic. Drafted in the log for the user to date
  and publish.

## Testing

- `node tools/check.mjs` passes, including the nine i18n rules.
- `bash tools/render-check.sh` passes in both languages at 380px.
- Screenshots of the Arabic page at 380px, top to bottom, are read by a critique
  agent for clipped text, unmirrored elements, broken joining and misordered
  Latin runs.
- With JavaScript's Arabic block deleted, the page renders in English.
- The English page's rendered layout at 380px is unchanged from `main`, apart
  from the new button in the top bar.
- Toggling twice returns the DOM text to its starting state.

## Review

Three independent reviews before the work is called done, each by an agent that
did not write what it reviews:

1. Translation accuracy: every Arabic string against its English for meaning,
   numbers, names and glossary.
2. Arabic fluency and tone: read as a Saudi parent would, without the English.
3. Code: the diff against `main` for correctness, the locked architecture and
   the brand rules.

Findings are fixed by a separate agent and the checks rerun.
