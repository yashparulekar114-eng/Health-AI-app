(function () {
  'use strict';
  var GOALS = { water: 1800, walk: 30, meals: 3 };
  var $ = function (id) { return document.getElementById(id); };
  var P = window.KaljiParser;

  // ---- IST date helpers (never the browser's local zone) ----
  function istParts() {
    var f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
    var o = {}; f.formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { date: o.year + '-' + o.month + '-' + o.day, hour: parseInt(o.hour, 10) % 24, minute: parseInt(o.minute, 10) };
  }

  // ---- storage (made-up data only, stays in this browser) ----
  var KEY = 'kalji.v1';
  function load() { try { var d = JSON.parse(localStorage.getItem(KEY)) || {}; return d; } catch (e) { return {}; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function today() { var d = load(), k = istParts().date; if (!d[k]) d[k] = { entries: [] }; return { all: d, key: k, day: d[k] }; }

  function totals(day) {
    var t = { meals: [], lo: 0, hi: 0, water: 0, walk: 0, meds: null, symptoms: [], red: null };
    day.entries.forEach(function (e) {
      e.meals.forEach(function (m) { t.meals.push(m); t.lo += m.kcal_low; t.hi += m.kcal_high; });
      t.water += e.water_ml || 0; t.walk += e.walk_min || 0;
      (e.meds || []).forEach(function (m) { if (m.status !== 'unclear') t.meds = m.status; });
      (e.symptoms || []).forEach(function (s) { if (t.symptoms.indexOf(s) < 0) t.symptoms.push(s); });
      if (e.red_flag) t.red = e.red_flag;
    });
    return t;
  }

  // ---- live AI (optional); deterministic parser is always the fallback + safety net ----
  var live = false;
  function withTimeout(p, ms) { return new Promise(function (res, rej) { var t = setTimeout(function () { rej(new Error('timeout')); }, ms); p.then(function (v) { clearTimeout(t); res(v); }, function (e) { clearTimeout(t); rej(e); }); }); }
  function analyse(text) {
    var local = P.parse(text);
    return withTimeout(fetch('api/parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text }) }).then(function (r) {
      if (!r.ok) throw new Error('no live ai'); return r.json();
    }), 8000).then(function (ai) {
      if (!ai || !Array.isArray(ai.meals)) throw new Error('bad shape');
      ai.source = 'live';
      ai.red_flag = local.red_flag || ai.red_flag || null; // safety: rules can only add a red flag, never lose one
      live = true; return ai;
    }).catch(function () { live = false; return local; });
  }

  function setMode() { $('mode').textContent = live ? 'AI mode: live model reads the message; safety rules run on top.' : 'AI mode: demo (built-in Hinglish parser, works offline). Live AI is used when the server key is set.'; }

  // ---- Papa's side ----
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function ack(r) {
    var bits = [];
    if (r.meals.length) bits.push('khana: ' + r.meals.map(function (m) { return esc(m.name); }).join(', '));
    if (r.water_ml) bits.push('pani: ' + r.water_ml + ' ml');
    if (r.walk_min) bits.push('walk: ' + r.walk_min + ' min');
    if (r.meds.length && r.meds[0].status !== 'unclear') bits.push('goli: ' + (r.meds[0].status === 'taken' ? 'li' : 'chhoot gayi'));
    if (r.symptoms.length) bits.push(esc(r.symptoms.join(', ')));
    return bits.length ? 'Likh liya ✔ ' + bits.join(' · ') : '';
  }
  function showReply(r) {
    var h = '';
    if (r.red_flag) h += '<div class="alert" role="alert"><b>Yeh serious ho sakta hai (' + esc(r.red_flag) + ').</b><br>Abhi doctor ko dikhao ya <a href="tel:108">108 call karo</a>. Kalji doctor nahi hai, aur is par wait mat karo.</div>';
    var a = ack(r);
    if (a) h += '<div class="reply">' + a + '</div>';
    if (r.unclear.length) h += '<div class="reply"><div class="q">' + esc(r.unclear[0]) + '</div></div>';
    $('reply').innerHTML = h;
  }
  function send() {
    var text = $('msg').value.trim(); if (!text) return;
    $('send').disabled = true;
    analyse(text).then(function (r) {
      var t = today(); r.text = text; r.at = istParts().hour + ':' + String(istParts().minute).padStart(2, '0');
      if (r.meals.length || r.water_ml || r.walk_min || r.meds.length || r.symptoms.length || r.red_flag) { t.day.entries.push(r); save(t.all); }
      showReply(r); $('msg').value = ''; setMode(); render(); $('send').disabled = false;
    });
  }

  // ---- child's side ----
  function bar(id, v, g) { $(id).style.width = Math.min(100, Math.round(v / g * 100)) + '%'; }
  function render() {
    var t = totals(today().day), ip = istParts();
    $('meals').innerHTML = t.meals.length ? t.meals.map(function (m) { return '<li>' + esc(m.name) + (m.qty !== 1 ? ' × ' + m.qty : '') + ' <span class="muted">' + m.kcal_low + '–' + m.kcal_high + ' kcal</span>' + m.flags.map(function (f) { return '<span class="tag">' + esc(f) + '</span>'; }).join('') + '</li>'; }).join('') : '<li class="muted">Nothing logged yet</li>';
    $('kcal').textContent = t.meals.length ? 'About ' + t.lo + '–' + t.hi + ' kcal so far (estimate)' : '';
    bar('water-bar', t.water, GOALS.water); $('water-txt').textContent = t.water + ' of ' + GOALS.water + ' ml';
    bar('walk-bar', t.walk, GOALS.walk); $('walk-txt').textContent = t.walk + ' of ' + GOALS.walk + ' min';
    $('med-txt').innerHTML = t.meds === 'taken' ? '<span class="ok">Taken ✔</span>' : t.meds === 'missed' ? '<span class="bad">Missed. Please call him.</span>' : '<span class="muted">Not mentioned yet</span>';
    $('sym-txt').innerHTML = t.symptoms.length ? '<span class="warn">' + esc(t.symptoms.join(', ')) + '</span>' : '<span class="muted">Nothing reported</span>';

    var s = [];
    if (t.red) s.push('<b class="bad">Papa reported ' + esc(t.red) + '. Call him now; if unreachable, call 108.</b>');
    s.push(t.meals.length >= GOALS.meals ? 'Meals: ' + t.meals.length + ' items logged, looks regular.' : 'Meals: ' + t.meals.length + ' items so far' + (ip.hour >= 14 && !t.meals.length ? ' <span class="warn">(nothing since morning)</span>' : '') + '.');
    s.push('Water ' + Math.round(t.water / GOALS.water * 100) + '% · Walk ' + Math.round(t.walk / GOALS.walk * 100) + '% of goal.');
    var watch = [];
    if (t.meds === 'missed') watch.push('missed medicine');
    t.symptoms.forEach(function (x) { watch.push(x); });
    t.meals.forEach(function (m) { if (m.flags.indexOf('high sugar') >= 0) watch.push('sweets (sugar)'); });
    s.push(watch.length ? '<span class="warn">Watch: ' + esc(watch.filter(function (v, i, a) { return a.indexOf(v) === i; }).join(', ')) + '.</span>' : 'Nothing to worry about so far.');
    $('summary').innerHTML = s.map(function (x) { return '<li>' + x + '</li>'; }).join('');

    // proactive nudge: Kalji decides what to ask next, and drafts the message for the child to send
    var q = null;
    if (t.meds === null && ip.hour >= 10) q = 'Papa, aaj ki goli li? Bas "li" ya "nahi" bhej do 🙏';
    else if (!t.meals.length && ip.hour >= 14) q = 'Papa, lunch ho gaya? Kya khaya, ek line me bhej do 🙏';
    else if (t.water < GOALS.water / 2 && ip.hour >= 15) q = 'Papa, pani peena mat bhoolna. Abhi ek glass pi lo 🙏';
    else if (!t.walk && ip.hour >= 17) q = 'Papa, shaam ko 15-20 min walk ho jaye? Phir mujhe bata dena 🙏';
    var n = $('nudge');
    if (q) { n.className = 'card nudge'; n.innerHTML = '<h3>Suggested nudge (' + ip.hour + ':' + String(ip.minute).padStart(2, '0') + ' IST)</h3><p>' + esc(q) + '</p><a class="secondary" style="display:inline-block;padding:.5rem 1rem;border:2px solid var(--teal);border-radius:12px;text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(q) + '">Send on WhatsApp</a>'; }
    else { n.className = 'card nudge ok'; n.innerHTML = '<h3>Nudge</h3><p>Nothing to nudge right now.</p>'; }
  }

  // ---- wiring ----
  function tab(which) {
    var papa = which === 'papa';
    $('view-papa').hidden = !papa; $('view-me').hidden = papa;
    $('tab-papa').setAttribute('aria-selected', papa); $('tab-me').setAttribute('aria-selected', !papa);
    if (!papa) render();
  }
  $('tab-papa').onclick = function () { tab('papa'); };
  $('tab-me').onclick = function () { tab('me'); };
  $('send').onclick = send;
  $('msg').addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send(); });

  var EX = ['subah 2 idli aur chai, 30 min walk', 'dopahar 3 roti dal sabzi, 4 glass pani', 'BP ki goli bhool gaye', 'chakkar aa raha hai', 'shaadi me jalebi aur samosa khaya', 'seene me dard ho raha hai'];
  EX.forEach(function (x) { var b = document.createElement('button'); b.type = 'button'; b.textContent = x; b.onclick = function () { $('msg').value = x; $('msg').focus(); }; document.querySelector('.chips').appendChild(b); });

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { $('mic').hidden = true; } else {
    $('mic').onclick = function () { var r = new SR(); r.lang = 'hi-IN'; r.interimResults = false; r.onresult = function (e) { $('msg').value = (($('msg').value + ' ') + e.results[0][0].transcript).trim(); }; r.onerror = function () { $('reply').innerHTML = '<div class="reply">Mic kaam nahi kar raha. Please type kar do.</div>'; }; r.start(); };
  }

  $('sample').onclick = function () {
    var t = today(); t.day.entries = [];
    ['subah 2 idli aur chai li, 30 min walk kiya', 'goli li', '2 roti dal sabzi khayi, 3 glass pani piya', 'shaam ko jalebi khayi, thoda chakkar aa raha hai'].forEach(function (m) { var r = P.parse(m); r.text = m; t.day.entries.push(r); });
    save(t.all); render();
  };
  $('clear').onclick = function () { var t = today(); t.all[t.key] = { entries: [] }; save(t.all); render(); $('reply').innerHTML = ''; };

  setMode(); render();
})();
