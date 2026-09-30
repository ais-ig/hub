# AIS Parent Hub · British Section

Single-page Parent Hub for the AIS British Section, academic year 2026/27. It opened as the Parents' Meet & Greet page for Grades 9 and 10 on Wednesday 9 September 2026 and stays live through the year as the one link parents keep. The printed QR sheets label it "British Section, Grades 9 to 12"; the content is IGCSE-focused, with the A-Level options forms and the Grade 11 and 12 pages of the parent guide carried in the document library.

**Live at `https://ais-ig.github.io/hub/`**, repository `ais-ig/hub`. The earlier link, `ais-ig.github.io/meet-n-greet-26/`, redirects here.

The page opens in English and can be read in full in Arabic, right to left, since 30 September 2026; see "Arabic" below.

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

There are no `<!-- PLACEHOLDER -->` comments left in `index.html`. The homeroom mentors for Grades 9 to 12 (`#mentors`) come from the British Section's `Homeroom Mentors 2026-2027.docx.pdf`, issued 13 September 2026, which superseded slide 19 of the final deck: six of the seven Grade 9 and 10 mentors changed, and Grades 11 and 12 were added. The sheet lists 11B as Mr. Shehabuddin Hassan with `s.ameen@ais.sch.sa`; the page reproduces it as given.

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

**Student Council applications**, `https://forms.gle/WNYxBGu17yEsBJTp9`, are linked from the first hero button and the `2026-09-13-student-council` update. The button carries `data-until="2026-09-16T23:59:00+03:00"`: it starts hidden and a few lines of script show it only before that moment, so it retires itself when applications close and can be deleted at the next edit after that. Any element given a `data-until` behaves the same way. The update entry stays in the change log; its title names the closing date, so it still reads correctly afterwards.

## Keeping the hub current through the year

There is no event on the page. The Meet & Greet took place on 9 September 2026, and on 12 September 2026 the "Tonight's programme" section it lived in, together with the countdown's live dates, were retired: once the evening had passed, a page still counting down to it and still headed "Parents' Meet & Greet" was actively wrong, not just stale. What replaced it is reference material, updated only when a source document changes:

- **Class timetables** (`#schedule`), the current timetable; see "Updating the timetable" below.
- Everything from **IGCSE results** down: results, pathway, options, assessment, support, activities, policies and contacts. See `CLAUDE.md`, "Content sources", for what each is duplicated from.
- **What's changed this year** (`#changelog`), a running log fed by the `updatesData` array; see "Recording a change" below.

The hero, the banner and the nav are deliberately generic now ("Parent Hub", a permanent school week strip), not describing an evening. Do not rename them back to an event just because one is coming up; the countdown exists for that.

**Bringing back an event.** The countdown's markup and script were never removed, only its two attributes, so switching it on again is small:

1. Add `data-doors` and `data-end` back to `<header class="hero" id="hero">`, in Riyadh time with the `+03:00` offset. See "The countdown" above.
2. Add one entry to `updatesData` announcing it, so a parent who has already bookmarked the hub sees it in the bell and the strip rather than finding out by chance.
3. If the event needs its own on-page agenda, the numbered-agenda-card pattern from the old "Tonight's programme" section is still in the stylesheet as the `.agenda` / `.ag` rules. They render nothing today, on purpose: they were left in place for exactly this, so reuse them rather than inventing a new pattern.
4. Word any new copy so it still reads correctly once the event has passed, the way "Meet & Greet · 9 September 2026" does in the document library, rather than assuming it is still upcoming. `node tools/check.mjs` fails on the word "tonight" anywhere in the file, which exists to catch copy that goes stale the moment the event ends.

## Adding a document

Files live in `assets/`. Every document appears once in **Everything in one place**; the ones parents need first also appear in the Start here band under the hero, and forms and policies also appear in their own sections.

Nothing currently shows "Available soon". To announce a document before it exists, copy a live card or row, change the opening tag to `<span class="mcard soon">` or `<span class="doc soon">`, drop the `href`, and replace the arrow with "Available soon"; reverse that once the file lands in `assets/`. Add every new file to the `DOCUMENT PATHS` comment at the top of `index.html` and to the table above. A new card or row also needs keys and Arabic for its title and sub line, and `data-pdf-en` on its link if the file is English only; see "Arabic".

| File | Status | Appears in |
|---|---|---|
| `class-timetables-boys.pdf` | live | band, Class timetables, library |
| `timetables/9a.pdf` to `timetables/12b.pdf` | live | Class timetables, one per class pill |
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
| `student-council-policy-boys-2026-27.pdf` | live | library |
| `presentation-g9-g10.pdf` | live | band, library |

External links, the school's own pages: the Grade 9 and 10 IG weekly plans and the Parent Assessment Guide on `ict001001.github.io`, reached through the school-wide Linktree `linktr.ee/rowad.curriculum2627`.

**The parent guide** is pages 1 and 12 to 16 of the school's `AIS_Meet_and_Greet_Parent_Guide_Grades_7-12_Boys_09Sep2026.pdf`: the event map, the UK High School class lists for Grades 9 to 12, and the staff contacts. Regenerate it from the source with `pypdf` if the school reissues the guide.

**Known problems with the commitment form**, carried over from last year: it has a pre-filled date of 30/2/2025 and a Middle Section header rather than British Section.

## Updating the timetable

The current timetable is always `assets/class-timetables-boys.pdf`. **That path
never changes**, which is the whole point: parents keep the link.

1. `cp assets/class-timetables-boys.pdf assets/archive/class-timetables-boys-<old generated date>.pdf`
2. Copy the new aSc export over `assets/class-timetables-boys.pdf`
3. **Split it per class.** `bash tools/split-timetable.sh` rewrites the eleven
   one-page files in `assets/timetables/` (`9a.pdf` to `12b.pdf`) that the class
   pills open. It stops if the page count no longer matches its class list: if
   a class was added or removed, update `CLASSES` in the script and the pills in
   `#schedule` together, then run it again.
4. Update the "in effect from" line and the issued date in `#schedule`, and
   the same line in the library row. These are keyed strings, so update their
   Arabic and stamp them (see "Arabic")
5. Bump `?v=` on every timetable link: the eleven class pills, the full
   timetable button, the Start here card and the library row
6. Add one entry to `updatesData`, dated the day you publish, in English and
   Arabic. Give the previous timetable entry a `newUntil` of the day before,
   and reword it to the past tense in both languages (see "Recording a change")
7. `node tools/check.mjs && bash tools/render-check.sh`. `check.mjs` reads the
   class label out of each per-class file and fails if it does not match the
   filename, so a class list that changed order cannot ship silently.
8. Commit, push, and share `https://ais-ig.github.io/hub/#schedule`

**Why one file per class.** The pills used to open the combined file with
`#page=N`. Tested on real devices on 13 September 2026, that works on macOS and
iPad but opens page 1 on iPhone and Android, which is most parents. Keep the
split; do not go back to fragments.

**Share the section, never the raw PDF.** A raw PDF URL a parent has already
opened can be served from their phone's cache for a long time. The hub page
is HTML and refreshes quickly, and the link on it carries the bumped `?v=`.

The archive filename uses the aSc **"Timetable generated"** date printed on
every page, not the publish date, so a parent holding a printout can match
their copy.

## Recording a change

`updatesData` near the top of `index.html` is one JSON array. Add an entry and
three places pick it up: the bell in the top bar, the strip under the banner,
and the "What's changed this year" section. Order in the file does not
matter. An entry dated within 14 days gets a "New" badge that expires on its
own, and counts as unread until the visitor taps it or marks it read. The
bell shows a gold count of unread entries and lists the eight newest. The
strip shows up to three unread entries, headed "Since your last visit" for a
returning visitor, and hides when nothing is unread.

`id`, `date`, `title` and `text` are required, and so are `titleAr` and
`textAr`, the same notice in Arabic; `href` and `label` are optional and go
together, and a `label` needs a `labelAr`. All six are plain text: a tag typed
into one shows as text. `date` must be `YYYY-MM-DD`. `id` is lowercase
letters, digits and hyphens, conventionally the date and a word or two
(`2026-09-13-mentors`), and must be unique.

**Never date an entry in the future.** The "New" window runs forward from the
date, so an entry dated tomorrow has a negative age, is not new, and is
therefore not unread: no bell count, nothing in the strip, and only a quiet
row in the change log. The guard is deliberate, so that a mistyped year
cannot badge an entry for ever. Date an entry the day you publish it and let
the text carry the future date ("takes effect on Sunday 20 September"). The
id may still name the effective date; only `date` drives the window. This
caught out the 20 September timetable entry, published on the 19th.

**End the New window early with `newUntil`.** Optional, `YYYY-MM-DD`, the
last day the entry counts as new. Use it in two cases:

- **A later entry supersedes it.** When a new timetable is published, set
  `newUntil` on the previous timetable entry to the day before the new
  entry's `date`, so a parent who never opened the old notice is not shown
  it next to the new one. Reword it to the past tense too, since it stays in
  the change log.
- **It announces an event.** Set `newUntil` to the day of the event, so the
  notice stops counting as new once the event has passed.

The entry stays in the change log either way, as an ordinary read row.
`tools/check.mjs` fails a `newUntil` that is not a real date or that falls
before the entry's own `date`.

**Never change an `id` once it is live.** Read state is stored in each
visitor's browser (`localStorage`, key `aisHub.updates`) as a list of ids, so
a changed id reappears as unread for everyone. Fixing a typo in a title or
text is safe. Read state is per browser: WhatsApp's in-app browser and Safari
on the same phone remember separately. There are no push notifications; a
static page cannot send them.

## Checking your work

Three scripts, each catching something the ones before it cannot:

```
node tools/check.mjs        # Static checks over index.html: anchors resolve,
                             # asset paths exist, no em dashes, only the
                             # allowed font weights, no event language
                             # ("tonight"), updatesData is well formed,
                             # every entry with a unique id, each per-class
                             # timetable holds the class its filename names,
                             # and English and Arabic are in step (the rules
                             # of tools/i18n.mjs, see "Arabic").
                             # No browser. Exits 0 or 1.

bash tools/render-check.sh  # Renders index.html in headless Chrome and
                             # asserts on the resulting DOM: the countdown
                             # stays hidden with no attributes set, and the
                             # updates bell and change log render once
                             # updatesData has entries. Then the same page
                             # opened with ?lang=ar: right to left, the
                             # Arabic hero title, the cover lifted, no
                             # English month in a date. Finishes by running
                             # tools/shot.mjs in English and in Arabic.

node tools/shot.mjs         # The true 380px mobile check. Drives Chrome over
                             # the DevTools Protocol and sets a real
                             # Emulation.setDeviceMetricsOverride, so the page
                             # genuinely reflows at 380px instead of being
                             # laid out wide and cropped (see CLAUDE.md on why
                             # --window-size cannot do this). Fails, and names
                             # the offending element, if scrollWidth exceeds
                             # clientWidth. Then opens the updates bell and
                             # checks again, and taps the language button
                             # twice to prove the page is restored exactly.
                             # Screenshots at $TMPDIR/hub-check/w380.png and
                             # w380-bell.png.

node tools/shot.mjs --lang=ar  # The same at 380px in Arabic: also asserts the
                             # page came up right to left. Screenshots at
                             # w380-ar.png and w380-ar-bell.png.
```

`render-check.sh` runs `shot.mjs` as its last step, once in each language, so
running it on its own covers all three day to day; call `shot.mjs` directly
when you only need the mobile layout check. All must pass before pushing.

`node --test tools/i18n.test.mjs` runs the tests of the Arabic tool itself. Run
it after changing `tools/i18n.mjs`; day-to-day edits to the page do not need it.

## Arabic

Added on 30 September 2026 at the school's request. The whole page can be read
in Arabic, right to left, set in Cairo. English is the default and the source
of truth; the PDFs stay English, and in Arabic a link to one carries a small
tag saying so. `CLAUDE.md` has the reasons and the traps.

**To view it**, tap the language button in the top bar, or open
`https://ais-ig.github.io/hub/?lang=ar`. That link is the one to share with a
parent who wants Arabic. The choice is remembered in the browser
(`localStorage`, key `aisHub.lang`); `?lang=en` switches back. Locally,
`index.html?lang=ar` works from the file.

**How it is held.** English stays in the markup. Each element a parent reads
has a `data-i18n` key, and the Arabic for every key is one line in the
`i18nAr` JSON block near the foot of `index.html`:

```
"hero.title": { "h": "3fa1c2d9", "ar": "..." },
```

`h` is a hash of the English the Arabic was written from. When the English
changes, the hash no longer matches and `node tools/check.mjs` fails, naming
the key. **Every change to English text needs its Arabic in the same commit.**

**Change an existing sentence.** Edit the English, edit the `ar` of the same
key in `i18nAr`, then say so:

```
node tools/i18n.mjs stamp s4.cw.note      # one or more keys, by name
```

A bare `stamp` prints usage and does nothing, so stale Arabic cannot be waved
through. `stamp --all` re-stamps every stale entry; use it only after reading
all of the Arabic.

**Add a new string.** Put `data-i18n="section.item"` on the element, write the
Arabic into a small JSON file, and merge it, which also stamps it:

```
echo '{ "s4.new.note": "..." }' > /tmp/ar.json
node tools/i18n.mjs merge /tmp/ar.json
```

For an `aria-label`, `alt`, `title` or `placeholder`, the attribute on the
element is `data-i18n-attr="aria-label:section.item"`. The Arabic must keep the
same tags and links as the English and every number in it.

**Add an update notice.** Write the Arabic beside the English in `updatesData`:
`titleAr`, `textAr`, and `labelAr` when there is a `label`. See "Recording a
change".

**Leave something in Latin letters.** A name, an email, a code: add the bare
attribute `data-i18n-skip` to its element, and the check stops asking for a
key.

**Link an English PDF.** Add the bare attribute `data-pdf-en` to the `<a>`.
Leave it off a PDF that already carries Arabic.

**See what needs doing, and check.**

```
node tools/i18n.mjs extract    # every key with its English, as JSON
node tools/i18n.mjs check      # the Arabic rules alone
node tools/check.mjs           # the same rules, with every other check
node tools/shot.mjs --lang=ar  # the Arabic page at 380px
```

**The review file.** `docs/arabic/translation-review.html` lists every English
string beside its Arabic, section by section, and marks any that is missing;
`translation-review.md` is the same as plain text, for searching. It is what to
hand a reader of Arabic who is checking the translation, since they need not
open the source. Regenerate both after any change to the Arabic, and do not
edit them by hand:

```
node tools/i18n.mjs pairs
```

**The glossary** and the Arabic writing rules live in
`docs/superpowers/specs/2026-09-30-arabic-language-design.md`. The glossary is
the authority for terms: الصف for Grade, never السنة; Western digits; ranges
written من … إلى …, never with a dash; the reader addressed in the respectful
plural. `docs/arabic/LOG.md` is the dated record of how the Arabic was built.

**New CSS** with a physical left or right needs its mirror in the
`html[dir="rtl"]` block at the end of the stylesheet.

The address bar drops `?lang=` after the page reads it. That step does not run
from a local file, so test it on a server (`python3 -m http.server`) or on the
live site.

## Syllabus links

Removed from the page on 9 September 2026 pending manual verification with Mr. Farhan. `~/Downloads/AIS_Syllabus_Links_2026-2027.xlsx` lists the board and syllabus code per examined subject with a Status column, and the seven rows marked Confirmed (Physics, Chemistry, Biology, Mathematics (Cambridge), Accounting, Computer Science, ICT) were briefly linked from Subject options. The card is in git history at commit `e513b38` and can be restored once each row is checked against the entry file. The sheet's Notes tab is internal and must not be published.

## The previous Parent Information Hub

Until 9 September 2026 this repository held a different page: a Parent Information Hub for Grades 9 to 12 with an Arabic toggle, a Boys/Girls toggle and Google Sheet hydration. It was never sent to parents. The Arabic on the present page was built afresh on 30 September 2026 and takes nothing from it. It is archived locally at `~/Cooking/Rowad/parent-hub-archive-2026-08` with its git history, and it remains in this repository's history before commit `0c7cb23`.
