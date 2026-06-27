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
    <form onSubmit={handlePredict} className="bg-[#FFFBF0] p-6 space-y-4 relative overflow-hidden"
      style={{ border: '6px solid #3D3480', boxShadow: '14px 14px 0 #3D3480', transform: 'rotate(1.5deg)' }}>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-impact text-[88px] text-[#FF3366] opacity-[0.04] pointer-events-none select-none" style={{ transform: 'translate(-50%,-50%) rotate(-28deg)' }}>TOP SECRET</span>

      <div className="relative z-10">
        <span className="font-impact text-[40px] text-[#FF3366] inline-block" style={{ textShadow: '3px 3px 0 #1A1A2E', transform: 'rotate(-1deg)' }}>CHAOS</span>
        <span className="text-[20px] text-[#3D3480] inline-block ml-2" style={{ fontFamily: "'Comic Sans MS', cursive", transform: 'rotate(1deg)' }}>prediction</span>
      </div>

      <div className="relative z-10">
        <label className="font-mono text-[10px] uppercase text-[#3D3480] block mb-1" style={{ letterSpacing: '4px' }}>Last Meal: {formatHour(lastMealHour)}</label>
        <input type="range" min="0" max="23" value={lastMealHour} onChange={(e) => setLastMealHour(parseInt(e.target.value))} className="w-full" style={{ accentColor: '#FF3366' }} />
      </div>

      <div className="relative z-10">
        <label className="font-mono text-[10px] uppercase text-[#3D3480] block mb-1" style={{ letterSpacing: '4px' }}>Played Today?</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPlayedToday(true)}
            className="flex-1 py-2 font-impact text-sm uppercase"
            style={{ background: playedToday ? '#00FF88' : 'white', border: '3px solid #1A1A2E', transform: 'rotate(-3deg)', ...(playedToday ? { boxShadow: '5px 5px 0 #1A1A2E' } : {}) }}>Yes</button>
          <button type="button" onClick={() => setPlayedToday(false)}
            className="flex-1 py-2 font-impact text-sm uppercase"
            style={{ background: !playedToday ? '#FF3366' : 'white', color: !playedToday ? 'white' : '#1A1A2E', border: '3px solid #1A1A2E', transform: 'rotate(3deg)', ...(!playedToday ? { boxShadow: '5px 5px 0 #1A1A2E' } : {}) }}>No</button>
        </div>
      </div>

      <div className="relative z-10">
        <label className="font-mono text-[10px] uppercase text-[#3D3480] block mb-1" style={{ letterSpacing: '4px' }}>Weather</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setWeather('sunny')} className="flex-1 py-2 font-impact text-sm uppercase"
            style={{ background: weather === 'sunny' ? '#FFD700' : 'white', border: '3px solid #1A1A2E', transform: 'rotate(-2deg)', ...(weather === 'sunny' ? { boxShadow: '4px 4px 0 #1A1A2E' } : {}) }}>☀️ Sunny</button>
          <button type="button" onClick={() => setWeather('cloudy')} className="flex-1 py-2 font-impact text-sm uppercase"
            style={{ background: weather === 'cloudy' ? '#9CA3AF' : 'white', color: weather === 'cloudy' ? 'white' : '#1A1A2E', border: '3px solid #1A1A2E', transform: 'rotate(1deg)', ...(weather === 'cloudy' ? { boxShadow: '4px 4px 0 #1A1A2E' } : {}) }}>☁️ Cloudy</button>
          <button type="button" onClick={() => setWeather('rainy')} className="flex-1 py-2 font-impact text-sm uppercase"
            style={{ background: weather === 'rainy' ? '#00CFFF' : 'white', border: '3px solid #1A1A2E', transform: 'rotate(-1deg)', ...(weather === 'rainy' ? { boxShadow: '4px 4px 0 #1A1A2E' } : {}) }}>🌧️ Rainy</button>
        </div>
      </div>

      <div className="relative z-10">
        <label className="font-mono text-[10px] uppercase text-[#3D3480] block mb-1" style={{ letterSpacing: '4px' }}>Hours Slept: {hoursSlept}h</label>
        <input type="range" min="0" max="24" value={hoursSlept} onChange={(e) => setHoursSlept(parseInt(e.target.value))} className="w-full" style={{ accentColor: '#3D3480' }} />
      </div>

      {error && <p className="text-[#FF3366] text-sm font-black p-2 relative z-10" style={{ border: '2px solid #FF3366', transform: 'rotate(1deg)' }} role="alert">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full text-white font-impact text-[32px] py-6 uppercase relative z-10 hover:scale-[1.02] transition-transform disabled:opacity-50"
        style={{ background: '#FF3366', border: '5px solid #1A1A2E', transform: 'rotate(-1.5deg)', boxShadow: '12px 12px 0 #1A1A2E', letterSpacing: '4px', animation: loading ? 'none' : 'pulseScale 3s infinite' }}>
        {loading ? 'PREDICTING...' : 'PREDICT CHAOS 🔮'}
      </button>
    </form>
  )
}
