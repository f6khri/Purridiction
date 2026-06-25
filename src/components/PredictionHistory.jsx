import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function PredictionHistory({ predictions, onDelete }) {
  const [deleting, setDeleting] = useState(null)

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { error } = await supabase
        .from('chaos_predictions')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id)

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
      <div className="border-2 border-dashed border-neutral-400 p-6 text-center">
        <p className="text-sm text-neutral-500 font-medium">
          No predictions yet. Run your first chaos prediction above.
        </p>
      </div>
    )
  }

  // Show last 5
  const recent = predictions.slice(0, 5)

  return (
    <div className="border-2 border-near-black p-6 bg-white shadow-[4px_4px_0px_#1A1A2E]">
      <h3 className="font-heading font-black text-lg uppercase tracking-widest mb-4">
        Prediction History
      </h3>

      <div className="space-y-3">
        {recent.map((pred) => {
          const date = new Date(pred.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })

          return (
            <div
              key={pred.id}
              className="flex items-center justify-between border-2 border-near-black p-3 bg-off-white"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-neutral-500">{date}</span>
                  <span className="font-mono font-bold text-sm text-near-black">
                    {pred.chaos_score}
                  </span>
                </div>
                <p className="text-xs font-black uppercase tracking-wide text-brand-purple truncate">
                  {pred.chaos_genre}
                </p>
              </div>

              <div className="flex items-center gap-2 ml-3">
                {/* Confirmation status */}
                {pred.confirmed_accurate === true && (
                  <span className="text-xs font-black text-mint-green">✓</span>
                )}
                {pred.confirmed_accurate === false && (
                  <span className="text-xs font-black text-neutral-400">✗</span>
                )}
                {pred.confirmed_accurate === null && (
                  <span className="text-xs font-mono text-neutral-300">—</span>
                )}

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(pred.id)}
                  disabled={deleting === pred.id}
                  className="text-xs font-black text-red-orange border-2 border-red-orange px-2 py-1 hover:bg-red-orange hover:text-white transition-all disabled:opacity-50"
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
