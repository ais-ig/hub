# Arabic for the Parent Hub · work log

Everything that happened while you were away, in order, newest at the bottom.
Branch `arabic`, local only. Nothing is pushed. The work is committed locally
on that branch, one commit per step, so `git diff main..arabic` shows all of it
and `git log main..arabic` shows the order. `main` is untouched.

Files to open when you are back:

| File | What it is |
|---|---|
| `docs/arabic/LOG.md` | This log. |
| `docs/arabic/translation-review.html` | Every English string with its Arabic, side by side. Open in a browser. |
| `docs/arabic/translation-review.md` | The same pairs as plain text, for searching. |
| `docs/arabic/reports/` | The full report of every sub-agent: builders, reviewers, critics. |
| `docs/superpowers/specs/2026-09-30-arabic-language-design.md` | The design. |
| `docs/superpowers/plans/2026-09-30-arabic-language.md` | The build plan the agents followed. |
| `index.html?lang=ar` | The page in Arabic. |

## Decisions you made before leaving

1. Add Arabic, keep English. A toggle, not a replacement.
2. I draft the Arabic, you review it.
3. The page opens in English; the toggle and `?lang=ar` switch to Arabic.
4. The Arabic lives in one dictionary block inside `index.html`, keyed by `data-i18n`.
5. Arabic typeface: whatever ais.sch.sa uses. That is Cairo.
6. Build with Opus sub-agents, with reviewer and critique agents; log everything; do not push; produce an English to Arabic file.

## Decisions I made for you

You left before confirming part 1 of the design and before parts 2 and 3 were
presented. I took every open point on my own judgement. Each is reversible, and
each is listed here so you can overrule it.

| # | Decision | Why | To reverse |
|---|---|---|---|
| D1 | Part 1 of the design stands as presented: staff names stay in Latin letters; subject names are Arabic with the English in brackets in the options tables. | I cannot verify the Arabic spelling of staff names, and the options forms parents fill in are English. | Edit the strings in the Arabic block. |
| D2 | Western digits (2026, 6:30), not Arabic-Indic. | ais.sch.sa does this in its Arabic pages. | A single replace over the Arabic block. |
| D3 | The reader is addressed in the respectful plural (يمكنكم, ابنكم). | Standard for Saudi school letters, and it avoids choosing between father and mother. | Translation pass. |
| D4 | Right-to-left layout is a separate block of `html[dir="rtl"]` overrides. The existing CSS is not rewritten. | The English page parents use today stays byte-for-byte the same in layout. | Delete the block. |
| D5 | Toggling switches in place, without a reload. | The parent keeps their place on the page. | n/a |
| D6 | Each Arabic entry stores a short fingerprint of its English text, and `tools/check.mjs` fails when the English changes and the Arabic does not. | Drift is the long-term risk on this page: the prose is duplicated from source documents that change. | Remove the check. |
| D7 | `tools/check.mjs` also fails if a number in an English string is missing from its Arabic. | Assessment weights, times and dates must not differ between languages. | Remove the check. |
| D8 | Update notices carry `titleAr`, `textAr`, `labelAr` beside the English in `updatesData`. | Whoever adds a notice sees both languages in one place. | n/a |
| D9 | Document cards get a small "بالإنجليزية" tag in Arabic mode. | Every PDF is English. | Remove one CSS rule. |
| D10 | No "now available in Arabic" update notice is added. | Notices must be dated the day they go live, and that day is yours to choose. A draft is in the section "Left for you" at the end. | n/a |
| D11 | Work is committed locally on branch `arabic`. Not pushed. | Each reviewer agent is handed the exact diff of the step it reviews, which needs commits. You only ruled out pushing. | `git checkout main` leaves it behind; `git branch -D arabic` discards it; the commits can be squashed into one before any push. |
| D12 | The separate class timetable page in the pending 27 September spec is out of scope. | It does not exist in the repository yet. | n/a |

## Timeline

### 30 September 2026

- Read the page, the tools and the archived hub. Found 468 English text nodes, about 2,500 words, and ten update notices. JavaScript writes text in three places only: updates, change log, countdown.
- Checked ais.sch.sa. Arabic pages load Cairo from Google Fonts, use Western digits, and write الصف التاسع, مدارس الرواد العالمية, أولياء الأمور.
- Created branch `arabic`.
- Wrote the design (`docs/superpowers/specs/2026-09-30-arabic-language-design.md`) and a seven-task plan (`docs/superpowers/plans/2026-09-30-arabic-language.md`). Committed both with this log as `6c2890d`.
- The plan, in order: 1 the translation tool and its checks; 2 the switching mechanism, proven on the top bar and hero; 3 a key on every string; 4 translation by three agents in parallel, then a merge; 5 two Arabic reviewers (accuracy, fluency) and a fixer; 6 a visual critique of the right-to-left page from screenshots; 7 documentation. Each of tasks 1 to 3 is followed by an independent reviewer, and a whole-branch code review comes last.
- How the agents are run: every builder, reviewer and critic is a fresh Opus agent that sees only its brief, the spec and the diff, never this conversation. No agent reviews its own work.
- Task 1 dispatched.
- **Task 1 built**: `tools/i18n.mjs` and 48 tests (`5a076e5`). Report: `docs/arabic/reports/task-1-report.md`.
- **Task 1 reviewed** by an independent agent. Verdict: needs fixes. Two real holes, both about update notices: numbers in a notice were not compared between English and Arabic, and a broken `updatesData` block passed silently. Sent back to the builder with five further tightenings of mine:
  - the "untranslated English" check now also covers screen-reader labels (`aria-label`, `alt`, `title`), which the design had missed;
  - `stamp` must be told which keys, so stale Arabic cannot be cleared by one bare command.
  The spec was amended to match.
- **Task 1, fix round 1** (`3fe9590`, 69 tests). Re-reviewed: all six points fixed, one new gap found, an English screen-reader label could sit inside an Arabic string unchecked.
- **Task 1, fix round 2** (`a264bf9`, 74 tests). Re-reviewed: clean. **Task 1 is complete.** Three small points are parked for the final review rather than fixed now; the most useful is that no rule yet fails an "Arabic" entry that is really English copied over.
- **Task 2 dispatched** in parallel with the above: the switching mechanism in `index.html`.
- **Task 2 built** (`f190ceb`): the language button, the head script, `applyLang`, the Arabic for the top bar, menu, bell, hero and banner (51 strings), Cairo, the right-to-left CSS block, and the Arabic runs of `tools/shot.mjs` and `tools/render-check.sh`. Both languages pass at 380px; toggling twice restores the page exactly. Report: `docs/arabic/reports/task-2-report.md`.
- **Task 2 reviewed**: approved, nothing critical or important. The reviewer read all 51 Arabic strings, confirmed the English updates behaviour is unchanged, and confirmed no failure can leave the page blank. Nine minor points; I had eight fixed straight away because later tasks build on them.
- Decisions from that review, added to the table above in effect:
  - **D13** In Arabic mode, Latin text (IGCSE, 9A, digits) is also set in Cairo, so one line never mixes two typefaces. English mode is Poppins only, as before.
  - **D14** The glossary's short commands were singular (ابدأ، اطرح) against my own respectful-plural rule. Now plural: ابدأوا من هنا، اطرحوا سؤالاً، مع من تتواصلون.
  - **D15** "Beyond the books" is خارج الصف, not the literal أبعد من الكتب. "Apply for Student Council" is الترشح لمجلس الطلاب.
- **Task 2 polish** (`a20f8a3`): the eight minor points and the wording rulings applied. **Task 2 is complete.**
- **Task 3 built** (`e4b59fa`): a translation key on every remaining string. 366 keys in all, 286 new. The English page is byte-for-byte the same in screenshots before and after, and the diff adds attributes only. 26 items are marked to stay in Latin letters (names, emails, codes); 19 links are marked as English PDFs. Report: `docs/arabic/reports/task-3-report.md`.
  - **D16** Subject names read "Arabic (English)", e.g. الأحياء (Biology), everywhere they appear, not only in the tables, because one key serves all four places.
  - **D17** The Parent Guide and the phone policy Commitment Form do not get the "بالإنجليزية" tag: the builder extracted their text and both contain Arabic.
- **Task 3 review and Task 4 translation started together.** Three translators work in parallel on separate batches (A: start band, timetables, results, pathway, options, subject names · B: document library, assessment, support, activities · C: policies, contacts, footer, the ten update notices). Each writes only its own file, reads every string in its page context, validates tags and numbers against the checker, and must list every string it was unsure of. Those "Unsure" lists are in `docs/arabic/reports/task-4-translator-*.md` and are the first thing worth reading.
- **Task 3 reviewed**: keying clean, provably attribute-only. Two real findings, both about text that would display reversed in a right-to-left line and had no key to fix it through: Mr. Noor's phone number (would show as "1006 855 050") and the grade cell "A*" (would show as "*A"). Fixed in CSS for the whole class of problem (`5d4e738`): every phone and email link and every grade or number cell keeps its own order in Arabic. The builder rendered both and read them. **Task 3 is complete.**
- **The checker learned Arabic number words** (`bc10eae`, 88 tests). The translators rightly wrote الصف التاسع for "Grade 9", and the number check then reported the 9 as missing. Instead of switching the check off for those strings, the check now accepts an Arabic number word (one to twelve, ordinal or cardinal, either gender) in place of the digit. A wrong ordinal still fails.
- **Task 4, translation**: batches A (120 strings), B (102) and C (93) came back. Every string passed the tag and forbidden-character checks. Between them the translators listed **121 strings they were unsure of**, in `docs/arabic/reports/task-4-translator-A.md`, `-B.md` and `-C.md`.
  - I checked mechanically for the same English given different Arabic in different batches: none.
  - Merged into `index.html` (`e8e2b5f`). `node tools/check.mjs` passes in full: 366 strings in step. `bash tools/render-check.sh` passes in both languages.
  - **`docs/arabic/translation-review.html` and `.md` now exist**: every English string beside its Arabic, 366 rows, none missing. They are regenerated after every fix, so what you open is current.
- **Tasks 5 and 6, review**: three independent agents now running, none of whom wrote any of it.
  - Accuracy: every Arabic string against its English; also rules on all 121 "unsure" items.
  - Fluency: reads the Arabic alone, as a Saudi parent, before seeing any English.
  - Visual: renders the Arabic page at 320, 380, 800 and 1100px in readable slices, opens the menu, bell, tabs and countdown, compares the English page with `main`, and tests the `?lang=` link on a real local server.
  One fixer applies all three reports afterwards.
- **Accuracy review** (`docs/arabic/reports/task-5-accuracy-review.md`). All 366 pairs read against the English. Verdict: trustworthy. Every number, date, time, phone number, extension and name matches, and no condition is lost in the policy, assessment or timetable text. 23 findings: 2 strings that could be misread (the phone commitment form's subtitle; and "candidates", which my glossary term made read as "advanced students"), 1 content slip, 2 glossary, 16 consistency between batches, 2 style. It also ruled on all 121 "unsure" items: 97 keep, 14 change, 10 ask the school.
- **Fluency critique** (`docs/arabic/reports/task-5-fluency-critique.md`). Read the Arabic alone first. Verdict: reads as one hand and mostly as school Arabic, publishable once its first twelve findings are applied. 41 findings. Weakest: the behaviour levels, the activities lead, and "intervention". It challenged several of my glossary terms, and I accepted most (below).
- **Visual critique** (`docs/arabic/reports/task-6-visual-critique.md`). Rendered at 320, 380, 800 and 1100px. Verdict: sound, nothing broken, properly mirrored, Cairo with letters joined, no overflow at any width. 2 wrong, 4 rough, 6 nits.
  - English at 380px against `main`: 28 of 31 slices pixel-identical; the other 3 differ only in the rectangle of the new button.
  - The countdown works in Arabic in all three states.
  - On a real local server, `?lang=ar` opens in Arabic, cleans itself out of the address bar, survives a reload, and `?lang=en` returns to English.
- **My rulings for the fixer**, where the reviewers disagreed with each other or with my glossary (`.superpowers/arabic/fix-rulings.md`, local only):
  - **D18** Mobile phone is الجوال, not الهاتف المحمول. Both a translator and the fluency critic said Saudi parents and school circulars say الجوال. If the school's own bilingual commitment form uses another word, the fixer follows the school.
  - **D19** "Mark as read" is تمييز كمقروء, the wording phones and WhatsApp use.
  - **D20** Academic "intervention" is الخطة العلاجية; "early dismissal" is الاستئذان; the summer schedule is الدوام الصيفي.
  - **D21** Percentages are digits in Arabic (60%) even where the English spells them out, so a parent scanning for the pass mark finds it.
  - **D22** One grade alone is a word (الصف التاسع); grades listed together are digits (الصفوف 9 و11 و12); a sentence that lists grades uses digits throughout.
  - **D23** Kept, because only the school can say: مقر البنين for "Boys campus", مدير المدرسة and نائب مدير المدرسة for Head and Deputy Head, المرشد الطلابي for the counsellor.
  - **D24** D17 reversed for the Parent Guide: it is an English document in effect, so it gets the بالإنجليزية tag. The Commitment Form stays untagged; it is bilingual.
- **One fixer** is applying all three reports under those rulings, and **Task 7** (CLAUDE.md and README) is being written in parallel.
- **Fix wave** (`e9ac676`, report `docs/arabic/reports/task-5-6-fix-report.md`). Applied: accuracy 23 of 23, fluency 37 of 41, visual 11 of 12, and all 14 "change" verdicts on the unsure items. 70 Arabic strings changed. Rejected with reasons: four fluency points and one visual point.
  - The school's own bilingual commitment form says الجوال, so D18 is confirmed by the school's wording.
  - The Semester 1 letter's card now uses the Arabic title printed on the letter itself: الخطة الدراسية وتوقعاتنا من الطالب.
  - The fixer also added two checks I had parked: an "Arabic" entry with no Arabic letters now fails as untranslated, and the review file no longer glues words together where a tag was removed.
  - Final captures of the Arabic page are in `docs/arabic/screens/` (not committed): 380px and 800px in page order, plus the menu, the bell and both option tabs.
- **Task 7, documentation** (`9101230`, `187a592`). `CLAUDE.md`: the "English only" decision is replaced by the new locked decisions with the date and the reason, Cairo added to the brand rules, the Arabic writing rules, a new section "English and Arabic move together" with step-by-step recipes, and the traps found on the way. `README.md`: an "Arabic" section with the same recipes as commands. Every recipe was later run as written by the final reviewer and worked.
- **Re-review of the fix wave** (`docs/arabic/reports/fix-wave-re-review.md`), by a fresh agent. Clean. All 70 changed strings read against the English: no number, date, name or condition lost. No leftovers of the replaced terms. All 62 captures opened: nothing clipped, misordered, disconnected or unmirrored. It agreed with all five rejections.
- **Final whole-branch code review** (`docs/arabic/reports/final-code-review.md`). Verdict: **ready for your review.** No critical findings, one important, 14 minor.
  - English reader: the page text is identical to `main` at 380, 360 and 320px apart from the button; the bell's read state carries over from `main` and back.
  - Never blank: blocked storage, a broken Arabic block, a deleted English block, JavaScript off, and a script error all leave a visible page.
  - No injection path: `?lang=` only meets an `ar|en` test, and notice text is written as text, not HTML.
  - It attacked the checker with realistic edits (a changed sentence, number, label, link, a new paragraph, a notice without Arabic, English pasted as Arabic): all caught.
  - The one important finding: update notices had no fingerprint, so **rewording a notice's English would pass with stale Arabic**. Being fixed now, with a few of the minors (keeping your place on the page when you switch language mid-page, two old-browser CSS points, a truncated-output bug in the tool).
  - Accepted and not fixed: English readers now download Cairo's Arabic subset (about 31 KB, once) because the button says العربية. The page HTML grew from 25 KB to about 47 KB compressed.
