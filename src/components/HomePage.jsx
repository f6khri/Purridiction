export default function HomePage({ onGetStarted, onLogin }) {
  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="min-h-screen bg-[#3D3480] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(255,51,102,0.3), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,207,255,0.2), transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.15), transparent 40%), #3D3480' }}>

        {['🐱','👑','⚡','🔮','😈','⚔️'].map((e, i) => (
          <span key={i} className="absolute pointer-events-none" style={{ top: `${15 + i * 13}%`, left: `${5 + i * 16}%`, fontSize: `${50 + i * 10}px`, opacity: 0.1, animation: `float ${5 + i}s ease-in-out infinite ${i * 0.5}s` }}>{e}</span>
        ))}

        <p className="font-mono text-[#00FF88] text-xs mb-4 block" style={{ letterSpacing: '6px', transform: 'rotate(-1deg)' }}>
          // WORLD CAT DOMINATION DAY 2026 //<span style={{ animation: 'blink 1s infinite' }}>_</span>
        </p>

        <div className="mb-4" style={{ animation: 'logoChill 4s ease-in-out infinite', filter: 'drop-shadow(8px 8px 0 #FF3366) drop-shadow(-4px -4px 0 #00CFFF)' }}>
          <img src="/logo.png" alt="" className="w-[130px] h-[130px]" aria-hidden="true" />
        </div>

        <div className="mb-2">
          <span className="font-impact text-[80px] sm:text-[108px] text-[#FFD700] inline-block" style={{ textShadow: '8px 8px 0 #FF3366', transform: 'rotate(3deg)' }}>PURRI</span>
          <span className="font-impact text-[80px] sm:text-[108px] text-[#FF3366] inline-block" style={{ textShadow: '8px 8px 0 #FFD700', transform: 'rotate(-2deg)' }}>DICTION</span>
        </div>
        <p className="text-white text-[22px] block" style={{ fontFamily: "'Comic Sans MS', cursive", transform: 'rotate(1deg)', marginTop: '-8px' }}>( a cat chaos predictor )</p>
        <p className="font-mono text-[#00CFFF] text-xs tracking-widest mb-8">// we just tell you when //</p>

        <div className="flex flex-col items-center gap-3 mb-6">
          <button onClick={onGetStarted}
            className="font-impact text-[28px] bg-[#FF3366] text-white border-4 border-white px-10 py-4 uppercase hover:scale-110 transition-transform"
            style={{ transform: 'rotate(-4deg)', boxShadow: '10px 10px 0 #FFD700, 20px 20px 0 rgba(255,215,0,0.25)', animation: 'pulseScale 2s ease-in-out infinite', marginRight: '-20px' }}>
            Get Started
          </button>
          <button onClick={onLogin}
            className="font-heading font-[800] text-xl text-[#FFD700] border-4 border-[#FFD700] bg-transparent px-10 py-4 uppercase hover:scale-110 transition-transform"
            style={{ transform: 'rotate(3deg)', boxShadow: '10px 10px 0 #00CFFF', marginTop: '12px' }}>
            Login
          </button>
        </div>

        <p className="text-white/40" style={{ fontFamily: "'Comic Sans MS', cursive", transform: 'rotate(2deg)' }}>Built for #HackTheKitty 2026 🐱</p>
      </section>

      {/* FEATURES */}
      <section className="bg-[#FFFBF0] px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] text-7xl pointer-events-none select-none overflow-hidden leading-tight">{'🐱 '.repeat(300)}</div>
        <div className="relative z-10">
          <div className="text-center mb-14" style={{ transform: 'rotate(-2deg)' }}>
            <span className="font-impact text-[60px] sm:text-[80px] text-[#FF3366]" style={{ textShadow: '5px 5px 0 #1A1A2E' }}>WHAT IS</span>
            <span className="text-[28px] text-[#3D3480] inline-block ml-3" style={{ fontFamily: "'Comic Sans MS', cursive", transform: 'rotate(2deg)' }}>even this</span>
          </div>

          <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="p-6 relative" style={{ backgroundColor: '#FFD700', transform: 'rotate(-4deg)', border: '6px solid #1A1A2E', boxShadow: '14px 14px 0 #FF3366, 28px 28px 0 rgba(255,51,102,0.15)' }}>
              <span className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#FF3366] opacity-40" style={{ transform: 'rotate(-90deg)', transformOrigin: 'left center', whiteSpace: 'nowrap' }}>CLASSIFIED</span>
              <p className="text-[64px] mb-2" style={{ transform: 'rotate(-10deg)', animation: 'wiggle 2s ease-in-out infinite' }}>🔮</p>
              <h3 className="font-impact text-[22px] text-[#1A1A2E] uppercase">Chaos Prediction</h3>
              <p style={{ fontFamily: "'Comic Sans MS', cursive", fontSize: '13px' }} className="text-[#1A1A2E]">Predict when your cat will lose their mind today</p>
            </div>

            <div className="p-6 relative" style={{ backgroundColor: '#00CFFF', transform: 'rotate(3deg)', border: '6px dashed #1A1A2E', boxShadow: '14px 14px 0 #3D3480' }}>
              <span className="absolute -top-3 -right-3 bg-[#FF3366] text-white font-impact text-xs px-2 py-1" style={{ transform: 'rotate(15deg)' }}>NEW</span>
              <p className="text-[64px] mb-2" style={{ transform: 'rotate(15deg)' }}>🏆</p>
              <h3 className="font-impact text-[22px] text-[#1A1A2E] uppercase">Rank Your Cat</h3>
              <p style={{ fontFamily: "'Comic Sans MS', cursive", fontSize: '13px' }} className="text-[#1A1A2E]">From Sleepy Diplomat to Supreme Overlord</p>
            </div>

            <div className="p-6 relative" style={{ backgroundColor: '#FF3366', color: 'white', transform: 'rotate(-2deg)', border: '8px solid #1A1A2E', boxShadow: '14px 14px 0 #FFD700' }}>
              <p className="text-[64px] mb-2">🏥</p>
              <h3 className="font-impact text-[22px] uppercase">Health Tracking</h3>
              <p style={{ fontFamily: "'Comic Sans MS', cursive", fontSize: '13px' }}>Daily logs with AI-powered health insights</p>
              <div className="bg-[#1A1A2E] text-white mt-3 px-3 py-1 -mx-6 -mb-6" style={{ fontFamily: "'Comic Sans MS', cursive", fontSize: '11px' }}>purr... i mean, for science</div>
            </div>

            <div className="p-6 relative" style={{ backgroundColor: '#1A1A2E', color: 'white', transform: 'rotate(4deg)', border: '6px dotted #FFD700', boxShadow: '14px 14px 0 #FF6B00' }}>
              <span className="absolute top-3 right-3 bg-[#FF3366] text-white font-impact text-xs px-3 py-1 border-2 border-white" style={{ transform: 'rotate(-12deg)' }}>CLASSIFIED</span>
              <p className="text-[64px] mb-2" style={{ filter: 'grayscale(50%)' }}>🕵️</p>
              <h3 className="font-impact text-[22px] uppercase">Conspiracy Report</h3>
              <p style={{ fontFamily: "'Comic Sans MS', cursive", fontSize: '13px' }}>Classified intel on your cat&#39;s world domination plan</p>
            </div>
          </div>
        </div>
      </section>

      {/* RANKS */}
      <section className="bg-[#1A1A2E] px-4 py-16" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,215,0,0.03) 10px, rgba(255,215,0,0.03) 20px)' }}>
        <div className="text-center mb-10">
          <span style={{ fontFamily: "'Comic Sans MS', cursive", transform: 'rotate(2deg)', display: 'inline-block' }} className="text-[#C4B5FD] text-[22px]">the</span>
          <span className="font-impact text-[70px] sm:text-[96px] text-[#FFD700] block" style={{ textShadow: '6px 6px 0 #FF3366', transform: 'rotate(-3deg)', letterSpacing: '6px' }}>RANKS</span>
          <span className="font-mono text-[#00FF88] text-[10px] block" style={{ letterSpacing: '10px', transform: 'rotate(1deg)' }}>of world domination</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 justify-start sm:justify-center px-2">
          <div className="flex-shrink-0 bg-[#3D3480] text-white font-impact text-sm px-4 py-2 rounded-full" style={{ border: '3px solid white', transform: 'rotate(-4deg)' }}>😴 Sleepy Diplomat</div>
          <div className="flex-shrink-0 bg-[#FF6B00] text-white font-impact text-sm px-4 py-2" style={{ border: '3px dashed white', transform: 'rotate(3deg)' }}>😼 Mild Troublemaker</div>
          <div className="flex-shrink-0 bg-[#FF3366] text-white font-impact text-sm px-4 py-2 rounded-lg" style={{ border: '3px solid white', transform: 'rotate(-2deg)' }}>😈 Chaos Apprentice</div>
          <div className="flex-shrink-0 bg-[#8B0000] text-white font-impact text-sm px-4 py-2 rounded-full" style={{ border: '3px dotted white', transform: 'rotate(4deg)' }}>👹 Domestic Menace</div>
          <div className="flex-shrink-0 bg-[#FFD700] text-[#1A1A2E] font-impact text-sm px-4 py-2 rounded-full" style={{ border: '3px solid #1A1A2E', transform: 'rotate(-2deg)', animation: 'pulseGlow 2s infinite' }}>👑 Supreme Overlord</div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#FF3366] px-4 py-20 text-center relative overflow-hidden">
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] opacity-[0.05] pointer-events-none" style={{ animation: 'spinSlow 30s linear infinite' }}>👑</span>
        <div className="relative z-10">
          <h2 className="font-impact text-[60px] sm:text-[80px] text-white mb-2" style={{ transform: 'rotate(-4deg)', textShadow: '8px 8px 0 #1A1A2E', lineHeight: '0.85', letterSpacing: '2px' }}>
            READY TO<br/>PREDICT THE CHAOS?
          </h2>
          <p className="text-white/70 mb-8" style={{ fontFamily: "'Comic Sans MS', cursive", transform: 'rotate(2deg)' }}>your cat certainly is ready.</p>
          <button onClick={onGetStarted}
            className="font-impact text-[32px] text-[#1A1A2E] bg-[#FFD700] px-10 py-4 uppercase hover:scale-110 transition-transform"
            style={{ border: '6px solid #1A1A2E', transform: 'rotate(3deg)', boxShadow: '12px 12px 0 #1A1A2E', animation: 'pulseScale 2s ease-in-out infinite' }}>
            Start Now →
          </button>
        </div>
      </section>
    </div>
  )
}
