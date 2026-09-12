#!/usr/bin/env node
/* Mobile-viewport overflow check and screenshot for the Parent Hub.
   Zero dependencies: drives headless Chrome over the DevTools Protocol
   using Node's built-in WebSocket and fetch. No npm install, no
   package.json.

   Unlike a plain `--window-size=380` screenshot, this sets a real device
   metrics override, so the page reflows at 380px instead of being laid
   out wide and cropped. See CLAUDE.md.

   Run: node tools/shot.mjs */

import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WIDTH = 380;
const HEIGHT = 1200;
const DEVICE_SCALE_FACTOR = 2;

const STARTUP_TIMEOUT_MS = 10000;
const NAV_TIMEOUT_MS = 15000;
const HARD_TIMEOUT_MS = 30000;
const CDP_CALL_TIMEOUT_MS = 10000; /* per CDP round trip, so a stuck call fails on its own rather than only via the hard timeout */
const SETTLE_MS = 500; /* let webfonts and inline JS finish after load */

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = join(root, 'index.html');
const pageUrl = 'file://' + indexPath;
const outDir = join(process.env.TMPDIR || '/tmp', 'hub-check');
const outPng = join(outDir, 'w380.png');

/* The overflow probe, run inside the page. Returns a JSON string rather
   than an object because Runtime.evaluate's returnByValue only round-trips
   plain serialisable values reliably across the protocol boundary. */
const OVERFLOW_SCRIPT = `
(() => {
  const de = document.documentElement;
  const clientWidth = de.clientWidth;
  const offenders = [];
  for (const el of document.querySelectorAll('*')) {
    const rect = el.getBoundingClientRect();
    if (rect.right > clientWidth + 0.5) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        cls: el.getAttribute('class') || null,
        right: Math.round(rect.right),
        width: Math.round(rect.width)
      });
    }
  }
  offenders.sort((a, b) => b.right - a.right);
  return JSON.stringify({
    scrollWidth: de.scrollWidth,
    clientWidth,
    innerWidth: window.innerWidth,
    offenders: offenders.slice(0, 10)
  });
})()
`;

let chromeProc = null;
let profileDir = null;
let ws = null;
let cleanupPromise = null;
let syncCleanedUp = false;

/* Kill chrome and remove its profile directory. Waits for chrome's own
   process to be reaped before removing the directory, then retries the
   removal a few times: chrome is multi-process (GPU, renderer, utility),
   and a helper process that outlives the main one by a few hundred ms can
   still be holding a file in the profile directory open, which would
   otherwise make rmSync fail silently and leak the directory. */
async function doCleanup() {
  try { ws?.close(); } catch { /* already closed */ }
  if (chromeProc && chromeProc.exitCode === null && chromeProc.signalCode === null) {
    const exited = new Promise((resolve) => chromeProc.once('exit', resolve));
    try { chromeProc.kill('SIGKILL'); } catch { /* already dead */ }
    await Promise.race([exited, sleep(3000)]);
  }
  if (profileDir) {
    try { rmSync(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }); } catch { /* best effort */ }
  }
}

/* cleanup() has four call sites: the SIGINT handler, the SIGTERM handler,
   the main try/finally, and the hard-timeout watchdog. Any two of these
   can fire close together (for example a SIGINT arriving while the
   watchdog is already mid-cleanup). Memoising the promise, rather than
   guarding with a plain boolean, means every caller awaits the SAME
   completion instead of the second caller seeing "already done" and
   calling process.exit() while the first caller's rmSync is still
   in flight. */
function cleanup() {
  if (!cleanupPromise) cleanupPromise = doCleanup();
  return cleanupPromise;
}

/* Last-resort synchronous net for a true process 'exit' event, which
   cannot await anything. Every normal path (success, error, timeout,
   signal) goes through the async cleanup() above instead; this only
   matters if something exits the process without having awaited it. */
function cleanupSync() {
  if (syncCleanedUp) return;
  syncCleanedUp = true;
  try { ws?.close(); } catch { /* already closed */ }
  try { chromeProc?.kill('SIGKILL'); } catch { /* already dead */ }
  if (profileDir) {
    try { rmSync(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }); } catch { /* best effort */ }
  }
}

process.on('exit', cleanupSync);
process.on('SIGINT', async () => { await cleanup(); process.exit(1); });
process.on('SIGTERM', async () => { await cleanup(); process.exit(1); });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function timeoutAfter(ms, label) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('timed out waiting for ' + label)), ms);
  });
}

function chromeExitedEarly() {
  return new Promise((_, reject) => {
    chromeProc.once('error', (err) => reject(new Error('chrome failed to launch: ' + err.message)));
    chromeProc.once('exit', (code, signal) => {
      reject(new Error('chrome exited early (code=' + code + ' signal=' + signal + ')'));
    });
  });
}

function waitForDevtoolsPort() {
  const portFile = join(profileDir, 'DevToolsActivePort');
  return new Promise((resolve) => {
    const tick = () => {
      if (existsSync(portFile)) {
        const port = Number(readFileSync(portFile, 'utf8').split('\n')[0]);
        if (Number.isInteger(port) && port > 0) {
          resolve(port);
          return;
        }
      }
      setTimeout(tick, 100);
    };
    tick();
  });
}

async function waitForBrowserWsUrl(port) {
  return new Promise((resolve) => {
    const tick = async () => {
      try {
        const res = await fetch('http://127.0.0.1:' + port + '/json/version');
        if (res.ok) {
          const json = await res.json();
          if (json.webSocketDebuggerUrl) {
            resolve(json.webSocketDebuggerUrl);
            return;
          }
        }
      } catch { /* chrome not listening yet */ }
      setTimeout(tick, 100);
    };
    tick();
  });
}

async function main() {
  if (!existsSync(CHROME)) {
    console.log('FAIL chrome not found at ' + CHROME);
    return 1;
  }
  if (!existsSync(indexPath)) {
    console.log('FAIL index.html not found at ' + indexPath);
    return 1;
  }

  /* Its own profile directory under the system temp dir, unique per run,
     and its own port (0 means "pick a free one"), so nothing clashes with
     another instance of this script or an interactive Chrome. */
  profileDir = mkdtempSync(join(tmpdir(), 'hub-shot-profile-'));

  chromeProc = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--remote-debugging-port=0',
      '--user-data-dir=' + profileDir,
      'about:blank'
    ],
    { stdio: 'ignore' }
  );

  const died = chromeExitedEarly();
  const port = await Promise.race([
    waitForDevtoolsPort(),
    died,
    timeoutAfter(STARTUP_TIMEOUT_MS, 'the chrome devtools port file')
  ]);
  const wsUrl = await Promise.race([
    waitForBrowserWsUrl(port),
    died,
    timeoutAfter(STARTUP_TIMEOUT_MS, 'the chrome devtools websocket url')
  ]);

  ws = new WebSocket(wsUrl);
  await Promise.race([
    new Promise((resolve, reject) => {
      ws.addEventListener('open', () => resolve(), { once: true });
      ws.addEventListener('error', () => reject(new Error('devtools websocket error')), { once: true });
    }),
    died,
    timeoutAfter(STARTUP_TIMEOUT_MS, 'the devtools websocket to open')
  ]);

  let msgId = 0;
  const pending = new Map();
  const eventListeners = new Set();
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method) {
      for (const listener of eventListeners) listener(msg);
    }
  });

  function send(method, params, sessionId) {
    return new Promise((resolve, reject) => {
      const id = ++msgId;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error('timed out waiting for a CDP response to ' + method));
      }, CDP_CALL_TIMEOUT_MS);
      pending.set(id, {
        resolve: (result) => { clearTimeout(timer); resolve(result); },
        reject: (err) => { clearTimeout(timer); reject(err); }
      });
      const payload = { id, method, params: params || {} };
      if (sessionId) payload.sessionId = sessionId;
      ws.send(JSON.stringify(payload));
    });
  }

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const s = (method, params) => send(method, params, sessionId);

  await s('Page.enable');
  await s('Runtime.enable');
  await s('Emulation.setDeviceMetricsOverride', {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    mobile: true
  });

  const loadFired = new Promise((resolve) => {
    const onMessage = (msg) => {
      if (msg.method === 'Page.loadEventFired' && msg.sessionId === sessionId) {
        eventListeners.delete(onMessage);
        resolve();
      }
    };
    eventListeners.add(onMessage);
  });

  await s('Page.navigate', { url: pageUrl });
  await Promise.race([loadFired, died, timeoutAfter(NAV_TIMEOUT_MS, 'the page load event')]);
  await sleep(SETTLE_MS);

  const evalResult = await s('Runtime.evaluate', {
    expression: OVERFLOW_SCRIPT,
    returnByValue: true
  });
  if (evalResult.exceptionDetails) {
    throw new Error('overflow probe threw: ' + evalResult.exceptionDetails.text);
  }
  const measured = JSON.parse(evalResult.result.value);

  const metrics = await s('Page.getLayoutMetrics');
  const contentSize = metrics.cssContentSize || metrics.contentSize;
  const contentHeight = Math.max(HEIGHT, Math.ceil(contentSize.height));

  const shot = await s('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: WIDTH, height: contentHeight, scale: 1 }
  });
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPng, Buffer.from(shot.data, 'base64'));

  console.log('ok   screenshot written: ' + outPng);
  console.log(
    'ok   measured scrollWidth=' + measured.scrollWidth +
    ' clientWidth=' + measured.clientWidth +
    ' innerWidth=' + measured.innerWidth
  );

  if (measured.scrollWidth > measured.clientWidth) {
    console.log(
      'FAIL horizontal overflow: scrollWidth ' + measured.scrollWidth +
      'px exceeds clientWidth ' + measured.clientWidth + 'px'
    );
    for (const o of measured.offenders) {
      const idPart = o.id ? ' id="' + o.id + '"' : '';
      const clsPart = o.cls ? ' class="' + o.cls + '"' : '';
      console.log('FAIL   <' + o.tag + idPart + clsPart + '> right edge ' + o.right + 'px, width ' + o.width + 'px');
    }
    return 1;
  }

  console.log('ok   no horizontal overflow at ' + WIDTH + 'px width');
  return 0;
}

const watchdog = setTimeout(async () => {
  console.log('FAIL hard timeout after ' + HARD_TIMEOUT_MS + 'ms; aborting');
  await cleanup();
  process.exit(1);
}, HARD_TIMEOUT_MS);

let exitCode = 1;
try {
  exitCode = await main();
} catch (err) {
  console.log('FAIL ' + err.message);
  exitCode = 1;
} finally {
  clearTimeout(watchdog);
  await cleanup();
}
process.exit(exitCode);
