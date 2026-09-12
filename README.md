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

**The agenda card was removed** on 9 September 2026: no printed agenda document was ever produced. The on-page programme section it pointed to (`#s1`, "Tonight's programme") was itself retired on 12 September 2026, once the evening had passed; see "Keeping the hub current through the year" for what replaced it and how a future event's agenda would be added back.

## The countdown

The hero can count down to an evening. It is driven by two attributes on the hero element itself, so the date lives next to the text that states it:

```html
<header class="hero" id="hero"
     data-doors="2026-09-09T18:30:00+03:00"
     data-end="2026-09-09T20:30:00+03:00">
```

That was the format used for the 9 September 2026 Meet & Greet, kept here as an example of the shape rather than a current value; see below. `data-doors` is when doors open. `data-end` is when the evening finishes. Both are Riyadh time, which is what the `+03:00` says. Keep the offset.

No event is currently scheduled: both attributes are absent from the hero element, and the countdown block does not render as a result.

| When | Shows |
|---|---|
| Before `data-doors` | "Doors open in" and four cells: days, hours, minutes, seconds |
| Between `data-doors` and `data-end` | "The evening is under way · Please make your way in." |
| After `data-end` | "Thank you for joining us · We hope the evening was useful." |

If the attributes are missing or unparseable the whole block stays hidden. To retire the countdown between events, delete the two attributes.

This was fixed on 12 September 2026. Before then, `getAttribute` returned `null` for a missing attribute and `new Date(null)` is 1 January 1970, a valid date, so the guard passed and the block showed its closing message forever. The script now tests the attribute strings for presence before parsing them.

Bringing the countdown back for a future event is just those two attributes. The navy banner under the hero used to carry the same date in words, but since 12 September 2026 it shows the permanent school week schedule instead (see "Keeping the hub current through the year"), so nothing else on the page has to change alongside them.

**Ask a question** is a Google Form owned by the school, `https://docs.google.com/forms/d/e/1FAIpQLSe5bU8ruZOil2hbbXmYcrQNrXJu1IDsOPLj1kQ1FtgIGw69Ow/viewform`. It is linked from three places: the hero button, the Start here card, and the Ask a question block near the foot of the page. Change all three together.

## Keeping the hub current through the year

There is no event on the page. The Meet & Greet took place on 9 September 2026, and on 12 September 2026 the "Tonight's programme" section it lived in, together with the countdown's live dates, were retired: once the evening had passed, a page still counting down to it and still headed "Parents' Meet & Greet" was actively wrong, not just stale. What replaced it is reference material, updated only when a source document changes:

- **Class timetables** (`#schedule`), the current timetable; see "Updating the timetable" below.
- Everything from **IGCSE results** down: results, pathway, options, assessment, support, activities, policies and contacts. See `CLAUDE.md`, "Content sources", for what each is duplicated from.
- **What's changed this year** (`#changelog`), a running log fed by the `updatesData` array; see "Recording a change" below.

The hero, the banner and the nav are deliberately generic now ("Parent Hub", a permanent school week strip), not describing an evening. Do not rename them back to an event just because one is coming up; the countdown exists for that.

**Bringing back an event.** The countdown's markup and script were never removed, only its two attributes, so switching it on again is small:

1. Add `data-doors` and `data-end` back to `<header class="hero" id="hero">`, in Riyadh time with the `+03:00` offset. See "The countdown" above.
2. Add one entry to `updatesData` announcing it, so a parent who has already bookmarked the hub sees it in the strip rather than finding out by chance.
3. If the event needs its own on-page agenda, the numbered-agenda-card pattern from the old "Tonight's programme" section is still in the stylesheet as the `.agenda` / `.ag` rules. They render nothing today, on purpose: they were left in place for exactly this, so reuse them rather than inventing a new pattern.
4. Word any new copy so it still reads correctly once the event has passed, the way "Meet & Greet · 9 September 2026" does in the document library, rather than assuming it is still upcoming. `node tools/check.mjs` fails on the word "tonight" anywhere in the file, which exists to catch copy that goes stale the moment the event ends.

## Adding a document

Files live in `assets/`. Every document appears once in **Everything in one place**; the ones parents need first also appear in the Start here band under the hero, and forms and policies also appear in their own sections.

Nothing currently shows "Available soon". To announce a document before it exists, copy a live card or row, change the opening tag to `<span class="mcard soon">` or `<span class="doc soon">`, drop the `href`, and replace the arrow with "Available soon"; reverse that once the file lands in `assets/`. Add every new file to the `DOCUMENT PATHS` comment at the top of `index.html` and to the table above.

| File | Status | Appears in |
|---|---|---|
| `class-timetables-boys.pdf` | live | band, Class timetables, library |
| `meet-and-greet-parent-guide-boys-2026-27.pdf` | live | band, library |
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

External links, the school's own pages: the Grade 9 and 10 IG weekly plans and the Parent Assessment Guide on `ict001001.github.io`, reached through the school-wide Linktree `linktr.ee/rowad.curriculum2627`.

**The parent guide** is pages 1 and 12 to 16 of the school's `AIS_Meet_and_Greet_Parent_Guide_Grades_7-12_Boys_09Sep2026.pdf`: the event map, the UK High School class lists for Grades 9 to 12, and the staff contacts. Regenerate it from the source with `pypdf` if the school reissues the guide.

**Known problems with the commitment form**, carried over from last year: it has a pre-filled date of 30/2/2025 and a Middle Section header rather than British Section.

## Updating the timetable

The current timetable is always `assets/class-timetables-boys.pdf`. **That path
never changes**, which is the whole point: parents keep the link.

1. `cp assets/class-timetables-boys.pdf assets/archive/class-timetables-boys-<old generated date>.pdf`
2. Copy the new aSc export over `assets/class-timetables-boys.pdf`
3. **Check the class list.** Run the page-order loop in
   `docs/superpowers/plans/2026-09-12-timetable-and-updates.md`, Task 4 Step 3.
   If a class was added or removed, the eleven links in `#schedule` must be
   re-derived before you push.
4. Update the "in effect from" line and the issued date in `#schedule`
5. Bump `?v=` on every timetable link: the section, the Start here card and
   the library row
6. Add one entry to `updatesData`
7. `node tools/check.mjs && bash tools/render-check.sh`
8. Commit, push, and share `https://ais-ig.github.io/hub/#schedule`

**Share the section, never the raw PDF.** A raw PDF URL a parent has already
opened can be served from their phone's cache for a long time. The hub page
is HTML and refreshes quickly, and the link on it carries the bumped `?v=`.

The archive filename uses the aSc **"Timetable generated"** date printed on
every page, not the publish date, so a parent holding a printout can match
their copy.

## Recording a change

`updatesData` near the top of `index.html` is one JSON array. Add an entry and
both the strip under the banner and the "What's changed this year" section
pick it up; the three newest show in the strip. Order in the file does not
matter. An entry dated within 14 days gets a "New" badge that expires on its
own. `date` must be `YYYY-MM-DD`; `title` and `text` are required; `href` and
`label` are optional and go together.

## Checking your work

Three scripts, each catching something the ones before it cannot:

```
node tools/check.mjs        # Static checks over index.html: anchors resolve,
                             # asset paths exist, no em dashes, only the
                             # allowed Poppins weights, no event language
                             # ("tonight"), and updatesData is well formed.
                             # No browser. Exits 0 or 1.

bash tools/render-check.sh  # Renders index.html in headless Chrome and
                             # asserts on the resulting DOM: the countdown
                             # stays hidden with no attributes set, and the
                             # updates strip and change log render once
                             # updatesData has entries. Finishes by running
                             # tools/shot.mjs.

node tools/shot.mjs         # The true 380px mobile check. Drives Chrome over
                             # the DevTools Protocol and sets a real
                             # Emulation.setDeviceMetricsOverride, so the page
                             # genuinely reflows at 380px instead of being
                             # laid out wide and cropped (see CLAUDE.md on why
                             # --window-size cannot do this). Fails, and names
                             # the offending element, if scrollWidth exceeds
                             # clientWidth. Screenshot at
                             # $TMPDIR/hub-check/w380.png.
```

`render-check.sh` runs `shot.mjs` as its last step, so running it on its own
covers all three day to day; call `shot.mjs` directly when you only need the
mobile layout check. All must pass before pushing.

## Syllabus links

Removed from the page on 9 September 2026 pending manual verification with Mr. Farhan. `~/Downloads/AIS_Syllabus_Links_2026-2027.xlsx` lists the board and syllabus code per examined subject with a Status column, and the seven rows marked Confirmed (Physics, Chemistry, Biology, Mathematics (Cambridge), Accounting, Computer Science, ICT) were briefly linked from Subject options. The card is in git history at commit `e513b38` and can be restored once each row is checked against the entry file. The sheet's Notes tab is internal and must not be published.

## The previous Parent Information Hub

Until 9 September 2026 this repository held a different page: a Parent Information Hub for Grades 9 to 12 with an Arabic toggle, a Boys/Girls toggle and Google Sheet hydration. It was never sent to parents. It is archived locally at `~/Cooking/Rowad/parent-hub-archive-2026-08` with its git history, and it remains in this repository's history before commit `0c7cb23`.
