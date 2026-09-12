# Class Timetables and Updates Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the class timetables at a permanent address, add a "what changed recently" layer, and retire the Meet & Greet event language so the hub reads as a year-round reference.

**Architecture:** Everything stays in the single self-contained `index.html`. The timetable is one PDF at a fixed path, linked per class with `#page=N` fragments, with superseded copies kept in `assets/archive/`. One inline JSON array drives both an updates strip near the top and a change log further down, so a change is authored once and rendered twice.

**Tech Stack:** Plain HTML, CSS and ES5 JavaScript inline in one file. No build step, no framework, no dependency beyond Google Fonts. Node (for the check script) and headless Chrome (for render checks) are development tooling only and ship nothing.

**Spec:** `docs/superpowers/specs/2026-09-12-schedule-and-updates-design.md`

## Global Constraints

Copied verbatim from `CLAUDE.md`. Every task's requirements implicitly include these.

- **Colours:** navy `#1D5394`, deep navy `#0C2E54`, yellow `#EDBA1D`. No other accent colours. Use the existing custom properties (`--navy`, `--navy-deep`, `--gold`, `--cream`, `--card`, `--border`, `--gold-tint`, `--gold-tint-2`, `--ink`, `--ink-soft`, `--muted`).
- **Poppins only, weights 300 / 400 / 500 / 700. Never 600 or 800.**
- **"Grade", never "Year".** "Academic Year 2026-2027" is the one permitted use of the word.
- **No em dashes anywhere**, in content, code comments or commit messages. En dashes for ranges (Grades 9–10), middots (·) as dividers.
- **English only.** No language toggle, no RTL.
- **Mobile-first**, 800px content column. Must render at 380px with no sideways scroll. Wide content scrolls inside its own container.
- **PDFs live in `assets/`** and are linked relatively. Never link to Google Drive.
- JavaScript matches the existing house style: one IIFE, `'use strict'`, `var`, function expressions, no arrow functions, no `const`/`let`, defensive null checks. ES5 only.
- Institutional, warm, trustworthy tone. Address the reader as "you". A school, not a startup.

---

### Task 1: Verification harness

`CLAUDE.md` already requires that "every internal anchor must resolve and every asset path must exist" and that changes are checked at 380px. Nothing automates that today. This task builds the harness first so every later task has something to run.

**Files:**
- Create: `tools/check.mjs`
- Create: `tools/render-check.sh`

**Interfaces:**
- Consumes: nothing.
- Produces: `node tools/check.mjs` exits 0 on success, 1 on failure, printing one line per failure. `bash tools/render-check.sh` renders the page in headless Chrome, asserts on the resulting DOM, and writes a 380px screenshot to `$TMPDIR/hub-check/w380.png`.

- [ ] **Step 1: Write the static check script**

Create `tools/check.mjs`:

```js
#!/usr/bin/env node
/* Static checks for the Parent Hub. Zero dependencies.
   Run: node tools/check.mjs */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

const failures = [];
const notes = [];
const fail = (rule, detail) => failures.push(rule + ': ' + detail);

/* 1. Every internal anchor resolves to an id on the page. */
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const anchors = new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]));
for (const a of anchors) {
  if (!ids.has(a)) fail('anchor', 'href="#' + a + '" has no matching id');
}
notes.push(anchors.size + ' internal anchors resolve');

/* 2. Every linked asset exists on disk. Query and fragment are stripped. */
const assets = new Set(
  [...html.matchAll(/(?:href|src)="(assets\/[^"]+)"/g)].map((m) => m[1])
);
for (const a of assets) {
  const p = a.split(/[?#]/)[0];
  if (!existsSync(join(root, p))) fail('asset', p + ' is linked but not on disk');
}
notes.push(assets.size + ' asset links exist');

/* 3. No em dashes. The project forbids them everywhere. */
const em = (html.match(/\u2014/g) || []).length; /* em dash, escaped so
                                                       this file stays free of
                                                       the character itself */
if (em) fail('writing', em + ' em dash(es) present; use en dashes or middots');

/* 4. Poppins weights 300/400/500/700 only. Never 600 or 800. */
for (const m of html.matchAll(/font-weight:\s*(\d{3})/g)) {
  if (!['300', '400', '500', '700'].includes(m[1])) {
    fail('brand', 'font-weight ' + m[1] + ' is not an allowed Poppins weight');
  }
}

/* 5. No event language. The Meet & Greet is over. */
const tonight = (html.match(/tonight/gi) || []).length;
if (tonight) fail('event', tonight + ' occurrence(s) of "tonight" remain');

/* 6. The updates array parses and every entry is well formed. */
const block = html.match(
  /<script type="application\/json" id="updatesData">([\s\S]*?)<\/script>/
);
if (!block) {
  fail('updates', 'the updatesData block is missing');
} else {
  let data = null;
  try {
    data = JSON.parse(block[1]);
  } catch (e) {
    fail('updates', 'updatesData is not valid JSON: ' + e.message);
  }
  if (data && !Array.isArray(data)) fail('updates', 'updatesData must be an array');
  if (Array.isArray(data)) {
    data.forEach((e, i) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || '')) {
        fail('updates', 'entry ' + i + ' needs a YYYY-MM-DD date');
      }
      if (!e.title) fail('updates', 'entry ' + i + ' has no title');
      if (!e.text) fail('updates', 'entry ' + i + ' has no text');
      if (e.href && e.href.startsWith('#') && !ids.has(e.href.slice(1))) {
        fail('updates', 'entry ' + i + ' links to missing anchor ' + e.href);
      }
    });
    notes.push(data.length + ' update entries are well formed');
  }
}

for (const n of notes) console.log('ok   ' + n);
for (const f of failures) console.log('FAIL ' + f);
console.log(failures.length ? '\n' + failures.length + ' failure(s)' : '\nall checks passed');
process.exit(failures.length ? 1 : 0);
```

- [ ] **Step 2: Run it against the current page to see it fail**

Run: `node tools/check.mjs`

Expected: FAIL. The current page has no `updatesData` block and still carries event language, so you should see `FAIL updates: the updatesData block is missing` and `FAIL event: 28 occurrence(s) of "tonight" remain`. Anchors and assets should already pass. This failure is the baseline the rest of the plan clears.

- [ ] **Step 3: Write the render check script**

Create `tools/render-check.sh`:

```bash
#!/usr/bin/env bash
# Behavioural checks: render index.html in headless Chrome and assert on the
# result. Also writes a 380px screenshot for the mobile check that CLAUDE.md
# requires. Run: bash tools/render-check.sh
set -uo pipefail
cd "$(dirname "$0")/.."

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="${TMPDIR:-/tmp}/hub-check"
mkdir -p "$OUT"

if [ ! -x "$CHROME" ]; then
  echo "FAIL chrome not found at $CHROME"
  exit 1
fi

"$CHROME" --headless=new --disable-gpu --dump-dom --virtual-time-budget=3000 \
  "file://$PWD/index.html" 2>/dev/null > "$OUT/dom.html"

"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --screenshot="$OUT/w380.png" --window-size=380,1600 \
  "file://$PWD/index.html" 2>/dev/null

fail=0
check() { # check <description> <grep-pattern> <expected: yes|no>
  if grep -q "$2" "$OUT/dom.html"; then found=yes; else found=no; fi
  if [ "$found" = "$3" ]; then
    echo "ok   $1"
  else
    echo "FAIL $1 (expected $3, got $found)"
    fail=1
  fi
}

# The countdown must stay hidden while no event is scheduled. new Date(null)
# is 1 Jan 1970, a valid date, so a Date-validity guard is not enough: the
# script must test the attribute strings for presence.
check "countdown is hidden"        'id="cd" hidden'              yes
check "no thank-you message shown" 'Thank you for joining us<'   no

# The updates layer must have rendered into both containers.
check "updates strip rendered"     'id="updatesStrip"[^>]*hidden' no
check "change log rendered"        'id="changelogList"'          yes

echo
echo "screenshot: $OUT/w380.png"
[ $fail -eq 0 ] && echo "all render checks passed" || echo "render checks failed"
exit $fail
```

- [ ] **Step 4: Run it against the current page to see it fail**

Run: `bash tools/render-check.sh`

Expected: FAIL on the countdown checks. The current page renders "Thank you for joining us" because the evening has passed, and there is no updates layer yet. Confirms the harness detects the very bug Task 2 fixes.

- [ ] **Step 5: Commit**

```bash
git add tools/check.mjs tools/render-check.sh
git commit -m "Add a check harness for anchors, assets, brand rules and render state

CLAUDE.md already required that every anchor resolve, every asset path
exist and every change be verified at 380px. None of it was automated.
Two scripts, no dependencies: static checks over index.html, and a
headless Chrome render that asserts on the resulting DOM.

Both fail against the page as it stands, which is correct: the event
language is still here and the countdown is stuck on its closing message."
```

---

### Task 2: Fix the countdown retirement bug and retire the countdown

**The bug:** `hero.getAttribute('data-doors')` returns `null` when the attribute is absent. `new Date(null)` is 1 January 1970, which is a **valid** date, so `isNaN(doors.getTime())` is `false` and the guard passes. `Date.now() >= ends.getTime()` is then true, so the block renders "Thank you for joining us" forever. The retirement path documented in `README.md` ("To retire the countdown between events, delete the two attributes") does not work, and both `README.md` and `CLAUDE.md` describe behaviour the code does not have.

**Files:**
- Modify: `index.html` (the countdown block in the inline script, around line 1846; the hero element, around line 953)

**Interfaces:**
- Consumes: `tools/render-check.sh` from Task 1.
- Produces: a hero element with no `data-doors` or `data-end`, and a countdown that stays hidden when either attribute is absent or empty.

- [ ] **Step 1: Confirm the bug behaves as described**

Run:

```bash
node -e 'var d=new Date(null); console.log("valid:", !isNaN(d.getTime()), "|", d.toISOString())'
```

Expected: `valid: true | 1970-01-01T00:00:00.000Z`. That is the whole bug.

- [ ] **Step 2: Fix the guard**

In `index.html`, find:

```js
  if (hero && cd) {
    var doors = new Date(hero.getAttribute('data-doors'));
    var ends = new Date(hero.getAttribute('data-end'));

    if (!isNaN(doors.getTime()) && !isNaN(ends.getTime())) {
```

Replace with:

```js
  if (hero && cd) {
    /* getAttribute returns null for a missing attribute, and new Date(null)
       is 1 Jan 1970, a valid date. Test the strings for presence first, or a
       retired countdown renders its closing message forever. */
    var doorsAttr = hero.getAttribute('data-doors');
    var endsAttr = hero.getAttribute('data-end');
    var doors = new Date(doorsAttr || '');
    var ends = new Date(endsAttr || '');

    if (doorsAttr && endsAttr && !isNaN(doors.getTime()) && !isNaN(ends.getTime())) {
```

- [ ] **Step 3: Retire the countdown by removing the two attributes**

Find:

```html
<header class="hero" id="hero"
     data-doors="2026-09-09T18:30:00+03:00"
     data-end="2026-09-09T20:30:00+03:00">
```

Replace with:

```html
<!-- No event is scheduled. Adding data-doors and data-end back, both in
     Riyadh time with the +03:00 offset, brings the countdown back and must
     be done together with the date in the banner below. -->
<header class="hero" id="hero">
```

- [ ] **Step 4: Verify the countdown is now hidden**

Run: `bash tools/render-check.sh`

Expected: `ok   countdown is hidden` and `ok   no thank-you message shown`. The two updates checks still fail; Task 6 clears those.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "Fix the countdown guard, then retire the countdown

getAttribute returns null for a missing attribute and new Date(null) is
1 Jan 1970, a valid date, so the isNaN guard passed with no attributes
set and the block rendered its closing message forever. The retirement
path in the README did not work; the page has been showing 'Thank you
for joining us' since Wednesday.

Guard on the attribute strings, then retire the countdown as intended.
The markup and the timer are untouched, so the next event is still two
attributes and a banner line."
```

---

### Task 3: Retire the event language

28 occurrences of event-bound copy. All of them are listed here; nothing is left to judgement.

**Files:**
- Modify: `index.html` (meta description line 8; nav lines 930 and 941; hero lines 958 to 976; banner lines 982 to 986; materials band lines 988 to 1022; section `#s1` lines 1025 to 1071; library lines 1605 to 1621; ask block lines 1697 to 1707)

**Interfaces:**
- Consumes: Task 2's retired hero.
- Produces: a page with zero occurrences of "tonight"; `#s1` removed; nav pointing at `#schedule`, which Task 5 creates. **The page will have one broken anchor between this task and Task 5. That is expected and `node tools/check.mjs` will say so.**

- [ ] **Step 1: Rewrite the meta description**

This is the WhatsApp link preview text, so it is the first thing many parents read. Find line 8 and replace the `content` value:

```html
<meta name="description" content="Al-Rowad International Schools, British Section Parent Hub, academic year 2026/27. Class timetables, IGCSE results, subject options, assessment, support, policies, and every document and link in one place.">
```

- [ ] **Step 2: Rewrite the nav**

Find `<a href="#s1">Tonight’s programme</a>` and replace with:

```html
      <a href="#schedule">Class timetables</a>
```

Find `<a class="go2" href="#materials">Tonight’s materials</a>` and replace with:

```html
      <a class="go2" href="#materials">Start here</a>
```

Find `<a href="#s8">All documents</a>` and add a line directly after it:

```html
      <a href="#changelog">What’s changed</a>
```

- [ ] **Step 3: Rewrite the hero copy**

Find `<h1>Parents’ Meet &amp; Greet</h1>` and replace with:

```html
    <h1>Parent Hub</h1>
```

Find the `.desc` paragraph and replace with:

```html
    <p class="desc">Your one place for the class timetables, last year’s IGCSE results, the subject options, how marks are built, the support in place, and every document and link, kept up to date through the year.</p>
```

Find `<a class="btn gold" href="#s1">Tonight’s programme</a>` and replace with:

```html
      <a class="btn gold" href="#schedule">Class timetables</a>
```

- [ ] **Step 4: Repoint the banner at the school week**

The navy strip is a carried-over design element and keeps its place. It stops describing an evening and starts describing the week. Find the three banner spans and replace with:

```html
  <span>📅 Sunday to Thursday</span>
  <span>⏰ 7:00 AM – 12:50 PM</span>
  <span>📍 Boys campus · British Section</span>
```

Note the en dash in the time range, not a hyphen and never an em dash. **These hours come from the timetable, so the banner and the schedule section now share a source and change together.**

- [ ] **Step 5: Rename the materials band and fix its copy**

Find `<p class="lb">Tonight’s materials</p>` and replace with:

```html
      <p class="lb">Start here</p>
```

Find the Ask a question card's description and replace with:

```html
        <p>Send us a question about anything on this page, any time through the year.</p>
```

Find the presentation card and replace its title and description:

```html
        <span class="t"><span class="ic" aria-hidden="true">📊</span>Meet &amp; Greet Presentation</span>
        <p>The slides from the evening of 9 September 2026, 31 pages.</p>
```

- [ ] **Step 6: Delete the "Tonight's programme" section**

Delete the whole block from the `<!-- ============ 01 · TONIGHT'S PROGRAMME ============ -->` comment through the closing `</section>` (lines 1025 to 1071 inclusive). The agenda steps and the "Finding your way" card describe gates, stalls and a 6:30 arrival on a night that has happened.

Verify the deletion took exactly the right range:

```bash
grep -c 'id="s1"' index.html   # expect 0
grep -c 'Finding your way' index.html   # expect 0
grep -c 'id="results"' index.html   # expect 1, the next section survived
```

- [ ] **Step 7: Date the library heading**

Find `<h4>Tonight</h4>` and replace with:

```html
    <h4>Meet &amp; Greet · 9 September 2026</h4>
```

Find the presentation row in that group and replace its text spans:

```html
        <span class="tx"><span class="tt">Meet &amp; Greet Presentation</span><span class="sb">PDF · the slides from 9 September 2026, 31 pages</span></span>
```

- [ ] **Step 8: Rewrite the ask block**

Find `<h2>Have a question about tonight?</h2>` and replace with:

```html
      <h2>Have a question?</h2>
```

Find the `.lead` paragraph and replace with:

```html
    <p class="lead">Send it through the form and we will come back to you by email.</p>
```

In the `.note` paragraph, the mailto subject still names the event. Replace `subject=Question%20%C2%B7%20Parents%E2%80%99%20Meet%20%26%20Greet` with `subject=Question%20%C2%B7%20AIS%20Parent%20Hub`.

- [ ] **Step 9: Verify the event language is gone**

Run:

```bash
grep -ic 'tonight' index.html          # expect 0
grep -in 'this evening' index.html     # expect no hits
node tools/check.mjs
```

Expected: the `event` and `writing` and `brand` checks pass. **Two failures remain and are expected:** `anchor: href="#schedule" has no matching id` and `anchor: href="#changelog" has no matching id`, plus `updates: the updatesData block is missing`. Tasks 5 and 6 clear them.

- [ ] **Step 10: Commit**

```bash
git add index.html
git commit -m "Retire the event language; the hub is now year-round

The evening has happened, so the page stops describing it. The hero is
Parent Hub, the banner describes the school week instead of one night,
the materials band is Start here, and the programme section is gone
rather than kept in the past tense: three agenda steps and a find-Gate-8
card are not reference material.

The library heading becomes 'Meet & Greet · 9 September 2026', which
stays true as it ages and gives later events somewhere to sit.

The nav points at #schedule and #changelog, which do not exist yet. The
check script reports both until the next two commits land."
```

---

### Task 4: Publish the timetable asset

**Files:**
- Create: `assets/class-timetables-boys.pdf`
- Create: `assets/archive/.gitkeep`

**Interfaces:**
- Consumes: nothing.
- Produces: `assets/class-timetables-boys.pdf`, an 11-page PDF whose pages are, in order, 9A 9B 9C 9D 10A 10B 10C 11A 11B 12A 12B.

- [ ] **Step 1: Copy the export in**

```bash
cp ~/Downloads/sched13sep2026/"IG Classes.pdf" assets/class-timetables-boys.pdf
mkdir -p assets/archive
touch assets/archive/.gitkeep
```

- [ ] **Step 2: Verify the file is the one we mean**

```bash
pdfinfo assets/class-timetables-boys.pdf | awk '/^Pages/{print}'
pdftotext -f 1 -l 1 assets/class-timetables-boys.pdf - | grep -o 'generated:[0-9/]*'
```

Expected: `Pages: 11` and `generated:10/09/2026`.

- [ ] **Step 3: Verify the page order the links depend on**

```bash
for p in $(seq 1 11); do
  printf "page %2d -> %s\n" "$p" \
    "$(pdftotext -f $p -l $p assets/class-timetables-boys.pdf - 2>/dev/null \
       | grep -oE '^(9|10|11|12)[A-D]-(IG|AS|A2)$' | head -1)"
done
```

Expected, exactly:

```
page  1 -> 9A-IG
page  2 -> 9B-IG
page  3 -> 9C-IG
page  4 -> 9D-IG
page  5 -> 10A-IG
page  6 -> 10B-IG
page  7 -> 10C-IG
page  8 -> 11A-AS
page  9 -> 11B-AS
page 10 -> 12A-A2
page 11 -> 12B-A2
```

**If this output differs in any way, stop.** The eleven links in Task 5 encode these offsets, and a changed class list means they must be re-derived before the section is written.

- [ ] **Step 4: Commit**

```bash
git add assets/class-timetables-boys.pdf assets/archive/.gitkeep
git commit -m "Publish the class timetables at a permanent path

The aSc export generated 10/09/2026, in effect from Sunday 13 September.
It has changed three times this year and has been re-sent separately each
time, so parents hold several copies with no way to tell which is
current. This path is now the answer to that: it always holds the newest
one, and superseded copies go to assets/archive/ dated by the generated
date printed on the file.

Campus-suffixed so a girls hub can exist later without either page
breaking a link parents have saved."
```

---

### Task 5: The schedule section

**Files:**
- Modify: `index.html` (add CSS after the `.pills` rules around line 585; add the section where `#s1` was, between the materials band and `#results`)

**Interfaces:**
- Consumes: `assets/class-timetables-boys.pdf` from Task 4; the nav link `href="#schedule"` from Task 3.
- Produces: `id="schedule"`, resolving the nav link and the hero gold button.

- [ ] **Step 1: Add the CSS**

Insert after the `.pills button[aria-selected="true"]` rule:

```css
/* --- class timetable links --- */

.tt-note { font-size: 13px; color: var(--ink-soft); margin: 0 0 18px; line-height: 1.6; }
.tt-grp { margin-bottom: 14px; }
.tt-grp .lb {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 7px;
}
.classlinks { display: flex; gap: 8px; flex-wrap: wrap; }
.classlinks a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  min-height: var(--tap);
  padding: 10px 16px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--card);
  color: var(--navy-deep);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}
.classlinks a:hover { background: var(--navy-deep); border-color: var(--navy-deep); color: #fff; }
.tt-foot { margin-top: 20px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.tt-stamp { font-size: 12px; color: var(--muted); margin: 0; }
```

Every value uses an existing custom property. No new colour, no disallowed weight.

- [ ] **Step 2: Add the section**

Insert between the materials band's closing `</div>` and the `<!-- ============ RESULTS ============ -->` comment, where `#s1` used to be:

```html
<!-- ============ 01 · CLASS TIMETABLES ============ -->
<!-- One PDF, linked per class with #page= fragments. The page order is fixed
     by the aSc export and verified in tools/check.mjs only as far as the file
     existing: if the school adds or removes a class, re-derive these eleven
     page numbers from the new export before publishing. The ?v= date is
     bumped on every revision so a parent arriving through the hub gets the
     new file rather than a cached one. -->
<section class="sec" id="schedule">
  <div class="in">
    <div class="st">
      <h2>Class timetables</h2>
      <p>Grades 9 to 12 · boys campus · in effect from Sunday 13 September 2026</p>
      <div class="bar"></div>
    </div>

    <p class="tt-note">The week runs Sunday to Thursday, periods 1 to 8, 7:00 AM to 12:50 PM, with break from 9:40 to 10:10. Tap your child’s class to open their timetable.</p>

    <div class="tt-grp">
      <span class="lb">Grade 9</span>
      <div class="classlinks">
        <a href="assets/class-timetables-boys.pdf?v=2026-09-13#page=1">9A</a>
        <a href="assets/class-timetables-boys.pdf?v=2026-09-13#page=2">9B</a>
        <a href="assets/class-timetables-boys.pdf?v=2026-09-13#page=3">9C</a>
        <a href="assets/class-timetables-boys.pdf?v=2026-09-13#page=4">9D</a>
      </div>
    </div>

    <div class="tt-grp">
      <span class="lb">Grade 10</span>
      <div class="classlinks">
        <a href="assets/class-timetables-boys.pdf?v=2026-09-13#page=5">10A</a>
        <a href="assets/class-timetables-boys.pdf?v=2026-09-13#page=6">10B</a>
        <a href="assets/class-timetables-boys.pdf?v=2026-09-13#page=7">10C</a>
      </div>
    </div>

    <div class="tt-grp">
      <span class="lb">Grade 11</span>
      <div class="classlinks">
        <a href="assets/class-timetables-boys.pdf?v=2026-09-13#page=8">11A</a>
        <a href="assets/class-timetables-boys.pdf?v=2026-09-13#page=9">11B</a>
      </div>
    </div>

    <div class="tt-grp">
      <span class="lb">Grade 12</span>
      <div class="classlinks">
        <a href="assets/class-timetables-boys.pdf?v=2026-09-13#page=10">12A</a>
        <a href="assets/class-timetables-boys.pdf?v=2026-09-13#page=11">12B</a>
      </div>
    </div>

    <div class="tt-foot">
      <a class="btn gold" href="assets/class-timetables-boys.pdf?v=2026-09-13" download>Open the full timetable</a>
      <p class="tt-stamp">All classes, 11 pages · issued 10 September 2026</p>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Add the timetable to the materials band**

Insert as the **first** card inside `<div class="mgrid">`, before the Parent Guide card:

```html
      <a class="mcard" href="assets/class-timetables-boys.pdf?v=2026-09-13" download>
        <span class="t"><span class="ic" aria-hidden="true">🗓️</span>Class Timetables</span>
        <p>Grades 9 to 12, boys campus. In effect from Sunday 13 September 2026.</p>
        <span class="cta">Open PDF →</span>
      </a>
```

- [ ] **Step 4: Add the timetable to the document library**

Insert a new group directly before `<h4>Meet &amp; Greet · 9 September 2026</h4>`:

```html
    <h4>Timetables</h4>
    <div class="docs" style="margin-top:0">
      <a class="doc" href="assets/class-timetables-boys.pdf?v=2026-09-13" download>
        <span class="ic" aria-hidden="true">↓</span>
        <span class="tx"><span class="tt">Class Timetables · Grades 9 to 12</span><span class="sb">PDF · boys campus · in effect from 13 September 2026 · 11 pages</span></span>
        <span class="ar" aria-hidden="true">→</span>
      </a>
    </div>
```

Note: `.doc .tt` is an existing class for the row title and is unrelated to the `.tt-note` and `.tt-grp` classes added in Step 1. Do not merge them.

- [ ] **Step 5: Verify**

Run: `node tools/check.mjs`

Expected: `anchor: href="#schedule"` no longer fails, and the asset check passes with the query and fragment stripped. `href="#changelog"` and the missing `updatesData` still fail; Task 6 clears both.

Then run: `bash tools/render-check.sh` and open the screenshot at `$TMPDIR/hub-check/w380.png`. Confirm the eleven pills wrap onto multiple rows without pushing the page sideways, and that no row is cut off at the right edge.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Add the class timetables section

Eleven class pills into one PDF using #page= fragments, so the file stays
a single asset while a parent still lands on their child's grid. The
fragment is ignored by some in-app PDF viewers, in which case the file
opens on page 1, which is why the full-timetable button is always there.

Also added to the Start here band and the document library. Every link
carries ?v=2026-09-13 so a parent arriving through the hub gets the
current file rather than a cached one."
```

---

### Task 6: The updates layer

**Files:**
- Modify: `index.html` (CSS after the `.classlinks` rules; the JSON block and strip after the banner; the changelog section after `#s8`; the renderer in the inline script)

**Interfaces:**
- Consumes: `id="schedule"` from Task 5, which the first entry links to.
- Produces: `id="updatesData"`, `id="updatesStrip"`, `id="changelog"`, `id="changelogList"`. Resolves the `#changelog` nav link from Task 3.

- [ ] **Step 1: Add the CSS**

Insert after the `.tt-stamp` rule:

```css
/* --- updates strip and change log --- */

.ustrip { background: var(--card); border-bottom: 1px solid var(--border-soft); padding: 14px var(--pad); }
.ustrip .in { max-width: var(--wrap); margin: 0 auto; }
.ustrip .hd {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 9px;
}
.ulist { display: grid; gap: 8px; }
.uitem { border-left: 3px solid var(--gold); padding: 2px 0 2px 11px; }
.uitem .top { display: flex; flex-wrap: wrap; gap: 7px; align-items: baseline; }
.uitem .dt { font-size: 11px; color: var(--muted); }
.uitem .ti { font-size: 13px; font-weight: 700; color: var(--navy-deep); }
.uitem .new {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  background: var(--gold);
  color: var(--navy-deep);
  border-radius: 999px;
  padding: 2px 7px;
}
.uitem p { margin: 3px 0 0; font-size: 12px; line-height: 1.5; color: var(--ink-soft); }
.uitem a { color: var(--navy); font-weight: 500; }
#changelog .uitem { margin-bottom: 14px; }
```

- [ ] **Step 2: Add the data and the strip**

Insert directly after the closing `</div>` of the banner and before the materials band:

```html
<!-- ============ WHAT'S CHANGED ============ -->
<!-- One array, two renderings: the three newest entries in the strip below,
     all of them in the change log near the foot of the page. Add one entry
     per change and nothing else needs touching. Order does not matter; the
     renderer sorts by date. An entry dated within 14 days gets a New badge
     that expires by itself. -->
<script type="application/json" id="updatesData">
[
  {
    "date": "2026-09-13",
    "title": "New class timetables",
    "text": "The timetable for Grades 9 to 12 has changed and takes effect today. Tap your child’s class to open theirs.",
    "href": "#schedule",
    "label": "See the timetables"
  },
  {
    "date": "2026-09-13",
    "title": "This page is now your hub for the year",
    "text": "The Meet & Greet is over, so the page has moved on from that evening. Everything about the IGCSE programme is still here, and the timetables now sit at the top.",
    "href": "#s8",
    "label": "Everything in one place"
  }
]
</script>

<div class="ustrip" id="updatesStrip" hidden>
  <div class="in">
    <p class="hd">Latest updates</p>
    <div class="ulist" id="updatesList"></div>
  </div>
</div>
```

- [ ] **Step 3: Add the change log section**

Insert directly after the closing `</section>` of `#s8` and before the ask block:

```html
<!-- ============ CHANGE LOG ============ -->
<section class="sec alt" id="changelog">
  <div class="in">
    <div class="st">
      <h2>What’s changed this year</h2>
      <p>Every update to this page since it went live, newest first</p>
      <div class="bar"></div>
    </div>
    <div class="ulist" id="changelogList"></div>
  </div>
</section>
```

- [ ] **Step 4: Add the renderer**

Insert inside the existing IIFE, directly before the `/* --- countdown to the evening --- */` comment. ES5 to match the house style:

```js
  /* --- updates: one array, rendered into the strip and the change log ---
     Dates are parsed from their parts rather than handed to the Date string
     parser, so no timezone shifts a day. Month names are a literal array so
     formatting does not depend on the visitor's locale. If the JSON is
     missing or malformed both containers stay hidden, the same way the
     countdown stays hidden until it has validated its dates. */
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  var NEW_DAYS = 14;

  var uSrc = document.getElementById('updatesData');
  var uStrip = document.getElementById('updatesStrip');
  var uList = document.getElementById('updatesList');
  var uLog = document.getElementById('changelogList');

  if (uSrc && uList && uLog) {
    var updates = null;
    try {
      updates = JSON.parse(uSrc.textContent);
    } catch (err) {
      updates = null;
    }

    if (Object.prototype.toString.call(updates) === '[object Array]' && updates.length) {
      var parseDay = function (s) {
        var p = String(s || '').split('-');
        if (p.length !== 3) return null;
        var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
        return isNaN(d.getTime()) ? null : d;
      };

      var clean = [];
      updates.forEach(function (e) {
        var d = parseDay(e && e.date);
        if (d && e.title && e.text) clean.push({ d: d, e: e });
      });
      clean.sort(function (a, b) { return b.d - a.d; });

      var today = new Date();
      today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      var render = function (row) {
        var wrap = document.createElement('div');
        wrap.className = 'uitem';

        var top = document.createElement('div');
        top.className = 'top';

        var ti = document.createElement('span');
        ti.className = 'ti';
        ti.textContent = row.e.title;
        top.appendChild(ti);

        var dt = document.createElement('span');
        dt.className = 'dt';
        dt.textContent = row.d.getDate() + ' ' + MONTHS[row.d.getMonth()] + ' ' + row.d.getFullYear();
        top.appendChild(dt);

        if (Math.floor((today - row.d) / 86400000) <= NEW_DAYS) {
          var badge = document.createElement('span');
          badge.className = 'new';
          badge.textContent = 'New';
          top.appendChild(badge);
        }

        wrap.appendChild(top);

        var p = document.createElement('p');
        p.textContent = row.e.text;
        if (row.e.href && row.e.label) {
          p.appendChild(document.createTextNode(' '));
          var a = document.createElement('a');
          a.href = row.e.href;
          a.textContent = row.e.label + ' →';
          p.appendChild(a);
        }
        wrap.appendChild(p);
        return wrap;
      };

      if (clean.length) {
        clean.slice(0, 3).forEach(function (row) { uList.appendChild(render(row)); });
        clean.forEach(function (row) { uLog.appendChild(render(row)); });
        if (uStrip) uStrip.hidden = false;
      }
    }
  }
```

Note `textContent` is used for all author-supplied strings, so an apostrophe or an ampersand in an entry cannot break the page.

- [ ] **Step 5: Verify all three badge states and the failure paths**

Run: `node tools/check.mjs` then `bash tools/render-check.sh`

Expected: **all checks pass in both scripts.**

Then test the three states by hand. After each, restore the original array.

```bash
cp index.html /tmp/index.backup.html
```

1. **Old entry, no badge.** Change the first entry's date to `"2026-01-05"`, run `bash tools/render-check.sh`, and confirm `grep -c 'class="new"' "${TMPDIR:-/tmp}/hub-check/dom.html"` drops by one.
2. **Malformed JSON.** Delete a comma inside the array and confirm the strip stays hidden: `grep -c 'id="updatesStrip" hidden' "${TMPDIR:-/tmp}/hub-check/dom.html"` returns 1, and the rest of the page still renders.
3. **Empty array.** Replace the contents with `[]` and confirm the strip stays hidden and the change log renders empty rather than throwing.

```bash
cp /tmp/index.backup.html index.html && rm /tmp/index.backup.html
```

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Add the updates layer: one array, a strip and a change log

The hub is the link parents keep for the year, so a parent coming back in
November had no way to tell whether anything had moved. One inline JSON
array now drives a strip under the banner and a full log near the foot of
the page, so a change is written once and shown twice. CLAUDE.md's
standing hazard is duplication, and a single array is the direct answer.

The New badge expires off the entry date, so nothing needs remembering.
Malformed or empty data hides both containers rather than rendering an
empty box, the same way the countdown stays hidden until it validates."
```

---

### Task 7: Documentation

The source-to-prose coupling is the thing `CLAUDE.md` is most insistent about. Three new couplings were created by this work and none of them are written down yet.

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`
- Modify: `index.html` (the `DOCUMENT PATHS` comment at the top)

**Interfaces:**
- Consumes: everything above.
- Produces: no code.

- [ ] **Step 1: Update the DOCUMENT PATHS comment**

Add to the list in `index.html`, keeping the existing column alignment:

```
       assets/class-timetables-boys.pdf                     LIVE  band, schedule, library
```

And add a line under it:

```
     Superseded timetables are kept in assets/archive/, named by the aSc
     "Timetable generated" date printed on the file.
```

- [ ] **Step 2: Add the runbook to the README**

Add a new section after "Adding a document":

```markdown
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

```
node tools/check.mjs        # anchors, asset paths, brand and writing rules
bash tools/render-check.sh  # renders in headless Chrome, writes a 380px shot
```

Both must pass before pushing.
```

- [ ] **Step 3: Correct the README's countdown section**

The README says "If the attributes are missing or unparseable the whole block stays hidden." That was not true until this work. Add after that sentence:

```markdown
This was fixed on 12 September 2026. Before then, `getAttribute` returned
`null` for a missing attribute and `new Date(null)` is 1 January 1970, a valid
date, so the guard passed and the block showed its closing message forever.
The script now tests the attribute strings for presence before parsing them.
```

- [ ] **Step 4: Correct the 380px note in CLAUDE.md**

`CLAUDE.md` says headless Chrome's `--window-size` cannot go below the macOS minimum window width. That applied to the old headless mode. Replace that sentence with:

```markdown
Verify at ~380px width before considering any change done. The page must never
scroll sideways; wide content scrolls inside its own container. `bash
tools/render-check.sh` does this: `--headless=new` honours `--window-size` down
to 380px, unlike the old headless mode, and the screenshot lands in
`$TMPDIR/hub-check/w380.png`.
```

- [ ] **Step 5: Add the timetable to the CLAUDE.md content sources table**

Add a row:

```markdown
| Class timetables | The aSc export `IG Classes.pdf`, published as `assets/class-timetables-boys.pdf`. Boys campus, 11 pages, one per class in a fixed order. Revised several times a term; superseded copies go to `assets/archive/`. The banner's period hours come from this file, so they change together. |
```

- [ ] **Step 6: Note the new couplings in CLAUDE.md**

Add under the "When a source changes" paragraph:

```markdown
Three couplings were added on 12 September 2026. The banner's period times
come from the timetable, so they move together. The `?v=` query on every
timetable link must be bumped whenever the file is replaced, or parents get a
cached copy. And the eleven `#page=` links in `#schedule` encode the class
order of the aSc export, so they must be re-derived if the class list changes.
```

- [ ] **Step 7: Verify and commit**

```bash
node tools/check.mjs && bash tools/render-check.sh
git add README.md CLAUDE.md index.html
git commit -m "Document the timetable runbook and the new couplings

Three couplings were created by this work and none were written down: the
banner takes its period times from the timetable, the ?v= query has to be
bumped whenever the file is replaced, and the eleven #page= links encode
the export's class order.

Also corrects two things the docs asserted but the code did not do: the
countdown's retirement path, which did not work until it was fixed, and
the claim that headless Chrome cannot render below the macOS minimum
window width, which stopped being true with --headless=new."
```

---

## Self-Review

**Spec coverage.** Every section of the spec maps to a task. Part 1, the asset and archive, is Task 4 with the runbook in Task 7. Part 2, the schedule section, is Task 5. Part 3, the updates layer, is Task 6. The amendment's de-event-ing table is Task 3 line by line, its countdown retirement is Task 2, and its "one updates entry for the change itself" is the second entry in Task 6 Step 2. The spec's verification section is Task 1 plus the checks closing each task. The resolutions section fixes the filename, which Tasks 4 and 5 use throughout.

**One thing the spec did not anticipate.** The countdown retirement bug was found while planning, not while designing. It is why Task 2 exists as its own task rather than a line in Task 3: it is a real defect that made the documented retirement path fail, the docs assert behaviour the code lacked, and a reviewer should be able to accept or reject that fix on its own.

**Type and name consistency.** `updatesData`, `updatesStrip`, `updatesList`, `changelog`, `changelogList` are used identically in Tasks 1, 3, 6 and 7. `assets/class-timetables-boys.pdf` is identical in Tasks 4, 5 and 7. The pre-existing `.doc .tt` class and the new `.tt-note` / `.tt-grp` / `.tt-stamp` classes are called out in Task 5 Step 4 so they are not merged.

**Known gap.** The 380px check is a screenshot a human or the agent looks at. Detecting horizontal overflow properly needs CDP evaluation, which would mean a dependency; the project forbids build tooling and this is development-only, so the judgement was to keep it visual. The screenshot is produced automatically; only the looking is manual.

**Expected intermediate breakage.** Task 3 removes `#s1` and points the nav at `#schedule` and `#changelog`, which do not exist until Tasks 5 and 6. `node tools/check.mjs` reports the broken anchors in between. This is called out in Task 3's Interfaces block and in its Step 9 expected output, so it is not mistaken for a mistake.
