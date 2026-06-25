import { getCatRank } from '../lib/catRanks'
import { calculateLevel, xpToNextLevel } from '../lib/xpSystem'

export default function CatProfileCard({ cat, predictions }) {
  const totalXP = cat.total_xp || 0
  const level = calculateLevel(totalXP)
  const xpProgress = xpToNextLevel(totalXP)

  const avgChaosScore = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + p.chaos_score, 0) / predictions.length)
    : 0

  const rank = getCatRank(avgChaosScore)
  const progressPercent = xpProgress.needed > 0
    ? Math.round((xpProgress.current / xpProgress.needed) * 100)
    : 0

  return (
    <div className="bg-[#1A1A2E] border-4 border-[#FFD700] p-6 shadow-[8px_8px_0px_#FF3366]">
      {/* Top row: name + rank */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-impact text-4xl text-[#FFD700] rotate-[-1deg] inline-block">
            {cat.name}
          </h3>
          <p className="font-mono text-xs text-[#00CFFF] mt-1 uppercase tracking-widest">
            {cat.age_category}
          </p>
        </div>
        <div className="text-right rotate-[2deg] inline-block">
          <p className="text-4xl" aria-label={rank.title}>{rank.emoji}</p>
          <p className="text-xs font-black uppercase tracking-widest text-[#00FF88] mt-1">
            {rank.title}
          </p>
        </div>
      </div>

      {/* Level + XP bar */}
      <div className="border-t-2 border-[#FFD700] pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-impact text-lg text-white uppercase">
            Level {level}
          </p>
          <p className="font-mono text-xs text-[#00CFFF]">
            {xpProgress.current} / {xpProgress.needed} XP
          </p>
        </div>

        {/* XP bar — sharp corners, 16px height */}
        <div className="w-full h-4 border-2 border-[#FFD700] bg-[#3D3480]">
          <div
            className="h-full bg-[#00FF88] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={xpProgress.current}
            aria-valuemin={0}
            aria-valuemax={xpProgress.needed}
            aria-label={`XP progress: ${xpProgress.current} of ${xpProgress.needed}`}
          />
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between mt-3">
          <p className="font-mono text-xs text-[#FFD700]">
            Avg Chaos: <span className="font-black text-[#FF3366]">{avgChaosScore}</span>/100
          </p>
          <p className="font-mono text-xs text-[#FFD700]">
            Total XP: <span className="font-black text-[#00FF88]">{totalXP}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
