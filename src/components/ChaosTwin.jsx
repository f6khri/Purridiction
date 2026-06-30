import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { CHAOS_GENRES } from '../lib/chaosEngine'
import { getCatRank } from '../lib/catRanks'

const buildCatVector = (catPredictions, ageCategory) => {
  const avgScore = catPredictions.reduce((s, p) => s + p.chaos_score, 0) / catPredictions.length

  const genreCounts = {}
  CHAOS_GENRES.forEach(g => { genreCounts[g] = 0 })
  catPredictions.forEach(p => {
    if (genreCounts[p.chaos_genre] !== undefined) genreCounts[p.chaos_genre]++
  })
  const genreVector = CHAOS_GENRES.map(g => genreCounts[g] / catPredictions.length)

  const peakHours = catPredictions.map(p => {
    const match = p.predicted_window?.match(/(\d+):00/)
    return match ? parseInt(match[1]) : 12
  })
  const avgPeakHour = peakHours.reduce((s, h) => s + h, 0) / peakHours.length

  const ageNumeric = { kitten: 0, adult: 0.5, senior: 1 }[ageCategory] || 0.5

  return [avgScore / 100, ...genreVector, avgPeakHour / 24, ageNumeric]
}

const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
  if (magA === 0 || magB === 0) return 0
  return dotProduct / (magA * magB)
}

const getTier = (pct) => {
  if (pct >= 90) return { label: 'COSMIC ALIGNMENT', color: '#FFD700' }
  if (pct >= 75) return { label: 'STRONG MATCH', color: '#00FF88' }
  if (pct >= 60) return { label: 'BEHAVIORAL OVERLAP', color: '#00CFFF' }
  if (pct >= 40) return { label: 'DISTANT COUSINS', color: '#FF6B00' }
  return { label: 'OPPOSITES', color: '#FF3366' }
}

const anonymize = (name) => name ? name.slice(0, 3).toUpperCase() + '***' : '???'

export default function ChaosTwin({ cat, predictions, session }) {
  const [twin, setTwin] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalCats, setTotalCats] = useState(0)
  const [copied, setCopied] = useState(false)

  if (predictions.length < 5) {
    return (
      <div style={{ border: '4px dashed #00CFFF', transform: 'rotate(1deg)' }} className="p-6 text-center">
        <p className="font-impact text-lg text-[#00CFFF] uppercase">🧬 Chaos Twin Locked</p>
        <p className="font-mono text-[10px] text-[#00CFFF]/60 mt-1">Need 5+ predictions to find your Chaos Twin. ({predictions.length}/5)</p>
      </div>
    )
  }

  const handleFind = async () => {
    setLoading(true)
    setError(null)
    setTwin(null)

    try {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { data: allPredictions, error: fetchErr } = await supabase
        .from('chaos_predictions')
        .select('cat_id, chaos_score, chaos_genre, predicted_window, created_at, cats(name, age_category, user_id)')
        .gte('created_at', since)

      if (fetchErr) throw fetchErr

      // Group by cat_id, exclude current cat and same user's cats
      const grouped = {}
      for (const p of (allPredictions || [])) {
        if (p.cat_id === cat.id) continue
        if (p.cats?.user_id === session.user.id) continue
        if (!grouped[p.cat_id]) grouped[p.cat_id] = { predictions: [], name: p.cats?.name, age_category: p.cats?.age_category }
        grouped[p.cat_id].predictions.push(p)
      }

      // Filter to cats with 5+ predictions
      const candidates = Object.entries(grouped)
        .filter(([, v]) => v.predictions.length >= 5)
        .map(([catId, v]) => ({
          catId,
          name: v.name,
          age_category: v.age_category,
          vector: buildCatVector(v.predictions, v.age_category),
          avgScore: Math.round(v.predictions.reduce((s, p) => s + p.chaos_score, 0) / v.predictions.length),
          predCount: v.predictions.length,
        }))

      setTotalCats(candidates.length)

      if (candidates.length === 0) {
        setTwin(null)
        setError('no_match')
        return
      }

      const myVector = buildCatVector(predictions, cat.age_category)

      let bestMatch = null
      let bestScore = -1
      candidates.forEach(other => {
        const sim = cosineSimilarity(myVector, other.vector)
        if (sim > bestScore) { bestScore = sim; bestMatch = other }
      })

      if (bestMatch) {
        setTwin({ cat: bestMatch, compatibility: Math.round(bestScore * 100) })
      } else {
        setError('no_match')
      }
    } catch (err) {
      console.error('ChaosTwin error:', err)
      setError('fetch_error')
    } finally {
      setLoading(false)
    }
  }

  const myRank = getCatRank(predictions.length > 0 ? Math.round(predictions.reduce((s, p) => s + p.chaos_score, 0) / predictions.length) : 0)
  const twinRank = twin ? getCatRank(twin.cat.avgScore) : null
  const tier = twin ? getTier(twin.compatibility) : null

  const shareText = twin ? `🧬 ${cat.name}'s Chaos Twin has been found!\n\nCompatibility: ${twin.compatibility}% — ${tier.label}\n\nSomewhere out there, another cat shares this exact chaos energy.\n\nFind your Chaos Twin on Purridiction.` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="text-white relative overflow-hidden"
      style={{ background: '#1A1A2E', border: '6px solid #00CFFF', boxShadow: '14px 14px 0 #FF3366, 28px 28px 0 rgba(255,51,102,0.1)', transform: 'rotate(-1.5deg)' }}>

      {/* Watermark */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] opacity-[0.05] pointer-events-none" style={{ animation: 'spinSlow 30s linear infinite' }}>🧬</span>

      {/* Header */}
      <div className="p-4" style={{ borderBottom: '4px solid #00CFFF' }}>
        <p className="font-impact text-3xl text-[#00CFFF] uppercase" style={{ textShadow: '3px 3px 0 #FF3366' }}>Chaos Twin Finder</p>
        <p className="text-sm text-[#C4B5FD] mt-1" style={{ fontFamily: "'Comic Sans MS', cursive" }}>Somewhere out there, a cat shares your chaos DNA.</p>
      </div>

      <div className="p-6 relative z-10">
        {/* IDLE / Button */}
        {!twin && !loading && error !== 'no_match' && (
          <div className="text-center space-y-4">
            <p className="text-6xl">🧬</p>
            <button onClick={handleFind}
              className="w-full font-impact text-[22px] py-4 uppercase"
              style={{ background: '#00CFFF', color: '#1A1A2E', border: '4px solid white', transform: 'rotate(2deg)', boxShadow: '8px 8px 0 #FF3366', animation: 'pulseScale 2.5s infinite' }}>
              Find My Chaos Twin
            </button>
            <p className="font-mono text-[9px] text-[#6B7280]">Matched using behavioral vector analysis</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-4xl mb-2" style={{ animation: 'spinSlow 2s linear infinite' }}>🧬</p>
            <p style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-[#C4B5FD]">Scanning the chaos network...</p>
          </div>
        )}

        {/* No match */}
        {error === 'no_match' && (
          <div className="text-center space-y-4">
            <p className="text-4xl">😿</p>
            <p className="font-impact text-xl text-[#FF3366]">No Chaos Twin Found Yet</p>
            <p style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-sm text-[#C4B5FD]">Be the first to set this pattern. Check back as more cats join.</p>
            <button onClick={() => { setError(null); setTwin(null) }}
              className="font-mono text-xs text-[#6B7280]" style={{ border: '2px dashed #6B7280', padding: '8px 16px' }}>
              Try Again
            </button>
          </div>
        )}

        {error === 'fetch_error' && (
          <div className="text-center space-y-3">
            <p className="text-[#FF3366] font-impact">Connection Error</p>
            <button onClick={() => setError(null)} className="font-mono text-xs text-[#6B7280]" style={{ border: '2px dashed #6B7280', padding: '8px 16px' }}>Retry</button>
          </div>
        )}

        {/* Result */}
        {twin && tier && (
          <div className="space-y-5">
            <p className="font-impact text-2xl text-[#00CFFF] text-center uppercase">Chaos Twin Found!</p>

            {/* Two cards */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Your cat */}
              <div className="flex-1 w-full bg-[#FFFBF0] text-[#1A1A2E] p-4"
                style={{ border: '3px solid #1A1A2E', transform: 'rotate(-2deg)' }}>
                <p className="text-3xl mb-1">{myRank.emoji}</p>
                <p className="font-impact text-lg">{cat.name}</p>
                <p className="font-mono text-[10px] text-[#3D3480]">{cat.age_category}</p>
              </div>

              {/* Center compatibility */}
              <div className="text-center flex-shrink-0">
                <p className="text-3xl" style={{ animation: 'pulseScale 1.5s infinite' }}>⚡</p>
                <p className="font-impact text-[64px] leading-none" style={{ color: tier.color, textShadow: '4px 4px 0 #1A1A2E' }}>
                  {twin.compatibility}%
                </p>
                <p className="font-mono text-[9px] uppercase tracking-widest" style={{ letterSpacing: '3px', color: tier.color }}>{tier.label}</p>
              </div>

              {/* Twin cat */}
              <div className="flex-1 w-full bg-[#FFFBF0] text-[#1A1A2E] p-4"
                style={{ border: '3px solid #1A1A2E', transform: 'rotate(2deg)' }}>
                <p className="text-3xl mb-1">{twinRank.emoji}</p>
                <p className="font-impact text-lg">{anonymize(twin.cat.name)}</p>
                <p className="font-mono text-[10px] text-[#3D3480]">{twin.cat.age_category}</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button onClick={handleCopy}
                className="w-full font-impact text-lg py-3 uppercase"
                style={{ background: '#FFD700', color: '#1A1A2E', border: '4px solid #1A1A2E', boxShadow: '6px 6px 0 #1A1A2E' }}>
                {copied ? '📋 COPIED!' : '📋 Share Match'}
              </button>
              <button onClick={() => { setTwin(null); setError(null) }}
                className="w-full py-2 text-[#6B7280] text-sm"
                style={{ fontFamily: "'Comic Sans MS', cursive", border: '2px dashed #6B7280' }}>
                Search Again
              </button>
            </div>

            <p className="font-mono text-[9px] text-[#6B7280] text-center">Scanned {totalCats} cat(s) in the chaos network</p>
          </div>
        )}
      </div>
    </div>
  )
}
