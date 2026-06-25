# AGENT.md

This file gives context to the AI coding assistant for building **Purridiction**.

## Project Overview

**Purridiction** is a gamified cat behavior predictor built for the "World Cat Domination Day" hackathon. Users input daily data about their cat (meal time, play, weather, sleep), and the app predicts a "chaos score," a peak chaos time window, and a chaos genre (e.g. "Midnight Zoomies"). An AI-generated narration adds a funny scientific spin. Users earn XP, level up, unlock achievements, and watch their cat rank up from "Sleepy Diplomat" to "Supreme Overlord."

## Tech Stack

- **Frontend:** React 18 (JavaScript, not TypeScript)
- **Build tool:** Vite
- **Styling:** Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL + Auth)
- **AI:** Google Gemini 1.5 Flash API
- **Deploy target:** Vercel

## File Structure

```
.
├── src/
│   ├── App.jsx              # Root component, auth routing
│   ├── main.jsx             # React entry point
│   ├── index.css            # Tailwind imports
│   ├── lib/
│   │   ├── supabase.js          # Supabase client init
│   │   ├── chaosEngine.js       # Chaos scoring logic
│   │   ├── xpSystem.js          # XP/level calculations
│   │   ├── catRanks.js          # Rank tier logic
│   │   ├── achievements.js      # Achievement definitions + checker
│   │   ├── conspiracyReport.js  # Conspiracy report metrics + Gemini prompt
│   │   ├── healthLog.js         # Health log helpers + Gemini insight prompt
│   │   └── vetReport.js         # Vet visit prep summary + Gemini prompt
│   └── components/
│       ├── AuthPage.jsx
│       ├── Dashboard.jsx
│       ├── CatProfileCard.jsx
│       ├── PredictionForm.jsx
│       ├── ResultCard.jsx
│       ├── AchievementGallery.jsx
│       ├── PredictionHistory.jsx
│       ├── ConspiracyReport.jsx  # Classified report UI + share button
│       ├── HealthLog.jsx         # Daily health log form + Gemini insight card
│       └── VetReport.jsx         # Vet visit prep summary UI + screenshot button
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .env.local (not committed)
```

Keep logic files (`chaosEngine.js`, `xpSystem.js`, `catRanks.js`, `achievements.js`) as pure functions with no side effects, separate from components. This makes them testable and keeps components focused on rendering.

## Core Logic — Use Exactly As Specified

### Chaos Scoring (`lib/chaosEngine.js`)

```javascript
export const CHAOS_GENRES = [
  "Midnight Zoomies",
  "Ankle Assassination",
  "Knocking Things Off Tables",
  "Screaming Into The Void",
  "Aggressive Biscuit Making",
  "Unprovoked Sprinting",
  "Staring At Nothing For 10 Minutes",
  "Biting Hand That Feeds",
];

export function calculateChaosScore(inputs) {
  const { lastMealHour, playedToday, weather, ageCategory, hoursSlept } = inputs;
  let score = 0;

  const hoursSinceLastMeal = (new Date().getHours() - lastMealHour + 24) % 24;
  if (hoursSinceLastMeal >= 4 && hoursSinceLastMeal <= 6) score += 30;
  else if (hoursSinceLastMeal > 6) score += 20;
  else score += 5;

  if (!playedToday) score += 25;
  if (weather === "rainy") score += 15;
  else if (weather === "cloudy") score += 8;

  if (ageCategory === "kitten") score += 20;
  else if (ageCategory === "senior") score -= 10;

  if (hoursSlept >= 14) score += 15;
  else if (hoursSlept <= 8) score -= 5;

  return Math.min(Math.max(score, 0), 100);
}

export function predictChaosWindow(lastMealHour) {
  const peakHour = (lastMealHour + 5) % 24;
  const endHour = (peakHour + 2) % 24;
  const format = (h) => `${h % 12 || 12}:00 ${h < 12 ? "AM" : "PM"}`;
  return `${format(peakHour)} - ${format(endHour)}`;
}

export function assignChaosGenre(score, ageCategory) {
  if (score >= 80) return ageCategory === "kitten"
    ? "Unprovoked Sprinting"
    : "Midnight Zoomies";
  if (score >= 60) return "Ankle Assassination";
  if (score >= 40) return "Knocking Things Off Tables";
  if (score >= 20) return "Aggressive Biscuit Making";
  return "Staring At Nothing For 10 Minutes";
}

export function analyzeChaos(inputs) {
  const score = calculateChaosScore(inputs);
  const window = predictChaosWindow(inputs.lastMealHour);
  const genre = assignChaosGenre(score, inputs.ageCategory);
  return { score, window, genre };
}
```

### XP System (`lib/xpSystem.js`)

```javascript
export const XP_RULES = {
  basePerPrediction: 10,
  accurateConfirmBonus: 25,
  dailyStreakBonus: 15,
};

export function calculateLevel(totalXP) {
  return Math.floor(Math.sqrt(totalXP / 50)) + 1;
}

export function xpToNextLevel(totalXP) {
  const currentLevel = calculateLevel(totalXP);
  const nextLevelXP = Math.pow(currentLevel, 2) * 50;
  const currentLevelXP = Math.pow(currentLevel - 1, 2) * 50;
  return {
    current: totalXP - currentLevelXP,
    needed: nextLevelXP - currentLevelXP,
    remaining: nextLevelXP - totalXP
  };
}
```

### Cat Rank System (`lib/catRanks.js`)

```javascript
export const CAT_RANKS = [
  { min: 0, max: 19, title: "Sleepy Diplomat", emoji: "😴" },
  { min: 20, max: 39, title: "Mild Troublemaker", emoji: "😼" },
  { min: 40, max: 59, title: "Chaos Apprentice", emoji: "😈" },
  { min: 60, max: 79, title: "Domestic Menace", emoji: "👹" },
  { min: 80, max: 100, title: "Supreme Overlord", emoji: "👑" },
];

export function getCatRank(avgChaosScore) {
  return CAT_RANKS.find(r => avgChaosScore >= r.min && avgChaosScore <= r.max)
    || CAT_RANKS[0];
}
```

### Achievements (`lib/achievements.js`)

```javascript
export const ACHIEVEMENTS = [
  {
    id: "first_blood",
    title: "First Blood",
    description: "Made your first chaos prediction",
    emoji: "🩸",
    check: (predictions) => predictions.length >= 1,
  },
  {
    id: "midnight_menace",
    title: "Midnight Menace",
    description: "Got Midnight Zoomies 5 times",
    emoji: "🌙",
    check: (predictions) =>
      predictions.filter(p => p.chaos_genre === "Midnight Zoomies").length >= 5,
  },
  {
    id: "calm_before_storm",
    title: "The Calm Before The Storm",
    description: "Went from chaos score under 20 to over 90 between predictions",
    emoji: "⛈️",
    check: (predictions) => {
      for (let i = 1; i < predictions.length; i++) {
        if (predictions[i-1].chaos_score < 20 && predictions[i].chaos_score > 90) return true;
      }
      return false;
    },
  },
  {
    id: "domination_complete",
    title: "Domination Complete",
    description: "Unlocked all 8 chaos genres",
    emoji: "👑",
    check: (predictions) => {
      const genres = new Set(predictions.map(p => p.chaos_genre));
      return genres.size >= 8;
    },
  },
  {
    id: "week_streak",
    title: "7-Day Tyrant",
    description: "Made predictions for 7 days in a row",
    emoji: "🔥",
    check: (predictions) => {
      const dates = [...new Set(predictions.map(p =>
        new Date(p.created_at).toDateString()
      ))].sort((a,b) => new Date(a) - new Date(b));
      let streak = 1, maxStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const diff = (new Date(dates[i]) - new Date(dates[i-1])) / 86400000;
        if (diff === 1) { streak++; maxStreak = Math.max(maxStreak, streak); }
        else streak = 1;
      }
      return maxStreak >= 7;
    },
  },
];

export function checkAchievements(predictions, unlockedIds) {
  return ACHIEVEMENTS.filter(a =>
    !unlockedIds.includes(a.id) && a.check(predictions)
  );
}
```

## Gemini Narration Prompt Template

```
You are a dramatic scientist who studies cat chaos behavior.
Given this data:
- Chaos Score: {score}/100
- Predicted Chaos Window: {window}
- Chaos Genre: {genre}
- Cat Age: {ageCategory}
- Weather: {weather}

Write exactly 2 sentences. First sentence: a deadpan scientific observation about the upcoming chaos. Second sentence: a warning to the cat's owner. Be funny but keep it short.
```

## Security Architecture

Purridiction uses a Supabase Edge Function as a proxy for Gemini API calls. The Gemini API key is NEVER stored in `.env.local` or exposed to the browser. It lives exclusively in Supabase Secrets and is accessed only server-side inside the Edge Function.

### Gemini Proxy Edge Function (`supabase/functions/gemini-proxy/index.ts`)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.length > 2000) {
      return new Response(JSON.stringify({ error: "Invalid prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get("GEMINI_API_KEY")}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await geminiRes.json();
    const narration = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(JSON.stringify({ narration }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

### How to Call the Edge Function from React

Never call Gemini directly from the frontend. Always use this pattern:

```javascript
const { data, error } = await supabase.functions.invoke("gemini-proxy", {
  body: { prompt: yourPromptString },
});

if (error) throw error;
const narration = data.narration;
```

The Supabase client automatically attaches the user's auth token to the request header, so the Edge Function can verify the user is logged in.

### Supabase Secrets Setup

In Supabase dashboard: Edge Functions > Manage Secrets. Add:
```
GEMINI_API_KEY = your_gemini_key_here
```

This key never appears in the codebase or environment files.

### Additional Security Layers

**Input validation on all user inputs before sending to Supabase:**

```javascript
function validatePredictionInputs(inputs) {
  const { lastMealHour, hoursSlept, weather, ageCategory } = inputs;
  if (lastMealHour < 0 || lastMealHour > 23) throw new Error("Invalid meal hour");
  if (hoursSlept < 0 || hoursSlept > 24) throw new Error("Invalid sleep hours");
  if (!["sunny", "cloudy", "rainy"].includes(weather)) throw new Error("Invalid weather");
  if (!["kitten", "adult", "senior"].includes(ageCategory)) throw new Error("Invalid age category");
}
```

Always call `validatePredictionInputs(inputs)` before running `analyzeChaos()` or inserting to Supabase.

**Rate limiting on prediction submissions:**

Add a client-side cooldown to prevent spam. Store last submission timestamp in React state and block re-submission within 10 seconds:

```javascript
const [lastSubmitTime, setLastSubmitTime] = useState(null);

const handlePredict = async () => {
  if (lastSubmitTime && Date.now() - lastSubmitTime < 10000) {
    setError("Slow down, scientist. Wait 10 seconds between predictions.");
    return;
  }
  setLastSubmitTime(Date.now());
  // proceed with prediction
};
```

**Auth checks before every Supabase write:**

```javascript
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // redirect to login, do not proceed
  return;
}
```

**Never trust cat_id from client alone.** All Supabase insert operations include `user_id: session.user.id` explicitly. RLS policies enforce this on the database level as a second layer.

**.env.local should only contain:**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The Gemini key goes ONLY into Supabase Secrets. Never into `.env.local`.

**.gitignore must include:**
```
.env.local
.env
```

## Cat Conspiracy Report Feature

This feature generates a classified intelligence report about a cat's behavior, using existing prediction history data. It is unlocked after a cat has at least 5 predictions.

### New Achievement

Add this to the `ACHIEVEMENTS` array in `lib/achievements.js`:

```javascript
{
  id: "intelligence_breach",
  title: "Intelligence Breach",
  description: "Generated your first Cat Conspiracy Report",
  emoji: "🕵️",
  check: (predictions, meta) => meta?.conspiracyGenerated === true,
},
```

Note: this achievement uses a `meta` parameter instead of predictions alone. Update `checkAchievements` signature to accept an optional second argument:

```javascript
export function checkAchievements(predictions, unlockedIds, meta = {}) {
  return ACHIEVEMENTS.filter(a =>
    !unlockedIds.includes(a.id) && a.check(predictions, meta)
  );
}
```

After generating a conspiracy report, call:
```javascript
const newlyUnlocked = checkAchievements(predictions, unlockedIds, { conspiracyGenerated: true });
```

### Threat Level Logic

```javascript
export function getThreatLevel(avgChaosScore) {
  if (avgChaosScore >= 80) return { level: "BLACK", color: "#1A1A1A", textColor: "#FFFFFF" };
  if (avgChaosScore >= 60) return { level: "RED", color: "#FF4500", textColor: "#FFFFFF" };
  if (avgChaosScore >= 40) return { level: "ORANGE", color: "#FF8C00", textColor: "#1A1A1A" };
  if (avgChaosScore >= 20) return { level: "YELLOW", color: "#FFD700", textColor: "#1A1A1A" };
  return { level: "GREEN", color: "#00C896", textColor: "#1A1A1A" };
}
```

### Metrics Calculation (`lib/conspiracyReport.js`)

```javascript
import { getThreatLevel } from "./conspiracyReport.js";

export function calculateReportMetrics(predictions, cat) {
  const totalPredictions = predictions.length;

  const averageChaos = Math.round(
    predictions.reduce((sum, p) => sum + p.chaos_score, 0) / totalPredictions
  );

  // Most frequent chaos genre
  const genreCounts = predictions.reduce((acc, p) => {
    acc[p.chaos_genre] = (acc[p.chaos_genre] || 0) + 1;
    return acc;
  }, {});
  const dominantGenre = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])[0][0];

  // Top 2 genres as "weapons"
  const topWeapons = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([genre]) => genre);

  // Most frequent time window
  const windowCounts = predictions.reduce((acc, p) => {
    acc[p.predicted_window] = (acc[p.predicted_window] || 0) + 1;
    return acc;
  }, {});
  const peakChaosWindow = Object.entries(windowCounts)
    .sort((a, b) => b[1] - a[1])[0][0];

  // Prediction accuracy
  const confirmed = predictions.filter(p => p.confirmed_accurate === true).length;
  const predictionAccuracy = Math.round((confirmed / totalPredictions) * 100);

  // Coup probability: weighted from chaos score + accuracy
  const coupProbability = Math.min(
    Math.round((averageChaos * 0.7) + (predictionAccuracy * 0.3)),
    99
  );

  const threat = getThreatLevel(averageChaos);

  return {
    catName: cat.name,
    ageCategory: cat.age_category,
    totalPredictions,
    averageChaos,
    dominantGenre,
    topWeapons,
    peakChaosWindow,
    predictionAccuracy,
    coupProbability,
    threatLevel: threat.level,
    threatColor: threat.color,
    threatTextColor: threat.textColor,
  };
}

export function getThreatLevel(avgChaosScore) {
  if (avgChaosScore >= 80) return { level: "BLACK", color: "#1A1A1A", textColor: "#FFFFFF" };
  if (avgChaosScore >= 60) return { level: "RED", color: "#FF4500", textColor: "#FFFFFF" };
  if (avgChaosScore >= 40) return { level: "ORANGE", color: "#FF8C00", textColor: "#1A1A1A" };
  if (avgChaosScore >= 20) return { level: "YELLOW", color: "#FFD700", textColor: "#1A1A1A" };
  return { level: "GREEN", color: "#00C896", textColor: "#1A1A1A" };
}

export function buildConspiracyPrompt(metrics) {
  return `You are a senior analyst at the International Feline Intelligence Bureau (IFIB).
You have been tasked with producing a classified threat assessment report on a domestic cat.
Write in the style of a deadpan, overly serious intelligence document. Be funny but never break character.

Subject data:
- Name: ${metrics.catName}
- Age Category: ${metrics.ageCategory}
- Threat Level: ${metrics.threatLevel}
- Average Chaos Score: ${metrics.averageChaos}/100
- Total Observations: ${metrics.totalPredictions}
- Dominant Behavior Pattern: ${metrics.dominantGenre}
- Primary Weapons: ${metrics.topWeapons.join(", ")}
- Peak Activity Window: ${metrics.peakChaosWindow}
- Prediction Accuracy Rate: ${metrics.predictionAccuracy}%
- Estimated Coup Probability: ${metrics.coupProbability}%

Produce a structured intelligence report with exactly these sections:
1. THREAT SUMMARY (2-3 sentences, behavioral overview)
2. PRIMARY WEAPONS (list the weapons with 1 sentence each explaining the threat)
3. STRATEGIC ANALYSIS (2-3 sentences on infiltration patterns and household vulnerability)
4. COUP PROBABILITY: ${metrics.coupProbability}%
5. FIELD RECOMMENDATIONS (2 actionable recommendations for the human)

Maximum 300 words total. Keep it classified, funny, and deadpan.`;
}
```

### Edge Function Update (`supabase/functions/gemini-proxy/index.ts`)

No changes needed. The conspiracy report uses the same `gemini-proxy` Edge Function. Just pass the prompt from `buildConspiracyPrompt(metrics)` as the body.

### ConspiracyReport Component (`src/components/ConspiracyReport.jsx`)

```jsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { calculateReportMetrics, buildConspiracyPrompt } from "../lib/conspiracyReport";

export default function ConspiracyReport({ cat, predictions, unlockedIds, onAchievementUnlock }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Only render if 5+ predictions exist
  if (predictions.length < 5) {
    return (
      <div className="border-2 border-dashed border-neutral-400 p-4 text-center text-sm text-neutral-500">
        <p className="font-bold">CONSPIRACY REPORT LOCKED</p>
        <p>{5 - predictions.length} more prediction(s) needed to unlock classified intel.</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const metrics = calculateReportMetrics(predictions, cat);
      const prompt = buildConspiracyPrompt(metrics);

      const { data, error: fnError } = await supabase.functions.invoke("gemini-proxy", {
        body: { prompt },
      });

      if (fnError) throw fnError;

      setReport({ text: data.narration, metrics });

      // Trigger achievement if not already unlocked
      if (!unlockedIds.includes("intelligence_breach")) {
        await supabase.from("cat_achievements").insert([{
          cat_id: cat.id,
          user_id: cat.user_id,
          achievement_id: "intelligence_breach",
        }]);
        onAchievementUnlock("intelligence_breach");
      }
    } catch (err) {
      setError("Failed to generate report. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const shareText = report
    ? `🔴 ${report.metrics.catName} has been classified as ${report.metrics.threatLevel} LEVEL THREAT.\n\n🎯 Coup Probability: ${report.metrics.coupProbability}%\n\n⚔️ Primary Weapon: ${report.metrics.topWeapons[0]}\n\nAnalyzed by Purridiction. purridiction.vercel.app`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {!report && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-neutral-900 text-white font-black py-4 border-2 border-neutral-900 hover:bg-neutral-700 disabled:opacity-50 uppercase tracking-widest"
        >
          {loading ? "GENERATING CLASSIFIED REPORT..." : "Generate Conspiracy Report"}
        </button>
      )}

      {error && (
        <p className="text-red-600 text-sm border-2 border-red-600 p-2 text-center">{error}</p>
      )}

      {report && (
        <div className="border-4 border-neutral-900 bg-amber-50 shadow-[6px_6px_0px_#1A1A1A]">
          {/* Header */}
          <div
            className="p-4 border-b-4 border-neutral-900 text-center"
            style={{ backgroundColor: report.metrics.threatColor, color: report.metrics.threatTextColor }}
          >
            <p className="text-xs font-mono tracking-widest mb-1">CLASSIFIED // IFIB INTERNAL</p>
            <p className="text-2xl font-black tracking-widest">THREAT LEVEL: {report.metrics.threatLevel}</p>
            <p className="text-sm font-mono mt-1">SUBJECT: {report.metrics.catName.toUpperCase()}</p>
          </div>

          {/* Report body */}
          <div className="p-6 font-mono text-sm whitespace-pre-wrap leading-relaxed text-neutral-900">
            {report.text}
          </div>

          {/* Footer */}
          <div className="border-t-4 border-neutral-900 p-4 bg-neutral-900 text-center">
            <p className="text-xs text-neutral-400 font-mono tracking-widest">
              PURRIDICTION INTELLIGENCE SYSTEM // EYES ONLY
            </p>
          </div>

          {/* Share section */}
          <div className="p-4 border-t-2 border-neutral-900 space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-center">
              Share Threat Assessment
            </p>
            <div className="bg-white border-2 border-neutral-900 p-3 text-xs font-mono text-neutral-700 whitespace-pre-wrap">
              {shareText}
            </div>
            <button
              onClick={handleCopy}
              className="w-full bg-pink-600 text-white font-black py-2 border-2 border-neutral-900 hover:bg-pink-700"
            >
              {copied ? "COPIED!" : "Copy to Clipboard"}
            </button>
          </div>

          {/* Regenerate */}
          <div className="p-4 border-t-2 border-neutral-900">
            <button
              onClick={() => setReport(null)}
              className="w-full bg-white text-neutral-900 font-black py-2 border-2 border-neutral-900 hover:bg-neutral-100 text-sm"
            >
              Generate New Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### How to Wire ConspiracyReport into Dashboard.jsx

Import and place the component after `PredictionHistory`:

```jsx
import ConspiracyReport from "./ConspiracyReport";

// Inside your Dashboard or cat view, after history:
<ConspiracyReport
  cat={selectedCat}
  predictions={predictionHistory}
  unlockedIds={unlockedAchievementIds}
  onAchievementUnlock={(id) => {
    // Show achievement toast
    // Refresh achievements list
  }}
/>
```

## Cat Health Log Feature

A daily log for cat owners to track basic health metrics. Gemini analyzes patterns and flags anything worth monitoring. This makes Purridiction genuinely useful beyond entertainment.

### New Supabase Table

Run this in Supabase SQL Editor:

```sql
CREATE TABLE health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id UUID NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  meals_eaten INT NOT NULL CHECK (meals_eaten >= 0 AND meals_eaten <= 10),
  water_intake TEXT NOT NULL CHECK (water_intake IN ('low', 'normal', 'high')),
  litter_visits INT NOT NULL CHECK (litter_visits >= 0 AND litter_visits <= 20),
  mood TEXT NOT NULL CHECK (mood IN ('calm', 'playful', 'anxious', 'aggressive', 'lethargic')),
  notes TEXT,
  gemini_insight TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(cat_id, logged_at)
);

ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own health logs" ON health_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own health logs" ON health_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own health logs" ON health_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own health logs" ON health_logs FOR DELETE USING (auth.uid() = user_id);
```

### Health Log Helpers (`src/lib/healthLog.js`)

```javascript
export function validateHealthLog(inputs) {
  const { mealsEaten, waterIntake, litterVisits, mood } = inputs;
  if (mealsEaten < 0 || mealsEaten > 10) throw new Error("Invalid meals eaten");
  if (!["low", "normal", "high"].includes(waterIntake)) throw new Error("Invalid water intake");
  if (litterVisits < 0 || litterVisits > 20) throw new Error("Invalid litter visits");
  if (!["calm", "playful", "anxious", "aggressive", "lethargic"].includes(mood)) throw new Error("Invalid mood");
}

export function buildHealthInsightPrompt(cat, recentLogs) {
  const logSummary = recentLogs.map((log, i) =>
    `Day ${i + 1}: meals=${log.meals_eaten}, water=${log.water_intake}, litter=${log.litter_visits}, mood=${log.mood}${log.notes ? `, notes: ${log.notes}` : ""}`
  ).join("\n");

  return `You are a cat health assistant helping a concerned pet owner monitor their cat's wellbeing.
You are NOT a veterinarian and must not diagnose. You can only flag patterns worth watching.

Cat: ${cat.name} (${cat.age_category})
Recent health logs (newest first):
${logSummary}

Write exactly 2-3 sentences:
- Sentence 1: Observe the most notable pattern in the data (positive or concerning).
- Sentence 2: Give one specific, actionable suggestion the owner can act on today.
- Sentence 3 (optional): Add a gentle flag if anything warrants a vet visit, phrased as a suggestion not a warning.

Keep it warm, clear, and non-alarmist. Never diagnose.`;
}

export function getWaterIntakeFlag(recentLogs) {
  // Flag if water intake has been low for 3+ consecutive days
  const last3 = recentLogs.slice(0, 3);
  return last3.length >= 3 && last3.every(l => l.water_intake === "low");
}

export function getMoodFlag(recentLogs) {
  // Flag if mood has been lethargic or anxious for 2+ consecutive days
  const last2 = recentLogs.slice(0, 2);
  return last2.length >= 2 && last2.every(l => ["lethargic", "anxious"].includes(l.mood));
}
```

### HealthLog Component (`src/components/HealthLog.jsx`)

```jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { validateHealthLog, buildHealthInsightPrompt, getWaterIntakeFlag, getMoodFlag } from "../lib/healthLog";

export default function HealthLog({ cat }) {
  const [logs, setLogs] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    mealsEaten: 2,
    waterIntake: "normal",
    litterVisits: 2,
    mood: "calm",
    notes: "",
  });

  useEffect(() => {
    fetchLogs();
  }, [cat.id]);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("health_logs")
      .select("*")
      .eq("cat_id", cat.id)
      .order("logged_at", { ascending: false })
      .limit(7);
    setLogs(data || []);
  };

  const handleSave = async () => {
    setError(null);
    try {
      validateHealthLog(form);

      const { error: insertError } = await supabase
        .from("health_logs")
        .upsert([{
          cat_id: cat.id,
          user_id: cat.user_id,
          logged_at: new Date().toISOString().split("T")[0],
          meals_eaten: form.mealsEaten,
          water_intake: form.waterIntake,
          litter_visits: form.litterVisits,
          mood: form.mood,
          notes: form.notes || null,
        }], { onConflict: "cat_id,logged_at" });

      if (insertError) throw insertError;

      setSaved(true);
      await fetchLogs();
      setTimeout(() => setSaved(false), 2000);

      // Auto-generate insight after save
      handleGenerateInsight();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerateInsight = async () => {
    if (logs.length === 0) return;
    setLoadingInsight(true);
    try {
      const prompt = buildHealthInsightPrompt(cat, logs);
      const { data } = await supabase.functions.invoke("gemini-proxy", {
        body: { prompt },
      });
      setInsight(data.narration);
    } catch (err) {
      setInsight(null);
    } finally {
      setLoadingInsight(false);
    }
  };

  const waterFlag = getWaterIntakeFlag(logs);
  const moodFlag = getMoodFlag(logs);

  return (
    <div className="space-y-4">
      <h3 className="font-black text-lg uppercase tracking-widest">Daily Health Log</h3>

      {/* Flags */}
      {waterFlag && (
        <div className="bg-yellow-100 border-2 border-yellow-500 p-3 text-sm font-bold">
          Low water intake for 3+ days. Consider adding a water fountain or wet food.
        </div>
      )}
      {moodFlag && (
        <div className="bg-orange-100 border-2 border-orange-500 p-3 text-sm font-bold">
          {cat.name} has been lethargic or anxious for 2+ days. Worth monitoring closely.
        </div>
      )}

      {/* Form */}
      <div className="border-2 border-neutral-900 p-4 space-y-3 bg-white shadow-[4px_4px_0px_#1A1A2E]">
        <div>
          <label className="text-xs font-black uppercase tracking-widest block mb-1">
            Meals Eaten Today: {form.mealsEaten}
          </label>
          <input type="range" min="0" max="10" value={form.mealsEaten}
            onChange={(e) => setForm({ ...form, mealsEaten: parseInt(e.target.value) })}
            className="w-full" />
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest block mb-1">Water Intake</label>
          <div className="flex gap-2">
            {["low", "normal", "high"].map((v) => (
              <button key={v} type="button"
                onClick={() => setForm({ ...form, waterIntake: v })}
                className={`flex-1 py-2 border-2 border-neutral-900 font-black text-sm uppercase ${
                  form.waterIntake === v ? "bg-neutral-900 text-white" : "bg-white"
                }`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest block mb-1">
            Litter Box Visits: {form.litterVisits}
          </label>
          <input type="range" min="0" max="20" value={form.litterVisits}
            onChange={(e) => setForm({ ...form, litterVisits: parseInt(e.target.value) })}
            className="w-full" />
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest block mb-1">Mood Today</label>
          <div className="grid grid-cols-3 gap-2">
            {["calm", "playful", "anxious", "aggressive", "lethargic"].map((v) => (
              <button key={v} type="button"
                onClick={() => setForm({ ...form, mood: v })}
                className={`py-2 border-2 border-neutral-900 font-black text-xs uppercase ${
                  form.mood === v ? "bg-neutral-900 text-white" : "bg-white"
                }`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest block mb-1">Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Anything unusual today?"
            className="w-full border-2 border-neutral-900 p-2 text-sm resize-none h-16"
          />
        </div>

        {error && <p className="text-red-600 text-sm font-bold">{error}</p>}

        <button onClick={handleSave}
          className="w-full bg-pink-600 text-white font-black py-3 border-2 border-neutral-900 hover:bg-pink-700 uppercase">
          {saved ? "SAVED!" : "Log Today's Health"}
        </button>
      </div>

      {/* Gemini Insight */}
      {loadingInsight && (
        <p className="text-sm font-mono text-neutral-500 text-center">Analyzing patterns...</p>
      )}
      {insight && (
        <div className="border-2 border-neutral-900 p-4 bg-amber-50 shadow-[4px_4px_0px_#1A1A2E]">
          <p className="text-xs font-black uppercase tracking-widest mb-2">AI Health Insight</p>
          <p className="text-sm leading-relaxed">{insight}</p>
          <p className="text-xs text-neutral-400 mt-2">Not a veterinary diagnosis. Consult a vet for medical concerns.</p>
        </div>
      )}

      {/* Recent Logs */}
      {logs.length > 0 && (
        <div className="border-2 border-neutral-900 p-4 space-y-2">
          <p className="text-xs font-black uppercase tracking-widest">Recent Logs</p>
          {logs.map((log) => (
            <div key={log.id} className="flex justify-between text-xs border-b border-neutral-200 pb-1">
              <span className="font-mono">{log.logged_at}</span>
              <span>{log.meals_eaten} meals</span>
              <span>water: {log.water_intake}</span>
              <span>mood: {log.mood}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Vet Visit Prep Feature

Generates a clean, readable 7-day behavior summary the owner can screenshot and show to their vet. Combines health log data and chaos predictions.

### Vet Report Helpers (`src/lib/vetReport.js`)

```javascript
export function buildVetReportPrompt(cat, predictions, healthLogs) {
  const predSummary = predictions.slice(0, 7).map((p, i) =>
    `Day ${i + 1}: chaos score ${p.chaos_score}, genre: ${p.chaos_genre}, confirmed: ${p.confirmed_accurate ?? "not confirmed"}`
  ).join("\n");

  const healthSummary = healthLogs.slice(0, 7).map((log, i) =>
    `Day ${i + 1} (${log.logged_at}): meals=${log.meals_eaten}, water=${log.water_intake}, litter=${log.litter_visits}, mood=${log.mood}${log.notes ? `, notes: ${log.notes}` : ""}`
  ).join("\n");

  return `You are helping a cat owner prepare a clear summary for their veterinarian.
Write a professional but friendly behavior and health summary for the past 7 days.
Do not diagnose. Just summarize patterns clearly so a vet can understand the cat's recent state.

Cat: ${cat.name} (${cat.age_category})

Behavior data (chaos predictions):
${predSummary || "No prediction data available."}

Health log data:
${healthSummary || "No health log data available."}

Write the summary in 3 short paragraphs:
1. Behavioral patterns observed (activity level, chaos trends, peak times)
2. Health observations (eating, drinking, litter habits, mood patterns)
3. Any notable changes or things the vet should be aware of

Keep it under 200 words. Use clear, plain language. No bullet points.`;
}
```

### VetReport Component (`src/components/VetReport.jsx`)

```jsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { buildVetReportPrompt } from "../lib/vetReport";

export default function VetReport({ cat, predictions, healthLogs }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const hasEnoughData = predictions.length > 0 || healthLogs.length > 0;

  if (!hasEnoughData) {
    return (
      <div className="border-2 border-dashed border-neutral-400 p-4 text-center text-sm text-neutral-500">
        <p className="font-bold">VET REPORT UNAVAILABLE</p>
        <p>Log at least one health entry or prediction to generate a vet report.</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const prompt = buildVetReportPrompt(cat, predictions, healthLogs);
      const { data, error: fnError } = await supabase.functions.invoke("gemini-proxy", {
        body: { prompt },
      });
      if (fnError) throw fnError;
      setReport(data.narration);
    } catch (err) {
      setError("Failed to generate report. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fullText = report
    ? `VET VISIT SUMMARY\nCat: ${cat.name} (${cat.age_category})\nGenerated by Purridiction\n\n${report}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-black text-lg uppercase tracking-widest">Vet Visit Prep</h3>

      {!report && (
        <button onClick={handleGenerate} disabled={loading}
          className="w-full bg-neutral-900 text-white font-black py-4 border-2 border-neutral-900 hover:bg-neutral-700 disabled:opacity-50 uppercase tracking-widest">
          {loading ? "GENERATING SUMMARY..." : "Generate 7-Day Summary for Vet"}
        </button>
      )}

      {error && (
        <p className="text-red-600 text-sm border-2 border-red-600 p-2 text-center">{error}</p>
      )}

      {report && (
        <div className="border-4 border-neutral-900 bg-white shadow-[6px_6px_0px_#1A1A2E]">
          {/* Header */}
          <div className="bg-neutral-900 text-white p-4 border-b-4 border-neutral-900">
            <p className="text-xs font-mono tracking-widest mb-1">PURRIDICTION // VET VISIT PREP</p>
            <p className="text-xl font-black">{cat.name.toUpperCase()}</p>
            <p className="text-xs font-mono text-neutral-400 mt-1">
              7-Day Summary // Generated {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Report body */}
          <div className="p-6 text-sm leading-relaxed text-neutral-900 whitespace-pre-wrap">
            {report}
          </div>

          {/* Disclaimer */}
          <div className="px-6 pb-4">
            <p className="text-xs text-neutral-400 border-t border-neutral-200 pt-3">
              This summary was generated by Purridiction using AI. It is not a medical diagnosis. Please share with your vet for professional evaluation.
            </p>
          </div>

          {/* Copy button */}
          <div className="border-t-2 border-neutral-900 p-4 space-y-2">
            <button onClick={handleCopy}
              className="w-full bg-pink-600 text-white font-black py-3 border-2 border-neutral-900 hover:bg-pink-700 uppercase">
              {copied ? "COPIED!" : "Copy Summary to Share with Vet"}
            </button>
            <button onClick={() => setReport(null)}
              className="w-full bg-white text-neutral-900 font-black py-2 border-2 border-neutral-900 hover:bg-neutral-100 text-sm uppercase">
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### How to Wire into Dashboard.jsx

```jsx
import HealthLog from "./HealthLog";
import VetReport from "./VetReport";

// Fetch health logs alongside predictions:
const fetchHealthLogs = async () => {
  const { data } = await supabase
    .from("health_logs")
    .select("*")
    .eq("cat_id", selectedCat.id)
    .order("logged_at", { ascending: false })
    .limit(7);
  setHealthLogs(data || []);
};

// In JSX, after PredictionHistory and ConspiracyReport:
<HealthLog cat={selectedCat} />
<VetReport
  cat={selectedCat}
  predictions={predictionHistory}
  healthLogs={healthLogs}
/>
```

### In-App Feeding Reminder

Add this check inside Dashboard.jsx when a cat is selected. Compare current hour against `lastMealHour` from the most recent prediction:

```javascript
function getFeedingReminder(latestPrediction) {
  if (!latestPrediction) return null;
  const hoursSince = (new Date().getHours() - latestPrediction.input_data.lastMealHour + 24) % 24;
  if (hoursSince >= 6) {
    return `${hoursSince} hours since ${latestPrediction.cat?.name || "your cat"} last ate. Chaos risk is rising.`;
  }
  return null;
}

// In JSX, show above the prediction form if reminder exists:
const reminder = getFeedingReminder(predictionHistory[0]);
{reminder && (
  <div className="bg-yellow-300 border-2 border-neutral-900 p-3 font-bold text-sm shadow-[3px_3px_0px_#1A1A2E]">
    {reminder}
  </div>
)}
```



- Use functional components with hooks only (no class components)
- Use `async/await`, not `.then()` chains
- Keep components under ~200 lines; split into smaller components if they grow
- Tailwind utility classes only — no custom CSS files beyond `index.css`
- All Supabase calls should handle errors with try/catch and surface a user-facing message on failure
- Environment variables are accessed via `import.meta.env.VITE_*` (Vite convention, not `process.env`)
- Always validate user inputs before any Supabase write or Edge Function call

## What NOT To Do

- Don't introduce TypeScript
- Don't add a state management library (Redux, Zustand) — React state + Supabase is enough for this scope
- Don't call Gemini API directly from the frontend — always use the Edge Function proxy
- Don't store the Gemini API key anywhere in the codebase or `.env.local`
- Don't over-engineer the achievement system with a rules engine — the array-based `check()` pattern above is sufficient
- Don't skip input validation before writes, even in hackathon mode
