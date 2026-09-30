# AIS British Section · Parent Hub, Grades 9 and 10

## What this project is

A single-page Parent Hub for Al-Rowad International Schools, Riyadh, British Section, academic year 2026/27. The content is written for **Grades 9 and 10** on the **boys campus**; girls campus content was removed on 9 September 2026 because the evening was boys only, and sits in git history if needed. The document library also carries the Grade 11 and 12 options forms and guide pages, because the printed QR sheets label the hub "Grades 9 to 12". It went live on 9 September 2026 as the Parents' Meet & Greet page and is the one link parents keep for the year. It replaces both `linktr.ee/ais.orientation`, last year's list of PDF buttons, and an earlier Grades 9 to 12 Parent Information Hub that was never sent out.

Parents open it on a phone, from a WhatsApp link or a QR code. It opens in English and can be read in full in Arabic, right to left, since 30 September 2026. It is a practical reference, not a marketing page. The hero and the banner describe the current event and are swapped as the year goes on; everything below them is reference material that changes only when a source document changes.

Live at `https://ais-ig.github.io/hub/`, repository `ais-ig/hub`. This folder is a clone of that repository.

## Architecture (locked decisions, do not revisit)

- **One self-contained `index.html`** on GitHub Pages. All CSS and JS inline. No build step, no framework, no dependency beyond Google Fonts. The design reference is a React page; this is not, and must not become one.
- **Mobile-first**, an 800px content column, the same width as the pathway hub. The documents band and the contact grid go multi-column above roughly 520px; nothing else changes shape on desktop.
- **English and Arabic, English first.** Decided on 30 September 2026, at the school's request, after parents asked for the hub in Arabic. It reverses the earlier locked decision "English only, no language toggle, no RTL"; that line is gone on purpose, so do not restore it. English is the default and the source of truth: it stays in the markup and is what a browser without JavaScript shows. A text button in the top bar, before the bell, switches in place with no reload. `?lang=ar` and `?lang=en` override, and the choice is remembered per browser in `localStorage` under `aisHub.lang`. The printed QR codes and the plain link still open in English.
- **The Arabic is a dictionary, not second markup.** Every element a parent reads carries `data-i18n="<key>"`, every read attribute a `data-i18n-attr="aria-label:<key>"` pair, and the Arabic sits in one JSON block, `<script type="application/json" id="i18nAr">`, keyed the same way. Strings that only the script writes have their English in a second block, `i18nEn`, under `js.*` keys. Each Arabic entry stores `h`, a short hash of the English it was translated from. This shape was chosen over side-by-side English and Arabic markup and over a second page because drift is the long-term risk here: the prose is duplicated from source documents that change, and only a dictionary lets a script prove that nothing was missed and nothing went stale. Do not split the page in two and do not inline the Arabic. The PDFs stay English, and in Arabic a link to one says so. See "English and Arabic move together" below.
- **Right-to-left is one override block.** Every Arabic or RTL rule sits at the end of the stylesheet, under `html[lang="ar"]` or `html[dir="rtl"]`. The rules above it are not rewritten, so the English layout cannot change. The one exception is the language button, which shows in both languages: its own rules sit with the top bar, and beside them a `@media (max-width: 359px)` rule that applies in both languages and gives the bar a few pixels back so the brand stays on one line on the narrowest phones. From 360px up that rule does nothing. Keep it that way: never edit an existing rule to suit Arabic, add its mirror to the block.
- **Arabic can never blank the page.** A few lines in `<head>` choose the language before anything paints and, for Arabic, hide `<body>` under the class `i18n-wait` until the Arabic is written, so English never flashes. A timer lifts that cover after 1.5 seconds whatever happens. With no readable `i18nAr` block the page is English and the button stays hidden, and a missing key leaves its element in English rather than empty.
- **No campus toggle.** Grades 9 and 10 curriculum, options, assessment and policies are identical across campuses. Only venues and contacts differ. The page currently carries the boys campus only.
- **No Google Sheets hydration.** All content is static. The old hub's CSV layer was deliberately dropped: nothing on this page is volatile enough to justify the failure surface.
- **PDFs live in `assets/`** and are linked relatively. Never link to Google Drive. Root-level PDFs are git-ignored.
- Documents announced before they exist render as a muted, dashed "Available soon" card rather than a link that 404s. Do not announce a document nobody has committed to producing; the agenda card was removed for that reason.
- **Updates reach parents through a bell, not push.** The `updatesData` array feeds a bell in the top bar (gold unread count, drop-down list), the strip under the banner (unread entries only) and `#changelog`. Unread means inside the 14-day New window and not yet opened. An entry's optional `newUntil` ends that window early; set it on an entry a later one supersedes and on event notices, and date every entry the day it goes live, never in the future. Read state is per browser in `localStorage` under `aisHub.updates`, keyed by each entry's `id`. Never change a live `id`. No push notifications and no service worker: a static page cannot send them, and the school's WhatsApp messages already do that job. Read items are restyled in place, never removed, because the strip sits above every section and removing an item mid-scroll moves the target.
- **The hero carries a countdown.** It reads `data-doors` and `data-end` off the hero element rather than a JS constant, so the machine-readable date sits beside the human-readable one in the banner. Three self-switching states: counting, "under way", "thank you". Hidden until JS validates both dates, so it never flashes empty cells. Do not move these dates into a constant, and do not let the attributes drift from the banner. Between events, delete the attributes and the block hides itself.

## Design direction

The page copies the Grade 9 Pathway Hub, `https://ais-ig.github.io/g9-pathway-26/`, rebuilt in plain CSS. Its source is React with inline styles; the live page is the reference, not its code. Carried over as-is:

- Fixed deep navy top bar, 56px, 3px gold bottom border, emblem and gold title, hamburger menu that drops a list of sections and a gold button.
- Navy hero: vertical gradient to `#08203D`, watermark emblem at 7% opacity, 104px emblem, gold h1, white subtitle, pale description, gold filled and gold outline buttons.
- Navy event banner strip with emoji date, time and venue.
- Light gold documents band with white cards, 3px gold top border, emoji icon, gold "Open PDF →".
- Section titles: 24px deep navy h2, grey subtitle, 48px by 3px gold bar. Sections alternate cream and white.
- Numbered agenda cards: 48px tinted square with the number, gold time, navy heading.
- Journey map: vertical gold-to-navy line, dots, cards with a coloured left border.
- Pill tabs for Grade 9 / Grade 10, deep navy when active.
- Contact cards with a coloured top border and an uppercase campus label.
- Navy full-width call-to-action block, and a navy footer with emblem, gold tagline and gold top border.

Deliberate departures, all for brand or content reasons:

- **Poppins 700 is the heaviest weight**, where the pathway uses 800. The brand rules forbid 600 and 800.
- **An Arabic mode.** The pathway hub is English only. In Arabic the same design is mirrored, not redrawn: section order, colours and the emblem do not change.
- **Navy emblem bands instead of stock skyline photos** between sections. The pathway's New York and London photographs say "choose a pathway"; this page has no such story to tell, and campus photographs were not supplied.
- **No floating action pill.** The pathway's pill submits an application form. This page has no such action.
- **The countdown lives in the hero.** The pathway defines a countdown component but never renders it.

The page-specific patterns kept from the first version: the options tables and the choice pairs in Subject options. Grade 9's either/or rows render as choice-pair cards rather than a four-column table, because "choose one from each pair" reads far better that way on a phone.

## Brand rules (never violate)

- Navy `#1D5394`, deep navy `#0C2E54`, yellow `#EDBA1D`. No other accent colours.
- Poppins only for English, weights 300 / 400 / 500 / 700. Never 600 or 800.
- Cairo for Arabic, the same four weights and the same ban on 600 and 800. It is the face the school's own site, `ais.sch.sa`, sets its Arabic pages in. In Arabic mode Latin runs (IGCSE, class names, digits) are also Cairo, so one line never mixes two faces. No third typeface.
- Emblem: `assets/emblem.png`, transparent, use as-is. Never recolour.
- No stock photography of people.
- Institutional, warm, trustworthy tone. A school, not a startup.

## Writing rules (never violate)

- **"Grade", never "Year".** Grade 9, Grade 10, IGCSE, A-Levels. "Academic Year 2026-2027" is the one permitted use of the word.
- **No em dashes anywhere**, in content, code comments or commit messages. Use en dashes for ranges (Grades 9–10) and middots (·) as dividers.
- Clear, concise, warm. Address the reader as "you".
- Institutional content signs "British Section".

The Arabic follows the same rules and a few of its own. The full list and the glossary are in `docs/superpowers/specs/2026-09-30-arabic-language-design.md`, "Arabic writing rules". **The glossary there is the authority for terms**: use its Arabic for a term and nothing else, and change a term there first. The rules most likely to be broken:

- **الصف, never السنة**, for a grade. العام الدراسي is the academic year, the one permitted use, as in English.
- **No em dashes**, no Arabic-Indic digits and no tatweel. Western digits only (2026, 6:30), as on the school's site.
- **Ranges are written من … إلى …, never with a dash.** See "Arabic traps" for why.
- **Every number in the English appears in the Arabic.** A number from one to twelve may be written as an Arabic word (الصف التاسع for Grade 9); anything above twelve stays digits.
- **The respectful plural** addresses the reader: يمكنكم, ابنكم, اطرحوا. Never the singular.
- Modern Standard Arabic, no dialect. Institutional content signs القسم البريطاني.
- IGCSE, AS, A2, A-Level, exam boards, class names (9A to 12B), staff names, emails, phone numbers, Schoology, Zoom and PDF stay in Latin letters.
- **An update notice is plain text, in both languages.** The renderer writes `title`, `text`, `label` and their Arabic with `textContent`, so a tag typed there, `<span dir="ltr">` included, would show as text.

## Content sources

| Section | Source |
|---|---|
| Class timetables | The aSc export `IG Classes.pdf`, published as `assets/class-timetables-boys.pdf`. Boys campus, 11 pages, one per class in a fixed order. Revised several times a term; superseded copies go to `assets/archive/`. |
| Period times | `Daily Schedule (Summer) – British Section`, Grades 9 to 12, 2026/27. This is the authority for the times in the banner and in the `#schedule` note, **not** the aSc export. Homeroom 6:30, periods 1 to 8 from 6:45 to 12:35, break 9:25 to 9:55, Salah 12:35 to 13:05. Note it is the **Summer** schedule; a Winter one will need these swapped. |
| Results, pathway, support, activities, behaviour | `Parents Meet and Greet 2026-2027.pptx.pdf`, the final 31-page 2026/27 deck, published as `assets/presentation-g9-g10.pdf`. This is the primary source and supersedes the 2025 deck and the earlier "(AIS template)" drafts. |
| Homeroom mentors (`#mentors`) | `Homeroom Mentors 2026-2027.docx.pdf`, Mentorship Programme, British Section, issued 13 September 2026. Covers Grades 9 to 12, 11 classes, and supersedes slide 19 of the deck. Not published as a download. When it changes, add an `updatesData` entry linking `#mentors`. |
| Gates, stall map, boys campus staff contacts | `AIS_Meet_and_Greet_Parent_Guide_Grades_7-12_Boys_09Sep2026.pdf`, the printed parent guide. Pages 1 and 12 to 16 are republished as `assets/meet-and-greet-parent-guide-boys-2026-27.pdf`. |
| Subject options | `assets/g9-igcse-options-2026-27.pdf` and `assets/g10-igcse-options-2026-27.pdf` |
| Syllabus pages | Not on the page. `~/Downloads/AIS_Syllabus_Links_2026-2027.xlsx` holds the board and code per subject, awaiting manual verification before any of it is linked. Its Notes tab is internal; never publish it. |
| Assessment | Teachers' Guide, British Section, Assessment breakdown for 2026/2027, confirmed by slide 13 of the deck. **Not a parent-facing document, so it is a source only and is deliberately not linked as a download.** |
| Policies | `assets/no-mobile-phone-policy.pdf`, plus the behaviour levels from the deck |
| Student Council | `Student Council Policy (British Section, Boys) 2026-2027.docx.pdf`, Version 2.0, issued 13 September 2026, published as `assets/student-council-policy-boys-2026-27.pdf`. The hero button's `data-until` deadline and the open seats named in the `2026-09-13-student-council` update both come from it. Published with the student names in it, at the user's decision on 13 September 2026. |
| Guides and links | The school-wide Linktree `linktr.ee/rowad.curriculum2627`, whose Grade 9 and 10 pages link the IG weekly plans, the Parent Assessment Guide and the Semester 1 parent letter. Only the British-track items are carried; the SAT and CCP items are American Section. |

**When a source changes, the prose must change with it.** The agenda, the results figures, the subject tables, the assessment breakdown, the activity lists, the phone policy tiers and the contact cards are all duplicated from documents. Do not update one without the other.

Three couplings were added on 12 September 2026. The banner's period times and
the `#schedule` note both come from the Daily Schedule, so they move together.
The `?v=` query on every timetable link must be bumped whenever the file is
replaced, or parents get a cached copy. And the class order of the aSc export
is encoded in `tools/split-timetable.sh`, which splits the combined file into
one PDF per class in `assets/timetables/`, and in the eleven class pills in
`#schedule` that open those files. Rerun the script whenever the combined file
is replaced, and re-derive both if the class list changes. `tools/check.mjs`
fails if a split file's class label does not match its filename.

The pills link to per-class files, not `#page=` fragments, since 13 September
2026. Fragments were tested on real devices: they work on macOS and iPad and
open page 1 on iPhone and Android. Do not reintroduce them.

**The aSc export does not display period times.** Its header row shows only the
period numbers 1 to 8 and BREAK. The times are present in the file's hidden text
layer, so `pdftotext` will happily report them, and they are stale: a consistent
15 minutes later than the Daily Schedule, with no Homeroom or Salah row. **Do not
take period times from the aSc export.** Nothing a parent sees is wrong, because
nothing a parent sees states a time, but anyone extracting text from that file
will be misled, as happened on 13 September 2026.

`Daily Schedule (Summer) - British Section`, published as
`assets/daily-schedule-summer-2026-27.pdf`, is the only authority for times.

**A Winter schedule exists and shifts everything earlier.** The 2025/26 Winter
sheet ran Homeroom 06:15 and Salah 12:20 to 12:50. When the 2026/27 Winter
schedule is issued, the banner, the `#schedule` note and this asset all change
together.

Changes already carried in for 2026/27, worth knowing: Grade 9 Islamic Studies moved 3 to 2 periods and Quran 2 to 3; several optional loads changed in both grades; Grade 9 gained an optional Hifdh Programme, which sits inside the existing three Quran periods and neither adds to the forty-period week nor replaces a subject.

Assessment changed too, and the numbers on the page are the 2026/27 ones, not the 2025 deck's: classwork moved 5 to 6 and homework 5 to 4, so continuous assessment still totals 10 per quarter but is weighted towards classwork. "Mid-semester Test" is now "Mid-Term Test" and "End of Semester Exam" is now "Final Examination". The old "rubric 0 to 5" line is gone, because a 0 to 5 rubric no longer maps onto a 6 mark classwork component.

The deck's agenda is three steps, 6:30 arrival, 6:45 presentation, 7:15 stalls with no fixed close. An earlier draft agenda in `~/Downloads` dated 1 September with different timings is superseded.

"Ask a question" is the school's Google Form, linked from three places on the page; README lists them.

## English and Arabic move together

A fourth coupling was added on 30 September 2026, and it is the one that touches
every edit. **Every change to English text needs its Arabic changed in the same
commit.** `tools/i18n.mjs` holds the two in step and `tools/check.mjs` runs its
rules, so a commit that forgets fails the check. What to do in each case:

- **Editing an existing sentence.** Change the English in the markup. Find the
  element's `data-i18n` key, change that key's `ar` in the `i18nAr` block to
  say the same thing, then run `node tools/i18n.mjs stamp <key>` to record that
  the Arabic matches the new English. A bare `stamp` is refused, with usage and
  exit 2, and that is deliberate: stamping is a statement that somebody read the
  Arabic, and one command that cleared every stale entry would wave through
  exactly the drift the hash exists to catch. `stamp --all` exists for the end
  of a full review of the Arabic and for nothing else.
- **Adding a new string.** Give the element a `data-i18n` key, named
  `<section>.<item>` like its neighbours (`s4.cw.note`, `doc.calendar.t`). Put
  the key on the smallest element that holds the whole sentence or label. A
  keyed element must not contain another keyed element or an element with an
  `id`, and must not be one a script rewrites or listens to, because its
  `innerHTML` is replaced whole. Write the Arabic into a JSON file,
  `{ "key": "Arabic" }`, and run `node tools/i18n.mjs merge <file>`, which adds
  the entry and stamps it. `merge` refuses a key that is not on the page. The
  Arabic must carry the same tags as the English, in the same order, with the
  same `href` and `class`. The same key may be used on two elements only if
  their English is identical.
- **A new `aria-label`, `alt`, `title` or `placeholder`.** Pair it on its
  element with `data-i18n-attr="aria-label:<key>"`, several pairs separated by
  `;`, and add the Arabic with `merge` like any other key.
- **A string the script writes.** Its English goes in the `i18nEn` block under a
  `js.*` key and in the script's `EN` fallback table, identically, and its
  Arabic in `i18nAr`. Read it with `t('js. ...')`.
- **Adding an update notice.** Write `titleAr` and `textAr` beside `title` and
  `text` in the `updatesData` entry, and `labelAr` wherever there is a `label`.
  The `id` is shared, so read state carries across the two languages. Where a
  number in the English is rightly a word in the Arabic and the word is not one
  the check knows, set `"numsAr": false` on the entry; the same escape for a
  dictionary entry is `"nums": false`. Use neither to silence a number that is
  really missing.
- **Text that stays in Latin letters** and needs no Arabic, such as a staff
  name, an email address or a cell holding only `IGCSE`: put the bare attribute
  `data-i18n-skip` on the element. It excuses the element and everything inside
  it, so put it on the smallest element that fits.
- **A new link to an English PDF.** Put the bare attribute `data-pdf-en` on the
  `<a>`. In Arabic the link then shows a small "in English" tag; the word is
  written once, in the CSS. Do not put it on a PDF that is itself in Arabic
  and English. As of 30 September 2026 the PDF links without the marker are
  the Semester 1 parent letter, the phone policy commitment form (both rows)
  and the eleven class pills, which are not cards or rows. Every other PDF
  link carries it, the parent guide included: it has Arabic on its map pages
  but is an English document in effect, and the first decision to leave it
  unmarked was reversed after review.
- **New CSS with a physical left or right** (`left`, `right`, `padding-left`,
  `margin-right`, `border-left`, an asymmetric shorthand, `text-align: left`)
  needs its mirror in the `html[dir="rtl"]` block at the end of the stylesheet.
  Flex, grid and the logical properties mirror by themselves, so prefer those.
  Nothing checks this but the Arabic screenshot, so look at it.

`node tools/check.mjs` now fails when: a key has no Arabic, or an Arabic entry
has no key on the page; an Arabic entry, or a notice's Arabic field, shows no
Arabic letter at all, which is English copied over by mistake, unless the
English itself has no letters or the entry carries `"latin": true` (for a
notice, `"latinAr": true` on the `updatesData` entry); a key sits on two
elements with different English; an
entry's hash no longer matches its English; a keyed element contains another
keyed element or an `id`; the Arabic's tags or link attributes differ from the
English's; a number in the English is missing from the Arabic; the Arabic holds
an em dash, an Arabic-Indic digit or a tatweel; an update notice lacks `titleAr`
or `textAr`, or has a `label` with no `labelAr`; or English a parent reads, text
or attribute, sits outside every key and every `data-i18n-skip`. It also fails
if the script asks for a `js.*` string `i18nEn` does not have, or if the `EN`
table and `i18nEn` disagree. **The stale hash is the failure to expect most
often**, after any edit to an English sentence. Its message names the key and
the command. Read it as "now update the Arabic", not as "now run `stamp`".

The existing couplings reach into the Arabic too. The "in effect from" and
"issued" lines in `#schedule`, the period times in the banner and the
`#schedule` note are all keyed strings, so a new timetable or a Winter schedule
changes their Arabic as well. A link's `href` inside a keyed sentence is
compared between the two languages, so a bumped `?v=` there cannot be missed in
Arabic.

`docs/arabic/translation-review.html` and `.md` list every English string
beside its Arabic, for a reader of Arabic to review without opening the source.
They are written by `node tools/i18n.mjs pairs`; regenerate them in any commit
that changes Arabic, and never edit them by hand. The dated record of how the
Arabic was built and what was decided is `docs/arabic/LOG.md`.

**The class timetable page** in the pending spec
`docs/superpowers/specs/2026-09-27-class-timetable-page-design.md` was left out
of this work because it does not exist yet. When it is built it should adopt
the same mechanism, keys, dictionary, hash and check, rather than a second
approach to Arabic.

### Arabic traps

Found while building this, each one after it had gone wrong on screen.

- **A dashed range reverses in a right-to-left line.** "9:25 – 9:55" reads as
  9:55 to 9:25. Write من 9:25 إلى 9:55. This is why the writing rules ban the
  dash for ranges in Arabic, where English uses an en dash.
- **Phone numbers, emails and a lone `A*` reorder unless isolated.** A line of
  digit groups with no Arabic letter showed as "1006 855 050", and the grade
  cell as `*A`. The override block gives every `tel:` and `mailto:` link and
  every `table.data td.num` cell `unicode-bidi: plaintext`, so each takes its
  direction from its own first strong letter. A new number or Latin run
  anywhere else, inside an Arabic sentence, needs `<span dir="ltr">` around it
  in the Arabic string; the check ignores that span when it compares tags.
  `direction: ltr` was considered and rejected for the links: it lays out a
  translated "number · extension" line in the English order.
- **Letter-spacing breaks Arabic joining.** Tracked Arabic letters come apart.
  The override block sets `letter-spacing: 0 !important` on everything under
  `html[dir="rtl"]`, so a tracked rule added later cannot be forgotten. Do not
  remove it and do not out-rank it.
- **An uppercase transform makes Latin words shout inside an Arabic heading.**
  Arabic has no capitals, so `text-transform: uppercase` does nothing to the
  Arabic and turns a word like Schoology or Zoom beside it into capitals. The
  override block sets `text-transform: none` on `h4` for that reason. A new
  uppercase rule on an element that can hold Arabic needs the same.
- **`history.replaceState` does not run on `file://`.** The script takes
  `?lang=` out of the address bar after reading it, so a parent who shares the
  page shares the plain link. Chrome refuses that on a local file and the code
  catches the refusal, so `tools/shot.mjs` and `render-check.sh`, which load
  `file://`, never exercise it. Test the clean-up on a server,
  `python3 -m http.server` in this folder, or on the live site.

## Workflow expectations

- Placeholders, when any exist, are marked `<!-- PLACEHOLDER -->` and must read as plausible finished content, never "TBC". None remain as of 9 September 2026.
- Verify at ~380px width before considering any change done. The page must never scroll sideways; wide content scrolls inside its own container. Headless Chrome's `--window-size` does not go below the macOS minimum window width: a screenshot at that flag's floor is cropped to 380 pixels wide, not laid out at 380, and text gets cut off mid-word while the check still passes. Use `tools/shot.mjs` instead. It drives Chrome over the DevTools Protocol and sets a real `Emulation.setDeviceMetricsOverride`, so the page genuinely reflows at 380px, then asserts `scrollWidth <= clientWidth` and names any element that overflows. `bash tools/render-check.sh` runs it as its last step. Do not reach for `--window-size` for this check; it answers a different question and will pass on a page that is actually broken at 380px.
- **The 380px check runs in both languages.** `node tools/shot.mjs --lang=ar` loads the page through `?lang=ar`, asserts it came up `dir="rtl"`, runs the same overflow check, which in Arabic also names an element that runs past the left edge, and writes `w380-ar.png` and `w380-ar-bell.png`. In either language it also taps the language button twice and fails unless the page is restored exactly. `bash tools/render-check.sh` covers both languages, English then Arabic. Arabic words are often longer than the English they replace, so a change that fits in English can overflow in Arabic: look at the Arabic screenshot too.
- A change to English text is not done until its Arabic is changed and `node tools/check.mjs` passes. See "English and Arabic move together".
- Every internal anchor must resolve and every asset path must exist. Both are quick to check with grep.
- Pushing needs the `Mohamad-Dabbagh` gh account; `madabbagh` is read-only on the org. See `README.md`.
- The previous hub's content is archived at `~/Cooking/Rowad/parent-hub-archive-2026-08`. Do not resurrect it into this page without being asked.
