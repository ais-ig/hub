# AIS British Section · Parents' Meet & Greet, Grades 9 and 10

## What this project is

A single-page hub for the Parents' Meet & Greet evening at Al-Rowad International Schools, Riyadh, British Section, **Grades 9 and 10 only**, boys and girls, academic year 2026/27. It replaces `linktr.ee/ais.orientation`, which served the same purpose in 2025 as an undifferentiated list of PDF buttons.

Parents open it on a phone, from a WhatsApp link or a QR code on the printed agenda. It is a practical reference for one evening and the weeks around it, not a marketing page and not a year-round hub.

## Architecture (locked decisions, do not revisit)

- **One self-contained `index.html`** on GitHub Pages. All CSS and JS inline. No build step, no framework, no dependency beyond Google Fonts.
- **Mobile-first**, 480px column, widening to 720px above that breakpoint.
- **English only.** No language toggle, no RTL. Every document the school produces for this evening is English.
- **No campus toggle.** Grades 9 and 10 curriculum, options, assessment and policies are identical across campuses. Only event venue and contacts differ, and both appear side by side.
- **No Google Sheets hydration.** All content is static. The parent hub's CSV layer was deliberately dropped: this page describes a fixed event, so there is nothing volatile enough to justify the failure surface.
- **PDFs live in `assets/`** and are linked relatively. Never link to Google Drive.
- Documents not yet produced render as a muted `.doc.soon` row reading "Available soon" rather than a link that 404s.
- **The hero carries a countdown**, in the pattern of the Grade 9 Pathway hub (`ais-ig/g9-pathway-26`). It reads `data-doors` and `data-end` off the hero element rather than a JS constant, so the machine-readable date sits beside the human-readable one. Three self-switching states: counting, "under way", "thank you". Hidden until JS validates both dates, so it never flashes empty cells. Do not move these dates into a constant, and do not let the attributes drift from the Date and Time rows.

## Design direction

Visual sibling of the AIS Parent Information Hub, evolved not cloned. It shares that hub's brand tokens, card vocabulary, section rhythm and nav grid. Two patterns are specific to this page:

- **The agenda timeline** in section 01, a gold numeral on deep navy beside a white detail panel. It is a deliberate echo of the printed Meet & Greet poster and is the page's visual signature.
- **The options tables and choice pairs** in section 03. Grade 9's either/or rows render as choice-pair cards rather than a four-column table, because "choose one from each pair" reads far better that way on a phone than a table does.

The printed material is yellow-dominant. This page is cream-dominant with gold as accent, matching the parent hub. Let the gold timeline numerals carry the callback rather than flooding the page with yellow.

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
| 03 Subject options | `assets/g9-igcse-options-2026-27.pdf` and `assets/g10-igcse-options-2026-27.pdf` |
| 04 Assessment | Teachers' Guide, British Section, Assessment breakdown for 2026/2027. **Not a parent-facing document, so it is a source only and is deliberately not linked as a download.** |
| 05, 06 | 2025 Meet & Greet presentation, pending the 2026/27 update |
| 07 Policies | `assets/no-mobile-phone-policy.pdf`, plus the behaviour levels from the 2025 presentation |

**When a source PDF changes, the prose must change with it.** The subject tables, the assessment breakdown and the phone policy tiers are all duplicated from documents. Do not update one without the other.

Changes already carried in for 2026/27, worth knowing: Grade 9 Islamic Studies moved 3 to 2 periods and Quran 2 to 3; several optional loads changed in both grades; Grade 9 gained an optional Hifdh Programme, which sits inside the existing three Quran periods and neither adds to the forty-period week nor replaces a subject.

Assessment changed too, and the numbers on the page are the 2026/27 ones, not the 2025 deck's: classwork moved 5 to 6 and homework 5 to 4, so continuous assessment still totals 10 per quarter but is weighted towards classwork. "Mid-semester Test" is now "Mid-Term Test" and "End of Semester Exam" is now "Final Examination". The old "rubric 0 to 5" line is gone, because a 0 to 5 rubric no longer maps onto a 6 mark classwork component.

## Workflow expectations

- Placeholders are marked `<!-- PLACEHOLDER -->` and must read as plausible finished content, never "TBC". `README.md` lists all four.
- Verify at ~380px width before considering any change done. The page must never scroll sideways; wide content scrolls inside its own container.
- Every internal anchor must resolve and every asset path must exist. Both are quick to check with grep.
