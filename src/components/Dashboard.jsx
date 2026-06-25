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

const CAT_COLORS = ['#FF3366', '#00CFFF', '#FFD700', '#00FF88', '#FF6B00', '#3D3480']

export default function Dashboard({ session }) {
  const [cats, setCats] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatAge, setNewCatAge] = useState('adult')
  const [error, setError] = useState(null)
  const [addLoading, setAddLoading] = useState(false)
  const [generatingName, setGeneratingName] = useState(false)

  const [predictions, setPredictions] = useState([])
  const [latestResult, setLatestResult] = useState(null)
  const [unlockedIds, setUnlockedIds] = useState([])
  const [healthLogs, setHealthLogs] = useState([])
  const [toast, setToast] = useState(null)

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
      // Silently fail
    } finally {
      setGeneratingName(false)
    }
  }

  const handleAddCat = async (e) => {
    e.preventDefault()
    setError(null)
    const trimmedName = newCatName.trim()
    if (!trimmedName) { setError('Cat name is required.'); return }
    if (trimmedName.length > 30) { setError('Cat name must be 30 characters or less.'); return }
    if (!['kitten', 'adult', 'senior'].includes(newCatAge)) { setError('Invalid age category.'); return }

    setAddLoading(true)
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (!currentSession) return
      const { data, error: insertError } = await supabase
        .from('cats')
        .insert([{ user_id: currentSession.user.id, name: trimmedName, age_category: newCatAge, total_xp: 0 }])
        .select().single()
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

  const handleSelectCat = (cat) => { if (cat.id !== selectedCat?.id) setSelectedCat(cat) }

  const handlePrediction = (result) => {
    setLatestResult(result)
    setPredictions(prev => [result, ...prev])
    setSelectedCat(prev => ({ ...prev, total_xp: result.newTotalXP }))
    setCats(prev => prev.map(c => c.id === selectedCat.id ? { ...c, total_xp: result.newTotalXP } : c))
  }

  const handleConfirm = (predictionId, accurate) => {
    setPredictions(prev => prev.map(p => p.id === predictionId ? { ...p, confirmed_accurate: accurate } : p))
    if (accurate) {
      const newXP = (selectedCat.total_xp || 0) + 25
      setSelectedCat(prev => ({ ...prev, total_xp: newXP }))
      setCats(prev => prev.map(c => c.id === selectedCat.id ? { ...c, total_xp: newXP } : c))
    }
    if (latestResult?.id === predictionId) setLatestResult(prev => ({ ...prev, confirmed_accurate: accurate }))
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
      showAchievementToast({ id: achievementId, title: "Intelligence Breach", emoji: "🕵️", description: "Generated your first Cat Conspiracy Report" })
    }
  }

  const handleLogout = async () => { await supabase.auth.signOut() }

  const getFeedingReminder = () => {
    if (predictions.length === 0) return null
    const latest = predictions[0]
    if (!latest.input_data?.lastMealHour && latest.input_data?.lastMealHour !== 0) return null
    const hoursSince = (new Date().getHours() - latest.input_data.lastMealHour + 24) % 24
    if (hoursSince >= 6) return `${hoursSince} hours since ${selectedCat.name} last ate. Chaos risk is rising.`
    return null
  }

  const feedingReminder = selectedCat ? getFeedingReminder() : null

  return (
    <div className="min-h-screen bg-[#FFFBF0]">
      {/* Achievement Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 border-4 border-[#1A1A2E] bg-[#FFD700] p-4 shadow-[6px_6px_0px_#FF3366] max-w-xs rotate-[2deg]"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl" aria-hidden="true">{toast.emoji}</span>
            <div>
              <p className="font-impact text-sm uppercase text-[#1A1A2E]">
                Achievement Unlocked!
              </p>
              <p className="text-xs font-black text-[#1A1A2E] mt-1">{toast.title}</p>
              <p className="text-[10px] font-mono text-[#3D3480] mt-0.5">{toast.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b-4 border-[#1A1A2E] bg-[#1A1A2E] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="w-10 h-10 rotate-[-5deg] hover:rotate-[5deg] transition-transform" aria-hidden="true" />
          <h1
            className="font-impact text-2xl text-[#FFD700] uppercase"
            style={{ textShadow: '3px 0 #FF3366, -1px 0 #00CFFF' }}
          >
            Purridiction
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-black uppercase bg-[#FF3366] text-white px-3 py-1 border-2 border-white rotate-[1deg] hover:rotate-[-1deg] transition-transform"
        >
          Logout
        </button>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Cat selector */}
        <section aria-label="Cat management">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-impact text-2xl text-[#3D3480] uppercase rotate-[-1deg] inline-block">
              Your Cats
            </h2>
            <button
              onClick={() => { setShowAddForm(!showAddForm); setError(null) }}
              className="text-sm font-black uppercase bg-[#FF3366] text-white px-3 py-2 border-2 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E] rotate-[1deg] hover:rotate-[0deg] transition-transform"
            >
              {showAddForm ? 'Cancel' : '+ Add Cat'}
            </button>
          </div>

          {/* Cat list */}
          {cats.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4" role="tablist" aria-label="Select a cat">
              {cats.map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCat(cat)}
                  role="tab"
                  aria-selected={selectedCat?.id === cat.id}
                  style={{
                    backgroundColor: selectedCat?.id === cat.id ? CAT_COLORS[i % CAT_COLORS.length] : '#FFFBF0',
                    transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)`,
                  }}
                  className={`px-4 py-2 border-2 border-[#1A1A2E] font-black text-sm uppercase tracking-wide shadow-[3px_3px_0px_#1A1A2E] transition-all hover:scale-105 ${
                    selectedCat?.id === cat.id ? 'text-white' : 'text-[#1A1A2E]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {cats.length === 0 && !showAddForm && (
            <div className="border-4 border-dashed border-[#3D3480] p-6 text-center rotate-[-1deg]">
              <p style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-sm text-[#3D3480]">
                No cats yet. Add your first cat to start predicting chaos. 🐱
              </p>
            </div>
          )}

          {/* Add cat form */}
          {showAddForm && (
            <form
              onSubmit={handleAddCat}
              className="border-4 border-[#3D3480] p-6 bg-white shadow-[8px_8px_0px_#FFD700] space-y-4 rotate-[-1deg]"
            >
              <div>
                <label htmlFor="cat-name" className="font-mono text-xs uppercase tracking-widest text-[#3D3480] block mb-1">
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
                    className="flex-1 border-2 border-[#1A1A2E] p-2 text-sm font-body bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateName}
                    disabled={generatingName}
                    className="bg-[#00CFFF] text-[#1A1A2E] font-black border-2 border-[#1A1A2E] px-3 py-2 text-sm hover:scale-105 transition-transform disabled:opacity-50 rotate-[1deg]"
                  >
                    {generatingName ? '...' : '✨ Generate'}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-[#3D3480] block mb-1">
                  Age Category
                </label>
                <div className="flex gap-2">
                  {['kitten', 'adult', 'senior'].map((age, i) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setNewCatAge(age)}
                      style={{ transform: `rotate(${i === 0 ? -1 : i === 2 ? 1 : 0}deg)` }}
                      className={`flex-1 py-2 border-2 border-[#1A1A2E] font-black text-sm uppercase transition-all ${
                        newCatAge === age
                          ? 'bg-[#1A1A2E] text-[#FFD700]'
                          : 'bg-white text-[#1A1A2E] hover:bg-[#FFFBF0]'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-[#FF3366] text-sm font-black border-2 border-[#FF3366] p-2 rotate-[1deg]" role="alert">{error}</p>
              )}

              <button
                type="submit"
                disabled={addLoading}
                className="w-full bg-[#FF3366] text-white font-impact text-xl py-3 border-4 border-[#1A1A2E] uppercase shadow-[6px_6px_0px_#1A1A2E] rotate-[1deg] hover:rotate-[0deg] hover:scale-105 transition-all disabled:opacity-50"
              >
                {addLoading ? 'Adding...' : 'Add Cat'}
              </button>
            </form>
          )}
        </section>

        {/* Selected cat content */}
        {selectedCat && (
          <section className="space-y-8" aria-label={`${selectedCat.name} details`}>
            <CatProfileCard cat={selectedCat} predictions={predictions} />

            {feedingReminder && (
              <div className="bg-[#FFD700] border-4 border-[#1A1A2E] p-3 font-black text-sm shadow-[4px_4px_0px_#FF3366] rotate-[-1deg]" role="alert">
                🍽️ {feedingReminder}
              </div>
            )}

            <PredictionForm
              cat={selectedCat}
              predictions={predictions}
              unlockedIds={unlockedIds}
              onPrediction={handlePrediction}
              onAchievementUnlock={handleAchievementUnlock}
            />

            {latestResult && (
              <ResultCard result={latestResult} cat={selectedCat} onConfirm={handleConfirm} />
            )}

            <PredictionHistory predictions={predictions} onDelete={handleDeletePrediction} />

            <ConspiracyReport
              cat={selectedCat}
              predictions={predictions}
              unlockedIds={unlockedIds}
              onAchievementUnlock={handleConspiracyAchievement}
            />

            <AchievementGallery unlockedIds={unlockedIds} />
            <HealthLog cat={selectedCat} />
            <VetReport cat={selectedCat} predictions={predictions} healthLogs={healthLogs} />
          </section>
        )}
      </main>

      <footer className="border-t-4 border-[#1A1A2E] bg-[#1A1A2E] px-4 py-4 mt-8 text-center">
        <p className="text-xs font-mono text-[#FFD700]">
          Purridiction · #HackTheKitty 2026 · World Cat Domination Day 👑
        </p>
      </footer>
    </div>
  )
}
