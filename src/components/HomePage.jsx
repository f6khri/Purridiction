export default function HomePage({ onGetStarted, onLogin }) {
  return (
    <div>
      {/* HERO SECTION */}
      <section className="min-h-screen bg-[#3D3480] flex flex-col items-center justify-center px-4 text-center">
        {/* Logo */}
        <img
          src="/logo.png"
          alt=""
          className="w-[100px] h-[100px] mb-6"
          aria-hidden="true"
        />

        {/* Headline */}
        <h1 className="font-heading font-black text-5xl text-white uppercase tracking-widest mb-4">
          Purridiction
        </h1>

        {/* Subheadline */}
        <p className="font-body text-xl text-purple-200 max-w-md mb-8">
          Your cat is plotting something. We just tell you when.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={onGetStarted}
            className="bg-[#FF3366] text-white font-black border-2 border-white rounded-xl px-8 py-4 uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
          <button
            onClick={onLogin}
            className="bg-transparent text-white font-black border-2 border-white rounded-xl px-8 py-4 uppercase tracking-widest hover:bg-white/10 transition-colors"
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
      <section className="bg-[#FFFBF0] px-4 py-16">
        <h2 className="font-heading font-black text-3xl text-center uppercase tracking-widest text-[#1A1A2E] mb-10">
          What Purridiction Does
        </h2>

        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-white border-2 border-[#1A1A2E] rounded-2xl p-6 shadow-[4px_4px_0px_#3D3480]">
            <p className="text-4xl mb-3">🔮</p>
            <h3 className="font-heading font-black text-sm uppercase tracking-widest text-[#1A1A2E] mb-2">
              Chaos Prediction
            </h3>
            <p className="font-body text-sm text-neutral-600">
              Predict when your cat will lose their mind today
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border-2 border-[#1A1A2E] rounded-2xl p-6 shadow-[4px_4px_0px_#3D3480]">
            <p className="text-4xl mb-3">🏆</p>
            <h3 className="font-heading font-black text-sm uppercase tracking-widest text-[#1A1A2E] mb-2">
              Rank Your Cat
            </h3>
            <p className="font-body text-sm text-neutral-600">
              From Sleepy Diplomat to Supreme Overlord
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border-2 border-[#1A1A2E] rounded-2xl p-6 shadow-[4px_4px_0px_#3D3480]">
            <p className="text-4xl mb-3">🏥</p>
            <h3 className="font-heading font-black text-sm uppercase tracking-widest text-[#1A1A2E] mb-2">
              Health Tracking
            </h3>
            <p className="font-body text-sm text-neutral-600">
              Daily logs with AI-powered health insights
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border-2 border-[#1A1A2E] rounded-2xl p-6 shadow-[4px_4px_0px_#3D3480]">
            <p className="text-4xl mb-3">🕵️</p>
            <h3 className="font-heading font-black text-sm uppercase tracking-widest text-[#1A1A2E] mb-2">
              Conspiracy Report
            </h3>
            <p className="font-body text-sm text-neutral-600">
              Classified intel on your cat&#39;s world domination plan
            </p>
          </div>
        </div>
      </section>

      {/* RANKS SECTION */}
      <section className="bg-[#1A1A2E] px-4 py-16">
        <h2 className="font-heading font-black text-2xl text-white text-center uppercase tracking-widest mb-8">
          The Ranks of Domination
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-4 justify-start sm:justify-center px-2">
          {[
            { emoji: "😴", title: "Sleepy Diplomat" },
            { emoji: "😼", title: "Mild Troublemaker" },
            { emoji: "😈", title: "Chaos Apprentice" },
            { emoji: "👹", title: "Domestic Menace" },
            { emoji: "👑", title: "Supreme Overlord" },
          ].map((rank) => (
            <div
              key={rank.title}
              className="flex-shrink-0 rounded-full px-4 py-2 font-black text-sm border-2 border-white text-white flex items-center gap-2"
            >
              <span>{rank.emoji}</span>
              <span className="whitespace-nowrap">{rank.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-[#FF3366] px-4 py-16 text-center">
        <h2 className="font-heading font-black text-3xl text-white uppercase tracking-widest mb-8">
          Ready to Predict the Chaos?
        </h2>

        <button
          onClick={onGetStarted}
          className="bg-white text-[#FF3366] font-black border-2 border-white rounded-xl px-8 py-4 uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          Start Now
        </button>
      </section>
    </div>
  )
}
