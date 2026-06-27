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

  return (
    <div className="bg-[#FFD700] p-6 relative overflow-visible"
      style={{ border: '6px solid #1A1A2E', boxShadow: '16px 16px 0 #FF3366, 32px 32px 0 rgba(255,51,102,0.1)', transform: 'rotate(2deg)' }}>
      {/* Watermark */}
      <span className="absolute bottom-[-20px] left-[-20px] text-[130px] opacity-[0.07] pointer-events-none">🔮</span>

      {/* XP badge */}
      <span className="absolute top-4 right-4 z-20 font-impact text-[18px] bg-[#00FF88] text-[#1A1A2E] px-3 py-1 inline-block"
        style={{ border: '4px solid #1A1A2E', boxShadow: '5px 5px 0 #1A1A2E', transform: 'rotate(-4deg)', letterSpacing: '2px' }}>+{XP_RULES.basePerPrediction} XP</span>

      {/* Score */}
      <div className="relative z-10 mb-4">
        <span className="font-mono text-[10px] tracking-widest opacity-60 block" style={{ letterSpacing: '4px' }}>chaos score</span>
        <span className="font-impact text-[120px] sm:text-[140px] text-[#FF3366] leading-none block"
          style={{ textShadow: '8px 8px 0 #1A1A2E', animation: 'wobble 3s ease-in-out infinite' }}>
          {result.chaos_score}
        </span>
      </div>

      {/* Genre */}
      <div className="relative z-10 mb-4">
        <span className="text-[28px] text-[#3D3480] inline-block"
          style={{ fontFamily: "'Comic Sans MS', cursive", transform: 'rotate(-2deg)', textShadow: '2px 2px 0 rgba(61,52,128,0.2)' }}>
          {result.chaos_genre}
        </span>
        <p className="font-mono text-[12px] text-[#1A1A2E] opacity-70 mt-1" style={{ letterSpacing: '3px' }}>{result.predicted_window}</p>
      </div>

      {/* Narration */}
      {result.gemini_narration && (
        <div className="relative z-10 mb-4" style={{ borderLeft: '6px solid #FF3366', paddingLeft: '16px', transform: 'rotate(0.5deg)' }}>
          <p className="font-body text-sm text-[#1A1A2E] italic" style={{ lineHeight: '1.8' }}>&ldquo;{result.gemini_narration}&rdquo;</p>
        </div>
      )}

      {/* Confirm */}
      <div className="relative z-10 pt-4" style={{ borderTop: '3px dashed #1A1A2E' }}>
        {confirmed === null && (
          <div>
            <p className="text-lg text-[#1A1A2E] text-center mb-3" style={{ fontFamily: "'Comic Sans MS', cursive", transform: 'rotate(1deg)' }}>did this actually happen?</p>
            <div className="flex gap-3">
              <button onClick={() => handleConfirm(true)} disabled={confirming}
                className="flex-1 py-3 font-impact text-lg uppercase disabled:opacity-50"
                style={{ background: '#00FF88', border: '4px solid #1A1A2E', boxShadow: '6px 6px 0 #1A1A2E', transform: 'rotate(-4deg)' }}>Yes</button>
              <button onClick={() => handleConfirm(false)} disabled={confirming}
                className="flex-1 py-3 font-impact text-lg uppercase disabled:opacity-50"
                style={{ background: 'white', border: '4px solid #1A1A2E', boxShadow: '6px 6px 0 #1A1A2E', transform: 'rotate(4deg)' }}>No</button>
            </div>
          </div>
        )}
        {confirmed === true && <p className="text-center font-impact text-xl text-[#00FF88] uppercase" style={{ textShadow: '3px 3px 0 #1A1A2E' }}>✓ Confirmed — +{XP_RULES.accurateConfirmBonus} XP</p>}
        {confirmed === false && <p className="text-center font-impact text-xl text-[#3D3480] uppercase">✗ Not This Time</p>}
      </div>
    </div>
  )
}
