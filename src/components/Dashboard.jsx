import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard({ session }) {
  const [cats, setCats] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatAge, setNewCatAge] = useState('adult')
  const [error, setError] = useState(null)
  const [addLoading, setAddLoading] = useState(false)

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

  const handleAddCat = async (e) => {
    e.preventDefault()
    setError(null)

    const trimmedName = newCatName.trim()
    if (!trimmedName) {
      setError('Cat name is required.')
      return
    }
    if (trimmedName.length > 30) {
      setError('Cat name must be 30 characters or less.')
      return
    }
    if (!['kitten', 'adult', 'senior'].includes(newCatAge)) {
      setError('Invalid age category.')
      return
    }

    setAddLoading(true)
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (!currentSession) return

      const { data, error } = await supabase
        .from('cats')
        .insert([{
          user_id: currentSession.user.id,
          name: trimmedName,
          age_category: newCatAge,
          total_xp: 0,
        }])
        .select()
        .single()

      if (error) throw error

      setCats(prev => [...prev, data])
      setSelectedCat(data)
      setNewCatName('')
      setNewCatAge('adult')
      setShowAddForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setAddLoading(false)
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
          <h1 className="font-heading font-black text-xl uppercase tracking-widest text-near-black">
            Purridiction
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-black uppercase border-2 border-near-black px-3 py-1 bg-white text-near-black shadow-[3px_3px_0px_#1A1A2E] hover:shadow-[1px_1px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          Logout
        </button>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Cat selector */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-black text-lg uppercase tracking-widest">
              Your Cats
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-sm font-black uppercase bg-hot-pink text-white px-3 py-2 border-2 border-near-black shadow-[3px_3px_0px_#1A1A2E] hover:shadow-[1px_1px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              {showAddForm ? 'Cancel' : '+ Add Cat'}
            </button>
          </div>

          {/* Cat list */}
          {cats.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {cats.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-4 py-2 border-2 border-near-black font-black text-sm uppercase tracking-wide transition-all ${
                    selectedCat?.id === cat.id
                      ? 'bg-near-black text-white shadow-[0px_0px_0px_#1A1A2E]'
                      : 'bg-white text-near-black shadow-[3px_3px_0px_#1A1A2E] hover:shadow-[1px_1px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {cats.length === 0 && !showAddForm && (
            <div className="border-2 border-dashed border-neutral-400 p-6 text-center">
              <p className="text-sm text-neutral-500 font-medium">
                No cats yet. Add your first cat to start predicting chaos.
              </p>
            </div>
          )}

          {/* Add cat form */}
          {showAddForm && (
            <form
              onSubmit={handleAddCat}
              className="border-2 border-near-black p-4 bg-white shadow-[4px_4px_0px_#1A1A2E] space-y-3"
            >
              <div>
                <label htmlFor="cat-name" className="text-xs font-black uppercase tracking-widest block mb-1">
                  Cat Name
                </label>
                <input
                  id="cat-name"
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Lord Whiskers"
                  required
                  maxLength={30}
                  className="w-full border-2 border-near-black p-2 text-sm font-body"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest block mb-1">
                  Age Category
                </label>
                <div className="flex gap-2">
                  {['kitten', 'adult', 'senior'].map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setNewCatAge(age)}
                      className={`flex-1 py-2 border-2 border-near-black font-black text-sm uppercase transition-all ${
                        newCatAge === age
                          ? 'bg-near-black text-white'
                          : 'bg-white text-near-black hover:bg-neutral-100'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-red-orange text-sm font-bold" role="alert">{error}</p>
              )}

              <button
                type="submit"
                disabled={addLoading}
                className="w-full bg-hot-pink text-white font-black py-3 border-2 border-near-black uppercase tracking-widest shadow-[4px_4px_0px_#1A1A2E] hover:shadow-[2px_2px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
              >
                {addLoading ? 'Adding...' : 'Add Cat'}
              </button>
            </form>
          )}
        </section>

        {/* Selected cat content area */}
        {selectedCat && (
          <section className="space-y-8">
            <div className="border-2 border-near-black p-4 bg-white shadow-[4px_4px_0px_#1A1A2E]">
              <p className="font-heading font-black text-lg uppercase tracking-widest">
                {selectedCat.name}
              </p>
              <p className="text-sm text-neutral-500 font-mono mt-1">
                {selectedCat.age_category} · XP: {selectedCat.total_xp || 0}
              </p>
            </div>

            {/* TODO: CatProfileCard, PredictionForm, ResultCard, PredictionHistory, AchievementGallery, ConspiracyReport, HealthLog, VetReport */}
          </section>
        )}
      </main>
    </div>
  )
}
