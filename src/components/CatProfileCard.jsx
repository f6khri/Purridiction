import { getCatRank } from '../lib/catRanks'
import { calculateLevel, xpToNextLevel } from '../lib/xpSystem'

export default function CatProfileCard({ cat, predictions }) {
  const totalXP = cat.total_xp || 0
  const level = calculateLevel(totalXP)
  const xpProgress = xpToNextLevel(totalXP)

  // Average chaos score from predictions
  const avgChaosScore = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + p.chaos_score, 0) / predictions.length)
    : 0

  const rank = getCatRank(avgChaosScore)
  const progressPercent = xpProgress.needed > 0
    ? Math.round((xpProgress.current / xpProgress.needed) * 100)
    : 0

  return (
    <div className="border-2 border-near-black p-6 bg-white shadow-[4px_4px_0px_#1A1A2E]">
      {/* Top row: name + rank */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-black text-xl uppercase tracking-widest text-near-black">
            {cat.name}
          </h3>
          <p className="text-xs font-mono text-neutral-500 mt-1">
            {cat.age_category}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl" aria-label={rank.title}>{rank.emoji}</p>
          <p className="text-xs font-black uppercase tracking-widest text-brand-purple mt-1">
            {rank.title}
          </p>
        </div>
      </div>

      {/* Level + XP bar */}
      <div className="border-t-2 border-near-black pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-black uppercase tracking-widest">
            Level {level}
          </p>
          <p className="text-xs font-mono text-neutral-500">
            {xpProgress.current} / {xpProgress.needed} XP
          </p>
        </div>

        {/* XP progress bar */}
        <div className="w-full h-4 border-2 border-near-black bg-off-white">
          <div
            className="h-full bg-electric-yellow rounded-sm transition-all duration-300"
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
          <p className="text-xs font-mono text-neutral-500">
            Avg Chaos: <span className="font-bold text-near-black">{avgChaosScore}</span>/100
          </p>
          <p className="text-xs font-mono text-neutral-500">
            Total XP: <span className="font-bold text-near-black">{totalXP}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
