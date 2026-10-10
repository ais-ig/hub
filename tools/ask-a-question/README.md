# Ask a Question form: notification script

`Code.gs` is pasted into the Google Form's own script editor. On every
submission it emails the account that installed it, the Head of School,
with every answer laid out, a Reply-To of the person who asked and a
WhatsApp link for their mobile number. The person who asked receives
Google's own copy of their answers; the script never writes to them.

Design: `docs/superpowers/specs/2026-10-10-ask-a-question-form-design.md`.
Tests: `node --test tools/ask-a-question/code.test.mjs`.

## 1. Edit the form

Signed in as the form's owner or as the Head of School, open the form's
edit page. The public link does not change, so the hub and the printed QR
codes keep working.

Settings, Responses tab:

| Setting | Value |
|---|---|
| Collect email addresses | Responder input (not Verified: that is a Google sign-in wall) |
| Send responders a copy of their response | Always |
| Allow response editing | Off |
| Limit to 1 response | Off |
| Requires sign-in / Restrict to users in ais.sch.sa | Off |
| Responses go to the linked sheet | Unchanged |

Title: `British Section (Boys): Ask a Question`

Description, English then Arabic on the next line:

```
For parents and students of the British Section, boys campus. Send any question at any time of the year, and we will come back to you.
لأولياء الأمور وطلاب القسم البريطاني، مجمع البنين. أرسلوا أي سؤال في أي وقت خلال العام، وسنرد عليكم.
```

Questions, in this order. The English title is what the script matches on,
so type it exactly; the Arabic goes in the question's description. An
asterisk means required.

| # | Title | Type | Description and notes |
|---|---|---|---|
| 1 | I am a * | Multiple choice | `أنا`. Choices `Parent / ولي أمر` and `Student / طالب`. New question. |
| 2 | Your Name * | Short answer | `اسمكم`. Rename from Parent Name. |
| 3 | Student Name * | Short answer | `اسم الطالب`. Description: `If you are the student, write your own name. / إن كنتم الطالب فاكتبوا اسمكم.` |
| 4 | Grade * | Dropdown | Unchanged. |
| 5 | Email * | Google's own field | Appears once Responder input is on, and Google always places it at the top of the form. Nothing to type. |
| 6 | Mobile Number | Short answer | `رقم الجوال`. Not required. Description: `Optional. / اختياري.` Rename from Email or Mobile Number. |
| 7 | Topic * | Dropdown | Unchanged, Other last. |
| 8 | Your Question * | Paragraph | `سؤالكم`. Rename from Your Questions. |

Delete the Section question. Old answers stay in the responses sheet.

Then open the public link in a private window: there must be no sign-in
wall, and the Email box must sit at the top.

## 2. Install the script

Signed in as the Head of School, who must be an editor of the form (the form's owner shares it with him as Editor; a viewer cannot open Apps Script):

1. On the form's edit page, open the three-dot menu, then **Apps Script**.
2. Delete whatever is in the editor and paste the whole of `Code.gs`. Save.
3. Open **Project Settings** (the gear), scroll to **Script Properties**,
   add `TEST_TO` with the address that should receive the test emails,
   and save.
4. Back in the editor, choose `setup` in the function list and run it.
   Google asks for permission once: the form, triggers, "see your email
   address" and "send email as you". Approve. If a screen says Google has
   not verified this app, choose Advanced and then the "Go to" link at the
   bottom; that screen is normal for a script you installed yourself. If
   the school's Workspace admin has blocked Apps Script, stop and tell
   Mohamad. The log should include `TEST MODE: every email goes to
   <the test address>` and `Triggers installed: 1`.
5. Still in the editor, open **Triggers** (the clock), edit the one
   trigger, and set failure notifications to **Notify me immediately**.

## 3. Test

1. Run `sendSample`. A `[TEST]` email with an Arabic question and a
   WhatsApp link arrives at the test address. Open it on a phone and tap
   the link: WhatsApp opens. It may say the number is not on WhatsApp,
   because the sample number is invented. Do not send a message.
2. Submit the form from a private window with a real email address and a
   mobile. Two emails follow: Google's copy to the address typed, and the
   `[TEST]` notification to the test address with the table filled in.
3. In the notification press Reply: the address must be the one typed into
   the form, not the sender's own. The gold "Reply to <name>" button under
   the table opens a new message to that address with the question quoted,
   whatever Reply does.
4. Submit once with no mobile: the row reads `Not given`. Submit once with
   the mobile in Arabic digits: the link still opens the chat.

## 4. Go live

1. Run `goLive`. The log says `LIVE: notifications go to <the Head's
   address>`.
2. Submit the form once more and check two things. First, the notification
   must land unread in the Head's **Inbox**, not only in Sent. If it does
   not, open Project Settings, Script Properties, set `TO` to an address
   the Head reads, and tell Mohamad. Second, press Reply: it must address
   the respondent. If it addresses the Head himself, use the gold
   "Reply to <name>" button instead, which always opens a message to the
   respondent, and tell Mohamad so the footer line can be reworded.
   Gmail's inbox list shows "me" as the sender of mail you sent yourself,
   so look for the subject, which always starts `New question:`.
3. A Gmail filter on subject `New question:` with a label keeps the
   questions together. One minute, optional.

## Day to day

- `status` logs the mode, the recipient, the trigger count and the emails
  left in today's quota (1,500 on a Workspace account).
- Every submission is saved in the form and its sheet whether or not the
  email arrives. If one goes missing, check **Executions** in the editor.
- If a question is renamed in the form, the script still finds the old
  titles listed in `FIELDS`; a title it does not know is shown at the end
  of the email under its own name, so nothing is lost. To give a new
  question its own row, add its title to `FIELDS` and a row to
  `buildHtml` and `buildText`, with a test.
- The script is in the hub repository, which is public. Keep it free of
  addresses and IDs; the recipient and the test address live in Script
  Properties, which stay inside the project.
