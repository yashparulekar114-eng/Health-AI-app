(function () {
  'use strict';
  var GOALS = { water: 1800, walk: 30, meals: 3, kcal: 1800 };
  try { var sg = JSON.parse(localStorage.getItem('kalji.goals')); if (sg) ['water', 'walk', 'kcal'].forEach(function (k) { if (typeof sg[k] === 'number') GOALS[k] = sg[k]; }); } catch (e) {}
  var $ = function (id) { return document.getElementById(id); };
  var P = window.KaljiParser;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  // ---- language: English (default) / Hinglish / Hindi (Devanagari). Everything shown follows the chosen language. ----
  var LANG = (function () { try { var l = localStorage.getItem('kalji.lang2'); return l === 'hg' || l === 'hi' ? l : 'en'; } catch (e) { return 'en'; } })();
  var T = {
    en: {
      notice: 'Kalji is not medical advice. It does not diagnose or prescribe. All data here is made up. In an emergency call <b>108</b>.',
      sub: 'Dad sends one message. You get his day in three lines.',
      tabPapa: 'Log', tabMe: 'Today', ringSub: 'kcal so far (estimate)',
      prompt: '👇 Tap a button to log it. No typing needed.', prompt2: 'Or type or say it yourself, then press Send:',
      quick: [['💊 Took my tablet','I took my tablet'],['🚶 Walked 30 min','I walked 30 min'],['💧 A glass of water','I drank 1 glass of water'],['🍳 2 idli and tea','2 idli and tea'],['🍚 Roti, dal, sabzi','2 roti, dal and sabzi'],['⚠️ Missed my tablet','I forgot my tablet']],
      ph: 'e.g. 2 idli and tea for breakfast, walked 30 min, took my tablet',
      mic: '🎤 Speak', send: 'Send', today: "Dad's day so far",
      hMeals: 'Meals', hWater: 'Water', hWalk: 'Walk', hMed: 'Medicine', hFeel: 'How he feels',
      sample: 'Load a sample day', clear: 'Clear today',
      foot: 'Demo profile (made up): Dad, 68, 72 kg, type 2 diabetes and high blood pressure. Goals: 1.8 L water, 30 min walk, 3 meals, morning medicine. Calories are ranges, not exact. See <a href="REPORT.md">the report</a>.',
      noted: 'Noted ✔ ', fFood: 'food', fWater: 'water', fWalk: 'walk', fMed: 'medicine', taken: 'taken', missed: 'missed',
      uMl: 'ml', uMin: 'min', uKcal: 'kcal',
      gMorning: 'Good morning', gAfternoon: 'Good afternoon', gEvening: 'Good evening',
      stOkT: 'On track', stOkS: "Nothing worrying in Dad's updates so far.", stWatchT: 'Keep an eye', stWatchS: 'Something deserves a gentle check-in call.', stRedT: 'Call Dad now', stRedS: 'A warning sign was reported. If you cannot reach him, call 108.', stNoneT: 'No update yet', stNoneS: 'Not an alarm. Dad may be busy or resting.', stNoneBtn: 'Open Log',
      recentH: 'Logged today', recentNone: 'Nothing yet. Tap a button above.', undo: 'Undo', undone: 'Removed the last entry.',
      energyH: 'Energy (estimate)', eEaten: 'Eaten', eBurned: 'Burned', eNet: 'Net', eNote: 'Burned is estimated from walking time for a 72 kg person (a made-up demo weight), so it is approximate.', burnTxt: 'about {k} kcal burned',
      goalsH: "Today's goals", goalsEdit: 'Edit', goalsSave: 'Save', goalsCancel: 'Cancel', gWater: 'Water', gWalk: 'Walk', gMeals: 'Meals', gMed: 'Medicine', gKcal: 'Calories (limit)', gItems: 'items', gPending: 'Not yet', gOver: 'over the limit', gfWater: 'Water goal (ml)', gfWalk: 'Walk goal (min)', gfKcal: 'Calorie limit (kcal)', gHint: 'Set targets together with a doctor. Kalji does not prescribe targets.',
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
    hg: {
      notice: 'Kalji medical advice nahi hai. Yeh diagnose ya dawai prescribe nahi karta. Yahan ka saara data made-up hai. Emergency me <b>108</b> call karo.',
      sub: 'Papa ek message bhejte hain. Aapko unka din teen lines me mil jata hai.',
      tabPapa: 'Log', tabMe: 'Aaj', ringSub: 'kcal abhi tak (andaza)',
      prompt: '👇 Button dabao, log ho jayega. Likhna nahi padega.', prompt2: 'Ya khud likho ya bolo, phir Bhejo dabao:',
      quick: [['💊 Goli li','goli li'],['🚶 30 min walk','30 min walk kiya'],['💧 Ek glass pani','1 glass pani piya'],['🍳 2 idli aur chai','2 idli aur chai'],['🍚 Roti dal sabzi','2 roti dal sabzi khayi'],['⚠️ Goli bhool gaye','goli bhool gaye']],
      ph: 'jaise: subah 2 idli aur chai, 30 min walk, goli li',
      mic: '🎤 Bolo', send: 'Bhejo', today: 'Papa ka aaj ka din abhi tak',
      hMeals: 'Khana', hWater: 'Pani', hWalk: 'Walk', hMed: 'Dawai', hFeel: 'Tabiyat',
      sample: 'Sample din load karo', clear: 'Aaj ka clear karo',
      foot: 'Demo profile (made-up): Papa, 68, 72 kg, type 2 diabetes aur high BP. Goals: 1.8 L pani, 30 min walk, 3 meals, subah ki dawai. Calories ek range hai, exact nahi. Dekho <a href="REPORT.md">report</a>.',
      noted: 'Likh liya ✔ ', fFood: 'khana', fWater: 'pani', fWalk: 'walk', fMed: 'goli', taken: 'li', missed: 'chhoot gayi',
      uMl: 'ml', uMin: 'min', uKcal: 'kcal',
      gMorning: 'Suprabhat', gAfternoon: 'Namaste', gEvening: 'Shubh sandhya',
      stOkT: 'Sab theek', stOkS: 'Papa ke updates me abhi tak koi chinta ki baat nahi.', stWatchT: 'Dhyan rakho', stWatchS: 'Ek chhota sa check-in call banta hai.', stRedT: 'Papa ko abhi call karo', stRedS: 'Warning sign bataya gaya hai. Na lage to 108 call karo.', stNoneT: 'Abhi update nahi', stNoneS: 'Alarm nahi hai. Papa busy ya aaram kar rahe honge.', stNoneBtn: 'Log kholo',
      recentH: 'Aaj log hua', recentNone: 'Abhi kuch nahi. Upar ka button dabao.', undo: 'Undo', undone: 'Pichhli entry hata di.',
      energyH: 'Energy (andaza)', eEaten: 'Khaya', eBurned: 'Jala', eNet: 'Net', eNote: 'Jali hui calories walk ke time se, 72 kg ke vyakti (made-up demo weight) ke hisab se andaza hai, exact nahi.', burnTxt: 'lagbhag {k} kcal jali',
      goalsH: 'Aaj ke goals', goalsEdit: 'Badlo', goalsSave: 'Save', goalsCancel: 'Cancel', gWater: 'Pani', gWalk: 'Walk', gMeals: 'Khana', gMed: 'Dawai', gKcal: 'Calories (limit)', gItems: 'items', gPending: 'Abhi nahi', gOver: 'limit se zyada', gfWater: 'Pani goal (ml)', gfWalk: 'Walk goal (min)', gfKcal: 'Calorie limit (kcal)', gHint: 'Goals doctor ke saath tay karo. Kalji goals prescribe nahi karta.',
      alert1: 'Yeh serious ho sakta hai', alert2: 'Abhi doctor ko dikhao ya <a href="tel:108">108 call karo</a>. Kalji doctor nahi hai, aur is par wait mat karo.',
      q_walk: 'Walk ki baat ki, kitne minute?', q_med: 'Dawai ki baat ki, li ya chhoot gayi?', q_dish: 'Kuch khaya, par mujhe dish samajh nahi aayi. Kya khaya tha?', q_nothing: 'Is message me khana, pani, walk, dawai ya koi takleef nahi mili. Dobara likho.', q_empty: 'Pehle kuch likho.',
      micErr: 'Mic kaam nahi kar raha. Please type kar do.',
      sNoData: 'Papa ka aaj abhi tak koi update nahi aaya. Yeh alarm nahi hai: ho sakta hai busy ya aaram kar rahe hon. Alert tab aata hai jab message me koi warning sign ho.',
      nothingYet: 'Abhi kuch log nahi hua', kcalSoFar: 'Abhi tak lagbhag {a}–{b} kcal (andaza)', waterOf: '{b} ml me se {a} ml', walkOf: '{b} min me se {a} min',
      medTaken: 'Li ✔', medMissed: 'Chhoot gayi. Please unhe call karo.', medNone: 'Abhi bataya nahi', symNone: 'Koi takleef nahi batayi',
      sRed: 'Papa ne {x} bataya. Abhi call karo; na lage to 108.', sMeals: 'Khana: {n} items, theek lag raha hai.', sMealsSo: 'Khana: abhi tak {n} items', sNoLunch: ' (subah ke baad kuch nahi)',
      sGoal: 'Pani {w}% · Walk {k}% goal ka.', sWatch: 'Dhyan do: {x}.', sOk: 'Abhi tak sab theek lag raha hai.', wMed: 'dawai chhoot gayi', wSweet: 'meetha (cheeni)',
      nudgeH: 'Suggested nudge ({t} IST)', nudgeNone: 'Abhi koi nudge nahi chahiye.', nudgeBtn: 'WhatsApp pe bhejo', nudgeT: 'Nudge',
      n_med: 'Papa, aaj ki goli li? Bas "li" ya "nahi" bhej do 🙏', n_lunch: 'Papa, lunch ho gaya? Kya khaya, ek line me bhej do 🙏', n_water: 'Papa, pani peena mat bhoolna. Abhi ek glass pi lo 🙏', n_walk: 'Papa, shaam ko 15-20 min walk ho jaye? Phir mujhe bata dena 🙏',
      chips: ['subah 2 idli aur chai, 30 min walk', 'dopahar 3 roti dal sabzi, 4 glass pani', 'BP ki goli bhool gaye', 'chakkar aa raha hai', 'shaadi me jalebi aur samosa khaya', 'seene me dard ho raha hai'],
      mode: 'AI mode: demo (built-in parser, offline chalta hai). Server key ho to live AI use hota hai.', modeLive: 'AI mode: live model message padhta hai; safety rules upar se chalte hain.'
    },
    hi: {
      notice: 'कळजी चिकित्सा सलाह नहीं है। यह न बीमारी बताता है, न दवा लिखता है। यहाँ का सारा डेटा काल्पनिक है। आपात स्थिति में <b>108</b> पर कॉल करें।',
      sub: 'पापा एक संदेश भेजते हैं। आपको उनका दिन तीन पंक्तियों में मिल जाता है।',
      tabPapa: 'दर्ज करें', tabMe: 'आज', ringSub: 'कैलोरी अब तक (अनुमान)',
      prompt: '👇 बटन दबाइए, दर्ज हो जाएगा। लिखना नहीं पड़ेगा।', prompt2: 'या खुद लिखिए या बोलिए, फिर भेजें दबाइए:',
      quick: [['💊 गोली ली','गोली ली'],['🚶 30 मिनट टहले','30 मिनट वॉक किया'],['💧 एक गिलास पानी','1 गिलास पानी पिया'],['🍳 2 इडली और चाय','2 इडली और चाय'],['🍚 रोटी, दाल, सब्ज़ी','2 रोटी दाल सब्ज़ी खायी'],['⚠️ गोली भूल गए','गोली भूल गए']],
      ph: 'जैसे: सुबह 2 इडली और चाय, 30 मिनट टहले, गोली ली',
      mic: '🎤 बोलिए', send: 'भेजें', today: 'पापा का आज का दिन अब तक',
      hMeals: 'खाना', hWater: 'पानी', hWalk: 'टहलना', hMed: 'दवाई', hFeel: 'तबीयत',
      sample: 'नमूना दिन लोड करें', clear: 'आज का साफ़ करें',
      foot: 'डेमो प्रोफ़ाइल (काल्पनिक): पापा, 68 वर्ष, 72 किलो, टाइप 2 मधुमेह और उच्च रक्तचाप। लक्ष्य: 1.8 लीटर पानी, 30 मिनट टहलना, 3 बार खाना, सुबह की दवाई। कैलोरी एक अनुमान है, सटीक नहीं। देखें <a href="REPORT.md">रिपोर्ट</a>।',
      noted: 'लिख लिया ✔ ', fFood: 'खाना', fWater: 'पानी', fWalk: 'टहलना', fMed: 'दवाई', taken: 'ली', missed: 'छूट गई',
      uMl: 'मिली', uMin: 'मिनट', uKcal: 'कैलोरी',
      gMorning: 'सुप्रभात', gAfternoon: 'नमस्ते', gEvening: 'शुभ संध्या',
      stOkT: 'सब ठीक', stOkS: 'पापा के अपडेट में अब तक कोई चिंता की बात नहीं।', stWatchT: 'ध्यान रखें', stWatchS: 'एक छोटा सा हालचाल पूछने वाला कॉल बनता है।', stRedT: 'पापा को अभी कॉल करें', stRedS: 'खतरे का संकेत बताया गया है। न लगे तो 108 पर कॉल करें।', stNoneT: 'अभी कोई अपडेट नहीं', stNoneS: 'यह खतरे की घंटी नहीं है। पापा व्यस्त या आराम में होंगे।', stNoneBtn: 'दर्ज करें खोलें',
      recentH: 'आज दर्ज हुआ', recentNone: 'अभी कुछ नहीं। ऊपर का बटन दबाइए।', undo: 'वापस लें', undone: 'पिछली प्रविष्टि हटा दी।',
      energyH: 'ऊर्जा (अनुमान)', eEaten: 'खाया', eBurned: 'खर्च', eNet: 'शुद्ध', eNote: 'खर्च हुई कैलोरी टहलने के समय से 72 किलो के व्यक्ति (काल्पनिक डेमो वज़न) के हिसाब से अनुमान है, सटीक नहीं।', burnTxt: 'लगभग {k} कैलोरी खर्च',
      goalsH: 'आज के लक्ष्य', goalsEdit: 'बदलें', goalsSave: 'सहेजें', goalsCancel: 'रद्द करें', gWater: 'पानी', gWalk: 'टहलना', gMeals: 'खाना', gMed: 'दवाई', gKcal: 'कैलोरी (सीमा)', gItems: 'चीज़ें', gPending: 'अभी नहीं', gOver: 'सीमा से ज़्यादा', gfWater: 'पानी का लक्ष्य (मिली)', gfWalk: 'टहलने का लक्ष्य (मिनट)', gfKcal: 'कैलोरी सीमा', gHint: 'लक्ष्य डॉक्टर के साथ तय करें। कळजी लक्ष्य नहीं बताता।',
      alert1: 'यह गंभीर हो सकता है', alert2: 'अभी डॉक्टर को दिखाइए या <a href="tel:108">108 पर कॉल करें</a>। कळजी डॉक्टर नहीं है, इसलिए इंतज़ार न करें।',
      q_walk: 'टहलने की बात कही, कितने मिनट?', q_med: 'दवाई की बात कही, ली या छूट गई?', q_dish: 'कुछ खाया, पर मैं व्यंजन समझ नहीं पाया। क्या खाया था?', q_nothing: 'इस संदेश में खाना, पानी, टहलना, दवाई या कोई तकलीफ़ नहीं मिली। फिर से लिखिए।', q_empty: 'पहले कुछ लिखिए।',
      micErr: 'माइक काम नहीं कर रहा। कृपया लिखकर भेजें।',
      sNoData: 'आज पापा का अभी तक कोई अपडेट नहीं आया। यह खतरे की घंटी नहीं है: हो सकता है वे व्यस्त हों या आराम कर रहे हों। चेतावनी तभी आती है जब संदेश में कोई खतरे का संकेत हो।',
      nothingYet: 'अभी कुछ दर्ज नहीं हुआ', kcalSoFar: 'अब तक लगभग {a}–{b} कैलोरी (अनुमान)', waterOf: '{b} मिली में से {a} मिली', walkOf: '{b} मिनट में से {a} मिनट',
      medTaken: 'ली ✔', medMissed: 'छूट गई। कृपया उन्हें कॉल करें।', medNone: 'अभी बताया नहीं', symNone: 'कोई तकलीफ़ नहीं बताई',
      sRed: 'पापा ने {x} बताया। अभी कॉल करें; न लगे तो 108।', sMeals: 'खाना: {n} चीज़ें दर्ज, सब सामान्य लग रहा है।', sMealsSo: 'खाना: अब तक {n} चीज़ें', sNoLunch: ' (सुबह के बाद कुछ नहीं)',
      sGoal: 'पानी {w}% · टहलना {k}% लक्ष्य का।', sWatch: 'ध्यान दें: {x}।', sOk: 'अब तक सब ठीक लग रहा है।', wMed: 'दवाई छूट गई', wSweet: 'मीठा (चीनी)',
      nudgeH: 'सुझाया गया संदेश ({t} IST)', nudgeNone: 'अभी कोई संदेश भेजने की ज़रूरत नहीं।', nudgeBtn: 'WhatsApp पर भेजें', nudgeT: 'याद दिलाना',
      n_med: 'पापा, आज की गोली ली? बस "ली" या "नहीं" भेज दीजिए 🙏', n_lunch: 'पापा, दोपहर का खाना हो गया? क्या खाया, एक पंक्ति में भेज दीजिए 🙏', n_water: 'पापा, पानी पीना मत भूलिए। अभी एक गिलास पी लीजिए 🙏', n_walk: 'पापा, शाम को 15-20 मिनट टहल आइए? फिर मुझे बता दीजिए 🙏',
      chips: ['सुबह 2 इडली और चाय, 30 मिनट टहले', 'दोपहर 3 रोटी दाल सब्ज़ी, 4 गिलास पानी', 'बीपी की गोली भूल गए', 'चक्कर आ रहा है', 'शादी में जलेबी और समोसा खाया', 'सीने में दर्द हो रहा है'],
      mode: 'एआई मोड: डेमो (अंतर्निहित पार्सर, ऑफ़लाइन चलता है)। सर्वर कुंजी होने पर लाइव एआई उपयोग होता है।', modeLive: 'एआई मोड: लाइव मॉडल संदेश पढ़ता है; सुरक्षा नियम ऊपर से चलते हैं।'
    }
  };
  function tr(k, v) { var s = (T[LANG][k] !== undefined ? T[LANG][k] : T.en[k]); if (typeof s !== 'string') return s; if (v) Object.keys(v).forEach(function (x) { s = s.replace('{' + x + '}', v[x]); }); return s; }

  // Names stored internally in English are shown in the chosen language: [Hinglish, Hindi]
  var NM = {
    food: { 'Roti':['Roti','रोटी'], 'Bhakri':['Bhakri','भाकरी'], 'Paratha':['Paratha','पराठा'], 'Idli':['Idli','इडली'], 'Dosa':['Dosa','डोसा'], 'Poha (plate)':['Poha (plate)','पोहा (प्लेट)'], 'Upma (plate)':['Upma (plate)','उपमा (प्लेट)'], 'Sabudana khichdi':['Sabudana khichdi','साबूदाना खिचड़ी'], 'Rice (katori)':['Chawal (katori)','चावल (कटोरी)'], 'Dal (katori)':['Dal (katori)','दाल (कटोरी)'], 'Sabzi (katori)':['Sabzi (katori)','सब्ज़ी (कटोरी)'], 'Fish curry/fry':['Machli','मछली'], 'Curd (katori)':['Dahi (katori)','दही (कटोरी)'], 'Sol kadhi (glass)':['Sol kadhi (glass)','सोल कढ़ी (गिलास)'], 'Egg':['Anda','अंडा'], 'Banana':['Kela','केला'], 'Papaya (bowl)':['Papita (bowl)','पपीता (कटोरा)'], 'Chai':['Chai','चाय'], 'Biscuit':['Biscuit','बिस्कुट'], 'Fried snack':['Talaa hua nashta','तला हुआ नाश्ता'], 'Sweet / mithai':['Mithai','मिठाई'] },
    flag: { 'oily':['teliya','तैलीय'], 'high carb':['zyada carbs','ज़्यादा कार्ब्स'], 'has sugar?':['cheeni?','चीनी?'], 'sugar':['cheeni','चीनी'], 'fried':['talaa hua','तला हुआ'], 'high sugar':['zyada cheeni','ज़्यादा चीनी'] },
    sym: { 'dizziness':['chakkar','चक्कर'], 'headache':['sar dard','सिरदर्द'], 'weakness / tiredness':['kamzori / thakaan','कमज़ोरी / थकान'], 'stomach upset':['pet kharab','पेट खराब'], 'cough':['khansi','खांसी'], 'fever':['bukhar','बुखार'], 'joint pain':['jodon me dard','जोड़ों में दर्द'], 'poor sleep':['neend nahi aayi','नींद नहीं आई'], 'nausea':['ulti jaisa','उल्टी जैसा'] },
    red: { 'chest pain':['seene me dard','सीने में दर्द'], 'trouble breathing':['saans lene me takleef','सांस लेने में तकलीफ़'], 'fainting / fall':['behoshi / gir jana','बेहोशी / गिर जाना'], 'possible stroke signs':['stroke ke sanket','लकवे के संकेत'], 'confusion':['confusion / hosh me nahi','भ्रम / होश में नहीं'], 'bleeding':['khoon behna','खून बहना'], 'possible very low sugar':['sugar bahut low','शुगर बहुत कम'] }
  };
  function nm(kind, key) { if (LANG === 'en' || !NM[kind][key]) return key; return NM[kind][key][LANG === 'hg' ? 0 : 1]; }
  function symName(x) { return nm('sym', x); }
  var KI = window.KaljiIcons, TILE_ICONS = ['pill', 'walk', 'drop', 'meal', 'plate', 'alert'];
  function applyLang() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-icon]'), function (el) { el.innerHTML = KI.svg(el.getAttribute('data-icon')); });
    document.documentElement.lang = LANG === 'hi' ? 'hi' : LANG === 'hg' ? 'hi-Latn' : 'en';
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) { var v = tr(el.getAttribute('data-i18n')); if (el.hasAttribute('data-html')) el.innerHTML = v; else el.textContent = v; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-ph]'), function (el) { el.placeholder = tr(el.getAttribute('data-i18n-ph')); });
    ['en', 'hg', 'hi'].forEach(function (l) { $('lang-' + l).setAttribute('aria-pressed', LANG === l); });
    var qk = $('quick'); qk.innerHTML = '';
    tr('quick').forEach(function (x) { var b = document.createElement('button'); b.type = 'button'; var sp = x[0].indexOf(' '); b.className = 'tile' + (x[0].indexOf('⚠') === 0 ? ' warn' : ''); b.innerHTML = '<span class="ico">' + KI.svg(TILE_ICONS[tr('quick').indexOf(x)]) + '</span><span>' + esc(x[0].slice(sp + 1)) + '</span>'; b.onclick = function () { send(x[1]); }; qk.appendChild(b); });
    var c = document.querySelector('.chips'); c.innerHTML = '';
    tr('chips').forEach(function (x) { var b = document.createElement('button'); b.type = 'button'; b.textContent = x; b.onclick = function () { $('msg').value = x; $('msg').focus(); }; c.appendChild(b); });
    setMode(); render();
  }
  function setLang(l) { LANG = l; try { localStorage.setItem('kalji.lang2', l); } catch (e) {} $('reply').innerHTML = ''; applyLang(); }

  // ---- IST date helpers (never the browser's local zone) ----
  function istParts() {
    var f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
    var o = {}; f.formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { date: o.year + '-' + o.month + '-' + o.day, hour: parseInt(o.hour, 10) % 24, minute: parseInt(o.minute, 10) };
  }

  var WD_HG = ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar'];
  function dateLine() {
    var now = new Date(), tz = { timeZone: 'Asia/Kolkata' };
    if (LANG === 'hi') return new Intl.DateTimeFormat('hi-IN', Object.assign({ weekday: 'long', day: 'numeric', month: 'long' }, tz)).format(now);
    if (LANG === 'en') return new Intl.DateTimeFormat('en-IN', Object.assign({ weekday: 'long', day: 'numeric', month: 'long' }, tz)).format(now);
    var wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(new Intl.DateTimeFormat('en-US', Object.assign({ weekday: 'short' }, tz)).format(now));
    return WD_HG[wd] + ', ' + new Intl.DateTimeFormat('en-GB', Object.assign({ day: 'numeric', month: 'short' }, tz)).format(now);
  }
  function greeting() { var h = istParts().hour; return tr(h < 12 ? 'gMorning' : h < 17 ? 'gAfternoon' : 'gEvening'); }

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
  function bitsOf(r) {
    var bits = [];
    if (r.meals.length) bits.push(tr('fFood') + ': ' + r.meals.map(function (m) { return esc(nm('food', m.name)); }).join(', '));
    if (r.water_ml) bits.push(tr('fWater') + ': ' + r.water_ml + ' ' + tr('uMl'));
    if (r.walk_min) bits.push(tr('fWalk') + ': ' + r.walk_min + ' ' + tr('uMin') + ' (' + tr('burnTxt', { k: P.burn(r.walk_min) }) + ')');
    if (r.meds.length && r.meds[0].status !== 'unclear') bits.push(tr('fMed') + ': ' + tr(r.meds[0].status === 'taken' ? 'taken' : 'missed'));
    if (r.symptoms.length) bits.push(esc(r.symptoms.map(symName).join(', ')));
    return bits;
  }
  function ack(r) { var b = bitsOf(r); return b.length ? tr('noted') + b.join(' · ') : ''; }
  function question(r) {
    var code = (r.unclear_codes || [])[0];
    return code ? tr('q_' + code) : (r.unclear[0] || '');
  }
  function showReply(r) {
    var h = '';
    if (r.red_flag) h += '<div class="alert" role="alert"><b>' + tr('alert1') + ' (' + esc(nm('red', r.red_flag)) + ').</b><br>' + tr('alert2') + '</div>';
    var a = ack(r);
    if (a) h += '<div class="reply">' + a + '</div>';
    if (r.unclear.length) h += '<div class="reply"><div class="q">' + esc(question(r)) + '</div></div>';
    $('reply').innerHTML = h;
    if (h && $('reply').scrollIntoView) $('reply').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    $('meals').innerHTML = t.meals.length ? t.meals.map(function (m) { return '<li>' + esc(nm('food', m.name)) + (m.qty !== 1 ? ' × ' + m.qty : '') + ' <span class="muted">' + m.kcal_low + '–' + m.kcal_high + ' ' + tr('uKcal') + '</span>' + m.flags.map(function (f) { return '<span class="tag">' + esc(nm('flag', f)) + '</span>'; }).join('') + '</li>'; }).join('') : '<li class="muted">' + tr('nothingYet') + '</li>';
    $('kcal').textContent = t.meals.length ? tr('kcalSoFar', { a: t.lo, b: t.hi }) : '';
    var mid = Math.round((t.lo + t.hi) / 2), C = 326.7; $('ring-num').textContent = mid; $('ring-sub').textContent = tr('ringSub');
    $('ring-arc').setAttribute('stroke-dasharray', (Math.min(1, mid / GOALS.kcal) * C).toFixed(1) + ' ' + C);
    $('st-water').textContent = Math.round(t.water / GOALS.water * 100) + '%'; $('st-walk').textContent = Math.round(t.walk / GOALS.walk * 100) + '%'; $('st-med').textContent = t.meds === 'taken' ? tr('taken') : t.meds === 'missed' ? tr('missed') : '-';
    bar('water-bar', t.water, GOALS.water); $('water-txt').textContent = tr('waterOf', { a: t.water, b: GOALS.water });
    bar('walk-bar', t.walk, GOALS.walk); $('walk-txt').textContent = tr('walkOf', { a: t.walk, b: GOALS.walk });
    $('med-txt').innerHTML = t.meds === 'taken' ? '<span class="ok">' + tr('medTaken') + '</span>' : t.meds === 'missed' ? '<span class="bad">' + tr('medMissed') + '</span>' : '<span class="muted">' + tr('medNone') + '</span>';
    $('sym-txt').innerHTML = t.symptoms.length ? '<span class="warn">' + esc(t.symptoms.map(symName).join(', ')) + '</span>' : '<span class="muted">' + tr('symNone') + '</span>';

    var s = [];
    if (t.red) s.push('<b class="bad">' + esc(tr('sRed', { x: nm('red', t.red) })) + '</b>');
    s.push(t.meals.length >= GOALS.meals ? tr('sMeals', { n: t.meals.length }) : tr('sMealsSo', { n: t.meals.length }) + (ip.hour >= 14 && !t.meals.length ? '<span class="warn">' + tr('sNoLunch') + '</span>' : '') + '.');
    s.push(tr('sGoal', { w: Math.round(t.water / GOALS.water * 100), k: Math.round(t.walk / GOALS.walk * 100) }));
    var watch = [];
    if (t.meds === 'missed') watch.push(tr('wMed'));
    t.symptoms.forEach(function (x) { watch.push(symName(x)); });
    t.meals.forEach(function (m) { if (m.flags.indexOf('high sugar') >= 0) watch.push(tr('wSweet')); });
    s.push(watch.length ? '<span class="warn">' + esc(tr('sWatch', { x: watch.filter(function (v, i, a) { return a.indexOf(v) === i; }).join(', ') })) + '</span>' : (t.red ? '' : tr('sOk')));
    if (!today().day.entries.length) s = [tr('sNoData')];
    s = s.filter(Boolean);
    $('summary').innerHTML = s.map(function (x) { return '<li>' + x + '</li>'; }).join('');

    // energy card (eaten / burned / net) and goals
    var burned = P.burn(t.walk);
    $('e-eaten').textContent = mid; $('e-burn').textContent = burned; $('e-net').textContent = mid - burned;
    var medTxt = t.meds === 'taken' ? tr('medTaken') : t.meds === 'missed' ? tr('missed') : tr('gPending');
    var rowsG = [
      { ic: 'drop', l: tr('gWater'), txt: t.water + ' / ' + GOALS.water + ' ' + tr('uMl'), pct: t.water / GOALS.water * 100, done: t.water >= GOALS.water },
      { ic: 'walk', l: tr('gWalk'), txt: t.walk + ' / ' + GOALS.walk + ' ' + tr('uMin'), pct: t.walk / GOALS.walk * 100, done: t.walk >= GOALS.walk },
      { ic: 'plate', l: tr('gMeals'), txt: t.meals.length + ' / ' + GOALS.meals + ' ' + tr('gItems'), pct: t.meals.length / GOALS.meals * 100, done: t.meals.length >= GOALS.meals },
      { ic: 'pill', l: tr('gMed'), txt: medTxt, pct: t.meds === 'taken' ? 100 : 0, done: t.meds === 'taken' },
      { ic: 'flame', l: tr('gKcal'), txt: mid + ' / ' + GOALS.kcal + ' ' + tr('uKcal'), pct: mid / GOALS.kcal * 100, done: t.meals.length > 0 && mid <= GOALS.kcal, over: mid > GOALS.kcal }
    ];
    $('goal-list').innerHTML = rowsG.map(function (g) { return '<li><span class="gi">' + KI.svg(g.ic) + '</span><span class="gl">' + esc(g.l) + '<small>' + esc(g.txt) + (g.over ? ' · ' + esc(tr('gOver')) : '') + '</small></span><span class="gd' + (g.done ? ' on' : '') + '">' + KI.svg('check') + '</span><div class="gb bar' + (g.over ? ' over' : '') + '"><i style="width:' + Math.min(100, Math.round(g.pct)) + '%"></i></div></li>'; }).join('');

    // traffic-light status for the carer
    var st = !today().day.entries.length ? 'none' : t.red ? 'red' : watch.length ? 'watch' : 'ok';
    var ic = { ok: '✓', watch: '!', red: '☎', none: '…' }[st];
    $('status').className = 'status s-' + st;
    $('status').innerHTML = '<span class="si">' + ic + '</span><div class="st"><b>' + tr('st' + st.charAt(0).toUpperCase() + st.slice(1) + 'T') + '</b><span>' + tr('st' + st.charAt(0).toUpperCase() + st.slice(1) + 'S') + '</span></div>' + (st === 'none' ? '<button type="button" id="st-go">' + tr('stNoneBtn') + '</button>' : '');
    if ($('st-go')) $('st-go').onclick = function () { tab('papa'); window.scrollTo(0, 0); };
    $('date').textContent = dateLine(); $('greet').textContent = greeting();
    renderRecent();

    // proactive nudge: Kalji decides what to ask next, and drafts the message for the child to send
    var q = null;
    if (t.meds === null && ip.hour >= 10) q = tr('n_med');
    else if (!t.meals.length && ip.hour >= 14) q = tr('n_lunch');
    else if (t.water < GOALS.water / 2 && ip.hour >= 15) q = tr('n_water');
    else if (!t.walk && ip.hour >= 17) q = tr('n_walk');
    var n = $('nudge');
    if (q) { n.className = 'card nudge'; n.innerHTML = '<h3>' + tr('nudgeH', { t: ip.hour + ':' + String(ip.minute).padStart(2, '0') }) + '</h3><p>' + esc(q) + '</p><a target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(q) + '">' + tr('nudgeBtn') + '</a>'; }
    else { n.className = 'card nudge ok'; n.innerHTML = '<h3>' + tr('nudgeT') + '</h3><p>' + tr('nudgeNone') + '</p>'; }
  }

  function renderRecent() {
    var es = today().day.entries.slice(-5).reverse();
    $('recent').innerHTML = es.length ? es.map(function (e) { var b = bitsOf(e); return '<li><span class="rt">' + esc(e.at || '') + '</span><span>' + (e.red_flag ? '⚠️ ' + esc(nm('red', e.red_flag)) : esc(b.join(' · '))) + '</span></li>'; }).join('') : '<li class="muted">' + tr('recentNone') + '</li>';
    $('undo').hidden = !es.length;
  }
  function undo() { var t = today(); if (!t.day.entries.length) return; t.day.entries.pop(); save(t.all); render(); $('reply').innerHTML = '<div class="reply">' + tr('undone') + '</div>'; }

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
  $('undo').onclick = undo;
  function fillGoalForm() { $('g-water').value = GOALS.water; $('g-walk').value = GOALS.walk; $('g-kcal').value = GOALS.kcal; }
  $('goal-edit').onclick = function () { var f = $('goal-form'); f.hidden = !f.hidden; if (!f.hidden) fillGoalForm(); };
  $('goal-cancel').onclick = function () { $('goal-form').hidden = true; };
  function clampInt(v, lo, hi, d) { v = parseInt(v, 10); return isNaN(v) ? d : Math.min(hi, Math.max(lo, v)); }
  $('goal-form').onsubmit = function (e) {
    e.preventDefault();
    GOALS.water = clampInt($('g-water').value, 500, 4000, GOALS.water); GOALS.walk = clampInt($('g-walk').value, 10, 120, GOALS.walk); GOALS.kcal = clampInt($('g-kcal').value, 1000, 3000, GOALS.kcal);
    try { localStorage.setItem('kalji.goals', JSON.stringify({ water: GOALS.water, walk: GOALS.walk, kcal: GOALS.kcal })); } catch (er) {}
    $('goal-form').hidden = true; render();
  };
  $('msg').addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });

  if (!SR) { $('mic').hidden = true; } else {
    $('mic').onclick = function () { var r = new SR(); r.lang = LANG === 'en' ? 'en-IN' : 'hi-IN'; r.interimResults = false; r.onresult = function (e) { $('msg').value = (($('msg').value + ' ') + e.results[0][0].transcript).trim(); }; r.onerror = function () { $('reply').innerHTML = '<div class="reply">' + tr('micErr') + '</div>'; }; r.start(); };
  }
  $('lang-en').onclick = function () { setLang('en'); };
  $('lang-hg').onclick = function () { setLang('hg'); };
  $('lang-hi').onclick = function () { setLang('hi'); };

  $('sample').onclick = function () {
    var t = today(); t.day.entries = [];
    ['subah 2 idli aur chai li, 30 min walk kiya', 'goli li', '2 roti dal sabzi khayi, 3 glass pani piya', 'shaam ko jalebi khayi, thoda chakkar aa raha hai'].forEach(function (m) { var r = P.parse(m); r.text = m; t.day.entries.push(r); });
    save(t.all); render();
  };
  $('clear').onclick = function () { var t = today(); t.all[t.key] = { entries: [] }; save(t.all); render(); $('reply').innerHTML = ''; };

  applyLang();
})();
