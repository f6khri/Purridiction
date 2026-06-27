import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AGE_EMOJIS = { kitten: '🐱', adult: '😼', senior: '😾' }

function timeAgo(dateStr) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function anonymize(name) {
  if (!name) return '???***'
  return name.slice(0, 3).toUpperCase() + '***'
}

function getScoreColor(score) {
  if (score >= 80) return '#FF3366'
  if (score >= 60) return '#FF6B00'
  if (score >= 40) return '#FFD700'
  return '#00FF88'
}

export default function LiveChaosFeed({ session }) {
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFeed = async () => {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data, error } = await supabase
        .from('chaos_predictions')
        .select('chaos_score, chaos_genre, predicted_window, created_at, cats(name, age_category)')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      setFeed(data || [])
    } catch (err) {
      console.error('Feed fetch failed:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeed()
    const interval = setInterval(fetchFeed, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-[#1A1A2E] border-[5px] border-[#FF3366] rotate-[1deg] text-white overflow-hidden"
      style={{ boxShadow: '10px 10px 0 #FF3366' }}>

      {/* Header */}
      <div className="p-4 border-b-2 border-[#FF3366]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3366] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF3366]"></span>
          </span>
          <h3 className="font-impact text-2xl text-[#FF3366] uppercase">Live Chaos Feed</h3>
        </div>
        <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mt-1">
          Global chaos activity · last 24 hours
        </p>
      </div>

      {/* Feed list */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading && (
          <p className="p-4 font-mono text-xs text-neutral-500 text-center"
            style={{ fontFamily: "'Comic Sans MS', cursive" }}>scanning for chaos...</p>
        )}

        {!loading && feed.length === 0 && (
          <div className="p-6 text-center">
            <p style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-neutral-400 italic">
              No chaos reported in the last 24 hours. The cats are planning something.
            </p>
          </div>
        )}

        {!loading && feed.map((item, i) => {
          const catName = item.cats?.name || 'Unknown'
          const ageCategory = item.cats?.age_category || 'adult'
          return (
            <div key={i} className="border-b border-neutral-700 px-4 py-3 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{AGE_EMOJIS[ageCategory] || '😼'}</span>
                  <span className="font-mono text-sm text-[#FFD700]">{anonymize(catName)}</span>
                  <span className="font-impact text-2xl" style={{ color: getScoreColor(item.chaos_score) }}>
                    {item.chaos_score}
                  </span>
                </div>
                <p className="text-sm text-[#C4B5FD] italic truncate"
                  style={{ fontFamily: "'Comic Sans MS', cursive" }}>
                  {item.chaos_genre}
                </p>
              </div>
              <span className="font-mono text-[10px] text-neutral-500 ml-3 whitespace-nowrap">
                {timeAgo(item.created_at)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      {!loading && feed.length > 0 && (
        <div className="p-3 border-t border-neutral-700 text-center">
          <p className="font-mono text-[9px] text-neutral-500">
            {feed.length} events · auto-refreshes every 30s
          </p>
        </div>
      )}
    </div>
  )
}
