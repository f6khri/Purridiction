import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPage({ mode = 'login', onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSignupSuccess(false)
    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user && !data.session) setSignupSuccess(true)
      }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#3D3480] relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top right, rgba(0,207,255,0.2), transparent 50%), #3D3480' }}>
      <span className="absolute top-10 left-8 text-5xl opacity-[0.06] rotate-[20deg]" style={{ animation: 'float 7s ease-in-out infinite' }}>🐱</span>
      <span className="absolute bottom-20 right-12 text-5xl opacity-[0.06] rotate-[-15deg]" style={{ animation: 'float 5s ease-in-out infinite 1s' }}>👑</span>
      <span className="absolute top-1/3 right-8 text-5xl opacity-[0.06] rotate-[30deg]" style={{ animation: 'float 8s ease-in-out infinite 2s' }}>⚡</span>

      <div className="w-full max-w-sm border-[5px] border-[#1A1A2E] p-6 bg-[#FFFBF0] rotate-[-1.5deg]"
        style={{ boxShadow: '12px 12px 0 #FF3366, 24px 24px 0 rgba(255,51,102,0.15)' }}>
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.png" alt="" className="w-10 h-10 rotate-[-5deg]" aria-hidden="true" />
          <h1 className="font-impact text-3xl text-[#FFD700] uppercase"
            style={{ textShadow: '3px 0 #FF3366, -2px 0 #00CFFF' }}>Purridiction</h1>
        </div>

        {signupSuccess && (
          <div className="mb-4 p-3 border-4 border-[#00FF88] bg-[#00FF88]/20 text-sm font-black text-[#1A1A2E] rotate-[1deg]">
            Account created! Check your email to confirm, then log in. ✓
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auth-email" className="font-mono text-[10px] uppercase tracking-widest text-[#3D3480] block mb-1">Email</label>
            <input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email"
              className="w-full border-2 border-[#1A1A2E] p-2 text-sm font-body bg-white" />
          </div>
          <div>
            <label htmlFor="auth-password" className="font-mono text-[10px] uppercase tracking-widest text-[#3D3480] block mb-1">Password</label>
            <input id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={6} autoComplete={isLogin ? "current-password" : "new-password"}
              className="w-full border-2 border-[#1A1A2E] p-2 text-sm font-body bg-white" />
          </div>

          {error && <p className="text-[#FF3366] text-sm font-black border-2 border-[#FF3366] p-2 bg-[#FF3366]/10 rotate-[1deg]" role="alert">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-[#FF3366] text-white font-impact text-xl py-3 border-4 border-[#1A1A2E] uppercase rotate-[1deg] hover:rotate-[0deg] hover:scale-105 transition-all disabled:opacity-50"
            style={{ boxShadow: '8px 8px 0 #1A1A2E' }}>
            {loading ? '...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <button onClick={() => { setIsLogin(!isLogin); setError(null); setSignupSuccess(false) }}
          className="mt-4 text-sm text-[#3D3480] font-black w-full text-center hover:text-[#FF3366] transition-colors">
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>

        {onBack && (
          <button onClick={onBack}
            className="mt-3 text-xs text-[#3D3480]/50 font-mono w-full text-center hover:text-[#FF3366] transition-colors">
            ← Back to Home
          </button>
        )}
      </div>
    </div>
  )
}
