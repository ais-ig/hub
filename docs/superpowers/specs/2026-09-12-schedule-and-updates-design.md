# Class timetables and a "what changed" layer for the Parent Hub

Design, 12 September 2026. Approved in chat before writing.

## The problem

Two problems, one shared cause.

**The timetable keeps changing.** It has changed three times since the year
opened: aSc exports generated 29 August, 3 September, 4 September and now
10 September 2026, the last of which takes effect Sunday 13 September. Every
change so far has meant a fresh file sent round, so parents hold several
copies and cannot tell which is current. We need one address that is always
the newest timetable, and we need it to stay that address in March.

**Nothing on the hub says what moved.** The hub is the link parents keep for
the year, so a parent returning in November has no way to tell whether
anything changed since September short of rereading the page. The hub needs
a visible, honest statement of recent changes.

The shared cause is that the hub currently has no concept of a document that
revises. Every asset is published once and assumed final. This design adds
that concept.

## Decisions

Settled in conversation before this document:

1. **One file, not eleven.** The aSc export always arrives as a single
   11-page PDF in a fixed class order. Publish it whole and link into it per
   class with PDF page fragments, rather than splitting it per grade or per
   class every revision.
2. **Fixed filename plus a dated archive.** The current timetable always
   lives at one path; superseded ones are kept, dated, and reachable.
3. **One updates array, two renderings.** A single inline JSON array drives
   both a strip near the top of the page and a full log further down, so a
   change is authored once.

Everything stays inside the locked architecture: one self-contained
`index.html`, no build step, no dependency, no hydration, PDFs in `assets/`
linked relatively.

## Part 1 · The timetable asset

### Paths

| Path | Role |
|---|---|
| `assets/class-timetables.pdf` | Always the current timetable. The path never changes. |
| `assets/archive/class-timetables-YYYY-MM-DD.pdf` | Each superseded timetable, kept for reference. |

The archive filename carries the aSc **"Timetable generated"** date printed
on every page of the export, not the date it was published. A parent holding
a printout can read that date off their own copy and match it. The publish
date is recorded separately, in the updates log.

The archive starts empty. The 10 September export is the first timetable the
hub has ever carried, so the three earlier ones are not backfilled: they were
never published here and adding them would imply otherwise.

Source for the first publication:
`~/Downloads/sched13sep2026/IG Classes.pdf`, generated 10/09/2026, 11 pages.

### Page order

Fixed by the export and verified against the file:

| Pages | Classes |
|---|---|
| 1–4 | 9A, 9B, 9C, 9D |
| 5–7 | 10A, 10B, 10C |
| 8–9 | 11A, 11B |
| 10–11 | 12A, 12B |

These offsets are only safe while the class list is unchanged. **If the
school adds or removes a class, the pills must be re-derived from the new
export before publishing.** The runbook below makes that a required step.

### Cache

The stable URL is exactly the thing that caches hardest, which is the one
real cost of this approach. Two mitigations:

- The page's own link carries a version query,
  `assets/class-timetables.pdf?v=2026-09-13`, bumped on every revision so a
  parent arriving through the hub always gets the new bytes.
- **The link shared on WhatsApp is `https://ais-ig.github.io/hub/#schedule`,
  never the raw PDF.** The hub page is HTML and refreshes quickly; a raw PDF
  URL a parent has already opened can be served from their phone for a long
  time. Share the section, let the section point at the file.

This is a distribution rule, not a code change, and belongs in the README so
it survives.

## Part 2 · The schedule section

A new `<section class="sec" id="schedule">` placed immediately after
"Tonight's programme" (`#s1`), making it the first reference section on the
page. It is deliberately high: it is the most volatile thing here and the
reason most parents will come back. When the event content is eventually
retired, it becomes the top of the page, which is correct.

Contents, in the existing section grammar (24px navy `h2`, grey subtitle,
gold bar):

- **h2** "Class timetables"
- **Subtitle** "Grades 9 to 12 · boys campus · in effect from Sunday 13
  September 2026"
- A one-line orientation note: the week runs Sunday to Thursday, periods 1 to
  8, 7:00 AM to 12:50 PM, with break from 9:40 to 10:10.
- **Eleven class pills**, grouped under small grade labels, each linking to
  `assets/class-timetables.pdf?v=...#page=N`.
- A gold **"Open the full timetable"** button for anyone who wants all 11
  pages.
- A muted line giving the generated date, so a parent can confirm they are
  looking at the current one.

### On the page fragment

`#page=N` is honoured by Safari on iOS, Chrome on Android and every desktop
browser. If a parent's phone hands the PDF to Google Drive or the Files app,
the fragment may be ignored and the file opens on page 1. That is the whole
failure mode: correct file, wrong page. It never produces a broken link, and
the full-timetable button is always there as the plain path. Accepted.

### Styling

A new `.classlinks` block, built only from tokens already on the page: navy
`#1D5394`, deep navy `#0C2E54`, yellow `#EDBA1D`, Poppins 400 and 500. Pills
wrap freely, so eleven of them reflow to a phone without a horizontal
scroll. No new colour, no new weight, no 600 or 800.

## Part 3 · The updates layer

### The data

One inline block near the top of `<body>`, authored by hand:

```html
<script type="application/json" id="updatesData">
[
  {
    "date": "2026-09-13",
    "title": "New class timetables",
    "text": "The timetable for Grades 9 to 12 has changed and takes effect today.",
    "href": "#schedule",
    "label": "See the timetables"
  }
]
</script>
```

`href` and `label` are optional; an entry without them renders as text. Order
in the file does not matter, because the renderer sorts by date, newest
first. This is the single place a change is recorded.

### The renderings

**The strip**, `#updatesStrip`, directly under the navy event banner. The
three newest entries, compact, white ground with a gold left rule per item so
it reads as distinct from the gold-tinted materials band below it. This is
the "status thing at the top" and it is the part a returning parent sees
without scrolling.

**The log**, `<section class="sec alt" id="changelog">`, placed after
"Everything in one place" (`#s8`). Title "What's changed this year",
subtitle "Every update to this page since it went live, newest first." All
entries, no cap.

Both get nav menu entries.

### The "New" badge

An entry dated within the last 14 days renders a small gold "New" pill. The
threshold is computed against the current date at render time, so the badge
expires by itself. Nothing needs to be remembered or cleaned up, which is the
point: this page will still be running in March and the maintenance has to
approach zero.

### Behaviour and failure

About 25 lines of JS, in the existing inline script block.

- Dates are parsed from their `YYYY-MM-DD` parts, not handed to the `Date`
  string parser, so no timezone shifts a day.
- Month names come from a literal array, so formatting does not depend on the
  visitor's locale. The page is English only.
- If the JSON is missing, malformed or an empty array, **both containers stay
  hidden.** This mirrors the countdown, which stays hidden until it has
  validated its dates rather than flashing empty cells. It also means that a
  quiet stretch with nothing to announce degrades to a clean page rather than
  an empty box saying nothing changed.

## Maintenance runbook

To be added to the README verbatim. Publishing a new timetable:

1. `cp assets/class-timetables.pdf assets/archive/class-timetables-<old generated date>.pdf`
2. Copy the new aSc export to `assets/class-timetables.pdf`
3. **Confirm the class list is unchanged.** If a class was added or removed,
   re-derive the eleven pills and their page numbers from the new export.
4. Update the generated date and the "in effect from" line in `#schedule`
5. Bump `?v=` on every link in that section
6. Add one entry to `updatesData`
7. Commit, push, and share `https://ais-ig.github.io/hub/#schedule`

Roughly two minutes, and the only judgement call is step 3.

## Verification

Before the change is considered done:

- Renders correctly at 380px with no sideways scroll, checked through
  DevTools device emulation rather than `--window-size`.
- Every internal anchor resolves and every asset path exists, both by grep.
- `updatesData` parses, and all three badge states behave: an entry inside 14
  days, one outside it, and an empty array.
- All eleven pills open the right page in at least one real mobile browser.

## Out of scope

- **The departmental teacher timetables** that ship alongside the export
  (`Arabic.pdf`, `Math.pdf`, `Science.pdf` and the rest) are staff-facing and
  are not published here.
- **Per-class or per-grade split files.** Reconsider only if parents actually
  ask.
- **Girls campus.** The hub is boys campus only, per the 9 September decision.
- **Deriving the log from git history.** Commit messages are written for us,
  not for parents.

## Deferred

An "Updated 12 Sep" pill on the matching row in the document library, matched
by `href` against the same updates array. Genuinely nice, entirely additive,
and easy to add once the array exists. Left out of the first cut to keep the
change reviewable.
