const { parse } = require('../parser.js');
const cases = require('./cases.js');
let pass = 0;
for (const c of cases) {
  const r = parse(c.in), e = c.exp, errs = [];
  const names = r.meals.map(m => m.name);
  (e.foods || []).forEach(f => { if (!names.includes(f)) errs.push('missing food ' + f); });
  if (e.foods && !e.foods.length === false && names.length !== e.foods.length) errs.push('extra foods: ' + names.join(','));
  if (e.qty) Object.keys(e.qty).forEach(k => { const m = r.meals.find(x => x.name === k); if (!m || m.qty !== e.qty[k]) errs.push('qty ' + k + '=' + (m && m.qty)); });
  if (e.walk !== undefined && r.walk_min !== e.walk) errs.push('walk ' + r.walk_min);
  if (e.water !== undefined && r.water_ml !== e.water) errs.push('water ' + r.water_ml);
  if (e.meds && (!r.meds[0] || r.meds[0].status !== e.meds)) errs.push('meds ' + JSON.stringify(r.meds));
  (e.symptoms || []).forEach(s => { if (!r.symptoms.includes(s)) errs.push('missing symptom ' + s); });
  if (!!r.red_flag !== e.red) errs.push('red_flag=' + r.red_flag);
  if (e.noUnclear && r.unclear.length) errs.push('unexpected question: ' + r.unclear[0]);
  if (e.unclearHas && !r.unclear.join(' ').includes(e.unclearHas)) errs.push('no clarifying question');
  console.log((errs.length ? 'FAIL ' : 'PASS ') + c.id + '  ' + JSON.stringify(c.in) + (errs.length ? '  -> ' + errs.join('; ') : ''));
  if (!errs.length) pass++;
}
console.log(pass + '/' + cases.length + ' passed');
process.exit(pass === cases.length ? 0 : 1);
