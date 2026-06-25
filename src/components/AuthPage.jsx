import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
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
        // If email confirmation is enabled and no session returned
        if (data.user && !data.session) {
          setSignupSuccess(true)
        }
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
        {/* Logo and title */}
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.png" alt="Purridiction" className="w-10 h-10" />
          <h1 className="font-heading font-black text-2xl uppercase tracking-widest">
            Purridiction
          </h1>
        </div>

        {/* Signup success message */}
        {signupSuccess && (
          <div className="mb-4 p-3 border-2 border-mint-green bg-mint-green/10 text-sm font-bold text-near-black">
            Account created! Check your email to confirm, then log in.
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auth-email" className="text-xs font-black uppercase tracking-widest block mb-1">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border-2 border-near-black p-2 text-sm font-body"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="text-xs font-black uppercase tracking-widest block mb-1">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="w-full border-2 border-near-black p-2 text-sm font-body"
            />
          </div>

          {error && (
            <p className="text-red-orange text-sm font-bold" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-hot-pink text-white font-black py-3 border-2 border-near-black uppercase tracking-widest shadow-[4px_4px_0px_#1A1A2E] hover:shadow-[2px_2px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
          >
            {loading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle login/signup */}
        <button
          onClick={() => {
            setIsLogin(!isLogin)
            setError(null)
            setSignupSuccess(false)
          }}
          className="mt-4 text-sm text-brand-purple font-medium w-full text-center hover:underline"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  )
}
