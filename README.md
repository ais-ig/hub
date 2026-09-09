# AIS Parent Hub · Grades 9 and 10

Single-page Parent Hub for the AIS British Section, Grades 9 and 10 IG, academic year 2026/27. It opened as the Parents' Meet & Greet page on Wednesday 9 September 2026 and stays live through the year as the one link parents keep. Parents open it on a phone from a WhatsApp link or a QR code.

**Live at `https://ais-ig.github.io/hub/`**, repository `ais-ig/hub`. The earlier link, `ais-ig.github.io/meet-n-greet-26/`, now redirects here.

The design follows the Grade 9 Pathway Hub, `https://ais-ig.github.io/g9-pathway-26/`, rebuilt in plain HTML and CSS. See `CLAUDE.md` for what was carried over and what was deliberately changed.

## Publishing

No build step. `index.html` is self-contained; PDFs and the emblem live in `assets/`.

This folder is a clone of `ais-ig/hub`. Commit and `git push origin main`; GitHub Pages deploys from `main`, root, within a minute or two. The `.nojekyll` file is required, do not delete it.

The `gh` CLI on this Mac has two accounts. `madabbagh` is active by default and is read-only on the `ais-ig` org. Pushes need `Mohamad-Dabbagh`, which is an org admin:

```
gh auth switch --user Mohamad-Dabbagh && git push origin main && gh auth switch --user madabbagh
```

Root-level PDFs are ignored by `.gitignore`, so the Grade 11 and 12 options forms sitting in this folder are not published.

## Placeholders still open

Everything marked `<!-- PLACEHOLDER -->` in `index.html` must be replaced or confirmed. Search the file for that string. There are three:

| Where | What to confirm |
|---|---|
| The evening | The running order and its timings, kept in step with the printed agenda |
| Support | Homeroom mentor list for 2026/27, or delete the block if it should not be public |
| Who to speak to | Girls campus names and titles |

**Name to check:** the Deputy Head of School on the girls campus appears as *Ms. Malak Rajeh* in the old parent hub package and as *Ms. Malak Alkhasawna* in last year's presentation. Both give the address `m.alkhasawna@ais.sch.sa`. The page currently uses Alkhasawna. Confirm which is correct.

The event date was confirmed on 9 September 2026: Wednesday 9 September, registration from 6:30 PM. The times of the individual agenda steps and both venues are last year's, carried forward.

## The countdown

The hero counts down to the evening. It is driven by two attributes on the hero element itself, so the date lives next to the text that states it:

```html
<header class="hero" id="hero"
     data-doors="2026-09-09T18:30:00+03:00"
     data-end="2026-09-09T20:30:00+03:00">
```

`data-doors` is **when registration opens**, not when the presentation starts, because that is when parents should arrive. `data-end` is when the evening finishes. Both are Riyadh time, which is what the `+03:00` says. Keep the offset.

**Changing the date means changing three things:** these two attributes and the date and time in the navy banner directly under the hero. They are within thirty lines of each other.

The countdown has three states and switches between them on its own:

| When | Shows |
|---|---|
| Before `data-doors` | "Doors open in" and four cells: days, hours, minutes, seconds |
| Between `data-doors` and `data-end` | "The evening is under way · Please make your way in." |
| After `data-end` | "Thank you for joining us · We hope the evening was useful." |

So the page does not need touching on the night, or the morning after. If the attributes are missing or unparseable the whole block stays hidden, and it never renders as empty boxes before JavaScript runs.

## Keeping the hub current through the year

The hero and the banner describe the *current* event. When the next parent-facing event comes round:

1. Change the hero `h1`, subtitle and description.
2. Change `data-doors`, `data-end` and the banner line together.
3. Replace the agenda cards in "How the evening runs", or retitle that section.

To retire the countdown between events, delete the two `data-` attributes and the block hides itself. Everything below the banner is reference material and stays as it is unless a source document changes.

## Adding a document

Files live in `assets/`. Every document appears once in the **Documents band** under the hero. The options forms and the two phone policy files also appear as rows in their own sections.

To publish a document that currently shows "Available soon":

1. Drop the PDF into `assets/` using the exact filename listed in the `DOCUMENT PATHS` comment at the top of `index.html`.
2. Find its `<span class="mcard soon">` block in the Documents band.
3. Change the opening tag to `<a class="mcard" href="assets/FILENAME.pdf" download>`, change the closing `</span>` to `</a>`, and replace `<span class="cta">Available soon</span>` with `<span class="cta">Open PDF →</span>`.

Copy a live card, such as either options form, to get the markup exactly right. To add a brand-new document, copy a live card and give it a new title, description and filename.

| File | Status | Appears in |
|---|---|---|
| `g9-igcse-options-2026-27.pdf` | live | band, Subject options |
| `g10-igcse-options-2026-27.pdf` | live | band, Subject options |
| `parents-calendar-2026-27.pdf` | live | band |
| `no-mobile-phone-policy.pdf` | live | band, Policies |
| `phone-policy-commitment-form.pdf` | live | band, Policies |
| `agenda-g9-g10.pdf` | soon | band |
| `presentation-g9-g10.pdf` | soon | band |

**Known problems with the commitment form**, carried over from last year: it has a pre-filled date of 30/2/2025 and a Middle Section header rather than British Section. Reissue it when convenient.

## The previous Parent Information Hub

Until 9 September 2026 this repository held a different page: a Parent Information Hub for Grades 9 to 12 with an Arabic toggle, a Boys/Girls toggle and Google Sheet hydration. It was never sent to parents. It is archived locally at `~/Cooking/Rowad/parent-hub-archive-2026-08` with its git history, and it remains in this repository's history before commit `0c7cb23`.
