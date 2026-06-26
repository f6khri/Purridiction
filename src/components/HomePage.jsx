export default function HomePage({ onGetStarted, onLogin }) {
  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="min-h-screen bg-[#3D3480] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at bottom left, rgba(255,51,102,0.3), transparent 50%), radial-gradient(ellipse at top right, rgba(0,207,255,0.2), transparent 50%), radial-gradient(ellipse at center, rgba(255,215,0,0.1), transparent 40%), #3D3480' }}>

        {/* Scattered emoji */}
        <span className="absolute top-[10%] left-[8%] text-6xl opacity-[0.08] rotate-[15deg]" style={{ animation: 'float 6s ease-in-out infinite' }}>🐱</span>
        <span className="absolute top-[15%] right-[12%] text-7xl opacity-[0.08] rotate-[-20deg]" style={{ animation: 'float 8s ease-in-out infinite 1s' }}>👑</span>
        <span className="absolute bottom-[25%] left-[15%] text-5xl opacity-[0.08] rotate-[30deg]" style={{ animation: 'float 7s ease-in-out infinite 2s' }}>⚡</span>
        <span className="absolute bottom-[15%] right-[8%] text-6xl opacity-[0.08] rotate-[-25deg]" style={{ animation: 'float 5s ease-in-out infinite 0.5s' }}>🔮</span>
        <span className="absolute top-[40%] left-[5%] text-5xl opacity-[0.08] rotate-[45deg]" style={{ animation: 'float 9s ease-in-out infinite 3s' }}>😈</span>
        <span className="absolute top-[60%] right-[5%] text-5xl opacity-[0.08] rotate-[-35deg]" style={{ animation: 'float 6.5s ease-in-out infinite 1.5s' }}>⚔️</span>

        {/* Eyebrow */}
        <p className="font-mono text-xs text-[#00FF88] tracking-widest mb-4">
          // world cat domination day 2026 //<span style={{ animation: 'blink 1s infinite' }}>_</span>
        </p>

        {/* Logo */}
        <img src="/logo.png" alt="" aria-hidden="true"
          className="w-[120px] h-[120px] mb-6"
          style={{ animation: 'logoRock 3s ease-in-out infinite', filter: 'drop-shadow(0 0 12px #FF3366) drop-shadow(0 0 24px #00CFFF)' }}
        />

        {/* Title */}
        <h1 className="font-impact text-7xl sm:text-[96px] text-[#FFD700] uppercase rotate-[2deg] inline-block mb-3"
          style={{ textShadow: '6px 6px 0 #FF3366, 12px 12px 0 rgba(255,51,102,0.3)' }}>
          Purridiction
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-white italic rotate-[-2deg] mb-2"
          style={{ fontFamily: "'Comic Sans MS', cursive" }}>
          your cat is plotting something.
        </p>

        {/* Sub-subtitle */}
        <p className="font-mono text-xs text-[#00CFFF] tracking-widest mb-8">
          // we just tell you when //
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 mb-6">
          <button onClick={onGetStarted}
            className="font-impact text-2xl bg-[#FF3366] text-white border-4 border-white px-8 py-4 uppercase rotate-[-3deg] hover:scale-110 transition-transform"
            style={{ boxShadow: '8px 8px 0 #FFD700, 16px 16px 0 rgba(255,215,0,0.3)', animation: 'pulseScale 2s ease-in-out infinite' }}>
            Get Started
          </button>
          <button onClick={onLogin}
            className="font-heading font-black text-xl bg-transparent text-white border-4 border-[#FFD700] px-8 py-4 uppercase rotate-[2deg] hover:scale-110 transition-transform"
            style={{ boxShadow: '8px 8px 0 #00CFFF' }}>
            Login
          </button>
        </div>

        {/* Tag */}
        <p className="text-white/50 rotate-[1deg]"
          style={{ fontFamily: "'Comic Sans MS', cursive" }}>
          Built for #HackTheKitty 2026 🐱
        </p>
      </section>

      {/* FEATURES */}
      <section className="bg-[#FFFBF0] px-4 py-20 relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute inset-0 opacity-[0.04] text-8xl leading-tight pointer-events-none select-none overflow-hidden"
          style={{ fontFamily: "'Comic Sans MS', cursive" }}>
          {'🐱 '.repeat(200)}
        </div>

        <div className="relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-impact text-5xl sm:text-7xl text-[#FF3366] rotate-[-2deg] inline-block"
              style={{ textShadow: '4px 4px 0 #1A1A2E' }}>
              WHAT IS
            </h2>
            <p className="text-2xl text-[#3D3480] rotate-[1deg] mt-2"
              style={{ fontFamily: "'Comic Sans MS', cursive" }}>
              this thing even
            </p>
          </div>

          <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="rotate-[-3deg] bg-[#FFD700] border-[5px] border-[#1A1A2E] p-6"
              style={{ boxShadow: '12px 12px 0 #FF3366, 24px 24px 0 rgba(255,51,102,0.2)' }}>
              <p className="text-[56px] mb-2" style={{ animation: 'wiggle 2s ease-in-out infinite' }}>🔮</p>
              <h3 className="font-impact text-xl uppercase tracking-wide text-[#1A1A2E] mb-1">Chaos Prediction</h3>
              <p style={{ fontFamily: "'Comic Sans MS', cursive", fontSize: '13px' }} className="text-[#1A1A2E]">Predict when your cat will lose their mind today</p>
            </div>

            <div className="rotate-[2deg] bg-[#00CFFF] border-4 border-dashed border-[#1A1A2E] p-6"
              style={{ boxShadow: '12px 12px 0 #3D3480' }}>
              <p className="text-[56px] mb-2" style={{ animation: 'wiggle 2.5s ease-in-out infinite 0.3s' }}>🏆</p>
              <h3 className="font-impact text-xl uppercase tracking-wide text-[#1A1A2E] mb-1">Rank Your Cat</h3>
              <p style={{ fontFamily: "'Comic Sans MS', cursive", fontSize: '13px' }} className="text-[#1A1A2E]">From Sleepy Diplomat to Supreme Overlord</p>
            </div>

            <div className="rotate-[-1deg] bg-[#FF3366] border-8 border-[#1A1A2E] p-6"
              style={{ boxShadow: '12px 12px 0 #FFD700' }}>
              <p className="text-[56px] mb-2" style={{ animation: 'wiggle 3s ease-in-out infinite 0.6s' }}>🏥</p>
              <h3 className="font-impact text-xl uppercase tracking-wide text-white mb-1">Health Tracking</h3>
              <p style={{ fontFamily: "'Comic Sans MS', cursive", fontSize: '13px' }} className="text-white">Daily logs with AI-powered health insights</p>
            </div>

            <div className="rotate-[3deg] bg-[#00FF88] border-4 border-dotted border-[#1A1A2E] p-6"
              style={{ boxShadow: '12px 12px 0 #FF6B00' }}>
              <p className="text-[56px] mb-2" style={{ animation: 'wiggle 2.2s ease-in-out infinite 0.9s' }}>🕵️</p>
              <h3 className="font-impact text-xl uppercase tracking-wide text-[#1A1A2E] mb-1">Conspiracy Report</h3>
              <p style={{ fontFamily: "'Comic Sans MS', cursive", fontSize: '13px' }} className="text-[#1A1A2E]">Classified intel on your cat&#39;s world domination plan</p>
            </div>
          </div>
        </div>
      </section>

      {/* RANKS */}
      <section className="bg-[#1A1A2E] px-4 py-16"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,215,0,0.03) 10px, rgba(255,215,0,0.03) 20px)' }}>
        <div className="text-center mb-10">
          <span style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-[#C4B5FD] text-2xl">the</span>
          <span className="font-impact text-6xl sm:text-[80px] text-[#FFD700] block rotate-[-2deg]"
            style={{ textShadow: '5px 5px 0 #FF3366' }}>RANKS</span>
          <span className="font-mono text-[#00FF88] text-[10px] uppercase block rotate-[1deg]"
            style={{ letterSpacing: '8px' }}>of world domination</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 justify-start sm:justify-center px-2">
          <div className="flex-shrink-0 rotate-[-3deg] bg-[#3D3480] border-2 border-[#FFD700] px-4 py-2 font-impact text-sm text-white">😴 Sleepy Diplomat</div>
          <div className="flex-shrink-0 rotate-[2deg] bg-[#FF6B00] border-4 border-dashed border-white px-4 py-2 font-impact text-sm text-white">😼 Mild Troublemaker</div>
          <div className="flex-shrink-0 rotate-[-1deg] bg-[#FF3366] border-2 border-[#FFD700] px-4 py-2 font-impact text-sm text-white">😈 Chaos Apprentice</div>
          <div className="flex-shrink-0 rotate-[3deg] bg-[#8B0000] border-4 border-dotted border-white px-4 py-2 font-impact text-sm text-white">👹 Domestic Menace</div>
          <div className="flex-shrink-0 rotate-[-2deg] bg-[#FFD700] border-2 border-[#1A1A2E] px-4 py-2 font-impact text-sm text-[#1A1A2E]"
            style={{ animation: 'pulseGlow 2s infinite' }}>👑 Supreme Overlord</div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#FF3366] px-4 py-20 text-center relative overflow-hidden">
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] opacity-[0.06] pointer-events-none">👑</span>
        <h2 className="font-impact text-5xl sm:text-7xl text-white rotate-[-3deg] mb-4 relative z-10"
          style={{ textShadow: '6px 6px 0 #1A1A2E', lineHeight: '0.9' }}>
          READY TO PREDICT THE CHAOS?
        </h2>
        <p className="text-white/70 rotate-[1deg] mb-8 relative z-10"
          style={{ fontFamily: "'Comic Sans MS', cursive" }}>
          your cat won&#39;t predict itself
        </p>
        <button onClick={onGetStarted}
          className="font-impact text-2xl bg-[#FFD700] text-[#1A1A2E] border-[5px] border-[#1A1A2E] px-10 py-4 uppercase rotate-[2deg] relative z-10 hover:scale-110 transition-transform"
          style={{ boxShadow: '10px 10px 0 #1A1A2E', animation: 'pulseScale 2s ease-in-out infinite' }}>
          Start Now
        </button>
      </section>
    </div>
  )
}
