import { useState } from 'react'
import { getCatRank } from '../lib/catRanks'

const ARCHETYPES = [
  { min: 0, max: 19, title: "The Sleepy Philosopher" },
  { min: 20, max: 39, title: "The Reluctant Mischief Maker" },
  { min: 40, max: 59, title: "The Calculated Disruptor" },
  { min: 60, max: 79, title: "The Midnight Assassin" },
  { min: 80, max: 100, title: "The Supreme Chaos Lord" },
]

const SUPERPOWERS = {
  "Midnight Zoomies": "Supersonic Sprint Burst",
  "Ankle Assassination": "Stealth Strike Protocol",
  "Knocking Things Off Tables": "Gravity Manipulation",
  "Screaming Into The Void": "Sonic Disruption Wave",
  "Aggressive Biscuit Making": "Hypnotic Kneading",
  "Unprovoked Sprinting": "Random Teleportation",
  "Staring At Nothing For 10 Minutes": "Dimensional Vision",
  "Biting Hand That Feeds": "Betrayal Mastery",
}

const WEAKNESSES = {
  kitten: "Shiny objects and sudden naps",
  adult: "Treat bag rustling within 50m radius",
  senior: "Warm sunspot relocation",
}

const AGE_EMOJIS = { kitten: '🐱', adult: '😼', senior: '😾' }

function getCatchphrase(score) {
  if (score >= 80) return "Your furniture is merely borrowed."
  if (score >= 60) return "I do not create chaos. I am chaos."
  if (score >= 40) return "Every knocked item was a choice."
  if (score >= 20) return "I could behave. I simply choose not to."
  return "Chaos is beneath me. Today."
}

function getArchetype(score) {
  return (ARCHETYPES.find(a => score >= a.min && score <= a.max) || ARCHETYPES[0]).title
}

function getDominantGenre(predictions) {
  const counts = predictions.reduce((acc, p) => { acc[p.chaos_genre] = (acc[p.chaos_genre] || 0) + 1; return acc }, {})
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || ""
}

export default function CatPersona({ predictions, cat }) {
  const [copied, setCopied] = useState(false)

  if (predictions.length < 5) {
    return (
      <div className="border-4 border-dashed border-[#FFD700] p-4 text-center rotate-[-1deg]">
        <p className="font-impact text-lg text-[#3D3480] uppercase">Cat Persona Locked 😼</p>
        <p className="font-mono text-[10px] text-[#3D3480]/60 mt-1">
          Unlock after 5 predictions. Currently: {predictions.length}/5
        </p>
      </div>
    )
  }

  const avgChaosScore = Math.round(predictions.reduce((s, p) => s + p.chaos_score, 0) / predictions.length)
  const dominantGenre = getDominantGenre(predictions)
  const archetype = getArchetype(avgChaosScore)
  const superpower = SUPERPOWERS[dominantGenre] || "Unknown Power"
  const weakness = WEAKNESSES[cat.age_category] || "Unknown"
  const catchphrase = getCatchphrase(avgChaosScore)
  const rank = getCatRank(avgChaosScore)
  const catEmoji = AGE_EMOJIS[cat.age_category] || '😼'

  const shareText = `😼 ${cat.name} — ${archetype}\n⚡ Superpower: ${superpower}\n😰 Weakness: ${weakness}\n💬 Catchphrase: '${catchphrase}'\n☠️ Threat Class: ${rank.title}\n\nProfiled by Purridiction.`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#1A1A2E] border-[5px] border-[#FFD700] rotate-[1.5deg] text-white relative overflow-hidden"
      style={{ boxShadow: '12px 12px 0 #FF3366' }}>

      {/* CLASSIFIED stamp */}
      <span className="absolute top-6 right-6 bg-[#FF3366] text-white font-impact text-xl px-4 py-2 rotate-[-5deg] inline-block border-[3px] border-white uppercase z-10">
        Classified
      </span>

      {/* Header */}
      <div className="p-6 pb-2">
        <p className="font-mono text-[10px] text-[#00CFFF] uppercase tracking-widest mb-4">
          // classified personnel file //
        </p>

        {/* Cat emoji */}
        <p className="text-8xl mb-3" style={{ animation: 'float 3s ease-in-out infinite' }}>{catEmoji}</p>

        {/* Name */}
        <h3 className="font-impact text-5xl sm:text-6xl text-[#FFD700] leading-none mb-2"
          style={{ textShadow: '4px 4px 0 #FF3366' }}>
          {cat.name}
        </h3>

        {/* Archetype */}
        <p className="text-xl text-[#C4B5FD] italic"
          style={{ fontFamily: "'Comic Sans MS', cursive" }}>
          {archetype}
        </p>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 p-6 pt-4">
        <div className="bg-[#FFFBF0] text-[#1A1A2E] border-[3px] border-[#FFD700] p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#3D3480] mb-1">Superpower</p>
          <p className="font-impact text-lg leading-tight">{superpower}</p>
        </div>

        <div className="bg-[#FFFBF0] text-[#1A1A2E] border-[3px] border-[#FFD700] p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#3D3480] mb-1">Weakness</p>
          <p className="font-impact text-lg leading-tight">{weakness}</p>
        </div>

        <div className="bg-[#FFFBF0] text-[#1A1A2E] border-[3px] border-[#FFD700] p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#3D3480] mb-1">Catchphrase</p>
          <p className="font-impact text-base leading-tight italic">&ldquo;{catchphrase}&rdquo;</p>
        </div>

        <div className="bg-[#FFFBF0] text-[#1A1A2E] border-[3px] border-[#FFD700] p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#3D3480] mb-1">Threat Class</p>
          <p className="font-impact text-lg leading-tight">{rank.emoji} {rank.title}</p>
        </div>
      </div>

      {/* Redacted Gemini placeholder */}
      <div className="px-6 pb-4">
        <p className="font-mono text-xs text-[#FFD700]/60">
          GEMINI PERSONALITY ANALYSIS: <span className="bg-[#FF3366] text-[#FF3366] select-none px-16">[REDACTED]</span>
        </p>
      </div>

      {/* Share button */}
      <div className="px-6 pb-6">
        <button onClick={handleCopy}
          className="w-full bg-[#FFD700] text-[#1A1A2E] font-impact text-lg py-3 border-[3px] border-[#1A1A2E] uppercase hover:scale-[1.02] transition-transform"
          style={{ boxShadow: '4px 4px 0 #1A1A2E' }}>
          {copied ? 'COPIED! 😼' : 'Share Persona'}
        </button>
      </div>
    </div>
  )
}
