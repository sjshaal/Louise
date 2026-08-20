# 🌿 Daily Healer — Louise Hay Healing Assistant

A beautiful, local-first web app that turns Louise Hay's *You Can Heal Your Life* into an intelligent, adaptive personal healing coach. Powered by **RuVector** for semantic search and self-learning vector memory.

> **Disclaimer:** This app is for personal growth and reflection only. It is not medical advice. Always consult a qualified healthcare professional for medical concerns.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Healing Chat** | Compassionate chat UI — describe symptoms and get affirmations + probable causes |
| **Symptom Search** | Hybrid semantic + keyword search across 65 Louise Hay entries |
| **Daily Affirmation** | A calming affirmation changes each day, with personal note |
| **Journal** | Private journal with prompts — entries are embedded into RuVector |
| **History & Insights** | Recurring theme detection from journal entries |
| **Self-Learning** | 👍/👎 feedback reweights RuVector vectors for better future results |
| **PDF Export** | Export any conversation to PDF |
| **Dark Mode** | Serene light & dark themes |
| **Local-first** | Works offline after first load — no API keys needed |

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd Louise
npm install
```

### 2. Ingest Louise Hay data into RuVector
```bash
node scripts/ingest.mjs
```
This computes 384-dimensional n-gram embeddings for all 65 affirmation entries and saves them to `.ruvector-db/store.json`. Run once — or any time you update `data/hay-affirmations.json`.

### 3. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app is ready.

---

## ▲ Deployment (Vercel)

Deployed at [daily-healer.vercel.app](https://daily-healer.vercel.app) via manual `vercel --prod` CLI upload.

**Not fully set up yet:** the Vercel project is *not* connected to the [sjshaal/Louise](https://github.com/sjshaal/Louise) GitHub repo, so pushes to `main` do **not** auto-deploy. To finish setup:
1. Connect GitHub as a login method at [vercel.com/account/login-connections](https://vercel.com/account/login-connections)
2. In the `daily-healer` project → Settings → Git, link it to `sjshaal/Louise`
3. Afterward, pushes to `main` will trigger automatic deployments

Until then, redeploy manually after changes with `vercel --prod`.

### GitHub Pages (static-only mirror)

Also deployed as a static export to [sjshaal.github.io/Louise](https://sjshaal.github.io/Louise/), built from the `gh-pages` branch.

**Limited functionality:** GitHub Pages only serves static files, so `app/api/*` routes are excluded from this build. Daily Healing Chat, Symptom Search, Journal, and Today's Affirmation (all of which call the API) do **not** work here — use the [Vercel deployment](https://daily-healer.vercel.app) for the full app. Redeploy this mirror manually with:
```bash
git worktree add /tmp/gh-pages-build gh-pages
# edit next.config.ts: output: 'export', basePath: '/Louise', assetPrefix: '/Louise/'
# remove app/api before building, then `npm run build`
# commit out/ contents to the gh-pages branch and push
```

---

## 🗂 Project Structure

```
Louise/
├── app/
│   ├── page.tsx                  # Home dashboard
│   ├── chat/page.tsx             # Healing chat
│   ├── search/page.tsx           # Symptom search
│   ├── journal/page.tsx          # Journal
│   ├── history/page.tsx          # History & insights
│   └── api/
│       ├── search/route.ts       # Hybrid search endpoint
│       ├── chat/route.ts         # Chat + response generation
│       ├── affirmation/route.ts  # Daily affirmation
│       ├── journal/route.ts      # Journal save + search
│       └── feedback/route.ts     # Thumbs up/down → vector reweighting
├── components/
│   ├── ChatInterface.tsx         # Full chat UI with PDF export
│   ├── DailyAffirmation.tsx      # Animated affirmation card
│   ├── SymptomSearch.tsx         # Autocomplete search with tag chips
│   ├── JournalEntry.tsx          # Journal write + history
│   ├── HistoryView.tsx           # Theme detection + timeline
│   ├── Sidebar.tsx               # Desktop nav + mobile tab bar
│   └── ThemeProvider.tsx         # Dark/light mode context
├── lib/
│   ├── ruvector.ts               # RuVector singleton (hybrid search, GNN feedback)
│   ├── embeddings.ts             # Local 384-dim n-gram embedder (no API key)
│   ├── hay-data.ts               # Data helpers + keyword search
│   ├── types.ts                  # TypeScript interfaces
│   └── utils.ts                  # cn(), formatDate(), formatRelative()
├── data/
│   └── hay-affirmations.json     # 65 Louise Hay entries (A-Z ailments)
├── scripts/
│   └── ingest.mjs                # One-command ingestion script
└── .ruvector-db/
    └── store.json                # Persisted vector store (git-ignored)
```

---

## 🔬 How RuVector Is Used

### Collection: `hay_affirmations`
Each entry is stored as:
```json
{
  "id": "hay_009",
  "ailment": "Back Pain (Lower)",
  "body_part": "lower back",
  "probable_cause": "Fear of money. Lack of financial support.",
  "affirmation": "I trust the process of life...",
  "keywords": ["back pain", "lower back", "financial", "support"],
  "related_ailments": ["hay_010", "hay_011"]
}
```

### Embedding strategy
Each entry is embedded with a weighted n-gram text: ailment and keywords are repeated 2× to up-weight them. This means searching "lower back financial stress" correctly surfaces the back-pain entry above semantic noise.

### Hybrid search (RRF fusion)
`hybridSearch()` in [lib/ruvector.ts](lib/ruvector.ts) runs both semantic cosine-similarity search AND keyword token matching, then fuses them with **Reciprocal Rank Fusion** (`k=60`). This consistently beats either alone for domain-specific medical/wellness queries.

### Graph relationships
`related_ailments` arrays encode directed edges. `getGraphNeighbors()` traverses these to surface connected conditions (e.g., searching "liver" also surfaces "resentment" and "anger" as graph neighbors).

### Self-learning feedback
👍 feedback amplifies a vector by 1.05×; 👎 dampens by 0.95×. After several interactions, frequently-upvoted entries naturally rise in cosine similarity rankings — a lightweight RLHF loop that requires no retraining.

---

## 🎨 Design System

| Token | Value | Use |
|---|---|---|
| `lavender-*` | Purple-toned | Primary UI, headers, active states |
| `sage-*` | Green-toned | Affirmations, success states |
| `blush-*` | Pink-toned | Emotions, accent |
| `cream-*` | Warm white | Page backgrounds |
| `font-serif` | Georgia | Affirmation text, headings |
| `font-sans` | Inter | Body copy, UI |

Animations: `fade-in`, `slide-up`, `float`, `pulse-soft` — all defined in [tailwind.config.ts](tailwind.config.ts).

---

## 🛣 Next Steps

### Near-term
- [ ] **Voice input** — Web Speech API for hands-free symptom input
- [ ] **Real semantic embeddings** — swap `LocalNGramProvider` for `@xenova/transformers` (MiniLM-L6-v2, runs locally in Node.js) for richer semantic search
- [ ] **PWA / offline** — Add `next-pwa` for full offline support and home screen install
- [ ] **More data** — Expand `hay-affirmations.json` to 200+ entries covering chakras, body systems, relationships

### Medium-term
- [ ] **Multi-user auth** — Add Clerk or Lucia for user accounts; move journal to server-side storage
- [ ] **Affirmation notifications** — Daily push notifications via `web-push`
- [ ] **Audio affirmations** — Text-to-speech with the Web Speech API or ElevenLabs
- [ ] **Sharing** — Generate beautiful affirmation cards as PNG for Instagram/WhatsApp

### Long-term
- [ ] **Full RuVector native** — Compile RuVector's Rust crate for your platform for 10–100× faster search on large collections
- [ ] **GNN learning** — Plug in RuVector's actual GNN layer for cross-entry pattern propagation
- [ ] **Mobile app** — Wrap with Capacitor or React Native for iOS/Android

---

## 🧘 About Louise Hay

Louise Hay (1926–2017) was a motivational author and the founder of Hay House. Her book *You Can Heal Your Life* (1984) sold over 50 million copies worldwide. Her philosophy: **every thought we think is creating our future** — and by changing our thoughts, we can change our lives.

This app is an educational tribute, not affiliated with Hay House. All affirmations are inspired by her published work.

---

Made with love 🌸
