import { ACHIEVEMENTS } from '../lib/achievements'

const BADGE_COLORS = ['#FFD700', '#00CFFF', '#FF3366', '#00FF88', '#FF6B00', '#3D3480']
const ROTATIONS = [-2, 1, -1, 2, -1, 1]

export default function AchievementGallery({ unlockedIds }) {
  return (
    <div className="border-4 border-[#1A1A2E] p-6 bg-[#FFFBF0] shadow-[8px_8px_0px_#3D3480]">
      {/* Title — mixed fonts */}
      <div className="mb-6 text-center">
        <span style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-[#FFD700] text-xl">THE </span>
        <span className="font-impact text-3xl text-[#FF3366]">ACHIEVEMENTS </span>
        <span className="font-mono text-[#00FF88] text-xs uppercase tracking-widest">OF GLORY</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((achievement, i) => {
          const isUnlocked = unlockedIds.includes(achievement.id)
          const color = BADGE_COLORS[i % BADGE_COLORS.length]
          const rotation = ROTATIONS[i % ROTATIONS.length]

          return (
            <div
              key={achievement.id}
              style={{ transform: `rotate(${rotation}deg)` }}
              className={`flex flex-col items-center text-center p-3 border-2 border-[#1A1A2E] transition-all ${
                isUnlocked
                  ? 'shadow-[4px_4px_0px_#FFD700]'
                  : 'grayscale opacity-40'
              }`}
              {...(isUnlocked ? { style: { transform: `rotate(${rotation}deg)`, backgroundColor: `${color}20` } } : { style: { transform: `rotate(${rotation}deg)` } })}
            >
              <div
                className={`w-14 h-14 flex items-center justify-center text-2xl rounded-full border-4 border-[#1A1A2E] mb-2`}
                style={{ backgroundColor: isUnlocked ? color : '#e5e5e5' }}
              >
                {achievement.emoji}
              </div>
              <p className="text-xs font-black uppercase tracking-wide leading-tight text-[#1A1A2E]">
                {achievement.title}
              </p>
              {isUnlocked && (
                <p className="text-[10px] font-mono text-[#3D3480] mt-1 leading-tight">
                  {achievement.description}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
