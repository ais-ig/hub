# Task 1 report · the i18n tool

Status: DONE_WITH_CONCERNS (the concerns are scope notes for later tasks, not doubts about correctness).

## What was built

- `tools/i18n.mjs`: zero dependency Node module, importable and a CLI.
  Exports `normalise`, `hashEn`, `extractKeys`, `checkAll`, `mergeAr`,
  `stampKeys`, `buildPairs`. Commands `extract`, `merge <file>...`,
  `stamp [key...]`, `pairs`, `check`. Parses without a DOM: a small tokeniser
  (open, close, text, comment; quoted `>` in attributes; raw text in script,
  style, textarea, title), and the close of a keyed element is found by
  counting opening and closing tags of its name.
- `tools/i18n.test.mjs`: 48 tests on `node:test` and `node:assert/strict`,
  all on in-memory fixtures.

`index.html` and `tools/check.mjs` were not edited.

## Interfaces later tasks need

- `extractKeys(html)` returns `[{ key, en, kind }]`, `kind` one of `html`,
  `attr`, `js`, `update`; page keys in order of first appearance, then
  `updates.<id>.<field>`. `en` is whitespace-normalised. The `extract` command
  prints a flat `{ key: en }` object.
- `checkAll(html)` returns failure strings of the form
  `i18n <rule> <name>: <key> ...`, e.g. `i18n 3 stale: foot.sign has English
  that changed ...`. Non-rule failures use `i18n block:` and `i18n markup:`.
  `tools/check.mjs` can import it and push each string into its own list.
- `mergeAr(html, map)`: a value is an Arabic string or `{ ar, nums }`. Throws
  on a key that is not on the page, naming it.
- `stampKeys(html, keys)`: empty `keys` re-stamps every stale entry.
- `buildPairs(html)` returns `{ html, md }`.
- Dictionary line format, exactly:
  `  "hero.title": { "h": "3fa1c2d9", "ar": "..." },` with `, "nums": false`
  before the closing brace when set.

## TDD evidence

RED. `node --test tools/i18n.test.mjs` before `tools/i18n.mjs` existed:

```
code: 'ERR_MODULE_NOT_FOUND',
url: 'file:///Users/mohamaddabbagh/Cooking/Rowad/meet-&-greet-26/tools/i18n.mjs'
# tests 1
# pass 0
# fail 1
```

Expected: the module under test did not exist. Because a missing module is a
weak RED, five mutations of the finished tool were also run against the tests
in a scratch copy, and each was caught:

| Mutation | Tests that failed |
|---|---|
| A dropped `<span dir="ltr">` no longer removes its own close | 11, including "a dropped ltr span takes its own closing tag" |
| First close tag ends the element, no depth counting | "extractKeys counts nested tags of the same name" |
| Number check by presence, not count | "numbers compare as multisets" |
| `data-i18n-skip` removed from the allow list | 12 |
| Rule 3 disabled | 3, including "a stale hash fails" |

GREEN. `node --test tools/i18n.test.mjs`:

```
1..48
# tests 48
# pass 48
# fail 0
```

Every one of the nine rules has at least one failing fixture that asserts the
key is named (rule 9 has no key, so it asserts the quoted text and the line).

## Against the real page

- `node tools/i18n.mjs check` runs without crashing and exits 1 with 494
  failures, all expected today: 1 for the missing `i18nAr` block, 29 for rule
  8 (ten notices with no Arabic fields), 464 for rule 9 (nothing is keyed yet).
- `node tools/i18n.mjs extract` prints the 29 update strings.
- `node tools/i18n.mjs stamp` prints `0 key(s) stamped`, exit 0.
- `mergeAr` on the real page, adding one `titleAr`: removing the added line
  gives back the original file byte for byte, so rewriting `updatesData`
  does not reformat it.
- `buildPairs` on the real page produces the review with 29 rows marked
  missing. The `pairs` command itself was not run, so no review files were
  written or committed in this task.
- `node tools/check.mjs` still passes.

## Rulings

1. **A missing or malformed `i18nAr` block is one failure**, and rules 1, 3,
   5, 6 and 7 are skipped for dictionary keys. The spec says `check` exits 1
   on any failure and the brief says to report it once.
2. **Rule 6 is multiset inclusion**: each number must appear in the Arabic at
   least as often as in the English; extra numbers in the Arabic pass. The
   spec's wording is "a number in the English is absent from the Arabic".
3. **Numbers are read from visible text only**: tags are dropped and entities
   decoded first, so `?v=12` in an `href` and `&#8217;` are not numbers. Rule
   5 already guards the `href`.
4. **Rule 6 is not applied to update notices.** They have no `nums: false`
   escape, and the glossary turns "Grade 9" into a word. Rule 7 is applied to
   them, since it needs no exemption.
5. **Rule 4 treats a descendant with `data-i18n-attr` as a keyed element.**
   The spec says a keyed element never contains another keyed element, and
   replacing the parent's innerHTML would discard the child's attribute.
6. **Rule 5 drops a `<span>` only if it has `dir="ltr"` and none of the five
   compared attributes**, and only from the Arabic. A span with a class is
   structure, not bidi wrapping.
7. **`merge` writes `updates.<id>.<field>` keys into `updatesData`** as
   `<field>Ar`, placed straight after the English field. `extract` hands the
   translator those keys, so `merge` has to accept them back; they are never
   written to `i18nAr`.
8. **`merge` refuses unknown keys** and changes nothing, rather than storing
   an orphan that `check` would then reject.
9. **`merge` creates the `i18nAr` block when absent**, immediately before the
   last non-JSON `<script>` (the main script), falling back to before
   `</body>`.
10. **`merge` keeps entries the map does not name, with their old hash**, and
    keeps an existing `nums: false` when the new value is a plain string.
    Orphan entries are written last so `check` reports them.
11. **`stamp` with no keys re-stamps every stale entry.** The spec's
    `stamp [key...]` makes the keys optional.
12. **`</script` inside Arabic is written as `<\/script`** and `<!--` as
    `<!--`, both valid JSON, so a string cannot end its own block.
    Arabic itself is never escaped.
13. **Rule 9 counts Latin letters per text node after removing entities**, so
    `&rarr;` is not four letters. A page with no `<body>` tag is treated as
    all body.
14. **A `data-i18n` on a void or unclosed element, an empty key, or a
    `data-i18n-attr` naming an absent attribute is reported** as
    `i18n markup:` rather than ignored.
15. **Attribute English is the raw attribute value**, entities undecoded,
    matching how innerHTML is taken raw.

## Self-review

- The Write tool turned `\u` escapes in the source into the literal
  characters, which put a real em dash and tatweel into both files. Caught by
  grep before commit; the forbidden characters are now built with
  `String.fromCharCode`, and both files are verified free of them.
- A merge of update keys alone on a page with no block used to create an
  empty `i18nAr` block. Fixed: the block is only written when a dictionary
  key is merged.
- Test output is pristine: no warnings.

## Concerns for later tasks

- Rule 9 looks at text nodes only, as the spec says. English in `alt`,
  `aria-label`, `title` or `placeholder` attributes without a
  `data-i18n-attr` is not caught. Task 3 should key those by hand.
- Rule 9 relies on elements being closed. An unclosed `<p>` or `<li>` with
  `aria-hidden` would leak its allow-list status to following siblings until
  its parent closes. The page closes its tags today.
- `docs/arabic/LOG.md` was already modified in the working tree when this
  task started its commit; it is not mine and is left uncommitted.

## Files

- `tools/i18n.mjs` (new)
- `tools/i18n.test.mjs` (new)
- `docs/arabic/reports/task-1-report.md` (new)
