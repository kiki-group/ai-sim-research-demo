# AI Simulated Research — demo

A mobile-first, static web app that lets you:

1. **Create a synthetic user cohort conversationally** — describe your target audience, answer a few follow-up questions, and get 12 diverse archetypes expanded into a **100-persona cohort**.
2. **Ask the cohort questions** — open-ended, multiple-choice, or Likert — and get back a themed insight report with percentages, verbatim quotes, and follow-ups (not just binary yes/no).
3. **Run mocked research actions** against the cohort: voice agent test, website usability test, concept / messaging test, A/B test, structured survey, and Van Westendorp pricing.

Everything runs in the browser against Google Gemini (`gemini-3-flash-preview`) using **your own API key**. No backend, no OAuth, no accounts.

## Quick start

```bash
npm install
npm run dev
```

Open the URL, paste your [Gemini API key](https://aistudio.google.com/app/apikey), and go. The key is stored only in your browser's `localStorage`.

## Build

```bash
npm run build      # production build for GitHub Pages base path
npm run preview    # serve the built bundle locally
```

## Deploy

### GitHub Pages (default)

The Vite base path defaults to `/ai-sim-research-demo/` to match the GitHub Pages URL.

```bash
npm run deploy
```

This builds the app and publishes the `dist/` folder to a `gh-pages` branch via the `gh-pages` npm package. Enable Pages on the repository pointing at the `gh-pages` branch (root).

### Netlify / other hosts

```bash
VITE_BASE=/ npm run build
```

Then drag the `dist/` folder into [Netlify Drop](https://app.netlify.com/drop) or upload to any static host.

## Notes & caveats

- **This is a demo**, not production software. The Gemini key lives in the user's browser. Don't deploy a shared instance with your own key baked in.
- All 100 personas are generated from **12 archetypes** via one Gemini call + local variation. Keeps latency and cost under control for a demo.
- "Action" pages are synthesized by Gemini in a single structured call per run; they're not connected to real voice / web backends.

## Tech

- Vite + React + TypeScript + Tailwind CSS
- `@google/genai` for Gemini (structured output via `responseSchema`)
- Zustand (+ `persist`) for state
- React Router (hash)
- lucide-react icons, Recharts

## License

Vibe-coded demo for learning purposes.
