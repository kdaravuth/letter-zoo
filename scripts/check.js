'use strict';
/* Letter Zoo checks: run with `npm test`.
   1. Every JavaScript file is valid.
   2. public/letters.js has all 52 letters, an animal, sound, treat and player buddy for A-Z,
      and the player word lists match server.js.
   3. The server starts, serves the app, refuses path tricks and says clearly when no database is set. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');
const { spawn, execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let failures = 0;
function ok(cond, msg) {
  if (cond) console.log('  ok   ' + msg);
  else { failures++; console.log('  FAIL ' + msg); }
}

// 1. Syntax
console.log('JavaScript syntax');
['server.js', 'public/app.js', 'public/letters.js', 'public/sw.js', 'public/design-theme.js', 'scripts/check.js'].forEach((f) => {
  try { execFileSync(process.execPath, ['--check', path.join(ROOT, f)], { stdio: 'pipe' }); ok(true, f); }
  catch (e) { ok(false, f + '\n' + String(e.stderr || e.message)); }
});

// 2. Letter and animal data
console.log('Letters and animals');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'public/letters.js'), 'utf8'), sandbox);
const W = sandbox.window;
const PATH_OR_DOT = /^(M[\d\s.,MLHVCSQTAZmlhvcsqtaz-]+|dot:\d+(\.\d+)?,\d+(\.\d+)?)$/;
ALPHA.forEach((L) => {
  const up = W.LETTERS && W.LETTERS.upper[L];
  const lo = W.LETTERS && W.LETTERS.lower[L.toLowerCase()];
  const strokesOk = (s) => Array.isArray(s) && s.length > 0 && s.every((d) => typeof d === 'string' && PATH_OR_DOT.test(d.trim()));
  if (!strokesOk(up)) ok(false, 'capital ' + L + ' has valid strokes');
  if (!strokesOk(lo)) ok(false, 'small ' + L.toLowerCase() + ' has valid strokes');
  if (!(W.ANIMALS && W.ANIMALS[L] && W.ANIMALS[L].name && W.ANIMALS[L].emoji)) ok(false, L + ' has an animal');
  if (!(W.ANIMAL_EXTRA && W.ANIMAL_EXTRA[L] && ['land', 'water', 'sky'].includes(W.ANIMAL_EXTRA[L].home) && W.ANIMAL_EXTRA[L].sound)) ok(false, L + ' has a home and a sound');
  if (!(W.ANIMAL_TREATS && Array.isArray(W.ANIMAL_TREATS[L]) && W.ANIMAL_TREATS[L].length === 2)) ok(false, L + ' has a treat');
  if (!(W.PLAYER_BUDDY && W.PLAYER_BUDDY[L])) ok(false, L + ' has a player buddy name');
});
ok(failures === 0, 'all 52 letters have strokes, animals, sounds, treats and buddies');
const server = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const adj = (server.match(/const ADJ = (\[[^\]]+\])/) || [])[1];
const buddy = (server.match(/const BUDDY = (\{[^}]+\})/) || [])[1];
ok(adj && JSON.stringify(vm.runInNewContext(adj)) === JSON.stringify(W.PLAYER_WORDS), 'PLAYER_WORDS in letters.js matches ADJ in server.js');
ok(buddy && JSON.stringify(vm.runInNewContext('(' + buddy + ')')) === JSON.stringify(W.PLAYER_BUDDY), 'PLAYER_BUDDY in letters.js matches BUDDY in server.js');

// 3. The server
console.log('Server');
const PORT = 3000 + Math.floor(Math.random() * 1000);
const env = Object.assign({}, process.env, { PORT: String(PORT) });
delete env.TURSO_DATABASE_URL; delete env.TURSO_AUTH_TOKEN; delete env.VOICE_ADMIN_CODE;
const child = spawn(process.execPath, [path.join(ROOT, 'server.js')], { env, stdio: 'pipe' });
function get(p) {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port: PORT, path: p }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve({ status: res.statusCode, type: res.headers['content-type'] || '', body }));
    });
    req.on('error', () => resolve({ status: 0, type: '', body: '' }));
  });
}
async function waitUp() {
  for (let i = 0; i < 50; i++) {
    if ((await get('/')).status === 200) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}
(async () => {
  try {
    ok(await waitUp(), 'server starts');
    const home = await get('/');
    ok(home.status === 200 && /Letter Zoo/.test(home.body), 'home page loads');
    ok((await get('/app.js')).type.startsWith('text/javascript'), 'app.js is served as JavaScript');
    ok((await get('/letters.js')).status === 200, 'letters.js is served');
    const sneaky = await get('/../server.js');
    ok(!/require\('http'\)/.test(sneaky.body), 'server code cannot be downloaded');
    const stats = await get('/api/stats');
    ok(stats.status === 503 && /database/.test(stats.body), 'without a database the API says so clearly');
  } finally {
    child.kill();
  }
  console.log(failures ? '\n' + failures + ' check(s) failed' : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
})();
