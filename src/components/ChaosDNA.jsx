import { useState } from 'react'

const STRAND_COLORS = ['#FF3366', '#FFD700', '#00CFFF', '#FF4500', '#00FF88']

function calcStandardDeviation(values) {
  if (values.length < 2) return 0
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length
  return Math.sqrt(variance)
}

export default function ChaosDNA({ predictions, cat }) {
  const [copied, setCopied] = useState(false)

  if (predictions.length < 10) {
    return (
      <div className="border-4 border-dashed border-[#3D3480] p-4 text-center rotate-[1deg]">
        <p className="font-impact text-lg text-[#3D3480] uppercase">Chaos DNA Locked 🧬</p>
        <p className="font-mono text-[10px] text-[#3D3480]/60 mt-1">
          Unlock after 10 predictions. Currently: {predictions.length}/10
        </p>
      </div>
    )
  }

  // Strand calculations
  const avgScore = predictions.reduce((s, p) => s + p.chaos_score, 0) / predictions.length
  const strandA = Math.round((avgScore / 100) * 100)

  const confirmedCount = predictions.filter(p => p.confirmed_accurate === true).length
  const strandB = Math.round((confirmedCount / predictions.length) * 100)

  const peakHours = predictions.map(p => ((p.input_data?.lastMealHour || 0) + 5) % 24)
  const hourCounts = peakHours.reduce((acc, h) => { acc[h] = (acc[h] || 0) + 1; return acc }, {})
  const mostCommonHour = parseInt(Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0])
  const strandC = Math.round((mostCommonHour / 23) * 100)

  const ankleCount = predictions.filter(p => p.chaos_genre === "Ankle Assassination").length
  const strandD = Math.round(Math.min((ankleCount / predictions.length) * 3, 1) * 100)

  const scores = predictions.map(p => p.chaos_score)
  const stdDev = calcStandardDeviation(scores)
  const strandE = Math.round(Math.min(stdDev / 50, 1) * 100)

  const strands = [
    { label: 'Chaos Intensity', value: strandA, emoji: '⚡' },
    { label: 'Stealth Index', value: strandB, emoji: '🥷' },
    { label: 'Peak Timing', value: strandC, emoji: '🌙' },
    { label: 'Ankle Threat Level', value: strandD, emoji: '🦶' },
    { label: 'Chaos Variance', value: strandE, emoji: '📊' },
  ]

  const shareText = `🧬 ${cat.name}'s Chaos DNA Profile\n⚡ Chaos Intensity: ${strandA}%\n🥷 Stealth Index: ${strandB}%\n🌙 Peak Timing: ${strandC}%\n🦶 Ankle Threat: ${strandD}%\n📊 Chaos Variance: ${strandE}%\n\nAnalyzed by Purridiction.`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#FFFBF0] border-[5px] border-[#1A1A2E] rotate-[-1deg] relative overflow-hidden"
      style={{ boxShadow: '12px 12px 0 #3D3480' }}>

      {/* Header */}
      <div className="bg-[#1A1A2E] text-white p-4 relative">
        <p className="font-impact text-2xl uppercase" style={{ letterSpacing: '4px' }}>
          Chaos DNA Analysis
        </p>
        <p className="font-mono text-[10px] text-[#00CFFF] mt-1 uppercase tracking-widest">
          Subject: {cat.name} // {cat.age_category}
        </p>

        {/* Classification stamp */}
        <span className="absolute top-4 right-4 bg-[#FF3366] text-white font-impact text-xs px-3 py-1 rotate-[3deg] inline-block uppercase">
          Classified
        </span>
      </div>

      {/* Strand bars */}
      <div className="p-6 space-y-4">
        {strands.map((strand, i) => (
          <div key={strand.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-[#1A1A2E] uppercase tracking-wide">
                {strand.emoji} {strand.label}
              </span>
              <span className="font-impact text-sm text-[#1A1A2E]">{strand.value}%</span>
            </div>
            <div className="w-full h-7 border-2 border-[#1A1A2E] bg-white">
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${strand.value}%`, backgroundColor: STRAND_COLORS[i] }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Genetic Verdict */}
      <div className="mx-6 mb-6 bg-[#FFD700] border-2 border-[#1A1A2E] p-4 rotate-[0.5deg]">
        <p className="font-mono text-sm text-[#1A1A2E]">
          GENETIC ANALYSIS PENDING... <span className="bg-[#1A1A2E] text-[#1A1A2E] px-8">[REDACTED]</span> [GEMINI INTEGRATION REQUIRED]
        </p>
      </div>

      {/* Share button */}
      <div className="px-6 pb-6">
        <button onClick={handleCopy}
          className="w-full bg-[#3D3480] text-white font-impact text-lg py-3 border-[3px] border-[#1A1A2E] uppercase hover:scale-[1.02] transition-transform"
          style={{ boxShadow: '4px 4px 0 #FFD700' }}>
          {copied ? 'COPIED! 🧬' : 'Share DNA Profile'}
        </button>
      </div>
    </div>
  )
}
