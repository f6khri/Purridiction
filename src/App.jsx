import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import LoadingScreen from './components/LoadingScreen'
import HomePage from './components/HomePage'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showHome, setShowHome] = useState(true)
  const [authMode, setAuthMode] = useState('signup')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      setSession(updatedSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  if (session) {
    return <Dashboard session={session} setSession={setSession} />
  }

  if (showHome) {
    return (
      <HomePage
        onGetStarted={() => { setShowHome(false); setAuthMode('signup') }}
        onLogin={() => { setShowHome(false); setAuthMode('login') }}
      />
    )
  }

  return (
    <AuthPage
      mode={authMode}
      setSession={setSession}
      onBack={() => setShowHome(true)}
    />
  )
}
