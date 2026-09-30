/* Tests for tools/i18n.mjs. Zero dependencies.
   Run: node --test tools/i18n.test.mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  normalise,
  hashEn,
  extractKeys,
  checkAll,
  mergeAr,
  stampKeys,
  stampAll,
  buildPairs,
} from './i18n.mjs';

/* Characters the Arabic must never hold, built from code points so this
   file stays free of them. */
const EM_DASH = String.fromCharCode(0x2014);
const ARABIC_INDIC_3 = String.fromCharCode(0x0663);
const TATWEEL = String.fromCharCode(0x0640);

const jsonBlock = (id, data) =>
  '<script type="application/json" id="' + id + '">\n' +
  JSON.stringify(data, null, 2) + '\n</script>\n';

/* A small page shaped like the real one. ar and en are left out when null. */
function page({ body = '', ar = null, en = null, updates = [] } = {}) {
  return '<!doctype html>\n<html lang="en">\n<head>\n<title>Parent Hub</title>\n' +
    '<style>.english { color: red; }</style>\n</head>\n<body id="top">\n' +
    body + '\n' +
    jsonBlock('updatesData', updates) +
    (en ? jsonBlock('i18nEn', en) : '') +
    (ar ? jsonBlock('i18nAr', ar) : '') +
    '<script>\nvar english = "words in a script";\n</script>\n</body>\n</html>\n';
}

const entry = (en, ar, extra = {}) => ({ h: hashEn(en), ar, ...extra });

const LEAD_EN = 'Open the <a href="assets/t.pdf?v=3" class="btn" target="_blank" ' +
  'rel="noopener">timetable for 9A</a> by <strong>6:30</strong>.';
const LEAD_AR = 'افتح <a href="assets/t.pdf?v=3" class="btn" target="_blank" ' +
  'rel="noopener">جدول <span dir="ltr">9A</span></a> قبل <strong>6:30</strong>.';

const GOOD_BODY = [
  '<h1 data-i18n="hero.title">Parent   Hub</h1>',
  '<p data-i18n="hero.lead">' + LEAD_EN + '</p>',
  '<button aria-label="Open the menu" data-i18n-attr="aria-label:bar.menu">' +
    '<span aria-hidden="true">Menu icon</span></button>',
  '<div class="classlinks"><a href="a.pdf">9A</a><a href="b.pdf">10B</a></div>',
  '<span data-i18n-skip>a.bakr@ais.sch.sa</span>',
  '<!-- a comment written in English -->',
  '<p data-i18n="foot.sign">British Section</p>',
].join('\n');

const GOOD_EN = { 'js.new': 'New' };

const GOOD_UPDATES = [
  {
    id: '2026-09-27-timetables',
    date: '2026-09-26',
    title: 'Revised class timetables',
    titleAr: 'جداول دراسية معدلة',
    text: 'The timetable for Grades 9 to 12 has been revised.',
    textAr: 'تم تعديل الجدول الدراسي للصفوف من 9 إلى 12.',
    href: '#schedule',
    label: 'See the timetables',
    labelAr: 'عرض الجداول',
  },
];

const goodAr = () => ({
  'hero.title': entry('Parent Hub', 'بوابة أولياء الأمور'),
  'hero.lead': entry(LEAD_EN, LEAD_AR),
  'bar.menu': entry('Open the menu', 'فتح القائمة'),
  'foot.sign': entry('British Section', 'القسم البريطاني'),
  'js.new': entry('New', 'جديد'),
});

const good = (over = {}) =>
  page({ body: GOOD_BODY, ar: goodAr(), en: GOOD_EN, updates: GOOD_UPDATES, ...over });

/* The failures that mention a key, for a given rule number. */
const ruleHits = (failures, rule, key) =>
  failures.filter((f) => f.startsWith('i18n ' + rule + ' ') && f.includes(key));

/* ---------- hashing ---------- */

test('hashEn is eight hex characters and ignores whitespace runs', () => {
  assert.match(hashEn('Parent Hub'), /^[0-9a-f]{8}$/);
  assert.equal(hashEn('  Parent \n\t Hub '), hashEn('Parent Hub'));
  assert.notEqual(hashEn('Parent Hub'), hashEn('Parent Hubs'));
  assert.equal(normalise(' a \n b  c '), 'a b c');
});

/* ---------- extraction ---------- */

test('extractKeys returns the innerHTML of nested markup', () => {
  const html = page({
    body: '<p data-i18n="a.p">Read <a href="x.pdf"><strong>this</strong></a>\n   and <em>that</em>.</p>',
  });
  assert.deepEqual(extractKeys(html), [
    {
      key: 'a.p',
      en: 'Read <a href="x.pdf"><strong>this</strong></a> and <em>that</em>.',
      kind: 'html',
    },
  ]);
});

test('extractKeys counts nested tags of the same name to find the close', () => {
  const html = page({
    body: '<div class="card" data-i18n="a.d"><div>one <div>two</div></div> three</div><div>four</div>',
  });
  assert.equal(extractKeys(html)[0].en, '<div>one <div>two</div></div> three');
});

test('extractKeys handles single quotes, any attribute order and void elements', () => {
  const html = page({
    body: [
      "<span class='x' data-i18n='a.s' title=\"a > b\">Hello<br>there <img src='e.png' alt=''></span>",
      "<img alt='School emblem' data-i18n-attr='alt:a.alt' src='e.png'>",
      '<a data-i18n-attr="aria-label:a.aria; title : a.tip" href="#x" title="A tip" aria-label="Go up">↑</a>',
    ].join('\n'),
  });
  assert.deepEqual(extractKeys(html), [
    { key: 'a.s', en: "Hello<br>there <img src='e.png' alt=''>", kind: 'html' },
    { key: 'a.alt', en: 'School emblem', kind: 'attr' },
    { key: 'a.aria', en: 'Go up', kind: 'attr' },
    { key: 'a.tip', en: 'A tip', kind: 'attr' },
  ]);
});

test('extractKeys lists js keys and update notices after the page keys', () => {
  const keys = extractKeys(good());
  assert.deepEqual(keys.map((k) => k.key), [
    'hero.title',
    'hero.lead',
    'bar.menu',
    'foot.sign',
    'js.new',
    'updates.2026-09-27-timetables.title',
    'updates.2026-09-27-timetables.text',
    'updates.2026-09-27-timetables.label',
  ]);
  assert.equal(keys[0].en, 'Parent Hub');
  assert.deepEqual(keys[4], { key: 'js.new', en: 'New', kind: 'js' });
  assert.deepEqual(keys[5], {
    key: 'updates.2026-09-27-timetables.title',
    en: 'Revised class timetables',
    kind: 'update',
  });
});

test('extractKeys lists a repeated key once', () => {
  const html = page({
    body: '<span data-i18n="a.pdf">Open PDF</span><span data-i18n="a.pdf">Open PDF</span>',
  });
  assert.equal(extractKeys(html).length, 1);
});

/* ---------- check: the passing page ---------- */

test('checkAll passes a page whose Arabic is in step', () => {
  assert.deepEqual(checkAll(good()), []);
});

test('checkAll reports a missing i18nAr block once and does not crash', () => {
  const failures = checkAll(page({ body: GOOD_BODY, updates: GOOD_UPDATES }));
  assert.equal(failures.filter((f) => f.includes('i18nAr')).length, 1);
  assert.equal(failures.filter((f) => /^i18n [13567] /.test(f)).length, 0);
});

test('checkAll reports a malformed i18nAr block once', () => {
  const html = good().replace('"hero.title": {', '"hero.title": {,');
  const failures = checkAll(html);
  assert.equal(failures.filter((f) => f.includes('i18nAr')).length, 1);
  assert.match(failures.find((f) => f.includes('i18nAr')), /not valid JSON/);
});

test('checkAll runs on a page with no i18n markup at all', () => {
  const failures = checkAll('<html><body><p>Plain English</p></body></html>');
  assert.ok(failures.some((f) => f.includes('Plain English')));
});

/* ---------- check: one failing fixture per rule ---------- */

test('rule 1: a key on the page with no Arabic fails and names the key', () => {
  const ar = goodAr();
  delete ar['foot.sign'];
  assert.equal(ruleHits(checkAll(good({ ar })), 1, 'foot.sign').length, 1);
});

test('rule 1: an attribute key and a js key with no Arabic fail', () => {
  const ar = goodAr();
  delete ar['bar.menu'];
  delete ar['js.new'];
  const failures = checkAll(good({ ar }));
  assert.equal(ruleHits(failures, 1, 'bar.menu').length, 1);
  assert.equal(ruleHits(failures, 1, 'js.new').length, 1);
});

test('rule 1: an Arabic entry with no key on the page fails and names the key', () => {
  const ar = goodAr();
  ar['hero.gone'] = entry('Gone', 'ذهب');
  const failures = checkAll(good({ ar }));
  assert.equal(ruleHits(failures, 1, 'hero.gone').length, 1);
  assert.equal(failures.length, 1);
});

test('rule 2: one key on two elements with different English fails', () => {
  const body = GOOD_BODY + '\n<p data-i18n="foot.sign">The British Section</p>';
  const failures = checkAll(good({ body }));
  assert.equal(ruleHits(failures, 2, 'foot.sign').length, 1);
});

test('rule 2: one key on two elements with the same English passes', () => {
  const body = GOOD_BODY + '\n<p data-i18n="foot.sign">British\n  Section</p>';
  assert.deepEqual(checkAll(good({ body })), []);
});

test('rule 3: a stale hash fails, names the key and says to run stamp', () => {
  const html = good().replace('>British Section</p>', '>The British Section</p>');
  const hits = ruleHits(checkAll(html), 3, 'foot.sign');
  assert.equal(hits.length, 1);
  assert.match(hits[0], /update the Arabic/);
  assert.match(hits[0], /stamp foot\.sign/);
});

test('rule 4: a keyed element inside a keyed element fails', () => {
  const body = '<div data-i18n="s1.card"><p data-i18n="s1.inner">Inner text</p></div>';
  const ar = {
    's1.card': entry('<p data-i18n="s1.inner">Inner text</p>', '<p data-i18n="s1.inner">نص</p>'),
    's1.inner': entry('Inner text', 'نص'),
  };
  const hits = ruleHits(checkAll(page({ body, ar })), 4, 's1.card');
  assert.equal(hits.length, 1);
  assert.match(hits[0], /s1\.inner/);
});

test('rule 4: an element with an id inside a keyed element fails', () => {
  const body = '<p data-i18n="s1.count">You have <span id="bellCount">3</span> updates</p>';
  const en = 'You have <span id="bellCount">3</span> updates';
  const ar = { 's1.count': entry(en, 'لديكم <span id="bellCount">3</span> تحديثات') };
  const hits = ruleHits(checkAll(page({ body, ar })), 4, 's1.count');
  assert.equal(hits.length, 1);
  assert.match(hits[0], /bellCount/);
});

test('rule 5: a link whose href differs in the Arabic fails', () => {
  const ar = goodAr();
  ar['hero.lead'].ar = LEAD_AR.replace('?v=3', '?v=2');
  const hits = ruleHits(checkAll(good({ ar })), 5, 'hero.lead');
  assert.equal(hits.length, 1);
});

test('rule 5: a tag missing from the Arabic fails', () => {
  const ar = goodAr();
  ar['hero.lead'].ar = LEAD_AR.replace('<strong>6:30</strong>', '6:30');
  assert.equal(ruleHits(checkAll(good({ ar })), 5, 'hero.lead').length, 1);
});

test('rule 5: a differing class, target, rel or download fails', () => {
  const swaps = [
    ['class="btn"', 'class="btn gold"'],
    ['target="_blank"', 'target="_self"'],
    ['rel="noopener"', 'rel="nofollow"'],
    ['rel="noopener"', 'rel="noopener" download'],
  ];
  for (const [from, to] of swaps) {
    const ar = goodAr();
    ar['hero.lead'].ar = LEAD_AR.replace(from, to);
    assert.equal(ruleHits(checkAll(good({ ar })), 5, 'hero.lead').length, 1, to);
  }
});

test('rule 5: a dropped ltr span takes its own closing tag, not the next one', () => {
  const en = '<span class="n">b</span> c <em>d</em>';
  const body = '<p data-i18n="s2.mix">' + en + '</p>';
  const okAr = '<span dir="ltr">a <span class="n">b</span> c <em>d</em></span>';
  assert.deepEqual(checkAll(page({ body, ar: { 's2.mix': entry(en, okAr) } })), []);
  const bdiAr = '<bdi><span class="n">b</span></bdi> c <em>d</em>';
  assert.deepEqual(checkAll(page({ body, ar: { 's2.mix': entry(en, bdiAr) } })), []);
});

test('rule 6: a number missing from the Arabic fails and names the number', () => {
  const ar = goodAr();
  ar['hero.lead'].ar = LEAD_AR.replace('6:30', '6:00');
  const hits = ruleHits(checkAll(good({ ar })), 6, 'hero.lead');
  assert.equal(hits.length, 1);
  assert.match(hits[0], /\b30\b/);
});

test('rule 6: numbers compare as multisets, so a repeated number must repeat', () => {
  const en = 'Periods 1 to 8, then 8 more';
  const body = '<p data-i18n="s3.p">' + en + '</p>';
  const short = { 's3.p': entry(en, 'الحصص من 1 إلى 8') };
  assert.equal(ruleHits(checkAll(page({ body, ar: short })), 6, 's3.p').length, 1);
  const full = { 's3.p': entry(en, 'الحصص من 1 إلى 8 ثم 8 أخرى') };
  assert.deepEqual(checkAll(page({ body, ar: full })), []);
});

test('rule 6: digits inside attributes and entities are not numbers', () => {
  const en = 'Your son&#8217;s <a href="f.pdf?v=12">form</a>';
  const body = '<p data-i18n="s3.q">' + en + '</p>';
  const ar = { 's3.q': entry(en, '<a href="f.pdf?v=12">نموذج</a> ابنكم') };
  assert.deepEqual(checkAll(page({ body, ar })), []);
});

test('rule 6: "nums": false exempts an entry', () => {
  const en = '40 periods';
  const body = '<p data-i18n="s3.g">' + en + '</p>';
  const strict = { 's3.g': entry(en, 'أربعون حصة') };
  assert.equal(ruleHits(checkAll(page({ body, ar: strict })), 6, 's3.g').length, 1);
  const exempt = { 's3.g': entry(en, 'أربعون حصة', { nums: false }) };
  assert.deepEqual(checkAll(page({ body, ar: exempt })), []);
});

test('rule 7: an em dash, an Arabic-Indic digit or a tatweel in the Arabic fails', () => {
  const cases = [
    [EM_DASH, /em dash/],
    [ARABIC_INDIC_3, /Arabic-Indic digit/],
    [TATWEEL, /tatweel/],
  ];
  for (const [ch, what] of cases) {
    const ar = goodAr();
    ar['foot.sign'].ar = 'القسم ' + ch + ' البريطاني';
    const hits = ruleHits(checkAll(good({ ar })), 7, 'foot.sign');
    assert.equal(hits.length, 1);
    assert.match(hits[0], what);
  }
});

test('rule 7: the Arabic of an update notice is checked too', () => {
  const updates = [{ ...GOOD_UPDATES[0], textAr: 'تم تعديل الجدول ' + ARABIC_INDIC_3 }];
  const hits = ruleHits(checkAll(good({ updates })), 7, 'updates.2026-09-27-timetables.text');
  assert.equal(hits.length, 1);
});

test('rule 8: an update with no titleAr or textAr fails and names the entry', () => {
  const { titleAr, textAr, ...rest } = GOOD_UPDATES[0];
  const failures = checkAll(good({ updates: [rest] }));
  assert.equal(ruleHits(failures, 8, 'updates.2026-09-27-timetables.title').length, 1);
  assert.equal(ruleHits(failures, 8, 'updates.2026-09-27-timetables.text').length, 1);
});

test('rule 8: an update with a label and no labelAr fails', () => {
  const { labelAr, ...rest } = GOOD_UPDATES[0];
  const failures = checkAll(good({ updates: [rest] }));
  assert.equal(ruleHits(failures, 8, 'updates.2026-09-27-timetables.label').length, 1);
  assert.equal(failures.length, 1);
});

test('rule 8: an update with no label needs no labelAr', () => {
  const { label, labelAr, href, ...rest } = GOOD_UPDATES[0];
  assert.deepEqual(checkAll(good({ updates: [rest] })), []);
});

test('rule 9: English text outside every keyed element fails and quotes the text', () => {
  const body = GOOD_BODY + '\n<p>Newly added English</p>';
  const failures = checkAll(good({ body }));
  const hits = failures.filter((f) => f.startsWith('i18n 9 '));
  assert.equal(hits.length, 1);
  assert.match(hits[0], /Newly added English/);
  assert.match(hits[0], /line \d+/);
});

test('rule 9: the allow list and single letters pass', () => {
  const body = GOOD_BODY + '\n' + [
    '<span aria-hidden="true">Decorative words</span>',
    '<div data-i18n-skip><b>Mr Ahmed Bakr</b> · IGCSE</div>',
    '<div class="row classlinks"><a href="c.pdf">11A</a></div>',
    '<p>🗓️ · 9 A &rarr; &amp;</p>',
    '<style>.more { content: "English"; }</style>',
  ].join('\n');
  assert.deepEqual(checkAll(good({ body })), []);
});

test('rule 9: text beside a data-i18n-attr element is not covered by it', () => {
  const body = GOOD_BODY + '\n<a href="#top" aria-label="Open the menu" data-i18n-attr="aria-label:bar.menu">Back to top</a>';
  const hits = checkAll(good({ body })).filter((f) => f.startsWith('i18n 9 '));
  assert.equal(hits.length, 1);
  assert.match(hits[0], /Back to top/);
});

/* ---------- merge ---------- */

test('mergeAr writes entries in page order, one per line, with Arabic unescaped', () => {
  const start = page({ body: GOOD_BODY, en: GOOD_EN, updates: GOOD_UPDATES }) ;
  const withBlock = start.replace('<script>\nvar', jsonBlock('i18nAr', {}) + '<script>\nvar');
  const out = mergeAr(withBlock, {
    'js.new': 'جديد',
    'foot.sign': 'القسم البريطاني',
    'hero.title': 'بوابة أولياء الأمور',
    'bar.menu': 'فتح القائمة',
    'hero.lead': LEAD_AR,
  });
  const block = out.match(/<script type="application\/json" id="i18nAr">([\s\S]*?)<\/script>/)[1];
  const lines = block.trim().split('\n');
  assert.equal(lines[0], '{');
  assert.equal(lines[1], '  "hero.title": { "h": "' + hashEn('Parent Hub') + '", "ar": "بوابة أولياء الأمور" },');
  assert.deepEqual(
    lines.slice(1, -1).map((l) => l.match(/^ {2}"([^"]+)"/)[1]),
    ['hero.title', 'hero.lead', 'bar.menu', 'foot.sign', 'js.new']
  );
  assert.equal(lines[lines.length - 1], '}');
  assert.ok(!/\\u[0-9a-fA-F]{4}/.test(block));
  assert.deepEqual(checkAll(out), []);
});

test('mergeAr creates the i18nAr block when the page has none', () => {
  const start = page({ body: '<p data-i18n="a.b">Hello there</p>' });
  const out = mergeAr(start, { 'a.b': 'مرحباً' });
  assert.equal((out.match(/id="i18nAr"/g) || []).length, 1);
  assert.ok(out.indexOf('id="i18nAr"') < out.indexOf('var english'));
  assert.deepEqual(checkAll(out), []);
});

test('mergeAr keeps entries it was not given and keeps their hashes', () => {
  const stale = good().replace('>British Section</p>', '>The British Section</p>');
  const out = mergeAr(stale, { 'hero.title': 'البوابة' });
  const failures = checkAll(out);
  assert.equal(ruleHits(failures, 3, 'foot.sign').length, 1);
  assert.equal(failures.length, 1);
  assert.ok(out.includes('"ar": "البوابة"'));
});

test('mergeAr takes { ar, nums } and keeps an existing nums flag', () => {
  const body = '<p data-i18n="s3.g">Grade 9</p>';
  const first = mergeAr(page({ body }), { 's3.g': { ar: 'الصف التاسع', nums: false } });
  assert.ok(first.includes('"ar": "الصف التاسع", "nums": false }'));
  assert.deepEqual(checkAll(first), []);
  const second = mergeAr(first, { 's3.g': 'الصف التاسع.' });
  assert.ok(second.includes('"ar": "الصف التاسع.", "nums": false }'));
});

test('mergeAr writes update keys into updatesData, not into i18nAr', () => {
  const { titleAr, textAr, labelAr, ...bare } = GOOD_UPDATES[0];
  const start = good({ updates: [bare] });
  const out = mergeAr(start, {
    'updates.2026-09-27-timetables.title': titleAr,
    'updates.2026-09-27-timetables.text': textAr,
    'updates.2026-09-27-timetables.label': labelAr,
  });
  assert.deepEqual(checkAll(out), []);
  const data = JSON.parse(out.match(/id="updatesData">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(Object.keys(data[0]), [
    'id', 'date', 'title', 'titleAr', 'text', 'textAr', 'href', 'label', 'labelAr',
  ]);
  const dict = out.match(/id="i18nAr">([\s\S]*?)<\/script>/)[1];
  assert.ok(!dict.includes('updates.'));
});

test('mergeAr refuses a key that is not on the page and names it', () => {
  assert.throws(() => mergeAr(good(), { 'hero.nope': 'لا' }), /hero\.nope/);
});

test('mergeAr keeps a closing script tag in the Arabic from ending the block', () => {
  const body = '<p data-i18n="a.b">Hello there</p>';
  const out = mergeAr(page({ body }), { 'a.b': 'مرحباً </script> بكم' });
  assert.equal(extractKeys(out).length, 1);
  const block = out.match(/id="i18nAr">([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(block)['a.b'].ar, 'مرحباً </script> بكم');
});

/* ---------- stamp ---------- */

test('stampKeys re-stamps only the named keys', () => {
  const stale = good()
    .replace('>British Section</p>', '>The British Section</p>')
    .replace('>Parent   Hub</h1>', '>The Parent Hub</h1>');
  const out = stampKeys(stale, ['foot.sign']);
  const failures = checkAll(out);
  assert.equal(ruleHits(failures, 3, 'foot.sign').length, 0);
  assert.equal(ruleHits(failures, 3, 'hero.title').length, 1);
});

test('stampKeys with no keys refuses rather than stamping everything', () => {
  assert.throws(() => stampKeys(good(), []), /name the keys/);
  assert.throws(() => stampKeys(good()), /name the keys/);
});

test('stampAll re-stamps every stale entry', () => {
  const stale = good()
    .replace('>British Section</p>', '>The British Section</p>')
    .replace('>Parent   Hub</h1>', '>The Parent Hub</h1>');
  assert.deepEqual(checkAll(stampAll(stale)), []);
});

test('the stamp command with no keys and no --all prints usage and exits 2', () => {
  const tool = fileURLToPath(new URL('./i18n.mjs', import.meta.url));
  const run = spawnSync(process.execPath, [tool, 'stamp'], { encoding: 'utf8' });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /stamp <key>\.\.\. \| stamp --all/);
  const mixed = spawnSync(process.execPath, [tool, 'stamp', '--all', 'hero.title'], { encoding: 'utf8' });
  assert.equal(mixed.status, 2);
});

/* ---------- fix round 1 ---------- */

test('rule 6: a number missing from an update notice fails and names the key', () => {
  const updates = [{ ...GOOD_UPDATES[0], textAr: 'تم تعديل الجدول الدراسي للصفوف من 9 إلى 11.' }];
  const failures = checkAll(good({ updates }));
  const hits = ruleHits(failures, 6, 'updates.2026-09-27-timetables.text');
  assert.equal(hits.length, 1);
  assert.match(hits[0], /\b12\b/);
  assert.match(hits[0], /numsAr/);
  assert.equal(failures.length, 1);
});

test('rule 6: the title and label of an update notice are checked too', () => {
  const updates = [{
    ...GOOD_UPDATES[0],
    title: 'Revised timetables from 27 September',
    label: 'See all 11 timetables',
  }];
  const failures = checkAll(good({ updates }));
  assert.equal(ruleHits(failures, 6, 'updates.2026-09-27-timetables.title').length, 1);
  assert.equal(ruleHits(failures, 6, 'updates.2026-09-27-timetables.label').length, 1);
});

test('rule 6: "numsAr": false exempts an update notice', () => {
  const updates = [{ ...GOOD_UPDATES[0], textAr: 'تم تعديل الجدول الدراسي.', numsAr: false }];
  assert.deepEqual(checkAll(good({ updates })), []);
});

test('a missing updatesData block is reported once', () => {
  const html = good().replace(/<script type="application\/json" id="updatesData">[\s\S]*?<\/script>\n/, '');
  const failures = checkAll(html);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /^i18n block: the updatesData block is missing/);
});

test('an updatesData block that is not valid JSON or not an array is reported', () => {
  const broken = checkAll(good().replace('"id": "2026-09-27-timetables",', '"id": ,'));
  assert.equal(broken.length, 1);
  assert.match(broken[0], /^i18n block: the updatesData block is not valid JSON/);
  const object = checkAll(good({ updates: { id: 'x' } }));
  assert.equal(object.length, 1);
  assert.match(object[0], /updatesData block .* must be an array/);
});

test('rule 8: an update entry with no id fails and gives its position', () => {
  const { id, ...noId } = GOOD_UPDATES[0];
  const failures = checkAll(good({ updates: [GOOD_UPDATES[0], noId, 'loose text'] }));
  assert.deepEqual(failures, [
    'i18n 8 updates: entry 2 of updatesData has no id, so its Arabic cannot be checked',
    'i18n 8 updates: entry 3 of updatesData has no id, so its Arabic cannot be checked',
  ]);
});

test('rule 9: a read attribute with no data-i18n-attr pair fails, naming attribute and line', () => {
  const cases = [
    ['<button aria-label="Close the list">✕</button>', 'aria-label', 'Close the list'],
    ['<img src="e.png" alt="School emblem">', 'alt', 'School emblem'],
    ['<a href="#top" title="Back to top">↑</a>', 'title', 'Back to top'],
    ['<input type="search" placeholder="Search here">', 'placeholder', 'Search here'],
  ];
  for (const [markup, attr, value] of cases) {
    const failures = checkAll(good({ body: GOOD_BODY + '\n' + markup }));
    assert.equal(failures.length, 1, attr);
    assert.match(failures[0], /^i18n 9 unkeyed: line \d+: /);
    assert.ok(failures[0].includes(attr + '="' + value + '"'), failures[0]);
  }
});

test('rule 9: a pair must name that attribute, not just any attribute', () => {
  const body = GOOD_BODY + '\n<a href="#top" aria-label="Open the menu" title="Back to top" ' +
    'data-i18n-attr="aria-label:bar.menu">↑</a>';
  const failures = checkAll(good({ body }));
  assert.equal(failures.length, 1);
  assert.ok(failures[0].includes('title="Back to top"'));
});

test('rule 9: a keyed element still needs a pair for its own attribute', () => {
  const body = GOOD_BODY + '\n<p data-i18n="foot.sign" title="Signed by us">British Section</p>';
  const failures = checkAll(good({ body }));
  assert.equal(failures.length, 1);
  assert.ok(failures[0].includes('title="Signed by us"'));
});

test('rule 9: attributes that are excused or hold under two Latin letters pass', () => {
  const body = GOOD_BODY + '\n' + [
    '<img src="e.png" alt="">',
    '<img src="e.png" alt="A">',
    '<img src="e.png" alt="School emblem" aria-hidden="true">',
    '<div data-i18n-skip><img src="p.png" alt="Mr Ahmed Bakr"></div>',
    '<div aria-hidden="true"><img src="e.png" alt="School emblem"></div>',
  ].join('\n');
  assert.deepEqual(checkAll(good({ body })), []);
  /* Inside a keyed element the Arabic string carries the attribute. */
  const en = 'See <a href="#m" title="The mentors list">the list</a>';
  const ar = { 's5.m': entry(en, 'انظر <a href="#m" title="قائمة الرواد">القائمة</a>') };
  assert.deepEqual(checkAll(page({ body: '<p data-i18n="s5.m">' + en + '</p>', ar })), []);
});

test('rule 9: the classlinks pills excuse their text but not their attributes', () => {
  const body = GOOD_BODY + '\n<div class="classlinks"><a href="c.pdf" aria-label="Class 11A timetable">11A</a></div>';
  const failures = checkAll(good({ body }));
  assert.equal(failures.length, 1);
  assert.ok(failures[0].includes('aria-label="Class 11A timetable"'));
});

test('rule 1: an i18nAr entry that is not an object fails and names the key', () => {
  const ar = goodAr();
  ar['foot.sign'] = 'القسم البريطاني';
  const failures = checkAll(good({ ar }));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /^i18n 1 malformed: foot\.sign /);
});

test('merge and stamp never discard the Arabic of a malformed entry', () => {
  const ar = goodAr();
  ar['foot.sign'] = 'القسم البريطاني';
  const stale = good({ ar }).replace('>Parent   Hub</h1>', '>The Parent Hub</h1>');
  const line = '  "foot.sign": "القسم البريطاني"';
  assert.ok(mergeAr(stale, { 'hero.title': 'البوابة' }).includes(line));
  assert.ok(stampKeys(stale, ['hero.title']).includes(line));
  assert.ok(stampAll(stale).includes(line));
  assert.throws(() => stampKeys(stale, ['foot.sign']), /foot\.sign/);
});

test('merge and stamp keep fields of an entry they do not know', () => {
  const ar = goodAr();
  ar['foot.sign'].note = 'checked by the school';
  const out = stampAll(good({ ar }).replace('>British Section</p>', '>The British Section</p>'));
  assert.ok(out.includes('"ar": "القسم البريطاني", "note": "checked by the school" }'));
  assert.deepEqual(checkAll(out), []);
});

test('mergeAr keeps the other fields of an entry it is given new Arabic for', () => {
  const ar = goodAr();
  ar['foot.sign'].note = 'checked by the school';
  ar['foot.sign'].nums = false;
  const out = mergeAr(good({ ar }), { 'foot.sign': 'القسم البريطاني.' });
  assert.ok(out.includes(
    '"ar": "القسم البريطاني.", "note": "checked by the school", "nums": false }'
  ));
  assert.deepEqual(checkAll(out), []);
  /* An explicit nums: true lifts the exemption and nothing else. */
  const lifted = mergeAr(out, { 'foot.sign': { ar: 'القسم البريطاني', nums: true } });
  assert.ok(lifted.includes('"ar": "القسم البريطاني", "note": "checked by the school" }'));
});

/* ---------- fix round 2 ---------- */

const TIP_EN = 'See <a href="#m" title="The mentors list">the list</a> and ' +
  '<img src="e.png" alt="School emblem">';
const tipPage = (arabic) => page({
  body: '<p data-i18n="s5.m">' + TIP_EN + '</p>',
  ar: { 's5.m': entry(TIP_EN, arabic) },
});

test('rule 9: an English attribute left inside an Arabic string fails, naming key and attribute', () => {
  const failures = checkAll(tipPage(
    'انظر <a href="#m" title="The mentors list">القائمة</a> و<img src="e.png" alt="شعار المدرسة">'
  ));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /^i18n 9 unkeyed: s5\.m /);
  assert.ok(failures[0].includes('title="The mentors list"'), failures[0]);
});

test('rule 9: each of the four read attributes is checked inside the Arabic', () => {
  for (const attr of ['aria-label', 'alt', 'title', 'placeholder']) {
    const en = 'Type <input ' + attr + '="Your name"> here';
    const html = page({
      body: '<p data-i18n="s5.f">' + en + '</p>',
      ar: { 's5.f': entry(en, 'اكتب <input ' + attr + '="Your name"> هنا') },
    });
    const failures = checkAll(html);
    assert.equal(failures.length, 1, attr);
    assert.ok(failures[0].startsWith('i18n 9 unkeyed: s5.f '), failures[0]);
    assert.ok(failures[0].includes(attr + '="Your name"'), failures[0]);
  }
});

test('rule 9: translated or short attributes inside the Arabic pass', () => {
  assert.deepEqual(checkAll(tipPage(
    'انظر <a href="#m" title="قائمة الرواد">القائمة</a> و<img src="e.png" alt="شعار A">'
  )), []);
});

test('rule 9: data-i18n-skip or aria-hidden inside the Arabic excuses a Latin attribute', () => {
  const en = 'Sign in to <span data-i18n-skip><img src="s.png" alt="Schoology"></span>' +
    '<img src="d.png" alt="Decorative dots" aria-hidden="true">';
  const arabic = 'سجلوا الدخول إلى <span data-i18n-skip><img src="s.png" alt="Schoology"></span>' +
    '<img src="d.png" alt="Decorative dots" aria-hidden="true">';
  const html = page({ body: '<p data-i18n="s5.s">' + en + '</p>', ar: { 's5.s': entry(en, arabic) } });
  assert.deepEqual(checkAll(html), []);
});

test('markup: an empty data-i18n key fails and gives the line', () => {
  const failures = checkAll(good({ body: GOOD_BODY + '\n<p data-i18n="">British Section</p>' }));
  assert.equal(failures.filter((f) => /^i18n markup: line \d+: <p> has an empty data-i18n/.test(f)).length, 1);
});

test('markup: a data-i18n on a void element fails and names the key', () => {
  const failures = checkAll(good({ body: GOOD_BODY + '\n<br data-i18n="s6.void">' }));
  const hits = failures.filter((f) => f.startsWith('i18n markup: s6.void'));
  assert.equal(hits.length, 1);
  assert.match(hits[0], /void or never closes/);
});

test('markup: a data-i18n-attr naming an absent attribute fails and names the key', () => {
  const body = GOOD_BODY + '\n<a href="#top" data-i18n-attr="aria-label:s6.up">↑</a>';
  const failures = checkAll(good({ body }));
  const hits = failures.filter((f) => f.startsWith('i18n markup: s6.up'));
  assert.equal(hits.length, 1);
  assert.match(hits[0], /has no aria-label attribute/);
});

test('markup: a data-i18n-attr that is not attribute:key pairs fails', () => {
  const body = GOOD_BODY + '\n<a href="#top" data-i18n-attr="s6.up">↑</a>';
  const failures = checkAll(good({ body }));
  assert.equal(failures.filter((f) => /^i18n markup: line \d+: data-i18n-attr needs/.test(f)).length, 1);
});

test('a malformed i18nEn block is reported once', () => {
  const html = good().replace('"js.new": "New"', '"js.new": "New",');
  const failures = checkAll(html);
  const hits = failures.filter((f) => f.startsWith('i18n block: the i18nEn block is not valid JSON'));
  assert.equal(hits.length, 1);
  const array = checkAll(good({ en: ['New'] }));
  assert.equal(array.filter((f) => f.includes('i18nEn block')).length, 1);
});

test('stampKeys refuses a key with no Arabic entry and names it', () => {
  assert.throws(() => stampKeys(good(), ['hero.nope']), /hero\.nope/);
});

/* ---------- pairs ---------- */

test('buildPairs writes one table per section prefix in both formats', () => {
  const ar = goodAr();
  delete ar['foot.sign'];
  const { html, md } = buildPairs(good({ ar }));
  for (const prefix of ['hero', 'bar', 'foot', 'js', 'updates']) {
    assert.ok(html.includes('<h2>' + prefix + '</h2>'), prefix);
    assert.ok(md.includes('## ' + prefix + '\n'), prefix);
  }
  assert.equal((html.match(/<table/g) || []).length, 5);
  assert.ok(md.includes('| Key | English | Arabic |'));
});

test('buildPairs shows inline tags as rendered text and marks the Arabic cell', () => {
  const { html, md } = buildPairs(good());
  assert.ok(html.includes('Open the timetable for 9A by 6:30.'));
  assert.ok(html.includes('<td dir="rtl" lang="ar">افتح جدول 9A قبل 6:30.</td>'));
  assert.ok(!html.includes('assets/t.pdf'));
  assert.ok(html.includes('Cairo'));
  assert.ok(md.includes('| `hero.lead` | Open the timetable for 9A by 6:30. | افتح جدول 9A قبل 6:30. |'));
  assert.ok(html.includes('جداول دراسية معدلة'));
});

test('buildPairs marks a missing Arabic cell visibly', () => {
  const ar = goodAr();
  delete ar['foot.sign'];
  const { html, md } = buildPairs(good({ ar }));
  assert.match(html, /<td class="missing"[^>]*>Missing<\/td>/);
  assert.ok(md.includes('| `foot.sign` | British Section | **MISSING** |'));
  const clean = buildPairs(good());
  assert.ok(!/<td class="missing"/.test(clean.html));
});

/* ---------- house rules ---------- */

test('the generated review files hold no em dash', () => {
  const { html, md } = buildPairs(good());
  assert.ok(!html.includes(EM_DASH));
  assert.ok(!md.includes(EM_DASH));
});

/* ---------- number words ---------- */

/* The rule 6 failures for one key whose English and Arabic are given. */
const numberFailures = (en, arabic) => {
  const html = page({ body: '<p data-i18n="n.k">' + en + '</p>', ar: { 'n.k': entry(en, arabic) } });
  const failures = checkAll(html);
  assert.deepEqual(failures.filter((f) => !f.startsWith('i18n 6 ')), []);
  return failures;
};

test('number words: an ordinal satisfies its digit', () => {
  assert.deepEqual(numberFailures('Grade 9', 'الصف التاسع'), []);
  assert.deepEqual(numberFailures('Quarter 1', 'الربع الأول'), []);
});

test('number words: the compound for 12 counts as 12 and not also as 2', () => {
  assert.deepEqual(numberFailures('Grade 12', 'الصف الثاني عشر'), []);
  const both = numberFailures('Grade 12 and Grade 2', 'الصف الثاني عشر');
  assert.equal(both.length, 1);
  assert.match(both[0], /n\.k has Arabic that lacks 2;/);
  assert.deepEqual(numberFailures('Grade 12 and Grade 2', 'الصف الثاني عشر والصف الثاني'), []);
});

test('number words: 11 in its three forms', () => {
  for (const arabic of ['الصف الحادي عشر', 'الحصة الحادية عشرة', 'أحد عشر صفاً']) {
    assert.deepEqual(numberFailures('Number 11', arabic), [], arabic);
  }
  assert.equal(numberFailures('Number 1 of 10', 'الحادي عشر').length, 1);
});

test('number words: 12 in its forms', () => {
  for (const arabic of ['الثانية عشرة', 'اثنا عشر صفاً', 'اثني عشر صفاً']) {
    assert.deepEqual(numberFailures('Number 12', arabic), [], arabic);
  }
});

test('number words: another number in the same string is still protected', () => {
  const failures = numberFailures('Grade 9 classwork is 6 marks', 'أعمال الصف للصف التاسع بالدرجات');
  assert.equal(failures.length, 1);
  assert.match(failures[0], /lacks 6;/);
  assert.deepEqual(numberFailures('Grade 9 classwork is 6 marks', 'أعمال الصف للصف التاسع 6 درجات'), []);
  assert.deepEqual(numberFailures('Grade 9 classwork is 6 marks', 'أعمال الصف للصف التاسع ست درجات'), []);
});

test('number words: the wrong ordinal fails', () => {
  const failures = numberFailures('Grade 9', 'الصف العاشر');
  assert.equal(failures.length, 1);
  assert.match(failures[0], /lacks 9;/);
});

test('number words: feminine, indefinite and cardinal forms', () => {
  const cases = [
    ['Period 1', 'الحصة الأولى'],
    ['Period 1', 'الحصة الاولى'],
    ['Period 1', 'أول حصة'],
    ['1 form', 'نموذج واحد'],
    ['1 page', 'صفحة واحدة'],
    ['Period 2', 'الحصة الثانية'],
    ['2 forms', 'نموذجان اثنان'],
    ['2 forms', 'في اثنين منها'],
    ['Period 3', 'الحصة الثالثة'],
    ['3 periods', 'ثلاث حصص'],
    ['3 days', 'ثلاثة أيام'],
    ['Grade 4', 'الرابع'],
    ['4 periods', 'أربع حصص'],
    ['5 days', 'خمسة أيام'],
    ['Period 5', 'الحصة الخامسة'],
    ['6 marks', 'ست درجات'],
    ['Period 7', 'السابعة'],
    ['8 periods', 'ثماني حصص'],
    ['Period 8', 'الحصة الثامنة'],
    ['Grade 10', 'الصف العاشر'],
    ['10 marks', 'عشر درجات'],
    ['10 days', 'عشرة أيام'],
  ];
  for (const [en, arabic] of cases) assert.deepEqual(numberFailures(en, arabic), [], arabic);
});

test('number words: diacritics and attached prefixes do not hide a word', () => {
  assert.deepEqual(numberFailures('Grade 9', 'الصفّ التاسعِ'), []);
  assert.deepEqual(numberFailures('Grades 9 and 10', 'الصفان التاسع والعاشر'), []);
  assert.deepEqual(numberFailures('For Grade 9', 'للتاسع'), []);
  assert.deepEqual(numberFailures('In Period 1', 'بالأولى'), []);
});

test('number words: each word satisfies one missing number, as a multiset', () => {
  assert.equal(numberFailures('Grade 9 and Grade 9', 'الصف التاسع').length, 1);
  assert.deepEqual(numberFailures('Grade 9 and Grade 9', 'الصف التاسع ثم التاسع'), []);
  assert.deepEqual(numberFailures('Grade 9 and Grade 9', 'الصف التاسع ثم 9'), []);
});

test('number words: no word is accepted above 12, and teens are not split', () => {
  assert.equal(numberFailures('13 students', 'ثلاثة عشر طالباً').length, 1);
  const split = numberFailures('3 of 10', 'ثلاثة عشر');
  assert.equal(split.length, 1);
  assert.match(split[0], /lacks 3, 10;/);
  assert.equal(numberFailures('40 periods', 'أربعون حصة').length, 1);
  assert.equal(numberFailures('20 marks', 'عشرون درجة').length, 1);
});

test('number words: a word inside a longer word does not count', () => {
  assert.equal(numberFailures('6 marks', 'ستة').length, 0);
  assert.equal(numberFailures('6 marks', 'مستوى الدرجات').length, 1);
  assert.equal(numberFailures('10 marks', 'عشرات الدرجات').length, 1);
});

test('number words: a digit with a leading zero must stay digits', () => {
  assert.equal(numberFailures('At 09:05', 'في التاسعة والخامسة').length, 1);
});

test('number words: an update notice is satisfied by a word, and still protected', () => {
  const base = {
    ...GOOD_UPDATES[0],
    text: 'Boys in Grade 9 can apply until 16 September.',
  };
  const ok = [{ ...base, textAr: 'يمكن لطلاب الصف التاسع التقديم حتى 16 سبتمبر.' }];
  assert.deepEqual(checkAll(good({ updates: ok })), []);
  const bad = [{ ...base, textAr: 'يمكن لطلاب الصف التاسع التقديم حتى سبتمبر.' }];
  const failures = checkAll(good({ updates: bad }));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /^i18n 6 numbers: updates\.2026-09-27-timetables\.text .* lacks 16;/);
});

test('number words: nums false and numsAr false still exempt', () => {
  const en = '40 periods';
  const html = page({
    body: '<p data-i18n="n.k">' + en + '</p>',
    ar: { 'n.k': entry(en, 'أربعون حصة', { nums: false }) },
  });
  assert.deepEqual(checkAll(html), []);
  const updates = [{ ...GOOD_UPDATES[0], textAr: 'تم تعديل الجدول الدراسي.', numsAr: false }];
  assert.deepEqual(checkAll(good({ updates })), []);
});
