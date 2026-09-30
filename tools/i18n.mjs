#!/usr/bin/env node
/* Keeps the Arabic of the Parent Hub in step with its English. Zero
   dependencies. Importable, and a command line tool:

     node tools/i18n.mjs extract          print every key and its English, as JSON
     node tools/i18n.mjs merge <file>...  write key to Arabic maps into the page
     node tools/i18n.mjs stamp <key>...   re-stamp hashes once the Arabic is current
     node tools/i18n.mjs stamp --all      the same, for every stale entry
     node tools/i18n.mjs pairs            write docs/arabic/translation-review.*
     node tools/i18n.mjs check            the nine rules; exit 1 on any failure

   The design is docs/superpowers/specs/2026-09-30-arabic-language-design.md.
   Every exported function takes the page as a string and returns a result,
   so the tests need no files. */
import { readFileSync, writeFileSync, mkdirSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'source', 'track', 'wbr',
]);
/* Elements whose content is text, never markup. */
const RAW = new Set(['script', 'style', 'textarea', 'title']);
/* The attributes rule 5 compares between the English and the Arabic. */
const TAG_ATTRS = ['href', 'class', 'target', 'rel', 'download'];
const UPDATE_FIELDS = ['title', 'text', 'label'];
/* The attributes a parent reads or hears, which rule 9 wants keyed. */
const READ_ATTRS = ['aria-label', 'alt', 'title', 'placeholder'];

const has = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k);

/* ---------- text helpers ---------- */

/* Applied before hashing and before comparing. */
export const normalise = (s) => String(s).replace(/\s+/g, ' ').trim();

/* The first eight hex characters of the SHA-1 of the normalised English. */
export const hashEn = (text) =>
  createHash('sha1').update(normalise(text), 'utf8').digest('hex').slice(0, 8);

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  middot: '·', ndash: '–', hellip: '…',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  larr: '←', rarr: '→', uarr: '↑', darr: '↓',
  times: '×', copy: '©',
};

const decodeEntities = (s) =>
  s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]*);/gi, (whole, body) => {
    if (body[0] === '#') {
      const code = /^#x/i.test(body) ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' ';
    }
    return has(ENTITIES, body) ? ENTITIES[body] : ' ';
  });

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const lineOf = (html, offset) => html.slice(0, offset).split('\n').length;

/* ---------- a small tokeniser, no DOM ---------- */

/* The index of the > that ends the tag opened before `from`, skipping any >
   inside a quoted attribute value. -1 when the tag never ends. */
function tagEnd(html, from) {
  let quote = '';
  for (let j = from; j < html.length; j++) {
    const c = html[j];
    if (quote) {
      if (c === quote) quote = '';
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '>') {
      return j;
    }
  }
  return -1;
}

function parseAttrs(src) {
  const attrs = {};
  const re = /([^\s"'=<>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>]+)))?/g;
  for (const m of src.matchAll(re)) {
    const name = m[1].toLowerCase();
    if (!has(attrs, name)) attrs[name] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return attrs;
}

/* Splits HTML into open, close, text and comment tokens, each with its
   start and end offsets. A < that does not begin a tag stays text. */
function tokenize(html) {
  const tokens = [];
  const n = html.length;
  const starts = /<(?:!--|[!?]|\/?[A-Za-z])/g;
  let i = 0;
  const text = (from, to, raw) => {
    if (to > from) tokens.push({ type: 'text', start: from, end: to, raw: !!raw });
  };
  while (i < n) {
    starts.lastIndex = i;
    const m = starts.exec(html);
    if (!m) { text(i, n); break; }
    const lt = m.index;
    if (m[0] === '<!--') {
      text(i, lt);
      const e = html.indexOf('-->', lt + 4);
      const end = e === -1 ? n : e + 3;
      tokens.push({ type: 'comment', start: lt, end });
      i = end;
      continue;
    }
    const gt = tagEnd(html, lt + 1);
    if (gt === -1) { text(i, n); break; }
    text(i, lt);
    i = gt + 1;
    if (m[0] === '<!' || m[0] === '<?') {
      tokens.push({ type: 'comment', start: lt, end: i });
      continue;
    }
    const closing = html[lt + 1] === '/';
    const inner = html.slice(lt + (closing ? 2 : 1), gt);
    const name = inner.match(/^[A-Za-z][^\s\/>]*/)[0].toLowerCase();
    if (closing) {
      tokens.push({ type: 'close', name, start: lt, end: i });
      continue;
    }
    const selfClose = /\/\s*$/.test(inner);
    tokens.push({
      type: 'open',
      name,
      attrs: parseAttrs(inner.slice(name.length)),
      void: VOID.has(name) || selfClose,
      start: lt,
      end: i,
    });
    if (RAW.has(name) && !selfClose) {
      const close = new RegExp('</' + name + '\\b', 'i');
      const at = html.slice(i).search(close);
      const end = at === -1 ? n : i + at;
      text(i, end, true);
      i = end;
    }
  }
  return tokens;
}

/* The index of the close tag of the element opened at tokens[i], found by
   counting opening and closing tags of that name. -1 when it never closes. */
function closeIndex(tokens, i) {
  const name = tokens[i].name;
  let depth = 1;
  for (let j = i + 1; j < tokens.length; j++) {
    const t = tokens[j];
    if (t.name !== name) continue;
    if (t.type === 'open' && !t.void) depth++;
    else if (t.type === 'close' && --depth === 0) return j;
  }
  return -1;
}

/* What a reader sees of a fragment: tags dropped, entities decoded. */
function visibleText(fragment) {
  let out = '';
  for (const t of tokenize(fragment)) {
    if (t.type === 'text' && !t.raw) out += fragment.slice(t.start, t.end);
  }
  return normalise(decodeEntities(out));
}

/* ---------- reading the page ---------- */

/* One of the JSON blocks, by id. `start` and `end` bound its content. */
function jsonBlock(html, id) {
  const re = new RegExp('<script\\b[^>]*\\bid=["\']' + id + '["\'][^>]*>([\\s\\S]*?)</script>');
  const m = html.match(re);
  if (!m) return { found: false, data: null, error: null };
  const start = m.index + m[0].indexOf('>') + 1;
  const block = { found: true, data: null, error: null, start, end: start + m[1].length };
  try {
    block.data = JSON.parse(m[1]);
  } catch (e) {
    block.error = e.message;
  }
  return block;
}

const isDict = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

/* "aria-label:key; title:key2" as [attribute, key] pairs. */
const attrPairs = (value) =>
  value.split(';').map((p) => p.trim()).filter(Boolean).map((p) => {
    const at = p.indexOf(':');
    return at === -1 ? [p, ''] : [p.slice(0, at).trim().toLowerCase(), p.slice(at + 1).trim()];
  });

/* Everything the commands need to know about the page, read once. */
function scan(html) {
  const tokens = tokenize(html);
  const occurrences = []; /* every use of a key, in page order */
  const problems = [];    /* markup the tool cannot make sense of */
  tokens.forEach((t, i) => {
    if (t.type !== 'open') return;
    const line = lineOf(html, t.start);
    if (has(t.attrs, 'data-i18n')) {
      const key = t.attrs['data-i18n'].trim();
      const close = t.void ? -1 : closeIndex(tokens, i);
      if (!key) {
        problems.push('line ' + line + ': <' + t.name + '> has an empty data-i18n');
      } else if (close === -1) {
        problems.push(key + ': <' + t.name + '> on line ' + line +
          ' is void or never closes, so it has no text to translate');
      } else {
        occurrences.push({
          key, kind: 'html', line, open: i, close,
          en: normalise(html.slice(t.end, tokens[close].start)),
        });
      }
    }
    if (has(t.attrs, 'data-i18n-attr')) {
      for (const [attr, key] of attrPairs(t.attrs['data-i18n-attr'])) {
        if (!attr || !key) {
          problems.push('line ' + line + ': data-i18n-attr needs attribute:key pairs');
        } else if (!has(t.attrs, attr)) {
          problems.push(key + ': <' + t.name + '> on line ' + line + ' has no ' + attr + ' attribute');
        } else {
          occurrences.push({ key, kind: 'attr', line, open: i, en: normalise(t.attrs[attr]) });
        }
      }
    }
  });

  const enBlock = jsonBlock(html, 'i18nEn');
  if (isDict(enBlock.data)) {
    for (const [key, value] of Object.entries(enBlock.data)) {
      occurrences.push({
        key, kind: 'js', line: lineOf(html, enBlock.start), en: normalise(value),
      });
    }
  }

  const upBlock = jsonBlock(html, 'updatesData');
  /* { key, en, ar, id, field, numsOff }, Arabic null when absent. An entry
     may carry "numsAr": false to exempt it from the number check. */
  const updates = [];
  const updateProblems = []; /* [rule, detail] for a block that cannot be read */
  if (!upBlock.found) {
    updateProblems.push(['block',
      'the updatesData block is missing; rules 6, 7 and 8 were skipped for update notices']);
  } else if (!Array.isArray(upBlock.data)) {
    updateProblems.push(['block', 'the updatesData block is not valid JSON' +
      (upBlock.error ? ': ' + upBlock.error : '; it must be an array') +
      '; rules 6, 7 and 8 were skipped for update notices']);
  } else {
    upBlock.data.forEach((e, i) => {
      if (!isDict(e) || typeof e.id !== 'string' || !e.id) {
        updateProblems.push(['8 updates',
          'entry ' + i + ' of updatesData has no id, so its Arabic cannot be checked']);
        return;
      }
      for (const field of UPDATE_FIELDS) {
        if (!e[field]) continue;
        const ar = e[field + 'Ar'];
        updates.push({
          key: 'updates.' + e.id + '.' + field,
          en: normalise(e[field]),
          ar: typeof ar === 'string' && ar.trim() ? ar : null,
          id: e.id,
          field,
          numsOff: e.numsAr === false,
        });
      }
    });
  }

  /* The English per key, first appearance winning, in page order. */
  const sources = new Map();
  for (const o of occurrences) if (!sources.has(o.key)) sources.set(o.key, o);

  return {
    tokens, occurrences, problems, sources, updates, updateProblems,
    arBlock: jsonBlock(html, 'i18nAr'), enBlock, upBlock,
  };
}

/* The Arabic of a dictionary entry, or null when it has none. */
const arabicOf = (entry) =>
  isDict(entry) && typeof entry.ar === 'string' && entry.ar.trim() ? entry.ar : null;

/* ---------- extract ---------- */

/* Every key with its English source, in page order, update notices last.
   Each is { key, en, kind }; kind is html, attr, js or update. */
export function extractKeys(html) {
  const s = scan(html);
  const out = [];
  for (const o of s.sources.values()) out.push({ key: o.key, en: o.en, kind: o.kind });
  for (const u of s.updates) out.push({ key: u.key, en: u.en, kind: 'update' });
  return out;
}

/* ---------- check ---------- */

/* The ordered tags of a fragment with the attributes rule 5 compares. With
   dropBidi, <span dir="ltr"> and <bdi> are left out along with their own
   closing tags, found through a stack rather than by taking the next one. */
function tagSignature(fragment, dropBidi) {
  const sig = [];
  const stack = [];
  for (const t of tokenize(fragment)) {
    if (t.type === 'open') {
      const drop = dropBidi && (t.name === 'bdi' || (
        t.name === 'span' &&
        (t.attrs.dir || '').toLowerCase() === 'ltr' &&
        !TAG_ATTRS.some((a) => has(t.attrs, a))
      ));
      if (!t.void) stack.push({ name: t.name, drop });
      if (drop) continue;
      let tag = '<' + t.name;
      for (const a of TAG_ATTRS) {
        if (has(t.attrs, a)) tag += ' ' + a + '="' + normalise(t.attrs[a]) + '"';
      }
      sig.push(tag + '>');
    } else if (t.type === 'close') {
      let k = stack.length - 1;
      while (k >= 0 && stack[k].name !== t.name) k--;
      let drop = false;
      if (k >= 0) {
        drop = stack[k].drop;
        stack.length = k;
      }
      if (!drop) sig.push('</' + t.name + '>');
    }
  }
  return sig;
}

/* Maximal runs of ASCII digits in what the reader sees, as a count per run. */
function numberCounts(fragment) {
  const counts = new Map();
  for (const n of visibleText(fragment).match(/[0-9]+/g) || []) {
    counts.set(n, (counts.get(n) || 0) + 1);
  }
  return counts;
}

/* The numbers of the English that the Arabic lacks, counting repeats. */
function lostNumbers(en, ar) {
  const arNums = numberCounts(ar);
  const lost = [];
  for (const [num, count] of numberCounts(en)) {
    if ((arNums.get(num) || 0) < count) lost.push(num);
  }
  return lost;
}

/* Built from code points so this file stays free of the characters
   themselves: the em dash, both Arabic-Indic digit ranges, the tatweel. */
const ch = String.fromCharCode;
const FORBIDDEN = [
  [new RegExp(ch(0x2014)), 'an em dash'],
  [new RegExp('[' + ch(0x0660) + '-' + ch(0x0669) + ch(0x06F0) + '-' + ch(0x06F9) + ']'),
    'an Arabic-Indic digit'],
  [new RegExp(ch(0x0640)), 'a tatweel'],
];

function forbiddenIn(ar) {
  return FORBIDDEN.filter(([re]) => re.test(ar)).map(([, what]) => what);
}

const latinLetters = (raw) =>
  (raw.replace(/&[#\w]+;/g, ' ').match(/[A-Za-z]/g) || []).length;

const clip = (raw) => {
  const shown = normalise(decodeEntities(raw));
  return shown.length > 60 ? shown.slice(0, 60) + '…' : shown;
};

/* Rule 9. English in <body> that no key covers: a visible text node with two
   or more Latin letters outside every keyed element and the allow list, or
   an aria-label, alt, title or placeholder with no data-i18n-attr pair.
   Text items are { line, text }; attribute items add attr and tag. */
function unkeyedText(html, tokens) {
  const found = [];
  const hasBody = tokens.some((t) => t.type === 'open' && t.name === 'body');
  let inBody = !hasBody;
  const stack = [];
  const top = () => stack[stack.length - 1] || { covered: false, attrCovered: false };
  for (const t of tokens) {
    if (t.type === 'open') {
      if (t.name === 'body') inBody = true;
      const a = t.attrs;
      /* An attribute is excused only by data-i18n-skip or aria-hidden, here
         or above, or by sitting inside a keyed element, whose Arabic
         replaces it along with the rest of the innerHTML. */
      const hidden = top().attrCovered ||
        has(a, 'data-i18n-skip') || a['aria-hidden'] === 'true';
      if (inBody && !hidden) {
        const paired = new Set(
          has(a, 'data-i18n-attr') ? attrPairs(a['data-i18n-attr']).map((p) => p[0]) : []
        );
        for (const attr of READ_ATTRS) {
          if (!has(a, attr) || paired.has(attr) || latinLetters(a[attr]) < 2) continue;
          found.push({ line: lineOf(html, t.start), attr, tag: t.name, text: clip(a[attr]) });
        }
      }
      if (t.void) continue;
      stack.push({
        name: t.name,
        covered: top().covered ||
          has(a, 'data-i18n') ||
          has(a, 'data-i18n-skip') ||
          a['aria-hidden'] === 'true' ||
          (a.class || '').split(/\s+/).includes('classlinks') ||
          t.name === 'script' || t.name === 'style',
        attrCovered: hidden || has(a, 'data-i18n'),
      });
    } else if (t.type === 'close') {
      if (t.name === 'body') inBody = false;
      let k = stack.length - 1;
      while (k >= 0 && stack[k].name !== t.name) k--;
      if (k >= 0) stack.length = k;
    } else if (t.type === 'text' && inBody && !top().covered) {
      const raw = html.slice(t.start, t.end);
      if (latinLetters(raw) < 2) continue;
      const lead = raw.length - raw.trimStart().length;
      found.push({ line: lineOf(html, t.start + lead), text: clip(raw) });
    }
  }
  return found;
}

/* The nine rules. Returns failure strings, empty when the two languages are
   in step. Each string starts "i18n <rule> <name>:" and names the key. */
export function checkAll(html) {
  const s = scan(html);
  const failures = [];
  const fail = (rule, detail) => failures.push('i18n ' + rule + ': ' + detail);

  for (const p of s.problems) fail('markup', p);
  if (s.enBlock.found && !isDict(s.enBlock.data)) {
    fail('block', 'the i18nEn block is not valid JSON' +
      (s.enBlock.error ? ': ' + s.enBlock.error : '; it must be an object'));
  }

  /* Without a readable dictionary the rules that compare against it are
     skipped, and that is said once. */
  let dict = null;
  if (!s.arBlock.found) {
    fail('block', 'the i18nAr block is missing; rules 1, 3, 5, 6 and 7 were skipped');
  } else if (!isDict(s.arBlock.data)) {
    fail('block', 'the i18nAr block is not valid JSON' +
      (s.arBlock.error ? ': ' + s.arBlock.error : '; it must be an object') +
      '; rules 1, 3, 5, 6 and 7 were skipped');
  } else {
    dict = s.arBlock.data;
  }

  /* 1. Every key has Arabic, and every Arabic entry has a key. */
  if (dict) {
    for (const key of s.sources.keys()) {
      if (has(dict, key) && !isDict(dict[key])) continue; /* said below */
      if (arabicOf(dict[key]) === null) fail('1 missing', key + ' has no Arabic in i18nAr');
    }
    for (const key of Object.keys(dict)) {
      if (!isDict(dict[key])) {
        fail('1 malformed', key + ' in i18nAr must be an entry of the form ' +
          '{ "h": "...", "ar": "..." }');
      }
    }
    for (const key of Object.keys(dict)) {
      if (!s.sources.has(key)) {
        fail('1 orphan', key + ' is in i18nAr but on no element of the page');
      }
    }
  }

  /* 2. A key used twice carries the same English both times. */
  const clashed = new Set();
  for (const o of s.occurrences) {
    const first = s.sources.get(o.key);
    if (o.en !== first.en && !clashed.has(o.key)) {
      clashed.add(o.key);
      fail('2 duplicate', o.key + ' is used with different English on lines ' +
        first.line + ' and ' + o.line);
    }
  }

  /* 4. A keyed element holds no keyed element and no element with an id,
     because its innerHTML is replaced whole. */
  for (const o of s.occurrences) {
    if (o.kind !== 'html') continue;
    for (let j = o.open + 1; j < o.close; j++) {
      const t = s.tokens[j];
      if (t.type !== 'open') continue;
      if (has(t.attrs, 'data-i18n') || has(t.attrs, 'data-i18n-attr')) {
        const inner = has(t.attrs, 'data-i18n') ? t.attrs['data-i18n'] : t.attrs['data-i18n-attr'];
        fail('4 nesting', o.key + ' contains the keyed element ' + inner +
          ' (line ' + lineOf(html, t.start) + ')');
      }
      if (has(t.attrs, 'id')) {
        fail('4 nesting', o.key + ' contains an element with id="' + t.attrs.id +
          '" (line ' + lineOf(html, t.start) + ')');
      }
    }
  }

  if (dict) {
    for (const [key, source] of s.sources) {
      const ar = arabicOf(dict[key]);
      if (ar === null) continue;

      /* 3. The hash still matches the English. */
      if (dict[key].h !== hashEn(source.en)) {
        fail('3 stale', key + ' has English that changed after its Arabic was written; ' +
          'update the Arabic, then run: node tools/i18n.mjs stamp ' + key);
      }

      /* 5. Same tags, same link attributes, same order. */
      const enSig = tagSignature(source.en, false);
      const arSig = tagSignature(ar, true);
      const n = Math.max(enSig.length, arSig.length);
      for (let i = 0; i < n; i++) {
        if (enSig[i] === arSig[i]) continue;
        fail('5 tags', key + ' differs at tag ' + (i + 1) + ': English has ' +
          (enSig[i] || 'nothing') + ', Arabic has ' + (arSig[i] || 'nothing'));
        break;
      }

      /* 6. Every number in the English is in the Arabic, as often. */
      if (dict[key].nums !== false) {
        const lost = lostNumbers(source.en, ar);
        if (lost.length) {
          fail('6 numbers', key + ' has Arabic that lacks ' + lost.join(', ') +
            '; add it, or set "nums": false where a number is rightly a word');
        }
      }

      /* 7. No forbidden characters. */
      for (const what of forbiddenIn(ar)) {
        fail('7 characters', key + ' has Arabic that contains ' + what);
      }
    }
  }

  /* 6, 7 and 8 for update notices, whose Arabic lives beside their English. */
  for (const [rule, detail] of s.updateProblems) fail(rule, detail);
  for (const u of s.updates) {
    if (u.ar === null) {
      fail('8 updates', u.key + ' has no ' + u.field + 'Ar in updatesData');
      continue;
    }
    if (!u.numsOff) {
      const lost = lostNumbers(u.en, u.ar);
      if (lost.length) {
        fail('6 numbers', u.key + ' has Arabic that lacks ' + lost.join(', ') +
          '; add it, or set "numsAr": false on the entry where a number is rightly a word');
      }
    }
    for (const what of forbiddenIn(u.ar)) {
      fail('7 characters', u.key + ' has Arabic that contains ' + what);
    }
  }

  /* 9. No English a parent reads sits outside a key. */
  for (const f of unkeyedText(html, s.tokens)) {
    fail('9 unkeyed', f.attr
      ? 'line ' + f.line + ': ' + f.attr + '="' + f.text + '" on <' + f.tag +
        '> has no data-i18n-attr pair'
      : 'line ' + f.line + ': "' + f.text + '" has no data-i18n key');
  }

  return failures;
}

/* ---------- merge and stamp ---------- */

/* JSON that cannot end its own <script> block or open a comment in it. */
const blockJson = (value, indent) =>
  JSON.stringify(value, null, indent)
    .replace(/<\/(script)/gi, '<\\/$1')
    .replace(/<!--/g, '\\u003c!--');

/* One entry per line, page order first, then anything the page no longer
   uses so that check can report it rather than merge dropping it. */
function serialiseDict(dict, pageOrder) {
  const keys = pageOrder.filter((k) => has(dict, k));
  for (const k of Object.keys(dict)) if (!keys.includes(k)) keys.push(k);
  if (!keys.length) return '\n{}\n';
  const lines = keys.map((k) => {
    const e = dict[k];
    /* An entry that is not an object is written back untouched, so a hand
       slip never costs its Arabic; check reports it. */
    if (!isDict(e)) return '  ' + blockJson(k) + ': ' + blockJson(e);
    let line = '  ' + blockJson(k) + ': { "h": ' + blockJson(String(e.h ?? '')) +
      ', "ar": ' + blockJson(String(e.ar ?? ''));
    for (const [field, value] of Object.entries(e)) {
      if (field !== 'h' && field !== 'ar') line += ', ' + blockJson(field) + ': ' + blockJson(value);
    }
    return line + ' }';
  });
  return '\n{\n' + lines.join(',\n') + '\n}\n';
}

/* Puts the dictionary into the page, creating the block before the main
   script when the page has none. */
function writeDict(html, dict) {
  const s = scan(html);
  const content = serialiseDict(dict, [...s.sources.keys()]);
  if (s.arBlock.found) {
    return html.slice(0, s.arBlock.start) + content + html.slice(s.arBlock.end);
  }
  const block = '<script type="application/json" id="i18nAr">' + content + '</script>\n';
  const scripts = [...html.matchAll(/<script\b(?![^>]*\btype=["']application\/json["'])[^>]*>/g)];
  let at = scripts.length ? scripts[scripts.length - 1].index : html.lastIndexOf('</body>');
  if (at === -1) at = html.length;
  return html.slice(0, at) + block + html.slice(at);
}

function readDict(s) {
  if (!s.arBlock.found) return {};
  if (!isDict(s.arBlock.data)) {
    throw new Error('the i18nAr block is not valid JSON; mend it by hand first');
  }
  return { ...s.arBlock.data };
}

/* Writes a key to Arabic map into the page and stamps each entry's hash from
   the current English. A value is the Arabic string, or { ar, nums }. Keys
   of the form updates.<id>.<field> go to that notice's <field>Ar instead.
   Entries the map does not name are left exactly as they are. */
export function mergeAr(html, map) {
  const s = scan(html);
  const dict = readDict(s);
  const updateKeys = new Map(s.updates.map((u) => [u.key, u]));
  const unknown = Object.keys(map).filter((k) => !s.sources.has(k) && !updateKeys.has(k));
  if (unknown.length) {
    throw new Error('not a key on the page: ' + unknown.join(', '));
  }

  const updateEdits = new Map(); /* id -> { titleAr: ..., ... } */
  for (const [key, value] of Object.entries(map)) {
    const ar = isDict(value) ? value.ar : value;
    if (typeof ar !== 'string' || !ar.trim()) {
      throw new Error(key + ' needs a non-empty Arabic string');
    }
    const u = updateKeys.get(key);
    if (u) {
      if (!updateEdits.has(u.id)) updateEdits.set(u.id, {});
      updateEdits.get(u.id)[u.field + 'Ar'] = ar;
      continue;
    }
    const entry = { h: hashEn(s.sources.get(key).en), ar };
    const nums = isDict(value) && has(value, 'nums') ? value.nums : (dict[key] || {}).nums;
    if (nums === false) entry.nums = false;
    dict[key] = entry;
  }

  let out = html;
  if (updateEdits.size) {
    /* Each Arabic field is placed straight after its English one. */
    const data = s.upBlock.data.map((e) => {
      const edits = isDict(e) && updateEdits.get(e.id);
      if (!edits) return e;
      const next = {};
      for (const [k, v] of Object.entries(e)) {
        if (!has(edits, k)) next[k] = v;
        if (has(edits, k + 'Ar')) next[k + 'Ar'] = edits[k + 'Ar'];
      }
      return next;
    });
    out = out.slice(0, s.upBlock.start) + '\n' + blockJson(data, 2) + '\n' +
      out.slice(s.upBlock.end);
  }
  const touchedDict = Object.keys(map).some((k) => !updateKeys.has(k));
  return touchedDict ? writeDict(out, dict) : out;
}

/* Re-stamps hashes: the named keys, or with `all` every entry whose hash
   is stale. Returns the new page and the keys whose hash changed. */
function stamp(html, keys, all) {
  const s = scan(html);
  const dict = readDict(s);
  const named = all
    ? Object.keys(dict).filter((k) => s.sources.has(k) && isDict(dict[k]))
    : keys;
  const bad = named.filter((k) => !s.sources.has(k) || !isDict(dict[k]));
  if (bad.length) {
    throw new Error('no key on the page with an Arabic entry: ' + bad.join(', '));
  }
  const stamped = [];
  for (const key of named) {
    const h = hashEn(s.sources.get(key).en);
    if (dict[key].h === h) continue;
    dict[key] = { ...dict[key], h };
    stamped.push(key);
  }
  return { html: stamped.length ? writeDict(html, dict) : html, stamped };
}

/* Run only once the Arabic of each named key has been brought up to date.
   The keys must be named; an empty list is refused, not read as "all". */
export function stampKeys(html, keys) {
  if (!Array.isArray(keys) || !keys.length) {
    throw new Error('name the keys to stamp, or use stampAll');
  }
  return stamp(html, keys, false).html;
}

/* Re-stamps every stale entry. For use after a full review of the Arabic. */
export function stampAll(html) {
  return stamp(html, [], true).html;
}

/* ---------- pairs ---------- */

/* The side by side review, as { html, md }: a table per section prefix. */
export function buildPairs(html) {
  const s = scan(html);
  const dict = isDict(s.arBlock.data) ? s.arBlock.data : {};
  const rows = [];
  for (const o of s.sources.values()) {
    rows.push({ key: o.key, en: o.en, ar: arabicOf(dict[o.key]) });
  }
  for (const u of s.updates) rows.push({ key: u.key, en: u.en, ar: u.ar });

  const sections = new Map();
  for (const r of rows) {
    const prefix = r.key.split('.')[0];
    if (!sections.has(prefix)) sections.set(prefix, []);
    sections.get(prefix).push(r);
  }
  const missing = rows.filter((r) => r.ar === null).length;
  const summary = rows.length + ' strings · ' + missing + ' missing Arabic';

  const mdCell = (text) => text.replace(/\|/g, '\\|');
  let md = '# Translation review · AIS Parent Hub\n\n' + summary + '\n\n' +
    'Written by `node tools/i18n.mjs pairs`. Do not edit by hand.\n';
  let body = '';
  for (const [prefix, list] of sections) {
    md += '\n## ' + prefix + '\n\n| Key | English | Arabic |\n|---|---|---|\n';
    body += '<h2>' + escapeHtml(prefix) + '</h2>\n<table>\n' +
      '<thead><tr><th>Key</th><th>English</th><th>Arabic</th></tr></thead>\n<tbody>\n';
    for (const r of list) {
      const en = visibleText(r.en);
      const ar = r.ar === null ? null : visibleText(r.ar);
      md += '| `' + r.key + '` | ' + mdCell(en) + ' | ' +
        (ar === null ? '**MISSING**' : mdCell(ar)) + ' |\n';
      body += '<tr><td class="key">' + escapeHtml(r.key) + '</td><td>' + escapeHtml(en) + '</td>' +
        (ar === null
          ? '<td class="missing">Missing</td>'
          : '<td dir="rtl" lang="ar">' + escapeHtml(ar) + '</td>') +
        '</tr>\n';
    }
    body += '</tbody>\n</table>\n';
  }

  const page = [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>Translation review · AIS Parent Hub</title>',
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Poppins:wght@400;700&display=swap" rel="stylesheet">',
    '<style>',
    'body { margin: 0; padding: 24px 16px 48px; background: #fff; color: #0C2E54; font-family: "Poppins", sans-serif; font-size: 14px; line-height: 1.6; }',
    'main { max-width: 1100px; margin: 0 auto; }',
    'h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; }',
    'h2 { font-size: 18px; font-weight: 700; margin: 32px 0 8px; padding-top: 8px; border-top: 3px solid #EDBA1D; }',
    'p { margin: 0 0 8px; }',
    'table { width: 100%; border-collapse: collapse; table-layout: fixed; }',
    'th, td { border: 1px solid #d5dbe3; padding: 8px 10px; vertical-align: top; text-align: left; overflow-wrap: anywhere; }',
    'th { background: #0C2E54; color: #fff; font-weight: 700; }',
    'th:first-child, td.key { width: 22%; }',
    'td.key { font-size: 12px; color: #1D5394; }',
    'td[lang="ar"] { font-family: "Cairo", sans-serif; font-size: 16px; text-align: right; }',
    'td.missing { background: #EDBA1D; font-weight: 700; }',
    '</style>',
    '</head>',
    '<body>',
    '<main>',
    '<h1>Translation review · AIS Parent Hub</h1>',
    '<p>' + summary + '</p>',
    '<p>Written by <code>node tools/i18n.mjs pairs</code>. Do not edit by hand.</p>',
    body + '</main>',
    '</body>',
    '</html>',
    '',
  ].join('\n');

  return { html: page, md };
}

/* ---------- command line ---------- */

function main(argv) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const pagePath = join(root, 'index.html');
  const html = readFileSync(pagePath, 'utf8');
  const [command, ...args] = argv;

  if (command === 'extract') {
    const out = {};
    for (const k of extractKeys(html)) out[k.key] = k.en;
    console.log(JSON.stringify(out, null, 2));
    return 0;
  }

  if (command === 'merge') {
    if (!args.length) {
      console.error('usage: node tools/i18n.mjs merge <file>...');
      return 2;
    }
    const map = {};
    for (const file of args) {
      const data = JSON.parse(readFileSync(file, 'utf8'));
      if (!isDict(data)) throw new Error(file + ' must hold a JSON object of key to Arabic');
      Object.assign(map, data);
    }
    writeFileSync(pagePath, mergeAr(html, map));
    console.log('merged ' + Object.keys(map).length + ' key(s) from ' + args.length + ' file(s)');
    return 0;
  }

  if (command === 'stamp') {
    const all = args.includes('--all');
    if (!args.length || (all && args.length > 1)) {
      console.error('usage: node tools/i18n.mjs stamp <key>... | stamp --all');
      return 2;
    }
    const result = stamp(html, all ? [] : args, all);
    if (result.stamped.length) writeFileSync(pagePath, result.html);
    for (const key of result.stamped) console.log('stamped ' + key);
    console.log(result.stamped.length + ' key(s) stamped');
    return 0;
  }

  if (command === 'pairs') {
    const dir = join(root, 'docs', 'arabic');
    mkdirSync(dir, { recursive: true });
    const pairs = buildPairs(html);
    writeFileSync(join(dir, 'translation-review.html'), pairs.html);
    writeFileSync(join(dir, 'translation-review.md'), pairs.md);
    console.log('wrote docs/arabic/translation-review.html and translation-review.md');
    return 0;
  }

  if (command === 'check') {
    const failures = checkAll(html);
    for (const f of failures) console.log('FAIL ' + f);
    console.log(failures.length
      ? '\n' + failures.length + ' failure(s)'
      : 'ok   ' + extractKeys(html).length + ' strings have Arabic in step with their English');
    return failures.length ? 1 : 0;
  }

  console.error('usage: node tools/i18n.mjs extract | merge <file>... | stamp <key>... | stamp --all | pairs | check');
  return 2;
}

const invoked = process.argv[1] ? realpathSync(process.argv[1]) : '';
if (invoked === realpathSync(fileURLToPath(import.meta.url))) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (e) {
    console.error('i18n: ' + e.message);
    process.exit(1);
  }
}
