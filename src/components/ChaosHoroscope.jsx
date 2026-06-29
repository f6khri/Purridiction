import { useState } from 'react'

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

const LUCKY_ITEMS = ['treat bag', 'cardboard box', 'empty toilet roll', 'sunbeam', 'human ankle', 'forbidden shelf', 'laptop keyboard']
const UNLUCKY_ITEMS = ['vacuum cleaner', 'bath time', 'nail trimmer', 'the vet', 'Monday', 'empty food bowl', 'closed door']

function getMoonPhase() {
  const knownNewMoon = new Date('2024-01-11')
  const daysSince = (new Date() - knownNewMoon) / (1000 * 60 * 60 * 24)
  return (daysSince % 29.5) / 29.5
}

function getMoonLabel(phase) {
  if (phase < 0.25) return '🌑 New Moon — Hidden chaos brewing'
  if (phase < 0.5) return '🌓 Waxing Moon — Chaos ascending'
  if (phase < 0.75) return '🌕 Full Moon — PEAK CHAOS POTENTIAL'
  return '🌗 Waning Moon — Chaos in reflection'
}

function getSign(ageCategory, dominantGenre) {
  const signs = {
    kitten: { 'Midnight Zoomies': 'CHAOTIC ARIES', 'Ankle Assassination': 'FIERCE LEO', default: 'WILD SAGITTARIUS' },
    adult: { 'Midnight Zoomies': 'MYSTERIOUS SCORPIO', 'Knocking Things Off Tables': 'REBELLIOUS AQUARIUS', 'Ankle Assassination': 'CUNNING GEMINI', default: 'CALCULATED VIRGO' },
    senior: { 'Staring At Nothing For 10 Minutes': 'ANCIENT CAPRICORN', 'Screaming Into The Void': 'DRAMATIC PISCES', default: 'WISE TAURUS' },
  }
  return signs[ageCategory]?.[dominantGenre] || signs[ageCategory]?.default || 'COSMIC LIBRA'
}

function getDominantGenre(predictions) {
  if (predictions.length === 0) return ''
  const counts = predictions.reduce((acc, p) => { acc[p.chaos_genre] = (acc[p.chaos_genre] || 0) + 1; return acc }, {})
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

function getAdvice(dominantGenre) {
  if (dominantGenre === 'Ankle Assassination') return 'Advisory: Your human should wear shoes indoors today.'
  if (dominantGenre === 'Midnight Zoomies') return 'Advisory: 3AM is not too late. Or too early.'
  if (dominantGenre === 'Knocking Things Off Tables') return 'Advisory: The cup on the desk is not safe.'
  return 'Advisory: Trust the chaos. The chaos knows.'
}

export default function ChaosHoroscope({ predictions, cat }) {
  const [copied, setCopied] = useState(false)

  const dayOfWeek = new Date().getDay()
  const dayName = DAY_NAMES[dayOfWeek]
  const currentHour = new Date().getHours()
  const phase = getMoonPhase()
  const moonLabel = getMoonLabel(phase)
  const dominantGenre = predictions.length > 0 ? getDominantGenre(predictions) : ''
  const sign = getSign(cat.age_category, dominantGenre)

  // Historical average for today's day of week
  const sameDayPreds = predictions.filter(p => new Date(p.created_at).getDay() === dayOfWeek)
  const avgChaosThisDay = sameDayPreds.length > 0 ? Math.round(sameDayPreds.reduce((s, p) => s + p.chaos_score, 0) / sameDayPreds.length) : 50

  const moonModifier = phase >= 0.5 && phase <= 0.75 ? 15 : 0
  const todayForecast = Math.min(100, avgChaosThisDay + moonModifier)

  const lastWeather = predictions[0]?.input_data?.weather || 'unknown'
  const luckyItem = LUCKY_ITEMS[dayOfWeek]
  const unluckyItem = UNLUCKY_ITEMS[dayOfWeek]
  const advice = getAdvice(dominantGenre)

  const hoursUntilMidnight = 24 - currentHour

  // Generate reading
  let horoscopeText
  if (todayForecast >= 70 && phase >= 0.5 && phase <= 0.75) {
    horoscopeText = `The full moon amplifies your natural destructive tendencies. Historical data confirms ${dayName}s are your most volatile days. Today's chaos probability: ${todayForecast}%. The cosmos recommend your human pre-emptively move all fragile objects to a higher shelf. There is no higher shelf high enough.`
  } else if (todayForecast >= 70) {
    horoscopeText = `The stars have aligned in your favor, which is bad news for your human. Your ${dayName} chaos index runs ${todayForecast}% above baseline. ${dominantGenre} is written in your destiny today. Proceed with confidence.`
  } else if (todayForecast >= 40) {
    horoscopeText = `A day of calculated mischief awaits. The universe supports your ${dominantGenre} ambitions but advises moderation. Chaos score forecast: ${todayForecast}/100. The ${lastWeather} weather may affect your performance. Sharpen your claws accordingly.`
  } else {
    horoscopeText = `Even the most dedicated chaos agent requires rest. Today favors strategic napping and the silent judgmental stare. Conserve energy. Tomorrow, the ankle assassination continues. Chaos score forecast: ${todayForecast}/100.`
  }

  const shareText = `✨ ${cat.name}'s CHAOS HOROSCOPE ✨\n\nSign: ${sign}\n${moonLabel}\n\nToday's Chaos Forecast: ${todayForecast}/100\n\n${horoscopeText}\n\n🍀 Lucky: ${luckyItem}\n☠️ Avoid: ${unluckyItem}\n\n— Purridiction Cosmic Division\npurridiction.vercel.app`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const signColor = todayForecast >= 70 ? '#FF3366' : todayForecast >= 40 ? '#FFD700' : '#00CFFF'

  return (
    <div className="text-white relative overflow-hidden"
      style={{ background: '#1A0A2E', border: '6px solid #FFD700', boxShadow: '14px 14px 0 #3D3480, 28px 28px 0 rgba(61,52,128,0.2)', transform: 'rotate(-1.5deg)' }}>

      {/* Starfield */}
      <div className="absolute inset-0 opacity-20 pointer-events-none select-none text-[10px] leading-[14px] overflow-hidden text-white/30"
        style={{ wordBreak: 'break-all' }}>
        {'✦ · ✧ . ★ · ✦ . ✧ ★ · '.repeat(80)}
      </div>

      {/* Header */}
      <div className="relative z-10 p-4" style={{ background: 'linear-gradient(180deg, #3D3480, #1A0A2E)', borderBottom: '4px solid #FFD700' }}>
        <p className="font-impact text-2xl uppercase" style={{ letterSpacing: '4px' }}>✨ Daily Chaos Horoscope</p>
        <p className="font-mono text-[10px] text-[#C4B5FD] mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <p className="font-mono text-[9px] text-[#6B7280]">Generated at {currentHour}:00</p>
      </div>

      <div className="relative z-10 p-6 space-y-5">
        {/* Sign */}
        <div className="text-center">
          <p className="font-impact text-4xl inline-block" style={{ color: signColor, textShadow: '4px 4px 0 rgba(0,0,0,0.5)', transform: 'rotate(1deg)' }}>
            ✨ {sign} ✨
          </p>
          <p className="text-base mt-2 inline-block" style={{ fontFamily: "'Comic Sans MS', cursive", color: '#C4B5FD', transform: 'rotate(-1deg)' }}>
            {moonLabel}
          </p>
        </div>

        {/* Chaos Meter */}
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#FFD700] mb-1">Today&apos;s Chaos Forecast</p>
          <p className="font-impact text-[80px] text-[#FFD700] leading-none" style={{ textShadow: '4px 4px 0 #FF3366' }}>
            {todayForecast}<span className="text-3xl opacity-60">/100</span>
          </p>
          <div className="w-full h-4 mt-2" style={{ border: '2px solid #FFD700', background: 'rgba(255,255,255,0.05)' }}>
            <div className="h-full transition-all" style={{ width: `${todayForecast}%`, background: todayForecast >= 70 ? '#FF3366' : todayForecast >= 40 ? '#FFD700' : '#00CFFF' }} />
          </div>
        </div>

        {/* Horoscope Text */}
        <div className="p-4" style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '6px solid #FFD700', transform: 'rotate(0.5deg)' }}>
          <p className="text-[15px] italic leading-relaxed" style={{ fontFamily: "'Comic Sans MS', cursive" }}>
            {horoscopeText}
          </p>
        </div>

        {/* Lucky / Unlucky */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3" style={{ background: 'rgba(0,200,150,0.15)', borderLeft: '4px solid #00C896' }}>
            <p className="font-mono text-sm text-[#00C896]">🍀 Lucky</p>
            <p className="font-mono text-xs text-white mt-1">{luckyItem}</p>
          </div>
          <div className="p-3" style={{ background: 'rgba(255,51,102,0.15)', borderLeft: '4px solid #FF3366' }}>
            <p className="font-mono text-sm text-[#FF3366]">☠️ Avoid</p>
            <p className="font-mono text-xs text-white mt-1">{unluckyItem}</p>
          </div>
        </div>

        {/* Daily Advice */}
        <div className="p-3" style={{ background: 'rgba(255,215,0,0.1)', border: '2px dashed #FFD700', transform: 'rotate(-0.5deg)' }}>
          <p className="font-impact text-sm text-[#FFD700]">{advice}</p>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button onClick={handleCopy}
            className="w-full font-impact text-lg py-3 uppercase"
            style={{ background: '#FFD700', color: '#1A1A2E', border: '4px solid #FFD700', boxShadow: '6px 6px 0 #3D3480', transform: 'rotate(1deg)', letterSpacing: '3px' }}>
            {copied ? '📋 COPIED!' : '📋 Share Horoscope'}
          </button>
          <button disabled className="w-full py-2 font-mono text-xs text-[#6B7280]" style={{ border: '2px dashed #6B7280' }}>
            🔮 Next reading in {hoursUntilMidnight}h
          </button>
        </div>
      </div>
    </div>
  )
}
