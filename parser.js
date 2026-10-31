/* Kalji parser: turns a messy Hinglish/English message about a parent's day into
   structured entries. Deterministic (no network), so demo mode always works.
   Red-flag detection lives ONLY here: it never depends on a model. */
(function (root) {
  'use strict';

  var NUM = { ek:1, one:1, do:2, two:2, teen:3, three:3, char:4, four:4, paanch:5, panch:5, five:5,
              chhe:6, six:6, saat:7, seven:7, aath:8, eight:8, aadha:0.5, half:0.5, adha:0.5 };

  // [keywords], display name, kcal low/high PER UNIT, unit word, default qty, flags
  var FOODS = [
    { k:['roti','chapati','chapatti','poli','phulka'], n:'Roti', lo:80, hi:120, d:1 },
    { k:['bhakri'], n:'Bhakri', lo:100, hi:150, d:1 },
    { k:['paratha','parantha'], n:'Paratha', lo:200, hi:300, d:1, f:['oily'] },
    { k:['idli','idlis'], n:'Idli', lo:40, hi:60, d:2 },
    { k:['dosa'], n:'Dosa', lo:130, hi:200, d:1 },
    { k:['poha'], n:'Poha (plate)', lo:250, hi:350, d:1 },
    { k:['upma'], n:'Upma (plate)', lo:250, hi:350, d:1 },
    { k:['sabudana','sabudane'], n:'Sabudana khichdi', lo:300, hi:450, d:1, f:['high carb'] },
    { k:['rice','chawal','bhaat','bhat'], n:'Rice (katori)', lo:150, hi:220, d:1, f:['high carb'] },
    { k:['dal','varan','amti'], n:'Dal (katori)', lo:100, hi:160, d:1 },
    { k:['sabzi','sabji','bhaji','bhaaji'], n:'Sabzi (katori)', lo:80, hi:150, d:1 },
    { k:['fish','machli','surmai','bangda','pomfret'], n:'Fish curry/fry', lo:150, hi:300, d:1 },
    { k:['curd','dahi','dahee'], n:'Curd (katori)', lo:60, hi:100, d:1 },
    { k:['sol kadhi','solkadhi'], n:'Sol kadhi (glass)', lo:60, hi:100, d:1 },
    { k:['egg','eggs','anda','ande'], n:'Egg', lo:70, hi:90, d:1 },
    { k:['banana','kela','kele'], n:'Banana', lo:90, hi:120, d:1 },
    { k:['papaya','papita'], n:'Papaya (bowl)', lo:60, hi:100, d:1 },
    { k:['chai','tea'], n:'Chai', lo:50, hi:90, d:1, f:['has sugar?'] },
    { k:['biscuit','biscuits','biskut'], n:'Biscuit', lo:35, hi:60, d:2, f:['sugar'] },
    { k:['samosa','vada pav','vadapav','bhajiya','bhajia','pakoda','pakora'], n:'Fried snack', lo:200, hi:300, d:1, f:['fried'] },
    { k:['mithai','jalebi','ladoo','laddoo','gulab jamun','halwa','sheera','kheer','peda','modak','sweet'], n:'Sweet / mithai', lo:150, hi:300, d:1, f:['high sugar'] }
  ];

  var RED = [
    [/chest\s*(pain|tight)|seene\s*(me|mein|mai)\s*(dard|bhari|jalan)|chhati\s*(me|mein)?\s*dard|सीने/i, 'chest pain'],
    [/breath(less|ing)|saans\s*(phool|nahi|lene|ki taklif|me taklif)|dam\s*phool|सांस/i, 'trouble breathing'],
    [/faint|behosh|behoshi|unconscious|collapsed|gir\s*(gaye|gaya|gayi|pade)|bebhan/i, 'fainting / fall'],
    [/slur|zubaan\s*(laak|lad)|bol\s*nahi\s*pa|face\s*(droop|tedha)|chehra\s*tedha|ek\s*(taraf|side)\s*(se)?\s*(kamzor|weak|sunn)|lakwa|paralys/i, 'possible stroke signs'],
    [/confus|pehchan\s*nahi|hosh\s*(nahi|me nahi)/i, 'confusion'],
    [/vomit(ing)?\s*blood|khoon\s*(ki\s*ulti|aa)|blood\s*in\s*(stool|vomit)/i, 'bleeding'],
    [/sugar\s*(bahut\s*)?(low|kam)|hypo|pasina\s*pasina.*kamp|kaanp/i, 'possible very low sugar']
  ];

  var SYMPTOMS = [
    [/chakkar|dizz/i, 'dizziness'], [/sar\s*dard|headache|sir\s*dard/i, 'headache'],
    [/kamzori|kamzor|weak|thakaan|thaka/i, 'weakness / tiredness'], [/pet\s*(dard|kharab|me dard)/i, 'stomach upset'],
    [/khansi|khaansi|cough/i, 'cough'], [/bukhar|fever/i, 'fever'], [/ghutne|knee|jodo|joint/i, 'joint pain'],
    [/neend\s*nahi|sleep(less)?|so\s*nahi/i, 'poor sleep'], [/ulti|nausea|ji\s*michla/i, 'nausea']
  ];

  function lc(s) { return (s || '').toLowerCase(); }
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // quantity: a number or number-word immediately before the keyword (within 2 words) or "x2" after
  var UNITS = /^(katori|katoris|bowl|bowls|plate|plates|piece|pieces|pcs|cup|cups|glass|glasses)$/;
  function qtyBefore(text, idx) {
    // only the clause before the food word; the number must be adjacent (optionally with one unit word between)
    var seg = text.slice(0, idx), cut = Math.max(seg.lastIndexOf(','), seg.lastIndexOf('.'), seg.lastIndexOf(';'));
    var w = seg.slice(cut + 1).trim().split(/\s+/).slice(-2).map(function (x) { return x.replace(/[^a-z0-9.]/g, ''); });
    function val(x) { if (/^\d+(\.\d+)?$/.test(x)) return parseFloat(x); if (NUM[x] !== undefined) return NUM[x]; return null; }
    if (w.length && val(w[w.length - 1]) !== null) return val(w[w.length - 1]);
    if (w.length === 2 && UNITS.test(w[1]) && val(w[0]) !== null) return val(w[0]);
    return null;
  }

  function parseMeals(t) {
    var meals = [], seen = {};
    FOODS.forEach(function (fd) {
      fd.k.forEach(function (kw) {
        var re = new RegExp('(^|[^a-z])' + esc(kw) + '([^a-z]|$)', 'g'), m;
        while ((m = re.exec(t))) {
          if (seen[fd.n]) continue;
          // negation inside the same clause: "rice khaya nahi", "didn't eat rice", "skipped lunch"
          var cs = Math.max(t.lastIndexOf(',', m.index), t.lastIndexOf('.', m.index), t.lastIndexOf(';', m.index), -1) + 1;
          var ce = t.slice(m.index).search(/[,.;]/); ce = ce < 0 ? t.length : m.index + ce;
          var clause = t.slice(cs, ce);
          if (/(khaya|khayi|liya|li|piya|ate|had|eat)\s+(nahi|nahin|not)\b|\b(nahi|nahin|didn'?t|did not|skipped?|bina)\s+(\w+\s+)?(khaya|khayi|liya|ate|had|eat)/.test(clause)) continue;
          var q = qtyBefore(t, m.index + (m[1] ? 1 : 0));
          if (q === null) q = fd.d;
          if (q <= 0) q = fd.d;
          seen[fd.n] = true;
          meals.push({ name: fd.n, qty: q, kcal_low: Math.round(fd.lo * q), kcal_high: Math.round(fd.hi * q), flags: fd.f || [] });
        }
      });
    });
    return meals;
  }

  function parseWater(t) {
    var ml = 0, m;
    var re = /(\d+(?:\.\d+)?|ek|do|teen|char|paanch|one|two|three|four|five|aadha|half)?\s*\b(glass|glasses|gilas|glaas|bottle|bottles|litres?|liters?|ltr)\b\s*(?:of\s*)?(?:pani|paani|water)?/g;
    var hasWaterWord = /\b(pani|paani|water)\b/.test(t);
    while ((m = re.exec(t))) {
      if (!m[0].trim()) { re.lastIndex++; continue; }
      var unit = m[2], q = m[1] ? (isNaN(parseFloat(m[1])) ? NUM[m[1]] : parseFloat(m[1])) : 1;
      var tail = t.slice(m.index, m.index + m[0].length + 14);
      var other = /chai|tea|doodh|milk|juice|sol kadhi|chaas|lassi|coffee/.test(tail);
      var isWater = /\b(pani|paani|water)\b/.test(tail) || (hasWaterWord && !!m[1] && !other);
      if (!isWater) continue;
      ml += q * (/glass|gilas|glaas/.test(unit) ? 250 : 1000);
    }
    return ml;
  }

  function parseWalk(t) {
    var min = 0, m;
    if (!/walk|chala|chal\s*k|ghum|tahal|fire|jogging|yoga/.test(t)) return 0;
    if ((m = t.match(/(\d+)\s*(min|minute|minutes|mins)/))) min = parseInt(m[1], 10);
    else if ((m = t.match(/(\d+(?:\.\d+)?)\s*(hr|hour|hours|ghanta|ghante)/))) min = Math.round(parseFloat(m[1]) * 60);
    else if (/aadha\s*ghanta|half\s*(an\s*)?hour/.test(t)) min = 30;
    else if (/(ek|one|1)\s*(ghanta|hour)/.test(t)) min = 60;
    else min = 0; // walked but no duration: ask, don't guess
    return min;
  }

  function walkMentioned(t) { return /walk|chala|chal\s*k|ghum|tahal|fire|jogging|yoga/.test(t) && !/(nahi|nahin|not|skip)\s+(\w+\s+)?(gaye|gaya|gayi|gya|chale|chala|walk|jaa|ja)/.test(t); }

  function parseMeds(t) {
    var meds = [];
    var mention = /goli|dawai|dawa\b|medicine|tablet|tab\b|insulin|metformin|amlodipine|telmisartan|pill/.test(t);
    if (!mention) return meds;
    var missed = /(nahi|nahin|not|bhool|bhul|miss|missed|skip|forgot|forget)/.test(t.slice(Math.max(0, t.search(/goli|dawai|dawa\b|medicine|tablet|tab\b|insulin|metformin|amlodipine|telmisartan|pill/) - 30)));
    var taken = /(li\b|liya|lee|le\s*li|khayi|khaya|kha\s*li|taken|took|had)/.test(t);
    if (missed && !/nahi\s*bhoola|did\s*not\s*forget/.test(t)) meds.push({ status: 'missed' });
    else if (taken) meds.push({ status: 'taken' });
    else meds.push({ status: 'unclear' });
    return meds;
  }

  function parse(text) {
    var raw = (text || '').trim();
    var t = lc(raw);
    var out = { meals: [], water_ml: 0, walk_min: 0, meds: [], symptoms: [], red_flag: null, unclear: [], unclear_codes: [], source: 'demo' };
    if (!raw) { out.unclear.push('Empty message.'); out.unclear_codes.push('empty'); return out; }

    for (var i = 0; i < RED.length; i++) if (RED[i][0].test(raw)) { out.red_flag = RED[i][1]; break; }
    SYMPTOMS.forEach(function (s) { if (s[0].test(raw)) out.symptoms.push(s[1]); });

    out.meals = parseMeals(t);
    out.water_ml = parseWater(t);
    out.walk_min = parseWalk(t);
    out.meds = parseMeds(t);

    if (walkMentioned(t) && !out.walk_min) { out.unclear.push('Walk mentioned but no duration. How many minutes?'); out.unclear_codes.push('walk'); }
    if (out.meds.length && out.meds[0].status === 'unclear') { out.unclear.push('Medicine mentioned. Was it taken or missed?'); out.unclear_codes.push('med'); }
    if (/(khana|khaya|khayi|lunch|dinner|nashta|breakfast|naashta|ate)/.test(t) && !out.meals.length)
      { out.unclear.push('Ate something, but I did not recognise the dish. What was it?'); out.unclear_codes.push('dish'); }
    if (!out.meals.length && !out.water_ml && !out.walk_min && !out.meds.length && !out.symptoms.length && !out.red_flag && !out.unclear.length)
      { out.unclear.push('I could not find food, water, a walk, medicine or a symptom in that message.'); out.unclear_codes.push('nothing'); }
    return out;
  }

  var api = { parse: parse, RED: RED };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.KaljiParser = api;
})(typeof self !== 'undefined' ? self : this);
