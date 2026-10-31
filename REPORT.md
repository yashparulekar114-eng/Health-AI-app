# Report: Kalji

**[YOUR FULL NAME] · Roll No. [ROLL NO]**

## Q1. Why do health apps fail?

> **Status: published sources found; reviews and interviews still to be added by the student (see the evidence tables below).**

### Published sources (found by web search; open each link and check the figures before submitting)
- **Kidman et al. (2024), "When and Why Adults Abandon Lifestyle Behavior and Mental Health Mobile Apps: Scoping Review", *Journal of Medical Internet Research* 26, e56897** (https://www.jmir.org/2024/1/e56897). Reported: a median of about 70% of users stop within 100 days; abandonment is fastest soon after download; most studies report attrition rates without examining why.
- **Industry data cited in the same review:** about 66% of health apps and 69% of fitness apps are abandoned within 90 days (commercial figures, not peer-reviewed).
- **Schroé et al. (2022), MyPlan 2.0 physical-activity intervention:** 227 of 473 participants (47.9%) stopped using it, mostly at the start; authors recommend minimal early questionnaires.
- **Vaghefi & Tulu (2019):** users judge an app's usefulness and their own persistence toward the goal, then abandon, limit, switch or continue.
- **Droid Life (24 Aug 2022), "MyFitnessPal puts barcode scanner behind premium paywall"** (https://www.droid-life.com/2022/08/24/myfitnesspal-puts-barcode-scanner-behind-premium-paywall/): a free feature moved behind a subscription from 1 Oct 2022.

### Review evidence (STUDENT TO ADD)
> Table of 30+ one/two-star reviews: app | stars | date | exact quote | reason tag. Paste them to me and I will tag and count them. Pattern seen in third-party summaries that must be **checked against your own reviews** before being used: paywalls after free use (MyFitnessPal barcode scanner, HealthifyMe "subscription value"), poor support or refunds, inaccurate calorie data, coaches changing or being unavailable, crashes. I have *not* verified these against the primary review pages.

### Interviews (STUDENT TO ADD)
> 3+ people who tried a health app and stopped: who (e.g. "friend, 24, Pune"), which app, why they stopped, in their own words. Ask: (1) Which app, and how long did you use it? (2) What was the last time you opened it? (3) What made you stop? (4) What would have kept you?

**My three most important reasons, ranked:**
1. **[Reason]**: [evidence + source]
2. **[Reason]**: [evidence]
3. **[Reason]**: [evidence]

## Q2. Who exactly is your customer?

> **Replace the example person with a real one** (ideally someone you interviewed), but keep the structure.

**Customer:** a working adult in their 30s (example: a Pune software tester) whose father, 68, lives alone in Goa, has type 2 diabetes and high BP, and uses WhatsApp but no health apps.
**Trying to get done:** know, without nagging, whether Papa ate properly, walked, took his medicine, and feels fine, and be told early if something is wrong.
**Tried, and why it did not work:** calling daily (Papa says "sab theek"), a calorie app (Papa will not type, dishes like sol kadhi and bhakri are missing), a smartwatch (he does not wear it).

**Customers I considered and rejected:**
- *Young adults 15-30 tracking their own fitness*: crowded market, churn is the norm, under-25s cannot pay (class notes). No clear gap for us.
- *Adults 60+ using the app directly*: right need, but they do not install or maintain apps; the adult child is the one who worries and will pay attention.
- *(Optional third)* Gym-goers wanting calorie counts: well served by existing apps.

**How this follows from Q1:** [connect to your ranked reasons: e.g. if "logging is a chore" is #1, Papa never logs, he just sends a message; if "no one notices when you stop" is #1, the child is the one who gets the nudge.]

## Q3. What does AI do in my app that ordinary software could not?

**Decides:** which food, quantity, water, walk, medicine status and symptoms are in a free-form Hinglish message; when a message is too vague (it asks one question instead of guessing); what the child should be nudged about next.
**Does on its own:** turns messy text/voice into structured entries; estimates calorie *ranges*; builds a 3-line summary; drafts the WhatsApp nudge by time of day (IST).
**Must never:** diagnose, advise on medicine or doses, report a calorie number as exact, say "all fine" when data is missing, or let a model decide whether something is an emergency. Red-flag detection is a fixed rule set, so a model failure or hallucination cannot suppress it; the live model may only *add* to it.

**How it is built:** the default engine is a deterministic Hinglish parser (`parser.js`) so the app always works with no key. An optional server endpoint (`api/parse.js`) sends the same message to a Claude model with a strict JSON schema; its output is validated and clamped, and the rule-based red-flag check is merged on top.

**Test results** (run with `npm test`; **demo-mode parser**. Live-model results: [ADD after you set a key and run the same 10 inputs, or state that live AI was not tested]):

| # | Input | What the AI did | Good enough? |
|---|---|---|---|
| 1 | aaj nashta me 2 idli aur chai li, sugar wali | Idli×2 (80-120 kcal), chai (flagged "has sugar?") | Yes. Did not use the "sugar wali" hint to raise chai's estimate. |
| 2 | dopahar ko 3 roti, dal, sabzi aur thoda chawal khaya | Roti×3, dal, sabzi, rice (1 katori default) | Yes, but "thoda" (a little) ignored, so rice is overestimated. |
| 3 | subah 30 min walk kiya, 4 glass pani piya | Walk 30 min, water 1000 ml | Yes |
| 4 | BP ki goli bhool gaye aaj | Medicine: missed | Yes. Child sees "Missed. Please call him." |
| 5 | papa ko chakkar aa raha hai aur kamzori hai | Symptoms: dizziness, weakness; listed under "Watch" | Yes. No diagnosis offered. |
| 6 | seene me dard ho raha hai | Red alert: chest pain → "see a doctor / call 108"; child summary leads with it | Yes |
| 7 | jalebi aur samosa khaya shaadi me | Sweet (flag: high sugar) + fried snack, ranges only | Yes |
| 8 | rice khaya nahi, sirf dahi aur kela | Curd, banana; rice excluded | Yes **after a fix**: first run counted rice as eaten (negation after the food word). Fixed at clause level. |
| 9 | thoda ghumne gaye the | Asks "how many minutes?" instead of guessing | Yes |
| 10 | aaj kuch khaya, thali jaisa tha, bahut tasty | Asks "what was it?" | Yes. Does not invent calories. |

**Language.** The app opens in English; a toggle switches the whole interface, confirmations, alerts and nudges to Hinglish. The parser understands both English and Hinglish input. I added 6 English cases (11-16 in `tests/cases.js`, all passing). Writing them exposed two more bugs that also affected Hinglish, which I fixed: "3 roti, dal" gave dal ×3 (quantity leaked across a comma), and "4 glasses of water" counted 2000 ml (the letter "l" in "dal" was read as a litre unit).

> **Add your own failures here.** Only 10 cases written by me, who also wrote the parser, so they are friendly. Before submitting, try 5-10 nastier messages (Marathi/Konkani words, "thoda sa", typos, a photo of a thali) and add the failures honestly. Known gaps: no photo input, a limited food list, quantity words like "thoda/aadha katori" mostly ignored, Marathi/Konkani vocabulary not covered.

## Q4. What I will build, and what I will leave out

| ID | Feature | Build now / Later / Never | Reason |
|---|---|---|---|
| F01 | Food photo to calories | Later | Single-photo calorie estimates are unreliable for mixed Indian plates (D06, D11); text/voice covers the need with ranges. |
| F02 | Profile and goals | Build now (minimal) | Only fixed goals for one made-up parent. No BMI, no reference image. |
| F03 | Activity tracking | Build now (minimal) | Walk minutes from the message; no sensors needed. |
| F04 | Diet plan | Never | Prescribing a calorie-deficit plan for a diabetic parent is medical territory. |
| F05 | Progress tracker | Build now | The daily summary and bars. Fasting tracker and product upsell: Never (conflict of interest; supplements). |
| F06 | Sleep tracking | Later | Needs a device or reliable self-report; not core. |
| F07 | Challenges and motivation | Never | Streak/challenge mechanics are what churn-prone apps do; our user is a parent, not a gamer. |
| F08 | AI health coach | Never (as a chatbot) | Replaced by the proactive message-to-summary flow; open-ended health chat raises the diagnosis risk. |
| F09 | Catch-up planning | Later | Valuable once there is a plan; we do not prescribe plans yet. The nudge is the light version. |
| F10 | Reports | Later | The daily summary is the report; weekly export once data exists. |
| F11 | Wearables | Never (for now) | The target parent will not wear one (D05). |
| F12 | Subscription tiers | Later | Prove usefulness first. |
| F13 | Free consultation | Never | Needs doctors and compliance; out of scope. |
| F14 | Community activities | Never | Not core to this customer. |
| F15 | Emergency: hospital | Never (integration) | We only show "call 108" on red flags. We cannot guarantee a hospital connection. |
| F16 | Emergency: caretaker or nurse | Later | Natural extension of the child's view. |
| F17 | Guardian access | Build now (reframed) | This *is* the product: the child's "Today" view. |
| F18 | Friends groups | Never | Public comparison does not suit a 68-year-old with a health condition. |
| N01 | Hinglish message-to-structure (voice or text) | Build now | The AI core: replaces the logging form. |
| N02 | Proactive nudge draft | Build now | Time-of-day check-in message for the child to send. |
| N03 | Red-flag rule layer | Build now | Safety that does not depend on a model. |

**The core experience.** *First two minutes:* open the link → Papa's tab: one big box, a mic and example chips → type or say "2 idli aur chai, 30 min walk" → instant "Likh liya ✔" confirmation, or a single question if something is unclear. The child opens "Today": a three-line summary, bars and a suggested nudge. *Normal day:* Papa sends 2-3 lines; the child glances at the summary once in the evening and sends a suggested nudge when something is missing.

Screenshots (English and Hinglish): ![Dad's message](docs/screens/1-papa-message.png) ![Red flag](docs/screens/2-red-flag.png) ![Child's view](docs/screens/3-child-today.png) ![Hinglish](docs/screens/4-hinglish.png)

**My three hardest calls:** *(my draft reasoning; edit it into your own words and check it against your research)*
1. **Text/voice message vs. food photo first.** Weighed: the photo demo is impressive, but accuracy on thalis is poor and a wrong number on a diabetic's diet erodes trust. Chose: message first, calorie *ranges*, photo later. *Would change my mind if:* testers say typing is the barrier, or a photo test shows ≤25% error on common dishes.
2. **Cut the AI coach chatbot.** Weighed: it is the class's flagship feature. Chose: no open chat; the AI works on input and summaries only, limiting diagnosis risk and wordiness (H4). *Would change my mind if:* users repeatedly ask follow-up questions the app cannot answer.
3. **Rule-based safety instead of model-based.** Weighed: a model understands more phrasing. Chose: fixed rules that a model can only add to, because a missed red flag costs far more than a false alarm. *Would change my mind if:* testing shows many false alarms that make users ignore alerts.

## Q5. User test

> **TODO (you must do this):** show the live link to at least one adult-child of a parent 60+ (a classmate or family friend who fits). Watch without helping. Record: who, what they did, where they hesitated, what you changed (even a small copy or button fix), with a commit link.

**Who tested it, what they did, what confused them, and what I changed:** [ ]

## References

1. Kidman et al. (2024), JMIR 26, e56897: https://www.jmir.org/2024/1/e56897
2. Droid Life (2022), MyFitnessPal barcode scanner paywall: https://www.droid-life.com/2022/08/24/myfitnesspal-puts-barcode-scanner-behind-premium-paywall/
3. [Add more as used]
2. Anthropic API documentation (https://docs.anthropic.com), used for the optional live endpoint.
3. Class Discussion Notes: Health AI App, MAI-594 (2026).

---

## Student declaration

1. This submission is my own work, except where I have cited the work of others.
2. I have not submitted this work, in whole or in part, for assessment in any other course.
3. I have used generative AI tools only as permitted by the project brief, and I have disclosed that use below.

**Name:** [ ] · **Roll No.:** [ ] · **Date:** [ ]

**AI-use disclosure**

| Tool used | What it was used for | How I checked its output |
|---|---|---|
| Claude Code | Proposed the product direction, wrote the parser, UI, tests and the draft of this report | Ran the 10-case test suite; it found a negation bug that was fixed; viewed the app in a browser; red-flag path tested by hand. [Edit: say what *you* reviewed and changed.] |
