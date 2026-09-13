# AIS British Section · Parent Hub, Grades 9 and 10

## What this project is

A single-page Parent Hub for Al-Rowad International Schools, Riyadh, British Section, academic year 2026/27. The content is written for **Grades 9 and 10** on the **boys campus**; girls campus content was removed on 9 September 2026 because the evening was boys only, and sits in git history if needed. The document library also carries the Grade 11 and 12 options forms and guide pages, because the printed QR sheets label the hub "Grades 9 to 12". It went live on 9 September 2026 as the Parents' Meet & Greet page and is the one link parents keep for the year. It replaces both `linktr.ee/ais.orientation`, last year's list of PDF buttons, and an earlier Grades 9 to 12 Parent Information Hub that was never sent out.

Parents open it on a phone, from a WhatsApp link or a QR code. It is a practical reference, not a marketing page. The hero and the banner describe the current event and are swapped as the year goes on; everything below them is reference material that changes only when a source document changes.

Live at `https://ais-ig.github.io/hub/`, repository `ais-ig/hub`. This folder is a clone of that repository.

## Architecture (locked decisions, do not revisit)

- **One self-contained `index.html`** on GitHub Pages. All CSS and JS inline. No build step, no framework, no dependency beyond Google Fonts. The design reference is a React page; this is not, and must not become one.
- **Mobile-first**, an 800px content column, the same width as the pathway hub. The documents band and the contact grid go multi-column above roughly 520px; nothing else changes shape on desktop.
- **English only.** No language toggle, no RTL. Every document the school produces for these grades is English.
- **No campus toggle.** Grades 9 and 10 curriculum, options, assessment and policies are identical across campuses. Only venues and contacts differ. The page currently carries the boys campus only.
- **No Google Sheets hydration.** All content is static. The old hub's CSV layer was deliberately dropped: nothing on this page is volatile enough to justify the failure surface.
- **PDFs live in `assets/`** and are linked relatively. Never link to Google Drive. Root-level PDFs are git-ignored.
- Documents announced before they exist render as a muted, dashed "Available soon" card rather than a link that 404s. Do not announce a document nobody has committed to producing; the agenda card was removed for that reason.
- **Updates reach parents through a bell, not push.** The `updatesData` array feeds a bell in the top bar (gold unread count, drop-down list), the strip under the banner (unread entries only) and `#changelog`. Unread means inside the 14-day New window and not yet opened; read state is per browser in `localStorage` under `aisHub.updates`, keyed by each entry's `id`. Never change a live `id`. No push notifications and no service worker: a static page cannot send them, and the school's WhatsApp messages already do that job. Read items are restyled in place, never removed, because the strip sits above every section and removing an item mid-scroll moves the target.
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
- **Navy emblem bands instead of stock skyline photos** between sections. The pathway's New York and London photographs say "choose a pathway"; this page has no such story to tell, and campus photographs were not supplied.
- **No floating action pill.** The pathway's pill submits an application form. This page has no such action.
- **The countdown lives in the hero.** The pathway defines a countdown component but never renders it.

The page-specific patterns kept from the first version: the options tables and the choice pairs in Subject options. Grade 9's either/or rows render as choice-pair cards rather than a four-column table, because "choose one from each pair" reads far better that way on a phone.

## Brand rules (never violate)

- Navy `#1D5394`, deep navy `#0C2E54`, yellow `#EDBA1D`. No other accent colours.
- Poppins only, weights 300 / 400 / 500 / 700. Never 600 or 800.
- Emblem: `assets/emblem.png`, transparent, use as-is. Never recolour.
- No stock photography of people.
- Institutional, warm, trustworthy tone. A school, not a startup.

## Writing rules (never violate)

- **"Grade", never "Year".** Grade 9, Grade 10, IGCSE, A-Levels. "Academic Year 2026-2027" is the one permitted use of the word.
- **No em dashes anywhere**, in content, code comments or commit messages. Use en dashes for ranges (Grades 9–10) and middots (·) as dividers.
- Clear, concise, warm. Address the reader as "you".
- Institutional content signs "British Section".

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

## Workflow expectations

- Placeholders, when any exist, are marked `<!-- PLACEHOLDER -->` and must read as plausible finished content, never "TBC". None remain as of 9 September 2026.
- Verify at ~380px width before considering any change done. The page must never scroll sideways; wide content scrolls inside its own container. Headless Chrome's `--window-size` does not go below the macOS minimum window width: a screenshot at that flag's floor is cropped to 380 pixels wide, not laid out at 380, and text gets cut off mid-word while the check still passes. Use `tools/shot.mjs` instead. It drives Chrome over the DevTools Protocol and sets a real `Emulation.setDeviceMetricsOverride`, so the page genuinely reflows at 380px, then asserts `scrollWidth <= clientWidth` and names any element that overflows. `bash tools/render-check.sh` runs it as its last step. Do not reach for `--window-size` for this check; it answers a different question and will pass on a page that is actually broken at 380px.
- Every internal anchor must resolve and every asset path must exist. Both are quick to check with grep.
- Pushing needs the `Mohamad-Dabbagh` gh account; `madabbagh` is read-only on the org. See `README.md`.
- The previous hub's content is archived at `~/Cooking/Rowad/parent-hub-archive-2026-08`. Do not resurrect it into this page without being asked.
