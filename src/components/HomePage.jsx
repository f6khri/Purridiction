export default function HomePage({ onGetStarted, onLogin }) {
  return (
    <div className="overflow-hidden">
      {/* HERO SECTION */}
      <section className="min-h-screen bg-[#3D3480] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
        {/* Scattered emoji background */}
        <span className="absolute top-10 left-10 text-6xl opacity-20 rotate-[15deg]">🐱</span>
        <span className="absolute top-20 right-16 text-6xl opacity-20 rotate-[-10deg]">👑</span>
        <span className="absolute bottom-32 left-20 text-6xl opacity-20 rotate-[25deg]">⚡</span>
        <span className="absolute bottom-20 right-10 text-6xl opacity-20 rotate-[-20deg]">🔮</span>
        <span className="absolute top-1/3 left-1/4 text-6xl opacity-10 rotate-[45deg]">🐱</span>
        <span className="absolute bottom-1/3 right-1/4 text-6xl opacity-10 rotate-[-30deg]">👑</span>

        {/* Logo */}
        <img
          src="/logo.png"
          alt=""
          className="w-[120px] h-[120px] mb-6 rotate-[-3deg] drop-shadow-2xl"
          aria-hidden="true"
        />

        {/* Headline */}
        <h1
          className="font-impact text-7xl text-[#FFD700] uppercase rotate-[1deg] inline-block mb-3"
          style={{ textShadow: '4px 4px 0 #FF3366' }}
        >
          Purridiction
        </h1>

        {/* Subheadline */}
        <p
          className="text-xl text-white italic mb-8 max-w-md"
          style={{ fontFamily: "'Comic Sans MS', cursive" }}
        >
          your cat is up to something.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={onGetStarted}
            className="bg-[#FF3366] text-white font-black border-2 border-white px-8 py-4 uppercase tracking-widest rotate-[-1deg] text-lg hover:scale-105 transition-transform"
          >
            Get Started
          </button>
          <button
            onClick={onLogin}
            className="bg-[#00FF88] text-[#1A1A2E] font-black border-2 border-[#1A1A2E] px-8 py-4 uppercase tracking-widest rotate-[1deg] text-lg hover:scale-105 transition-transform"
          >
            Login
          </button>
        </div>

        {/* Hackathon badge */}
        <p className="text-xs text-purple-300 font-mono">
          Built for #HackTheKitty 2026
        </p>
      </section>

      {/* FEATURES SECTION */}
      <section className="bg-[#FFFBF0] px-4 py-20">
        <h2
          className="font-impact text-5xl text-[#FF3366] text-center rotate-[-1deg] mb-12"
        >
          WHAT IS THIS THING
        </h2>

        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="rotate-[-2deg] bg-[#FFD700] border-4 border-[#1A1A2E] p-6 shadow-[8px_8px_0px_#FF3366]">
            <p className="text-5xl mb-3">🔮</p>
            <h3 className="font-impact text-xl text-[#1A1A2E] uppercase mb-2">
              Chaos Prediction
            </h3>
            <p className="font-body text-sm text-[#1A1A2E]">
              Predict when your cat will lose their mind today
            </p>
          </div>

          {/* Card 2 */}
          <div className="rotate-[1deg] bg-[#00CFFF] border-4 border-[#1A1A2E] p-6 shadow-[8px_8px_0px_#3D3480]">
            <p className="text-5xl mb-3">🏆</p>
            <h3 className="font-impact text-xl text-[#1A1A2E] uppercase mb-2">
              Rank Your Cat
            </h3>
            <p className="font-body text-sm text-[#1A1A2E]">
              From Sleepy Diplomat to Supreme Overlord
            </p>
          </div>

          {/* Card 3 */}
          <div className="rotate-[-1deg] bg-[#FF3366] border-4 border-[#1A1A2E] p-6 shadow-[8px_8px_0px_#FFD700]">
            <p className="text-5xl mb-3">🏥</p>
            <h3 className="font-impact text-xl text-white uppercase mb-2">
              Health Tracking
            </h3>
            <p className="font-body text-sm text-white">
              Daily logs with AI-powered health insights
            </p>
          </div>

          {/* Card 4 */}
          <div className="rotate-[2deg] bg-[#00FF88] border-4 border-[#1A1A2E] p-6 shadow-[8px_8px_0px_#FF6B00]">
            <p className="text-5xl mb-3">🕵️</p>
            <h3 className="font-impact text-xl text-[#1A1A2E] uppercase mb-2">
              Conspiracy Report
            </h3>
            <p className="font-body text-sm text-[#1A1A2E]">
              Classified intel on your cat&#39;s world domination plan
            </p>
          </div>
        </div>
      </section>

      {/* RANKS SECTION */}
      <section className="bg-[#1A1A2E] px-4 py-16">
        <div className="text-center mb-10">
          <span style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-[#FFD700] text-2xl">THE </span>
          <span className="font-impact text-6xl text-[#FF3366]">RANKS </span>
          <span className="font-mono text-[#00FF88] text-sm uppercase tracking-widest">OF DOMINATION</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 justify-start sm:justify-center px-2">
          <div className="flex-shrink-0 rotate-[-2deg] bg-[#3D3480] border-2 border-[#FFD700] px-4 py-2 font-black text-sm text-white">
            😴 Sleepy Diplomat
          </div>
          <div className="flex-shrink-0 rotate-[1deg] bg-[#FF6B00] border-4 border-white px-4 py-2 font-black text-sm text-white">
            😼 Mild Troublemaker
          </div>
          <div className="flex-shrink-0 rotate-[-1deg] bg-[#FF3366] border-2 border-[#FFD700] px-4 py-2 font-black text-sm text-white">
            😈 Chaos Apprentice
          </div>
          <div className="flex-shrink-0 rotate-[2deg] bg-[#00CFFF] border-4 border-[#1A1A2E] px-4 py-2 font-black text-sm text-[#1A1A2E]">
            👹 Domestic Menace
          </div>
          <div className="flex-shrink-0 rotate-[-1deg] bg-[#FFD700] border-2 border-[#1A1A2E] px-4 py-2 font-black text-sm text-[#1A1A2E]">
            👑 Supreme Overlord
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-[#FF3366] px-4 py-20 text-center">
        <h2
          className="font-impact text-6xl sm:text-8xl text-white rotate-[-3deg] mb-10"
          style={{ textShadow: '4px 4px 0 #1A1A2E' }}
        >
          READY TO PREDICT THE CHAOS?
        </h2>

        <button
          onClick={onGetStarted}
          className="bg-[#FFD700] text-[#1A1A2E] font-black text-xl rotate-[1deg] border-4 border-[#1A1A2E] shadow-[6px_6px_0px_#1A1A2E] px-8 py-4 uppercase tracking-widest hover:scale-105 transition-transform"
        >
          Start Now
        </button>
      </section>
    </div>
  )
}
