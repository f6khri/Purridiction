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

      await supabase
        .from('chaos_predictions')
        .update({ confirmed_accurate: accurate })
        .eq('id', result.id)

      // Award bonus XP if confirmed accurate
      if (accurate) {
        const newXP = (cat.total_xp || 0) + XP_RULES.accurateConfirmBonus
        await supabase
          .from('cats')
          .update({ total_xp: newXP })
          .eq('id', cat.id)
      }

      setConfirmed(accurate)
      onConfirm(result.id, accurate)
    } catch (err) {
      console.error('Confirm failed:', err.message)
    } finally {
      setConfirming(false)
    }
  }

  // Score color based on chaos level
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-red-orange'
    if (score >= 60) return 'text-hot-pink'
    if (score >= 40) return 'text-brand-purple'
    return 'text-mint-green'
  }

  // Score bar width
  const scorePercent = Math.min(Math.max(result.chaos_score, 0), 100)

  return (
    <div className="border-2 border-near-black bg-white shadow-[4px_4px_0px_#1A1A2E] overflow-hidden">
      {/* Score header */}
      <div className="p-6 border-b-2 border-near-black">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-black text-sm uppercase tracking-widest">
            Chaos Score
          </h3>
          <p className={`font-mono font-bold text-3xl ${getScoreColor(result.chaos_score)}`}>
            {result.chaos_score}
          </p>
        </div>

        {/* Score gauge bar */}
        <div className="w-full h-5 border-2 border-near-black bg-off-white">
          <div
            className="h-full transition-all duration-500 rounded-sm"
            style={{
              width: `${scorePercent}%`,
              backgroundColor:
                scorePercent >= 80 ? '#FF4500' :
                scorePercent >= 60 ? '#FF1493' :
                scorePercent >= 40 ? '#3D3480' :
                '#00C896',
            }}
            role="progressbar"
            aria-valuenow={result.chaos_score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Chaos score: ${result.chaos_score} out of 100`}
          />
        </div>
      </div>

      {/* Genre + Window */}
      <div className="p-6 border-b-2 border-near-black bg-off-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">
              Chaos Genre
            </p>
            <p className="font-heading font-black text-lg text-near-black">
              {result.chaos_genre}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">
              Peak Window
            </p>
            <p className="font-mono font-bold text-sm text-near-black">
              {result.predicted_window}
            </p>
          </div>
        </div>
      </div>

      {/* Gemini narration */}
      {result.gemini_narration && (
        <div className="p-6 border-b-2 border-near-black">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">
            Scientific Analysis
          </p>
          <p className="text-sm leading-relaxed text-near-black italic">
            "{result.gemini_narration}"
          </p>
        </div>
      )}

      {/* Confirmation */}
      <div className="p-6">
        {confirmed === null && (
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-center mb-3">
              Did this happen?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleConfirm(true)}
                disabled={confirming}
                className="flex-1 py-3 bg-mint-green text-near-black font-black border-2 border-near-black uppercase tracking-widest shadow-[3px_3px_0px_#1A1A2E] hover:shadow-[1px_1px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
              >
                Yes
              </button>
              <button
                onClick={() => handleConfirm(false)}
                disabled={confirming}
                className="flex-1 py-3 bg-off-white text-near-black font-black border-2 border-near-black uppercase tracking-widest shadow-[3px_3px_0px_#1A1A2E] hover:shadow-[1px_1px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
              >
                No
              </button>
            </div>
          </div>
        )}

        {confirmed === true && (
          <p className="text-center font-black text-sm uppercase tracking-widest text-mint-green">
            ✓ Confirmed Accurate — +{XP_RULES.accurateConfirmBonus} XP
          </p>
        )}

        {confirmed === false && (
          <p className="text-center font-black text-sm uppercase tracking-widest text-neutral-400">
            ✗ Not This Time
          </p>
        )}
      </div>
    </div>
  )
}
