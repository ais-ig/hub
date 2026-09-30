# Arabic for the Parent Hub · implementation plan

**Spec:** `docs/superpowers/specs/2026-09-30-arabic-language-design.md`. Read it
first. It is the authority; where this plan and the spec disagree, the spec wins.

**Goal:** the hub reads fully in Arabic, right to left, behind a toggle and
`?lang=ar`, with English unchanged and a script that stops the two drifting.

## Global Constraints

- Repository root: `/Users/mohamaddabbagh/Cooking/Rowad/meet-&-greet-26`. Branch
  `arabic`. Commit locally at the end of your task. **Never push. Never switch
  branch. Never touch `main`.**
- Read `CLAUDE.md` at the root before starting. Its rules bind you.
- One self-contained `index.html`. All CSS and JS inline. No build step, no
  framework, no dependency beyond Google Fonts. Tools in `tools/` are zero
  dependency Node (`.mjs`) or bash.
- **No em dashes anywhere**: content, code comments, commit messages, reports.
  Use en dashes for ranges and middots as dividers.
- "Grade", never "Year". In Arabic الصف, never السنة for a grade.
- Colours: navy `#1D5394`, deep navy `#0C2E54`, yellow `#EDBA1D` only.
- Font weights 300, 400, 500, 700 only. Poppins for Latin, Cairo for Arabic.
- The English page must not change in layout or wording, apart from the new
  language button in the top bar. Existing CSS rules are not rewritten; all
  right-to-left CSS sits under `html[dir="rtl"]` in one block at the end of the
  stylesheet.
- Never change a live `updatesData` `id`. Never change `STORE_KEY`.
- ES5-style JavaScript inside `index.html`, matching the existing script:
  `var`, function expressions, no arrow functions, no template literals.
- Match the file's existing comment density and voice.
- `localStorage` access is always inside `try`/`catch`.
- Arabic text follows the spec's "Arabic writing rules" and its glossary,
  exactly.
- Commit messages: imperative sentence, no em dash, ending with the line
  `Co-Authored-By: Claude <noreply@anthropic.com>`.

## Task 1: The i18n tool

Create `tools/i18n.mjs` and `tools/i18n.test.mjs`. Do not edit `index.html` or
`tools/check.mjs` in this task.

`tools/i18n.mjs` is a zero dependency Node module that is both importable and a
CLI. It implements the five commands in the spec's table under "Keeping the two
in step" (`extract`, `merge`, `stamp`, `pairs`, `check`) and the nine `check`
rules listed there, exactly as written.

Details the spec leaves to you:

- Export pure functions that take the HTML as a string and return results, so
  the tests need no files: at least `extractKeys(html)`, `hashEn(text)`,
  `checkAll(html)` returning an array of failure strings, `mergeAr(html, map)`
  returning new HTML, `buildPairs(html)`.
- Parse without a DOM. Find each opening tag carrying `data-i18n`, then scan
  forward counting opening and closing tags of that tag name to find its close.
  Handle void elements, attributes in any order, and single or double quotes.
- English source for a `data-i18n` key is the element's `innerHTML`; for a
  `data-i18n-attr="attr:key;attr2:key2"` pair it is that attribute's value; for
  a `js.*` key it is the value in the `i18nEn` JSON block.
- Normalise before hashing and before comparing: collapse every run of
  whitespace to one space, trim.
- `updatesData` entries appear in `extract` and `pairs` as
  `updates.<id>.title`, `.text`, `.label`, with Arabic read from `titleAr`,
  `textAr`, `labelAr`. They are not stored in `i18nAr` and carry no hash.
- If the page has no `i18nAr` block, `check` reports that once and skips the
  rules that need it, rather than crashing.
- Rule 5 compares the ordered list of tags with their `href`, `class`,
  `target`, `rel` and `download` attributes, after dropping `<span dir="ltr">`,
  `<bdi>` and their closing tags from the Arabic. When a dropped `<span>` is
  removed its matching `</span>` must be removed too, not the next `</span>`.
- Rule 6: a "number" is a maximal run of ASCII digits. Compare as multisets.
- Rule 9 allow list: text inside `<script>`, `<style>`, comments, elements with
  `aria-hidden="true"`, the `.classlinks` pills, and any element carrying
  `data-i18n-skip` (for names, emails and codes that stay Latin by design).
- `merge` preserves the key order of the page (order of first appearance), two
  space indentation, one entry per line, and writes UTF-8 without escaping
  Arabic as `\u` sequences.
- `pairs` writes `docs/arabic/translation-review.html` (self-contained, a table
  per section prefix, columns key, English, Arabic; the Arabic cell has
  `dir="rtl" lang="ar"` and uses Cairo; inline tags are shown as rendered text,
  not as markup; a missing Arabic cell is visibly marked) and
  `docs/arabic/translation-review.md` (the same, as Markdown tables).

`tools/i18n.test.mjs` uses `node:test` and `node:assert`. Write the tests first.
Cover at least: extraction of nested markup; one passing fixture; and one
failing fixture for each of the nine rules, asserting the failure names the key.

Done when `node --test tools/i18n.test.mjs` passes and `node tools/i18n.mjs
check` runs against the real `index.html` without crashing.

## Task 2: The switching mechanism

Edit `index.html`, `tools/shot.mjs`, `tools/render-check.sh`, `tools/check.mjs`.
Build everything under the spec's "How it is built" and "What the parent sees",
and prove it end to end on the top bar, the menu, the hero and the banner only.
Later tasks key and translate the rest.

- Head script, `i18n-wait`, the 1.5 second fail-safe.
- The toggle button in `.acts`, before the bell. Must fit the 56px bar at 380px
  with the brand, the bell and the menu button, in both languages.
- `applyLang`, the `i18nEn` and `i18nAr` blocks, `t(key)`.
- `data-i18n` and `data-i18n-attr` on the top bar, menu, bell panel, hero
  (including countdown labels) and banner, with their Arabic in `i18nAr`,
  written by hand to the glossary and stamped with `node tools/i18n.mjs stamp`.
- Every JS-written string moved to `js.*` keys: month names, "New", "Unread: ",
  "Since your last visit", "New updates", the bell `aria-label` with and without
  a count, the arrow after an update link, both countdown messages and notes,
  the document title, the meta description.
- The updates renderer split into one-time setup and a repeatable `paint()`.
  Behaviour in English must be identical to now, including read state, the
  strip's "Mark as read", focus handling and the 14 day window.
- `updatesData` rendering reads `titleAr`, `textAr`, `labelAr` in Arabic with
  English fallback. Do not add those fields to the entries in this task.
- Cairo added to the Google Fonts link. The `html[dir="rtl"]` block mirroring
  every physical property in the stylesheet, and `letter-spacing: 0`.
- The `بالإنجليزية` tag on every card or row that links an English PDF, shown
  in Arabic mode only, done in CSS from an attribute or class so no Arabic
  string is duplicated per card.
- `tools/shot.mjs --lang=ar`: loads `index.html?lang=ar`, asserts
  `document.documentElement.dir === 'rtl'`, runs the same overflow assertion,
  writes `w380-ar.png` and `w380-ar-bell.png`. Without the flag it behaves as
  now.
- `tools/render-check.sh` runs both languages and asserts the Arabic DOM has
  `dir="rtl"` and the hero title in Arabic.
- `tools/check.mjs` calls `checkAll` from `tools/i18n.mjs` and reports its
  failures with its own. Its font-weight rule is unchanged.

Rule 9 of the i18n check will fail for the sections not yet keyed. That is
expected after this task; every other rule must pass.

Done when: `node --test tools/i18n.test.mjs` passes; `bash
tools/render-check.sh` passes in both languages; `node tools/check.mjs` fails
only on rule 9; toggling twice restores the English text exactly (assert this in
`tools/shot.mjs` or the render check).

## Task 3: Key every string

Edit `index.html` only. Add `data-i18n`, `data-i18n-attr` or `data-i18n-skip` to
every remaining text a parent reads: the Start here band, all twelve sections,
the change log section, the ask block, contacts, footer, and every `aria-label`,
`alt` and `title` with words in it.

- Follow the spec's "Markup" rules. Keys are `<section id or short name>.<item>`
  in lower case with dots and digits, e.g. `s4.cw.note`. Stable, descriptive,
  unique unless the English is identical and means the same thing in both
  places (then reuse, e.g. `common.openpdf`).
- Put the key on the smallest element that holds a complete sentence, label or
  table cell. Do not split a sentence across keys. Do not wrap new elements
  around text unless there is no element to carry the key; if you must, use a
  `<span>` with no class and confirm the rendering is unchanged.
- Staff names, emails, phone numbers and syllabus codes take `data-i18n-skip`.
- Do not change any English wording, any `id`, any `href`, any class.
- Do not write any Arabic.
- Mark each document card or row that opens an English PDF the way Task 2
  defined for the `بالإنجليزية` tag.

Done when `node tools/i18n.mjs check` reports no rule 9, rule 2 or rule 4
failures (rule 1 failures for the new keys are expected), the rendered English
page is unchanged (`bash tools/render-check.sh` English run passes and
`tools/shot.mjs` shows no overflow), and `node tools/i18n.mjs extract >
.superpowers/arabic/en.json` has been run and the file left in place.

## Task 4: Translate

Input: `.superpowers/arabic/en.json`, key to English, and the ten `updatesData`
entries. Output: every key in `i18nAr`, and `titleAr`, `textAr`, `labelAr` on
every update entry.

The controller splits the keys into three groups by section and dispatches
three translators in parallel. Each writes one file,
`.superpowers/arabic/ar-<group>.json`, key to Arabic string, and touches nothing
else. A fourth, sequential agent then runs `node tools/i18n.mjs merge` on the
three files, adds the Arabic fields to `updatesData` from the third translator's
`updates.*` keys, runs `pairs`, fixes any `check` failure that is mechanical,
and commits.

Translator rules, beyond the spec's writing rules and glossary:

- Translate meaning, not words. Read each string as a Saudi parent would.
- Keep every tag from the English, in the same order, with the same attributes.
  Only the text between tags changes. You may add `<span dir="ltr">…</span>`.
- Keep every number, with the same digits.
- `→` becomes `←`.
- Never invent a fact, soften a rule, or drop a condition.
- If the English is ambiguous, translate the most literal safe reading and list
  the key in your report under "Unsure".

Done when `node tools/check.mjs` passes fully, `bash tools/render-check.sh`
passes in both languages, and `docs/arabic/translation-review.html` and `.md`
exist with no missing Arabic.

## Task 5: Review the Arabic, then fix

Two read-only reviewers in parallel, each writing findings to
`docs/arabic/reports/`:

- **Accuracy.** Every pair in `docs/arabic/translation-review.md`: does the
  Arabic say what the English says? Numbers, names, conditions, glossary terms,
  the writing rules. Findings as a table: key, severity (wrong meaning, missing
  content, glossary, style), current Arabic, proposed Arabic, reason.
- **Fluency.** Reads the Arabic page as a Saudi parent, without consulting the
  English first: stiffness, translationese, inconsistent terms between
  sections, wrong register, awkward word order, anything a native reader would
  stumble on. Same table.

Then one fixer applies every finding it agrees with to `i18nAr` and
`updatesData`, records any it rejects with a reason, reruns `stamp` only where
needed, reruns `pairs` and the checks, and commits.

## Task 6: Look at it

One agent renders the Arabic page at 380px and at 800px with the existing
Chrome DevTools driver, captures the whole page in viewport-height slices plus
the open menu and the open bell, reads every image, and reports: clipped or
overflowing text, anything not mirrored, anything mirrored that should not be
(the emblem, numerals, the countdown order), broken Arabic joining from
letter-spacing, misordered Latin or numeric runs, line-height too tight for
Cairo, the toggle's fit in the bar. It also captures the English page at 380px
and compares it with `main` for any layout change. It then fixes what it found
in the `html[dir="rtl"]` block or the Arabic strings, reruns the checks, and
commits.

## Task 7: Documentation

Update `CLAUDE.md` and `README.md` as the spec's "Documentation" section says.
Keep the existing voice. State the new rules as locked decisions with their
reasons. Commit.
