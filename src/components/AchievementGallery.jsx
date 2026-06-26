import { ACHIEVEMENTS } from '../lib/achievements'

const COLORS = ['#FFD700', '#00CFFF', '#FF3366', '#00FF88', '#FF6B00', '#3D3480']
const ROTS = [-3, 2, -1, 3, -2, 1]

export default function AchievementGallery({ unlockedIds }) {
  return (
    <div className="border-4 border-[#1A1A2E] p-6 bg-[#FFFBF0] rotate-[0.5deg]"
      style={{ boxShadow: '10px 10px 0 #3D3480' }}>
      <div className="mb-6 text-center">
        <span style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-[#3D3480] text-lg">your </span>
        <span className="font-impact text-4xl text-[#FF3366] uppercase">ACHIEVEMENTS </span>
        <span className="font-mono text-[10px] text-[#00FF88] uppercase tracking-widest">// classified intel</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((a, i) => {
          const unlocked = unlockedIds.includes(a.id)
          const color = COLORS[i % COLORS.length]
          const rot = ROTS[i % ROTS.length]
          return (
            <div key={a.id}
              style={{ transform: `rotate(${rot}deg)`, backgroundColor: unlocked ? `${color}20` : undefined, boxShadow: unlocked ? '4px 4px 0 #1A1A2E' : 'none' }}
              className={`flex flex-col items-center text-center p-3 border-2 border-[#1A1A2E] ${!unlocked ? 'grayscale opacity-[0.35] rotate-[2deg]' : ''}`}>
              <div className="w-14 h-14 flex items-center justify-center text-2xl rounded-full border-4 border-[#1A1A2E] mb-2"
                style={{ backgroundColor: unlocked ? color : '#e5e5e5' }}>
                {a.emoji}
              </div>
              <p className="text-[10px] font-impact uppercase tracking-wide text-[#1A1A2E]">{a.title}</p>
              {unlocked && <p className="font-mono text-[9px] text-[#3D3480] mt-1">{a.description}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
