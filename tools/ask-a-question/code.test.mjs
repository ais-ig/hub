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
