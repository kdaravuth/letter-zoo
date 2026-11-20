'use strict';
/* Letter Zoo server: serves the app (public/) and keeps anonymous counts in the Turso database.
   No names, no IP addresses: only a random id made in the browser, the browser's time zone (a city)
   and the country the visit came from. */
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 80;
const PUB = path.join(__dirname, 'public');
const DB_URL = (process.env.TURSO_DATABASE_URL || '').replace(/^libsql:\/\//, 'https://');
const DB_TOKEN = process.env.TURSO_AUTH_TOKEN || '';
const ADMIN_CODE = process.env.VOICE_ADMIN_CODE || '';
const CLIP_KEY = /^(cap|small|word|sound):[A-Z]$/;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.ico': 'image/x-icon'
};

const TZ_COUNTRY = {
  'Asia/Phnom_Penh': 'KH', 'Asia/Bangkok': 'TH', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Saigon': 'VN', 'Asia/Vientiane': 'LA',
  'Asia/Yangon': 'MM', 'Asia/Rangoon': 'MM', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Kuching': 'MY', 'Asia/Singapore': 'SG',
  'Asia/Jakarta': 'ID', 'Asia/Makassar': 'ID', 'Asia/Manila': 'PH', 'Asia/Hong_Kong': 'HK', 'Asia/Shanghai': 'CN',
  'Asia/Taipei': 'TW', 'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
  'Asia/Dhaka': 'BD', 'Asia/Karachi': 'PK', 'Asia/Kathmandu': 'NP', 'Asia/Colombo': 'LK', 'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA', 'Asia/Brunei': 'BN', 'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU',
  'Australia/Perth': 'AU', 'Australia/Brisbane': 'AU', 'Australia/Adelaide': 'AU', 'Pacific/Auckland': 'NZ',
  'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT', 'Europe/Zurich': 'CH', 'Europe/Vienna': 'AT',
  'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK', 'Europe/Helsinki': 'FI', 'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ', 'Europe/Lisbon': 'PT', 'Europe/Athens': 'GR', 'Europe/Istanbul': 'TR', 'Europe/Moscow': 'RU',
  'Europe/Kiev': 'UA', 'Europe/Kyiv': 'UA', 'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US', 'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Mexico_City': 'MX', 'America/Sao_Paulo': 'BR',
  'America/Argentina/Buenos_Aires': 'AR', 'America/Bogota': 'CO', 'America/Lima': 'PE', 'America/Santiago': 'CL',
  'Africa/Johannesburg': 'ZA', 'Africa/Lagos': 'NG', 'Africa/Cairo': 'EG', 'Africa/Nairobi': 'KE'
};

/* ---------- Turso over HTTP (no packages needed) ---------- */
function arg(v) {
  if (v === null || v === undefined) return { type: 'null' };
  if (typeof v === 'number') return Number.isInteger(v) ? { type: 'integer', value: String(v) } : { type: 'float', value: v };
  return { type: 'text', value: String(v) };
}
async function db(stmts) {
  if (!DB_URL || !DB_TOKEN) throw new Error('database not connected');
  const body = { requests: stmts.map(([sql, args]) => ({ type: 'execute', stmt: { sql, args: (args || []).map(arg) } })).concat([{ type: 'close' }]) };
  const r = await fetch(DB_URL + '/v2/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + DB_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error('database answered ' + r.status + ': ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  return j.results.slice(0, stmts.length).map((x) => {
    if (x.type !== 'ok') throw new Error('query failed: ' + JSON.stringify(x.error));
    const res = x.response.result;
    return res.rows.map((row) => {
      const o = {};
      res.cols.forEach((c, i) => {
        const cell = row[i];
        o[c.name] = !cell || cell.type === 'null' ? null : (cell.type === 'integer' || cell.type === 'float' ? Number(cell.value) : cell.value);
      });
      return o;
    });
  });
}
let ready = null;
function init() {
  if (!ready) {
    ready = db([
      ['CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, day TEXT NOT NULL, type TEXT NOT NULL, visitor TEXT NOT NULL, letter TEXT, place TEXT, country TEXT)'],
      ['CREATE INDEX IF NOT EXISTS events_day ON events(day)'],
      ['CREATE INDEX IF NOT EXISTS events_type ON events(type)'],
      ['CREATE TABLE IF NOT EXISTS clips (key TEXT PRIMARY KEY, mime TEXT NOT NULL, data TEXT NOT NULL, updated INTEGER NOT NULL)'],
      ['CREATE TABLE IF NOT EXISTS players (visitor TEXT PRIMARY KEY, adj INTEGER NOT NULL, animal TEXT NOT NULL, num INTEGER NOT NULL, ts INTEGER NOT NULL)'],
      ['CREATE TABLE IF NOT EXISTS scores (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, week TEXT NOT NULL, visitor TEXT NOT NULL, points INTEGER NOT NULL, reason TEXT NOT NULL)'],
      ['CREATE INDEX IF NOT EXISTS scores_week ON scores(week, visitor)'],
      ['CREATE INDEX IF NOT EXISTS scores_visitor ON scores(visitor)'],
      ['CREATE TABLE IF NOT EXISTS player_names (visitor TEXT PRIMARY KEY, first TEXT NOT NULL)']
    ]).catch((e) => { ready = null; throw e; });
  }
  return ready;
}

/* ---------- counting ---------- */
const live = new Map();    // visitor -> last seen (ms), for "writing right now"
const limits = new Map();  // visitor -> { start, n }, a simple rate limit
function dayOf(ts) { return new Date(ts + 7 * 3600e3).toISOString().slice(0, 10); } // Cambodia time
function headerCountry(req) {
  const h = req.headers;
  const c = String(h['cf-ipcountry'] || h['x-country-code'] || h['x-geo-country'] || h['x-vercel-ip-country'] || h['cloudfront-viewer-country'] || '');
  return /^[A-Za-z]{2}$/.test(c) && !/^(XX|T1)$/i.test(c) ? c.toUpperCase() : null;
}
function allowed(visitor) {
  const now = Date.now();
  const b = limits.get(visitor);
  if (!b || now - b.start > 60000) { limits.set(visitor, { start: now, n: 1 }); return true; }
  b.n++;
  return b.n <= 40;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, t] of live) if (now - t > 600000) live.delete(k);
  for (const [k, b] of limits) if (now - b.start > 120000) limits.delete(k);
}, 60000).unref();

/* ---------- points and the Champions board ----------
   Points are worked out here from what happened, never sent by the app:
   10 per star on a traced letter, 20 for hatching a new friend, 5 for a treat, 25 for a crown. */
const POINTS = { hatch: 20, feed: 5, crown: 25 };
const ADJ = ['Sunny', 'Happy', 'Brave', 'Speedy', 'Sparkly', 'Jolly', 'Clever', 'Bouncy', 'Cozy', 'Lucky', 'Giggly', 'Mighty'];
const BUDDY = { A: 'Alligator', B: 'Bear', C: 'Cat', D: 'Dog', E: 'Elephant', F: 'Frog', G: 'Giraffe', H: 'Horse', I: 'Inchworm', J: 'Jaguar', K: 'Kangaroo', L: 'Lion', M: 'Monkey', N: 'Newt', O: 'Octopus', P: 'Penguin', Q: 'Bee', R: 'Rabbit', S: 'Sloth', T: 'Tiger', U: 'Unicorn', V: 'Vole', W: 'Whale', X: 'Fish', Y: 'Yak', Z: 'Zebra' };
function nick(p) { return p.first ? p.first + ' the ' + BUDDY[p.animal] : ADJ[p.adj] + ' ' + BUDDY[p.animal] + ' ' + p.num; }
// A child's first name, if they give one: letters only (any language), 2-12 long, one word, nothing rude.
const RUDE = /(fuck|shit|bitch|dick|cock|pussy|porn|cunt|nigg|fag|slut|whore|penis|vagina|sexy|^sex$|^ass$|^butt$|^poop$|^kill$)/i;
function cleanFirst(s) {
  if (typeof s !== 'string') return '';
  const t = s.normalize('NFC').trim().replace(/\s+/g, ' ');
  if (!t) return '';
  if (!/^[\p{L}\p{M}][\p{L}\p{M}'-]{1,11}$/u.test(t)) return null;
  if (RUDE.test(t)) return null;
  return t.charAt(0).toLocaleUpperCase('en') + t.slice(1);
}
function weekOf(ts) { // the Monday the week starts on, Cambodia time
  const d = new Date(ts + 7 * 3600e3);
  const back = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() - back * 864e5).toISOString().slice(0, 10);
}
const scoreLimits = new Map();
function scoreAllowed(visitor) {
  const now = Date.now();
  const b = scoreLimits.get(visitor);
  if (!b || now - b.start > 60000) { scoreLimits.set(visitor, { start: now, n: 1 }); return true; }
  b.n++;
  return b.n <= 15;
}
const isTestId = (v) => v.indexOf('testrunner') === 0;

async function onPlayer(req, res) {
  let b;
  try { b = JSON.parse(await readBody(req, 1024)); } catch (e) { return json(res, 400, { error: 'bad request' }); }
  const visitor = typeof b.visitor === 'string' && /^[a-z0-9]{10,40}$/.test(b.visitor) ? b.visitor : null;
  const adj = Number.isInteger(b.adj) && b.adj >= 0 && b.adj < ADJ.length ? b.adj : null;
  const animal = typeof b.animal === 'string' && BUDDY[b.animal] ? b.animal : null;
  const num = Number.isInteger(b.num) && b.num >= 10 && b.num <= 99 ? b.num : null;
  if (!visitor || adj === null || !animal || num === null) return json(res, 400, { error: 'bad request' });
  const first = cleanFirst(b.first);
  if (first === null) return json(res, 422, { error: 'Use only your first name: letters, up to 12.' });
  if (!allowed(visitor)) return json(res, 429, { error: 'slow down' });
  await init();
  await db([
    ['INSERT OR REPLACE INTO players (visitor, adj, animal, num, ts) VALUES (?, ?, ?, ?, ?)', [visitor, adj, animal, num, Date.now()]],
    first ? ['INSERT OR REPLACE INTO player_names (visitor, first) VALUES (?, ?)', [visitor, first]] : ['DELETE FROM player_names WHERE visitor = ?', [visitor]]
  ]);
  json(res, 200, { name: nick({ adj, animal, num, first }), animal, first });
}

async function onLeaderboard(req, res, url) {
  const scope = url.searchParams.get('scope') === 'all' ? 'all' : 'week';
  const me = /^[a-z0-9]{10,40}$/.test(url.searchParams.get('v') || '') ? url.searchParams.get('v') : '';
  const test = url.searchParams.get('test') === '1';
  const week = weekOf(Date.now());
  const conds = [];
  const args = [];
  if (scope === 'week') { conds.push('s.week = ?'); args.push(week); }
  if (!test) conds.push("s.visitor NOT LIKE 'testrunner%'");
  const where = conds.length ? ' WHERE ' + conds.join(' AND ') : '';
  const board = 'SELECT s.visitor AS visitor, SUM(s.points) AS points, MAX(s.ts) AS last FROM scores s JOIN players p ON p.visitor = s.visitor' + where + ' GROUP BY s.visitor';
  const myArgs = scope === 'week' ? [me, week] : [me];
  await init();
  const [top, mine, player, count] = await db([
    ['SELECT b.visitor, b.points, p.adj, p.animal, p.num, n.first FROM (' + board + ') b JOIN players p ON p.visitor = b.visitor LEFT JOIN player_names n ON n.visitor = b.visitor ORDER BY b.points DESC, b.last ASC LIMIT 10', args],
    ['SELECT COALESCE(SUM(points), 0) AS points, MAX(ts) AS last FROM scores WHERE visitor = ?' + (scope === 'week' ? ' AND week = ?' : ''), myArgs],
    ['SELECT p.adj, p.animal, p.num, n.first FROM players p LEFT JOIN player_names n ON n.visitor = p.visitor WHERE p.visitor = ?', [me]],
    ['SELECT COUNT(*) AS n FROM (' + board + ')', args]
  ]);
  const you = { name: null, animal: null, points: mine[0].points, rank: null };
  if (player.length) {
    you.name = nick(player[0]); you.animal = player[0].animal;
    if (you.points > 0) {
      const [above] = await db([['SELECT COUNT(*) AS n FROM (' + board + ') WHERE points > ? OR (points = ? AND last < ?)', args.concat([you.points, you.points, mine[0].last || 0])]]);
      you.rank = above[0].n + 1;
    }
  }
  json(res, 200, {
    scope, week, players: count[0].n, you,
    top: top.map((r, i) => ({ rank: i + 1, name: nick(r), animal: r.animal, points: r.points, you: !!me && r.visitor === me }))
  });
}

async function onEvent(req, res) {
  let b;
  try { b = JSON.parse(await readBody(req, 2048)); } catch (e) { return json(res, 400, { error: 'bad request' }); }
  const visitor = typeof b.visitor === 'string' && /^[a-z0-9]{10,40}$/.test(b.visitor) ? b.visitor : null;
  const type = ['visit', 'ping', 'trace', 'hatch', 'feed', 'crown'].includes(b.type) ? b.type : null;
  if (!visitor || !type) return json(res, 400, { error: 'bad request' });
  if (!allowed(visitor)) return json(res, 429, { error: 'slow down' });
  const pts = type === 'trace' ? 10 * (Number.isInteger(b.stars) && b.stars >= 1 && b.stars <= 3 ? b.stars : 1) : (POINTS[type] || 0);
  if (pts && scoreAllowed(visitor)) {
    const now0 = Date.now();
    await init();
    await db([['INSERT INTO scores (ts, week, visitor, points, reason) VALUES (?, ?, ?, ?, ?)', [now0, weekOf(now0), visitor, pts, type]]]);
  }
  // Test runs (ids starting with "testrunner") never count in the stats, and stay off the public board.
  if (isTestId(visitor)) { res.writeHead(204); return res.end(); }
  live.set(visitor, Date.now());
  if (type === 'ping') { res.writeHead(204); return res.end(); }
  const tz = typeof b.tz === 'string' && /^[A-Za-z_]+(\/[A-Za-z_+-]+){1,2}$/.test(b.tz) ? b.tz : null;
  const place = tz && !/^Etc\//.test(tz) ? tz.split('/').pop().replace(/_/g, ' ') : null;
  const country = headerCountry(req) || (tz && TZ_COUNTRY[tz]) || null;
  const letter = typeof b.letter === 'string' && /^[A-Za-z]$/.test(b.letter) ? b.letter : null;
  const now = Date.now();
  await init();
  await db([['INSERT INTO events (ts, day, type, visitor, letter, place, country) VALUES (?, ?, ?, ?, ?, ?, ?)', [now, dayOf(now), type, visitor, letter, place, country]]]);
  cache = null;
  res.writeHead(204); res.end();
}

let cache = null;
async function onStats(req, res) {
  const now = Date.now();
  let liveNow = 0;
  for (const t of live.values()) if (now - t < 100000) liveNow++;
  if (cache && now - cache.at < 8000) return json(res, 200, Object.assign({}, cache.data, { live: liveNow }));
  await init();
  const today = dayOf(now);
  const since = dayOf(now - 13 * 864e5);
  const [tot, td, perDay, places, spread, letters] = await db([
    ["SELECT COUNT(DISTINCT visitor) AS kids, COALESCE(SUM(type = 'visit'), 0) AS visits, COALESCE(SUM(type = 'trace'), 0) AS traces, COALESCE(SUM(type = 'hatch'), 0) AS hatches FROM events"],
    ["SELECT COUNT(DISTINCT visitor) AS kids, COALESCE(SUM(type = 'trace'), 0) AS traces FROM events WHERE day = ?", [today]],
    ["SELECT day, COUNT(DISTINCT visitor) AS kids, COALESCE(SUM(type = 'trace'), 0) AS traces FROM events WHERE day >= ? GROUP BY day", [since]],
    ['SELECT place, MAX(country) AS country, COUNT(DISTINCT visitor) AS kids FROM events WHERE place IS NOT NULL GROUP BY place ORDER BY kids DESC, place LIMIT 10'],
    ['SELECT COUNT(DISTINCT place) AS places, COUNT(DISTINCT country) AS countries FROM events'],
    ["SELECT UPPER(letter) AS letter, COUNT(*) AS n FROM events WHERE type = 'trace' AND letter IS NOT NULL GROUP BY UPPER(letter) ORDER BY n DESC, letter LIMIT 3"]
  ]);
  const byDay = {};
  perDay.forEach((d) => { byDay[d.day] = d; });
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = dayOf(now - i * 864e5);
    days.push({ day: d, kids: byDay[d] ? byDay[d].kids : 0, traces: byDay[d] ? byDay[d].traces : 0 });
  }
  const data = {
    kids: tot[0].kids, visits: tot[0].visits, traces: tot[0].traces, hatches: tot[0].hatches,
    today: { day: today, kids: td[0].kids, traces: td[0].traces },
    days, places, placeCount: spread[0].places, countryCount: spread[0].countries,
    topLetters: letters, updated: now
  };
  cache = { at: now, data };
  json(res, 200, Object.assign({}, data, { live: liveNow }));
}

/* ---------- shared kid voice: real recordings uploaded once by a grown-up ---------- */
let voiceIndex = null;
async function getVoiceIndex() {
  if (voiceIndex) return voiceIndex;
  await init();
  const [rows] = await db([['SELECT key, updated FROM clips ORDER BY key']]);
  voiceIndex = { keys: rows.map((r) => r.key), version: rows.reduce((m, r) => Math.max(m, r.updated), 0) };
  return voiceIndex;
}
function codeOk(req) {
  const given = String(req.headers['x-admin-code'] || '');
  if (!ADMIN_CODE || !given) return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(ADMIN_CODE).digest();
  return crypto.timingSafeEqual(a, b);
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function onVoice(req, res, url) {
  const p = url.pathname;
  if (p === '/api/voice/index' && req.method === 'GET') return json(res, 200, await getVoiceIndex());
  if (p === '/api/voice/check' && req.method === 'POST') {
    if (!ADMIN_CODE) return json(res, 503, { error: 'No grown-up code is set on the server.' });
    if (!codeOk(req)) { await wait(1200); return json(res, 403, { error: 'Wrong code.' }); }
    res.writeHead(204); return res.end();
  }
  if (p === '/api/voice/clip') {
    const key = url.searchParams.get('k') || '';
    if (!CLIP_KEY.test(key)) return json(res, 400, { error: 'bad clip' });
    if (req.method === 'GET') {
      await init();
      const [rows] = await db([['SELECT mime, data FROM clips WHERE key = ?', [key]]]);
      if (!rows.length) return json(res, 404, { error: 'no clip' });
      const buf = Buffer.from(rows[0].data, 'base64');
      res.writeHead(200, { 'Content-Type': rows[0].mime, 'Content-Length': buf.length, 'Cache-Control': 'public, max-age=31536000, immutable' });
      return res.end(buf);
    }
    if (req.method === 'PUT' || req.method === 'DELETE') {
      if (!codeOk(req)) { await wait(1200); return json(res, 403, { error: 'Wrong code.' }); }
      await init();
      if (req.method === 'DELETE') {
        await db([['DELETE FROM clips WHERE key = ?', [key]]]);
      } else {
        const mime = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
        if (!/^audio\/[a-z0-9.+-]+$/.test(mime)) return json(res, 415, { error: 'audio only' });
        const buf = await readRaw(req, 400 * 1024);
        if (buf.length < 500) return json(res, 400, { error: 'too short' });
        await db([['INSERT OR REPLACE INTO clips (key, mime, data, updated) VALUES (?, ?, ?, ?)', [key, mime, buf.toString('base64'), Date.now()]]]);
      }
      voiceIndex = null;
      res.writeHead(204); return res.end();
    }
  }
  return json(res, 404, { error: 'not found' });
}

/* ---------- http ---------- */
function readRaw(req, max) {
  return new Promise((resolve, reject) => {
    let size = 0; const parts = [];
    req.on('data', (c) => { size += c.length; if (size > max) { reject(new Error('too big')); req.destroy(); } else parts.push(c); });
    req.on('end', () => resolve(Buffer.concat(parts)));
    req.on('error', reject);
  });
}
function readBody(req, max) { return readRaw(req, max).then((b) => b.toString('utf8')); }
function json(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}
function serveFile(req, res, file, status) {
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(status || 200, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(req.method === 'HEAD' ? undefined : buf);
  });
}
function serveStatic(req, res) {
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://local').pathname); } catch (e) { p = '/'; }
  if (p.endsWith('/')) p += 'index.html';
  const file = path.normalize(path.join(PUB, p));
  if (!file.startsWith(PUB + path.sep)) { res.writeHead(404); return res.end(); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return serveFile(req, res, path.join(PUB, 'index.html'));
    serveFile(req, res, file);
  });
}

http.createServer(async (req, res) => {
  const url = req.url || '/';
  try {
    if (url.startsWith('/api/') && (!DB_URL || !DB_TOKEN)) {
      return json(res, 503, { error: 'Stats and the shared voice need a database: set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.' });
    }
    if (url.startsWith('/api/event') && req.method === 'POST') return await onEvent(req, res);
    if (url.startsWith('/api/stats') && req.method === 'GET') return await onStats(req, res);
    if (url.startsWith('/api/voice/')) return await onVoice(req, res, new URL(url, 'http://local'));
    if (url.startsWith('/api/player') && req.method === 'POST') return await onPlayer(req, res);
    if (url.startsWith('/api/leaderboard') && req.method === 'GET') return await onLeaderboard(req, res, new URL(url, 'http://local'));
    if (url.startsWith('/api/')) return json(res, 404, { error: 'not found' });
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    serveStatic(req, res);
  } catch (e) {
    console.error('error on', req.method, url, '-', e.message);
    if (!res.headersSent) json(res, 500, { error: 'Something went wrong. Try again soon.' });
  }
}).listen(PORT, () => {
  console.log('Letter Zoo listening on port ' + PORT + (DB_URL ? ' (stats database connected)' : ' (no stats database)'));
  init().then(() => console.log('stats table ready')).catch((e) => console.error('stats table:', e.message));
});
