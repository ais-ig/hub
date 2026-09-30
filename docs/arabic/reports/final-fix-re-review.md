# Final fix wave · scoped re-review

Reviewed 30 September 2026. Branch `arabic`, fix range `d97c577..d9f8e47`.
Read-only on the repository. Experiments ran on a `git archive d9f8e47` copy in
a scratch folder outside the repository. Scope: the findings list and the fix
diff, nothing else.

### Finding Verdicts

1. **Update notices had no hash** · ADDRESSED. `hashUpdate` at
   `tools/i18n.mjs:47` (eight hex of SHA-1, same `normalise`, over `title`,
   `text`, `label`); rule 3 for notices at `tools/i18n.mjs:777-786`, message
   names `updates.<id>` and the exact `stamp` command; `merge` stamps at
   `:924`; `stamp updates.<id>` and `stamp --all` at `:939-956`. Ten live
   entries carry `hAr` (`index.html:1417-1535`); no `id` line appears in the
   diff. Tests at `tools/i18n.test.mjs:557` (title), `:565` (text and label),
   `:577` (stamping clears it), `:586` (Arabic without `hAr`), `:594` (merge).
2. **`process.exit` truncating output** · ADDRESSED. `tools/i18n.mjs:1143` and
   `:1146` set `process.exitCode`; no `process.exit` remains in the file.
   Child-process test at `tools/i18n.test.mjs:534` asserts more than 8192
   bytes and parses all of it.
3. **`:has()` in a selector list** · ADDRESSED. `index.html:1264` and `:1266`
   are two rules.
4. **`inset`** · ADDRESSED. `index.html:272` is `top: 7px; right: 0; bottom:
   7px; left: 0`, the exact equivalent of `inset: 7px 0`. No `inset` left in
   the stylesheet.
5. **Keeping the reader's place** · ADDRESSED. `index.html:3428-3485`. Runs
   only inside the button's click handler; returns at `y <= 0`; scrolls with
   `scroll-behavior` forced to `auto` for the one call. Asserted in
   `tools/shot.mjs:450-497` with `overflow-anchor: none` injected, three
   sections, both languages.
6. **`results.sub` no-break space** · ADDRESSED. `index.html:2510`. The hash
   is over the English, so it is unchanged and still passes.
7. **Documents** · ADDRESSED. Notice hash: `CLAUDE.md:173-182` and `:215`,
   `README.md:301-311`. Mentor lists gap: `CLAUDE.md:187-193`,
   `README.md:320-323`. Spec rules 3 and 5 updated to match.

Beyond the list:

- **Rule 5 rejects an added attribute** · sound. `tools/i18n.mjs:405-429`,
  called only once the tag signatures match (`:742`), so the tags pair one to
  one. Two tests. The live page passes.
- **`I18N_PAGE`** · sound. `tools/i18n.mjs:1074`. The CLI tests copy the page
  to a temp folder and assert the copy is not written to.
- **Second hold when late fonts land** · sound in the main, with one Minor
  edge below.

### Checks run

- `node tools/check.mjs`: `ok   15 script strings have their English` /
  `all checks passed`.
- `node --test tools/i18n.test.mjs`: `# tests 105` `# pass 105` `# fail 0`.
- `bash tools/render-check.sh`: six `kept the place, within 0px` lines, then
  `all render checks passed`.
- Working tree after the three runs: unchanged (the same three untracked paths
  as at the start).
- **Scratch copy, reworded notice.** Changed the title of
  `2026-09-13-mentors` to "Homeroom mentors have changed again".
  `check.mjs` gave `FAIL i18n 3 stale: updates.2026-09-13-mentors has English
  that changed after its Arabic was written; update its titleAr, textAr and
  labelAr, then run: node tools/i18n.mjs stamp updates.2026-09-13-mentors`.
  Ran that command: `stamped updates.2026-09-13-mentors`, then `all checks
  passed`. The diff of the copy against the commit was two lines only, the
  title and that entry's `hAr`, so the block round-trips with no other change.
  A reworded `text` on `2026-09-09-live` also failed and was cleared by
  `stamp --all`. `stamp updates.nope` exits 1 and names the key.
- **Keep-place, in headless Chrome at a real 380px on the scratch copy**, with
  `document.fonts.ready` replaced by a promise the test controls and scroll
  anchoring off:
  - Initial load: `pageYOffset` 0, nothing scrolled.
  - Tap, reader scrolls 400px, fonts land: stays at the reader's position
    (3383 before and after). No yank.
  - Ten taps with fonts pending, then they land: zero `addEventListener`
    calls across the ten taps, no movement. Nothing accumulates; each tap
    leaves one one-shot promise callback, and only the last tap's can act.
  - Anchor `s3.compulsory` hidden by switching its tab after the tap and
    before the fonts: no movement. `holdPlace` returns on a zero rectangle,
    and `placeMark` never picks a hidden element.
  - Tap at the very top: nothing; inline `scroll-behavior` left empty.
  - Tap, follow an in-page link, fonts land 30ms into the smooth scroll:
    the link arrives.
  - Tap, follow an in-page link, fonts land in the same instant: see Minor 1.
- **English page.** The CSS changes are the `inset` rewrite (equivalent) and a
  rule under `html[dir="rtl"]`. The script change is inside the button's click
  handler; on load it only defines two functions and a counter. The page
  script reads `updatesData` by named fields and never enumerates an entry.
  In the rendered English DOM each `hAr` value appears exactly once, inside
  the `updatesData` JSON script block, and nowhere else.

### New Breakage in the Fix Diff

No Critical. No Important.

**Minor 1. The second hold can cancel an in-page link.** `index.html:3475-3478`.
The guard is "same tap count and the page has not moved 2px". A reader who
toggles and then taps a link to a section (or an update notice's `#` link)
before the late font lands has not moved yet for the first frame or so of the
smooth scroll. If `document.fonts.ready` resolves in that window, `holdPlace`
calls `scrollTo`, which stops the smooth scroll: the address bar shows the new
hash and the page stays put. Reproduced on the scratch copy with the fonts
resolved straight after the link's click (stayed at 3017, `#mentors` 6740px
away); at 30ms after the click it did not happen. It needs a font still in
flight and a link tap within about a frame of its landing, the reader loses
nothing, and a second tap works, so it is Minor. Fix, one line: also skip the
second hold when `location.hash` differs from its value at the tap, or drop
the pending hold on the first `click` or `touchstart` anywhere after the tap.
The comment's "or tapped again" means the language button only.

**Minor 2. A tab switched above the anchor before the late font lands.** Same
lines. The reader has not scrolled, so the second hold runs and keeps the
anchor element where it was while the panel above it changed height. Reasoned
from the code, not reproduced. Same fix as Minor 1.

### Out-of-Scope Observations

None new. The fixer's "Left, with the reason" table matches the instructions
given for this wave. A real iPhone has still not been used; the keep-place
behaviour was checked in Chrome with scroll anchoring off.

### Verdict

**Fix round:** all seven findings addressed, no new Critical or Important
breakage. Two Minor edges in the late-font second hold, neither blocking.
