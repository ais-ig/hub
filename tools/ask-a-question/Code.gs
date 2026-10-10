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

/* Arabic-Indic (U+0660 to U+0669) and Eastern Arabic-Indic (U+06F0 to U+06F9)
   digits to Western ones. Used before a number is linked and before it is
   shown: a run of Arabic-Indic digit groups reverses its order in a
   left-to-right line, so the email never shows them. */
function westernDigits(s) {
  return String(s == null ? '' : s)
    .replace(/[\u0660-\u0669]/g, function (c) { return String(c.charCodeAt(0) - 0x0660); })
    .replace(/[\u06F0-\u06F9]/g, function (c) { return String(c.charCodeAt(0) - 0x06F0); });
}

/* Digits for a wa.me link, or '' when the text is not a usable number. A
   Saudi mobile typed as 05x, 5x, +966 or 00966 becomes 966xxxxxxxxx; any
   other 8 to 15 digit run with a country code is kept as typed. */
function waDigits(s) {
  var t = westernDigits(s).trim();
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

/* ---------- Answers ---------- */

/* Form question title, lower-cased and tidied, to the field it fills. The
   old titles are kept so the email still reads right if a rename is missed.
   A title not listed here lands in extra and is still shown. */
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

/* ---------- Message ---------- */

function buildSubject(a, testMode) {
  var parts = [englishHalf(a.topic), englishHalf(a.grade), a.name]
    .filter(function (p) { return p; });
  return (testMode ? '[TEST] ' : '') + SUBJECT_PREFIX + (parts.length ? ': ' + parts.join(', ') : '');
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
  var text = escapeHtml(westernDigits(mobile));
  if (!d) return text;
  return text + ' &nbsp;&nbsp;<a href="https://wa.me/' + d + '" style="color:' + LINK + ';">Open in WhatsApp</a>';
}

function breakLines(s) {
  return escapeHtml(s).replace(/\r?\n/g, '<br>');
}

function buildHtml(a, sheetUrl) {
  var from = (a.name ? escapeHtml(a.name) : notGiven()) + (a.who ? ' (' + escapeHtml(a.who) + ')' : '');
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
    'From: ' + (a.name || 'Not given') + (a.who ? ' (' + a.who + ')' : ''),
    'Student: ' + (a.student || 'Not given'),
    'Grade: ' + (a.grade || 'Not given'),
    'Topic: ' + (a.topic || 'Not given'),
    'Question: ' + (a.question || 'Not given'),
    'Email: ' + (a.email || 'Not given'),
    'Mobile: ' + (a.mobile ? westernDigits(a.mobile) + (wa ? ' (WhatsApp: https://wa.me/' + wa + ')' : '') : 'Not given')
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
  return { subject: (testMode ? '[TEST] ' : '') + SUBJECT_PREFIX + ': see below', html: '', text: lines.join('\n') };
}

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
