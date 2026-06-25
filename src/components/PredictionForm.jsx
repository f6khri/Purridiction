import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { analyzeChaos } from '../lib/chaosEngine'
import { XP_RULES } from '../lib/xpSystem'
import { checkAchievements } from '../lib/achievements'

function validatePredictionInputs(inputs) {
  const { lastMealHour, hoursSlept, weather, ageCategory } = inputs
  if (lastMealHour < 0 || lastMealHour > 23) throw new Error("Invalid meal hour")
  if (hoursSlept < 0 || hoursSlept > 24) throw new Error("Invalid sleep hours")
  if (!["sunny", "cloudy", "rainy"].includes(weather)) throw new Error("Invalid weather")
  if (!["kitten", "adult", "senior"].includes(ageCategory)) throw new Error("Invalid age category")
}

export default function PredictionForm({ cat, predictions, unlockedIds, onPrediction, onAchievementUnlock }) {
  const [lastMealHour, setLastMealHour] = useState(new Date().getHours())
  const [playedToday, setPlayedToday] = useState(true)
  const [weather, setWeather] = useState('sunny')
  const [hoursSlept, setHoursSlept] = useState(12)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastSubmitTime, setLastSubmitTime] = useState(null)

  const handlePredict = async (e) => {
    e.preventDefault()
    setError(null)

    // Rate limiting: 10 second cooldown
    if (lastSubmitTime && Date.now() - lastSubmitTime < 10000) {
      setError("Slow down, scientist. Wait 10 seconds between predictions.")
      return
    }

    // Auth check
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const inputs = {
      lastMealHour,
      playedToday,
      weather,
      ageCategory: cat.age_category,
      hoursSlept,
    }

    try {
      validatePredictionInputs(inputs)
    } catch (err) {
      setError(err.message)
      return
    }

    setLoading(true)
    setLastSubmitTime(Date.now())

    try {
      // Calculate chaos
      const { score, window, genre } = analyzeChaos(inputs)

      // Build Gemini prompt
      const prompt = `You are a dramatic scientist who studies cat chaos behavior.
Given this data:
- Chaos Score: ${score}/100
- Predicted Chaos Window: ${window}
- Chaos Genre: ${genre}
- Cat Age: ${cat.age_category}
- Weather: ${weather}

Write exactly 2 sentences. First sentence: a deadpan scientific observation about the upcoming chaos. Second sentence: a warning to the cat's owner. Be funny but keep it short.`

      // Call Gemini via Edge Function
      const { data: geminiData, error: geminiError } = await supabase.functions.invoke("gemini-proxy", {
        body: { prompt },
      })

      if (geminiError) throw geminiError
      const narration = geminiData?.narration || ""

      // Save prediction to Supabase
      const { data: prediction, error: insertError } = await supabase
        .from('chaos_predictions')
        .insert([{
          cat_id: cat.id,
          user_id: session.user.id,
          chaos_score: score,
          chaos_genre: genre,
          predicted_window: window,
          gemini_narration: narration,
          input_data: inputs,
          confirmed_accurate: null,
        }])
        .select()
        .single()

      if (insertError) throw insertError

      // Award XP
      const newXP = (cat.total_xp || 0) + XP_RULES.basePerPrediction
      await supabase
        .from('cats')
        .update({ total_xp: newXP })
        .eq('id', cat.id)

      // Check achievements
      const allPredictions = [prediction, ...predictions]
      const newlyUnlocked = checkAchievements(allPredictions, unlockedIds)
      if (newlyUnlocked.length > 0) {
        const achievementInserts = newlyUnlocked.map(a => ({
          cat_id: cat.id,
          user_id: session.user.id,
          achievement_id: a.id,
        }))
        await supabase.from('cat_achievements').insert(achievementInserts)
        newlyUnlocked.forEach(a => onAchievementUnlock(a))
      }

      // Notify parent
      onPrediction({ ...prediction, xpAwarded: XP_RULES.basePerPrediction, newTotalXP: newXP })
    } catch (err) {
      setError(err.message || "Prediction failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatHour = (h) => `${h % 12 || 12}:00 ${h < 12 ? 'AM' : 'PM'}`

  return (
    <form onSubmit={handlePredict} className="border-2 border-near-black p-6 bg-white shadow-[4px_4px_0px_#1A1A2E] space-y-4">
      <h3 className="font-heading font-black text-lg uppercase tracking-widest">
        Chaos Prediction
      </h3>

      {/* Last meal hour */}
      <div>
        <label className="text-xs font-black uppercase tracking-widest block mb-1">
          Last Meal: {formatHour(lastMealHour)}
        </label>
        <input
          type="range"
          min="0"
          max="23"
          value={lastMealHour}
          onChange={(e) => setLastMealHour(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs font-mono text-neutral-400 mt-1">
          <span>12 AM</span>
          <span>12 PM</span>
          <span>11 PM</span>
        </div>
      </div>

      {/* Played today */}
      <div>
        <label className="text-xs font-black uppercase tracking-widest block mb-1">
          Played Today?
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPlayedToday(true)}
            className={`flex-1 py-2 border-2 border-near-black font-black text-sm uppercase transition-all ${
              playedToday ? 'bg-mint-green text-near-black' : 'bg-white text-near-black hover:bg-neutral-100'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setPlayedToday(false)}
            className={`flex-1 py-2 border-2 border-near-black font-black text-sm uppercase transition-all ${
              !playedToday ? 'bg-red-orange text-white' : 'bg-white text-near-black hover:bg-neutral-100'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Weather */}
      <div>
        <label className="text-xs font-black uppercase tracking-widest block mb-1">
          Weather
        </label>
        <div className="flex gap-2">
          {[
            { value: 'sunny', label: '☀️ Sunny' },
            { value: 'cloudy', label: '☁️ Cloudy' },
            { value: 'rainy', label: '🌧️ Rainy' },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setWeather(value)}
              className={`flex-1 py-2 border-2 border-near-black font-black text-xs uppercase transition-all ${
                weather === value ? 'bg-near-black text-white' : 'bg-white text-near-black hover:bg-neutral-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Hours slept */}
      <div>
        <label className="text-xs font-black uppercase tracking-widest block mb-1">
          Hours Slept: {hoursSlept}h
        </label>
        <input
          type="range"
          min="0"
          max="24"
          value={hoursSlept}
          onChange={(e) => setHoursSlept(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs font-mono text-neutral-400 mt-1">
          <span>0h</span>
          <span>12h</span>
          <span>24h</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-orange text-sm font-bold border-2 border-red-orange p-2 text-center" role="alert">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-hot-pink text-white font-black py-4 border-2 border-near-black uppercase tracking-widest shadow-[4px_4px_0px_#1A1A2E] hover:shadow-[2px_2px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
      >
        {loading ? 'Predicting...' : 'Predict Chaos'}
      </button>
    </form>
  )
}
