import { useState } from 'react'
import { supabase } from '../lib/supabase'

const ROW_ROTATIONS = [-1.5, 1, -0.5, 2, -1]

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
    } catch (err) { console.error(err.message) } finally { setDeleting(null) }
  }

  if (predictions.length === 0) {
    return (
      <div className="border-4 border-dashed border-[#3D3480] p-6 text-center rotate-[1deg]">
        <p style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-[#3D3480]">No predictions yet. The cat awaits. 🔮</p>
      </div>
    )
  }

  return (
    <div className="border-4 border-[#1A1A2E] p-6 bg-white rotate-[-1deg]"
      style={{ boxShadow: '10px 10px 0 #00CFFF' }}>
      <h3 className="font-impact text-2xl text-[#3D3480] uppercase rotate-[-1deg] inline-block mb-4"
        style={{ textShadow: '2px 2px 0 rgba(61,52,128,0.2)' }}>Prediction History</h3>

      <div className="space-y-3">
        {predictions.slice(0, 5).map((pred, i) => {
          const date = new Date(pred.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          return (
            <div key={pred.id}
              style={{ transform: `rotate(${ROW_ROTATIONS[i % ROW_ROTATIONS.length]}deg)`, boxShadow: '3px 3px 0 #3D3480' }}
              className="flex items-center justify-between border-2 border-[#1A1A2E] p-3 bg-[#FFFBF0]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-[#3D3480]">{date}</span>
                  <span className="font-impact text-xl text-[#FF3366]">{pred.chaos_score}</span>
                </div>
                <p className="text-xs font-impact uppercase text-[#3D3480] truncate">{pred.chaos_genre}</p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                {pred.confirmed_accurate === true && <span className="font-impact text-[#00FF88]">✓</span>}
                {pred.confirmed_accurate === false && <span className="font-impact text-[#3D3480]/40">✗</span>}
                {pred.confirmed_accurate === null && <span className="font-mono text-[10px] text-[#3D3480]/30">—</span>}
                <button onClick={() => handleDelete(pred.id)} disabled={deleting === pred.id}
                  className="font-impact text-xs text-[#FF3366] border-2 border-[#FF3366] px-2 py-1 hover:bg-[#FF3366] hover:text-white transition-all disabled:opacity-50"
                  aria-label={`Delete prediction from ${date}`}>{deleting === pred.id ? '...' : '×'}</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
