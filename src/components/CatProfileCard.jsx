import { getCatRank } from '../lib/catRanks'
import { calculateLevel, xpToNextLevel } from '../lib/xpSystem'

export default function CatProfileCard({ cat, predictions }) {
  const totalXP = cat.total_xp || 0
  const level = calculateLevel(totalXP)
  const xpProgress = xpToNextLevel(totalXP)
  const avgChaosScore = predictions.length > 0 ? Math.round(predictions.reduce((s, p) => s + p.chaos_score, 0) / predictions.length) : 0
  const rank = getCatRank(avgChaosScore)
  const progressPercent = xpProgress.needed > 0 ? Math.round((xpProgress.current / xpProgress.needed) * 100) : 0

  return (
    <div className="bg-[#1A1A2E] p-6 relative overflow-visible"
      style={{ border: '6px solid #FFD700', boxShadow: '14px 14px 0 #FF3366, 28px 28px 0 rgba(255,51,102,0.1)', transform: 'rotate(-2deg)' }}>
      {/* Watermark */}
      <span className="absolute right-0 top-0 text-[120px] opacity-[0.05] pointer-events-none" style={{ transform: 'rotate(20deg)' }}>👑</span>

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <h3 className="font-impact text-[50px] sm:text-[64px] text-[#FFD700] leading-none inline-block"
            style={{ textShadow: '5px 5px 0 #FF3366', transform: 'rotate(-1.5deg)', letterSpacing: '2px' }}>
            {cat.name}
          </h3>
          <p className="text-[#C4B5FD] text-sm mt-1" style={{ fontFamily: "'Comic Sans MS', cursive", transform: 'rotate(1deg)' }}>
            {cat.age_category}
          </p>
        </div>
        <div className="text-center" style={{ transform: 'rotate(2deg)' }}>
          <p className="text-5xl mb-1">{rank.emoji}</p>
          {/* Rank badge overflowing */}
          <span className="font-impact text-[13px] bg-[#FFD700] text-[#1A1A2E] px-2 py-1 inline-block uppercase"
            style={{ border: '3px solid #1A1A2E', boxShadow: '3px 3px 0 rgba(255,255,255,0.3)', transform: 'rotate(2deg)', letterSpacing: '2px', ...(rank.title === 'Supreme Overlord' ? { animation: 'pulseGlow 2s infinite' } : {}) }}>
            {rank.title}
          </span>
        </div>
      </div>

      {/* Mood ring + Level */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full" style={{ backgroundColor: avgChaosScore >= 60 ? '#FF3366' : avgChaosScore >= 30 ? '#FFD700' : '#00FF88', animation: 'pulseGlow 2s infinite' }} />
          <span className="font-mono text-[#FF3366] text-[11px] tracking-widest">THREAT ACTIVE</span>
        </div>
        <p className="font-impact text-[56px] text-[#00CFFF] leading-none"
          style={{ textShadow: '4px 4px 0 rgba(0,207,255,0.25)', letterSpacing: '4px' }}>
          LVL {level}
        </p>
      </div>

      {/* XP bar */}
      <div className="relative z-10">
        <div className="w-full h-5" style={{ border: '3px solid #FFD700' }}>
          <div className="h-full" style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #FFD700, #FF6B00, #FFD700)', backgroundSize: '200% 100%', animation: 'shimmer 3s linear infinite' }}
            role="progressbar" aria-valuenow={xpProgress.current} aria-valuemin={0} aria-valuemax={xpProgress.needed} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-mono text-[10px] text-[#FF3366]">Chaos: <span className="font-impact text-sm">{avgChaosScore}</span></span>
          <span className="font-mono text-[10px] text-[#00FF88]">XP: <span className="font-impact text-sm">{xpProgress.current}/{xpProgress.needed}</span></span>
        </div>
      </div>
    </div>
  )
}
