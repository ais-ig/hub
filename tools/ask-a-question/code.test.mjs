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

/* Values built inside the vm context carry that context's prototypes, so
   assert/strict's deepEqual rejects them. plain() copies a value into this
   realm for comparison. */
export function plain(v) {
  return structuredClone(v);
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

test('westernDigits converts Arabic-Indic digits and leaves the rest', () => {
  const { westernDigits } = load();
  assert.equal(westernDigits('٠٥٠ ١٢٣ ٤٥٦٧'), '050 123 4567');
  assert.equal(westernDigits('۰۵۰'), '050');
  assert.equal(westernDigits('050 123 4567'), '050 123 4567');
  assert.equal(westernDigits(null), '');
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
  assert.deepEqual(plain(a), {
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
  assert.deepEqual(plain(a.extra), [{ title: 'Class', answer: '9A' }]);
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
  assert.deepEqual(plain(parseAnswers(undefined, undefined, WHEN).extra), []);
});

const SHEET = 'https://docs.google.com/spreadsheets/d/SHEET123';

function answers(over = {}) {
  const { parseAnswers } = load();
  return { ...parseAnswers(FULL, 'suzan@gmail.com', WHEN), ...over };
}

test('buildSubject joins the fixed prefix, topic, grade and name with a colon and commas', () => {
  const { buildSubject } = load();
  assert.equal(buildSubject(answers(), false), 'New question: Attendance and Timetable, Grade 9, Suzan');
  assert.equal(buildSubject(answers(), true), '[TEST] New question: Attendance and Timetable, Grade 9, Suzan');
  assert.equal(buildSubject(answers({ topic: '', name: '' }), false), 'New question: Grade 9');
  assert.equal(buildSubject(answers({ topic: '', grade: '', name: '' }), false), 'New question');
});

test('buildHtml lays out every answer in a right-to-left-safe table', () => {
  const { buildHtml } = load();
  const html = buildHtml(answers(), SHEET);
  assert.match(html, /New question from the Ask a Question form/);
  assert.match(html, /Saturday 10 October 2026, 14:05/);
  assert.match(html, /Suzan \(Parent\)/);
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
  const arabic = buildHtml(answers({ mobile: '٠٥٠ ٨٥٥ ١٠٠٦' }), '');
  assert.match(arabic, /wa\.me\/966508551006/);
  assert.match(arabic, />050 855 1006 /, 'shown in Western digits so the groups keep their order');
  assert.doesNotMatch(arabic, /[\u0660-\u0669]/);
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
  assert.ok(buildText(answers({ mobile: '٠٥٠ ٨٥٥ ١٠٠٦' }), '').includes('Mobile: 050 855 1006 (WhatsApp: https://wa.me/966508551006)'));
  const text = buildText(answers({ extra: [{ title: 'Class', answer: '9A' }] }), SHEET);
  for (const line of [
    'Received: Saturday 10 October 2026, 14:05',
    'From: Suzan (Parent)',
    'Student: Awedelkareem',
    'Grade: Grade 9 / الصف التاسع',
    'Topic: Attendance and Timetable / الحضور والجدول الدراسي',
    'Question: They have chemistry class scheduled but no link was sent',
    'Email: suzan@gmail.com',
    'Mobile: 050 855 1006 (WhatsApp: https://wa.me/966508551006)',
    'Class: 9A',
    'Responses sheet: https://docs.google.com/spreadsheets/d/SHEET123',
  ]) assert.ok(text.includes(line), 'missing: ' + line);
});

test('buildMessage bundles subject, html and text', () => {
  const { buildMessage } = load();
  const m = buildMessage(answers(), SHEET, true);
  assert.equal(m.subject, '[TEST] New question: Attendance and Timetable, Grade 9, Suzan');
  assert.match(m.html, /<table/);
  assert.match(m.text, /^New question from the Ask a Question form/);
});

test('fallbackMessage lists every raw answer with the error', () => {
  const { fallbackMessage } = load();
  const m = fallbackMessage(FULL, 'suzan@gmail.com', WHEN, false, new Error('boom'));
  assert.equal(m.subject, 'New question: see below');
  assert.equal(m.html, '');
  assert.match(m.text, /could not be built \(boom\)/);
  assert.match(m.text, /Received: Saturday 10 October 2026, 14:05/);
  assert.match(m.text, /Email: suzan@gmail\.com/);
  assert.match(m.text, /Your Question: They have chemistry class scheduled but no link was sent/);
  assert.equal(fallbackMessage([], '', WHEN, true, 'plain string').subject, '[TEST] New question: see below');
});
