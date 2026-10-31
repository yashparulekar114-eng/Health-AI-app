# Kalji (कळजी)

**Yash Parulekar** · Roll No. **PGDMAI-25-16** · MAI-594 Introduction to Vibe Coding · AY 2026–27

> **For working adults whose parent (60+) lives far away or alone: the parent sends one messy line in English, Hinglish or Hindi ("2 idli and tea, took my tablet, feeling dizzy"), and Kalji turns it into a three-line daily summary, a nudge to send, and an instant red-flag warning.**

- **Live app:** https://kalji.vercel.app
- **Report:** [REPORT.md](REPORT.md)

**Energy and goals:** an estimated calories-burned figure (from walking time), an Eaten / Burned / Net card, and editable daily goals with progress. Burned calories are approximate and use a made-up weight.

**Quick log:** big one-tap buttons for the most common updates, so a parent need not type.

**Languages:** English (default), Hinglish and Hindi (Devanagari), switchable at the top of the page. Everything on screen follows the chosen language: labels, food names, symptoms, warnings, nudges and summaries. The parser understands messages typed or spoken in any of the three.

## How to run / deploy
- Static site: open `index.html`, or deploy the repo root to GitHub Pages / Vercel. No install, no sign-up.
- **Demo mode (default, what is deployed):** a built-in rule-based parser (`parser.js`, no language model) works offline with no key.
- **Live AI (optional, written but not deployed or tested):** on Vercel, set `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`) in project Environment Variables. `api/parse.js` then reads messages with a model. Safety red-flag rules in `parser.js` always run on top. Never commit a key.
- Tests: `npm test` (34 checks: inputs in English, Hinglish and Hindi, plus the calorie-burn formula).

## Safety
Not medical advice. No diagnosis or prescribing. All data is made up and stays in the browser (localStorage). Red-flag words (chest pain, breathlessness, fainting, stroke signs…) trigger a "call 108 / see a doctor" message.

## Credits
No third-party libraries or images; the app icon, icons and illustrations are original SVG drawings. System fonts only. Built with Claude Code; see the AI-use disclosure in the report.
