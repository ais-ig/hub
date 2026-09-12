#!/usr/bin/env node
/* Static checks for the Parent Hub. Zero dependencies.
   Run: node tools/check.mjs */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

const failures = [];
const notes = [];
const fail = (rule, detail) => failures.push(rule + ': ' + detail);

/* 1. Every internal anchor resolves to an id on the page. */
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const anchors = new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]));
for (const a of anchors) {
  if (!ids.has(a)) fail('anchor', 'href="#' + a + '" has no matching id');
}
notes.push(anchors.size + ' internal anchors resolve');

/* 2. Every linked asset exists on disk. Query and fragment are stripped. */
const assets = new Set(
  [...html.matchAll(/(?:href|src)="(assets\/[^"]+)"/g)].map((m) => m[1])
);
for (const a of assets) {
  const p = a.split(/[?#]/)[0];
  if (!existsSync(join(root, p))) fail('asset', p + ' is linked but not on disk');
}
notes.push(assets.size + ' asset links exist');

/* 3. No em dashes. The project forbids them everywhere. */
const em = (html.match(/\u2014/g) || []).length; /* em dash, escaped so
                                                       this file stays free of
                                                       the character itself */
if (em) fail('writing', em + ' em dash(es) present; use en dashes or middots');

/* 4. Poppins weights 300/400/500/700 only. Never 600 or 800. */
for (const m of html.matchAll(/font-weight:\s*(\d{3})/g)) {
  if (!['300', '400', '500', '700'].includes(m[1])) {
    fail('brand', 'font-weight ' + m[1] + ' is not an allowed Poppins weight');
  }
}

/* 5. No event language. The Meet & Greet is over. */
const tonight = (html.match(/tonight/gi) || []).length;
if (tonight) fail('event', tonight + ' occurrence(s) of "tonight" remain');

/* 6. The updates array parses and every entry is well formed. */
const block = html.match(
  /<script type="application\/json" id="updatesData">([\s\S]*?)<\/script>/
);
if (!block) {
  fail('updates', 'the updatesData block is missing');
} else {
  let data = null;
  try {
    data = JSON.parse(block[1]);
  } catch (e) {
    fail('updates', 'updatesData is not valid JSON: ' + e.message);
  }
  if (data && !Array.isArray(data)) fail('updates', 'updatesData must be an array');
  if (Array.isArray(data)) {
    data.forEach((e, i) => {
      if (typeof e !== 'object' || e === null) {
        fail('updates', 'entry ' + i + ' is not an object');
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || '')) {
        fail('updates', 'entry ' + i + ' needs a YYYY-MM-DD date');
      }
      if (!e.title) fail('updates', 'entry ' + i + ' has no title');
      if (!e.text) fail('updates', 'entry ' + i + ' has no text');
      if (e.href && e.href.startsWith('#') && !ids.has(e.href.slice(1))) {
        fail('updates', 'entry ' + i + ' links to missing anchor ' + e.href);
      }
    });
    notes.push(data.length + ' update entries are well formed');
  }
}

for (const n of notes) console.log('ok   ' + n);
for (const f of failures) console.log('FAIL ' + f);
console.log(failures.length ? '\n' + failures.length + ' failure(s)' : '\nall checks passed');
process.exit(failures.length ? 1 : 0);
