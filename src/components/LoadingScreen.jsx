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

const EMOJIS = ['🐱', '👑', '⚡', '🔮', '😈', '⚔️', '🌙', '🐱', '👑', '⚡', '🔮', '😈', '⚔️', '🌙', '🐱']

export default function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % MESSAGES.length)
    }, 1500)
    const progInterval = setInterval(() => {
      setProgress(prev => prev >= 100 ? 0 : prev + 2)
    }, 50)
    return () => { clearInterval(msgInterval); clearInterval(progInterval) }
  }, [])

  return (
    <div className="min-h-screen bg-[#3D3480] flex flex-col items-center justify-center overflow-hidden relative"
      style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }}>

      {/* Floating emojis */}
      {EMOJIS.map((emoji, i) => (
        <span
          key={i}
          className="absolute text-4xl pointer-events-none"
          style={{
            left: `${(i * 7) % 100}%`,
            fontSize: `${20 + (i % 4) * 12}px`,
            animation: `floatUp ${8 + (i % 5) * 2}s linear infinite`,
            animationDelay: `${i * 0.7}s`,
            opacity: 0,
          }}
        >{emoji}</span>
      ))}

      {/* Logo */}
      <img
        src="/logo.png" alt="" aria-hidden="true"
        className="w-20 h-20 mb-6"
        style={{
          animation: 'logoRock 2s ease-in-out infinite, float 3s ease-in-out infinite',
          filter: 'drop-shadow(0 0 10px #FF3366) drop-shadow(0 0 20px #00CFFF)',
        }}
      />

      {/* Glitch title */}
      <div className="relative mb-4">
        <h1
          className="font-impact text-7xl sm:text-[80px] text-[#FFD700] uppercase relative"
          style={{ animation: 'glitch 4s infinite', textShadow: '4px 0 #FF3366, -4px 0 #00CFFF' }}
        >
          Purridiction
        </h1>
      </div>

      {/* Loading text */}
      <p
        className="text-lg text-purple-200 italic mb-8"
        style={{ fontFamily: "'Comic Sans MS', cursive" }}
      >
        {MESSAGES[msgIndex]}
      </p>

      {/* Progress bar */}
      <div className="w-64 h-4 border-[3px] border-[#FFD700] bg-[#1A1A2E] relative overflow-hidden">
        <div
          className="h-full transition-all duration-100"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #FF3366, #FFD700, #00CFFF)',
            backgroundSize: '200% 100%',
            animation: 'progressShimmer 2s linear infinite',
          }}
        />
      </div>
    </div>
  )
}
