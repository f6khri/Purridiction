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
      if (accurate) {
        const newXP = (cat.total_xp || 0) + XP_RULES.accurateConfirmBonus
        await supabase.from('cats').update({ total_xp: newXP }).eq('id', cat.id)
      }
      setConfirmed(accurate)
      onConfirm(result.id, accurate)
    } catch (err) {
      console.error('Confirm failed:', err.message)
    } finally {
      setConfirming(false)
    }
  }

  const scorePercent = Math.min(Math.max(result.chaos_score, 0), 100)

  return (
    <div className="bg-[#FFD700] border-4 border-[#1A1A2E] shadow-[10px_10px_0px_#FF3366] rotate-[1deg] overflow-hidden">
      {/* Score */}
      <div className="p-6 border-b-4 border-[#1A1A2E]">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-xs uppercase tracking-widest text-[#3D3480]">Chaos Score</p>
          <p className="font-impact text-8xl text-[#FF3366] leading-none">
            {result.chaos_score}
          </p>
        </div>
        <div className="w-full h-5 border-2 border-[#1A1A2E] bg-white">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${scorePercent}%`,
              backgroundColor: scorePercent >= 80 ? '#FF3366' : scorePercent >= 60 ? '#FF6B00' : scorePercent >= 40 ? '#3D3480' : '#00FF88',
            }}
            role="progressbar"
            aria-valuenow={result.chaos_score}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Genre + Window */}
      <div className="p-6 border-b-4 border-[#1A1A2E] bg-[#FFFBF0]">
        <p
          className="text-2xl text-[#3D3480] italic mb-1"
          style={{ fontFamily: "'Comic Sans MS', cursive" }}
        >
          {result.chaos_genre}
        </p>
        <p className="font-mono text-sm text-[#1A1A2E]">
          Peak: {result.predicted_window}
        </p>
      </div>

      {/* Narration */}
      {result.gemini_narration && (
        <div className="p-6 border-b-4 border-[#1A1A2E] bg-white">
          <p className="font-mono text-xs uppercase tracking-widest text-[#3D3480] mb-2">Scientific Analysis</p>
          <p className="font-body text-sm text-[#1A1A2E] italic leading-relaxed">
            &ldquo;{result.gemini_narration}&rdquo;
          </p>
        </div>
      )}

      {/* Confirmation */}
      <div className="p-6 bg-[#FFD700]">
        {confirmed === null && (
          <div>
            <p className="font-impact text-lg text-[#1A1A2E] text-center mb-3 uppercase">
              Did this happen?
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleConfirm(true)} disabled={confirming}
                className="flex-1 py-3 bg-[#00FF88] text-[#1A1A2E] font-black border-2 border-[#1A1A2E] uppercase shadow-[4px_4px_0px_#1A1A2E] rotate-[-2deg] hover:rotate-[0deg] transition-transform disabled:opacity-50">
                Yes
              </button>
              <button onClick={() => handleConfirm(false)} disabled={confirming}
                className="flex-1 py-3 bg-white text-[#1A1A2E] font-black border-2 border-[#1A1A2E] uppercase shadow-[4px_4px_0px_#1A1A2E] rotate-[2deg] hover:rotate-[0deg] transition-transform disabled:opacity-50">
                No
              </button>
            </div>
          </div>
        )}
        {confirmed === true && (
          <p className="text-center font-impact text-lg text-[#00FF88] uppercase" style={{ textShadow: '2px 2px 0 #1A1A2E' }}>
            ✓ Confirmed — +{XP_RULES.accurateConfirmBonus} XP
          </p>
        )}
        {confirmed === false && (
          <p className="text-center font-impact text-lg text-[#3D3480] uppercase">
            ✗ Not This Time
          </p>
        )}
      </div>
    </div>
  )
}
