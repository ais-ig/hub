# Task 2 report · the switching mechanism

Status: DONE_WITH_CONCERNS (the concerns are listed at the end; none is a
doubt about whether the mechanism works).

## What was built

In `index.html`:

- **Head script**, before the fonts and the stylesheet. Reads `?lang=ar|en`,
  then `localStorage` `aisHub.lang`, default `en`. For Arabic it sets `lang`,
  `dir` and the class `i18n-wait` on `<html>`, and a 1.5 second timer removes
  the class whatever happens.
- **Toggle button** `#langbtn` in `.acts`, before the bell. `العربية` with
  `lang="ar"` in English mode, `English` with `lang="en"` in Arabic mode.
  Hidden in the markup and shown by the script once the Arabic block parses.
- **`i18nEn` and `i18nAr` blocks**, immediately before the main script. 15
  `js.*` keys in `i18nEn`; 51 entries in `i18nAr`, written by hand to the
  glossary and put in with `node tools/i18n.mjs merge`, so every hash is the
  tool's own.
- **`t(key)` and `applyLang(lang)`** at the top of the main script. `applyLang`
  saves each keyed element's English the first time it writes Arabic and
  restores it on the way back, does the same for keyed attributes, sets
  `lang`, `dir`, the title, the meta description and the button, stores the
  choice, runs the repaint hooks and lifts `i18n-wait`.
- **Keys** on the top bar, menu, bell panel, hero (title, subtitle,
  description, emblem `alt`, countdown label and four cell labels, three
  buttons), the banner, and the strip's "Mark as read" button.
- **Updates renderer split** into a one-time setup (parse, read list,
  listeners, unhide) and `paint()`, which clears and refills the change log,
  the strip and the bell, then calls the existing `refresh()`. `paint` is a
  repaint hook, so the first paint is the `applyLang` call at the foot of the
  script. Entries read `titleAr`, `textAr`, `labelAr` in Arabic with English
  fallback. No entry was given those fields.
- **Countdown**: both messages and notes come from `t()`, and `tick` is a
  repaint hook.
- **`?lang=` is removed** from the address bar with `history.replaceState`,
  inside `try`/`catch`.
- **Cairo** added to the Google Fonts request, weights 300, 400, 500, 700.
- **One Arabic block at the end of the stylesheet**: `i18n-wait`, the Cairo
  rule exactly as the spec gives it, `letter-spacing: 0`, the mirror of every
  physical left or right in the stylesheet (bell count, bell header, bell
  items and footer, `.strip b`, the journey map line, dots and card borders,
  update items, behaviour levels, tick lists), the flipped arrows on document
  rows, and the `بالإنجليزية` tag.

In `tools/`:

- `shot.mjs --lang=ar` loads `index.html?lang=ar`, asserts `dir === 'rtl'`,
  runs the overflow probe (which in RTL also names elements past the left
  edge) and writes `w380-ar.png` and `w380-ar-bell.png`. In both languages it
  now taps the language button twice and asserts the language, direction,
  title, description and `body.innerHTML` are identical to the start.
- `render-check.sh` dumps the DOM in both languages, asserts `lang="ar"
  dir="rtl"`, the Arabic hero title, the lifted cover and Arabic dates, and
  runs `shot.mjs` twice.
- `check.mjs` imports `checkAll` and reports its failures with its own. It
  also fails if the script asks `t()` for a `js.*` key that `i18nEn` lacks.
  The font-weight rule is unchanged.

## Test results

- `node --test tools/i18n.test.mjs`: 74 tests, 74 pass, 0 fail.
- `bash tools/render-check.sh`: all render checks passed, both languages,
  no overflow at 380px, "language switched en to ar and back, page restored
  exactly" and the same from Arabic.
- `node tools/check.mjs`: 475 failures, 446 of rule 9 (first at line 1450,
  the Start here band; nothing above it) and 29 of rule 8. No other rule
  fails.
- **English unchanged**: a pixel diff of `w380.png` and `w380-bell.png`
  against the baseline taken before any edit differs only inside the box
  x 215 to 274, y 13 to 43 (CSS pixels), which is the new button. The page
  height is identical.
- **Looked at**: the Arabic top of page, the open bell and the open menu at
  380px. The bar fits in both languages, the brand sits right and the three
  buttons left, the bell's count and the unread bars are mirrored, no Arabic
  is letter-spaced or disconnected.
- **Countdown**: with `data-doors` and `data-end` added temporarily, all
  three states were screenshotted in Arabic (cells with يوم ساعة دقيقة ثانية
  and days on the right, "under way", "thank you") and the counting state in
  English. The attributes were removed again. This run found that a ticking
  countdown broke the toggle-twice assertion, so the assertion now blanks
  the four countdown numbers.
- **PDF tag**: applied temporarily to a Start here card, a document row and
  the full timetable button, seen rendering on the card and the button, then
  removed.

TDD was not required for this task. The toggle-twice and RTL assertions are
the behavioural tests, and they run in `render-check.sh`.

## Interfaces later tasks need

- **Key naming**: `<area>.<item>`, lower camel case for multi-word items.
  Used so far: `bar.*`, `menu.*`, `bell.*`, `hero.*`, `hero.cd.*`,
  `hero.cta.*`, `banner.*`, `strip.mark`, and `js.*` for script strings.
  Section content should follow the spec's `s4.cw.note` pattern.
- **Keying an attribute**: `data-i18n-attr="aria-label:bar.menu"` on the
  element, pairs separated by `;`. The Arabic goes in `i18nAr` like any key.
- **Adding Arabic**: write a JSON file `{ "key": "Arabic" }` and run
  `node tools/i18n.mjs merge <file>`. It stamps the hashes.
- **The `بالإنجليزية` marker is the bare attribute `data-pdf-en`, placed on
  the `<a>` that opens an English-only PDF.** CSS shows the tag after `.cta`
  inside an `a.mcard`, after `.tt` inside an `a.doc`, and after the link's
  own text on any other `<a>`. Nothing in Task 2's scope links a PDF, so it
  is applied nowhere yet. Do not put it on the eleven class pills (they are
  not cards or rows) or on `parent-letter-semester-1-2026-27.pdf`, which is
  already in Arabic and English.
- **Elements a script rewrites, which must not be keyed or wrapped in a
  keyed element**: `#updatesHead`, `#updatesList`, `#changelogList`,
  `#bellList`, `#bellCount`, `#cdMsg`, `#cdD` `#cdH` `#cdM` `#cdS`,
  `#langbtn`. The grade tabs `#tab9` and `#tab10` carry listeners, so key
  each button itself, never `.pills`. `#panel9`, `#panel10` and `#mentors`
  have ids, so key inside them, not around them. `#updatesHead` is now empty
  in the markup because the script always writes it.
- **Arrows**: an arrow typed inside a keyed string (`Open PDF →`) is
  written `←` in the Arabic. The `.doc .ar` arrows and `.doc .ic` icons are
  flipped by CSS and need no key.
- **Any new CSS with a physical left or right** needs its mirror in the
  Arabic block at the end of the stylesheet. Inline `style` attributes on
  the page hold no left or right today.
- **Wording already fixed by the menu**, for the section headings to match:
  `menu.beyond` is "أبعد من الكتب", `menu.pathway` is "مسار IG لابنكم".
- **Opening the page in Arabic**: `index.html?lang=ar`, or
  `node tools/shot.mjs --lang=ar` for the 380px screenshots in
  `$TMPDIR/hub-check/`. `?lang=en` goes back and is remembered.
- **Task 4**: a notice without `titleAr` or `textAr` shows its English,
  marked `lang="en" dir="ltr"`. The bell's label with a count uses the
  placeholder `{n}` in `js.bell.count`.

## Rulings

1. **With no readable `i18nAr` block the page is English and the button
   stays hidden**, rather than English text in a right-to-left layout. The
   spec's test "with the Arabic block deleted, the page renders in English".
2. **The toggle's two labels are literals in the script**, not keys. Each is
   the name of a language in its own script and is the same in both modes.
3. **The button shows `العربية` in Cairo on the English page**, so English
   visitors fetch one Cairo file. The button is what an Arabic reader looks
   for and should be in the school's Arabic face; the spec's sentence about
   fetching stays true, since Arabic text is on screen.
4. **The button is a 44px tap target with a smaller pill drawn inside it**,
   to match the bell and menu targets without crowding the 56px bar.
5. **Month names are two keys**, `js.months` and `js.monthsShort`, each a
   space-separated list. Arabic uses full names in both, as Arabic months
   are not abbreviated.
6. **`js.unread` and `js.arrow` hold no spaces**; the script adds them. The
   tool trims before hashing, so a meaningful trailing space would be
   fragile.
7. **`#updatesHead` was emptied in the markup** instead of keyed. The script
   writes it with a count every time, and the strip is hidden until it has.
8. **"Mark as read" in the strip is keyed now** (`strip.mark`), because
   `paint()` owns the strip.
9. **Banner emoji are repeated in the Arabic strings**, as the spec allows
   where the emoji is not in its own span. The markup was not restructured.
10. **Countdown cell labels are singular unit names** (يوم، ساعة، دقيقة،
    ثانية), which read correctly beside any number.
11. **The brand in the bar is "بوابة أولياء الأمور"**, the glossary's Parent
    Hub, without "AIS". The school's name is on the emblem beside it.
12. **`letter-spacing: 0` is one universal rule with `!important`**, so a
    tracked rule added later cannot be forgotten.
13. **The initial language is read from `<html lang>`**, which the head
    script has set, so the decision is made in one place.
14. **`applyLang` always stores the language in force**, including a default
    `en`. It changes nothing a parent sees.
15. **A PDF linked from an update notice gets no tag.** The spec names cards
    and rows; no notice links a PDF today.

## Self-review

- The first version of the `?lang=` removal would have called
  `replaceState` on every load with no query. Fixed before any run.
- The bell title is now a `<span>` inside `.ti` after the screen-reader
  flag, where it was a text node. It renders the same and lets the English
  fallback carry its own direction.
- `docs/arabic/LOG.md` was modified by someone else while I worked. It is
  not mine and is not in my commit.

## Concerns

- **Latin text in Arabic mode renders in Cairo, not Poppins.** The spec's
  rule puts Cairo first and Cairo has Latin glyphs. This follows the spec's
  CSS to the letter but sits against its line "Poppins stays the only Latin
  face". Reversing the order would fix it, at the cost of Poppins digits and
  spaces inside Arabic text. Left for the owner.
- **Widths below 380px were not checked.** The button takes about 60px of
  the bar; at 320px the brand text may wrap to two lines.
- **Until Task 4**, update notices in Arabic mode are English, left to
  right, inside a mirrored list. It is readable but looks unfinished.
- **The `بالإنجليزية` tag on a document row** was not seen in a screenshot,
  only on a card and a button. It uses the same rule.
- `history.replaceState` is refused on `file://` in Chrome, so the removal
  of `?lang=` was exercised only through its `catch`. It needs one look on
  the live site or a local server.

## Needed in tools/i18n.mjs

Nothing.

## Files

- `index.html`
- `tools/shot.mjs`
- `tools/render-check.sh`
- `tools/check.mjs`
- `docs/arabic/reports/task-2-report.md` (new)
