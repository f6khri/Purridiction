import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import CatProfileCard from './CatProfileCard'
import PredictionForm from './PredictionForm'
import ResultCard from './ResultCard'
import PredictionHistory from './PredictionHistory'
import AchievementGallery from './AchievementGallery'
import HealthLog from './HealthLog'
import VetReport from './VetReport'
import ConspiracyReport from './ConspiracyReport'

export default function Dashboard({ session }) {
  const [cats, setCats] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatAge, setNewCatAge] = useState('adult')
  const [error, setError] = useState(null)
  const [addLoading, setAddLoading] = useState(false)
  const [generatingName, setGeneratingName] = useState(false)

  // Prediction state
  const [predictions, setPredictions] = useState([])
  const [latestResult, setLatestResult] = useState(null)

  // Achievements
  const [unlockedIds, setUnlockedIds] = useState([])

  // Health logs
  const [healthLogs, setHealthLogs] = useState([])

  // Toast queue
  const [toast, setToast] = useState(null)

  // --- Data fetching functions ---

  const fetchCats = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('cats')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true })
      if (fetchError) throw fetchError
      setCats(data || [])
      if (data?.length > 0) {
        setSelectedCat(prev => prev || data[0])
      }
    } catch (err) {
      console.error('Failed to fetch cats:', err.message)
    }
  }, [session.user.id])

  const fetchPredictions = useCallback(async (catId) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('chaos_predictions')
        .select('*')
        .eq('cat_id', catId)
        .order('created_at', { ascending: false })
      if (fetchError) throw fetchError
      setPredictions(data || [])
    } catch (err) {
      console.error('Failed to fetch predictions:', err.message)
    }
  }, [])

  const fetchAchievements = useCallback(async (catId) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('cat_achievements')
        .select('achievement_id')
        .eq('cat_id', catId)
      if (fetchError) throw fetchError
      setUnlockedIds((data || []).map(a => a.achievement_id))
    } catch (err) {
      console.error('Failed to fetch achievements:', err.message)
    }
  }, [])

  const fetchHealthLogs = useCallback(async (catId) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('health_logs')
        .select('*')
        .eq('cat_id', catId)
        .order('logged_at', { ascending: false })
        .limit(7)
      if (fetchError) throw fetchError
      setHealthLogs(data || [])
    } catch (err) {
      console.error('Failed to fetch health logs:', err.message)
    }
  }, [])

  // --- Effects ---

  useEffect(() => {
    fetchCats()
  }, [fetchCats])

  useEffect(() => {
    if (selectedCat) {
      fetchPredictions(selectedCat.id)
      fetchAchievements(selectedCat.id)
      fetchHealthLogs(selectedCat.id)
    } else {
      setPredictions([])
      setUnlockedIds([])
      setHealthLogs([])
    }
    setLatestResult(null)
  }, [selectedCat?.id, fetchPredictions, fetchAchievements, fetchHealthLogs])

  // --- Handlers ---

  const handleGenerateName = async () => {
    setGeneratingName(true)
    try {
      const prompt = `Generate a single dramatic cat name for a cat with world domination ambitions.
Age category: ${newCatAge}
Rules:
- kitten: cute but ambitious titles like Admiral, Baron, Captain
- adult: commanding titles like Commander, General, Lord
- senior: ancient emperor titles like Emperor, Grand Overlord, Ancient Lord
Format: [Title] [Name] like Admiral Fluffington or Lord Shadowpaw.
One name only. No explanation. No punctuation at the end.`

      const { data, error: fnError } = await supabase.functions.invoke("gemini-proxy", {
        body: { prompt },
      })
      if (fnError) throw fnError
      const name = (data?.narration || '').trim().slice(0, 30)
      if (name) setNewCatName(name)
    } catch {
      // Silently fail — user can still type manually
    } finally {
      setGeneratingName(false)
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

      const { data, error: insertError } = await supabase
        .from('cats')
        .insert([{
          user_id: currentSession.user.id,
          name: trimmedName,
          age_category: newCatAge,
          total_xp: 0,
        }])
        .select()
        .single()

      if (insertError) throw insertError

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

  const handleSelectCat = (cat) => {
    if (cat.id !== selectedCat?.id) {
      setSelectedCat(cat)
    }
  }

  const handlePrediction = (result) => {
    setLatestResult(result)
    setPredictions(prev => [result, ...prev])
    setSelectedCat(prev => ({ ...prev, total_xp: result.newTotalXP }))
    setCats(prev => prev.map(c => c.id === selectedCat.id ? { ...c, total_xp: result.newTotalXP } : c))
  }

  const handleConfirm = (predictionId, accurate) => {
    setPredictions(prev => prev.map(p =>
      p.id === predictionId ? { ...p, confirmed_accurate: accurate } : p
    ))
    if (accurate) {
      const newXP = (selectedCat.total_xp || 0) + 25
      setSelectedCat(prev => ({ ...prev, total_xp: newXP }))
      setCats(prev => prev.map(c => c.id === selectedCat.id ? { ...c, total_xp: newXP } : c))
    }
    if (latestResult?.id === predictionId) {
      setLatestResult(prev => ({ ...prev, confirmed_accurate: accurate }))
    }
  }

  const handleDeletePrediction = (id) => {
    setPredictions(prev => prev.filter(p => p.id !== id))
    if (latestResult?.id === id) setLatestResult(null)
  }

  const showAchievementToast = useCallback((achievement) => {
    setToast(achievement)
    setTimeout(() => setToast(null), 4000)
  }, [])

  const handleAchievementUnlock = (achievement) => {
    setUnlockedIds(prev => [...prev, achievement.id])
    showAchievementToast(achievement)
  }

  const handleConspiracyAchievement = (achievementId) => {
    if (!unlockedIds.includes(achievementId)) {
      setUnlockedIds(prev => [...prev, achievementId])
      showAchievementToast({
        id: achievementId,
        title: "Intelligence Breach",
        emoji: "🕵️",
        description: "Generated your first Cat Conspiracy Report",
      })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // Feeding reminder: show if 6+ hours since last meal
  const getFeedingReminder = () => {
    if (predictions.length === 0) return null
    const latest = predictions[0]
    if (!latest.input_data?.lastMealHour && latest.input_data?.lastMealHour !== 0) return null
    const hoursSince = (new Date().getHours() - latest.input_data.lastMealHour + 24) % 24
    if (hoursSince >= 6) {
      return `${hoursSince} hours since ${selectedCat.name} last ate. Chaos risk is rising.`
    }
    return null
  }

  const feedingReminder = selectedCat ? getFeedingReminder() : null

  return (
    <div className="min-h-screen bg-off-white">
      {/* Achievement Toast — fixed top-right, auto-dismiss 4s */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 border-2 border-near-black bg-electric-yellow p-4 shadow-[4px_4px_0px_#1A1A2E] max-w-xs"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">{toast.emoji}</span>
            <div>
              <p className="font-heading font-black text-sm uppercase tracking-widest text-near-black">
                Achievement Unlocked!
              </p>
              <p className="text-xs font-bold text-near-black mt-1">
                {toast.title}
              </p>
              <p className="text-[10px] font-mono text-neutral-600 mt-0.5">
                {toast.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header — logo 40x40, wordmark, logout */}
      <header className="sticky top-0 z-40 border-b-2 border-near-black bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="w-10 h-10" aria-hidden="true" />
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

      {/* Main content — max-w-2xl centered, px-4, gap-8 */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Cat selector section */}
        <section aria-label="Cat management">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-black text-lg uppercase tracking-widest">
              Your Cats
            </h2>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm)
                setError(null)
              }}
              className="text-sm font-black uppercase bg-hot-pink text-white px-3 py-2 border-2 border-near-black shadow-[3px_3px_0px_#1A1A2E] hover:shadow-[1px_1px_0px_#1A1A2E] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              {showAddForm ? 'Cancel' : '+ Add Cat'}
            </button>
          </div>

          {/* Cat list tabs */}
          {cats.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Select a cat">
              {cats.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCat(cat)}
                  role="tab"
                  aria-selected={selectedCat?.id === cat.id}
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

          {/* Empty state */}
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
              className="border-2 border-near-black p-6 bg-white shadow-[4px_4px_0px_#1A1A2E] space-y-4"
            >
              <div>
                <label htmlFor="cat-name" className="text-xs font-black uppercase tracking-widest block mb-1">
                  Cat Name
                </label>
                <div className="flex gap-2">
                  <input
                    id="cat-name"
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Lord Whiskers"
                    required
                    maxLength={30}
                    className="flex-1 border-2 border-near-black p-2 text-sm font-body"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateName}
                    disabled={generatingName}
                    className="bg-[#00CFFF] text-[#1A1A2E] font-black border-2 border-[#1A1A2E] rounded-xl px-3 py-2 text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
                  >
                    {generatingName ? '...' : '✨ Generate'}
                  </button>
                </div>
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

        {/* Selected cat content — all sections with gap-8 spacing */}
        {selectedCat && (
          <section className="space-y-8" aria-label={`${selectedCat.name} details`}>
            {/* Profile Card */}
            <CatProfileCard cat={selectedCat} predictions={predictions} />

            {/* Feeding Reminder — shown above prediction form */}
            {feedingReminder && (
              <div
                className="bg-electric-yellow border-2 border-near-black p-3 font-bold text-sm shadow-[3px_3px_0px_#1A1A2E]"
                role="alert"
              >
                🍽️ {feedingReminder}
              </div>
            )}

            {/* Prediction Form */}
            <PredictionForm
              cat={selectedCat}
              predictions={predictions}
              unlockedIds={unlockedIds}
              onPrediction={handlePrediction}
              onAchievementUnlock={handleAchievementUnlock}
            />

            {/* Latest Result */}
            {latestResult && (
              <ResultCard
                result={latestResult}
                cat={selectedCat}
                onConfirm={handleConfirm}
              />
            )}

            {/* Prediction History */}
            <PredictionHistory
              predictions={predictions}
              onDelete={handleDeletePrediction}
            />

            {/* Conspiracy Report — after history, before achievements */}
            <ConspiracyReport
              cat={selectedCat}
              predictions={predictions}
              unlockedIds={unlockedIds}
              onAchievementUnlock={handleConspiracyAchievement}
            />

            {/* Achievement Gallery */}
            <AchievementGallery unlockedIds={unlockedIds} />

            {/* Health Log */}
            <HealthLog cat={selectedCat} />

            {/* Vet Report */}
            <VetReport
              cat={selectedCat}
              predictions={predictions}
              healthLogs={healthLogs}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-near-black bg-white px-4 py-4 mt-8 text-center">
        <p className="text-xs font-mono text-neutral-400">
          Purridiction · #HackTheKitty 2026 · World Cat Domination Day
        </p>
      </footer>
    </div>
  )
}
