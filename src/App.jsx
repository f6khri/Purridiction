import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setLoading(false)
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      setSession(updatedSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-off-white">
        <div className="flex items-center gap-3 mb-4">
          <img src="/logo.png" alt="" className="w-10 h-10 animate-pulse" aria-hidden="true" />
          <p className="font-heading font-black text-2xl uppercase tracking-widest text-brand-purple">
            Purridiction
          </p>
        </div>
        <p className="font-heading font-black text-sm uppercase tracking-widest text-neutral-400">
          Loading...
        </p>
      </div>
    )
  }

  return session
    ? <Dashboard session={session} setSession={setSession} />
    : <AuthPage setSession={setSession} />
}
