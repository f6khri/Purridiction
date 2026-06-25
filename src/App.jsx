import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Purridiction" className="w-10 h-10 animate-pulse" />
          <p className="font-heading font-black text-xl uppercase tracking-widest">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  return session ? <Dashboard session={session} /> : <AuthPage />
}
