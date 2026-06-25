import { useState, useEffect } from 'react'

const LOADING_MESSAGES = [
  "calibrating chaos sensors...",
  "bribing the cats...",
  "decrypting paw prints...",
  "consulting the oracle...",
]

export default function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#3D3480] flex flex-col items-center justify-center overflow-hidden">
      {/* Logo with bounce */}
      <img
        src="/logo.png"
        alt=""
        className="w-20 h-20 mb-6 animate-bounce"
        aria-hidden="true"
      />

      {/* Glitch headline */}
      <h1
        className="font-impact text-6xl text-[#FFD700] uppercase mb-4"
        style={{ textShadow: '3px 0 #FF3366, -3px 0 #00CFFF' }}
      >
        Purridiction
      </h1>

      {/* Rotating loading text in Comic Sans */}
      <p
        className="text-lg text-purple-200 italic"
        style={{ fontFamily: "'Comic Sans MS', cursive" }}
      >
        {LOADING_MESSAGES[msgIndex]}
      </p>
    </div>
  )
}
