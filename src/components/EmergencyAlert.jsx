import { useState, useEffect } from 'react'

const calculateThreatLevel = (predictions) => {
  let threatScore = 0
  const now = new Date()
  const currentHour = now.getHours()

  // Factor 1: Time of day vs historical peak chaos hours
  const hourCounts = predictions.reduce((acc, p) => {
    const hour = new Date(p.created_at).getHours()
    const score = p.chaos_score
    acc[hour] = acc[hour] ? (acc[hour] + score) / 2 : score
    return acc
  }, {})
  const currentHourAvg = hourCounts[currentHour] || 0
  const factor1 = Math.round((currentHourAvg / 100) * 30)
  threatScore += factor1

  // Factor 2: Hours since last meal
  const lastPrediction = predictions[0]
  let factor2 = 0
  if (lastPrediction?.input_data?.lastMealHour !== undefined) {
    const hoursSinceMeal = (currentHour - lastPrediction.input_data.lastMealHour + 24) % 24
    if (hoursSinceMeal >= 8) factor2 = 30
    else if (hoursSinceMeal >= 6) factor2 = 20
    else if (hoursSinceMeal >= 4) factor2 = 10
  }
  threatScore += factor2

  // Factor 3: Recent chaos trend (last 3 predictions)
  const recent = predictions.slice(0, 3)
  let factor3 = 0
  if (recent.length > 0) {
    const recentAvg = recent.reduce((s, p) => s + p.chaos_score, 0) / recent.length
    factor3 = Math.round((recentAvg / 100) * 25)
  }
  threatScore += factor3

  // Factor 4: Last weather input
  const lastWeather = lastPrediction?.input_data?.weather
  let factor4 = 0
  if (lastWeather === 'rainy') factor4 = 15
  else if (lastWeather === 'cloudy') factor4 = 8
  threatScore += factor4

  return { score: Math.min(Math.round(threatScore), 100), factors: [factor1, factor2, factor3, factor4] }
}

const getThreatTier = (score) => {
  if (score >= 80) return { level: 'BLACK', label: 'CATASTROPHIC', color: '#1A1A1A', textColor: '#FF3366', borderColor: '#FF3366', emoji: '☠️', recommendation: 'EVACUATE ALL ANKLES. Secure fragile objects. Do not make eye contact. Offer treats immediately.', siren: true }
  if (score >= 60) return { level: 'RED', label: 'CRITICAL', color: '#FF3366', textColor: 'white', borderColor: '#FFD700', emoji: '🚨', recommendation: 'High probability of unprovoked chaos within 2 hours. Wear shoes. Hide the good stuff.', siren: true }
  if (score >= 40) return { level: 'ORANGE', label: 'ELEVATED', color: '#FF6B00', textColor: 'white', borderColor: '#1A1A2E', emoji: '⚠️', recommendation: 'Moderate chaos risk detected. Monitor subject closely. Avoid sudden movements.', siren: false }
  if (score >= 20) return { level: 'YELLOW', label: 'GUARDED', color: '#FFD700', textColor: '#1A1A2E', borderColor: '#1A1A2E', emoji: '👀', recommendation: 'Low-level chaos activity possible. Subject may be plotting. Proceed with mild caution.', siren: false }
  return { level: 'GREEN', label: 'ALL CLEAR', color: '#00C896', textColor: 'white', borderColor: '#1A1A2E', emoji: '✅', recommendation: 'Subject appears calm. This is suspicious. Do not let your guard down.', siren: false }
}

const FACTOR_LABELS = [
  { emoji: '🕐', label: 'Time Pattern Risk', max: 30 },
  { emoji: '🍽️', label: 'Hunger Index', max: 30 },
  { emoji: '📈', label: 'Recent Activity Trend', max: 25 },
  { emoji: '🌧️', label: 'Environmental Modifier', max: 15 },
]

export default function EmergencyAlert({ predictions }) {
  const [threat, setThreat] = useState({ score: 0, factors: [0, 0, 0, 0] })
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    const calc = () => {
      const result = calculateThreatLevel(predictions)
      setThreat(result)
      setLastUpdated(new Date())
      setCountdown(60)
    }
    calc()
    const interval = setInterval(calc, 60000)
    return () => clearInterval(interval)
  }, [predictions])

  useEffect(() => {
    const tick = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 60), 1000)
    return () => clearInterval(tick)
  }, [])

  if (predictions.length === 0) {
    return (
      <div style={{ border: '4px dashed #6B7280', transform: 'rotate(-1deg)' }} className="p-6 text-center">
        <p className="font-impact text-lg text-[#6B7280] uppercase">⚠️ Threat System Offline</p>
        <p className="font-mono text-[10px] text-[#6B7280]/60 mt-1">No data. Make a prediction to activate.</p>
      </div>
    )
  }

  const tier = getThreatTier(threat.score)

  return (
    <div className="relative overflow-hidden transition-all duration-500"
      style={{
        border: `6px solid ${tier.borderColor}`,
        boxShadow: `14px 14px 0 ${tier.color}, 28px 28px 0 ${tier.color}33`,
        transform: 'rotate(-1deg)',
        ...(tier.siren ? { animation: 'sirenBorder 1s infinite' } : {}),
      }}>

      <style>{`
        @keyframes sirenBorder {
          0%, 100% { border-color: #FF3366; box-shadow: 14px 14px 0 #FF3366, 28px 28px 0 rgba(255,51,102,0.2); }
          50% { border-color: #FFD700; box-shadow: 14px 14px 0 #FFD700, 28px 28px 0 rgba(255,215,0,0.2); }
        }
      `}</style>

      {/* Header */}
      <div className="bg-[#1A1A2E] px-4 py-2 flex items-center justify-between" style={{ borderBottom: `3px solid ${tier.color}` }}>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-white">Purridiction Emergency Alert System</p>
          <p className="text-[8px] text-[#6B7280] italic" style={{ fontFamily: "'Comic Sans MS', cursive" }}>PEAS — Feline Threat Division</p>
        </div>
        {tier.siren && (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3366] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF3366]"></span>
          </span>
        )}
      </div>

      {/* Main threat display */}
      <div className="text-center py-6 px-4" style={{ backgroundColor: tier.color, color: tier.textColor, borderBottom: '4px solid #1A1A2E' }}>
        <p className="text-8xl mb-2">{tier.emoji}</p>
        <p className="font-impact text-4xl uppercase" style={{ letterSpacing: '4px' }}>THREAT LEVEL: {tier.level}</p>
        <p className="font-mono text-sm tracking-widest opacity-80 mt-1">{tier.label}</p>
      </div>

      {/* Threat score */}
      <div className="bg-[#FFFBF0] p-4" style={{ borderBottom: '3px solid #1A1A2E' }}>
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#6B7280] mb-1">Composite Threat Index</p>
        <p className="font-impact text-[56px] leading-none" style={{ color: tier.color, textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>
          {threat.score}<span className="text-2xl opacity-50">/100</span>
        </p>
        <div className="w-full h-4 mt-2" style={{ border: '2px solid #1A1A2E' }}>
          <div className="h-full transition-all duration-500" style={{ width: `${threat.score}%`, backgroundColor: tier.color }} />
        </div>
      </div>

      {/* Factor breakdown */}
      <div className="bg-white p-4" style={{ borderBottom: '3px solid #1A1A2E' }}>
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#6B7280] mb-3">Threat Factors</p>
        <div className="space-y-2">
          {FACTOR_LABELS.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm w-5">{f.emoji}</span>
              <span className="font-mono text-[10px] text-[#1A1A2E] flex-1">{f.label}</span>
              <div className="w-20 h-2" style={{ border: '1px solid #1A1A2E' }}>
                <div className="h-full" style={{ width: `${(threat.factors[i] / f.max) * 100}%`, backgroundColor: threat.factors[i] >= f.max * 0.7 ? '#FF3366' : threat.factors[i] >= f.max * 0.4 ? '#FF6B00' : '#00C896' }} />
              </div>
              <span className="font-mono text-[10px] text-[#1A1A2E] w-8 text-right">+{threat.factors[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="p-4" style={{ backgroundColor: `${tier.color}1A`, borderLeft: `6px solid ${tier.color}` }}>
        <p className="font-impact text-sm text-[#FF3366] mb-1">FIELD ADVISORY:</p>
        <p className="font-body text-sm text-[#1A1A2E] leading-relaxed">{tier.recommendation}</p>
      </div>

      {/* Footer */}
      <div className="bg-[#1A1A2E] px-4 py-2 flex items-center justify-between" style={{ borderTop: '2px solid #374151' }}>
        <span className="font-mono text-[9px] text-[#6B7280]">Next assessment: {countdown}s</span>
        <span className="font-mono text-[9px] text-[#6B7280]">Updated: {lastUpdated.toLocaleTimeString()}</span>
      </div>
    </div>
  )
}
