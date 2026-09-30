# Final code review · Arabic mode, whole branch

Reviewed 30 September 2026. Branch `arabic`, base `3730690` (main), head `187a592`.
Read-only on the repository; every experiment ran on a `git archive` copy of the
head in a scratch folder, served over `http://127.0.0.1` where storage or the
address bar mattered. One pass over `tools/`, the page's two scripts, the new
CSS, `CLAUDE.md` and `README.md`. The 340 Arabic strings were not read for
meaning; that was Task 5's seat.

## Verdict

**Ready for the owner's review.** No Critical finding. One Important finding,
which does not affect the page as it stands and should be fixed before the first
update notice is reworded after go-live.

## What was run, and what it said

| Check | Result |
|---|---|
| `node tools/check.mjs` | all checks passed |
| `node --test tools/i18n.test.mjs` | 94 of 94 pass |
| `bash tools/render-check.sh` | all render checks passed, both languages, toggle round trip exact |
| English page, branch against main, at 380, 360 and 320px | `innerText` identical line for line once the button's own line is removed; page height identical; computed font, size, weight, tracking, transform and alignment identical on ten sampled elements; no console errors |
| Read state across versions | Marked one notice read on main's page, loaded the branch page on the same origin: same `aisHub.updates` value, same count, "Since your last visit". Loaded main's page again with the new `aisHub.lang` key present: unaffected |
| `?lang=` | `?lang=ar&x=1#mentors` came up Arabic, right to left, scrolled to `#mentors`, address bar left as `?x=1#mentors`. A plain reload stayed Arabic. `?lang=en` went back. `?lang=fr` and a hostile value (`ar"><img onerror=...>`) gave English and nothing else; the value is only ever matched against `(ar|en)` |
| Blocked `localStorage` (getter throws) | English and Arabic both render, bell and strip paint, toggle works, no errors |
| Malformed `i18nAr` with Arabic saved | English, left to right, visible, button hidden, saved choice kept |
| Script error before `applyLang`, Arabic requested | Hidden at 0.2 s, visible at 2 s. English text in a right-to-left layout, not blank |
| `i18nEn` block deleted | English page complete from the `EN` table: months, "New", strip heading |
| JavaScript off, `?lang=ar` | `<html lang="en" dir="ltr">`, English, button hidden |
| Ten toggles | Element count returns to 1053, bell items 8, change log 12, strip 2; tab selection, focus on the button and the strip's dismissed state all survive |
| Arabic at 320, 360, 380px | No overflow, brand on one line, bar 56px |
| Arabic attributes | No `aria-label`, `alt`, `title` or `placeholder` left holding Latin words |

## Strengths

- **The English reader is protected in fact, not only by intent.** Text, layout
  and read state were measured against main and match. The updates renderer was
  split into setup and `paint()` without changing a single storage call:
  `STORE_KEY`, `save()`, `visited` and the ids are untouched
  (`index.html:3087-3121`).
- **No path to a blank page was found.** The cover is lifted by a timer set in
  the same head script that adds it (`index.html:30-31`), by `applyLang` before
  the hooks run (`index.html:2894`), and the hooks are contained.
- **No injection path.** `?lang=` reaches nothing but a two-value regex;
  `localStorage` is only compared with `'ar'`; every `updatesData` field is
  written with `textContent` and links pass `HREF_OK`. `innerHTML` takes only
  the page's own JSON block.
- **The keyed markup respects its own rule.** Every `id`, every listener target
  and the one `data-until` link are the keyed element itself or outside it, never
  inside swapped `innerHTML`. Menu links, tabs and the mark-read buttons keep
  their listeners across toggles.
- **The checker fails loudly rather than silently** in every odd case tried: a
  decoy `data-id`, a comment quoting the block's tag, broken JSON, a non-object
  entry.
- **The documents are true.** Every recipe in `README.md` and `CLAUDE.md` was run
  as written in the scratch copy and ended with `check` passing: edit and stamp,
  add by `merge`, attribute pair, script string in both tables, update notice,
  `data-i18n-skip`, `"latin": true`, `pairs`, `extract`. A bare `stamp` exits 2.
  The committed review files are byte-identical to a fresh `pairs` run.
- Project rules hold: one file, no build step, no new dependency, `var` and
  function expressions only in both inline scripts, no new colour, no em dash in
  any changed file or commit message.

## Issues

### Critical

None.

### Important

**1. Rewording an update notice's English does not make its Arabic stale.**
`tools/i18n.mjs:301-320` and `:721-743`. Update notices carry no hash, so rule 3
never sees them. Tried on the real page: changing a title to "Earlier revision
of the class timetables", and changing "following the usual class timetable" to
"and the timetable is suspended", both **passed** `check.mjs` with the old
Arabic in place. Only a changed number is caught (rule 6). This matters because
notices are the urgent content the Arabic was asked for, and the README's own
timetable recipe tells the maintainer to reword the previous entry
(`README.md:130`) and says fixing a typo in a title is safe (`README.md:193`,
`index.html:1415`). Fix: give each entry a stamped hash of its English fields
(for example `"hAr"` over `title`, `text`, `label`), checked as rule 3 and
stamped by `stamp updates.<id>`; add the test. Until then, add one sentence to
the README recipe saying the check does not catch this.

### Minor

1. **`extract` and `check` output is cut at 8192 bytes when another Node process
   captures it.** `tools/i18n.mjs:1051` calls `process.exit()` straight after
   `console.log`; on macOS a pipe to a Node parent is asynchronous. A shell pipe
   or redirect gave all 26,695 bytes, `execFileSync` gave 8,192. Fix: set
   `process.exitCode` and return.
2. **Toggling mid-page moves the reader.** With scroll anchoring off, as on iOS
   Safari, a reader at `#s7` landed in `#s6` after the swap; even Chrome's
   anchoring drifted `#s4` to `#s3`. Fix: note the section in view before the
   swap and scroll it back after. Most parents will toggle at the top.
3. **Every English reader now downloads Cairo's Arabic subset, 30.8 KB**, for
   the one word on the button (`index.html:268`). Measured. HTML grew from
   25.0 KB to 46.6 KB gzipped. Acceptable; say so in `CLAUDE.md`, since the spec
   says Cairo loads only when Arabic is on screen.
4. **A selector list with `:has()` drops the whole rule on browsers without
   it** (`index.html:1264-1265`), so the last column heading loses its alignment
   too. Arabic only, cosmetic. Split into two rules.
5. **`inset` on the button's outline** (`index.html:272`) is unsupported before
   iOS 14.5; main's stylesheet does not use it. The pill outline would collapse
   to a dot in both languages. Write `top`, `right`, `bottom`, `left`.
6. **Rule 5 compares five attributes and ignores the rest.** Adding
   `onclick` and `style` to a link in the Arabic alone passed. The Arabic is
   trusted input from committers, so this is hygiene: reject any attribute in
   the Arabic that its English tag does not have, `dir` on a span excepted. That
   also closes the deferred `data-i18n-skip` and `aria-hidden` item.
7. **Text inside the mentor lists and the class pills escapes rule 9.** Adding
   "New mentor from Sunday:" inside a mentor row passed, as did "(moved to room
   12)" inside a pill. Both containers are excused whole. Accept for now; a
   line in `CLAUDE.md` under `#mentors` would do.
8. **A script error between the updates setup and the last line now also stops
   the updates painting in English**, because the first paint moved to
   `applyLang` at the foot (`index.html:3415`). On main they painted in place.
   No such error exists today. In Arabic the same error leaves English text in
   a right-to-left page after 1.5 s.
9. **The bell's English `aria-label` is captured after `refresh()` has written
   the count into it** (`index.html:2862`). Harmless, since `refresh()` runs
   again after every swap, which the markup comment already explains.
10. **Latin names and emails carry no `lang="en"` in Arabic mode**, so a screen
    reader may voice them with the Arabic voice. The update fallback in `put()`
    does set it. The "in English" tag is CSS generated content, which VoiceOver
    and TalkBack read; that is the wanted behaviour.
11. **The CLI test runs against the real `index.html`** (`tools/i18n.test.mjs:493-499`)
    and its second call would write to it if the usage guard ever regressed.
    Point it at a temp copy.
12. **No test covers `check.mjs` rules 9 to 11** (the `EN` table, twelve months,
    `{n}`) or the page script; the toggle round trip in `shot.mjs` is the only
    behavioural test of `applyLang`.
13. **Commits `187a592` and `9101230` lack the `Co-Authored-By` line** the plan
    requires.
14. On a slow connection the 1.5 s timer can lift the cover before the Arabic is
    written, showing English right to left for a moment. Accepted by design.

## Deferred items, triaged

| Item | Ruling |
|---|---|
| `jsonBlock` regex also matches `data-id=` | Acceptable. Tried: a decoy fails the check loudly, never passes silently. No such tag exists |
| `buildPairs` escapes only the pipe in Markdown | Acceptable. Review file only; the HTML version escapes fully |
| `tools/i18n.mjs` is one long file | Acceptable. Zero-dependency tool, clearly sectioned |
| Translator can add `data-i18n-skip` or `aria-hidden` in the Arabic | Acceptable. Deliberate act by a committer; Minor 6 closes it |
| Bare أول and ثاني accepted as number words | Acceptable. 23 and 7 entries hold them, so a dropped 1 or 2 could hide there; the accuracy review covered today's strings |
| CLI test depends on `index.html` beside the tool | Acceptable. See Minor 11 |
| Mentor lists skipped at the `<ul>` | Acceptable. Confirmed it escapes; see Minor 7 |
| `a20f8a3` and `5d4e738` had no scoped re-review | Reviewed here in their final state: the `EN` table, the contained hooks, `data-lang-ready`, the `unicode-bidi` rules. Sound |
| `h4 { text-transform: none }` in Arabic | Acceptable. Inside the RTL block, Arabic only |
| Both-language `@media (max-width: 359px)` rule | Acceptable. Measured: nothing changes at 360px and up. At 320px the emblem goes 36 to 32px and the bar padding 16 to 8px; text and page height are unchanged. `CLAUDE.md` records it |

## Declined to judge

- The quality and meaning of the Arabic: another seat's work.
- The visual design of the Arabic page beyond overflow and mirroring measures.
- Behaviour on real iOS Safari and Android devices: only desktop Chrome under
  phone emulation was available. Minors 2, 4 and 5 are reasoned from browser
  support, not observed on a device.
- The untracked files `docs/arabic/screens/`, `docs/arabic/reports/fix-wave-re-review.md`
  and the 27 September timetable page spec: not part of `3730690..187a592`.
- Whether to publish an update notice announcing Arabic: out of scope in the spec.

## Recommendations

- Fix Important 1 and Minors 1, 4 and 5 together; each is a few lines.
- Before going live, open the page once on an iPhone in Arabic and toggle
  mid-page, which is the one thing this review could not observe.
