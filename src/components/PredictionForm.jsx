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
    e.preventDefault(); setError(null)
    if (lastSubmitTime && Date.now() - lastSubmitTime < 10000) { setError("Slow down, scientist. Wait 10 seconds."); return }
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const inputs = { lastMealHour, playedToday, weather, ageCategory: cat.age_category, hoursSlept }
    try { validatePredictionInputs(inputs) } catch (err) { setError(err.message); return }
    setLoading(true); setLastSubmitTime(Date.now())
    try {
      const { score, window, genre } = analyzeChaos(inputs)
      const prompt = `You are a dramatic scientist who studies cat chaos behavior.\nGiven this data:\n- Chaos Score: ${score}/100\n- Predicted Chaos Window: ${window}\n- Chaos Genre: ${genre}\n- Cat Age: ${cat.age_category}\n- Weather: ${weather}\n\nWrite exactly 2 sentences. First sentence: a deadpan scientific observation about the upcoming chaos. Second sentence: a warning to the cat's owner. Be funny but keep it short.`
      const narration = await callGemini(prompt)
      const { data: prediction, error: ie } = await supabase.from('chaos_predictions').insert([{ cat_id: cat.id, user_id: session.user.id, chaos_score: score, chaos_genre: genre, predicted_window: window, gemini_narration: narration, input_data: inputs, confirmed_accurate: null }]).select().single()
      if (ie) throw ie
      const newXP = (cat.total_xp || 0) + XP_RULES.basePerPrediction
      await supabase.from('cats').update({ total_xp: newXP }).eq('id', cat.id)
      const all = [prediction, ...predictions]
      const unlocked = checkAchievements(all, unlockedIds)
      if (unlocked.length > 0) { await supabase.from('cat_achievements').insert(unlocked.map(a => ({ cat_id: cat.id, user_id: session.user.id, achievement_id: a.id }))); unlocked.forEach(a => onAchievementUnlock(a)) }
      onPrediction({ ...prediction, xpAwarded: XP_RULES.basePerPrediction, newTotalXP: newXP })
    } catch (err) { setError(err.message || "Prediction failed.") } finally { setLoading(false) }
  }

  const formatHour = (h) => `${h % 12 || 12}:00 ${h < 12 ? 'AM' : 'PM'}`

  return (
    <form onSubmit={handlePredict} className="bg-[#FFFBF0] border-[5px] border-[#3D3480] p-6 rotate-[1deg] space-y-4 relative overflow-hidden"
      style={{ boxShadow: '12px 12px 0 #3D3480' }}>
      {/* TOP SECRET watermark */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-impact text-[80px] text-[#3D3480] opacity-[0.04] rotate-[-30deg] pointer-events-none select-none">TOP SECRET</span>

      <h3 className="font-impact text-4xl text-[#FF3366] rotate-[-1deg] inline-block relative z-10"
        style={{ textShadow: '3px 3px 0 #1A1A2E' }}>Chaos Prediction</h3>

      <div className="relative z-10">
        <label className="font-mono text-[10px] uppercase tracking-widest text-[#3D3480] block mb-1">Last Meal: {formatHour(lastMealHour)}</label>
        <input type="range" min="0" max="23" value={lastMealHour} onChange={(e) => setLastMealHour(parseInt(e.target.value))} className="w-full accent-[#FF3366]" />
      </div>

      <div className="relative z-10">
        <label className="font-mono text-[10px] uppercase tracking-widest text-[#3D3480] block mb-1">Played Today?</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPlayedToday(true)}
            className={`flex-1 py-2 border-2 border-[#1A1A2E] font-impact text-sm uppercase ${playedToday ? 'bg-[#00FF88] text-[#1A1A2E] rotate-[-2deg]' : 'bg-white'}`}
            style={playedToday ? { boxShadow: '4px 4px 0 #1A1A2E' } : {}}>Yes</button>
          <button type="button" onClick={() => setPlayedToday(false)}
            className={`flex-1 py-2 border-2 border-[#1A1A2E] font-impact text-sm uppercase ${!playedToday ? 'bg-[#FF3366] text-white rotate-[2deg]' : 'bg-white'}`}
            style={!playedToday ? { boxShadow: '4px 4px 0 #1A1A2E' } : {}}>No</button>
        </div>
      </div>

      <div className="relative z-10">
        <label className="font-mono text-[10px] uppercase tracking-widest text-[#3D3480] block mb-1">Weather</label>
        <div className="flex gap-2">
          {[{ v: 'sunny', l: '☀️ Sunny', r: -1 }, { v: 'cloudy', l: '☁️ Cloudy', r: 0 }, { v: 'rainy', l: '🌧️ Rainy', r: 1 }].map(({ v, l, r }) => (
            <button key={v} type="button" onClick={() => setWeather(v)}
              style={{ transform: `rotate(${r}deg)`, boxShadow: weather === v ? '3px 3px 0 #1A1A2E' : 'none' }}
              className={`flex-1 py-2 border-[3px] border-[#1A1A2E] font-impact text-xs uppercase ${weather === v ? 'bg-[#1A1A2E] text-[#FFD700]' : 'bg-white text-[#1A1A2E]'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <label className="font-mono text-[10px] uppercase tracking-widest text-[#3D3480] block mb-1">Hours Slept: {hoursSlept}h</label>
        <input type="range" min="0" max="24" value={hoursSlept} onChange={(e) => setHoursSlept(parseInt(e.target.value))} className="w-full accent-[#3D3480]" />
      </div>

      {error && <p className="text-[#FF3366] text-sm font-black border-2 border-[#FF3366] p-2 rotate-[1deg] relative z-10" role="alert">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-[#FF3366] text-white font-impact text-2xl py-5 border-4 border-[#1A1A2E] uppercase rotate-[-1deg] hover:rotate-[0deg] hover:scale-[1.02] transition-all disabled:opacity-50 relative z-10"
        style={{ boxShadow: '10px 10px 0 #1A1A2E', animation: loading ? 'none' : 'pulseScale 3s ease-in-out infinite' }}>
        {loading ? 'PREDICTING...' : 'PREDICT CHAOS 🔮'}
      </button>
    </form>
  )
}
