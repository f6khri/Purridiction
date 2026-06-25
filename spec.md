# Purridiction Feature Spec

## Features

### 1. Authentication
- Email and password signup and login via Supabase Auth
- Session persists across page reloads
- Logout button in header

### 2. Cat Management
- Add multiple cats with name and age category (kitten/adult/senior)
- Select a cat to view its profile and run predictions
- Cat list in sidebar or top of dashboard

### 3. Cat Profile Card
- Shows rank title and emoji (based on average chaos score)
- Shows level (calculated from total_xp)
- XP progress bar toward next level
- Updates after every prediction

### 4. Chaos Prediction
- Input: last meal hour, played today, weather, hours slept
- Output: chaos score (0-100), chaos genre, peak time window, Gemini narration
- Earn 10 XP per prediction, 25 XP for confirming accuracy, 15 XP for daily streak
- Confirm button: "Did this happen?" YES/NO

### 5. In-App Feeding Reminder
- Banner shown if cat has not eaten in 6+ hours based on last prediction input
- Shown above prediction form

### 6. Achievement System
- 6 achievements: First Blood, Midnight Menace, The Calm Before The Storm, Domination Complete, 7-Day Tyrant, Intelligence Breach
- Toast notification on unlock (top-right, auto-dismiss 4 seconds)
- Achievement gallery showing locked (grayscale) and unlocked (full color) badges

### 7. Prediction History
- Last 5 predictions per cat
- Shows date, genre, score, confirmation status
- Delete button per item

### 8. Daily Health Log
- Log meals eaten, water intake, litter visits, mood, optional notes
- One log per cat per day (upsert on duplicate)
- Gemini analyzes last 7 days and surfaces actionable insight
- Auto-flags: low water 3+ days, lethargic/anxious mood 2+ days

### 9. Vet Visit Prep
- Generate 7-day behavior and health summary
- Combines chaos predictions and health log data
- Plain language output suitable for showing to a vet
- Copy to clipboard button
- Disclaimer: not a medical diagnosis

### 10. Cat Conspiracy Report
- Unlocked after 5 predictions
- Generates classified IFIB intelligence report
- Includes threat level, primary weapons, coup probability, recommendations
- Share text auto-generated for social media
- Unlocks Intelligence Breach achievement on first generation

## Database Tables

- cats (id, user_id, name, age_category, total_xp, created_at)
- chaos_predictions (id, cat_id, user_id, chaos_score, chaos_genre, predicted_window, gemini_narration, input_data, confirmed_accurate, created_at)
- cat_achievements (id, cat_id, user_id, achievement_id, unlocked_at)
- health_logs (id, cat_id, user_id, logged_at, meals_eaten, water_intake, litter_visits, mood, notes, gemini_insight, created_at)

## Build Order

Phase 1: Scaffold
Phase 2: Logic files
Phase 3: Auth
Phase 4: Cat management
Phase 5: Cat profile card
Phase 6: Prediction form + result card
Phase 7: Achievements + history
Phase 8: Health log + vet report
Phase 9: Conspiracy report
Phase 10: Final wiring + polish
Phase 11: Edge Function deploy
