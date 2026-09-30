# Task 3 report · a key on every string

Status: DONE_WITH_CONCERNS (the concerns are judgement calls for Task 4 and
the owner, listed at the end; the keying itself passes every check).

## What was done

`index.html` only. 387 attributes were added to existing opening tags, on
339 lines, from the Start here band to the footer. No element was added,
wrapped, moved or re-indented, and no wording, `id`, `href` or class changed.
No Arabic was written.

- 286 new keys (`data-i18n` and `data-i18n-attr`).
- 26 `data-i18n-skip`.
- 19 `data-pdf-en`.

The edits were applied by a one-off script working from a hand-written list
of line, opening tag and key, so each attribute lands just before the `>` of
a tag I named. The script is not in the repository.

## Test results

- `node tools/i18n.mjs check`: 315 failures, 286 of rule 1 (the new keys have
  no Arabic yet) and 29 of rule 8. **No rule 9, rule 2 or rule 4 failure and
  no `i18n markup:` failure.** Before: 446 rule 9 and 29 rule 8.
- `bash tools/render-check.sh`: all render checks passed, both languages, no
  overflow at 380px, and both toggle-twice assertions restore the page
  exactly.
- `node --test tools/i18n.test.mjs`: 74 tests, 74 pass.
- **English unchanged.** `tools/shot.mjs` was run before any edit and
  `w380.png` and `w380-bell.png` were copied aside. After the edits both
  files are byte-identical to the copies (`cmp`), so the full-page render at
  380px is the same to the pixel.
- **The diff is attributes only.** Stripping `data-i18n="..."`,
  `data-i18n-attr="..."`, `data-i18n-skip` and `data-pdf-en` from every added
  line of `git diff` gives exactly the removed lines (`cmp`).
- `.superpowers/arabic/en.json` written by `node tools/i18n.mjs extract`:
  **366 keys in total, 286 of them new.** The other 80 are Task 2's 51 and
  the 29 update notice fields.

TDD was not required. The check tool is the test.

## Key prefixes

| Prefix | Covers | Keys |
|---|---|---|
| `start.*` | Start here band: heading, sub line, six cards (title with its icon span, description, the one non-PDF call to action) | 14 |
| `common.*` | `common.openpdf` ("Open PDF →"), `common.grade9` to `common.grade12` (timetable group labels, the two grade tabs, the mentor card headings) | 5 |
| `schedule.*` | Class timetables: title, sub, note, the eleven pill `aria-label`s (`schedule.pill.9a` ...), full timetable button, stamp | 16 |
| `results.*` | IGCSE results: title, sub, four stat labels, the Students strip | 7 |
| `s2.*` | Pathway: title, sub, lead, three journey steps (`.g` label, `.h` heading, `.p` text) | 12 |
| `s3.*` | Subject options: title, sub, lead, In short, tab list label, table heads, `s3.cur.moe`, notes, choice pairs, Hifdh card, the two boards, grade equivalence, reading the form, form row sub line | 53 |
| `subj.*` | Subject names shared by the Grade 9 table, the Grade 10 table, the choice pairs and the chips | 13 |
| `s4.*` | Assessment: title, sub, lead, the Semester One table, note, progress list, the guide row | 22 |
| `s5.*` | Support: title, sub, three cards, In short, mentorship card and list, `s5.mentors.*`, partnership | 19 |
| `s6.*` | Beyond the books: title, sub, lead, what is on offer, both activity lists, All year | 25 |
| `s7.*` | Policies: title, sub, attendance, phones list and table, behaviour intro and three levels (`.n`, `.d`, `.a`) | 31 |
| `s8.*` | All documents: title and sub only | 2 |
| `doc.*` | The document library: five group headings (`doc.head.*`) and each row's title (`.t`) and sub line (`.sb`). Reused by the identical rows in `#s3` and `#s7` | 36 |
| `changelog.*` | Change log section title and sub | 2 |
| `ask.*` | Ask block: title, lead, button, note | 4 |
| `contacts.*` | Contacts: title, sub, campus heading, seven role labels, role descriptions, six phone lines with an extension | 21 |
| `footer.*` | Footer: tag, two lines, back to top | 4 |

Keys are lower case with dots and digits throughout.

### Keys used in more than one place

All have identical English and the same meaning, so rule 2 holds.

- `common.openpdf` ×5, `common.grade9` ×3, `common.grade10` ×3,
  `common.grade11` ×2, `common.grade12` ×2.
- `start.options.d` ×2 (the two options form cards share their description).
- `s3.compulsory`, `s3.optional`, `s3.th.subject`, `s3.th.curriculum`,
  `s3.th.periods` ×2 each (Grade 9 and Grade 10 panels); `s3.cur.moe` ×10;
  `s3.choose` ×3; `s3.or` ×3; `s3.form.sb` ×2.
- `subj.arabic` ×4, `subj.english`, `subj.islamic`, `subj.quran`,
  `subj.social`, `subj.pe`, `subj.physics`, `subj.chemistry`,
  `subj.biology`, `subj.business`, `subj.accounting`, `subj.cs`, `subj.ict`
  ×2 each.
- `doc.head.options` ×2 (`#s3` and `#s8`), `doc.g9options.t` and
  `doc.g10options.t` ×2, `doc.options.sb` ×2, `doc.alevel.sb` ×2,
  `doc.weekly.sb` ×2, `doc.phonepolicy.t`, `doc.phonepolicy.sb`,
  `doc.commitment.t`, `doc.commitment.sb` ×2 each (`#s7` and `#s8`).
- `contacts.rl.british` ×2, `contacts.floor.rl` ×2.

## Every `data-i18n-skip` (26)

| Where | Count | Why |
|---|---|---|
| `<td class="cur">IGCSE</td>` in the Grade 9 (5) and Grade 10 (1) compulsory tables | 6 | IGCSE standing alone stays in Latin letters |
| `<div class="h">Cambridge</div>` and `<div class="h">Edexcel</div>` in "Where they differ" | 2 | Exam board names |
| The four `<ul class="ticks">` under `#mentors` | 4 | Each item is a class name, a staff name and an email and nothing else |
| `<p class="nm">` in the seven contact cards | 7 | Staff names |
| The `mailto:` link in the seven contact cards | 7 | Email addresses |

## Every `data-pdf-en` (19)

- Start here cards (4): Class Timetables, Grade 9 Options Form, Grade 10
  Options Form, Meet & Greet Presentation.
- `#schedule` (1): the "Open the full timetable" button.
- `#s3` (2): Grade 9 and Grade 10 options form rows.
- `#s7` (1): No Mobile Phone Policy.
- `#s8` (11): Class Timetables, Daily Schedule, Meet & Greet Presentation,
  the four options forms (Grades 9 to 12), British Curriculum Pathway,
  Parent Calendar, No Mobile Phone Policy, Student Council Policy.

Not applied, on purpose: the eleven class pills; the Semester 1 parent
letter; the Phone Policy Commitment Form (both rows); the Parent Guide (the
Start here card and the `#s8` row); every link that is not a PDF. See
rulings 1 and 2.

## Rulings

1. **The Phone Policy Commitment Form carries no English tag.** I extracted
   the text of every PDF in `assets/`. This form is bilingual ("Commitment /
   تعهد", Arabic field labels throughout), so telling an Arabic reader it is
   in English would be wrong.
2. **The Parent Guide carries no English tag either.** Its text is about a
   quarter Arabic (the map pages and the class index are in Arabic). It is
   mixed rather than fully bilingual, so this is the less certain of the
   two. The owner may prefer the tag; it is one attribute on two links.
3. **The Parent Calendar is tagged as English.** Its text layer is entirely
   Latin.
4. **`MoE` in the curriculum column is keyed** (`s3.cur.moe`), while `IGCSE`
   in the same column is skipped. MoE is an English abbreviation of a Saudi
   ministry and an Arabic reader expects its Arabic; IGCSE is on the spec's
   stay-in-Latin list.
5. **`PE` and `ICT` are keyed as subjects** (`subj.pe`, `subj.ict`). A cell
   holding only a subject name is translated, and the spec's options table
   rule (Arabic, then the English in brackets) needs a key to work on.
6. **Subject names share `subj.*` keys** across the two tables, the choice
   pairs and the chips. One consequence: the bracketed English form will
   appear in all four places, which is what the spec asks of "the options
   tables" and all four are inside Subject options.
7. **The two Maths options have four keys, not two.** Grade 9 reads
   "Mathematics<br>(Cambridge)" and Grade 10 reads "Maths Cambridge"; the
   English differs, so they are `s3.g9.maths.*` and `s3.g10.maths.*`.
8. **The results stat tiles key the label only.** The figure ("40.0%") has
   no letters and sits in its own span above the label, so the label is a
   complete phrase on its own line rather than half a sentence.
9. **Phone lines with an extension are keyed**, because "ext." is a word
   (`contacts.head.tel` and five more). The number travels inside the
   string; Task 4 should wrap it in `<span dir="ltr">`. Mr. Noor's line has
   no extension and no Latin letters, so it has no key. *Corrected in fix
   round 1:* I first wrote that it "needs nothing", which was wrong. In a
   right-to-left line its digit groups reordered to "1006 855 050". It is
   now held in order by CSS, see "Fix round 1".
10. **The mentor list is skipped at the `<ul>`**, four attributes rather
    than eleven. "Mr." stays with the name in Latin letters.
11. **Tabs are keyed on the buttons** (`#tab9`, `#tab10`) and the tab list's
    `aria-label="Grade"` on `.pills` is `s3.tabs.label`, as the Task 2
    report directs. `#mentors` is keyed on the `<h4>` that carries the id.
12. **"Ask a question" in the ask block is `ask.cta`**, a new key beside
    Task 2's `menu.ask` and `hero.cta.ask`. Task 2 already kept those two
    apart; Task 4 should give all three the same Arabic.
13. **Document rows reused in `#s3` and `#s7` share the `doc.*` keys of the
    library** where title or sub line is identical. The `#s3` sub line adds
    "print and sign", so it is `s3.form.sb`.
14. **Link-only rows that open a web page get no tag and no special key**,
    only title and sub line.

## Notes for Task 4

- Strings that carry markup the Arabic must repeat exactly (rule 5): the six
  `start.*.t` titles hold `<span class="ic" aria-hidden="true">` with the
  emoji; `s4.progress.li3` holds `<a href="#s5">`; `ask.note` holds the
  `mailto:` link with its inline `style`; many list items hold `<b>`.
- `s3.g9.maths.cambridge` and `.edexcel` hold a `<br>`.
- Numbers written as words in English ("two papers, two hours", "fifty per
  cent", "Forty per cent", "Ten to fifteen minutes") are not seen by rule 6,
  so nothing forces them; numerals in English must reappear in the Arabic.
- `schedule.pill.*` are `aria-label`s, heard and not seen.
- `footer.l2`, the six `contacts.*.tel` and `schedule.sub` hold runs that
  need `<span dir="ltr">`.

## Self-review

- Read the whole diff by way of the attribute-stripping comparison above, so
  nothing but attributes changed.
- Checked that no keyed element contains an `id` or another key (rule 4
  passes) and that no script-written element was keyed: `#updatesHead`,
  `#updatesList`, `#changelogList`, `#bellList`, `#bellCount`, `#cdMsg`, the
  countdown numbers and `#langbtn` are untouched.
- Did not look at the Arabic screenshots by eye. In Arabic mode the newly
  keyed text is still English, as expected, and the automated overflow and
  restore checks pass.

## Concerns

- **Ruling 2** (the Parent Guide without the English tag) is a judgement on
  a mixed document.
- **Ruling 6**: if the owner wants bracketed English only in the two tables
  and not in the choice pairs or chips, the pairs and chips need their own
  keys. That is a small change, but it is a change to keys.
- **Inline `<b>` lead-ins** such as `<b>Students</b> 24 with ...` and
  `<b>In short</b> ...` are one key with the label inside, as instructed.
  The translator must keep the `<b>` first in the string, since CSS styles
  it as a label.
- The mentor lists and contact names stay fully Latin inside a right-to-left
  card. Whether that reads well is for the Arabic screenshot review.

## Files

- `index.html`
- `docs/arabic/reports/task-3-report.md` (new)
- `.superpowers/arabic/en.json` (git-ignored, left in place)

## Fix round 1

After the review (two Important findings). No key was renamed, removed or
added. `index.html` gained one comment and five lines of CSS in the
`html[dir="rtl"]` block, before the document arrow rule; nothing else.

### What changed

```css
html[dir="rtl"] a[href^="tel:"],
html[dir="rtl"] a[href^="mailto:"],
html[dir="rtl"] table.data td.num { unicode-bidi: plaintext; }
html[dir="rtl"] .ccard a { text-align: right; }
html[dir="rtl"] table.data td.num { text-align: left; }
```

1. **Phone and email links keep their own order.** Every `tel:` and
   `mailto:` link takes its direction from its own first strong letter. A
   line of digits only (Mr. Noor's) or an email has no Arabic letter and
   runs left to right, so it reads 050 855 1006.
2. **Grade and number cells keep their own order.** `table.data td.num`
   gets the same treatment, so `A*` stays `A*`. This covers the
   equivalence table, the options tables, the assessment table and the
   phone table, which all use `td.num` for their grades and numbers.
3. **Alignment is kept.** `td.num` was `text-align: end`, which in Arabic
   is the left; `.ccard a` is a block link at the default start, which in
   Arabic is the right. With `plaintext`, start and end follow each line's
   own direction, so both are now stated outright as `left` and `right`
   and do not move.

### Ruling: `plaintext`, not `direction: ltr; unicode-bidi: isolate`

The review asked for a forced left-to-right isolate on the links. I tried
the reasoning through against the six keyed `contacts.*.tel` lines and it
fails them: once translated they read "phone, number, middot, تحويلة 236",
an Arabic sentence, and a forced left-to-right base would lay its parts out
in the English order, with the extension an Arabic reader meets first. The
review allows "an equivalent" for the cells and asks that both cases read
correctly for the links; `unicode-bidi: plaintext` does that for both. A
line with an Arabic word runs right to left, a line without one runs left to
right. The translators' `<span dir="ltr">` around the number still works
inside it.

### What I looked at

`node tools/shot.mjs --lang=ar`, with two Arabic strings merged in
temporarily (`contacts.head.tel` as the phone icon, the number in
`<span dir="ltr">`, a middot and "تحويلة 236"; `s7.phones.hours24` as
"24 ساعة"), then `index.html` restored from a copy and confirmed identical
with `cmp`. The full-page PNG was cut into strips and I read these:

- **Contacts, Activity Supervisor card**: the line reads `050 855 1006`
  after the phone icon, at the right edge like the other cards.
- **Contacts, Head of School card** (the temporary Arabic): from the right,
  phone icon, `054 987 4933`, middot, `تحويلة 236`. Correct Arabic order,
  number intact, right-aligned.
- **Contacts, the five other keyed lines** (still English): unchanged,
  `050 043 1494 · ext. 213` and so on, right-aligned.
- **Email links**: intact and right-aligned.
- **Edexcel grade equivalence**: the first cell reads `A*`; A, B, C, D
  below it; all at the left edge of the column as before.
- **Semester One table**: 6, 4, 10, 20, 30, `50%` and the en dash in place
  at the left of their columns.

Not read: the phone table row with the temporary "24 ساعة". Its cell uses
the same rule as the Head of School line, which I did read.

### Commands and output

- `node tools/i18n.mjs check`: 315 failures, 286 rule 1 and 29 rule 8. Zero
  rule 9, rule 2, rule 4, no markup failure. Same as before the round.
- `bash tools/render-check.sh`: `all render checks passed`, no FAIL line,
  both languages, no overflow at 380px.
- `cmp` of the English `w380.png` and `w380-bell.png` against the baseline
  taken before Task 3 began: both byte-identical.
- `node tools/check.mjs`: no failure other than the rule 1 and rule 8 ones.

### Files

`index.html`, this report.
