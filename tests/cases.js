// 10 realistic inputs for the Q3 table. Each has the expectations we check.
module.exports = [
  { id:1, in:'aaj nashta me 2 idli aur chai li, sugar wali', exp:{ foods:['Idli','Chai'], red:false } },
  { id:2, in:'dopahar ko 3 roti, dal, sabzi aur thoda chawal khaya', exp:{ foods:['Roti','Dal (katori)','Sabzi (katori)','Rice (katori)'], red:false } },
  { id:3, in:'subah 30 min walk kiya, 4 glass pani piya', exp:{ walk:30, water:1000, red:false } },
  { id:4, in:'BP ki goli bhool gaye aaj', exp:{ meds:'missed', red:false } },
  { id:5, in:'papa ko chakkar aa raha hai aur kamzori hai', exp:{ symptoms:['dizziness','weakness / tiredness'], red:false } },
  { id:6, in:'seene me dard ho raha hai', exp:{ red:true } },
  { id:7, in:'jalebi aur samosa khaya shaadi me', exp:{ foods:['Sweet / mithai','Fried snack'], red:false } },
  { id:8, in:'rice khaya nahi, sirf dahi aur kela', exp:{ foods:['Curd (katori)','Banana'], red:false } },
  { id:9, in:'thoda ghumne gaye the', exp:{ unclearHas:'minutes', red:false } },
  { id:10, in:'aaj kuch khaya, thali jaisa tha, bahut tasty', exp:{ unclearHas:'dish', red:false } }
];
