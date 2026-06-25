import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard({ session }) {
  const [cats, setCats] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)

  useEffect(() => {
    fetchCats()
  }, [])

  const fetchCats = async () => {
    try {
      const { data, error } = await supabase
        .from('cats')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      setCats(data || [])
      if (data?.length > 0 && !selectedCat) setSelectedCat(data[0])
    } catch (err) {
      console.error('Failed to fetch cats:', err.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <header className="border-b-2 border-near-black bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Purridiction" className="w-10 h-10" />
          <h1 className="font-heading font-black text-xl uppercase tracking-widest">
            Purridiction
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-black uppercase border-2 border-near-black px-3 py-1 hover:bg-near-black hover:text-white"
        >
          Logout
        </button>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* TODO: Cat management, profile card, prediction form, results, achievements, history, health log, vet report, conspiracy report */}
        <p className="text-center text-sm text-neutral-500">Dashboard ready. Components coming soon.</p>
      </main>
    </div>
  )
}
