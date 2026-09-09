# AIS Parent Hub · British Section

Single-page Parent Hub for the AIS British Section, academic year 2026/27. It opened as the Parents' Meet & Greet page for Grades 9 and 10 on Wednesday 9 September 2026 and stays live through the year as the one link parents keep. The printed QR sheets label it "British Section, Grades 9 to 12"; the content is IGCSE-focused, with the A-Level options forms and the Grade 11 and 12 pages of the parent guide carried in the document library.

**Live at `https://ais-ig.github.io/hub/`**, repository `ais-ig/hub`. The earlier link, `ais-ig.github.io/meet-n-greet-26/`, redirects here.

The design follows the Grade 9 Pathway Hub, `https://ais-ig.github.io/g9-pathway-26/`, rebuilt in plain HTML and CSS. See `CLAUDE.md` for what was carried over and what was deliberately changed.

## Publishing

No build step. `index.html` is self-contained; PDFs and the emblem live in `assets/`.

This folder is a clone of `ais-ig/hub`. Commit and `git push origin main`; GitHub Pages deploys from `main`, root, within a minute or two. The `.nojekyll` file is required, do not delete it.

The `gh` CLI on this Mac has two accounts. `madabbagh` is active by default and is read-only on the `ais-ig` org. Pushes need `Mohamad-Dabbagh`, which is an org admin:

```
gh auth switch --user Mohamad-Dabbagh && git push origin main && gh auth switch --user madabbagh
```

Root-level PDFs are ignored by `.gitignore`. The Grade 11 and 12 options forms sitting in this folder are published from their copies in `assets/`.

## Open items

There are no `<!-- PLACEHOLDER -->` comments left in `index.html`. The 2026/27 homeroom mentors come from slide 19 of the final deck.

**Girls campus content was removed on 9 September 2026** at the user's request, because the evening was boys only. The two girls contact cards (Ms. Shamsiya Alkalbani, Head of School, Girls, and the Deputy Head, who appears as *Ms. Malak Rajeh* in the old hub package and *Ms. Malak Alkhasawna* in last year's presentation, both `m.alkhasawna@ais.sch.sa`) are in git history before commit `0f6b883` if the page is widened to both campuses again. The banner carries the boys campus gates from the printed guide.

**The presentation deck** is published as `assets/presentation-g9-g10.pdf`, the final 31-page `Parents Meet and Greet 2026-2027.pptx.pdf`, at the user's decision on 9 September 2026. Slides 17, 18 and 20 are screenshots of student-level records with names blanked. If that ever needs revisiting, regenerate the file without those pages with `pypdf`.

**The agenda card was removed** on 9 September 2026: no printed agenda document is being produced, and the programme lives on the page itself.

## The countdown

The hero counts down to the evening. It is driven by two attributes on the hero element itself, so the date lives next to the text that states it:

```html
<header class="hero" id="hero"
     data-doors="2026-09-09T18:30:00+03:00"
     data-end="2026-09-09T20:30:00+03:00">
```

`data-doors` is when doors open. `data-end` is when the evening finishes. Both are Riyadh time, which is what the `+03:00` says. Keep the offset.

**Changing the date means changing three things:** these two attributes and the date and time in the navy banner directly under the hero.

| When | Shows |
|---|---|
| Before `data-doors` | "Doors open in" and four cells: days, hours, minutes, seconds |
| Between `data-doors` and `data-end` | "The evening is under way · Please make your way in." |
| After `data-end` | "Thank you for joining us · We hope the evening was useful." |

If the attributes are missing or unparseable the whole block stays hidden. To retire the countdown between events, delete the two attributes.

**Ask a question** is a Google Form owned by the school, `https://docs.google.com/forms/d/e/1FAIpQLSe5bU8ruZOil2hbbXmYcrQNrXJu1IDsOPLj1kQ1FtgIGw69Ow/viewform`. It is linked from the hero, the Tonight's materials card, the Questions strip and the Ask a question block. Change all four together.

## Keeping the hub current through the year

The hero, the banner, the "Tonight's materials" band and the "Tonight's programme" section describe the *current* event. When the next parent-facing event comes round:

1. Change the hero `h1`, subtitle and description, and the two hero buttons.
2. Change `data-doors`, `data-end` and the banner line together.
3. Replace the cards in the band and the agenda in "Tonight's programme", or retitle that section.

Everything from "IGCSE results" down is reference material and stays as it is unless a source document changes.

## Adding a document

Files live in `assets/`. Every document appears once in **Everything in one place**; tonight's items also appear in the band under the hero, and forms and policies also appear in their own sections.

Nothing currently shows "Available soon". To announce a document before it exists, copy a live card or row, change the opening tag to `<span class="mcard soon">` or `<span class="doc soon">`, drop the `href`, and replace the arrow with "Available soon"; reverse that once the file lands in `assets/`. Add every new file to the `DOCUMENT PATHS` comment at the top of `index.html` and to the table above.

| File | Status | Appears in |
|---|---|---|
| `meet-and-greet-parent-guide-boys-2026-27.pdf` | live | band, Tonight's programme, library |
| `g9-igcse-options-2026-27.pdf` | live | band, Subject options, library |
| `g10-igcse-options-2026-27.pdf` | live | band, Subject options, library |
| `g11-as-options-2026-27.pdf` | live | library |
| `g12-a2-options-2026-27.pdf` | live | library |
| `british-curriculum-pathway-booklet.pdf` | live | library |
| `parent-letter-semester-1-2026-27.pdf` | live | library |
| `parents-calendar-2026-27.pdf` | live | library |
| `no-mobile-phone-policy.pdf` | live | Policies, library |
| `phone-policy-commitment-form.pdf` | live | Policies, library |
| `presentation-g9-g10.pdf` | live | band, library |

External links, the school's own pages: the Grade 9 and 10 IG weekly plans and the Parent Assessment Guide on `ict001001.github.io`, reached through the school-wide Linktree `linktr.ee/rowad.curriculum2627`, and the examination boards' syllabus pages for the confirmed IGCSE subjects.

**The parent guide** is pages 1 and 12 to 16 of the school's `AIS_Meet_and_Greet_Parent_Guide_Grades_7-12_Boys_09Sep2026.pdf`: the event map, the UK High School class lists for Grades 9 to 12, and the staff contacts. Regenerate it from the source with `pypdf` if the school reissues the guide.

**Known problems with the commitment form**, carried over from last year: it has a pre-filled date of 30/2/2025 and a Middle Section header rather than British Section.

## Syllabus links

`~/Downloads/AIS_Syllabus_Links_2026-2027.xlsx` lists the board and syllabus code per examined subject, with a Status column. Only rows marked Confirmed are on the page: Physics, Chemistry, Biology, Mathematics (Cambridge), Accounting, Computer Science and ICT, each linking the Cambridge A*-G qualification page. English (board and speaking variant open), Edexcel Mathematics (Specification A or B open), Business Studies (code changes for 2027 entries), Arabic (two boards both confirmed) and the Edexcel Biology entries are left out until settled. The sheet's Notes tab is internal and must not be published.

## The previous Parent Information Hub

Until 9 September 2026 this repository held a different page: a Parent Information Hub for Grades 9 to 12 with an Arabic toggle, a Boys/Girls toggle and Google Sheet hydration. It was never sent to parents. It is archived locally at `~/Cooking/Rowad/parent-hub-archive-2026-08` with its git history, and it remains in this repository's history before commit `0c7cb23`.
