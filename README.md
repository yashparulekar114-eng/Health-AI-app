# Kalji (कळजी)

**[YOUR FULL NAME]** · Roll No. **[ROLL NO]** · MAI-594 Introduction to Vibe Coding · AY 2026–27

> **For working adults whose parent (60+) lives far away or alone: Papa sends one messy Hinglish line ("2 idli, chai, goli li, thoda chakkar"), and Kalji turns it into a three-line daily summary, a nudge to send, and an instant red-flag warning.**

- **Live app:** https://kalji-ats-1725.vercel.app
- **Report:** [REPORT.md](REPORT.md)

## How to run / deploy
- Static site: open `index.html`, or deploy the repo root to GitHub Pages / Vercel. No install, no sign-up.
- **Demo mode (default):** a built-in Hinglish parser (`parser.js`) works offline with no key.
- **Live AI (optional):** on Vercel, set `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`) in project Environment Variables. `api/parse.js` then reads messages with a model. Safety red-flag rules in `parser.js` always run on top. Never commit a key.
- Tests: `npm test` (10 realistic inputs).

## Safety
Not medical advice. No diagnosis or prescribing. All data is made up and stays in the browser (localStorage). Red-flag words (chest pain, breathlessness, fainting, stroke signs…) trigger a "call 108 / see a doctor" message.

## Credits
No third-party libraries or images. System fonts only. Built with Claude Code; see the AI-use disclosure in the report.
