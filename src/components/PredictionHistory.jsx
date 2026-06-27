import { useState } from 'react'
import { supabase } from '../lib/supabase'

const ROW_ROTS = [-1.5, 2, -1, 2.5, -2]

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
      <div style={{ border: '4px dashed #3D3480', transform: 'rotate(1.5deg)' }} className="p-6 text-center">
        <p style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-[#3D3480]">No predictions yet. The cat awaits. 🔮</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6"
      style={{ border: '5px solid #1A1A2E', boxShadow: '12px 12px 0 #00CFFF', transform: 'rotate(-1.5deg)' }}>
      <h3 className="font-impact text-[28px] text-[#3D3480] uppercase mb-4 inline-block"
        style={{ transform: 'rotate(-1deg)', textShadow: '2px 2px 0 rgba(61,52,128,0.15)' }}>Prediction History</h3>

      <div className="space-y-3">
        {predictions.slice(0, 5).map((pred, i) => {
          const date = new Date(pred.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          const scoreColor = pred.chaos_score >= 80 ? '#FF3366' : pred.chaos_score >= 60 ? '#FF6B00' : pred.chaos_score >= 40 ? '#3D3480' : '#00FF88'
          return (
            <div key={pred.id} className="flex items-center justify-between p-3 bg-[#FFFBF0]"
              style={{ border: '2px solid #1A1A2E', transform: `rotate(${ROW_ROTS[i % ROW_ROTS.length]}deg)`, boxShadow: '3px 3px 0 #3D3480' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-[#3D3480]">{date}</span>
                  <span className="font-impact text-[22px]" style={{ color: scoreColor }}>{pred.chaos_score}</span>
                </div>
                <p className="font-impact text-xs uppercase text-[#3D3480] truncate">{pred.chaos_genre}</p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                {pred.confirmed_accurate === true && <span className="text-[#00FF88] font-impact">✓</span>}
                {pred.confirmed_accurate === false && <span className="text-[#3D3480]/40 font-impact">✗</span>}
                {pred.confirmed_accurate === null && <span className="font-mono text-[10px] text-[#3D3480]/30">—</span>}
                <button onClick={() => handleDelete(pred.id)} disabled={deleting === pred.id}
                  className="font-impact text-xs text-[#FF3366] px-2 py-1 disabled:opacity-50"
                  style={{ border: '2px solid #FF3366' }}>{deleting === pred.id ? '...' : '×'}</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
