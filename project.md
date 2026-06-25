# Project Overview

You are building **Purridiction**, a gamified cat behavior predictor web app for the #HackTheKitty 2026 hackathon themed "World Cat Domination Day."

## What Purridiction Does

Users input daily data about their cat (meal time, play, weather, sleep) and get an AI-powered chaos prediction with a funny narration. The app tracks health logs, generates vet visit summaries, and produces classified "Cat Conspiracy Reports." Users earn XP, level up, unlock achievements, and rank their cats from Sleepy Diplomat to Supreme Overlord.

## Reference Documents

Before writing any code, always read these files:

- AGENT.md — full technical spec, all logic code, security architecture, component specs
- DESIGN.md — color palette, typography, component styling, brand guidelines
- README.md — project overview, SQL schema, deployment guide
- SECURITY.md — security decisions and threat model

## Tech Stack

- React 18 + Vite (JavaScript, not TypeScript)
- Tailwind CSS
- Supabase (PostgreSQL + Auth + Edge Functions)
- Google Gemini 1.5 Flash via Supabase Edge Function proxy
- Vercel for deployment

## Core Principles

- Never call Gemini API directly from the browser. Always use supabase.functions.invoke("gemini-proxy")
- Never store GEMINI_API_KEY in .env.local or anywhere in the codebase
- All database tables use Row Level Security
- Validate all user inputs before any Supabase write or Edge Function call
- Use functional components and hooks only, no class components
- Use async/await, not .then() chains
- Tailwind utility classes only, no custom CSS beyond index.css
