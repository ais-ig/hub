# Ask a Question Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A form-bound Apps Script that emails the Head of School every submission of the Ask a Question form, with tests, an install guide, and the hub wording and announcement that go with it.

**Architecture:** `tools/ask-a-question/Code.gs` is one file in two halves: pure functions that parse the answers and build the email, and thin shells that touch Google (`FormApp`, `MailApp`, `PropertiesService`, `ScriptApp`, `Session`). Node loads the same file through `vm` and tests the pure half directly and the shells against fakes. The hub changes are three reworded strings, one update notice and two documentation pointers, each with its Arabic in the same commit under the existing i18n tooling.

**Tech Stack:** Google Apps Script (V8 runtime), plain JavaScript written as top-level `function` declarations and `var` so both Apps Script and Node's `vm` expose them; `node:test` and `node:assert/strict` on Node 22; the repo's `tools/i18n.mjs`, `tools/check.mjs` and `tools/render-check.sh`. Zero dependencies.

**Spec:** `docs/superpowers/specs/2026-10-10-ask-a-question-form-design.md`

## Global Constraints

- Work in the worktree `.claude/worktrees/ask-a-question` on branch `ask-a-question`. Never `cd` to the repository root, never touch branch `exams`.
- No em dashes anywhere: content, code comments, commit messages. Middots `·` divide, en dashes `–` make English ranges.
- "Grade", never "Year", for a school grade. Lowercase "year" for a calendar year is fine ("any time in the year").
- Arabic: respectful plural (يمكنكم, أرسلوا), Western digits only, no Arabic-Indic digits, no tatweel, no dash in a range, الصف for a grade, glossary terms: أولياء الأمور (parents), مدير المدرسة (Head of School), القسم البريطاني (British Section), اللقاء التعريفي (Meet & Greet), اطرحوا سؤالاً (Ask a question).
- Colours in the email: deep navy `#0C2E54`, navy `#1D5394`, gold `#EDBA1D`. Arial. All styles inline. No `<style>` block, no web fonts.
- `Code.gs` holds no email address, no form or sheet ID and no secret. The recipient and the test address live in Script Properties `TO` and `TEST_TO`.
- `Code.gs` uses only top-level `function` declarations and `var` for anything a test or another function reads. No `const`, `let`, classes, arrow functions, template literals or `import`, so Apps Script's editor and Node's `vm` context both expose the same names.
- Every change to an English string in `index.html` has its Arabic changed in the same commit, through `node tools/i18n.mjs merge <file>`; `node tools/check.mjs` must pass before each hub commit, and `node tools/i18n.mjs pairs` must be run in any commit that changes Arabic.
- Tests run per file: `node --test tools/ask-a-question/code.test.mjs`. On Node 22 `node --test tools/` fails on the directory argument, so never use it.
- Commit messages in the repository's sentence style ("Add ...", "Keep ..."), no conventional-commit prefixes, no attribution or co-author lines.

## Review Focus

1. A respondent's email typed with capitals or surrounding spaces, `  Suzan@Gmail.com `: Reply-To must still be set, trimmed, so Mr. Farhan's Reply reaches them. Pinned in Task 4.
2. A question answer containing markup or an ampersand, `Why is <b>Maths</b> & Physics...`: it must show as typed, never render or break the table. Pinned in Task 3.
3. A mobile typed as `+966 50 855 1006`, in Arabic-Indic digits, or as the word `no`: the first two link to WhatsApp, the third shows as typed with no link and nothing throws. Pinned in Tasks 1 and 3.
4. A question title edited in the form with a trailing colon or space, `Your Name: `: the answer still lands in the right row, not in the extras. Pinned in Task 2.
5. A submission at 22:30 UTC: the Received line must say the next day in Riyadh, `Sunday 11 October 2026, 01:30`, not Saturday. Pinned in Task 1.

---

### Task 1: Test harness and pure helpers

**Files:**
- Create: `tools/ask-a-question/Code.gs`
- Create: `tools/ask-a-question/code.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `englishHalf(s) -> string`, `escapeHtml(s) -> string`, `isEmail(s) -> boolean`, `waDigits(s) -> string` (digits for `wa.me`, or `''`), `formatRiyadh(date) -> string` (`Saturday 10 October 2026, 14:05`, or `''` for an invalid date). Globals `SENDER_NAME`, `SUBJECT_PREFIX`, `NAVY`, `LINK`, `GOLD`. The test file's `load(globals)` helper, which later tasks reuse.

- [ ] **Step 1: Write the failing tests**

Create `tools/ask-a-question/code.test.mjs`:

```js
/* Tests for tools/ask-a-question/Code.gs. Zero dependencies.
   Run: node --test tools/ask-a-question/code.test.mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'Code.gs'), 'utf8');

/* Loads Code.gs into a fresh context. Its top-level function declarations
   and vars become properties of the context, so a test reads what it needs
   off the returned object. Google's globals are whatever the test passes in;
   the pure functions never touch them. */
export function load(globals = {}) {
  const ctx = vm.createContext({ ...globals });
  vm.runInContext(source, ctx, { filename: 'Code.gs' });
  return ctx;
}

test('englishHalf keeps the text before the slash', () => {
  const { englishHalf } = load();
  assert.equal(englishHalf('Grade 9 / الصف التاسع'), 'Grade 9');
  assert.equal(englishHalf('Other / أخرى'), 'Other');
  assert.equal(englishHalf('  Grade 10  '), 'Grade 10');
  assert.equal(englishHalf(''), '');
  assert.equal(englishHalf(null), '');
});

test('escapeHtml escapes the five characters', () => {
  const { escapeHtml } = load();
  assert.equal(escapeHtml('<b>&"\''), '&lt;b&gt;&amp;&quot;&#39;');
  assert.equal(escapeHtml(undefined), '');
});

test('isEmail accepts a plain address and rejects the rest', () => {
  const { isEmail } = load();
  assert.equal(isEmail('suzan@gmail.com'), true);
  assert.equal(isEmail('  Suzan@Gmail.com '), true);
  assert.equal(isEmail('0508551006'), false);
  assert.equal(isEmail('suzan@'), false);
  assert.equal(isEmail(''), false);
  assert.equal(isEmail(null), false);
});

test('waDigits normalises Saudi and international numbers', () => {
  const { waDigits } = load();
  assert.equal(waDigits('050 855 1006'), '966508551006');
  assert.equal(waDigits('+966 50 855 1006'), '966508551006');
  assert.equal(waDigits('00966508551006'), '966508551006');
  assert.equal(waDigits('508551006'), '966508551006');
  assert.equal(waDigits('٠٥٠٨٥٥١٠٠٦'), '966508551006');
  assert.equal(waDigits('۰۵۰۸۵۵۱۰۰۶'), '966508551006');
  assert.equal(waDigits('+44 7700 900123'), '447700900123');
  assert.equal(waDigits('12345'), '');
  assert.equal(waDigits('no'), '');
  assert.equal(waDigits(''), '');
  assert.equal(waDigits(null), '');
});

test('formatRiyadh writes the day, date and 24-hour time in Riyadh', () => {
  const { formatRiyadh } = load();
  assert.equal(formatRiyadh(new Date('2026-10-10T11:05:00Z')), 'Saturday 10 October 2026, 14:05');
  assert.equal(formatRiyadh(new Date('2026-10-10T22:30:00Z')), 'Sunday 11 October 2026, 01:30');
  assert.equal(formatRiyadh('2026-10-10T03:00:00Z'), 'Saturday 10 October 2026, 06:00');
  assert.equal(formatRiyadh('not a date'), '');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tools/ask-a-question/code.test.mjs`
Expected: FAIL. `Code.gs` does not exist, so `readFileSync` throws `ENOENT` before any test runs.

- [ ] **Step 3: Write the helpers**

Create `tools/ask-a-question/Code.gs`:

```js
/* Ask a Question form: notification script.
   Bound to the British Section's Google Form. On every submission it emails
   the account that installed it (the Head of School) with every answer laid
   out, a Reply-To of the person who asked, and a WhatsApp link for their
   mobile number. The person who asked gets Google's own copy; this script
   never writes to them.

   Install, test and go-live steps: tools/ask-a-question/README.md in the
   hub repository. Design: docs/superpowers/specs/2026-10-10-ask-a-question-form-design.md.

   Layout: pure functions first (no Google globals, tested in Node), then the
   thin shells that touch FormApp, MailApp, PropertiesService, ScriptApp and
   Session. Keep it that way: logic goes in the pure half. */

var SENDER_NAME = 'Ask a Question form';
var SUBJECT_PREFIX = 'New question';
var NAVY = '#0C2E54';
var LINK = '#1D5394';
var GOLD = '#EDBA1D';

/* ---------- Pure helpers ---------- */

/* The English half of a bilingual choice, "Grade 9 / الصف التاسع" -> "Grade 9". */
function englishHalf(s) {
  var t = String(s == null ? '' : s).trim();
  var i = t.indexOf(' / ');
  return (i < 0 ? t : t.slice(0, i)).trim();
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s == null ? '' : s).trim());
}

/* Digits for a wa.me link, or '' when the text is not a usable number.
   Arabic-Indic and Eastern Arabic-Indic digits are converted first. A Saudi
   mobile typed as 05x, 5x, +966 or 00966 becomes 966xxxxxxxxx; any other
   8 to 15 digit run with a country code is kept as typed. */
function waDigits(s) {
  var t = String(s == null ? '' : s).trim()
    .replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 0x0660); })
    .replace(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 0x06F0); });
  var plus = t.charAt(0) === '+';
  var d = t.replace(/\D/g, '');
  if (!plus && d.indexOf('00') === 0) d = d.slice(2);
  if (/^05\d{8}$/.test(d)) return '966' + d.slice(1);
  if (/^5\d{8}$/.test(d)) return '966' + d;
  if (/^966\d{9}$/.test(d)) return d;
  if (/^[1-9]\d{7,14}$/.test(d)) return d;
  return '';
}

/* "Saturday 10 October 2026, 14:05" in Riyadh time, which is UTC+3 all year.
   Done by hand rather than with Utilities or Intl so Node runs it too. */
function formatRiyadh(date) {
  var d = new Date(date);
  if (isNaN(d.getTime())) return '';
  var r = new Date(d.getTime() + 3 * 60 * 60 * 1000);
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'];
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  return days[r.getUTCDay()] + ' ' + r.getUTCDate() + ' ' + months[r.getUTCMonth()] + ' ' +
    r.getUTCFullYear() + ', ' + pad(r.getUTCHours()) + ':' + pad(r.getUTCMinutes());
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tools/ask-a-question/code.test.mjs`
Expected: `# pass 5`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add tools/ask-a-question/Code.gs tools/ask-a-question/code.test.mjs
git commit -m "Start the Ask a Question notification script with its pure helpers and a Node test harness"
```

---

### Task 2: Parse a submission into answers

**Files:**
- Modify: `tools/ask-a-question/Code.gs` (append after `formatRiyadh`)
- Modify: `tools/ask-a-question/code.test.mjs` (append)

**Interfaces:**
- Consumes: `englishHalf`, `formatRiyadh` from Task 1.
- Produces: `parseAnswers(items, email, timestamp) -> answers`, where `items` is `[{ title, answer }]` and `answers` is `{ who, name, student, grade, topic, question, email, mobile, received, extra: [{ title, answer }] }`, every value a trimmed string. `FIELDS` (title to field map) and `normTitle(title)`.

- [ ] **Step 1: Write the failing tests**

Append to `tools/ask-a-question/code.test.mjs`:

```js
const WHEN = new Date('2026-10-10T11:05:00Z');

const FULL = [
  { title: 'I am a', answer: 'Parent / ولي أمر' },
  { title: 'Your Name', answer: 'Suzan' },
  { title: 'Student Name', answer: 'Awedelkareem' },
  { title: 'Grade', answer: 'Grade 9 / الصف التاسع' },
  { title: 'Mobile Number', answer: '050 855 1006' },
  { title: 'Topic', answer: 'Attendance and Timetable / الحضور والجدول الدراسي' },
  { title: 'Your Question', answer: 'They have chemistry class scheduled but no link was sent' },
];

test('parseAnswers maps every form question to its field', () => {
  const { parseAnswers } = load();
  const a = parseAnswers(FULL, 'suzan@gmail.com', WHEN);
  assert.deepEqual(a, {
    who: 'Parent',
    name: 'Suzan',
    student: 'Awedelkareem',
    grade: 'Grade 9 / الصف التاسع',
    topic: 'Attendance and Timetable / الحضور والجدول الدراسي',
    question: 'They have chemistry class scheduled but no link was sent',
    email: 'suzan@gmail.com',
    mobile: '050 855 1006',
    received: 'Saturday 10 October 2026, 14:05',
    extra: [],
  });
});

test('parseAnswers forgives case, spaces and a trailing colon in a title', () => {
  const { parseAnswers } = load();
  const a = parseAnswers([
    { title: 'YOUR NAME: ', answer: ' Suzan ' },
    { title: ' student  name', answer: 'Awedelkareem' },
    { title: 'Your Questions', answer: 'Old title, still a question' },
    { title: 'Parent Name', answer: 'Old name title' },
  ], '', WHEN);
  assert.equal(a.name, 'Old name title');
  assert.equal(a.student, 'Awedelkareem');
  assert.equal(a.question, 'Old title, still a question');
  assert.equal(a.extra.length, 0);
});

test('parseAnswers keeps an unknown question in extra and drops an empty one', () => {
  const { parseAnswers } = load();
  const a = parseAnswers([
    { title: 'Your Name', answer: 'Suzan' },
    { title: 'Class', answer: '9A' },
    { title: 'Anything else?', answer: '' },
  ], 'suzan@gmail.com', WHEN);
  assert.deepEqual(a.extra, [{ title: 'Class', answer: '9A' }]);
});

test('parseAnswers leaves a missing optional mobile empty and trims the email', () => {
  const { parseAnswers } = load();
  const a = parseAnswers(FULL.filter((i) => i.title !== 'Mobile Number'), '  Suzan@Gmail.com ', WHEN);
  assert.equal(a.mobile, '');
  assert.equal(a.email, 'Suzan@Gmail.com');
});

test('parseAnswers takes an Email question only when Google gave no address', () => {
  const { parseAnswers } = load();
  const withItem = [{ title: 'Email', answer: 'typed@example.com' }];
  assert.equal(parseAnswers(withItem, '', WHEN).email, 'typed@example.com');
  assert.equal(parseAnswers(withItem, 'google@example.com', WHEN).email, 'google@example.com');
});

test('parseAnswers survives null answers and no items', () => {
  const { parseAnswers } = load();
  const a = parseAnswers([{ title: 'Your Name', answer: null }], null, 'not a date');
  assert.equal(a.name, '');
  assert.equal(a.email, '');
  assert.equal(a.received, '');
  assert.deepEqual(parseAnswers(undefined, undefined, WHEN).extra, []);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tools/ask-a-question/code.test.mjs`
Expected: the six new tests FAIL with `parseAnswers is not a function`; the five from Task 1 still pass.

- [ ] **Step 3: Write parseAnswers**

Append to `tools/ask-a-question/Code.gs`, after `formatRiyadh`:

```js
/* ---------- Answers ---------- */

/* Form question title, lower-cased and tidied, to the field it fills. The
   old titles are kept so the email still reads right if a rename is missed.
   A title not listed here lands in `extra` and is still shown. */
var FIELDS = {
  'i am a': 'who',
  'your name': 'name',
  'parent name': 'name',
  'student name': 'student',
  'grade': 'grade',
  'mobile number': 'mobile',
  'email or mobile number': 'mobile',
  'topic': 'topic',
  'your question': 'question',
  'your questions': 'question',
  'email': 'email'
};

function normTitle(title) {
  return String(title == null ? '' : title)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[\s:*]+$/, '')
    .trim();
}

/* items: [{ title, answer }] as the form gave them. email: the address Google
   collected, which wins over any Email question. Returns trimmed strings for
   every field, '' where nothing was given. */
function parseAnswers(items, email, timestamp) {
  var a = {
    who: '', name: '', student: '', grade: '', topic: '', question: '',
    email: String(email == null ? '' : email).trim(),
    mobile: '',
    received: formatRiyadh(timestamp),
    extra: []
  };
  (items || []).forEach(function (it) {
    var field = FIELDS[normTitle(it.title)];
    var answer = String(it.answer == null ? '' : it.answer).trim();
    if (!field) {
      if (answer) a.extra.push({ title: String(it.title == null ? '' : it.title).trim(), answer: answer });
      return;
    }
    if (field === 'email') {
      if (!a.email) a.email = answer;
      return;
    }
    a[field] = answer;
  });
  a.who = englishHalf(a.who);
  return a;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tools/ask-a-question/code.test.mjs`
Expected: `# pass 11`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add tools/ask-a-question/Code.gs tools/ask-a-question/code.test.mjs
git commit -m "Parse a form submission into named answers, forgiving title edits and keeping unknown questions"
```

---

### Task 3: Build the subject, the HTML and plain-text bodies, and the fallback

**Files:**
- Modify: `tools/ask-a-question/Code.gs` (append after `parseAnswers`)
- Modify: `tools/ask-a-question/code.test.mjs` (append)

**Interfaces:**
- Consumes: `englishHalf`, `escapeHtml`, `waDigits`, `formatRiyadh`, `SUBJECT_PREFIX`, `NAVY`, `LINK`, `GOLD`, and the `answers` shape from Task 2.
- Produces: `buildSubject(a, testMode) -> string`, `buildHtml(a, sheetUrl) -> string`, `buildText(a, sheetUrl) -> string`, `buildMessage(a, sheetUrl, testMode) -> { subject, html, text }`, `fallbackMessage(items, email, timestamp, testMode, err) -> { subject, html: '', text }`. Helpers `row(label, valueHtml)`, `mobileHtml(mobile)`, `notGiven()`, `breakLines(s)`.

- [ ] **Step 1: Write the failing tests**

Append to `tools/ask-a-question/code.test.mjs`:

```js
const SHEET = 'https://docs.google.com/spreadsheets/d/SHEET123';

function answers(over = {}) {
  const { parseAnswers } = load();
  return { ...parseAnswers(FULL, 'suzan@gmail.com', WHEN), ...over };
}

test('buildSubject joins the fixed prefix, topic, grade and name with middots', () => {
  const { buildSubject } = load();
  assert.equal(buildSubject(answers(), false), 'New question · Attendance and Timetable · Grade 9 · Suzan');
  assert.equal(buildSubject(answers(), true), '[TEST] New question · Attendance and Timetable · Grade 9 · Suzan');
  assert.equal(buildSubject(answers({ topic: '', name: '' }), false), 'New question · Grade 9');
});

test('buildHtml lays out every answer in a right-to-left-safe table', () => {
  const { buildHtml } = load();
  const html = buildHtml(answers(), SHEET);
  assert.match(html, /New question from the Ask a Question form/);
  assert.match(html, /Saturday 10 October 2026, 14:05/);
  assert.match(html, /Suzan · Parent/);
  assert.match(html, /Awedelkareem/);
  assert.match(html, /Grade 9 \/ الصف التاسع/);
  assert.match(html, /href="mailto:suzan@gmail\.com"/);
  assert.match(html, /href="https:\/\/wa\.me\/966508551006"[^>]*>Open in WhatsApp</);
  assert.match(html, /050 855 1006/);
  assert.match(html, /href="https:\/\/docs\.google\.com\/spreadsheets\/d\/SHEET123"/);
  assert.match(html, /Press Reply to answer Suzan; your reply goes to suzan@gmail\.com\./);
  assert.match(html, /Every submission is saved in the form/);
  assert.equal((html.match(/dir="auto"/g) || []).length, 8, 'one dir="auto" per value cell');
  assert.doesNotMatch(html, /<style/);
  assert.match(html, /#0C2E54/);
  assert.match(html, /#EDBA1D/);
});

test('buildHtml escapes markup in an answer and keeps the question\'s line breaks', () => {
  const { buildHtml } = load();
  const html = buildHtml(answers({ question: 'Why is <b>Maths</b> & Physics\nso early?' }), '');
  assert.match(html, /Why is &lt;b&gt;Maths&lt;\/b&gt; &amp; Physics<br>so early\?/);
  assert.doesNotMatch(html, /<b>Maths/);
});

test('buildHtml says Not given for a missing mobile and shows an odd one as typed', () => {
  const { buildHtml } = load();
  const none = buildHtml(answers({ mobile: '' }), '');
  assert.match(none, /Not given/);
  assert.doesNotMatch(none, /wa\.me/);
  const odd = buildHtml(answers({ mobile: 'no' }), '');
  assert.match(odd, />no</);
  assert.doesNotMatch(odd, /wa\.me/);
  const arabic = buildHtml(answers({ mobile: '٠٥٠٨٥٥١٠٠٦' }), '');
  assert.match(arabic, /wa\.me\/966508551006/);
  assert.match(arabic, /٠٥٠٨٥٥١٠٠٦/);
});

test('buildHtml lists an extra question, drops the sheet link without a sheet, and warns without an email', () => {
  const { buildHtml } = load();
  const html = buildHtml(answers({ email: '', extra: [{ title: 'Class', answer: '9A' }] }), '');
  assert.match(html, /Class/);
  assert.match(html, />9A</);
  assert.doesNotMatch(html, /responses sheet/);
  assert.match(html, /No email address was given, so Reply will not reach the sender\./);
});

test('buildText carries every field, the WhatsApp link and the sheet', () => {
  const { buildText } = load();
  const text = buildText(answers({ extra: [{ title: 'Class', answer: '9A' }] }), SHEET);
  for (const line of [
    'Received: Saturday 10 October 2026, 14:05',
    'From: Suzan · Parent',
    'Student: Awedelkareem',
    'Grade: Grade 9 / الصف التاسع',
    'Topic: Attendance and Timetable / الحضور والجدول الدراسي',
    'Question: They have chemistry class scheduled but no link was sent',
    'Email: suzan@gmail.com',
    'Mobile: 050 855 1006 · https://wa.me/966508551006',
    'Class: 9A',
    'Responses sheet: https://docs.google.com/spreadsheets/d/SHEET123',
  ]) assert.ok(text.includes(line), 'missing: ' + line);
});

test('buildMessage bundles subject, html and text', () => {
  const { buildMessage } = load();
  const m = buildMessage(answers(), SHEET, true);
  assert.equal(m.subject, '[TEST] New question · Attendance and Timetable · Grade 9 · Suzan');
  assert.match(m.html, /<table/);
  assert.match(m.text, /^New question from the Ask a Question form/);
});

test('fallbackMessage lists every raw answer with the error', () => {
  const { fallbackMessage } = load();
  const m = fallbackMessage(FULL, 'suzan@gmail.com', WHEN, false, new Error('boom'));
  assert.equal(m.subject, 'New question · see below');
  assert.equal(m.html, '');
  assert.match(m.text, /could not be built \(boom\)/);
  assert.match(m.text, /Received: Saturday 10 October 2026, 14:05/);
  assert.match(m.text, /Email: suzan@gmail\.com/);
  assert.match(m.text, /Your Question: They have chemistry class scheduled but no link was sent/);
  assert.equal(fallbackMessage([], '', WHEN, true, 'plain string').subject, '[TEST] New question · see below');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tools/ask-a-question/code.test.mjs`
Expected: the eight new tests FAIL with `buildSubject is not a function` and the like; the eleven earlier ones pass.

- [ ] **Step 3: Write the message builders**

Append to `tools/ask-a-question/Code.gs`, after `parseAnswers`:

```js
/* ---------- Message ---------- */

function buildSubject(a, testMode) {
  var parts = [SUBJECT_PREFIX, englishHalf(a.topic), englishHalf(a.grade), a.name]
    .filter(function (p) { return p; });
  return (testMode ? '[TEST] ' : '') + parts.join(' · ');
}

function notGiven() {
  return '<span style="color:#888;">Not given</span>';
}

/* One table row. The value cell takes its direction from its own text, so an
   Arabic answer reads right to left and a Latin one left to right. */
function row(label, valueHtml) {
  return '<tr>' +
    '<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#555;font-weight:bold;' +
    'white-space:nowrap;vertical-align:top;width:110px;">' + escapeHtml(label) + '</td>' +
    '<td dir="auto" style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111;vertical-align:top;">' +
    valueHtml + '</td></tr>';
}

function mobileHtml(mobile) {
  if (!mobile) return notGiven();
  var d = waDigits(mobile);
  var text = escapeHtml(mobile);
  if (!d) return text;
  return text + ' &nbsp;·&nbsp; <a href="https://wa.me/' + d + '" style="color:' + LINK + ';">Open in WhatsApp</a>';
}

function breakLines(s) {
  return escapeHtml(s).replace(/\r?\n/g, '<br>');
}

function buildHtml(a, sheetUrl) {
  var from = (a.name ? escapeHtml(a.name) : notGiven()) + (a.who ? ' · ' + escapeHtml(a.who) : '');
  var rows = [
    row('Received', escapeHtml(a.received)),
    row('From', from),
    row('Student', a.student ? escapeHtml(a.student) : notGiven()),
    row('Grade', a.grade ? escapeHtml(a.grade) : notGiven()),
    row('Topic', a.topic ? escapeHtml(a.topic) : notGiven()),
    row('Question', a.question ? breakLines(a.question) : notGiven()),
    row('Email', a.email
      ? '<a href="mailto:' + escapeHtml(a.email) + '" style="color:' + LINK + ';">' + escapeHtml(a.email) + '</a>'
      : notGiven()),
    row('Mobile', mobileHtml(a.mobile))
  ];
  (a.extra || []).forEach(function (x) { rows.push(row(x.title, breakLines(x.answer))); });
  var reply = a.email
    ? 'Press Reply to answer ' + escapeHtml(a.name || 'the sender') + '; your reply goes to ' + escapeHtml(a.email) + '.'
    : 'No email address was given, so Reply will not reach the sender.';
  var sheet = sheetUrl
    ? ' <a href="' + escapeHtml(sheetUrl) + '" style="color:' + LINK + ';">Open the responses sheet</a>.'
    : '';
  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#111;max-width:640px;">' +
    '<div style="background:' + NAVY + ';color:#fff;padding:14px 16px;border-bottom:3px solid ' + GOLD + ';' +
    'font-size:17px;font-weight:bold;">New question from the Ask a Question form</div>' +
    '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;background:#fff;">' +
    rows.join('') + '</table>' +
    '<p style="margin:14px 0 4px;">' + reply + sheet + '</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#777;">Sent automatically by the form\'s script. ' +
    'Every submission is saved in the form whether or not this email arrives.</p>' +
    '</div>';
}

function buildText(a, sheetUrl) {
  var wa = waDigits(a.mobile);
  var lines = [
    'New question from the Ask a Question form',
    '',
    'Received: ' + a.received,
    'From: ' + (a.name || 'Not given') + (a.who ? ' · ' + a.who : ''),
    'Student: ' + (a.student || 'Not given'),
    'Grade: ' + (a.grade || 'Not given'),
    'Topic: ' + (a.topic || 'Not given'),
    'Question: ' + (a.question || 'Not given'),
    'Email: ' + (a.email || 'Not given'),
    'Mobile: ' + (a.mobile ? a.mobile + (wa ? ' · https://wa.me/' + wa : '') : 'Not given')
  ];
  (a.extra || []).forEach(function (x) { lines.push(x.title + ': ' + x.answer); });
  lines.push('');
  lines.push(a.email
    ? 'Press Reply to answer ' + (a.name || 'the sender') + '; your reply goes to ' + a.email + '.'
    : 'No email address was given, so Reply will not reach the sender.');
  if (sheetUrl) lines.push('Responses sheet: ' + sheetUrl);
  lines.push('Sent automatically by the form\'s script. Every submission is saved in the form whether or not this email arrives.');
  return lines.join('\n');
}

function buildMessage(a, sheetUrl, testMode) {
  return { subject: buildSubject(a, testMode), html: buildHtml(a, sheetUrl), text: buildText(a, sheetUrl) };
}

/* Sent when the rich email cannot be built: every raw answer, as plain text,
   so a formatting bug never loses a question. */
function fallbackMessage(items, email, timestamp, testMode, err) {
  var why = err && err.message ? err.message : String(err);
  var lines = [
    'A question arrived but the usual email could not be built (' + why + '). Every answer is listed below.',
    '',
    'Received: ' + formatRiyadh(timestamp),
    'Email: ' + (email || 'Not given')
  ];
  (items || []).forEach(function (it) {
    lines.push(String(it.title == null ? '' : it.title) + ': ' + String(it.answer == null ? '' : it.answer));
  });
  return { subject: (testMode ? '[TEST] ' : '') + SUBJECT_PREFIX + ' · see below', html: '', text: lines.join('\n') };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tools/ask-a-question/code.test.mjs`
Expected: `# pass 19`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add tools/ask-a-question/Code.gs tools/ask-a-question/code.test.mjs
git commit -m "Build the notification email: subject, Gmail-safe HTML table, plain text and a fallback that lists every answer"
```

---

### Task 4: The Google shells, tested against fakes

**Files:**
- Modify: `tools/ask-a-question/Code.gs` (append after `fallbackMessage`)
- Modify: `tools/ask-a-question/code.test.mjs` (append)

**Interfaces:**
- Consumes: everything above; `load(globals)` from the test file.
- Produces: `config() -> { to, test }`, `rawItems(response) -> [{ title, answer }]`, `sheetLink() -> string`, `send(to, msg, replyTo)`, `onFormSubmit(e)`, `setup()`, `goLive()`, `sendSample()`, `status()`. Script Properties `TO` and `TEST_TO`.

- [ ] **Step 1: Write the failing tests**

Append to `tools/ask-a-question/code.test.mjs`:

```js
/* Minimal stand-ins for the Google services the shells touch. `sent`
   collects every MailApp.sendEmail call; `props` is the Script Properties
   store; `triggers` collects trigger creations. */
function fakeGoogle({ props = {}, destinationId = 'SHEET123', user = 'head@example.com', quota = 1500 } = {}) {
  const sent = [];
  const triggers = [];
  const logs = [];
  const globals = {
    PropertiesService: { getScriptProperties: () => ({
      getProperty: (k) => (k in props ? props[k] : null),
      setProperty: (k, v) => { props[k] = v; },
      deleteProperty: (k) => { delete props[k]; },
    }) },
    Session: { getEffectiveUser: () => ({ getEmail: () => user }) },
    MailApp: { sendEmail: (opts) => { sent.push(opts); }, getRemainingDailyQuota: () => quota },
    FormApp: { getActiveForm: () => ({
      getDestinationId: () => { if (!destinationId) throw new Error('no destination'); return destinationId; },
    }) },
    ScriptApp: {
      getProjectTriggers: () => triggers.slice(),
      deleteTrigger: (t) => { triggers.splice(triggers.indexOf(t), 1); },
      newTrigger: (fn) => ({ forForm: () => ({ onFormSubmit: () => ({ create: () => { triggers.push({ fn }); } }) }) }),
    },
    Logger: { log: (s) => { logs.push(String(s)); } },
  };
  return { globals, sent, props, triggers, logs };
}

function fakeEvent(items, email, when) {
  return { response: {
    getItemResponses: () => items.map(([title, answer]) => ({
      getItem: () => ({ getTitle: () => title }),
      getResponse: () => answer,
    })),
    getRespondentEmail: () => email,
    getTimestamp: () => when,
  } };
}

const RAW = FULL.map((i) => [i.title, i.answer]);

test('config sends to TO when live and to TEST_TO in test mode', () => {
  const live = fakeGoogle({ props: { TO: 'head@example.com' } });
  assert.deepEqual(load(live.globals).config(), { to: 'head@example.com', test: false });
  const testing = fakeGoogle({ props: { TO: 'head@example.com', TEST_TO: ' me@example.com ' } });
  assert.deepEqual(load(testing.globals).config(), { to: 'me@example.com', test: true });
  const unset = fakeGoogle({ user: 'who@example.com' });
  assert.deepEqual(load(unset.globals).config(), { to: 'who@example.com', test: false });
});

test('rawItems reads titles and answers and joins a list answer', () => {
  const { rawItems } = load(fakeGoogle().globals);
  const e = fakeEvent([['Your Name', 'Suzan'], ['Days', ['Sunday', 'Monday']], ['Blank', null]], '', WHEN);
  assert.deepEqual(rawItems(e.response), [
    { title: 'Your Name', answer: 'Suzan' },
    { title: 'Days', answer: 'Sunday, Monday' },
    { title: 'Blank', answer: '' },
  ]);
});

test('sheetLink builds the sheet URL and is empty without a destination', () => {
  assert.equal(load(fakeGoogle().globals).sheetLink(), 'https://docs.google.com/spreadsheets/d/SHEET123');
  assert.equal(load(fakeGoogle({ destinationId: '' }).globals).sheetLink(), '');
});

test('onFormSubmit emails the Head with Reply-To set to the trimmed respondent', () => {
  const g = fakeGoogle({ props: { TO: 'head@example.com' } });
  load(g.globals).onFormSubmit(fakeEvent(RAW, '  Suzan@Gmail.com ', WHEN));
  assert.equal(g.sent.length, 1);
  const m = g.sent[0];
  assert.equal(m.to, 'head@example.com');
  assert.equal(m.replyTo, 'Suzan@Gmail.com');
  assert.equal(m.name, 'Ask a Question form');
  assert.equal(m.subject, 'New question · Attendance and Timetable · Grade 9 · Suzan');
  assert.match(m.htmlBody, /wa\.me\/966508551006/);
  assert.match(m.htmlBody, /spreadsheets\/d\/SHEET123/);
  assert.match(m.body, /Student: Awedelkareem/);
});

test('onFormSubmit goes to TEST_TO with a [TEST] subject in test mode', () => {
  const g = fakeGoogle({ props: { TO: 'head@example.com', TEST_TO: 'me@example.com' } });
  load(g.globals).onFormSubmit(fakeEvent(RAW, 'suzan@gmail.com', WHEN));
  assert.equal(g.sent[0].to, 'me@example.com');
  assert.match(g.sent[0].subject, /^\[TEST\] New question/);
});

test('onFormSubmit sets no Reply-To when the address is missing or not an address', () => {
  const g = fakeGoogle({ props: { TO: 'head@example.com' } });
  const ctx = load(g.globals);
  ctx.onFormSubmit(fakeEvent(RAW, '', WHEN));
  ctx.onFormSubmit(fakeEvent(RAW, 'not an email', WHEN));
  assert.equal(g.sent.length, 2);
  assert.equal('replyTo' in g.sent[0], false);
  assert.equal('replyTo' in g.sent[1], false);
});

test('onFormSubmit falls back to a plain email when the rich one cannot be built', () => {
  const g = fakeGoogle({ props: { TO: 'head@example.com' } });
  const ctx = load(g.globals);
  ctx.buildHtml = () => { throw new Error('boom'); };
  ctx.onFormSubmit(fakeEvent(RAW, 'suzan@gmail.com', WHEN));
  assert.equal(g.sent.length, 1);
  assert.equal(g.sent[0].subject, 'New question · see below');
  assert.equal('htmlBody' in g.sent[0], false);
  assert.match(g.sent[0].body, /could not be built \(boom\)/);
  assert.match(g.sent[0].body, /Your Question: They have chemistry class/);
  assert.equal(g.sent[0].replyTo, 'suzan@gmail.com');
});

test('onFormSubmit rethrows when even the fallback cannot be sent', () => {
  const g = fakeGoogle({ props: { TO: 'head@example.com' } });
  g.globals.MailApp.sendEmail = () => { throw new Error('quota'); };
  assert.throws(() => load(g.globals).onFormSubmit(fakeEvent(RAW, 'suzan@gmail.com', WHEN)), /quota/);
});

test('setup installs one trigger, replaces any old ones and records the installer as TO', () => {
  const g = fakeGoogle({ user: 'head@example.com' });
  g.triggers.push({ fn: 'stale' });
  load(g.globals).setup();
  assert.deepEqual(g.triggers, [{ fn: 'onFormSubmit' }]);
  assert.equal(g.props.TO, 'head@example.com');
  assert.ok(g.logs.some((l) => l.includes('head@example.com')));
});

test('goLive removes TEST_TO and status reports the mode', () => {
  const g = fakeGoogle({ props: { TO: 'head@example.com', TEST_TO: 'me@example.com' } });
  const ctx = load(g.globals);
  ctx.status();
  assert.ok(g.logs.some((l) => l.startsWith('TEST MODE')));
  ctx.goLive();
  assert.equal('TEST_TO' in g.props, false);
  assert.ok(g.logs.some((l) => l.startsWith('LIVE')));
  assert.ok(g.logs.some((l) => l.includes('Emails left today: 1500')));
});

test('sendSample sends a marked sample with an Arabic question and a linked mobile', () => {
  const g = fakeGoogle({ props: { TO: 'head@example.com' } });
  load(g.globals).sendSample();
  assert.equal(g.sent.length, 1);
  assert.equal(g.sent[0].to, 'head@example.com');
  assert.match(g.sent[0].subject, /^\[TEST\] New question · Attendance and Timetable · Grade 9 · Sample Parent$/);
  assert.match(g.sent[0].htmlBody, /wa\.me\/9665/);
  assert.match(g.sent[0].htmlBody, /[؀-ۿ]/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tools/ask-a-question/code.test.mjs`
Expected: the eleven new tests FAIL (`config is not a function`, `onFormSubmit is not a function`, and so on); the nineteen earlier ones pass.

- [ ] **Step 3: Write the shells**

Append to `tools/ask-a-question/Code.gs`, after `fallbackMessage`:

```js
/* ---------- Google shells ---------- */
/* Everything below touches a Google service. Keep each one short; logic
   belongs in the pure half above, where Node can test it. */

/* Script Properties: TO is the address that gets the notifications, written
   by setup() as the installing account. TEST_TO, when present, diverts every
   email there and marks the subject [TEST]. Set TEST_TO in the editor under
   Project Settings, Script Properties; goLive() removes it. */
function config() {
  var p = PropertiesService.getScriptProperties();
  var testTo = String(p.getProperty('TEST_TO') || '').trim();
  var to = testTo || String(p.getProperty('TO') || '').trim() || Session.getEffectiveUser().getEmail();
  return { to: to, test: !!testTo };
}

function rawItems(response) {
  return response.getItemResponses().map(function (ir) {
    var r = ir.getResponse();
    return {
      title: ir.getItem().getTitle(),
      answer: r == null ? '' : (Array.isArray(r) ? r.join(', ') : String(r))
    };
  });
}

/* The linked responses sheet, or '' when the form has none. Built from the
   ID rather than opened, so no Sheets permission is asked for. */
function sheetLink() {
  try {
    var id = FormApp.getActiveForm().getDestinationId();
    return id ? 'https://docs.google.com/spreadsheets/d/' + id : '';
  } catch (err) {
    return '';
  }
}

function send(to, msg, replyTo) {
  var opts = { to: to, subject: msg.subject, body: msg.text, name: SENDER_NAME };
  if (msg.html) opts.htmlBody = msg.html;
  if (isEmail(replyTo)) opts.replyTo = String(replyTo).trim();
  MailApp.sendEmail(opts);
}

/* The installable on-form-submit trigger calls this with e.response, the
   FormResponse just saved. The rich email is tried first; if building or
   sending it throws, a plain fallback with every raw answer goes instead.
   If that throws too, the error is rethrown so Google's failure
   notification reaches the trigger's owner. */
function onFormSubmit(e) {
  var cfg = config();
  var response = e.response;
  var items = rawItems(response);
  var email = response.getRespondentEmail() || '';
  var when = response.getTimestamp();
  try {
    send(cfg.to, buildMessage(parseAnswers(items, email, when), sheetLink(), cfg.test), email);
  } catch (err) {
    send(cfg.to, fallbackMessage(items, email, when, cfg.test, err), email);
  }
}

/* Run once from the editor, signed in as the account that should receive
   the notifications. Replaces any trigger this project already has. */
function setup() {
  var form = FormApp.getActiveForm();
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();
  var me = Session.getEffectiveUser().getEmail();
  PropertiesService.getScriptProperties().setProperty('TO', me);
  Logger.log('Trigger installed. Notifications go to ' + me + '.');
  status();
}

function goLive() {
  PropertiesService.getScriptProperties().deleteProperty('TEST_TO');
  status();
}

/* Sends one made-up submission so the layout can be checked in a real
   inbox before any parent uses the form. Always marked [TEST]. */
function sendSample() {
  var cfg = config();
  var sample = parseAnswers([
    { title: 'I am a', answer: 'Parent / ولي أمر' },
    { title: 'Your Name', answer: 'Sample Parent' },
    { title: 'Student Name', answer: 'Sample Student' },
    { title: 'Grade', answer: 'Grade 9 / الصف التاسع' },
    { title: 'Mobile Number', answer: '٠٥٠ ١٢٣ ٤٥٦٧' },
    { title: 'Topic', answer: 'Attendance and Timetable / الحضور والجدول الدراسي' },
    { title: 'Your Question', answer: 'هل يمكن تأكيد موعد الحصة الأولى يوم الأحد؟\nShukran.' }
  ], 'sample.parent@example.com', new Date());
  send(cfg.to, buildMessage(sample, sheetLink(), true), sample.email);
  Logger.log('Sample sent to ' + cfg.to + '.');
}

function status() {
  var cfg = config();
  Logger.log((cfg.test ? 'TEST MODE: every email goes to ' : 'LIVE: notifications go to ') + cfg.to + '.');
  Logger.log('Triggers installed: ' + ScriptApp.getProjectTriggers().length +
    '. Emails left today: ' + MailApp.getRemainingDailyQuota() + '.');
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tools/ask-a-question/code.test.mjs`
Expected: `# pass 30`, `# fail 0`.

- [ ] **Step 5: Check the file holds no address and no ID, and no banned syntax**

Run:

```bash
grep -n -E '@[a-z0-9-]+\.[a-z]{2,}' tools/ask-a-question/Code.gs | grep -v 'example.com'
grep -n -E '\b(const|let|class|=>|import)\b|`' tools/ask-a-question/Code.gs
grep -n '—' tools/ask-a-question/Code.gs tools/ask-a-question/code.test.mjs
```

Expected: all three print nothing. (`example.com` appears only in the sample sender, which is not a real address.)

- [ ] **Step 6: Commit**

```bash
git add tools/ask-a-question/Code.gs tools/ask-a-question/code.test.mjs
git commit -m "Add the Google shells: on-submit trigger, setup, test mode through Script Properties, sample and status"
```

---

### Task 5: Install guide and form checklist

**Files:**
- Create: `tools/ask-a-question/README.md`

**Interfaces:**
- Consumes: the function names from Task 4 (`setup`, `sendSample`, `status`, `goLive`) and the properties `TO` and `TEST_TO`.
- Produces: the document the user follows on the Google side.

- [ ] **Step 1: Write the README**

Create `tools/ask-a-question/README.md`:

````markdown
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
| 5 | Email * | Google's own field | Appears once Responder input is on. Nothing to type. |
| 6 | Mobile Number | Short answer | `رقم الجوال`. Not required. Description: `Optional. / اختياري.` Rename from Email or Mobile Number. |
| 7 | Topic * | Dropdown | Unchanged, Other last. |
| 8 | Your Question * | Paragraph | `سؤالكم`. Rename from Your Questions. |

Delete the Section question. Old answers stay in the responses sheet.

Then open the public link in a private window: there must be no sign-in
wall, and the Email box must sit at the top.

## 2. Install the script

Signed in as the Head of School:

1. On the form's edit page, open the three-dot menu, then **Apps Script**.
2. Delete whatever is in the editor and paste the whole of `Code.gs`. Save.
3. Open **Project Settings** (the gear), scroll to **Script Properties**,
   add `TEST_TO` with the address that should receive the test emails,
   and save.
4. Back in the editor, choose `setup` in the function list and run it.
   Google asks for permission once: the form, triggers, and "send email as
   you". Approve. The log should end with `TEST MODE: every email goes to
   <the test address>` and `Triggers installed: 1`.
5. Still in the editor, open **Triggers** (the clock), edit the one
   trigger, and set failure notifications to **Notify me immediately**.

## 3. Test

1. Run `sendSample`. A `[TEST]` email with an Arabic question and a
   WhatsApp link arrives at the test address. Open it on a phone and tap
   the link: WhatsApp opens on that number.
2. Submit the form from a private window with a real email address and a
   mobile. Two emails follow: Google's copy to the address typed, and the
   `[TEST]` notification to the test address with the table filled in.
3. In the notification press Reply: the address must be the one typed into
   the form, not the sender's own.
4. Submit once with no mobile: the row reads `Not given`. Submit once with
   the mobile in Arabic digits: the link still opens the chat.

## 4. Go live

1. Run `goLive`. The log says `LIVE: notifications go to <the Head's
   address>`.
2. Submit the form once more. The notification must land unread in the
   Head's **Inbox**, not only in Sent, and Reply must address the
   respondent. If Gmail ever puts it in Sent only or Reply addresses the
   Head himself, forward the email to the respondent instead, and say so
   here.
3. A Gmail filter on subject `New question ·` with a label keeps the
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
````

- [ ] **Step 2: Check the README for em dashes and the banned word**

Run: `grep -n -E '—|\bYear\b' tools/ask-a-question/README.md`
Expected: prints nothing.

- [ ] **Step 3: Commit**

```bash
git add tools/ask-a-question/README.md
git commit -m "Write the install, test and go-live guide for the Ask a Question script, with the form checklist"
```

---

### Task 6: Hub wording for parents and students, English and Arabic

**Files:**
- Modify: `index.html` (the `ask.lead`, `ask.note` and `start.ask.d` elements and, through the tool, the `i18nAr` block)
- Regenerate: `docs/arabic/translation-review.html`, `docs/arabic/translation-review.md`

**Interfaces:**
- Consumes: `node tools/i18n.mjs merge <file>`, `node tools/check.mjs`, `node tools/i18n.mjs pairs`.
- Produces: the three strings below, in both languages, with fresh hashes.

- [ ] **Step 1: Confirm the three English strings as they stand**

Run:

```bash
grep -n 'data-i18n="ask.lead"\|data-i18n="ask.note"\|data-i18n="start.ask.d"' index.html
```

Expected, three lines:

```
<p data-i18n="start.ask.d">Send us a question about anything on this page, any time through the year.</p>
<p class="lead" data-i18n="ask.lead">Send it through the form and we will come back to you by email.</p>
<p class="note" data-i18n="ask.note">The form opens in a new tab and takes under a minute. Please include your child’s grade and class. Prefer email? <a href="mailto:f.hussein@ais.sch.sa?subject=Question%20%C2%B7%20AIS%20Parent%20Hub" style="color:#fff;text-decoration:underline">Write to the Head of School</a>.</p>
```

- [ ] **Step 2: Change the English**

Run from the worktree root:

```bash
python3 -I - <<'EOF'
p = 'index.html'
s = open(p, encoding='utf8').read()
reps = [
  ('<p data-i18n="start.ask.d">Send us a question about anything on this page, any time through the year.</p>',
   '<p data-i18n="start.ask.d">Parents and students can send us a question about anything, any time through the year.</p>'),
  ('<p class="lead" data-i18n="ask.lead">Send it through the form and we will come back to you by email.</p>',
   '<p class="lead" data-i18n="ask.lead">Send it through the form at any time in the year and we will come back to you by email.</p>'),
  ('<p class="note" data-i18n="ask.note">The form opens in a new tab and takes under a minute. Please include your child’s grade and class. Prefer email? <a href=',
   '<p class="note" data-i18n="ask.note">The form is for parents and students, opens in a new tab and takes under a minute. Prefer email? <a href='),
]
for a, b in reps:
    assert s.count(a) == 1, a[:50]
    s = s.replace(a, b)
open(p, 'w', encoding='utf8').write(s)
print('ok')
EOF
```

Expected: `ok`.

- [ ] **Step 3: Run the check to see the three stale hashes**

Run: `node tools/check.mjs`
Expected: FAIL naming `start.ask.d`, `ask.lead` and `ask.note` as English that changed after its Arabic was written.

- [ ] **Step 4: Write the Arabic and merge it**

```bash
cat > "${TMPDIR:-/tmp}/ask-ar.json" <<'EOF'
{
  "start.ask.d": "يمكن لأولياء الأمور والطلاب إرسال سؤال إلينا عن أي شيء، في أي وقت خلال العام.",
  "ask.lead": "أرسلوه عبر النموذج في أي وقت خلال العام وسنرد عليكم بالبريد الإلكتروني.",
  "ask.note": "النموذج مخصص لأولياء الأمور والطلاب، ويُفتح في تبويب جديد ويستغرق أقل من دقيقة. وإن كنتم تفضّلون البريد الإلكتروني <a href=\"mailto:f.hussein@ais.sch.sa?subject=Question%20%C2%B7%20AIS%20Parent%20Hub\" style=\"color:#fff;text-decoration:underline\">فراسلوا مدير المدرسة</a>."
}
EOF
node tools/i18n.mjs merge "${TMPDIR:-/tmp}/ask-ar.json"
```

Expected: the tool reports the three keys written.

- [ ] **Step 5: Run the check and regenerate the review pages**

Run:

```bash
node tools/check.mjs
node tools/i18n.mjs pairs
git status --short
```

Expected: `all checks passed`; the status lists `index.html` and the two `docs/arabic/translation-review.*` files.

- [ ] **Step 6: Commit**

```bash
git add index.html docs/arabic/translation-review.html docs/arabic/translation-review.md
git commit -m "Say the question form is for students too, in English and Arabic"
```

---

### Task 7: Documentation pointers in README and CLAUDE.md

**Files:**
- Modify: `README.md` (the "Ask a question" paragraph, currently line 61)
- Modify: `CLAUDE.md` (the sentence `"Ask a question" is the school's Google Form, linked from three places on the page; README lists them.`, currently line 153)

- [ ] **Step 1: Replace the README paragraph**

Run:

```bash
python3 -I - <<'EOF'
p = 'README.md'
s = open(p, encoding='utf8').read()
old = ('**Ask a question** is a Google Form owned by the school, `https://docs.google.com/forms/d/e/1FAIpQLSe5bU8ruZOil2hbbXmYcrQNrXJu1IDsOPLj1kQ1FtgIGw69Ow/viewform`. '
       'It is linked from three places: the hero button, the Start here card, and the Ask a question block near the foot of the page. Change all three together.')
new = ('**Ask a question** is a Google Form owned by the school, `https://docs.google.com/forms/d/e/1FAIpQLSe5bU8ruZOil2hbbXmYcrQNrXJu1IDsOPLj1kQ1FtgIGw69Ow/viewform`, '
       'titled "British Section (Boys): Ask a Question" since October 2026 and open all year to parents and students. '
       'It is linked from three places: the hero button, the Start here card, and the Ask a question block near the foot of the page. Change all three together. '
       'Google collects the respondent\'s email ("Responder input", never "Verified", which is a sign-in wall) and sends them a copy of their answers. '
       'A script bound to the form, `tools/ask-a-question/Code.gs`, emails the Head of School every submission; its install, test and go-live steps and the form checklist are in `tools/ask-a-question/README.md`.')
assert s.count(old) == 1
open(p, 'w', encoding='utf8').write(s.replace(old, new))
print('ok')
EOF
```

Expected: `ok`.

- [ ] **Step 2: Extend the CLAUDE.md sentence**

Run:

```bash
python3 -I - <<'EOF'
p = 'CLAUDE.md'
s = open(p, encoding='utf8').read()
old = '"Ask a question" is the school\'s Google Form, linked from three places on the page; README lists them.'
new = ('"Ask a question" is the school\'s Google Form, linked from three places on the page; README lists them. '
       'Since October 2026 it is open all year to parents and students, Google emails them a copy of their answers, '
       'and a script bound to the form, `tools/ask-a-question/Code.gs`, emails the Head of School every submission. '
       'The script holds no addresses: the recipient and the test address are Script Properties. '
       'Its guide and the form checklist are `tools/ask-a-question/README.md`; the hub wording never mentions where a question goes or the copy.')
assert s.count(old) == 1
open(p, 'w', encoding='utf8').write(s.replace(old, new))
print('ok')
EOF
```

Expected: `ok`.

- [ ] **Step 3: Check for em dashes in the two edits, then commit**

Run: `git diff -U0 README.md CLAUDE.md | grep -n '—'`
Expected: prints nothing.

```bash
git add README.md CLAUDE.md
git commit -m "Point README and CLAUDE.md at the Ask a Question script and the form's settings"
```

---

### Task 8: The announcement, dated the day it goes live

**Files:**
- Modify: `index.html` (the `updatesData` JSON block, which starts with `<script type="application/json" id="updatesData">`, and through the tool its Arabic fields)
- Regenerate: `docs/arabic/translation-review.html`, `docs/arabic/translation-review.md`

**Interfaces:**
- Consumes: `node tools/i18n.mjs merge <file>` with `updates.<id>.<field>` keys, `node tools/check.mjs`, `bash tools/render-check.sh`.
- Produces: one new `updatesData` entry, `id` `<date>-ask-form`, with `titleAr`, `textAr`, `labelAr` and `hAr`.

The entry is dated the day it is added. If the push happens on a later day, change its `id` and `date` to that day before pushing. It is not live until then, so renaming the `id` is allowed; `hAr` covers only the title, text and label, so re-dating needs no new stamp.

- [ ] **Step 1: Insert the entry at the top of the array**

Run from the worktree root:

```bash
D=$(TZ=Asia/Riyadh date +%F)
python3 -I - "$D" <<'EOF'
import sys
d = sys.argv[1]
p = 'index.html'
s = open(p, encoding='utf8').read()
head = '<script type="application/json" id="updatesData">\n[\n'
assert s.count(head) == 1
entry = (
  '  {\n'
  '    "id": "' + d + '-ask-form",\n'
  '    "date": "' + d + '",\n'
  '    "title": "Ask a question any time, parents and students",\n'
  '    "text": "The question form from the Meet & Greet now stays open all year, for parents and for students. Send any question at any time and we will come back to you.",\n'
  '    "href": "https://docs.google.com/forms/d/e/1FAIpQLSe5bU8ruZOil2hbbXmYcrQNrXJu1IDsOPLj1kQ1FtgIGw69Ow/viewform",\n'
  '    "label": "Open the form"\n'
  '  },\n'
)
open(p, 'w', encoding='utf8').write(s.replace(head, head + entry))
print('inserted', d + '-ask-form')
EOF
```

Expected: `inserted <date>-ask-form`.

- [ ] **Step 2: Run the check to see the entry fail for want of Arabic**

Run: `node tools/check.mjs`
Expected: FAIL naming `updates.<date>-ask-form` as lacking `titleAr`, `textAr` or `labelAr`.

- [ ] **Step 3: Write the Arabic and merge it**

```bash
D=$(TZ=Asia/Riyadh date +%F)
cat > "${TMPDIR:-/tmp}/ask-notice-ar.json" <<EOF
{
  "updates.${D}-ask-form.title": "اطرحوا أسئلتكم في أي وقت، أولياء الأمور والطلاب",
  "updates.${D}-ask-form.text": "نموذج الأسئلة الذي استُخدم في اللقاء التعريفي يبقى مفتوحاً طوال العام لأولياء الأمور والطلاب. أرسلوا أي سؤال في أي وقت وسنرد عليكم.",
  "updates.${D}-ask-form.label": "فتح النموذج"
}
EOF
node tools/i18n.mjs merge "${TMPDIR:-/tmp}/ask-notice-ar.json"
```

Expected: the tool reports the notice's three fields written and `hAr` stamped. Confirm with:

```bash
grep -n -A 9 '"id": "'"$(TZ=Asia/Riyadh date +%F)"'-ask-form"' index.html
```

Expected: the entry now carries `titleAr`, `textAr`, `labelAr` and `hAr`, each Arabic field straight after its English one.

- [ ] **Step 4: Run every check**

Run:

```bash
node tools/check.mjs
node tools/i18n.mjs pairs
node --test tools/i18n.test.mjs
node --test tools/ask-a-question/code.test.mjs
bash tools/render-check.sh
```

Expected: `all checks passed`; both test files `# fail 0`; the render check ends with the 380px checks passing in English and Arabic and names the screenshot folder.

- [ ] **Step 5: Look at the Arabic screenshot**

Open `w380-ar.png` and `w380-ar-bell.png` from the folder the render check names (`${TMPDIR:-/tmp}/hub-check`). The bell list shows the new notice first, its Arabic title whole, and `#ask` near the foot shows the new note on one or two lines with no text past the left edge. If a line overflows, shorten the Arabic in the JSON file, run `merge` again and repeat Step 4.

- [ ] **Step 6: Commit**

```bash
git add index.html docs/arabic/translation-review.html docs/arabic/translation-review.md
git commit -m "Announce that the question form stays open all year for parents and students"
```

---

### After the tasks

The branch is complete when every task above is committed and `git log exams..ask-a-question` shows the spec, the plan and the eight task commits. The push waits for the user: the form edited and the script live first, then `id` and `date` of the notice moved to the push day if it is no longer the day it was written, then from the main checkout `git merge --ff-only ask-a-question` on `main` and `git push`. The push itself is the user's call and is not part of this plan.
