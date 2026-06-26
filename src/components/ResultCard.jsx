import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { XP_RULES } from '../lib/xpSystem'

export default function ResultCard({ result, cat, onConfirm }) {
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(result.confirmed_accurate)

  const handleConfirm = async (accurate) => {
    setConfirming(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await supabase.from('chaos_predictions').update({ confirmed_accurate: accurate }).eq('id', result.id)
      if (accurate) { const x = (cat.total_xp||0)+XP_RULES.accurateConfirmBonus; await supabase.from('cats').update({ total_xp: x }).eq('id', cat.id) }
      setConfirmed(accurate); onConfirm(result.id, accurate)
    } catch (err) { console.error(err.message) } finally { setConfirming(false) }
  }

  const scorePercent = Math.min(Math.max(result.chaos_score, 0), 100)

  return (
    <div className="bg-[#FFD700] border-[5px] border-[#1A1A2E] rotate-[1.5deg] overflow-hidden relative"
      style={{ boxShadow: '14px 14px 0 #FF3366, 28px 28px 0 rgba(255,51,102,0.15)' }}>
      {/* Watermark */}
      <span className="absolute bottom-4 left-4 text-[100px] opacity-[0.08] pointer-events-none rotate-[-15deg]">🔮</span>

      {/* Score */}
      <div className="p-6 border-b-4 border-[#1A1A2E] relative z-10">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#3D3480] mb-1">Chaos Score</p>
        <p className="font-impact text-[100px] sm:text-[128px] text-[#FF3366] leading-none"
          style={{ textShadow: '6px 6px 0 #1A1A2E', animation: 'wobble 3s ease-in-out infinite' }}>
          {result.chaos_score}
        </p>
        <div className="w-full h-5 border-2 border-[#1A1A2E] bg-white mt-3">
          <div className="h-full" style={{ width: `${scorePercent}%`, backgroundColor: scorePercent >= 80 ? '#FF3366' : scorePercent >= 60 ? '#FF6B00' : scorePercent >= 40 ? '#3D3480' : '#00FF88' }} />
        </div>
      </div>

      {/* Genre */}
      <div className="p-6 border-b-4 border-[#1A1A2E] bg-[#FFFBF0] relative z-10">
        <p className="text-[26px] text-[#3D3480] rotate-[-2deg] inline-block"
          style={{ fontFamily: "'Comic Sans MS', cursive" }}>{result.chaos_genre}</p>
        <p className="font-mono text-xs text-[#1A1A2E]/70 mt-1" style={{ letterSpacing: '3px' }}>{result.predicted_window}</p>
      </div>

      {/* Narration */}
      {result.gemini_narration && (
        <div className="p-6 border-b-4 border-[#1A1A2E] bg-white relative z-10">
          <div className="border-l-[5px] border-[#FF3366] pl-4 rotate-[0.5deg]">
            <p className="font-body text-sm text-[#1A1A2E] italic leading-relaxed">&ldquo;{result.gemini_narration}&rdquo;</p>
          </div>
        </div>
      )}

      {/* XP Badge */}
      <div className="absolute top-4 right-4 z-20">
        <span className="font-impact text-sm bg-[#00FF88] text-[#1A1A2E] px-2 py-1 border-[3px] border-[#1A1A2E] rotate-[-3deg] inline-block"
          style={{ boxShadow: '4px 4px 0 #1A1A2E' }}>+{XP_RULES.basePerPrediction} XP</span>
      </div>

      {/* Confirm */}
      <div className="p-6 bg-[#FFD700] relative z-10">
        {confirmed === null && (
          <div>
            <p className="text-lg text-[#1A1A2E] text-center mb-3 rotate-[1deg]"
              style={{ fontFamily: "'Comic Sans MS', cursive" }}>Did this happen?</p>
            <div className="flex gap-3">
              <button onClick={() => handleConfirm(true)} disabled={confirming}
                className="flex-1 py-3 bg-[#00FF88] text-[#1A1A2E] font-impact text-lg border-4 border-[#1A1A2E] uppercase rotate-[-3deg] hover:rotate-[0deg] transition-transform disabled:opacity-50"
                style={{ boxShadow: '5px 5px 0 #1A1A2E' }}>Yes</button>
              <button onClick={() => handleConfirm(false)} disabled={confirming}
                className="flex-1 py-3 bg-white text-[#1A1A2E] font-impact text-lg border-4 border-[#1A1A2E] uppercase rotate-[3deg] hover:rotate-[0deg] transition-transform disabled:opacity-50"
                style={{ boxShadow: '5px 5px 0 #1A1A2E' }}>No</button>
            </div>
          </div>
        )}
        {confirmed === true && <p className="text-center font-impact text-xl text-[#00FF88] uppercase" style={{ textShadow: '2px 2px 0 #1A1A2E' }}>✓ Confirmed — +{XP_RULES.accurateConfirmBonus} XP</p>}
        {confirmed === false && <p className="text-center font-impact text-xl text-[#3D3480] uppercase">✗ Not This Time</p>}
      </div>
    </div>
  )
}
