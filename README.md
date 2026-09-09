# Parents' Meet & Greet · Grades 9 and 10

Single-page hub for the AIS British Section Parents' Meet & Greet, Grades 9 and 10 IG, academic year 2026/27. Replaces last year's `linktr.ee/ais.orientation`.

Parents open this on a phone from a WhatsApp link or a QR code on the printed agenda. It carries the evening's running order, the IGCSE subject options in full, assessment, support, policies, and every document in one place.

## Publishing

No build step. `index.html` is self-contained.

1. Create a repo in the `ais-ig` org, e.g. `meet-and-greet-26`, and push this folder.
2. Settings → Pages → deploy from `main`, root.
3. The `.nojekyll` file is already present and required, do not delete it.

Live at `https://ais-ig.github.io/meet-and-greet-26/`.

## Before it goes to parents

Everything marked `<!-- PLACEHOLDER -->` in `index.html` must be replaced or confirmed. Search the file for that string. There are four:

| Where | What to confirm |
|---|---|
| Hero | **The date, urgently, see below.** Plus start and end time, the venue for each campus, and the two `data-` attributes on the hero. |
| Section 01 | The running order and its timings, kept in step with the printed agenda |
| Section 05 | Homeroom mentor list for 2026/27, or delete the card if it should not be public |
| Contacts | Girls campus names and titles for this event |

**Name to check:** the Deputy Head of School on the girls campus appears as *Ms. Malak Rajeh* in the parent hub package and as *Ms. Malak Alkhasawna* in last year's presentation. Both give the address `m.alkhasawna@ais.sch.sa`. The page currently uses Alkhasawna. Confirm which is correct.

**Carried over from last year's poster, worth fixing in this year's artwork:** the printed agenda numbered its steps 01, 02, 03, 04, then 03 again for Prayer. This page numbers them 01 to 05.

### The date is derived, not confirmed

The 2026/27 Parent Calendar lists **Meet and Greet against week 2, the week beginning Sunday 30 August 2026**. It names the week, not the day.

Last year's calendar did the same thing, marking week 2, and the event itself ran on the **Wednesday** of that week. Applying that reading gives **Wednesday 2 September 2026**, which is what the page currently shows and what the countdown counts to.

Confirm the actual day with Mr. Farhan before the link goes anywhere near parents. The time and both venues are last year's and also unconfirmed.

## The countdown

The hero counts down to the evening. It is driven by two attributes on the hero element itself, so the date lives next to the text that states it:

```html
<div class="hero" id="hero"
     data-doors="2026-09-09T18:30:00+03:00"
     data-end="2026-09-09T20:30:00+03:00">
```

`data-doors` is **when registration opens**, not when the presentation starts, because that is when parents should arrive. `data-end` is when the evening finishes. Both are Riyadh time, which is what the `+03:00` says. Keep the offset.

**Changing the date means changing three things:** these two attributes, the Date row, and the Time row. They are all within a dozen lines of each other.

The countdown has three states and switches between them on its own:

| When | Shows |
|---|---|
| Before `data-doors` | Four cells: days, hours, minutes, seconds |
| Between `data-doors` and `data-end` | "The evening is under way · Please make your way in." |
| After `data-end` | "Thank you for joining us · We hope the evening was useful." |

So the page does not need touching on the night, or the morning after. If the attributes are missing or unparseable the whole block stays hidden, and it never renders as empty boxes before JavaScript runs.

## Adding a document

Files live in `assets/`. Two are already live; five render as a muted, dashed "Available soon" row until you publish them.

To publish one:

1. Drop the PDF into `assets/` using the exact filename listed in the `DOCUMENT PATHS` comment at the top of `index.html`.
2. Find its `<span class="doc soon">` block. There may be two, one in its own section and one in section 08.
3. Change `<span class="doc soon">` to `<a class="doc" href="assets/FILENAME.pdf" download>`, change the closing `</span>` to `</a>`, and replace `<span class="ar">Available soon</span>` with `<span class="ar" aria-hidden="true">→</span>`.

Copy an existing live row, such as either options form in section 08, to get the markup exactly right.

| File | Status | Appears in |
|---|---|---|
| `g9-igcse-options-2026-27.pdf` | live | sections 03, 08 |
| `g10-igcse-options-2026-27.pdf` | live | sections 03, 08 |
| `no-mobile-phone-policy.pdf` | live | sections 07, 08 |
| `phone-policy-commitment-form.pdf` | live | sections 07, 08 |
| `agenda-g9-g10.pdf` | pending | section 08 |
| `presentation-g9-g10.pdf` | pending | section 08 |
| `parents-calendar-2026-27.pdf` | pending | section 08 |

### The two phone policy files

Both are last year's, pulled from the old Linktree and now hosted here rather than linked out.

The **policy** carries no year or section stamp anywhere in its text, so it stands as-is for 2026/27. Nothing to reissue.

The **commitment form** has two problems, neither introduced here, both worth fixing before parents see it:

1. The Date row is **pre-filled with `30/ 2 /2025`**, left over from a specific incident last year. On a blank form handed to a parent, that reads as an error.
2. Its header says **`القسم المتوسط`, Middle Section**, not British Section. Grade 10 is secondary rather than intermediate, so the header may be wrong for this audience.

Page 2 is also blank apart from the letterhead.

If a corrected version is issued, overwrite `assets/phone-policy-commitment-form.pdf` and nothing else needs touching.

If a document's content changes, remember the page also states it in prose. The subject tables in section 03, the assessment breakdown in 04 and the phone policy tiers in 07 are all transcribed from the PDFs and must be updated alongside them.

## Out of scope

This hub covers Grades 9 and 10 only. The Grade 11 AS and Grade 12 A2 options forms sit unused in the repo root; move or delete them as you prefer.

## Checking a change

Open `index.html` in a browser at roughly 380px wide, which is the real reading context. Confirm the page never scrolls sideways, both grade tabs switch, and every download either opens a file or reads "Available soon". Nothing should 404.
