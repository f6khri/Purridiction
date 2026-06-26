import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { callGemini } from '../lib/gemini'
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

    if (lastSubmitTime && Date.now() - lastSubmitTime < 10000) {
      setError("Slow down, scientist. Wait 10 seconds between predictions.")
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const inputs = { lastMealHour, playedToday, weather, ageCategory: cat.age_category, hoursSlept }

    try { validatePredictionInputs(inputs) }
    catch (err) { setError(err.message); return }

    setLoading(true)
    setLastSubmitTime(Date.now())

    try {
      const { score, window, genre } = analyzeChaos(inputs)

      const prompt = `You are a dramatic scientist who studies cat chaos behavior.
Given this data:
- Chaos Score: ${score}/100
- Predicted Chaos Window: ${window}
- Chaos Genre: ${genre}
- Cat Age: ${cat.age_category}
- Weather: ${weather}

Write exactly 2 sentences. First sentence: a deadpan scientific observation about the upcoming chaos. Second sentence: a warning to the cat's owner. Be funny but keep it short.`

      const narration = await callGemini(prompt)

      const { data: prediction, error: insertError } = await supabase
        .from('chaos_predictions')
        .insert([{ cat_id: cat.id, user_id: session.user.id, chaos_score: score, chaos_genre: genre, predicted_window: window, gemini_narration: narration, input_data: inputs, confirmed_accurate: null }])
        .select().single()
      if (insertError) throw insertError

      const newXP = (cat.total_xp || 0) + XP_RULES.basePerPrediction
      await supabase.from('cats').update({ total_xp: newXP }).eq('id', cat.id)

      const allPredictions = [prediction, ...predictions]
      const newlyUnlocked = checkAchievements(allPredictions, unlockedIds)
      if (newlyUnlocked.length > 0) {
        const achievementInserts = newlyUnlocked.map(a => ({ cat_id: cat.id, user_id: session.user.id, achievement_id: a.id }))
        await supabase.from('cat_achievements').insert(achievementInserts)
        newlyUnlocked.forEach(a => onAchievementUnlock(a))
      }

      onPrediction({ ...prediction, xpAwarded: XP_RULES.basePerPrediction, newTotalXP: newXP })
    } catch (err) {
      setError(err.message || "Prediction failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatHour = (h) => `${h % 12 || 12}:00 ${h < 12 ? 'AM' : 'PM'}`

  return (
    <form onSubmit={handlePredict} className="bg-[#FFFBF0] border-4 border-[#3D3480] p-6 shadow-[8px_8px_0px_#3D3480] rotate-[-1deg] space-y-4">
      <h3 className="font-impact text-3xl text-[#FF3366] uppercase">
        Chaos Prediction
      </h3>

      {/* Last meal hour */}
      <div>
        <label className="font-mono text-xs uppercase tracking-widest text-[#3D3480] block mb-1">
          Last Meal: {formatHour(lastMealHour)}
        </label>
        <input
          type="range" min="0" max="23" value={lastMealHour}
          onChange={(e) => setLastMealHour(parseInt(e.target.value))}
          className="w-full accent-[#FF3366]"
        />
        <div className="flex justify-between font-mono text-xs text-[#3D3480]/60 mt-1">
          <span>12 AM</span><span>12 PM</span><span>11 PM</span>
        </div>
      </div>

      {/* Played today */}
      <div>
        <label className="font-mono text-xs uppercase tracking-widest text-[#3D3480] block mb-1">
          Played Today?
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPlayedToday(true)}
            className={`flex-1 py-2 border-2 border-[#1A1A2E] font-black text-sm uppercase transition-all ${
              playedToday ? 'bg-[#00FF88] text-[#1A1A2E] rotate-[-1deg]' : 'bg-white text-[#1A1A2E]'
            }`}>Yes</button>
          <button type="button" onClick={() => setPlayedToday(false)}
            className={`flex-1 py-2 border-2 border-[#1A1A2E] font-black text-sm uppercase transition-all ${
              !playedToday ? 'bg-[#FF3366] text-white rotate-[1deg]' : 'bg-white text-[#1A1A2E]'
            }`}>No</button>
        </div>
      </div>

      {/* Weather */}
      <div>
        <label className="font-mono text-xs uppercase tracking-widest text-[#3D3480] block mb-1">Weather</label>
        <div className="flex gap-2">
          {[{ value: 'sunny', label: '☀️ Sunny' }, { value: 'cloudy', label: '☁️ Cloudy' }, { value: 'rainy', label: '🌧️ Rainy' }].map(({ value, label }, i) => (
            <button key={value} type="button" onClick={() => setWeather(value)}
              style={{ transform: `rotate(${i === 0 ? -1 : i === 2 ? 1 : 0}deg)` }}
              className={`flex-1 py-2 border-2 border-[#1A1A2E] font-black text-xs uppercase transition-all ${
                weather === value ? 'bg-[#1A1A2E] text-[#FFD700]' : 'bg-white text-[#1A1A2E]'
              }`}>{label}</button>
          ))}
        </div>
      </div>

      {/* Hours slept */}
      <div>
        <label className="font-mono text-xs uppercase tracking-widest text-[#3D3480] block mb-1">
          Hours Slept: {hoursSlept}h
        </label>
        <input type="range" min="0" max="24" value={hoursSlept}
          onChange={(e) => setHoursSlept(parseInt(e.target.value))}
          className="w-full accent-[#3D3480]" />
        <div className="flex justify-between font-mono text-xs text-[#3D3480]/60 mt-1">
          <span>0h</span><span>12h</span><span>24h</span>
        </div>
      </div>

      {error && (
        <p className="text-[#FF3366] text-sm font-black border-2 border-[#FF3366] p-2 rotate-[1deg]" role="alert">{error}</p>
      )}

      <button type="submit" disabled={loading}
        className="w-full bg-[#FF3366] text-white font-impact text-xl py-4 border-4 border-[#1A1A2E] uppercase shadow-[6px_6px_0px_#1A1A2E] rotate-[1deg] hover:rotate-[0deg] hover:scale-[1.02] transition-all disabled:opacity-50">
        {loading ? 'Predicting...' : 'Predict Chaos'}
      </button>
    </form>
  )
}
