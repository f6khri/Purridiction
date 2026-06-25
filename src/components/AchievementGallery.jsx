import { ACHIEVEMENTS } from '../lib/achievements'

export default function AchievementGallery({ unlockedIds }) {
  return (
    <div className="border-2 border-near-black p-6 bg-white shadow-[4px_4px_0px_#1A1A2E]">
      <h3 className="font-heading font-black text-lg uppercase tracking-widest mb-4">
        Achievements
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id)

          return (
            <div
              key={achievement.id}
              className={`flex flex-col items-center text-center p-3 border-2 border-near-black ${
                isUnlocked
                  ? 'bg-electric-yellow/20'
                  : 'bg-neutral-100 grayscale opacity-50'
              }`}
            >
              <div
                className={`w-12 h-12 flex items-center justify-center text-2xl rounded-full border-2 border-near-black mb-2 ${
                  isUnlocked ? 'bg-electric-yellow' : 'bg-neutral-200'
                }`}
              >
                {achievement.emoji}
              </div>
              <p className="text-xs font-black uppercase tracking-wide leading-tight">
                {achievement.title}
              </p>
              {isUnlocked && (
                <p className="text-[10px] font-mono text-neutral-500 mt-1 leading-tight">
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
