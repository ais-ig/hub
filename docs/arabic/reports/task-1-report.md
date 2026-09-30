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
12. **A string cannot end its own block.** When the Arabic holds a closing
    script tag, `merge` writes its slash with a backslash before it, and
    writes the `<` of an HTML comment opener as a JSON unicode escape. Both
    are valid JSON and parse back to the original text. Arabic letters are
    never escaped.
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

## Fix round 1

Rulings 4 and 11 above are superseded by items 1 and 4 below. The concern
about attributes is closed by item 3.

### What changed

1. **Rule 6 now covers update notices.** The title, text and label of each
   notice are compared with `titleAr`, `textAr` and `labelAr` by the same
   multiset rule as dictionary keys. An entry may carry `"numsAr": false` to
   exempt all three of its fields; the failure message says so.
2. **An unreadable `updatesData` block is a failure.** A missing block, a
   JSON syntax error and a non-array each give one `i18n block:` line saying
   rules 6, 7 and 8 were skipped for notices. An entry that is not an object
   or has no string `id` gives `i18n 8 updates: entry N of updatesData has no
   id, so its Arabic cannot be checked`.
3. **Rule 9 covers attributes.** An `aria-label`, `alt`, `title` or
   `placeholder` in `<body>` with two or more Latin letters fails unless a
   `data-i18n-attr` pair on the same element names that attribute, or the
   element or an ancestor carries `data-i18n-skip` or `aria-hidden="true"`.
   Message: `i18n 9 unkeyed: line N: aria-label="Menu" on <button> has no
   data-i18n-attr pair`. Two points decided here:
   - An attribute on an element inside a keyed element passes, because the
     Arabic string replaces that markup and carries the attribute itself. An
     attribute on the keyed element itself still needs a pair.
   - The `.classlinks` allowance excuses the pills' text only, not their
     attributes, as the controller's ruling lists only skip and aria-hidden.
4. **`stamp` needs keys or `--all`.** The bare command, and `--all` mixed
   with keys, print usage and exit 2. In the module, `stampKeys(html, keys)`
   throws on an empty list and the new export `stampAll(html)` does the full
   re-stamp. The rule 3 message already named the key
   (`... run: node tools/i18n.mjs stamp <key>`), so it is unchanged.
5. **A non-object `i18nAr` entry** fails as `i18n 1 malformed: <key> in
   i18nAr must be an entry of the form { "h": "...", "ar": "..." }`. `merge`
   and `stamp` write such an entry back verbatim, and `stamp <that key>`
   refuses. While there, entries now also keep any field other than `h` and
   `ar` (before, only `nums` survived a rewrite).
6. **Tests added** for the four markup failures (empty key, keyed void
   element, `data-i18n-attr` naming an absent attribute, a pair with no
   colon) and for a malformed and a non-object `i18nEn` block.
7. **`pairs` was run for real** and the two files deleted again. Ruling 12
   is reworded above.

### Evidence

RED. The new tests run against the tool as committed in `5a076e5` (copied to
a scratch folder, with a one-line `stampAll` stub so the import resolves):

```
not ok 43 - stampKeys with no keys refuses rather than stamping everything
not ok 45 - the stamp command with no keys and no --all prints usage and exits 2
not ok 46 - rule 6: a number missing from an update notice fails and names the key
not ok 47 - rule 6: the title and label of an update notice are checked too
not ok 49 - a missing updatesData block is reported once
not ok 50 - an updatesData block that is not valid JSON or not an array is reported
not ok 51 - rule 8: an update entry with no id fails and gives its position
not ok 52 - rule 9: a read attribute with no data-i18n-attr pair fails, naming attribute and line
not ok 53 - rule 9: a pair must name that attribute, not just any attribute
not ok 54 - rule 9: a keyed element still needs a pair for its own attribute
not ok 56 - rule 9: the classlinks pills excuse their text but not their attributes
not ok 57 - rule 1: an i18nAr entry that is not an object fails and names the key
not ok 58 - merge and stamp never discard the Arabic of a malformed entry
not ok 59 - merge and stamp keep fields of an entry they do not know
# tests 69
# pass 55
# fail 14
```

The item 6 tests passed against the old tool, as expected: they pin
behaviour that existed but was untested. In this round the code and tests
were written together and the RED run was taken afterwards against the old
commit, rather than before the change.

GREEN. `node --test tools/i18n.test.mjs`:

```
# tests 69
# pass 69
# fail 0
```

Against the real page:

- `node tools/i18n.mjs check`: exit 1, 511 failures, no crash. 1 missing
  `i18nAr` block, 29 rule 8, 481 rule 9, of which 17 are attributes (for
  example `aria-label="Updates" on <button>`, line 1118).
- `node tools/i18n.mjs stamp`: prints usage, exit 2.
  `node tools/i18n.mjs stamp --all`: `0 key(s) stamped`, exit 0.
- `node tools/i18n.mjs pairs`: exit 0, wrote
  `docs/arabic/translation-review.html` (7111 bytes, 29 rows) and
  `translation-review.md` (29 rows marked missing). Both deleted afterwards.
- `node tools/check.mjs`: all checks passed.

### Note for later tasks

Seven of the ten live notices carry digits, so their Arabic must repeat each
number as digits or the entry needs `"numsAr": false`. `check.mjs` already
accepts unknown fields on an entry, so `numsAr` does not trip it.
