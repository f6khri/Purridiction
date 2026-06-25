# Security Rules

These rules are non-negotiable. Follow them in every file.

## API Key Protection

GEMINI_API_KEY must never appear in:
- Any source file
- .env.local
- Any browser-side code
- Network requests from the client

It lives only in Supabase Secrets and is accessed only inside the Edge Function via Deno.env.get("GEMINI_API_KEY").

All Gemini calls use this pattern, never direct fetch:
```javascript
const { data, error } = await supabase.functions.invoke("gemini-proxy", {
  body: { prompt: yourPromptString },
});
```

## Row Level Security

All four tables have RLS enabled. Every policy checks auth.uid() = user_id.
Never query across users. Always filter by the current user's ID.

## Input Validation

Always validate before writes. Use these functions from AGENT.md:
- validatePredictionInputs(inputs) before chaos prediction
- validateHealthLog(inputs) before health log save

## Auth Checks

Check session before every sensitive operation:
```javascript
const { data: { session } } = await supabase.auth.getSession();
if (!session) return; // redirect to login
```

## Rate Limiting

Enforce 10 second cooldown between prediction submissions:
```javascript
if (lastSubmitTime && Date.now() - lastSubmitTime < 10000) {
  setError("Wait 10 seconds between predictions.");
  return;
}
```

## .gitignore

Must include:
```
.env.local
.env
```
