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
| `assets/class-timetables-boys.pdf` | Always the current timetable. The path never changes. |
| `assets/archive/class-timetables-boys-YYYY-MM-DD.pdf` | Each superseded timetable, kept for reference. |

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
  `assets/class-timetables-boys.pdf?v=2026-09-13`, bumped on every revision so a
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
  `assets/class-timetables-boys.pdf?v=...#page=N`.
- A gold **"Open the full timetable"** button for anyone who wants all 11
  pages.
- A muted line giving the generated date, so a parent can confirm they are
  looking at the current one.

### On the page fragment

**Tested on real devices, 13 September 2026.** `#page=N` works on macOS and on
iPad. It does NOT work on iPhone, and it does NOT work on Android. Both open
the file at page 1 regardless of the fragment.

That is the majority of this hub's parents, so the fragment is a bonus for
desktop and iPad users rather than the mechanism the section relies on. The
mechanism is the page number printed on each pill, in small muted type beneath
the class label: a parent who lands on page 1 reads "Page 11" on the 12B pill
and scrolls to it. The explanatory sentence that sat above the pills was
removed on 13 September as clutter; the numbers carry the meaning on their own.

The failure mode is therefore: correct file, page 1 instead of the child's
page, recoverable by reading the number on the pill. It never produces a broken
link, and the full-timetable button is unaffected. Accepted.

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

1. `cp assets/class-timetables-boys.pdf assets/archive/class-timetables-boys-<old generated date>.pdf`
2. Copy the new aSc export to `assets/class-timetables-boys.pdf`
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

---

# Amendment · 12 September 2026 · retiring the event

Added after the first version was approved. The Meet & Greet took place on
Wednesday 9 September; the hub is now a year-round reference and the event
language has to go in the same pass as the timetable, not a later one.

## Why this belongs in the same commit

The page currently says "Thank you for joining us" above a banner dated to a
past Wednesday, under a band called "Tonight's materials". Publishing a
timetable into that frame would put the most current thing on the page inside
the most stale part of it. The two changes are one change.

There are 28 occurrences of event-bound language. All of them are listed
below; nothing is left to judgement at implementation time.

## What is retired, and what replaces it

### The countdown

Delete `data-doors` and `data-end` from the hero element. The block hides
itself, which is the documented retirement path in the README. **The markup
and the JS both stay**, so the next event is two attributes and a banner
line, exactly as before. Nothing about the countdown's behaviour changes.

### The hero

| | Now | After |
|---|---|---|
| `h1` | Parents' Meet & Greet | Parent Hub |
| `.sub` | British Section IGCSE, Academic Year 2026/27 | unchanged |
| `.desc` | opens "Your one place for tonight's programme..." | rewritten to lead with the timetable and drop the event |
| gold button | Tonight's programme → `#s1` | Class timetables → `#schedule` |
| outline button | Ask a question | unchanged |

### The banner

The navy strip is a carried-over design element and should not simply be
deleted. It stops describing an evening and starts describing the school
week, which is the year-round equivalent and is genuinely useful:

```
📅 Sunday to Thursday   ⏰ 7:00 AM – 12:50 PM   📍 Boys campus · British Section
```

Those hours are taken from the timetable itself, so the banner and the
schedule section now share a source. **If period times change, both change.**

### "Tonight's materials" band

Renamed **"Start here"**, subtitle reworded off the evening. It keeps its
`id="materials"` so no anchor breaks. Card order changes so that **Class
timetables becomes the first card**. The "Ask a question" card text drops
"about tonight". The presentation card is re-described as the Meet & Greet
slides rather than "tonight's".

Nav label "Tonight's materials" becomes "Start here".

### "Tonight's programme" (`#s1`)

**Deleted in full.** The three agenda steps and the "Finding your way" card
are about gates, stalls and a 6:30 arrival on a night that has happened.
There is nothing in the section worth carrying forward, and keeping it in the
past tense would give the page a museum exhibit at the top.

`#s1` is referenced exactly twice, from the nav and the hero gold button, and
both are rewritten above. Verified by grep; no other anchor points at it.
`#schedule` becomes the first section on the page.

### The document library

The `<h4>Tonight</h4>` group becomes **"Meet & Greet · 9 September 2026"**.
Dating it turns a heading that decays into one that stays true, and it gives
later events an obvious place to sit. Both rows under it stay: the parent
guide and the deck are still useful documents.

A new `<h4>Timetables</h4>` group is added above it, carrying the timetable
row.

### "Have a question about tonight?"

Becomes **"Have a question?"**. The lead drops "during the presentation" and
"after the evening". The email fallback to the Head of School stays exactly
as it is.

### Meta description

Rewritten to drop "Tonight's Parents' Meet & Greet programme" and lead with
the timetable. It is the text that shows in a WhatsApp link preview, so it is
the first thing many parents read.

## One updates entry for the change itself

The de-event-ing gets its own entry in `updatesData`, dated 2026-09-13,
saying the hub is now the year-round reference and what to find on it. A
parent who bookmarked a page headed "Parents' Meet & Greet" and returns to
one headed "Parent Hub" should not have to wonder whether they are in the
right place. This is the first real justification for the updates layer
existing, which is a good sign it is the right feature.

## What is deliberately not done here

The hero, the nav order and the section sequence are **not** rethought. That
is the "full repositioning" option, and it was set aside as its own piece of
work. This amendment does the minimum that makes the page honest: it removes
what is false and renames what is misleading. The page's shape is untouched.

## Additional verification

On top of the checks in the first version:

- `grep -in "tonight\|this evening\|doors open" index.html` returns nothing
  outside the countdown's own JS strings and the dated Meet & Greet heading.
- Every anchor still resolves after `#s1` is removed.
- The countdown block is absent from the rendered page, and re-adding the two
  attributes brings it back correctly.

## Still blocked on the user

Unchanged from the first version and still unanswered:

1. Confirmation that `~/Downloads/sched13sep2026/IG Classes.pdf`, generated
   10/09/2026, is final.
2. Confirmation that the class list is still 9A–9D, 10A–10C, 11A–11B, 12A–12B.
3. Whether the departmental timetables are staff-facing only.
4. The expected revision cadence.
5. Whether a girls-campus timetable exists, which decides whether the file is
   `class-timetables-boys.pdf` or `class-timetables-boys.pdf`.

Items 1 and 2 block publication. Item 5 blocks the filename, which is the one
thing in this design that is expensive to change later, because the whole
point is that the address is permanent. **Everything in this amendment can be
built and reviewed before any of them are answered**, since none of it
touches the timetable file itself.

---

# Resolutions · 12 September 2026

All five blocking questions are answered. Nothing in this design is open.

| # | Question | Answer |
|---|---|---|
| 1 | Is the 10/09/2026 export final? | Yes. `~/Downloads/sched13sep2026/IG Classes.pdf` is the file to publish. |
| 2 | Is the class list unchanged? | Yes. 9A–9D, 10A–10C, 11A–11B, 12A–12B, so the eleven page offsets hold. |
| 3 | Are the departmental timetables staff-facing? | Yes. Not published. |
| 4 | Revision cadence | No change to the design. The section carries a visible generated date regardless. |
| 5 | Girls campus | **The hub stays boys campus.** |

## On question 5

This was asked because the answer first given, that the hub would be girls
only, contradicted the file being published: the confirmed class list and
every teacher named on the export are boys campus, as is the parent guide,
the gates, the staff contacts and the mentors. Re-asked and resolved as boys.

**The asset is therefore `class-timetables-boys.pdf`, not
`class-timetables.pdf`**, and the archive is suffixed to match. The suffix
costs nothing today and means a girls hub can exist later without either page
having to break a link parents have already saved. Given that the entire
purpose of this design is an address that never changes, paying one word now
to keep that promise is the right trade.

Every campus-specific string added in this pass carries the same suffix or
label, so a future girls hub is a copy and a substitution rather than an
untangling.
