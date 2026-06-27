import { useState, useEffect } from 'react'

const MESSAGES = [
  "calibrating chaos sensors...",
  "bribing the cats...",
  "decrypting paw prints...",
  "consulting the oracle...",
  "measuring tail aggression...",
  "analyzing ankle threat levels...",
  "counting knocked items...",
]
const EMOJIS = ['🐱','👑','⚡','🔮','😈','⚔️','🌙','💀','🔥','👹','🐱','👑','⚡','🔮','😈','⚔️','🌙','💀','🔥','👹']

export default function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [progress, setProgress] = useState(20)

  useEffect(() => {
    const m = setInterval(() => setMsgIndex(p => (p + 1) % MESSAGES.length), 1500)
    const p = setInterval(() => setProgress(v => v >= 95 ? 20 : v + 1.5), 60)
    return () => { clearInterval(m); clearInterval(p) }
  }, [])

  return (
    <div className="min-h-screen bg-[#3D3480] flex flex-col items-center justify-center overflow-hidden relative"
      style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 6px)', backgroundSize: '100% 6px', animation: 'shimmer 8s linear infinite' }}>

      {EMOJIS.map((e, i) => (
        <span key={i} className="absolute pointer-events-none"
          style={{ left: `${(i * 5.3) % 100}%`, fontSize: `${30 + (i % 5) * 15}px`, animation: `floatUp ${3 + (i % 8) * 1.2}s linear infinite`, animationDelay: `${i * 0.5}s`, opacity: 0 }}>
          {e}
        </span>
      ))}

      <div className="text-[120px] mb-4" style={{ animation: 'logoRock 0.6s ease-in-out infinite', filter: 'drop-shadow(0 0 30px #FF3366) drop-shadow(0 0 60px #00CFFF)' }}>🐱</div>

      <h1 className="font-impact text-[88px] text-[#FFD700] uppercase mb-2" style={{ letterSpacing: '10px', textShadow: '3px 0 #FF3366, -3px 0 #00CFFF', animation: 'glitch 1.5s infinite', transform: 'rotate(1deg)' }}>
        Purridiction
      </h1>

      <p className="text-white text-lg mb-1" style={{ fontFamily: "'Comic Sans MS', cursive", transform: 'rotate(-1deg)' }}>your cat is planning something.</p>
      <p className="font-mono text-[#00FF88] text-[11px] mb-4" style={{ letterSpacing: '4px' }}>// initializing threat assessment //</p>
      <p className="text-[#C4B5FD] text-base mb-8" style={{ fontFamily: "'Comic Sans MS', cursive" }}>{MESSAGES[msgIndex]}</p>

      <div className="w-[300px] h-5 relative" style={{ border: '4px solid #FFD700', transform: 'rotate(-1deg)' }}>
        <div className="h-full transition-all duration-100" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #FF3366, #FFD700, #00CFFF, #00FF88)', backgroundSize: '300% 100%', animation: 'progressShimmer 2s linear infinite' }} />
      </div>
    </div>
  )
}
