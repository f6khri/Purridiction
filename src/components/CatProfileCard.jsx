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
    <div className="bg-[#1A1A2E] border-[5px] border-[#FFD700] p-6 rotate-[-1.5deg] relative overflow-hidden"
      style={{ boxShadow: '12px 12px 0 #FF3366, 24px 24px 0 rgba(255,51,102,0.15)' }}>
      {/* Crown watermark */}
      <span className="absolute right-2 top-2 text-[100px] opacity-[0.06] pointer-events-none">👑</span>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <h3 className="font-impact text-4xl sm:text-[56px] text-[#FFD700] rotate-[-1deg] inline-block leading-none"
            style={{ textShadow: '4px 4px 0 #FF3366' }}>
            {cat.name}
          </h3>
          <p className="font-mono text-[10px] text-[#00CFFF] uppercase tracking-widest mt-2">{cat.age_category}</p>
        </div>
        <div className="rotate-[2deg] inline-block text-center">
          <p className="text-5xl mb-1" aria-label={rank.title}>{rank.emoji}</p>
          <p className="bg-[#FFD700] text-[#1A1A2E] font-impact text-xs px-2 py-1 uppercase inline-block rotate-[2deg]"
            style={rank.title === 'Supreme Overlord' ? { animation: 'pulseGlow 2s infinite' } : {}}>
            {rank.title}
          </p>
        </div>
      </div>

      {/* Level */}
      <div className="border-t-2 border-[#FFD700] pt-4 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <p className="font-impact text-4xl sm:text-[52px] text-[#00CFFF] leading-none"
            style={{ textShadow: '3px 3px 0 rgba(0,207,255,0.3)' }}>
            LVL {level}
          </p>
          <p className="font-mono text-xs text-[#FFD700]">{xpProgress.current}/{xpProgress.needed} XP</p>
        </div>

        {/* XP bar */}
        <div className="w-full h-[18px] border-[3px] border-[#FFD700] bg-[#3D3480]">
          <div className="h-full transition-all duration-300"
            style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #FFD700, #00FF88, #FFD700)', backgroundSize: '200% 100%', animation: 'shimmer 3s linear infinite' }}
            role="progressbar" aria-valuenow={xpProgress.current} aria-valuemin={0} aria-valuemax={xpProgress.needed} />
        </div>

        <div className="flex justify-between mt-2">
          <p className="font-mono text-[10px] text-[#FF3366]">Chaos Avg: <span className="font-impact text-sm">{avgChaosScore}</span></p>
          <p className="font-mono text-[10px] text-[#00FF88]">XP: <span className="font-impact text-sm">{totalXP}</span></p>
        </div>
      </div>
    </div>
  )
}
