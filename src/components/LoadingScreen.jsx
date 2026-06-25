export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#3D3480] flex flex-col items-center justify-center">
      {/* Logo */}
      <img
        src="/logo.png"
        alt=""
        className="w-20 h-20 animate-pulse mb-4"
        aria-hidden="true"
      />

      {/* Wordmark */}
      <h1 className="font-heading font-black text-3xl text-white uppercase tracking-widest mb-4">
        Purridiction
      </h1>

      {/* Animated dots */}
      <div className="flex gap-2 mb-4">
        <span
          className="w-2 h-2 rounded-full bg-white animate-[fadeInOut_1.2s_ease-in-out_infinite_0s]"
        />
        <span
          className="w-2 h-2 rounded-full bg-white animate-[fadeInOut_1.2s_ease-in-out_infinite_0.3s]"
        />
        <span
          className="w-2 h-2 rounded-full bg-white animate-[fadeInOut_1.2s_ease-in-out_infinite_0.6s]"
        />
      </div>

      {/* Status text */}
      <p className="font-body text-sm text-purple-200">
        Analyzing feline threat levels...
      </p>
    </div>
  )
}
