(function () {
  'use strict';
  var GOALS = { water: 1800, walk: 30, meals: 3 };
  var $ = function (id) { return document.getElementById(id); };
  var P = window.KaljiParser;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  // ---- language: English (default) / Hinglish ----
  var LANG = (function () { try { return localStorage.getItem('kalji.lang') === 'hi' ? 'hi' : 'en'; } catch (e) { return 'en'; } })();
  var T = {
    en: {
      notice: 'Kalji is not medical advice. It does not diagnose or prescribe. All data here is made up. In an emergency call <b>108</b>.',
      sub: 'Dad sends one message. You get his day in three lines.',
      tabPapa: "Dad's message", tabMe: 'Today (for you)',
      prompt: '👇 Tap a button to log it. No typing needed.', prompt2: 'Or type or say it yourself, then press Send:', quickH: 'Quick log',
      quick: [['💊 Took my tablet','I took my tablet'],['🚶 Walked 30 min','I walked 30 min'],['💧 A glass of water','I drank 1 glass of water'],['🍳 2 idli and tea','2 idli and tea'],['🍚 Roti, dal, sabzi','2 roti, dal and sabzi'],['⚠️ Missed my tablet','I forgot my tablet']],
      ph: 'e.g. 2 idli and tea for breakfast, walked 30 min, took my tablet',
      mic: '🎤 Speak', send: 'Send', today: "Dad's day so far",
      hMeals: 'Meals', hWater: 'Water', hWalk: 'Walk', hMed: 'Medicine', hFeel: 'How he feels',
      sample: 'Load a sample day', clear: 'Clear today',
      foot: 'Demo profile (made up): Dad, 68, type 2 diabetes and high blood pressure. Goals: 1.8 L water, 30 min walk, 3 meals, morning medicine. Calories are ranges, not exact. See <a href="REPORT.md">the report</a>.',
      noted: 'Noted ✔ ', fFood: 'food', fWater: 'water', fWalk: 'walk', fMed: 'medicine', taken: 'taken', missed: 'missed',
      alert1: 'This could be serious', alert2: 'See a doctor now or <a href="tel:108">call 108</a>. Kalji is not a doctor, so please do not wait on this.',
      q_walk: 'You mentioned a walk. How many minutes?', q_med: 'You mentioned medicine. Did you take it, or miss it?', q_dish: 'You ate something, but I did not recognise the dish. What was it?', q_nothing: 'I could not find food, water, a walk, medicine or a symptom in that message. Please try again.', q_empty: 'Please type something first.',
      micErr: 'The mic is not working. Please type instead.',
      sNoData: 'No update from Dad yet today. That is not an alarm: he may be busy or resting. An alert appears only when a message mentions a warning sign.',
      nothingYet: 'Nothing logged yet', kcalSoFar: 'About {a}–{b} kcal so far (estimate)', waterOf: '{a} of {b} ml', walkOf: '{a} of {b} min',
      medTaken: 'Taken ✔', medMissed: 'Missed. Please call him.', medNone: 'Not mentioned yet', symNone: 'Nothing reported',
      sRed: 'Dad reported {x}. Call him now; if unreachable, call 108.', sMeals: 'Meals: {n} items logged, looks regular.', sMealsSo: 'Meals: {n} items so far', sNoLunch: ' (nothing since morning)',
      sGoal: 'Water {w}% · Walk {k}% of goal.', sWatch: 'Watch: {x}.', sOk: 'Nothing to worry about so far.', wMed: 'missed medicine', wSweet: 'sweets (sugar)',
      nudgeH: 'Suggested nudge ({t} IST)', nudgeNone: 'Nothing to nudge right now.', nudgeBtn: 'Send on WhatsApp', nudgeT: 'Nudge',
      n_med: 'Dad, did you take your tablet today? Just reply "yes" or "no" 🙏', n_lunch: 'Dad, have you had lunch? Tell me what you ate in one line 🙏', n_water: 'Dad, please remember to drink water. Have a glass now 🙏', n_walk: 'Dad, how about a 15-20 min walk this evening? Tell me after 🙏',
      chips: ['2 idli and tea, walked 30 min', '3 roti, dal and sabzi, 4 glasses of water', 'I forgot my BP tablet', 'I feel dizzy', 'Had jalebi and samosa at a wedding', 'I have chest pain'],
      mode: 'AI mode: demo (built-in parser, works offline). Live AI is used when the server key is set.', modeLive: 'AI mode: live model reads the message; safety rules run on top.'
    },
    hi: {
      notice: 'Kalji medical advice nahi hai. Yeh diagnose ya dawai prescribe nahi karta. Yahan ka saara data made-up hai. Emergency me <b>108</b> call karo.',
      sub: 'Papa ek message bhejte hain. Aapko unka din teen lines me mil jata hai.',
      tabPapa: 'Papa ka message', tabMe: 'Aaj (aapke liye)',
      prompt: '👇 Button dabao, log ho jayega. Likhna nahi padega.', prompt2: 'Ya khud likho ya bolo, phir Bhejo dabao:', quickH: 'Jaldi log karo',
      quick: [['💊 Goli li','goli li'],['🚶 30 min walk','30 min walk kiya'],['💧 Ek glass pani','1 glass pani piya'],['🍳 2 idli aur chai','2 idli aur chai'],['🍚 Roti dal sabzi','2 roti dal sabzi khayi'],['⚠️ Goli bhool gaye','goli bhool gaye']],
      ph: 'jaise: subah 2 idli aur chai, 30 min walk, goli li',
      mic: '🎤 Bolo', send: 'Bhejo', today: 'Papa ka aaj ka din abhi tak',
      hMeals: 'Khana', hWater: 'Pani', hWalk: 'Walk', hMed: 'Dawai', hFeel: 'Tabiyat',
      sample: 'Sample din load karo', clear: 'Aaj ka clear karo',
      foot: 'Demo profile (made-up): Papa, 68, type 2 diabetes aur high BP. Goals: 1.8 L pani, 30 min walk, 3 meals, subah ki dawai. Calories ek range hai, exact nahi. Dekho <a href="REPORT.md">report</a>.',
      noted: 'Likh liya ✔ ', fFood: 'khana', fWater: 'pani', fWalk: 'walk', fMed: 'goli', taken: 'li', missed: 'chhoot gayi',
      alert1: 'Yeh serious ho sakta hai', alert2: 'Abhi doctor ko dikhao ya <a href="tel:108">108 call karo</a>. Kalji doctor nahi hai, aur is par wait mat karo.',
      q_walk: 'Walk ki baat ki, kitne minute?', q_med: 'Dawai ki baat ki, li ya chhoot gayi?', q_dish: 'Kuch khaya, par mujhe dish samajh nahi aayi. Kya khaya tha?', q_nothing: 'Is message me khana, pani, walk, dawai ya koi takleef nahi mili. Dobara likho.', q_empty: 'Pehle kuch likho.',
      micErr: 'Mic kaam nahi kar raha. Please type kar do.',
      sNoData: 'Papa ka aaj abhi tak koi update nahi aaya. Yeh alarm nahi hai: ho sakta hai busy ya aaram kar rahe hon. Alert tab aata hai jab message me koi warning sign ho.',
      nothingYet: 'Abhi kuch log nahi hua', kcalSoFar: 'Abhi tak lagbhag {a}–{b} kcal (andaza)', waterOf: '{b} ml me se {a} ml', walkOf: '{b} min me se {a} min',
      medTaken: 'Li ✔', medMissed: 'Chhoot gayi. Please unhe call karo.', medNone: 'Abhi bataya nahi', symNone: 'Koi takleef nahi batayi',
      sRed: 'Papa ne {x} bataya. Abhi call karo; na lage to 108.', sMeals: 'Khana: {n} items, theek lag raha hai.', sMealsSo: 'Khana: abhi tak {n} items', sNoLunch: ' (subah ke baad kuch nahi)',
      sGoal: 'Pani {w}% · Walk {k}% goal ka.', sWatch: 'Dhyan do: {x}.', sOk: 'Abhi tak sab theek lag raha hai.', wMed: 'dawai chhoot gayi', wSweet: 'meetha (sugar)',
      nudgeH: 'Suggested nudge ({t} IST)', nudgeNone: 'Abhi koi nudge nahi chahiye.', nudgeBtn: 'WhatsApp pe bhejo', nudgeT: 'Nudge',
      n_med: 'Papa, aaj ki goli li? Bas "li" ya "nahi" bhej do 🙏', n_lunch: 'Papa, lunch ho gaya? Kya khaya, ek line me bhej do 🙏', n_water: 'Papa, pani peena mat bhoolna. Abhi ek glass pi lo 🙏', n_walk: 'Papa, shaam ko 15-20 min walk ho jaye? Phir mujhe bata dena 🙏',
      chips: ['subah 2 idli aur chai, 30 min walk', 'dopahar 3 roti dal sabzi, 4 glass pani', 'BP ki goli bhool gaye', 'chakkar aa raha hai', 'shaadi me jalebi aur samosa khaya', 'seene me dard ho raha hai'],
      mode: 'AI mode: demo (built-in Hinglish parser, offline chalta hai). Server key ho to live AI use hota hai.', modeLive: 'AI mode: live model message padhta hai; safety rules upar se chalte hain.'
    }
  };
  function tr(k, v) { var s = (T[LANG][k] !== undefined ? T[LANG][k] : T.en[k]); if (typeof s !== 'string') return s; if (v) Object.keys(v).forEach(function (x) { s = s.replace('{' + x + '}', v[x]); }); return s; }
  var SYMTR = { hi: { 'dizziness': 'chakkar', 'headache': 'sar dard', 'weakness / tiredness': 'kamzori / thakaan', 'stomach upset': 'pet kharab', 'cough': 'khansi', 'fever': 'bukhar', 'joint pain': 'jodon me dard', 'poor sleep': 'neend nahi aayi', 'nausea': 'ulti jaisa' } };
  function symName(x) { return LANG === 'hi' && SYMTR.hi[x] ? SYMTR.hi[x] : x; }
  function applyLang() {
    document.documentElement.lang = LANG === 'hi' ? 'hi-Latn' : 'en';
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) { var v = tr(el.getAttribute('data-i18n')); if (el.hasAttribute('data-html')) el.innerHTML = v; else el.textContent = v; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-ph]'), function (el) { el.placeholder = tr(el.getAttribute('data-i18n-ph')); });
    $('lang-en').setAttribute('aria-pressed', LANG === 'en'); $('lang-hi').setAttribute('aria-pressed', LANG === 'hi');
    var qk = $('quick'); qk.innerHTML = '';
    tr('quick').forEach(function (x) { var b = document.createElement('button'); b.type = 'button'; b.className = 'q'; b.textContent = x[0]; b.onclick = function () { send(x[1]); }; qk.appendChild(b); });
    var c = document.querySelector('.chips'); c.innerHTML = '';
    tr('chips').forEach(function (x) { var b = document.createElement('button'); b.type = 'button'; b.textContent = x; b.onclick = function () { $('msg').value = x; $('msg').focus(); }; c.appendChild(b); });
    if (SR) { /* mic language */ }
    setMode(); render();
  }
  function setLang(l) { LANG = l; try { localStorage.setItem('kalji.lang', l); } catch (e) {} $('reply').innerHTML = ''; applyLang(); }

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

  function setMode() { $('mode').textContent = live ? tr('modeLive') : tr('mode'); }

  // ---- Papa's side ----
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function ack(r) {
    var bits = [];
    if (r.meals.length) bits.push(tr('fFood') + ': ' + r.meals.map(function (m) { return esc(m.name); }).join(', '));
    if (r.water_ml) bits.push(tr('fWater') + ': ' + r.water_ml + ' ml');
    if (r.walk_min) bits.push(tr('fWalk') + ': ' + r.walk_min + ' min');
    if (r.meds.length && r.meds[0].status !== 'unclear') bits.push(tr('fMed') + ': ' + tr(r.meds[0].status === 'taken' ? 'taken' : 'missed'));
    if (r.symptoms.length) bits.push(esc(r.symptoms.map(symName).join(', ')));
    return bits.length ? tr('noted') + bits.join(' · ') : '';
  }
  function question(r) {
    var code = (r.unclear_codes || [])[0];
    return code ? tr('q_' + code) : (r.unclear[0] || '');
  }
  function showReply(r) {
    var h = '';
    if (r.red_flag) h += '<div class="alert" role="alert"><b>' + tr('alert1') + ' (' + esc(r.red_flag) + ').</b><br>' + tr('alert2') + '</div>';
    var a = ack(r);
    if (a) h += '<div class="reply">' + a + '</div>';
    if (r.unclear.length) h += '<div class="reply"><div class="q">' + esc(question(r)) + '</div></div>';
    $('reply').innerHTML = h;
  }
  function send(preset) {
    var text = (typeof preset === 'string' ? preset : $('msg').value).trim(); if (!text) return;
    $('send').disabled = true;
    analyse(text).then(function (r) {
      var t = today(); r.text = text; r.at = istParts().hour + ':' + String(istParts().minute).padStart(2, '0');
      if (r.meals.length || r.water_ml || r.walk_min || r.meds.length || r.symptoms.length || r.red_flag) { t.day.entries.push(r); save(t.all); }
      showReply(r); if (typeof preset !== 'string') $('msg').value = ''; setMode(); render(); $('send').disabled = false;
    });
  }

  // ---- child's side ----
  function bar(id, v, g) { $(id).style.width = Math.min(100, Math.round(v / g * 100)) + '%'; }
  function render() {
    var t = totals(today().day), ip = istParts();
    $('meals').innerHTML = t.meals.length ? t.meals.map(function (m) { return '<li>' + esc(m.name) + (m.qty !== 1 ? ' × ' + m.qty : '') + ' <span class="muted">' + m.kcal_low + '–' + m.kcal_high + ' kcal</span>' + m.flags.map(function (f) { return '<span class="tag">' + esc(f) + '</span>'; }).join('') + '</li>'; }).join('') : '<li class="muted">' + tr('nothingYet') + '</li>';
    $('kcal').textContent = t.meals.length ? tr('kcalSoFar', { a: t.lo, b: t.hi }) : '';
    bar('water-bar', t.water, GOALS.water); $('water-txt').textContent = tr('waterOf', { a: t.water, b: GOALS.water });
    bar('walk-bar', t.walk, GOALS.walk); $('walk-txt').textContent = tr('walkOf', { a: t.walk, b: GOALS.walk });
    $('med-txt').innerHTML = t.meds === 'taken' ? '<span class="ok">' + tr('medTaken') + '</span>' : t.meds === 'missed' ? '<span class="bad">' + tr('medMissed') + '</span>' : '<span class="muted">' + tr('medNone') + '</span>';
    $('sym-txt').innerHTML = t.symptoms.length ? '<span class="warn">' + esc(t.symptoms.map(symName).join(', ')) + '</span>' : '<span class="muted">' + tr('symNone') + '</span>';

    var s = [];
    if (t.red) s.push('<b class="bad">' + esc(tr('sRed', { x: t.red })) + '</b>');
    s.push(t.meals.length >= GOALS.meals ? tr('sMeals', { n: t.meals.length }) : tr('sMealsSo', { n: t.meals.length }) + (ip.hour >= 14 && !t.meals.length ? '<span class="warn">' + tr('sNoLunch') + '</span>' : '') + '.');
    s.push(tr('sGoal', { w: Math.round(t.water / GOALS.water * 100), k: Math.round(t.walk / GOALS.walk * 100) }));
    var watch = [];
    if (t.meds === 'missed') watch.push(tr('wMed'));
    t.symptoms.forEach(function (x) { watch.push(symName(x)); });
    t.meals.forEach(function (m) { if (m.flags.indexOf('high sugar') >= 0) watch.push(tr('wSweet')); });
    s.push(watch.length ? '<span class="warn">' + esc(tr('sWatch', { x: watch.filter(function (v, i, a) { return a.indexOf(v) === i; }).join(', ') })) + '</span>' : tr('sOk'));
    if (!today().day.entries.length) s = [tr('sNoData')];
    $('summary').innerHTML = s.map(function (x) { return '<li>' + x + '</li>'; }).join('');

    // proactive nudge: Kalji decides what to ask next, and drafts the message for the child to send
    var q = null;
    if (t.meds === null && ip.hour >= 10) q = tr('n_med');
    else if (!t.meals.length && ip.hour >= 14) q = tr('n_lunch');
    else if (t.water < GOALS.water / 2 && ip.hour >= 15) q = tr('n_water');
    else if (!t.walk && ip.hour >= 17) q = tr('n_walk');
    var n = $('nudge');
    if (q) { n.className = 'card nudge'; n.innerHTML = '<h3>' + tr('nudgeH', { t: ip.hour + ':' + String(ip.minute).padStart(2, '0') }) + '</h3><p>' + esc(q) + '</p><a class="secondary" style="display:inline-block;padding:.5rem 1rem;border:2px solid var(--teal);border-radius:12px;text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(q) + '">' + tr('nudgeBtn') + '</a>'; }
    else { n.className = 'card nudge ok'; n.innerHTML = '<h3>' + tr('nudgeT') + '</h3><p>' + tr('nudgeNone') + '</p>'; }
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
  $('send').onclick = function () { send(); };
  $('msg').addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });

  if (!SR) { $('mic').hidden = true; } else {
    $('mic').onclick = function () { var r = new SR(); r.lang = LANG === 'hi' ? 'hi-IN' : 'en-IN'; r.interimResults = false; r.onresult = function (e) { $('msg').value = (($('msg').value + ' ') + e.results[0][0].transcript).trim(); }; r.onerror = function () { $('reply').innerHTML = '<div class="reply">' + tr('micErr') + '</div>'; }; r.start(); };
  }
  $('lang-en').onclick = function () { setLang('en'); };
  $('lang-hi').onclick = function () { setLang('hi'); };

  $('sample').onclick = function () {
    var t = today(); t.day.entries = [];
    ['subah 2 idli aur chai li, 30 min walk kiya', 'goli li', '2 roti dal sabzi khayi, 3 glass pani piya', 'shaam ko jalebi khayi, thoda chakkar aa raha hai'].forEach(function (m) { var r = P.parse(m); r.text = m; t.day.entries.push(r); });
    save(t.all); render();
  };
  $('clear').onclick = function () { var t = today(); t.all[t.key] = { entries: [] }; save(t.all); render(); $('reply').innerHTML = ''; };

  applyLang();
})();
