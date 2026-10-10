# Ask a Question form and its notification script

Design, 10 October 2026. Brainstormed on 7 October 2026 and approved in
conversation on 10 October 2026.

## Purpose

The Google Form that collected questions for the Parents' Meet & Greet on
9 September 2026 becomes the British Section's year-round question form, for
parents and students on the boys campus. Every submission emails the Head of
School, Mr. Farhan Hussein, within seconds, with every answer laid out, a
Reply that goes straight to the person who asked, and a tap-to-open WhatsApp
link for their mobile number. The person who asked gets Google's own automatic
copy of their answers. The hub announces the change and its wording widens to
include students.

Nothing on the form is hosted or paid for. The script lives inside the form and
runs from Mr. Farhan's account.

## What exists today

- The form, "Parents' Meet and Greet: Question Submission", public link
  `https://docs.google.com/forms/d/e/1FAIpQLSe5bU8ruZOil2hbbXmYcrQNrXJu1IDsOPLj1kQ1FtgIGw69Ow/viewform`.
  The hub links it from the hero button, the Start here card and the
  `#ask` block; README lists the three. Its banner was already replaced by
  the user on 7 October 2026.
- Settings since 9 September 2026: no sign-in, no domain restriction, no email
  collection, no one-response limit. That is what lets a parent without a
  Google account use it, and it stays.
- Questions, English title with the Arabic in the description: Parent Name,
  Student Name, Section (Boys / Girls), Grade (9 to 12), Email or Mobile
  Number (optional), Topic (nine choices, Other last), Your Questions.
- A linked responses sheet. One response so far, on 27 September 2026 at
  07:51, from a Grade 9 parent about a Chemistry lesson with no link sent,
  during the online week. Nobody was notified. The hand-off message to the
  Head names it.

## Decisions

1. **The same form, edited in place.** Renaming a form keeps its link, so the
   hub's three links and the printed QR codes keep working.
2. **Google collects the email and sends the copy.** "Collect email
   addresses" is set to **Responder input**, which adds a required Email box
   the parent types into, with no sign-in. "Send responders a copy of their
   response" is set to **Always**. The copy comes from Google's own address,
   `forms-receipts-noreply@google.com`, not the Head's, so a stranger's
   address typed into the form never receives mail in the Head's name. That
   removes the abuse risk that an earlier draft of this design capped at three
   copies a day, and it means the script never writes to anyone but the Head.
   **Not "Verified"**: that is the Google sign-in wall removed on 9 September.
3. **One email per submission, immediately, to the Head only.** The script
   sends from the account that installed it, to that same account. A daily
   digest was considered and rejected: the brief was "as soon as a submission
   is received".
4. **Reply goes to the parent.** The email carries a `Reply-To` of the
   respondent's address, so pressing Reply in Gmail addresses the parent, with
   their question quoted underneath. No forwarding. Gmail normally honours
   `Reply-To` on mail you sent yourself; the go-live test proves it, and if it
   ever does not, forwarding is the fallback and the README says so.
5. **The script is bound to the form, not the sheet.** It reads each
   submission straight from the form event, so it keeps working if the sheet is
   moved, renamed or unlinked, and it needs no IDs in its source.
6. **Boys campus only.** The Section question is deleted. Old answers stay in
   the sheet. The hub serves the boys campus and the form follows it.
7. **Students can ask.** A new first question, "I am a", with Parent and
   Student. "Parent Name" becomes "Your Name".
8. **Test mode lives in Script Properties, never in source.** The repository
   is public. The source holds no address, no ID and no secret: the recipient
   is the installing account, recorded by the setup function, and the test
   address is a property the installer types in.
9. **Nothing more.** No tracking columns in the sheet, no acknowledgement from
   the Head's address, no routing by section, no digest. Each can be added
   later without undoing any of this.

## The form, final shape

Settings, Responses tab:

| Setting | Value |
|---|---|
| Collect email addresses | Responder input |
| Send responders a copy of their response | Always |
| Allow response editing | Off |
| Limit to 1 response | Off |
| Restrict to users in ais.sch.sa (Requires sign-in) | Off |
| Responses go to the linked sheet | Unchanged |

Title and description. Google puts the form title in the subject of the copy it
sends, so the title has to read well in an inbox.

- Title: `British Section (Boys): Ask a Question`
- Description, English then Arabic on the next line:
  `For parents and students of the British Section, boys campus. Send any question at any time of the year, and we will come back to you.`
  `لأولياء الأمور وطلاب القسم البريطاني، مجمع البنين. أرسلوا أي سؤال في أي وقت خلال العام، وسنرد عليكم.`

The description, the help texts and the hub's wording say nothing about where a
question goes or about the copy Google sends. Those are background mechanics,
at the user's decision on 10 October 2026.

Questions, in order. The English title is the contract the script matches on;
the Arabic goes in each question's description, as now. Required questions are
marked with an asterisk.

| # | Title | Type | Arabic description and notes |
|---|---|---|---|
| 1 | I am a * | Multiple choice | `أنا`. Choices `Parent / ولي أمر`, `Student / طالب`. New. |
| 2 | Your Name * | Short answer | `اسمكم`. Renamed from Parent Name. |
| 3 | Student Name * | Short answer | `اسم الطالب`. Help text: `If you are the student, write your own name. / إن كنتم الطالب فاكتبوا اسمكم.` |
| 4 | Grade * | Dropdown | Unchanged: Grade 9 to Grade 12, each with its Arabic. |
| 5 | Email * | Google's own field | Added by the Responder input setting. Google labels it. |
| 6 | Mobile Number | Short answer | `رقم الجوال`. Optional. Help text: `Optional. / اختياري.` Renamed from Email or Mobile Number. |
| 7 | Topic * | Dropdown | Unchanged: the nine topics, Other last. |
| 8 | Your Question * | Paragraph | `سؤالكم`. Renamed from Your Questions. |

Deleted: Section. The responses sheet keeps its old columns; Google adds a
column for each new question and renames the headers of renamed ones.

The Arabic follows the hub's writing rules: respectful plural, Western digits,
no em dash, الصف for a grade, and the glossary terms (أولياء الأمور, مدير
المدرسة, القسم البريطاني).

## The notification email

| Part | Value |
|---|---|
| From | The installing account, Mr. Farhan's. Sender name `Ask a Question form`, so it stands apart from his own mail in the inbox. |
| To | The address stored in the `TO` property by `setup()`, which is the installing account. In test mode, the `TEST_TO` property instead. |
| Reply-To | The respondent's email, when it looks like an address. |
| Subject | `New question · <Topic> · <Grade> · <Name>`, English halves of the bilingual choices only, for example `New question · Attendance and Timetable · Grade 9 · Suzan`. The fixed opening words make a Gmail filter trivial. Test mode prefixes `[TEST] `. |

Body, HTML with inline styles only, Arial, a deep navy `#0C2E54` header strip
and the gold `#EDBA1D` rule, since Gmail strips style blocks and loads no web
fonts. A plain-text part carries the same content.

- Heading: `New question from the Ask a Question form`.
- A two-column table: Received (Riyadh time, `Saturday 10 October 2026, 14:05`),
  From (`<name> · Parent` or `· Student`), Student, Grade, Topic, Question,
  Email as a `mailto:` link, Mobile.
- Every answer is HTML-escaped and sits in a cell with `dir="auto"`, so an
  Arabic answer reads right to left and a Latin one left to right. The
  question cell keeps line breaks.
- Mobile shows the number as typed and, when it normalises, a link `Open in
  WhatsApp` to `https://wa.me/<digits>`. With no number the cell reads `Not
  given`. A number that does not normalise shows as typed with no link.
- Footer: `Press Reply to answer <name>; your reply goes to <email>.` A link
  `Open the responses sheet` when the form has a linked sheet. Then: `Sent
  automatically by the form's script. Every submission is saved in the form
  whether or not this email arrives.`

### Mobile number normalisation

Applied before building the WhatsApp link. The displayed number is always the
text as typed.

1. Convert Arabic-Indic digits (U+0660 to U+0669) and Eastern Arabic-Indic
   digits (U+06F0 to U+06F9) to Western digits.
2. Keep digits and a leading plus; drop spaces, dashes, dots and brackets.
3. Drop a leading `+` or `00`.
4. Ten digits starting `05`: replace the `0` with `966`.
5. Nine digits starting `5`: prefix `966`.
6. Twelve digits starting `966`: as is.
7. Any other run of 8 to 15 digits not starting with `0`: as is, so a
   non-Saudi number typed with its country code still links.
8. Anything else: no link.

| Typed | Link digits |
|---|---|
| `050 855 1006` | `966508551006` |
| `+966 50 855 1006` | `966508551006` |
| `00966508551006` | `966508551006` |
| `508551006` | `966508551006` |
| `٠٥٠٨٥٥١٠٠٦` | `966508551006` |
| `+44 7700 900123` | `447700900123` |
| `12345` | none |
| empty | none |

## The script

Files, all under `tools/ask-a-question/`:

- `Code.gs`, the Apps Script source, pasted by hand into the form's script
  editor. Plain ES5-style JavaScript so Apps Script and Node both run it.
- `code.test.mjs`, `node:test` tests that load `Code.gs` through `vm` and
  exercise the pure functions. Zero dependencies, like `tools/i18n.test.mjs`.
- `README.md`, the install, test, go-live and troubleshooting steps, and the
  form checklist above, for whoever next touches the form.

`Code.gs` is split so that everything with logic is pure and testable, and
everything that touches Google is a thin shell.

Pure functions, no Apps Script globals:

- `englishHalf(s)`: the text before ` / ` in a bilingual choice, trimmed.
- `waDigits(s)`: the normalisation above; returns a digit string or `''`.
- `parseAnswers(items, email, timestamp)`: takes `[{title, answer}]` and
  returns a plain object with `who`, `name`, `student`, `grade`, `topic`,
  `question`, `email`, `mobile`, `received`, matching titles
  case-insensitively and ignoring surrounding spaces, so a stray space in the
  form editor does not break it. Unknown titles are kept in `extra` and
  listed at the end of the email, so a question added later is never lost.
- `buildSubject(a, testMode)`, `buildHtml(a, sheetUrl)`, `buildText(a, sheetUrl)`,
  `escapeHtml(s)`, `formatRiyadh(date)`.

Shell functions, each a few lines:

- `onFormSubmit(e)`: reads `e.response`, builds the answers, sends with
  `MailApp.sendEmail({to, replyTo, subject, htmlBody, body, name})`. The
  rich build sits in a `try`; if it throws, a plain fallback email listing
  every item title and answer is sent instead, so a formatting bug never
  loses a question. If the fallback also throws, the error is rethrown so
  the trigger's failure notification reaches the owner.
- `setup()`: run once by the installing account. Deletes this project's
  existing triggers, creates the installable on-form-submit trigger for the
  form, stores `TO` as the effective user's address, and logs the result.
- Test mode is switched on by adding `TEST_TO` under Project Settings, Script
  Properties, in the editor. Every email then goes there with `[TEST] ` in the
  subject. A function cannot take the address, because the editor runs
  functions without arguments, and the address must not be typed into the
  source.
- `goLive()`: deletes `TEST_TO`.
- `sendSample()`: sends a sample email built from made-up answers, including
  an Arabic question and a mobile in Arabic-Indic digits, so the layout can
  be checked before any real submission.
- `status()`: logs the mode, the recipient and the trigger count.

`MailApp`, not `GmailApp`, so the only mail permission asked for is "send
email as you". The other scopes are the form itself and trigger management.
No Sheets scope: the responses-sheet link is built from the form's destination
ID. The daily sending quota on a Workspace account is 1,500, against one email
per submission.

Everything typed by a respondent is escaped before it is placed in HTML, and
`Reply-To` is set only when the address matches a simple email pattern.

## Hub changes

All in `index.html`, English and Arabic in the same commit, under the i18n
workflow in CLAUDE.md.

- `ask.lead`: `Send it through the form at any time in the year and we will
  come back to you by email.`
- `ask.note`: `The form is for parents and students, opens in a new tab and
  takes under a minute. Prefer email? Write to the Head of School.` The
  mailto link and its `href` stay as they are.
- `start.ask.d`: `Parents and students can send us a question about
  anything, any time through the year.`
- A new `updatesData` entry, dated the day it goes live, with `titleAr`,
  `textAr` and `labelAr`, `href` the form's public link and `label` `Open the
  form`. Title: `Ask a question any time, parents and students`. Text: `The
  question form from the Meet & Greet now stays open all year, for parents
  and for students. Send any question at any time and we will come back to
  you.` Stamped with
  `node tools/i18n.mjs stamp updates.<id>`.
- README: the Ask a question paragraph gains the form's new title, the
  settings that matter and a pointer to `tools/ask-a-question/`.
- CLAUDE.md: the Ask a question sentence under Content sources gains the same
  pointer, one line.

Checks before the commit is called done: `node tools/check.mjs`,
`node --test tools/`, `bash tools/render-check.sh` in both languages, and a
look at the Arabic screenshot of `#ask`.

## Testing

Unit, `node --test tools/ask-a-question/code.test.mjs`:

- `englishHalf` on a bilingual choice, a plain string and an empty string.
- `waDigits` on every row of the table above.
- `parseAnswers` with the exact titles, with changed case and spaces, with a
  missing optional mobile, and with an unknown extra question.
- `buildSubject` in live and test mode.
- `buildHtml` escapes `<` and `&`, puts `dir="auto"` on value cells, keeps the
  question's line breaks, renders the WhatsApp link only when the number
  normalises, and writes `Not given` for a missing mobile.
- `buildText` carries every field.

Manual, in test mode against the live form, with `TEST_TO` set to the user's
address:

1. In a logged-out window the form opens with no sign-in wall, the Email box
   sits at the top, and after submitting a copy arrives from Google at the
   typed address.
2. The notification arrives at the test address with the `[TEST]` subject,
   the table filled, an Arabic question right to left, and the WhatsApp link
   opening a chat on a phone.
3. Reply in Gmail pre-addresses the respondent.
4. A submission with no mobile shows `Not given`; one with Arabic-Indic digits
   links correctly.
5. `sendSample()` from the editor renders the same layout.

Go-live, signed in as Mr. Farhan: `goLive()`, one real submission, and two
checks that matter most: the email lands unread in his Inbox, not only in
Sent, and Reply addresses the parent. In the trigger's settings, failure
notifications set to "immediately".

## Rollout and who does what

The user:

1. Sends the Head the hand-off message drafted on 7 October 2026; it still
   stands. It asks for fifteen minutes signed in to his account.
2. Edits the form to the checklist above, signed in as the form's owner or
   as Mr. Farhan.
3. With the script ready, sits with Mr. Farhan or signs in as him: opens the
   form's script editor, pastes `Code.gs`, runs `setup()`, approves the
   permission, runs `enableTestMode('<the user's address>')`, submits the
   manual tests, then runs `goLive()`.
4. Says when to push.

This work:

1. `Code.gs`, its tests and the README, written test-first.
2. The hub changes, English and Arabic, with the checks passing.
3. The announcement entry, dated the day of the push.

Branching: this work sits on `ask-a-question`, branched from `exams`, in a
worktree, so today's unpushed Tests and exams commits are untouched. When both
are ready, `main` fast-forwards to `ask-a-question` and is pushed once, with the
announcement dated that day. The announcement must not go live before the form
has been edited, since it tells parents the form is open to students, and the
push waits for the script to be live so the two arrive together.

## Out of scope

Tracking columns in the responses sheet, a daily digest, routing by section,
an acknowledgement sent from the Head's address, and a Gmail label or filter
for the notifications. The README suggests the filter in one line, since the
subject's fixed opening words make it a one-minute job for Mr. Farhan.
