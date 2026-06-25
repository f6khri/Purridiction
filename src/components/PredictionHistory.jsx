import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function PredictionHistory({ predictions, onDelete }) {
  const [deleting, setDeleting] = useState(null)

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { error } = await supabase.from('chaos_predictions').delete().eq('id', id).eq('user_id', session.user.id)
      if (error) throw error
      onDelete(id)
    } catch (err) {
      console.error('Delete failed:', err.message)
    } finally {
      setDeleting(null)
    }
  }

  if (predictions.length === 0) {
    return (
      <div className="border-4 border-dashed border-[#3D3480] p-6 text-center rotate-[1deg]">
        <p style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-sm text-[#3D3480]">
          No predictions yet. The cat awaits your analysis. 🔮
        </p>
      </div>
    )
  }

  const recent = predictions.slice(0, 5)

  return (
    <div className="border-4 border-[#1A1A2E] p-6 bg-white shadow-[8px_8px_0px_#00CFFF]">
      <h3 className="font-impact text-2xl text-[#3D3480] uppercase mb-4 rotate-[-1deg] inline-block">
        Prediction History
      </h3>

      <div className="space-y-3">
        {recent.map((pred, i) => {
          const date = new Date(pred.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          const rotation = i % 2 === 0 ? 'rotate-[-1deg]' : 'rotate-[1deg]'

          return (
            <div
              key={pred.id}
              className={`flex items-center justify-between border-2 border-[#1A1A2E] p-3 bg-[#FFFBF0] ${rotation}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-[#3D3480]">{date}</span>
                  <span className="font-impact text-lg text-[#FF3366]">{pred.chaos_score}</span>
                </div>
                <p className="text-xs font-black uppercase tracking-wide text-[#3D3480] truncate">
                  {pred.chaos_genre}
                </p>
              </div>

              <div className="flex items-center gap-2 ml-3">
                {pred.confirmed_accurate === true && <span className="text-sm font-black text-[#00FF88]">✓</span>}
                {pred.confirmed_accurate === false && <span className="text-sm font-black text-[#3D3480]/40">✗</span>}
                {pred.confirmed_accurate === null && <span className="font-mono text-xs text-[#3D3480]/30">—</span>}

                <button
                  onClick={() => handleDelete(pred.id)}
                  disabled={deleting === pred.id}
                  className="text-xs font-black text-[#FF3366] border-2 border-[#FF3366] px-2 py-1 hover:bg-[#FF3366] hover:text-white transition-all disabled:opacity-50"
                  aria-label={`Delete prediction from ${date}`}
                >
                  {deleting === pred.id ? '...' : '×'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
