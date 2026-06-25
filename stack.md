# Tech Stack and Conventions

## Stack

- **Frontend:** React 18 + Vite (JavaScript only, no TypeScript)
- **Styling:** Tailwind CSS utility classes only
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **AI:** Google Gemini 1.5 Flash, called via Supabase Edge Function proxy only
- **Deploy:** Vercel (frontend), Supabase (Edge Functions + database)

## Environment Variables

Only two variables go in .env.local:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

GEMINI_API_KEY goes into Supabase Secrets only. Never in .env.local.

## File Structure

```
src/
├── lib/
│   ├── supabase.js
│   ├── chaosEngine.js
│   ├── xpSystem.js
│   ├── catRanks.js
│   ├── achievements.js
│   ├── conspiracyReport.js
│   ├── healthLog.js
│   └── vetReport.js
├── components/
│   ├── AuthPage.jsx
│   ├── Dashboard.jsx
│   ├── CatProfileCard.jsx
│   ├── PredictionForm.jsx
│   ├── ResultCard.jsx
│   ├── AchievementGallery.jsx
│   ├── PredictionHistory.jsx
│   ├── ConspiracyReport.jsx
│   ├── HealthLog.jsx
│   └── VetReport.jsx
├── App.jsx
├── main.jsx
└── index.css
supabase/
└── functions/
    └── gemini-proxy/
        └── index.ts
```

## Coding Conventions

- Functional components with hooks only
- async/await everywhere, no .then() chains
- Keep components under 200 lines, split if larger
- All Supabase calls wrapped in try/catch with user-facing error messages
- Environment variables accessed via import.meta.env.VITE_* (Vite convention)
- Always validate inputs before writes
- Export all functions from lib files

## What NOT To Do

- No TypeScript
- No Redux, Zustand, or any state management library
- No custom backend server
- No direct Gemini API calls from the browser
- No GEMINI_API_KEY in the codebase or .env.local
- No .then() chains
- No class components
- No CSS files beyond index.css
