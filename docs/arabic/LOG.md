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
