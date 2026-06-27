import { ACHIEVEMENTS } from '../lib/achievements'

const COLORS = ['#FFD700', '#00CFFF', '#FF3366', '#00FF88', '#FF6B00', '#3D3480']
const ROTS = [-4, 3, -2, 4, -3, 2]
const BORDERS = ['solid', 'dashed', 'solid', 'dotted', 'solid', 'dashed']

export default function AchievementGallery({ unlockedIds }) {
  return (
    <div className="bg-[#FFFBF0] p-6"
      style={{ border: '5px solid #1A1A2E', boxShadow: '12px 12px 0 #FFD700', transform: 'rotate(2deg)' }}>
      <div className="mb-6 text-center">
        <span style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-[#3D3480] text-lg">your </span>
        <span className="font-impact text-[48px] text-[#FF3366] uppercase">ACHIEVEMENTS</span>
        <span className="font-mono text-[10px] text-[#00FF88] uppercase tracking-widest ml-2">// classified intel</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((a, i) => {
          const unlocked = unlockedIds.includes(a.id)
          const color = COLORS[i % COLORS.length]
          const rot = ROTS[i % ROTS.length]
          const borderStyle = BORDERS[i % BORDERS.length]
          return (
            <div key={a.id}
              style={{ transform: `rotate(${unlocked ? rot : 2}deg)`, backgroundColor: unlocked ? `${color}20` : '#f5f5f5', border: unlocked ? `4px ${borderStyle} #1A1A2E` : '2px solid #ddd', boxShadow: unlocked ? '4px 4px 0 #1A1A2E' : 'none', opacity: unlocked ? 1 : 0.35, filter: unlocked ? 'none' : 'grayscale(1)' }}
              className="flex flex-col items-center text-center p-3">
              <div className="w-14 h-14 flex items-center justify-center text-2xl rounded-full mb-2"
                style={{ border: '4px solid #1A1A2E', backgroundColor: unlocked ? color : '#e5e5e5' }}>
                {a.emoji}
              </div>
              <p className="font-impact text-[10px] uppercase tracking-wide text-[#1A1A2E]">{a.title}</p>
              {unlocked && <p className="font-mono text-[8px] text-[#3D3480] mt-1">{a.description}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
