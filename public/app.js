/* Letter Zoo: trace letters with a finger, hatch animal friends. */
(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';
  var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  var LETTERS = window.LETTERS;
  var ANIMALS = window.ANIMALS;
  var EXTRA = window.ANIMAL_EXTRA || {};
  var TREATS = window.ANIMAL_TREATS || {};
  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Paint for each letter (cycles): the road fills with it as the child traces.
  var LETTER_COLORS = [
    { fill: '#FF4F86', tint: '#FFE0EA' }, // berry
    { fill: '#2F7BF6', tint: '#DDEAFF' }, // ocean
    { fill: '#16B576', tint: '#D3F6E6' }, // leaf
    { fill: '#7C4DFF', tint: '#EAE2FF' }, // grape
    { fill: '#FF7A2F', tint: '#FFE5D3' }, // tangerine
    { fill: '#EAA800', tint: '#FFF2C2' }  // sun
  ];
  var TILES = [
    { bg: '#FF5C8A', ink: '#FFFFFF', edge: '#D93A68' },
    { bg: '#3A86FF', ink: '#FFFFFF', edge: '#1F63D6' },
    { bg: '#3DDC97', ink: '#10301F', edge: '#22AE70' },
    { bg: '#8B5CF6', ink: '#FFFFFF', edge: '#6A3BD6' },
    { bg: '#FF8C42', ink: '#2B1606', edge: '#D96A22' },
    { bg: '#FFD23F', ink: '#2B2205', edge: '#E0AF00' }
  ];
  var PARTY = ['#FF5C8A', '#3A86FF', '#3DDC97', '#8B5CF6', '#FF8C42', '#FFD23F'];
  var INKS = { rainbow: null, berry: '#FF4F86', ocean: '#2F7BF6', leaf: '#16B576', grape: '#7C4DFF', tangerine: '#FF7A2F' };
  var ROAD = 12;   // width of the letter path, in letter units
  var STEP = 1.5;  // distance between checkpoints along a stroke

  /* ---------- saved progress (this device) ---------- */
  var KEY = 'letterzoo:v1';
  function defaults() {
    return { done: {}, newFriends: 0, ink: 'rainbow', case: 'upper', index: 0,
      settings: { sound: true, voice: true, demo: true, helper: 'easy' } };
  }
  var save = (function () {
    var d = defaults();
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && typeof s === 'object') {
        for (var k in s) if (k !== 'settings') d[k] = s[k];
        if (s.settings) for (var j in s.settings) d.settings[j] = s.settings[j];
      }
    } catch (e) {}
    if (!(d.index >= 0 && d.index < 26)) d.index = 0;
    if (d.case !== 'lower') d.case = 'upper';
    if (!(d.ink in INKS)) d.ink = 'rainbow';
    return d;
  })();
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} }

  /* ---------- anonymous counting for the Our world tab ---------- */
  var vid = (function () {
    try {
      var v = localStorage.getItem('letterzoo:vid');
      if (v && /^[a-z0-9]{10,40}$/.test(v)) return v;
      v = (Date.now().toString(36) + Math.random().toString(36).slice(2, 12)).replace(/[^a-z0-9]/g, '');
      localStorage.setItem('letterzoo:vid', v);
      return v;
    } catch (e) { return 'anon' + Math.random().toString(36).slice(2, 12).replace(/[^a-z0-9]/g, 'x'); }
  })();
  var TZ = '';
  try { TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
  function logEvent(type, letter, stars) {
    try {
      return fetch('/api/event', {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: type, visitor: vid, letter: letter || null, tz: TZ, stars: stars || undefined })
      }).catch(function () {});
    } catch (e) {}
  }

  /* ---------- elements ---------- */
  function $(s) { return document.querySelector(s); }
  var screenTrace = $('#screen-trace');
  var board = $('#board');
  var svg = $('#letterSvg');
  var gLines = $('#gLines'), gRoads = $('#gRoads'), gFills = $('#gFills'), gDemo = $('#gDemo'), gMarkers = $('#gMarkers');
  var canvas = $('#ink');
  var ctx = canvas.getContext('2d');
  var egg = $('#egg');
  var stepsEl = $('#steps');
  var confettiEl = $('#confetti');
  var reward = $('#reward');
  var bubbleText = $('#bubbleText');
  var chipLetter = $('#chipLetter');
  var letterGrid = $('#letterGrid');
  var zooGrid = $('#zooGrid');

  function el(tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // An off-screen path to measure strokes (works even while a screen is hidden).
  var meas = document.createElementNS(SVGNS, 'svg');
  meas.setAttribute('aria-hidden', 'true');
  meas.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden';
  var mpath = el('path', { d: 'M0 0' }, meas);
  document.body.appendChild(meas);
  function sample(d) {
    mpath.setAttribute('d', d);
    var len = mpath.getTotalLength();
    var n = Math.max(2, Math.ceil(len / STEP) + 1);
    var pts = [];
    for (var i = 0; i < n; i++) {
      var p = mpath.getPointAtLength(len * i / (n - 1));
      pts.push({ x: p.x, y: p.y });
    }
    return { len: len, pts: pts };
  }

  function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function tol() { return save.settings.helper === 'tricky' ? 8 : 12; }
  function currentChar() { var L = ALPHA[save.index]; return save.case === 'upper' ? L : L.toLowerCase(); }
  function isUnlocked(L) { return !!(save.done[L] || save.done[L.toLowerCase()]); }

  /* ---------- sound ---------- */
  var actx = null;
  function unlockAudio() {
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; } }
    if (actx && actx.state === 'suspended') actx.resume();
  }
  function tone(freq, dur, type, vol, when) {
    if (!save.settings.sound || !actx) return;
    var t = actx.currentTime + (when || 0);
    var o = actx.createOscillator(), g = actx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.2));
    o.connect(g); g.connect(actx.destination);
    o.start(t); o.stop(t + (dur || 0.2) + 0.05);
  }
  var NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  function chime(i) { var f = NOTES[i % NOTES.length]; tone(f, 0.35, 'triangle', 0.18); tone(f * 2, 0.2, 'sine', 0.05, 0.02); }
  function boop() { tone(330, 0.12, 'sine', 0.12); tone(247, 0.16, 'sine', 0.12, 0.1); }
  function pop() { tone(880, 0.08, 'square', 0.05); tone(1320, 0.1, 'sine', 0.08, 0.04); }
  function fanfare() { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 0.3, 'triangle', 0.16, i * 0.11); }); tone(1318.5, 0.6, 'sine', 0.1, 0.46); }

  /* ---------- voice ----------
     1. A grown-up's own recording (Voice studio), when there is one for that phrase.
     2. Otherwise the most natural voice the device has: kid voices first (Ana, Maisie in Microsoft Edge),
        then natural/neural/enhanced voices, and the old robotic ones last. */
  var voices = [], voice = null;
  var clipURLs = {};
  var shared = { keys: {}, version: 0 }; // set before pickVoice() runs below
  var KID_VOICE = /\bAna\b|Maisie/i;
  var ROBOTIC = /\b(David|Mark|Zira|Hazel|George|Fred|Albert|Junior|Ralph|Zarvox|Trinoids|Whisper|Bahh|Bells|Boing|Bubbles|Cellos|Wobble|Jester|Superstar|Organ|Hysterical|Deranged|Bad News|Good News|Grandma|Grandpa|Rocko|Shelley|Flo|Eddy|Reed|Sandy)\b/i;
  function voiceScore(v) {
    var n = v.name, s = 0;
    if (KID_VOICE.test(n)) s += 200;
    if (/Natural|Neural/i.test(n)) s += 80;
    if (/Enhanced|Premium|Siri/i.test(n)) s += 70;
    if (/^Google/i.test(n)) s += 45;
    if (/Samantha|Ava|Allison|Susan|Karen|Moira|Tessa|Nicky|Serena|Kate/i.test(n)) s += 30;
    if (/Jenny|Aria|Emma|Michelle|Sonia|Libby|Natasha|Clara/i.test(n)) s += 20;
    if (ROBOTIC.test(n) && !/Natural|Neural|Enhanced|Premium/i.test(n)) s -= 60;
    if (/Zira|Hazel|Susan|Female/i.test(n)) s += 10; // among basic voices, a softer one is friendlier for kids
    if (/^en[-_]US/i.test(v.lang)) s += 6; else if (/^en[-_](GB|AU|CA|IE|NZ)/i.test(v.lang)) s += 4;
    return s;
  }
  function voiceKind(v) {
    if (KID_VOICE.test(v.name)) return 'kid';
    return voiceScore(v) >= 40 ? 'natural' : 'basic';
  }
  function voiceLabel(v) {
    var n = v.name.replace(/^Microsoft\s+/i, '').replace(/\s+Online/i, '').replace(/\s*\((Natural|Neural)\)/i, '').replace(/\s+-\s+English.*$/i, '').trim();
    var k = voiceKind(v);
    return n + (k === 'kid' ? ' · kid voice' : k === 'natural' ? ' · natural' : ' · robot-like');
  }
  function pickVoice() {
    try {
      voices = window.speechSynthesis.getVoices()
        .filter(function (v) { return /^en/i.test(v.lang); })
        .sort(function (a, b) { return voiceScore(b) - voiceScore(a); });
    } catch (e) { voices = []; }
    var want = save.settings.voiceName;
    voice = (want && want !== 'recorded' && voices.filter(function (v) { return v.name === want; })[0]) || voices[0] || null;
    renderVoicePicker();
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    else window.speechSynthesis.onvoiceschanged = pickVoice;
  }
  function tts(text) {
    if (!('speechSynthesis' in window) || save.settings.voiceName === 'recorded') return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-US';
      var kind = voice ? voiceKind(voice) : 'basic';
      // A kid voice sounds best as it is; others get a slightly brighter, slower, friendlier delivery.
      u.pitch = kind === 'kid' ? 1.05 : kind === 'natural' ? 1.12 : 1.25;
      u.rate = kind === 'kid' ? 0.95 : kind === 'natural' ? 0.9 : 0.85;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function say(text, key) {
    if (!save.settings.voice) return;
    if (key && (clipURLs[key] || shared.keys[key])) { playClip(key); return; }
    tts(text);
  }

  /* The shared kid voice: real recordings a grown-up uploaded once, heard on every device. */
  function loadShared() {
    return fetch('/api/voice/index', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) return;
        shared.keys = {};
        (d.keys || []).forEach(function (k) { shared.keys[k] = 1; });
        shared.version = d.version || 0;
        renderVoicePicker();
      }).catch(function () {});
  }
  function sharedURL(key) { return '/api/voice/clip?k=' + encodeURIComponent(key) + '&v=' + shared.version; }
  function sayLetter() {
    var L = ALPHA[save.index];
    if (save.case === 'upper') say('Capital ' + L + '.', 'cap:' + L);
    else say('Small ' + L + '.', 'small:' + L);
  }

  /* ---------- recorded voice clips (IndexedDB, this device only) ---------- */
  var clipAudio = null;
  var dbPromise = null;
  function db() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (res, rej) {
      if (!window.indexedDB) { rej(new Error('no db')); return; }
      var r = indexedDB.open('letterzoo-voice', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('clips'); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
    return dbPromise;
  }
  function loadClips() {
    return db().then(function (d) {
      return new Promise(function (res) {
        var req = d.transaction('clips', 'readonly').objectStore('clips').openCursor();
        req.onsuccess = function () {
          var c = req.result;
          if (c) { clipURLs[c.key] = URL.createObjectURL(c.value); c.continue(); } else res();
        };
        req.onerror = function () { res(); };
      });
    }).catch(function () {});
  }
  function saveClip(key, blob) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var tx = d.transaction('clips', 'readwrite');
        tx.objectStore('clips').put(blob, key);
        tx.oncomplete = function () {
          if (clipURLs[key]) URL.revokeObjectURL(clipURLs[key]);
          clipURLs[key] = URL.createObjectURL(blob);
          res();
        };
        tx.onerror = function () { rej(tx.error); };
      });
    });
  }
  function deleteClip(key) {
    return db().then(function (d) {
      return new Promise(function (res) {
        var tx = d.transaction('clips', 'readwrite');
        tx.objectStore('clips').delete(key);
        tx.oncomplete = function () { if (clipURLs[key]) URL.revokeObjectURL(clipURLs[key]); delete clipURLs[key]; res(); };
        tx.onerror = function () { res(); };
      });
    });
  }
  function playClip(key) {
    try {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (clipAudio) clipAudio.pause();
      clipAudio = new Audio(clipURLs[key] || sharedURL(key));
      var p = clipAudio.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  /* ---------- tracing state ---------- */
  var T = { strokes: [], cur: 0, complete: false, pointer: null, tracking: false, last: null, lastPx: null,
    moves: 0, off: 0, hue: 0, demo: null, build: 0 };

  function setBubble(text) { bubbleText.textContent = text; }
  function hookText() {
    var ch = currentChar();
    if (T.cur === 0 && !T.strokes[0].k) return 'Who is inside the egg? Trace ' + ch + ' to find out!';
    return 'Keep going from the green dot!';
  }

  function drawLines(upper) {
    gLines.textContent = '';
    function line(y, cls) { el('line', { x1: -600, x2: 700, y1: y, y2: y, 'class': 'ln ' + cls }, gLines); }
    line(20, 'ln-top'); line(60, 'ln-mid'); line(100, 'ln-base');
    if (!upper) line(130, 'ln-desc');
  }

  function makeStroke(d) {
    if (d.indexOf('dot:') === 0) {
      var xy = d.slice(4).split(',').map(Number);
      var p = { x: xy[0], y: xy[1] };
      el('circle', { cx: p.x, cy: p.y, r: ROAD * 0.62, 'class': 'road' }, gRoads);
      var fd = el('circle', { cx: p.x, cy: p.y, r: ROAD * 0.5, 'class': 'fill' }, gFills);
      fd.style.opacity = 0;
      return { dot: true, d: d, pts: [p], len: 0, fill: fd, k: 0 };
    }
    var m = sample(d);
    var road = el('path', { d: d, 'class': 'road' }, gRoads);
    road.style.strokeWidth = ROAD;
    el('path', { d: d, 'class': 'center' }, gRoads);
    var fill = el('path', { d: d, 'class': 'fill' }, gFills);
    fill.style.strokeDasharray = m.len + ' ' + (m.len + 20);
    fill.style.strokeDashoffset = m.len;
    fill.style.opacity = 0;
    return { dot: false, d: d, pts: m.pts, len: m.len, fill: fill, k: 0 };
  }

  function setFill(s, frac) {
    if (s.dot) { s.fill.style.opacity = frac >= 1 ? 1 : 0; return; }
    s.fill.style.opacity = frac > 0 ? 1 : 0;
    s.fill.style.strokeDashoffset = s.len * (1 - frac);
  }

  function buildLetter() {
    stopDemo();
    T.build++;
    var upper = save.case === 'upper';
    var ch = currentChar();
    var data = (upper ? LETTERS.upper : LETTERS.lower)[ch];
    var col = LETTER_COLORS[save.index % LETTER_COLORS.length];
    screenTrace.style.setProperty('--letter', col.fill);
    screenTrace.style.setProperty('--tint', col.tint);
    svg.setAttribute('viewBox', upper ? '0 3 100 113' : '0 3 100 136');
    svg.classList.remove('is-done');
    drawLines(upper);
    gRoads.textContent = ''; gFills.textContent = ''; gMarkers.textContent = ''; gDemo.textContent = '';
    T.strokes = data.map(makeStroke);
    T.cur = 0; T.complete = false; T.tracking = false; T.pointer = null; T.moves = 0; T.off = 0;
    clearInk();
    reward.hidden = true;
    confettiEl.textContent = '';
    resetEgg();
    renderSteps();
    updateMarkers();
    chipLetter.textContent = ch;
    $('#sayLetter').setAttribute('aria-label', 'Hear the letter ' + ALPHA[save.index]);
    setBubble(hookText());
    document.querySelectorAll('.case-switch button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.case === save.case ? 'true' : 'false');
    });
  }

  function renderSteps() {
    var html = '';
    for (var i = 0; i < T.strokes.length; i++) {
      var cls = i < T.cur ? 'is-done' : (i === T.cur && !T.complete ? 'is-now' : '');
      html += '<span class="step ' + cls + '">' + (T.strokes[i].dot ? '•' : (i + 1)) + '</span>';
    }
    stepsEl.innerHTML = html;
  }

  function updateMarkers() {
    gMarkers.textContent = '';
    if (T.complete || T.demo) return;
    var s = T.strokes[T.cur];
    if (!s) return;
    var p = s.pts[s.k];
    if (!s.dot) {
      var n = s.pts.length;
      var i = Math.min(n - 1, s.k + Math.round(16 / STEP));
      if (i > s.k + 4) {
        var a = s.pts[i - 3], b = s.pts[i];
        var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
        var g = el('g', { transform: 'translate(' + b.x + ' ' + b.y + ') rotate(' + ang + ')' }, gMarkers);
        el('path', { d: 'M-3.2 -3.8 L1.8 0 L-3.2 3.8', 'class': 'arrow' }, g);
      }
    }
    el('circle', { cx: p.x, cy: p.y, r: 6.5, 'class': 'pulse' }, gMarkers);
    el('circle', { cx: p.x, cy: p.y, r: 6.5, 'class': 'start-dot' }, gMarkers);
    var t = el('text', { x: p.x, y: p.y + 0.3, 'class': 'start-num' }, gMarkers);
    t.textContent = s.dot ? '•' : String(T.cur + 1);
  }

  /* ---------- canvas ink ---------- */
  var dpr = 1, ctm = null, ctmInv = null, rect = null, pxPerUnit = 3;
  function sizeCanvas() {
    var r = board.getBoundingClientRect();
    if (!r.width || !r.height) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function clearInk() {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.restore();
    canvas.classList.remove('fade');
  }
  function measureBoard() {
    rect = board.getBoundingClientRect();
    ctm = svg.getScreenCTM();
    ctmInv = ctm ? ctm.inverse() : null;
    pxPerUnit = ctm ? ctm.a : 3;
  }
  function toLetter(cx, cy) { var p = new DOMPoint(cx, cy).matrixTransform(ctmInv); return { x: p.x, y: p.y }; }
  function toBoard(pt) { var p = new DOMPoint(pt.x, pt.y).matrixTransform(ctm); return { x: p.x - rect.left, y: p.y - rect.top }; }
  function inkStyle() {
    if (save.ink === 'rainbow') { T.hue = (T.hue + 4) % 360; return 'hsl(' + T.hue + ' 90% 55%)'; }
    return INKS[save.ink];
  }
  function drawInk(a, b) {
    ctx.strokeStyle = inkStyle();
    ctx.lineWidth = Math.max(7, ROAD * 0.5 * pxPerUnit);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.92;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /* ---------- pointer tracing ---------- */
  function onDown(e) {
    if (T.complete) return;
    if (T.pointer !== null && T.pointer !== e.pointerId) return; // one finger at a time
    e.preventDefault();
    unlockAudio();
    if (T.demo) stopDemo();
    T.pointer = e.pointerId;
    try { board.setPointerCapture(e.pointerId); } catch (err) {}
    measureBoard();
    if (!ctmInv) return;
    var px = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    var p = toLetter(e.clientX, e.clientY);
    T.lastPx = px; T.last = p;
    drawInk(px, { x: px.x + 0.1, y: px.y + 0.1 });
    var s = T.strokes[T.cur];
    if (s.dot) {
      if (dist(p, s.pts[0]) < tol() * 1.5) finishStroke(); else nudge();
      return;
    }
    if (dist(p, s.pts[s.k]) < tol() * 1.4) {
      T.tracking = true;
      gMarkers.textContent = '';
    } else {
      T.tracking = false;
      nudge();
    }
  }

  function onMove(e) {
    if (e.pointerId !== T.pointer || !ctmInv) return;
    var evs = (e.getCoalescedEvents && e.getCoalescedEvents()) || [];
    if (!evs.length) evs = [e];
    for (var i = 0; i < evs.length; i++) {
      var ev = evs[i];
      var px = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      if (!T.complete) drawInk(T.lastPx, px);
      T.lastPx = px;
      var p = toLetter(ev.clientX, ev.clientY);
      var d = dist(T.last, p);
      var n = Math.max(1, Math.ceil(d / 2));
      for (var j = 1; j <= n && !T.complete; j++) {
        var f = j / n;
        track({ x: T.last.x + (p.x - T.last.x) * f, y: T.last.y + (p.y - T.last.y) * f });
      }
      T.last = p;
      if (T.complete) break;
    }
  }

  function onUp(e) {
    if (e.pointerId !== T.pointer) return;
    T.pointer = null;
    T.tracking = false;
    if (!T.complete) {
      updateMarkers();
      var s = T.strokes[T.cur];
      if (s && s.k > 0) setBubble('Lift and carry on from the green dot!');
    }
  }

  function track(p) {
    if (T.complete) return;
    var s = T.strokes[T.cur];
    var t = tol();
    if (s.dot) { if (dist(p, s.pts[0]) < t * 1.2) finishStroke(); return; }
    if (!T.tracking) {
      if (dist(p, s.pts[s.k]) < t * 1.2) { T.tracking = true; gMarkers.textContent = ''; }
      else return;
    }
    var n = s.pts.length;
    var win = Math.ceil(t * 2.2 / STEP);
    var hi = Math.min(n - 1, s.k + win);
    var best = -1;
    for (var j = hi; j > s.k; j--) { if (dist(p, s.pts[j]) < t) { best = j; break; } }
    T.moves++;
    if (best > 0) {
      s.k = best;
      setFill(s, s.k / (n - 1));
    } else {
      var md = Infinity, lo = Math.max(0, s.k - win);
      for (var q = lo; q <= hi; q++) md = Math.min(md, dist(p, s.pts[q]));
      if (md > t * 1.5) T.off++;
      if (md > t * 3.2) { T.tracking = false; oops(); return; }
    }
    var slack = Math.ceil((t * 0.5) / STEP);
    if (s.k >= n - 1 - slack) { s.k = n - 1; finishStroke(); }
  }

  function nudge() {
    boop();
    var s = T.strokes[T.cur];
    setBubble(s.dot ? 'Tap the dot on top!' : 'Start at the green dot ' + (T.cur + 1) + '!');
    updateMarkers();
    gMarkers.classList.remove('nudge'); void gMarkers.getBoundingClientRect(); gMarkers.classList.add('nudge');
    if (navigator.vibrate) { try { navigator.vibrate(25); } catch (e) {} }
  }
  function oops() {
    boop();
    setBubble('Oops! Hop back to the green dot.');
    updateMarkers();
  }

  function finishStroke() {
    var s = T.strokes[T.cur];
    setFill(s, 1);
    chime(T.cur);
    sparkleAt(s.pts[s.pts.length - 1]);
    T.cur++;
    T.tracking = false;
    crackEgg();
    if (T.cur >= T.strokes.length) { renderSteps(); completeLetter(); return; }
    renderSteps();
    var nx = T.strokes[T.cur];
    if (T.pointer !== null && T.last && !nx.dot && dist(T.last, nx.pts[0]) < tol()) T.tracking = true;
    else updateMarkers();
    setBubble(nx.dot ? 'Super! Now tap the dot on top.' : ['Great!', 'Yes!', 'Wow!'][T.cur % 3] + ' Now line ' + (T.cur + 1) + '.');
  }

  function completeLetter() {
    T.complete = true;
    gMarkers.textContent = '';
    var ratio = T.moves ? T.off / T.moves : 0;
    var stars = ratio < 0.12 ? 3 : (ratio < 0.3 ? 2 : 1);
    var L = ALPHA[save.index], ch = currentChar();
    var isNew = !isUnlocked(L);
    save.done[ch] = Math.max(save.done[ch] || 0, stars);
    if (isNew) {
      save.newFriends = (save.newFriends || 0) + 1;
      save.fresh = (save.fresh || []).concat(L);
    }
    var earned = stars * 10 + (isNew ? 20 : 0);
    lastEarned = earned;
    addPoints(earned);
    Promise.all([logEvent('trace', ch, stars), isNew ? logEvent('hatch', L) : null]).then(champCheckSoon, champCheckSoon);
    persist();
    updateBadge();
    svg.classList.add('is-done');
    canvas.classList.add('fade');
    setBubble('You did it! The egg is hatching...');
    fanfare();
    egg.classList.remove('wobble');
    egg.classList.add('hatch');
    var build = T.build;
    setTimeout(function () {
      if (build !== T.build) return;
      showReward(stars, isNew);
      confetti();
      pop();
      var a = ANIMALS[L];
      setBubble(L + ' is for ' + a.name + '!');
      say(L + ' is for ' + a.name + '!', 'word:' + L);
    }, 950);
  }

  function showReward(stars, isNew) {
    var L = ALPHA[save.index], ch = currentChar(), a = ANIMALS[L];
    setupFeed(L);
    $('#rewardTitle').innerHTML = '<span class="big">' + ch + '</span> is for ' + a.name + '!';
    var html = '';
    for (var i = 0; i < 3; i++) {
      html += '<svg class="icon solid rstar' + (i < stars ? ' on' : '') + '" style="animation-delay:' + (0.3 + i * 0.18) + 's" aria-hidden="true"><use href="#i-star"/></svg>';
    }
    $('#rewardStars').innerHTML = html;
    $('#rewardStars').setAttribute('aria-label', stars + ' of 3 stars');
    $('#rewardStars').setAttribute('role', 'img');
    $('#rewardNew').hidden = !isNew;
    var rp = $('#rewardPoints');
    rp.innerHTML = '<svg class="icon solid" aria-hidden="true"><use href="#i-star"/></svg>+' + lastEarned + ' points';
    rp.classList.remove('pop'); void rp.offsetWidth; rp.classList.add('pop');
    reward.hidden = false;
    setTimeout(function () { var nb = $('#nextBtn'); if (nb && !reward.hidden) nb.focus({ preventScroll: true }); }, 50);
  }

  /* ---------- Treat Time: feed the animal, grow a friendship, earn a crown ---------- */
  var treatEl = $('#treat');
  var rewardAnimal = $('#rewardAnimal');
  var feedState = null, drag = null;
  function fedCount(L) { return (save.fed && save.fed[L]) || 0; }
  function heartsHTML(n) {
    var h = '';
    for (var i = 0; i < 3; i++) h += '<span class="fh' + (i < n ? ' on' : '') + '">♥</span>';
    return h;
  }
  function setupFeed(L) {
    var a = ANIMALS[L], t = TREATS[L] || ['🍎', 'an apple'], n = Math.min(3, fedCount(L));
    rewardAnimal.className = 'reward-animal';
    rewardAnimal.innerHTML = '<span class="ra-crown' + (n >= 3 ? ' on' : '') + '" aria-hidden="true">👑</span><span class="ra-emo">' + a.emoji + '</span>';
    treatEl.textContent = t[0];
    treatEl.className = 'treat';
    treatEl.style.transform = '';
    treatEl.setAttribute('aria-label', 'Give ' + a.name + ' ' + t[1]);
    $('#feed').classList.remove('fed');
    $('#feedAsk').textContent = 'Feed me!';
    var fh = $('#friendHearts');
    fh.innerHTML = heartsHTML(n);
    fh.setAttribute('aria-label', 'Friendship ' + n + ' of 3');
    var state = feedState = { L: L, done: false, build: T.build };
    setTimeout(function () {
      if (feedState === state && !state.done && !reward.hidden) say('Can you feed me ' + t[1] + '?');
    }, 2600);
  }
  function overAnimal(x, y) {
    var r = rewardAnimal.getBoundingClientRect(), px = r.width * 0.25, py = r.height * 0.25;
    return x > r.left - px && x < r.right + px && y > r.top - py && y < r.bottom + py;
  }
  function toMouth() {
    var r = rewardAnimal.getBoundingClientRect(), tr = treatEl.getBoundingClientRect();
    var cur = new DOMMatrixReadOnly(getComputedStyle(treatEl).transform === 'none' ? undefined : getComputedStyle(treatEl).transform);
    return { x: cur.m41 + (r.left + r.width / 2) - (tr.left + tr.width / 2), y: cur.m42 + (r.top + r.height * 0.6) - (tr.top + tr.height / 2) };
  }
  function flyToAnimal() {
    if (!feedState || feedState.done) return;
    var m = toMouth();
    treatEl.classList.add('flying');
    treatEl.style.transform = 'translate(' + m.x + 'px,' + m.y + 'px) scale(.9)';
    setTimeout(feed, 430);
  }
  treatEl.addEventListener('pointerdown', function (e) {
    if (!feedState || feedState.done) return;
    e.preventDefault(); e.stopPropagation();
    unlockAudio();
    try { treatEl.setPointerCapture(e.pointerId); } catch (x) {}
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: Date.now(), moved: false };
    treatEl.classList.add('dragging');
  });
  treatEl.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 8) drag.moved = true;
    treatEl.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.15)';
    rewardAnimal.classList.toggle('open', overAnimal(e.clientX, e.clientY));
  });
  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var tap = !drag.moved && Date.now() - drag.t < 450;
    var hit = e.type === 'pointerup' && drag.moved && overAnimal(e.clientX, e.clientY);
    drag = null;
    treatEl.classList.remove('dragging');
    rewardAnimal.classList.remove('open');
    if (hit) feed();
    else if (tap) flyToAnimal();
    else { treatEl.style.transform = ''; boop(); setBubble('Bring the treat to your friend!'); }
  }
  treatEl.addEventListener('pointerup', endDrag);
  treatEl.addEventListener('pointercancel', endDrag);
  treatEl.addEventListener('click', function (e) { if (e.detail === 0) { unlockAudio(); flyToAnimal(); } }); // keyboard
  function munch() { [0, 0.16, 0.32].forEach(function (w) { tone(196, 0.08, 'square', 0.05, w); tone(147, 0.1, 'sine', 0.1, w + 0.03); }); }
  function crumbs() {
    var br = board.getBoundingClientRect(), r = rewardAnimal.getBoundingClientRect();
    var cx = r.left + r.width / 2 - br.left, cy = r.top + r.height * 0.65 - br.top;
    for (var i = 0; i < 10; i++) {
      var c = document.createElement('b');
      c.className = 'crumb';
      var ang = Math.random() * Math.PI * 2, d = 30 + Math.random() * 40;
      c.style.left = cx + 'px'; c.style.top = cy + 'px';
      c.style.setProperty('--dx', Math.cos(ang) * d + 'px');
      c.style.setProperty('--dy', (Math.sin(ang) * d + 20) + 'px');
      c.style.setProperty('--c', PARTY[i % PARTY.length]);
      confettiEl.appendChild(c);
      setTimeout((function (n) { return function () { n.remove(); }; })(c), 800);
    }
  }
  function feed() {
    if (!feedState || feedState.done) return;
    feedState.done = true;
    var L = feedState.L, a = ANIMALS[L], build = feedState.build;
    var m = toMouth();
    treatEl.classList.remove('flying');
    treatEl.classList.add('eaten');
    treatEl.style.transform = 'translate(' + m.x + 'px,' + m.y + 'px) scale(.1)';
    rewardAnimal.classList.remove('chomp'); void rewardAnimal.offsetWidth; rewardAnimal.classList.add('chomp');
    munch();
    crumbs();
    save.fed = save.fed || {};
    var before = save.fed[L] || 0;
    save.fed[L] = before + 1;
    persist();
    var n = Math.min(3, save.fed[L]);
    var crownNow = before < 3 && n === 3;
    addPoints(crownNow ? 30 : 5);
    floatPoints(crownNow ? '+30' : '+5');
    Promise.all([logEvent('feed', L), crownNow ? logEvent('crown', L) : null]).then(champCheckSoon, champCheckSoon);
    setTimeout(function () {
      if (build !== T.build) return;
      var fh = $('#friendHearts');
      fh.innerHTML = heartsHTML(n);
      fh.setAttribute('aria-label', 'Friendship ' + n + ' of 3');
      if (before < 3 && fh.children[n - 1]) fh.children[n - 1].classList.add('pop');
      $('#feed').classList.add('fed');
      if (before < 3 && n === 3) {
        var crown = rewardAnimal.querySelector('.ra-crown');
        if (crown) crown.classList.add('on', 'drop');
        $('#feedAsk').textContent = 'Best friends!';
        fanfare(); confetti();
        setBubble(a.name + ' is your best friend! Here is a crown!');
        say('Yay! We are best friends! I got a crown!');
      } else {
        $('#feedAsk').textContent = 'Yum!';
        pop();
        setBubble('Yum! ' + a.name + ' loves you!');
        say(n >= 3 ? 'Yum yum! Best friends forever!' : 'Yum yum! Thank you! Feed me again next time!');
      }
    }, 650);
  }

  /* ---------- points ---------- */
  var lastEarned = 0;
  function updatePointsPill(bump) {
    var n = save.points || 0;
    $('#pointsNum').textContent = fmtN(n);
    $('#pointsPill').setAttribute('aria-label', 'Your points: ' + n + '. Open Champions');
    if (bump) { var p = $('#pointsPill'); p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); }
  }
  function fmtN(n) { return Number(n || 0).toLocaleString('en-US'); }
  function addPoints(n) { save.points = (save.points || 0) + n; persist(); updatePointsPill(true); }
  function floatPoints(text) {
    var br = board.getBoundingClientRect(), r = rewardAnimal.getBoundingClientRect();
    var f = document.createElement('b');
    f.className = 'float-points';
    f.textContent = text;
    f.style.left = (r.left + r.width / 2 - br.left) + 'px';
    f.style.top = (r.top - br.top) + 'px';
    confettiEl.appendChild(f);
    setTimeout(function () { f.remove(); }, 1400);
  }

  /* ---------- egg ---------- */
  function resetEgg() {
    egg.className = 'egg';
    egg.querySelectorAll('.crack').forEach(function (c) { c.classList.remove('on'); });
  }
  function crackEgg() {
    var f = T.cur / T.strokes.length;
    egg.querySelectorAll('.crack').forEach(function (c, i) {
      if (i === 0 || f >= (i + 1) / 3 - 0.01) c.classList.add('on');
    });
    egg.classList.remove('wobble'); void egg.getBoundingClientRect(); egg.classList.add('wobble');
  }

  /* ---------- party effects ---------- */
  function confetti() {
    confettiEl.style.setProperty('--fall', (board.clientHeight + 60) + 'px');
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 48; i++) {
      var s = document.createElement('i');
      s.style.setProperty('--x', (Math.random() * 100) + '%');
      s.style.setProperty('--c', PARTY[i % PARTY.length]);
      s.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
      s.style.setProperty('--r', (Math.random() * 360) + 'deg');
      s.style.setProperty('--t', (1.6 + Math.random() * 1.4) + 's');
      s.style.animationDelay = (Math.random() * 0.4) + 's';
      frag.appendChild(s);
    }
    confettiEl.appendChild(frag);
    var build = T.build;
    setTimeout(function () { if (build === T.build) confettiEl.querySelectorAll('i').forEach(function (n) { n.remove(); }); }, 3600);
  }
  function sparkleAt(pt) {
    if (!ctm || !rect) measureBoard();
    if (!ctm) return;
    var b = toBoard(pt);
    for (var i = 0; i < 8; i++) {
      var s = document.createElement('b');
      s.className = 'spark';
      var ang = i / 8 * Math.PI * 2;
      s.style.left = b.x + 'px'; s.style.top = b.y + 'px';
      s.style.setProperty('--dx', (Math.cos(ang) * 48) + 'px');
      s.style.setProperty('--dy', (Math.sin(ang) * 48) + 'px');
      s.style.background = PARTY[i % PARTY.length];
      confettiEl.appendChild(s);
      setTimeout((function (n) { return function () { n.remove(); }; })(s), 800);
    }
  }

  /* ---------- "Show me" demo: the ladybug walks each stroke ---------- */
  function makeBug() {
    var g = el('g', { 'class': 'buddy' }, gDemo);
    var u = el('use', { href: '#i-bug', x: -7, y: -7, width: 14, height: 14 }, g);
    u.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#i-bug');
    return g;
  }
  function placeBug(bug, x, y, angRad) {
    var deg = angRad * 180 / Math.PI + 90;
    bug.setAttribute('transform', 'translate(' + x + ' ' + y + ') rotate(' + deg + ')');
  }
  function animateStroke(s, token, bug) {
    return new Promise(function (resolve) {
      if (s.dot) {
        var c = el('circle', { cx: s.pts[0].x, cy: s.pts[0].y, r: ROAD * 0.5, 'class': 'demo-dot' }, gDemo);
        gDemo.appendChild(bug);
        placeBug(bug, s.pts[0].x, s.pts[0].y - 1, 0);
        void c;
        setTimeout(resolve, 650);
        return;
      }
      var path = el('path', { d: s.d, 'class': 'demo-fill' }, gDemo);
      path.style.strokeDasharray = s.len + ' ' + (s.len + 20);
      path.style.strokeDashoffset = s.len;
      gDemo.appendChild(bug);
      var dur = Math.max(700, s.len / 65 * 1000);
      var t0 = performance.now();
      function frame(now) {
        if (token.stopped) { resolve(); return; }
        var t = Math.min(1, (now - t0) / dur);
        var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        var idx = e * (s.pts.length - 1);
        var i = Math.min(s.pts.length - 2, Math.floor(idx)), f = idx - i;
        var a = s.pts[i], b = s.pts[i + 1];
        placeBug(bug, a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, Math.atan2(b.y - a.y, b.x - a.x));
        path.style.strokeDashoffset = s.len * (1 - e);
        if (t < 1) requestAnimationFrame(frame); else resolve();
      }
      requestAnimationFrame(frame);
    });
  }
  function playDemo() {
    stopDemo();
    if (T.complete) return;
    var token = { stopped: false };
    T.demo = token;
    gMarkers.textContent = '';
    board.classList.add('is-demo');
    setBubble('Watch the ladybug write ' + currentChar() + '!');
    var bug = makeBug();
    var i = T.cur;
    (function next() {
      if (token.stopped) return;
      if (i >= T.strokes.length) {
        wait(300).then(function () {
          if (token.stopped) return;
          gDemo.classList.add('fade-out');
          return wait(450);
        }).then(function () {
          if (token.stopped) return;
          T.demo = null;
          gDemo.textContent = '';
          gDemo.classList.remove('fade-out');
          board.classList.remove('is-demo');
          updateMarkers();
          setBubble('Your turn! ' + hookText());
        });
        return;
      }
      animateStroke(T.strokes[i], token, bug).then(function () {
        i++;
        if (!token.stopped) wait(260).then(next);
      });
    })();
  }
  function stopDemo() {
    var was = !!T.demo;
    if (T.demo) { T.demo.stopped = true; T.demo = null; }
    gDemo.textContent = '';
    gDemo.classList.remove('fade-out');
    board.classList.remove('is-demo');
    if (was && !T.complete) updateMarkers();
  }
  function maybeDemo() {
    if (!save.settings.demo) return;
    var build = T.build;
    setTimeout(function () {
      if (build === T.build && !T.complete && T.cur === 0 && T.pointer === null && !T.strokes[0].k && screenTrace.classList.contains('is-active')) playDemo();
    }, 500);
  }

  /* ---------- navigation ---------- */
  function go(i, quiet) {
    save.index = (i + 26) % 26;
    persist();
    buildLetter();
    if (!quiet) sayLetter();
    maybeDemo();
  }

  function setTab(name) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.toggle('is-active', s.dataset.screen === name); });
    document.querySelectorAll('.tab').forEach(function (t) {
      if (t.dataset.tab === name) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    if (name !== 'trace') stopDemo();
    if (name !== 'zoo') stopZooLife();
    if (name === 'world') startStats(); else stopStats();
    if (name === 'champions') startChamps(); else stopChamps();
    if (name === 'letters') { renderGrid(); var cur = letterGrid.querySelector('.is-current'); if (cur) cur.scrollIntoView({ block: 'nearest' }); }
    if (name === 'zoo') {
      var fresh = (save.fresh || []).slice();
      save.newFriends = 0; save.fresh = []; persist(); updateBadge();
      renderZoo(); renderHabitat(fresh);
      if (fresh.length) {
        var names = fresh.map(function (L) { return ANIMALS[L].name; });
        var list = names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
        setTimeout(function () { fanfare(); say(list + (names.length === 1 ? ' moved' : ' moved') + ' into your zoo!'); }, 500);
      }
    }
    if (name === 'trace') requestAnimationFrame(function () { sizeCanvas(); updateMarkers(); });
  }

  function starIcons(n, cls) {
    var h = '';
    for (var k = 0; k < 3; k++) h += '<svg class="icon solid ' + cls + (k < n ? ' on' : '') + '" aria-hidden="true"><use href="#i-star"/></svg>';
    return h;
  }

  function renderGrid() {
    var up = save.case === 'upper';
    var html = '', count = 0;
    ALPHA.forEach(function (L, i) {
      var ch = up ? L : L.toLowerCase();
      var t = TILES[i % TILES.length];
      var st = save.done[ch] || 0;
      if (st) count++;
      html += '<button type="button" class="ltile' + (i === save.index ? ' is-current' : '') + '" data-i="' + i + '" style="--tile:' + t.bg + ';--tile-ink:' + t.ink + ';--tile-edge:' + t.edge + '" aria-label="Letter ' + ch + (st ? ', ' + st + ' stars' : '') + '">' +
        '<span class="lt-main">' + ch + '</span><span class="lt-stars">' + starIcons(st, 'lstar') + '</span></button>';
    });
    letterGrid.innerHTML = html;
    $('#lettersSub').textContent = count === 0 ? 'Tap any letter to trace it.' : count + ' of 26 ' + (up ? 'capital' : 'small') + ' letters traced.';
  }

  function eggMini(i) {
    var t = TILES[i % TILES.length];
    return '<svg viewBox="0 0 60 72" class="mini-egg" aria-hidden="true"><path d="M30 3C15 3 4 28 4 45c0 15 11 24 26 24s26-9 26-24C56 28 45 3 30 3z" fill="' + t.bg + '" opacity=".35"/><circle cx="20" cy="26" r="4" fill="' + t.bg + '" opacity=".7"/><circle cx="40" cy="40" r="5" fill="' + t.bg + '" opacity=".7"/><circle cx="22" cy="55" r="3.5" fill="' + t.bg + '" opacity=".7"/></svg>';
  }

  function renderZoo() {
    var html = '', count = 0;
    ALPHA.forEach(function (L, i) {
      var a = ANIMALS[L];
      var up = !!save.done[L], lo = !!save.done[L.toLowerCase()];
      if (up || lo) {
        count++;
        html += '<button type="button" class="zcard" data-i="' + i + '" aria-label="' + a.name + ', letter ' + L + '">' +
          (up && lo ? '<span class="zsuper" title="Capital and small letters done">Aa</span>' : '') +
          (fedCount(L) >= 3 ? '<span class="zcrown" title="Best friends">👑</span>' : '') +
          '<span class="emo">' + a.emoji + '</span><span class="zname">' + a.name + '</span>' +
          '<span class="zhearts" aria-label="Friendship ' + Math.min(3, fedCount(L)) + ' of 3">' + heartsHTML(Math.min(3, fedCount(L))) + '</span>' +
          '<span class="zletter">' + L + L.toLowerCase() + '</span></button>';
      } else {
        html += '<button type="button" class="zcard locked" data-i="' + i + '" aria-label="Egg for letter ' + L + '. Trace ' + L + ' to hatch it.">' +
          '<span class="emo">' + eggMini(i) + '</span><span class="zname">Trace ' + L + '</span><span class="zletter">' + L + L.toLowerCase() + '</span></button>';
      }
    });
    zooGrid.innerHTML = html;
    $('#zooCount').textContent = count + ' of 26 friends' + (count === 26 ? ': the whole zoo!' : '');
    $('#zooBar').style.width = (count / 26 * 100) + '%';
    $('#zooEmpty').hidden = count > 0;
  }

  /* ---------- living zoo: animals wander the park ---------- */
  var zooTimers = [];
  var critters = $('#critters');
  var habitat = $('#habitat');
  function rand(a, b) { return a + Math.random() * (b - a); }
  function stopZooLife() { zooTimers.forEach(clearTimeout); zooTimers = []; }
  function later(fn, ms) { zooTimers.push(setTimeout(fn, ms)); }
  function spot(home) {
    if (home === 'sky') return { x: rand(8, 70), y: rand(22, 34) };
    if (home === 'water') return { x: rand(72, 90), y: rand(80, 94) };
    return Math.random() < 0.75 ? { x: rand(6, 60), y: rand(52, 95) } : { x: rand(60, 92), y: rand(50, 62) };
  }
  function place(b, p) {
    b.style.left = p.x + '%'; b.style.top = p.y + '%';
    b.style.zIndex = String(Math.round(p.y));
    b._p = p;
  }
  function wander(b, ex) {
    if (!b.isConnected) return;
    var from = b._p, to = spot(ex.home);
    var dx = to.x - from.x, dy = to.y - from.y;
    var sec = Math.max(0.9, Math.sqrt(dx * dx + dy * dy) / (8 * (ex.speed || 1)));
    if (Math.abs(dx) > 2) b.querySelector('.cr-emo').classList.toggle('flip', dx > 0);
    b.style.transition = 'left ' + sec + 's linear, top ' + sec + 's linear';
    b.classList.add('walking');
    place(b, to);
    later(function () {
      b.classList.remove('walking');
      later(function () { wander(b, ex); }, rand(1200, 4500) / Math.max(0.5, ex.speed || 1));
    }, sec * 1000);
  }
  function renderHabitat(fresh) {
    stopZooLife();
    critters.textContent = '';
    var list = ALPHA.filter(isUnlocked);
    $('#habSign').hidden = list.length > 0;
    list.forEach(function (L) {
      var a = ANIMALS[L], ex = EXTRA[L] || { home: 'land', sound: 'Hello!', speed: 1 };
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'critter home-' + ex.home + (ex.hop ? ' hopper' : '');
      b.dataset.l = L;
      b.setAttribute('aria-label', a.name + '. Tap to say hello.');
      b.innerHTML = '<span class="cr-jump">' + (fedCount(L) >= 3 ? '<span class="cr-crown" aria-hidden="true">👑</span>' : '') +
        '<span class="cr-bob"><span class="cr-emo">' + a.emoji + '</span></span></span><span class="cr-say" aria-hidden="true"></span>';
      place(b, spot(ex.home));
      if (fresh && fresh.indexOf(L) >= 0) b.classList.add('arrive');
      critters.appendChild(b);
      if (!REDUCE) later(function () { wander(b, ex); }, rand(400, 2600));
    });
  }
  function hearts(b) {
    var hb = habitat.getBoundingClientRect(), r = b.getBoundingClientRect();
    for (var i = 0; i < 3; i++) {
      var h = document.createElement('span');
      h.className = 'heart';
      h.textContent = '♥';
      h.style.left = (r.left - hb.left + r.width / 2 + rand(-18, 18)) + 'px';
      h.style.top = (r.top - hb.top + rand(-4, 10)) + 'px';
      h.style.animationDelay = (i * 0.12) + 's';
      habitat.appendChild(h);
      setTimeout((function (n) { return function () { n.remove(); }; })(h), 1400);
    }
  }
  function greet(L) {
    var b = critters.querySelector('.critter[data-l="' + L + '"]');
    var a = ANIMALS[L], ex = EXTRA[L] || { sound: 'Hello!' };
    var i = ALPHA.indexOf(L);
    tone(NOTES[i % NOTES.length], 0.12, 'sine', 0.12); tone(NOTES[(i + 2) % NOTES.length] * 1.5, 0.18, 'triangle', 0.1, 0.1);
    say(ex.sound + ' Hi, I am ' + a.name + '!', 'sound:' + L);
    if (!b) return;
    b.classList.remove('jump'); void b.offsetWidth; b.classList.add('jump');
    var bubble = b.querySelector('.cr-say');
    bubble.textContent = ex.sound;
    bubble.classList.add('show');
    b.style.zIndex = '250';
    hearts(b);
    clearTimeout(b._t);
    b._t = setTimeout(function () { bubble.classList.remove('show'); if (b._p) b.style.zIndex = String(Math.round(b._p.y)); }, 1800);
  }
  critters.addEventListener('click', function (e) {
    var b = e.target.closest('.critter'); if (!b) return;
    unlockAudio();
    greet(b.dataset.l);
  });

  function updateBadge() {
    var b = $('#zooBadge');
    var n = save.newFriends || 0;
    b.hidden = n === 0;
    b.textContent = n;
  }

  /* ---------- settings ---------- */
  function syncSettings() {
    document.querySelectorAll('[data-setting]').forEach(function (b) {
      b.setAttribute('aria-checked', save.settings[b.dataset.setting] ? 'true' : 'false');
    });
    document.querySelectorAll('[data-helper]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.helper === save.settings.helper ? 'true' : 'false');
    });
    var dark = document.documentElement.classList.contains('dark');
    $('#nightSwitch').setAttribute('aria-checked', dark ? 'true' : 'false');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#151838' : '#EAF6FF');
    document.querySelectorAll('.crayon').forEach(function (c) {
      c.setAttribute('aria-checked', c.dataset.ink === save.ink ? 'true' : 'false');
    });
  }

  /* ---------- Our world: live numbers ---------- */
  var worldBody = $('#worldBody');
  var statsTimer = null, statsData = null, statsSig = '';
  var regionNames = null;
  try { regionNames = new Intl.DisplayNames(['en'], { type: 'region' }); } catch (e) {}
  var BALLOONS = [
    { c: '#FF5C8A', ink: '#FFFFFF' }, { c: '#3A86FF', ink: '#FFFFFF' }, { c: '#3DDC97', ink: '#10301F' },
    { c: '#8B5CF6', ink: '#FFFFFF' }, { c: '#FF8C42', ink: '#2B1606' }, { c: '#FFD23F', ink: '#2B2205' }
  ];
  function countryName(c) { if (!c) return ''; try { return regionNames ? regionNames.of(c) : c; } catch (e) { return c; } }
  function fmt(n) { return Number(n || 0).toLocaleString('en-US'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function balloon(place) {
    // A place keeps its own color, whatever its rank.
    var h = 0; for (var i = 0; i < place.length; i++) h = (h * 31 + place.charCodeAt(i)) >>> 0;
    return BALLOONS[h % BALLOONS.length];
  }
  function dayLabel(day, isToday) {
    if (isToday) return 'Today';
    try { return new Date(day + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }); } catch (e) { return day; }
  }
  function startStats() {
    loadStats();
    clearInterval(statsTimer);
    statsTimer = setInterval(loadStats, 15000);
  }
  function stopStats() { clearInterval(statsTimer); statsTimer = null; }
  function loadStats() {
    if (!statsData) worldBody.innerHTML = '<div class="w-skel w-skel-live"></div><div class="w-tiles"><div class="w-skel"></div><div class="w-skel"></div><div class="w-skel"></div><div class="w-skel"></div></div><div class="w-skel w-skel-big"></div>';
    return fetch('/api/stats', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('stats'); return r.json(); })
      .then(function (d) { statsData = d; renderStats(d); })
      .catch(function () {
        if (!statsData) worldBody.innerHTML = '<div class="w-card w-error"><p class="w-h">The numbers are napping</p><p class="w-sub">We could not load them. Check the internet connection, then try again.</p><button type="button" class="btn btn-sun" data-retry>Try again</button></div>';
      });
  }
  function tile(cls, icon, num, label, sub) {
    return '<div class="w-tile ' + cls + '"><span class="w-tile-icon"><svg class="icon" aria-hidden="true"><use href="#' + icon + '"/></svg></span>' +
      '<p class="w-tile-num">' + num + '</p><p class="w-tile-label">' + label + '</p>' + (sub ? '<p class="w-tile-sub">' + sub + '</p>' : '') + '</div>';
  }
  function renderStats(d) {
    var sig = JSON.stringify([d.live, d.kids, d.visits, d.traces, d.hatches, d.places, d.topLetters, d.days]);
    if (sig === statsSig && worldBody.querySelector('.w-live')) {
      var foot = worldBody.querySelector('.w-foot-time');
      if (foot) foot.textContent = timeLabel(d.updated);
      return;
    }
    statsSig = sig;
    var t = d.today || {};
    var html = '';

    // Live right now
    html += '<div class="w-live"><span class="w-live-dot" aria-hidden="true"></span><div class="w-live-text">' +
      '<p class="w-live-num">' + fmt(d.live) + '</p><p class="w-live-label">' + (d.live === 1 ? 'kid is' : 'kids are') + ' writing letters right now</p></div>' +
      '<svg class="w-live-bug" aria-hidden="true"><use href="#i-bug"/></svg></div>';

    // Big numbers
    html += '<div class="w-tiles">' +
      tile('t-berry', 'i-users', fmt(d.kids), d.kids === 1 ? 'Kid has visited' : 'Kids have visited', (t.kids ? '+' + fmt(t.kids) + ' today · ' : '') + fmt(d.visits) + ' visits') +
      tile('t-ocean', 'i-pencil', fmt(d.traces), 'Letters traced', t.traces ? '+' + fmt(t.traces) + ' today' : 'None yet today') +
      tile('t-leaf', 'i-egg', fmt(d.hatches), 'Eggs hatched', 'Animals found a home') +
      tile('t-sun', 'i-pin', fmt(d.placeCount), d.placeCount === 1 ? 'Place' : 'Places', fmt(d.countryCount) + ' ' + (d.countryCount === 1 ? 'country' : 'countries')) +
      '</div>';

    // Balloons: one per place
    var places = d.places || [];
    html += '<section class="w-card"><h2 class="w-h">Balloons from around the world</h2>' +
      '<p class="w-sub">Every balloon is a place where kids write with Letter Zoo. The bigger the balloon, the more kids.</p>';
    if (!places.length) {
      html += '<div class="w-sky w-sky-empty"><span class="hab-cloud c1"></span><p>No balloons yet. Yours will be the first!</p></div>';
    } else {
      var narrow = (worldBody.clientWidth || 360) < 540;
      var show = places.slice(0, narrow ? 3 : 6);
      var max = show[0].kids || 1;
      html += '<div class="w-sky" role="img" aria-label="' + esc(show.map(function (p) { return p.place + ': ' + p.kids + ' kids'; }).join(', ')) + '">' +
        '<span class="hab-cloud c1"></span><span class="hab-cloud c2"></span>';
      show.forEach(function (p, i) {
        var b = balloon(p.place);
        var x = (i + 0.5) / show.length * 100;
        var y = i % 2 ? 18 : 5;
        var s = Math.round(50 + 44 * Math.sqrt(p.kids / max));
        html += '<div class="balloon" style="left:' + x + '%;top:' + y + '%;--s:' + s + 'px;--b:' + b.c + ';--bi:' + b.ink + '">' +
          '<div class="b-float" style="animation-delay:' + (-i * 1.1) + 's"><div class="b-body"><span class="b-num">' + fmt(p.kids) + '</span></div><span class="b-string"></span>' +
          '<p class="b-tag">' + esc(p.place) + (p.country ? '<small>' + esc(countryName(p.country)) + '</small>' : '') + '</p></div></div>';
      });
      html += '</div>';
      var lmax = places[0].kids || 1;
      html += '<ol class="w-places">' + places.map(function (p, i) {
        return '<li><span class="wp-rank">' + (i + 1) + '</span><span class="wp-dot" style="background:' + balloon(p.place).c + '"></span>' +
          '<span class="wp-name">' + esc(p.place) + '<small>' + esc(countryName(p.country) || 'Somewhere') + '</small></span>' +
          '<span class="wp-bar" aria-hidden="true"><i style="width:' + Math.max(4, p.kids / lmax * 100) + '%"></i></span>' +
          '<span class="wp-n">' + fmt(p.kids) + '<small>' + (p.kids === 1 ? 'kid' : 'kids') + '</small></span></li>';
      }).join('') + '</ol>';
    }
    html += '</section>';

    // Letters traced per day
    var days = d.days || [];
    if (days.length) {
      var maxT = Math.max.apply(null, days.map(function (x) { return x.traces; }).concat([1]));
      html += '<section class="w-card"><h2 class="w-h">Letters traced each day</h2><p class="w-sub">The last 14 days. Tap a bar to see the day.</p>' +
        '<div class="w-chart"><span class="w-grid" aria-hidden="true"><b>' + fmt(maxT) + '</b></span><div class="w-bars">';
      days.forEach(function (x, i) {
        var isToday = i === days.length - 1;
        var label = dayLabel(x.day, isToday);
        var h = x.traces ? Math.max(3, x.traces / maxT * 100) : 0;
        html += '<button type="button" class="w-col' + (i < 4 ? ' tip-l' : i > 9 ? ' tip-r' : '') + '" aria-label="' + esc(label + ': ' + x.traces + ' letters traced by ' + x.kids + ' kids') + '">' +
          '<span class="w-bar' + (x.traces ? '' : ' is-zero') + '" style="height:' + h + '%">' + (isToday && x.traces ? '<span class="w-val">' + fmt(x.traces) + '</span>' : '') + '</span>' +
          '<span class="w-tip"><b>' + esc(label) + '</b>' + fmt(x.traces) + ' letters · ' + fmt(x.kids) + ' ' + (x.kids === 1 ? 'kid' : 'kids') + '</span></button>';
      });
      html += '</div><div class="w-axis"><span>' + esc(dayLabel(days[0].day)) + '</span><span>' + esc(dayLabel(days[7].day)) + '</span><span>Today</span></div></div></section>';
    }

    // Podium
    var tl = d.topLetters || [];
    html += '<section class="w-card"><h2 class="w-h">Most-loved letters</h2><p class="w-sub">The letters kids trace the most</p>';
    if (!tl.length) {
      html += '<p class="w-empty">No letters traced yet. Trace one to be first on the podium!</p>';
    } else {
      html += '<div class="w-podium">' + [1, 0, 2].map(function (k) {
        var it = tl[k];
        if (!it) return '<div class="pod pod-' + (k + 1) + ' is-empty"><div class="pod-block"><span class="pod-rank">' + (k + 1) + '</span><span class="pod-n">Free spot!</span></div></div>';
        var L = it.letter, a = ANIMALS[L] || { emoji: '', name: '' };
        var idx = Math.max(0, ALPHA.indexOf(L)), tt = TILES[idx % TILES.length];
        return '<div class="pod pod-' + (k + 1) + '"><span class="pod-animal" aria-hidden="true">' + a.emoji + '</span>' +
          '<span class="pod-letter" style="background:' + tt.bg + ';color:' + tt.ink + ';box-shadow:0 4px 0 ' + tt.edge + '">' + L + '</span>' +
          '<div class="pod-block"><span class="pod-rank">' + (k + 1) + '</span><span class="pod-n">' + fmt(it.n) + (it.n === 1 ? ' time' : ' times') + '</span></div></div>';
      }).join('') + '</div>';
    }
    html += '</section>';

    html += '<p class="w-foot">Anonymous counts: no names, photos, voices or IP addresses. Updated <span class="w-foot-time">' + timeLabel(d.updated) + '</span>.</p>';
    worldBody.innerHTML = html;
  }
  function timeLabel(ts) {
    try { return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Phnom_Penh' }) + ' Cambodia time'; } catch (e) { return 'just now'; }
  }
  worldBody.addEventListener('click', function (e) {
    if (e.target.closest('[data-retry]')) { statsData = null; loadStats(); return; }
    var col = e.target.closest('.w-col');
    if (col) {
      var was = col.classList.contains('on');
      worldBody.querySelectorAll('.w-col.on').forEach(function (c) { c.classList.remove('on'); });
      if (!was) col.classList.add('on');
    }
  });

  /* ---------- Champions: points board, player names, champion party ---------- */
  var WORDS = window.PLAYER_WORDS || ['Happy'];
  var BUDDY = window.PLAYER_BUDDY || {};
  var champBody = $('#champBody');
  var champTimer = null, champScope = 'week', champData = null, champSig = '';
  var MEDALS = ['🥇', '🥈', '🥉'];
  function playerName(p) {
    if (!p) return '';
    return p.first ? p.first + ' the ' + BUDDY[p.animal] : WORDS[p.adj] + ' ' + BUDDY[p.animal] + ' ' + p.num;
  }
  function tidyFirst(s) {
    var t = String(s || '').trim().replace(/\s+/g, ' ');
    if (t === t.toUpperCase() && t !== t.toLowerCase()) t = t.toLowerCase(); // ALL CAPS -> Capitalized
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
  }
  function avatar(animal, cls) {
    var i = Math.max(0, ALPHA.indexOf(animal)), t = TILES[i % TILES.length], a = ANIMALS[animal] || { emoji: '' };
    return '<span class="' + (cls || 'av') + '" style="background:' + t.bg + '" aria-hidden="true">' + a.emoji + '</span>';
  }
  function startChamps() { loadChamps(); clearInterval(champTimer); champTimer = setInterval(loadChamps, 20000); }
  function stopChamps() { clearInterval(champTimer); champTimer = null; }
  function fetchBoard(scope) {
    // Test devices (id starting with "testrunner") see the test board; real players never see test players.
    return fetch('/api/leaderboard?scope=' + scope + '&v=' + encodeURIComponent(vid) + (vid.indexOf('testrunner') === 0 ? '&test=1' : ''), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('board'); return r.json(); });
  }
  function loadChamps() {
    if (!champData) champBody.innerHTML = '<div class="w-skel w-skel-live"></div><div class="w-skel w-skel-big"></div>';
    return fetchBoard(champScope).then(function (d) { champData = d; renderChamps(d); }).catch(function () {
      if (!champData) champBody.innerHTML = '<div class="w-card w-error"><p class="w-h">The champions are taking a nap</p><p class="w-sub">We could not load the board. Check the internet connection, then try again.</p><button type="button" class="btn btn-sun" data-champ-retry>Try again</button></div>';
    });
  }
  function rowHTML(r) {
    return '<li class="c-row' + (r.you ? ' is-you' : '') + '"><span class="c-rank">' + r.rank + '</span>' + avatar(r.animal) +
      '<span class="c-name">' + esc(r.name) + (r.you ? ' <b class="c-you">You</b>' : '') + '</span><span class="c-pts">' + fmtN(r.points) + '<small>pts</small></span></li>';
  }
  function renderChamps(d) {
    var sig = JSON.stringify([d.scope, d.top, d.you, d.players]);
    if (sig === champSig && champBody.querySelector('.c-profile')) return;
    champSig = sig;
    var y = d.you || {};
    var html = '';
    // You
    if (!y.name) {
      html += '<div class="c-profile c-join"><span class="c-trophy" aria-hidden="true">🏆</span><div class="c-pmain"><p class="c-ptitle">Join the Champions board!</p>' +
        '<p class="c-psub">Add your first name to see your rank. You have ' + fmtN(y.points) + ' points' + (d.scope === 'week' ? ' this week' : '') + '.</p></div>' +
        '<button type="button" class="btn btn-sun" data-pick-name>Add my name</button></div>';
    } else {
      var champ = d.scope === 'week' && y.rank && y.rank <= 3;
      html += '<div class="c-profile' + (champ ? ' is-champ' : '') + '">' + avatar(y.animal, 'av av-big') + '<div class="c-pmain">' +
        '<p class="c-ptitle">' + esc(y.name) + (champ ? ' <span class="c-badge">' + MEDALS[y.rank - 1] + ' Champion</span>' : '') + '</p>' +
        '<p class="c-psub">' + fmtN(y.points) + ' points ' + (d.scope === 'week' ? 'this week' : 'in all') +
        (y.rank ? ' · number ' + y.rank + ' of ' + fmtN(d.players) : ' · trace a letter to get on the board') + '</p></div>' +
        (y.rank ? '<span class="c-myrank"><small>Rank</small>#' + y.rank + '</span>' : '') +
        '<button type="button" class="c-edit" data-pick-name aria-label="Change my player name"><svg class="icon" aria-hidden="true"><use href="#i-pencil"/></svg></button></div>';
      if (y.rank && y.rank > 1) {
        var ahead = (d.top || [])[y.rank - 2];
        if (ahead && !ahead.you) html += '<p class="c-chase">Only ' + fmtN(ahead.points - y.points + 1) + ' more points to pass ' + esc(ahead.name) + '!</p>';
      }
    }
    // How to earn
    html += '<div class="c-earn" aria-label="How to earn points"><span>⭐ 10 per star</span><span>🥚 +20 new friend</span><span>🍌 +5 treat</span><span>👑 +25 crown</span></div>';
    // Scope
    html += '<div class="d-chips c-scope" role="group" aria-label="Which board"><button type="button" class="c-chip" data-scope="week" aria-pressed="' + (d.scope === 'week') + '">This week</button>' +
      '<button type="button" class="c-chip" data-scope="all" aria-pressed="' + (d.scope === 'all') + '">All time</button></div>';
    var top = d.top || [];
    if (!top.length) {
      html += '<div class="w-card c-empty"><span class="c-trophy" aria-hidden="true">🏆</span><p class="w-h">No champions yet' + (d.scope === 'week' ? ' this week' : '') + '</p><p class="w-sub">Trace a letter to be the very first!</p></div>';
    } else {
      // Podium: 2nd, 1st, 3rd
      html += '<section class="w-card"><h2 class="w-h">' + (d.scope === 'week' ? 'This week’s champions' : 'All-time champions') + '</h2><div class="c-podium">' + [1, 0, 2].map(function (k) {
        var r = top[k];
        if (!r) return '<div class="cp cp-' + (k + 1) + ' is-empty"><div class="cp-block"><span class="cp-medal">' + MEDALS[k] + '</span><span class="cp-pts">Free spot!</span></div></div>';
        return '<div class="cp cp-' + (k + 1) + (r.you ? ' is-you' : '') + '">' + (k === 0 ? '<span class="cp-crown" aria-hidden="true">👑</span>' : '') + avatar(r.animal, 'av av-pod') +
          '<p class="cp-name">' + esc(r.name) + (r.you ? '<b class="c-you">You</b>' : '') + '</p><div class="cp-block"><span class="cp-medal">' + MEDALS[k] + '</span><span class="cp-pts">' + fmtN(r.points) + ' pts</span></div></div>';
      }).join('') + '</div>';
      if (top.length > 3) html += '<ol class="c-list">' + top.slice(3).map(rowHTML).join('') + '</ol>';
      if (y.rank && y.rank > top.length) html += '<p class="c-gap" aria-hidden="true">• • •</p><ol class="c-list">' + rowHTML({ rank: y.rank, name: y.name, animal: y.animal, points: y.points, you: true }) + '</ol>';
      html += '</section>';
    }
    html += '<p class="w-foot">' + fmtN(d.players) + ' ' + (d.players === 1 ? 'player' : 'players') + (d.scope === 'week' ? ' this week. A new week starts every Monday.' : ' so far.') + ' Only first names are shown.</p>';
    champBody.innerHTML = html;
  }
  champBody.addEventListener('click', function (e) {
    if (e.target.closest('[data-champ-retry]')) { champData = null; loadChamps(); return; }
    if (e.target.closest('[data-pick-name]')) { openNamePicker(); return; }
    var chip = e.target.closest('[data-scope]');
    if (chip && chip.dataset.scope !== champScope) { champScope = chip.dataset.scope; champData = null; champSig = ''; pop(); loadChamps(); }
  });
  $('#pointsPill').addEventListener('click', function () { unlockAudio(); pop(); setTab('champions'); });

  // Player name picker: fun words only, no typing, so no real names.
  var nameSheet = $('#nameSheet');
  var draft = null;
  function rnd(n) { return Math.floor(Math.random() * n); }
  function renderDraft() {
    $('#npAvatar').innerHTML = avatar(draft.animal, 'av av-hero');
    $('#npName').textContent = playerName(draft);
    $('#npGrid').querySelectorAll('.np-pick').forEach(function (b) { b.setAttribute('aria-checked', b.dataset.l === draft.animal ? 'true' : 'false'); });
  }
  function openNamePicker() {
    draft = save.player ? { adj: save.player.adj, animal: save.player.animal, num: save.player.num, first: save.player.first || '' } : { adj: rnd(WORDS.length), animal: ALPHA[rnd(26)], num: 10 + rnd(90), first: '' };
    $('#npFirst').value = draft.first;
    clearNameError();
    $('#npGrid').innerHTML = ALPHA.map(function (L) {
      return '<button type="button" class="np-pick" role="radio" data-l="' + L + '" aria-label="' + esc(BUDDY[L] || L) + '">' + (ANIMALS[L] ? ANIMALS[L].emoji : L) + '</button>';
    }).join('');
    renderDraft();
    if (nameSheet.showModal) nameSheet.showModal(); else nameSheet.setAttribute('open', '');
  }
  $('#npGrid').addEventListener('click', function (e) {
    var b = e.target.closest('.np-pick'); if (!b) return;
    draft.animal = b.dataset.l; pop(); clearNameError(); renderDraft();
  });
  function clearNameError() { $('#npError').textContent = ''; $('#npSuggest').textContent = ''; }
  function showNameTaken(msg, suggestions) {
    $('#npError').textContent = msg;
    $('#npSuggest').innerHTML = (suggestions || []).map(function (s) {
      return '<button type="button" class="np-sugg" data-l="' + s.animal + '">' + (ANIMALS[s.animal] ? ANIMALS[s.animal].emoji + ' ' : '') + esc(s.name) + '</button>';
    }).join('');
    boop();
  }
  $('#npSuggest').addEventListener('click', function (e) {
    var b = e.target.closest('.np-sugg'); if (!b) return;
    draft.animal = b.dataset.l; pop(); clearNameError(); renderDraft();
  });
  $('#npFirst').addEventListener('input', function (e) {
    draft.first = tidyFirst(e.target.value);
    clearNameError();
    renderDraft();
  });
  $('#npShuffle').addEventListener('click', function () {
    draft.adj = (draft.adj + 1 + rnd(WORDS.length - 1)) % WORDS.length; draft.num = 10 + rnd(90);
    pop(); renderDraft();
  });
  $('#npSave').addEventListener('click', function () {
    var btn = $('#npSave');
    btn.disabled = true;
    if (draft.first && !/^[\p{L}\p{M}][\p{L}\p{M}'-]{1,11}$/u.test(draft.first)) {
      $('#npError').textContent = 'Please use only your first name: letters, 2 to 12 long.';
      btn.disabled = false;
      return;
    }
    fetch('/api/player', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitor: vid, adj: draft.adj, animal: draft.animal, num: draft.num, first: draft.first }) })
      .then(function (r) {
        if (r.status === 422 || r.status === 409) return r.json().then(function (j) { var e = new Error(j.error || 'name'); e.user = true; e.taken = r.status === 409; e.suggestions = j.suggestions; throw e; });
        if (!r.ok) throw new Error('name');
        return r.json();
      })
      .then(function (d) {
        save.player = { adj: typeof d.adj === 'number' ? d.adj : draft.adj, animal: d.animal || draft.animal, num: typeof d.num === 'number' ? d.num : draft.num, first: d.first || '' }; persist();
        if (nameSheet.close) nameSheet.close();
        fanfare();
        say('Hello, ' + d.name + '!');
        champData = null; champSig = ''; loadChamps();
      })
      .catch(function (e) {
        if (e && e.taken) { showNameTaken(e.message, e.suggestions); return; }
        $('#npError').textContent = e && e.user ? 'Please choose another name: ' + e.message : 'Could not save. Check the internet and try again.';
      })
      .then(function () { btn.disabled = false; });
  });

  // After points are earned: are you in this week's top 3? Celebrate once per better rank.
  var champCheckTimer = null;
  function champCheckSoon() { clearTimeout(champCheckTimer); champCheckTimer = setTimeout(checkChampion, 1200); }
  function checkChampion() {
    if (!save.player) return;
    fetchBoard('week').then(function (d) {
      var y = d.you || {};
      if (!y.rank || y.rank > 3) return;
      var best = save.champ && save.champ.week === d.week ? save.champ.best : 99;
      if (y.rank >= best) return;
      save.champ = { week: d.week, best: y.rank }; persist();
      showChampParty(y);
    }).catch(function () {});
  }
  var champParty = $('#champParty');
  function showChampParty(y) {
    var words = ['number one', 'number two', 'number three'];
    $('#champMedal').innerHTML = '<span class="cm-medal">' + MEDALS[y.rank - 1] + '</span>' + avatar(y.animal, 'av av-hero');
    $('#champPartyTitle').textContent = y.rank === 1 ? 'You’re the top champion!' : 'You’re a champion!';
    $('#champPartySub').textContent = esc(y.name) + ' is number ' + y.rank + ' this week with ' + fmtN(y.points) + ' points!';
    var conf = $('#champConfetti'); conf.textContent = '';
    for (var i = 0; i < 60; i++) {
      var s = document.createElement('i');
      s.style.left = (Math.random() * 100) + '%';
      s.style.background = PARTY[i % PARTY.length];
      s.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
      s.style.setProperty('--r', (Math.random() * 360) + 'deg');
      s.style.animationDuration = (2 + Math.random() * 2) + 's';
      s.style.animationDelay = (Math.random() * 0.6) + 's';
      conf.appendChild(s);
    }
    champParty.hidden = false;
    fanfare(); setTimeout(fanfare, 700);
    say('Hooray! You are ' + words[y.rank - 1] + ' this week! You are a champion!');
    setTimeout(function () { $('#champSee').focus({ preventScroll: true }); }, 50);
  }
  function hideChampParty() { champParty.hidden = true; $('#champConfetti').textContent = ''; }
  $('#champKeep').addEventListener('click', function () { pop(); hideChampParty(); });
  $('#champSee').addEventListener('click', function () { pop(); hideChampParty(); champScope = 'week'; champData = null; champSig = ''; setTab('champions'); });
  champParty.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideChampParty(); });

  /* ---------- voice picker (grown-ups) ---------- */
  function renderVoicePicker() {
    var sel = document.getElementById('voiceSelect');
    var note = document.getElementById('voiceNote');
    if (!sel) return;
    var want = save.settings.voiceName || '';
    var best = voices[0];
    var html = '<option value="">Best voice on this device' + (best ? ' (' + voiceLabel(best) + ')' : '') + '</option>';
    voices.forEach(function (v) {
      html += '<option value="' + v.name.replace(/"/g, '&quot;') + '">' + voiceLabel(v) + '</option>';
    });
    html += '<option value="recorded">Only my recorded voice (no computer voice)</option>';
    sel.innerHTML = html;
    sel.value = want;
    if (sel.value !== want) sel.value = '';
    var recorded = Object.keys(clipURLs || {}).length;
    var sharedN = Object.keys(shared.keys).length;
    if (save.settings.voiceName === 'recorded') {
      note.textContent = 'Only real recordings play: ' + sharedN + ' of 104 in the shared kid voice, ' + recorded + ' on this device.';
    } else if (sharedN) {
      note.textContent = 'The shared kid voice says ' + sharedN + ' of 104 phrases. The computer voice only fills in the rest.';
    } else if (voice && voiceKind(voice) === 'kid') {
      note.textContent = 'Using a natural kid voice.';
    } else if (voice && voiceKind(voice) === 'natural') {
      note.textContent = 'Using a natural voice' + (best && voiceKind(best) === 'kid' ? '. A kid voice is also available.' : '. For a kid voice, open the app in Microsoft Edge (it has a free kid voice called Ana).');
    } else if (!voices.length) {
      note.textContent = 'No computer voices found yet on this device. You can record your own voice below.';
    } else {
      note.textContent = 'This device only has robot-like computer voices. For a kid voice, open the app in Microsoft Edge (it has a free kid voice called Ana), or record your own voice below.';
    }
  }

  /* ---------- voice studio: a grown-up records the real voice ---------- */
  var studio = $('#studio');
  var studioList = $('#studioList');
  var studioStatus = $('#studioStatus');
  var rec = null;
  function clipPhrases(L) {
    var a = ANIMALS[L], ex = EXTRA[L] || { sound: 'Hello!' };
    return [
      { key: 'cap:' + L, text: 'Capital ' + L, hint: 'Say “Capital ' + L + '”' },
      { key: 'small:' + L, text: 'Small ' + L.toLowerCase(), hint: 'Say “Small ' + L + '”' },
      { key: 'word:' + L, text: L + ' is for ' + a.name + '!', hint: 'Say the sentence' },
      { key: 'sound:' + L, text: ex.sound, hint: a.name + ' sound' }
    ];
  }
  var MIC = '<svg class="icon i-mic" aria-hidden="true"><use href="#i-mic"/></svg><svg class="icon solid i-stop" aria-hidden="true"><use href="#i-stop"/></svg>';
  function renderStudio() {
    var html = '', n = 0;
    ALPHA.forEach(function (L, i) {
      var t = TILES[i % TILES.length];
      html += '<div class="srow"><span class="schip" style="background:' + t.bg + ';color:' + t.ink + '">' + L + L.toLowerCase() + '</span><div class="sclips">';
      clipPhrases(L).forEach(function (p) {
        var has = !!clipURLs[p.key];
        var isShared = !!shared.keys[p.key];
        if (has) n++;
        var state = has ? 'Recorded on this device' : isShared ? 'In the shared kid voice' : p.hint;
        html += '<div class="clip' + (has ? ' has' : '') + (isShared && !has ? ' shared' : '') + '" data-key="' + p.key + '">' +
          '<button type="button" class="rec" aria-label="' + (has || isShared ? 'Record again: ' : 'Record: ') + p.text + '">' + MIC + '</button>' +
          '<span class="clip-text"><b>' + p.text + '</b><small>' + state + '</small></span>' +
          (has || isShared ? '<button type="button" class="play" aria-label="Play ' + p.text + '"><svg class="icon solid" aria-hidden="true"><use href="#i-play"/></svg></button>' : '') +
          (has ? '<button type="button" class="del" aria-label="Delete recording ' + p.text + '"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button>' : '') +
          '</div>';
      });
      html += '</div></div>';
    });
    studioList.innerHTML = html;
    var sn = Object.keys(shared.keys).length;
    $('#studioCount').textContent = n + ' of 104 recorded on this device' + (sn ? ' · ' + sn + ' shared with everyone' : '');
  }
  function studioSay(t) { studioStatus.textContent = t; }
  function stopRec() {
    if (!rec) return;
    clearTimeout(rec.timer);
    try { if (rec.mr.state !== 'inactive') rec.mr.stop(); } catch (e) {}
    studioList.querySelectorAll('.clip.is-rec').forEach(function (c) { c.classList.remove('is-rec'); });
    rec = null;
  }
  function startRec(cell) {
    var key = cell.dataset.key;
    if (rec) { var same = rec.key === key; stopRec(); if (same) return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      studioSay('This browser cannot record. Try Chrome, Edge or Safari.');
      return;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(function (stream) {
      var chunks = [];
      var mr = new MediaRecorder(stream);
      mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = function () {
        stream.getTracks().forEach(function (t) { t.stop(); });
        var blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
        if (blob.size < 1500) { studioSay('That was too short. Tap the red button and try again.'); renderStudio(); return; }
        saveClip(key, blob).then(function () {
          studioSay('Saved! Listen to check it.');
          renderStudio(); renderVoicePicker();
          playClip(key);
        }).catch(function () { studioSay('Could not save that recording on this device.'); });
      };
      rec = { mr: mr, key: key, timer: setTimeout(stopRec, 6000) };
      mr.start();
      var live = studioList.querySelector('.clip[data-key="' + key + '"]');
      if (live) live.classList.add('is-rec');
      studioSay('Recording... say it now, then tap the button again to stop.');
    }).catch(function () {
      studioSay('Please allow the microphone so you can record your voice.');
    });
  }
  studioList.addEventListener('click', function (e) {
    var cell = e.target.closest('.clip'); if (!cell) return;
    var key = cell.dataset.key;
    if (e.target.closest('.rec')) { startRec(cell); return; }
    if (e.target.closest('.play')) { playClip(key); return; }
    if (e.target.closest('.del')) { deleteClip(key).then(function () { studioSay('Recording deleted.'); renderStudio(); renderVoicePicker(); }); }
  });
  studio.addEventListener('close', function () { stopRec(); studioSay(''); });

  // Upload this device's recordings as the shared kid voice for every device.
  var publishing = false;
  $('#publishBtn').addEventListener('click', function () {
    if (publishing) return;
    var code = $('#adminCode').value.trim();
    var keys = Object.keys(clipURLs).filter(function (k) { return /^(cap|small|word|sound):[A-Z]$/.test(k); });
    if (!keys.length) { studioSay('Record some phrases first, then share them.'); return; }
    if (!code) { studioSay('Type the grown-up code first.'); $('#adminCode').focus(); return; }
    publishing = true;
    studioSay('Checking the code...');
    fetch('/api/voice/check', { method: 'POST', headers: { 'X-Admin-Code': code } }).then(function (r) {
      if (r.status === 403) throw new Error('That code is not right. Check it and try again.');
      if (!r.ok) throw new Error('Sharing is not ready on the server yet.');
      var done = 0;
      return keys.reduce(function (p, k) {
        return p.then(function () {
          return fetch(clipURLs[k]).then(function (r2) { return r2.blob(); }).then(function (blob) {
            return fetch('/api/voice/clip?k=' + encodeURIComponent(k), {
              method: 'PUT', headers: { 'X-Admin-Code': code, 'Content-Type': blob.type || 'audio/webm' }, body: blob
            });
          }).then(function (r3) {
            if (!r3.ok) throw new Error('Could not upload “' + k + '”. Try again.');
            done++;
            studioSay('Sharing... ' + done + ' of ' + keys.length);
          });
        });
      }, Promise.resolve());
    }).then(function () {
      return loadShared();
    }).then(function () {
      studioSay('Shared! Every device now hears these ' + keys.length + ' recordings.');
      renderStudio();
    }).catch(function (e) {
      studioSay(e && e.message ? e.message : 'Could not share. Try again.');
    }).then(function () { publishing = false; });
  });

  /* ---------- wire up ---------- */
  board.addEventListener('pointerdown', onDown);
  board.addEventListener('pointermove', onMove);
  board.addEventListener('pointerup', onUp);
  board.addEventListener('pointercancel', onUp);
  board.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  reward.addEventListener('pointerdown', function (e) { e.stopPropagation(); });

  if ('ResizeObserver' in window) new ResizeObserver(function () { sizeCanvas(); }).observe(board);
  else window.addEventListener('resize', sizeCanvas);

  $('#prevBtn').addEventListener('click', function () { unlockAudio(); pop(); go(save.index - 1); });
  $('#nextLetterBtn').addEventListener('click', function () { unlockAudio(); pop(); go(save.index + 1); });
  $('#nextBtn').addEventListener('click', function () { unlockAudio(); pop(); go(save.index + 1); });
  $('#againBtn').addEventListener('click', function () { unlockAudio(); pop(); go(save.index, true); });
  $('#clearBtn').addEventListener('click', function () { unlockAudio(); pop(); buildLetter(); });
  $('#demoBtn').addEventListener('click', function () {
    unlockAudio();
    if (T.complete) buildLetter();
    playDemo();
  });
  $('#sayLetter').addEventListener('click', function () {
    unlockAudio(); sayLetter();
    var c = $('#sayLetter'); c.classList.remove('wiggle'); void c.offsetWidth; c.classList.add('wiggle');
  });

  document.querySelectorAll('.case-switch button').forEach(function (b) {
    b.addEventListener('click', function () {
      unlockAudio();
      if (save.case === b.dataset.case) return;
      save.case = b.dataset.case; persist();
      pop();
      buildLetter(); renderGrid(); sayLetter(); maybeDemo();
    });
  });

  document.querySelectorAll('.crayon').forEach(function (c) {
    c.addEventListener('click', function () {
      unlockAudio();
      save.ink = c.dataset.ink; persist(); syncSettings(); pop();
    });
  });

  document.querySelectorAll('.tab').forEach(function (t) {
    t.addEventListener('click', function () { unlockAudio(); setTab(t.dataset.tab); });
  });

  letterGrid.addEventListener('click', function (e) {
    var b = e.target.closest('.ltile'); if (!b) return;
    unlockAudio(); pop();
    setTab('trace');
    go(Number(b.dataset.i));
  });

  zooGrid.addEventListener('click', function (e) {
    var b = e.target.closest('.zcard'); if (!b) return;
    unlockAudio();
    var i = Number(b.dataset.i), L = ALPHA[i], a = ANIMALS[L];
    if (b.classList.contains('locked')) {
      boop();
      setTab('trace'); go(i, true);
      say('Trace ' + L + ' to hatch this egg!');
      return;
    }
    b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing');
    greet(L);
    void a;
  });
  $('#startTracing').addEventListener('click', function () { setTab('trace'); });

  var dlg = $('#grownups');
  $('#openGrownups').addEventListener('click', function () {
    syncSettings();
    renderVoicePicker();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  });
  document.querySelectorAll('[data-setting]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.setting;
      save.settings[k] = !save.settings[k]; persist(); syncSettings();
      if (k === 'sound' && save.settings.sound) { unlockAudio(); chime(2); }
      if (k === 'voice' && save.settings.voice) say('Hello! Let us write some letters.');
    });
  });
  document.querySelectorAll('[data-helper]').forEach(function (b) {
    b.addEventListener('click', function () { save.settings.helper = b.dataset.helper; persist(); syncSettings(); });
  });
  $('#nightSwitch').addEventListener('click', function () { setTimeout(syncSettings, 0); });
  $('#voiceSelect').addEventListener('change', function (e) {
    save.settings.voiceName = e.target.value; persist();
    pickVoice();
    say('Hi! I can help you write your letters.');
  });
  $('#voiceTry').addEventListener('click', function () {
    unlockAudio();
    var L = ALPHA[save.index];
    say(L + ' is for ' + ANIMALS[L].name + '!', 'word:' + L);
  });
  $('#openStudio').addEventListener('click', function () {
    if (dlg.close) dlg.close();
    renderStudio();
    if (studio.showModal) studio.showModal(); else studio.setAttribute('open', '');
  });
  $('#resetBtn').addEventListener('click', function () {
    if (!window.confirm('Start the zoo over? All stars and hatched animals on this device will be cleared.')) return;
    save.done = {}; save.newFriends = 0; save.fresh = []; save.fed = {}; save.points = 0; persist();
    updatePointsPill();
    updateBadge(); renderGrid(); renderZoo(); renderHabitat(); buildLetter();
    if (dlg.close) dlg.close();
  });

  document.addEventListener('keydown', function (e) {
    if (dlg.open || !screenTrace.classList.contains('is-active')) return;
    if (e.key === 'ArrowLeft') go(save.index - 1);
    if (e.key === 'ArrowRight') go(save.index + 1);
  });

  /* ---------- start ---------- */
  loadClips().then(function () { renderVoicePicker(); });
  loadShared();
  updatePointsPill();
  logEvent('visit');
  setInterval(function () { if (document.visibilityState === 'visible') logEvent('ping'); }, 45000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') logEvent('ping'); });
  sizeCanvas();
  syncSettings();
  updateBadge();
  buildLetter();
  renderGrid();
  renderZoo();
  maybeDemo();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }
})();
