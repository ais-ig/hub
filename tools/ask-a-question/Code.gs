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
