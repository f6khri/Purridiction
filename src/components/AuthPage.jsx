import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-off-white">
      <div className="w-full max-w-sm border-2 border-near-black p-6 bg-white shadow-[4px_4px_0px_#1A1A2E]">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.png" alt="Purridiction" className="w-10 h-10" />
          <h1 className="font-heading font-black text-2xl uppercase tracking-widest">
            Purridiction
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-2 border-near-black p-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border-2 border-near-black p-2 text-sm"
            />
          </div>

          {error && <p className="text-red-orange text-sm font-bold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-hot-pink text-white font-black py-3 border-2 border-near-black uppercase tracking-widest hover:shadow-[2px_2px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50"
          >
            {loading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-sm text-brand-purple font-medium w-full text-center"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  )
}
