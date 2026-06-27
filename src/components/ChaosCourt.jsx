import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const generateCharges = (predictions) => {
  const genreCounts = predictions.reduce((acc, p) => {
    acc[p.chaos_genre] = (acc[p.chaos_genre] || 0) + 1
    return acc
  }, {})
  return Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre, count]) => `${count} count(s) of ${genre}`)
}

const generateVerdict = (plea, avgChaos, confirmedCrimes, cat) => {
  if (plea === 'guilty') {
    if (avgChaos >= 70) return { result: 'GUILTY', sentence: `${cat.name} is sentenced to 30 days without treats. Additional penalty: mandatory cuddle sessions at 3AM as community service.`, stamp: 'CONVICTED', stampColor: '#FF3366' }
    if (avgChaos >= 40) return { result: 'GUILTY', sentence: `${cat.name} is found guilty but shown mercy. Sentenced to 7 days of supervised napping. The court notes the defendant showed no remorse.`, stamp: 'CONVICTED', stampColor: '#FF6B00' }
    return { result: 'GUILTY WITH LENIENCY', sentence: `${cat.name} pleads guilty to minor chaos infractions. Sentenced to 3 days of wearing a little bow tie. Court adjourned.`, stamp: 'MINOR OFFENSE', stampColor: '#FFD700' }
  }
  if (plea === 'not_guilty') {
    if (confirmedCrimes < 2) return { result: 'NOT GUILTY', sentence: `Insufficient confirmed evidence. ${cat.name} is acquitted on all charges. The court suspects this cat is smarter than the prosecution.`, stamp: 'ACQUITTED', stampColor: '#00C896' }
    if (avgChaos < 40) return { result: 'NOT GUILTY', sentence: `${cat.name} is acquitted. The defense successfully argued that the chaos levels were within acceptable feline parameters. Barely.`, stamp: 'ACQUITTED', stampColor: '#00C896' }
    return { result: 'GUILTY', sentence: `The court rejects the not guilty plea. The evidence is overwhelming. ${cat.name} knew exactly what they were doing. Every. Single. Time.`, stamp: 'CONVICTED', stampColor: '#FF3366' }
  }
  if (plea === 'justified') {
    if (avgChaos >= 70) return { result: 'CHAOS UPHELD', sentence: `The court rules in favor of ${cat.name}. Chaos of this magnitude is recognized as a constitutional feline right. The humans are ordered to provide more snacks immediately.`, stamp: 'CHAOS JUSTIFIED', stampColor: '#3D3480' }
    return { result: 'PARTIALLY UPHELD', sentence: `The court acknowledges ${cat.name}'s right to chaos but finds the execution lacking ambition. Recommended: higher shelves, more fragile objects.`, stamp: 'CHAOS NOTED', stampColor: '#FF6B00' }
  }
  return { result: 'MISTRIAL', sentence: 'Something went wrong.', stamp: 'ERROR', stampColor: '#6B7280' }
}

export default function ChaosCourt({ cat, predictions, onAchievementUnlock }) {
  const [courtState, setCourtState] = useState('idle')
  const [charges, setCharges] = useState([])
  const [visibleCharges, setVisibleCharges] = useState(0)
  const [showPlea, setShowPlea] = useState(false)
  const [verdict, setVerdict] = useState(null)
  const [showVerdict, setShowVerdict] = useState(false)
  const [copied, setCopied] = useState(false)

  const avgChaos = predictions.length > 0 ? Math.round(predictions.reduce((s, p) => s + p.chaos_score, 0) / predictions.length) : 0
  const confirmedCrimes = predictions.filter(p => p.confirmed_accurate === true).length

  useEffect(() => {
    if (courtState === 'charges' && visibleCharges < charges.length) {
      const t = setTimeout(() => setVisibleCharges(v => v + 1), 600)
      return () => clearTimeout(t)
    }
    if (courtState === 'charges' && visibleCharges === charges.length && charges.length > 0) {
      const t = setTimeout(() => { setShowPlea(true); setCourtState('plea') }, 1500)
      return () => clearTimeout(t)
    }
  }, [courtState, visibleCharges, charges.length])

  if (predictions.length < 5) {
    return (
      <div style={{ border: '4px dashed #FFD700', transform: 'rotate(1deg)' }} className="p-6 text-center">
        <p className="font-impact text-lg text-[#FFD700] uppercase">⚖️ Chaos Court Locked</p>
        <p className="font-mono text-[10px] text-[#FFD700]/60 mt-1">Insufficient evidence. Log 5+ predictions to open a case. ({predictions.length}/5)</p>
      </div>
    )
  }

  const handleStartTrial = () => {
    const c = generateCharges(predictions)
    setCharges(c)
    setVisibleCharges(0)
    setShowPlea(false)
    setVerdict(null)
    setShowVerdict(false)
    setCourtState('charges')
  }

  const handlePlea = async (plea) => {
    const v = generateVerdict(plea, avgChaos, confirmedCrimes, cat)
    setVerdict(v)
    setCourtState('verdict')
    setTimeout(() => setShowVerdict(true), 800)

    // Unlock achievement
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const existing = await supabase.from('cat_achievements').select('achievement_id').eq('cat_id', cat.id).eq('achievement_id', 'court_in_session')
        if (!existing.data?.length) {
          await supabase.from('cat_achievements').insert([{ cat_id: cat.id, user_id: session.user.id, achievement_id: 'court_in_session' }])
          onAchievementUnlock({ id: 'court_in_session', title: 'Court Is In Session', emoji: '⚖️', description: 'Took your cat to Chaos Court' })
        }
      }
    } catch { /* silent */ }
  }

  const handleShare = () => {
    const text = `⚖️ CHAOS COURT VERDICT\n\nTHE STATE VS ${cat.name.toUpperCase()}\n\nCharges: ${charges.join(', ')}\nAvg Chaos Level: ${avgChaos}/100\n\nVERDICT: ${verdict.result}\n\n"${verdict.sentence}"\n\n— The Honorable Court of Feline Misconduct\nPurridiction.vercel.app`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const caseNum = cat.id ? cat.id.slice(0, 6).toUpperCase() : '000000'

  return (
    <div className="text-white relative overflow-hidden"
      style={{ background: '#1A1A2E', border: '6px solid #FFD700', boxShadow: '14px 14px 0 #FF3366, 28px 28px 0 rgba(255,51,102,0.1)', transform: 'rotate(-1.5deg)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,215,0,0.03) 10px, rgba(255,215,0,0.03) 20px)' }}>

      {/* Court seal watermark */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] opacity-[0.05] pointer-events-none" style={{ transform: 'translate(-50%,-50%) rotate(10deg)' }}>⚖️</span>

      {/* Header */}
      <div className="bg-[#FFD700] text-[#1A1A2E] p-3 px-5" style={{ borderBottom: '4px solid #1A1A2E', letterSpacing: '4px' }}>
        <p className="font-impact text-xl uppercase">⚖️ Chaos Court</p>
      </div>

      <div className="p-6 relative z-10">
        {/* IDLE */}
        {courtState === 'idle' && (
          <div className="text-center space-y-4">
            <p className="text-[80px]">🔨</p>
            <p style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-[#C4B5FD] text-base">The Honorable Court of Feline Misconduct</p>
            <p className="font-mono text-xs text-[#6B7280]" style={{ letterSpacing: '4px' }}>CASE #{caseNum}</p>
            <button onClick={handleStartTrial}
              className="w-full font-impact text-xl py-4 uppercase"
              style={{ background: '#FF3366', border: '4px solid rgba(255,255,255,0.3)', boxShadow: '8px 8px 0 #FFD700', letterSpacing: '2px' }}>
              ⚖️ Take {cat.name} to Court
            </button>
            <p className="font-mono text-[10px] text-[#6B7280]" style={{ fontFamily: "'Comic Sans MS', cursive" }}>Warning: The defendant will not cooperate.</p>
          </div>
        )}

        {/* CHARGES */}
        {(courtState === 'charges' || courtState === 'plea') && (
          <div className="space-y-4">
            <p className="font-impact text-2xl text-[#FFD700] uppercase" style={{ letterSpacing: '3px' }}>THE STATE VS {cat.name.toUpperCase()}</p>
            <p style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-[#C4B5FD] text-sm">The following charges have been filed:</p>

            <div className="space-y-2">
              {charges.slice(0, visibleCharges).map((charge, i) => (
                <div key={i} className="p-2 font-mono text-sm"
                  style={{ borderLeft: '4px solid #FF3366', paddingLeft: '12px', background: 'rgba(255,51,102,0.1)', animation: 'countUp 0.4s ease-out' }}>
                  COUNT {i + 1}: {charge}
                </div>
              ))}
            </div>

            {visibleCharges === charges.length && (
              <p className="font-mono text-xs text-[#FFD700]">Overall Threat Assessment: {avgChaos}/100</p>
            )}

            {/* PLEA */}
            {courtState === 'plea' && showPlea && (
              <div className="space-y-3 pt-4" style={{ borderTop: '2px dashed #FFD700' }}>
                <p className="font-impact text-lg text-[#FFD700] uppercase text-center">How does the defendant plead?</p>

                <button onClick={() => handlePlea('guilty')} className="w-full py-4 text-white hover:scale-[1.02] hover:brightness-110 transition-all"
                  style={{ fontFamily: "'Comic Sans MS', cursive", fontSize: '18px', fontStyle: 'italic', background: '#FF3366', border: '4px solid rgba(255,255,255,0.3)' }}>
                  GUILTY 😔
                  <span className="block font-mono text-[10px] opacity-70 mt-1 not-italic">"I did it. I regret nothing."</span>
                </button>

                <button onClick={() => handlePlea('not_guilty')} className="w-full py-4 text-white font-impact text-lg uppercase hover:scale-[1.02] hover:brightness-110 transition-all"
                  style={{ background: '#00C896', border: '4px solid rgba(255,255,255,0.3)' }}>
                  NOT GUILTY 😇
                  <span className="block text-[10px] opacity-70 mt-1 normal-case" style={{ fontFamily: "'Comic Sans MS', cursive" }}>"I was asleep the whole time."</span>
                </button>

                <button onClick={() => handlePlea('justified')} className="w-full py-4 text-white font-impact text-lg uppercase hover:scale-[1.02] hover:brightness-110 transition-all"
                  style={{ background: '#3D3480', border: '4px solid rgba(255,255,255,0.3)' }}>
                  CHAOS WAS JUSTIFIED ⚡
                  <span className="block text-[10px] opacity-70 mt-1 normal-case" style={{ fontFamily: "'Comic Sans MS', cursive" }}>"The humans deserved it."</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* VERDICT */}
        {courtState === 'verdict' && (
          <div className="space-y-4 relative">
            {!showVerdict && (
              <div className="text-center py-8">
                <p className="text-[80px]" style={{ animation: 'pulseScale 0.8s ease-in-out' }}>🔨</p>
              </div>
            )}

            {showVerdict && verdict && (
              <>
                {/* Official stamp */}
                <span className="absolute top-[40%] right-[10px] font-impact text-2xl px-4 py-2 pointer-events-none"
                  style={{ transform: 'rotate(-15deg)', border: `5px solid ${verdict.stampColor}`, color: verdict.stampColor, opacity: 0.85, letterSpacing: '3px', animation: 'countUp 0.4s cubic-bezier(0.68,-0.55,0.27,1.55)' }}>
                  {verdict.stamp}
                </span>

                <p className="font-impact text-lg text-[#FFD700] uppercase">The Court Finds...</p>
                <p className="font-impact text-[48px] sm:text-[60px] leading-none"
                  style={{ color: verdict.stampColor, textShadow: '4px 4px 0 rgba(0,0,0,0.4)', animation: 'countUp 0.5s ease-out' }}>
                  {verdict.result}
                </p>

                <div className="font-body text-sm italic leading-relaxed p-4 my-4"
                  style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '4px solid #FFD700' }}>
                  &ldquo;{verdict.sentence}&rdquo;
                </div>

                {/* Court record */}
                <div className="pt-3 mt-4 font-mono text-xs text-[#9CA3AF] space-y-1" style={{ borderTop: '2px dashed #FFD700', letterSpacing: '1px' }}>
                  <p className="font-impact text-sm text-[#FFD700] uppercase mb-2">Official Court Record</p>
                  <p>Case: STATE VS {cat.name.toUpperCase()}</p>
                  <p>Charges: {predictions.length} counts</p>
                  <p>Avg Chaos Level: {avgChaos}/100</p>
                  <p>Verdict: {verdict.result}</p>
                  <p>Date: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Buttons */}
                <div className="space-y-2 mt-6">
                  <button onClick={handleShare}
                    className="w-full font-impact text-lg py-3 uppercase"
                    style={{ background: '#FFD700', color: '#1A1A2E', border: '4px solid #1A1A2E', boxShadow: '6px 6px 0 #1A1A2E', transform: 'rotate(1deg)', letterSpacing: '3px' }}>
                    {copied ? '📋 COPIED!' : '📋 Share Verdict'}
                  </button>
                  <button onClick={() => { setCourtState('idle'); setVerdict(null); setShowVerdict(false) }}
                    className="w-full py-2 text-[#6B7280] text-sm"
                    style={{ fontFamily: "'Comic Sans MS', cursive", border: '2px dashed #6B7280' }}>
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
