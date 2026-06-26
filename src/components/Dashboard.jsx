import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { callGemini } from '../lib/gemini'
import CatProfileCard from './CatProfileCard'
import PredictionForm from './PredictionForm'
import ResultCard from './ResultCard'
import PredictionHistory from './PredictionHistory'
import AchievementGallery from './AchievementGallery'
import HealthLog from './HealthLog'
import VetReport from './VetReport'
import ConspiracyReport from './ConspiracyReport'

const CAT_COLORS = ['#FF3366', '#00CFFF', '#FFD700', '#00FF88', '#FF6B00', '#3D3480']
const CAT_ROTATIONS = [-2, 1.5, -1, 2.5, -1.5, 2]

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
      const { data, error: e } = await supabase.from('cats').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true })
      if (e) throw e
      setCats(data || [])
      if (data?.length > 0) setSelectedCat(prev => prev || data[0])
    } catch (err) { console.error(err.message) }
  }, [session.user.id])

  const fetchPredictions = useCallback(async (catId) => {
    try {
      const { data, error: e } = await supabase.from('chaos_predictions').select('*').eq('cat_id', catId).order('created_at', { ascending: false })
      if (e) throw e
      setPredictions(data || [])
    } catch (err) { console.error(err.message) }
  }, [])

  const fetchAchievements = useCallback(async (catId) => {
    try {
      const { data, error: e } = await supabase.from('cat_achievements').select('achievement_id').eq('cat_id', catId)
      if (e) throw e
      setUnlockedIds((data || []).map(a => a.achievement_id))
    } catch (err) { console.error(err.message) }
  }, [])

  const fetchHealthLogs = useCallback(async (catId) => {
    try {
      const { data, error: e } = await supabase.from('health_logs').select('*').eq('cat_id', catId).order('logged_at', { ascending: false }).limit(7)
      if (e) throw e
      setHealthLogs(data || [])
    } catch (err) { console.error(err.message) }
  }, [])

  useEffect(() => { fetchCats() }, [fetchCats])
  useEffect(() => {
    if (selectedCat) { fetchPredictions(selectedCat.id); fetchAchievements(selectedCat.id); fetchHealthLogs(selectedCat.id) }
    else { setPredictions([]); setUnlockedIds([]); setHealthLogs([]) }
    setLatestResult(null)
  }, [selectedCat?.id, fetchPredictions, fetchAchievements, fetchHealthLogs])

  const handleGenerateName = async () => {
    setGeneratingName(true)
    try {
      const prompt = `Generate a single dramatic cat name for a cat with world domination ambitions.\nAge category: ${newCatAge}\nRules:\n- kitten: cute but ambitious titles like Admiral, Baron, Captain\n- adult: commanding titles like Commander, General, Lord\n- senior: ancient emperor titles like Emperor, Grand Overlord, Ancient Lord\nFormat: [Title] [Name] like Admiral Fluffington or Lord Shadowpaw.\nOne name only. No explanation. No punctuation at the end.`
      const narration = await callGemini(prompt)
      const name = narration.trim().slice(0, 30)
      if (name) setNewCatName(name)
    } catch { /* silently fail */ } finally { setGeneratingName(false) }
  }

  const handleAddCat = async (e) => {
    e.preventDefault(); setError(null)
    const trimmedName = newCatName.trim()
    if (!trimmedName) { setError('Cat name is required.'); return }
    if (trimmedName.length > 30) { setError('Max 30 chars.'); return }
    if (!['kitten', 'adult', 'senior'].includes(newCatAge)) { setError('Invalid age.'); return }
    setAddLoading(true)
    try {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (!s) return
      const { data, error: e } = await supabase.from('cats').insert([{ user_id: s.user.id, name: trimmedName, age_category: newCatAge, total_xp: 0 }]).select().single()
      if (e) throw e
      setCats(prev => [...prev, data]); setSelectedCat(data); setNewCatName(''); setNewCatAge('adult'); setShowAddForm(false)
    } catch (err) { setError(err.message) } finally { setAddLoading(false) }
  }

  const handleSelectCat = (cat) => { if (cat.id !== selectedCat?.id) setSelectedCat(cat) }
  const handlePrediction = (result) => { setLatestResult(result); setPredictions(prev => [result, ...prev]); setSelectedCat(prev => ({ ...prev, total_xp: result.newTotalXP })); setCats(prev => prev.map(c => c.id === selectedCat.id ? { ...c, total_xp: result.newTotalXP } : c)) }
  const handleConfirm = (id, accurate) => { setPredictions(prev => prev.map(p => p.id === id ? { ...p, confirmed_accurate: accurate } : p)); if (accurate) { const x = (selectedCat.total_xp||0)+25; setSelectedCat(prev => ({...prev, total_xp: x})); setCats(prev => prev.map(c => c.id === selectedCat.id ? {...c, total_xp: x} : c)) }; if (latestResult?.id === id) setLatestResult(prev => ({...prev, confirmed_accurate: accurate})) }
  const handleDeletePrediction = (id) => { setPredictions(prev => prev.filter(p => p.id !== id)); if (latestResult?.id === id) setLatestResult(null) }
  const showAchievementToast = useCallback((a) => { setToast(a); setTimeout(() => setToast(null), 4000) }, [])
  const handleAchievementUnlock = (a) => { setUnlockedIds(prev => [...prev, a.id]); showAchievementToast(a) }
  const handleConspiracyAchievement = (id) => { if (!unlockedIds.includes(id)) { setUnlockedIds(prev => [...prev, id]); showAchievementToast({ id, title: "Intelligence Breach", emoji: "🕵️", description: "Generated your first Cat Conspiracy Report" }) } }
  const handleLogout = async () => { await supabase.auth.signOut() }

  const getFeedingReminder = () => {
    if (predictions.length === 0) return null
    const l = predictions[0]
    if (!l.input_data?.lastMealHour && l.input_data?.lastMealHour !== 0) return null
    const h = (new Date().getHours() - l.input_data.lastMealHour + 24) % 24
    return h >= 6 ? `⚠️ ${h} hours since ${selectedCat.name} last ate. CHAOS RISK: RISING.` : null
  }
  const feedingReminder = selectedCat ? getFeedingReminder() : null

  return (
    <div className="min-h-screen bg-[#FFFBF0]">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 border-[5px] border-[#1A1A2E] bg-[#FFD700] p-4 max-w-xs rotate-[3deg]"
          style={{ boxShadow: '8px 8px 0 #FF3366', animation: 'slideInRight 0.4s ease-out' }}
          role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <span className="text-4xl" aria-hidden="true">{toast.emoji}</span>
            <div>
              <p className="font-impact text-sm uppercase text-[#1A1A2E]">Achievement Unlocked!</p>
              <p className="text-xs font-black text-[#1A1A2E] mt-1">{toast.title}</p>
              <p className="font-mono text-[10px] text-[#3D3480] mt-0.5">{toast.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#1A1A2E] px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '5px solid #FFD700' }}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="w-10 h-10 rotate-[-5deg] hover:rotate-[5deg] transition-transform duration-300" aria-hidden="true" />
          <h1 className="font-impact text-2xl text-[#FFD700] uppercase"
            style={{ letterSpacing: '4px', textShadow: '3px 0 #FF3366, -3px 0 #00CFFF', animation: 'glitch 4s infinite' }}>
            Purridiction
          </h1>
        </div>
        <button onClick={handleLogout}
          className="font-impact text-sm bg-[#FF3366] text-white border-2 border-white px-3 py-1 uppercase rotate-[2deg] hover:rotate-[-1deg] transition-transform"
          style={{ boxShadow: '4px 4px 0 #FFD700' }}>
          Logout
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        {/* Cat Management */}
        <section aria-label="Cat management">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-impact text-3xl text-[#3D3480] uppercase rotate-[-1deg] inline-block"
              style={{ textShadow: '3px 3px 0 rgba(61,52,128,0.2)' }}>Your Cats</h2>
            <button onClick={() => { setShowAddForm(!showAddForm); setError(null) }}
              className="font-black text-sm uppercase px-3 py-2 border-2 border-[#1A1A2E] rotate-[3deg] hover:rotate-[0deg] transition-transform"
              style={{ fontFamily: "'Comic Sans MS', cursive", backgroundColor: '#00FF88', boxShadow: '4px 4px 0 #1A1A2E' }}>
              {showAddForm ? 'Cancel' : '+ Add Cat'}
            </button>
          </div>

          {cats.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4" role="tablist">
              {cats.map((cat, i) => (
                <button key={cat.id} onClick={() => handleSelectCat(cat)} role="tab" aria-selected={selectedCat?.id === cat.id}
                  style={{ backgroundColor: selectedCat?.id === cat.id ? CAT_COLORS[i % CAT_COLORS.length] : '#FFFBF0', transform: `rotate(${CAT_ROTATIONS[i % CAT_ROTATIONS.length]}deg)`, boxShadow: '4px 4px 0 #1A1A2E' }}
                  className={`px-4 py-2 border-2 border-[#1A1A2E] font-impact text-sm uppercase hover:scale-110 transition-transform ${selectedCat?.id === cat.id ? 'text-white' : 'text-[#1A1A2E]'}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {cats.length === 0 && !showAddForm && (
            <div className="border-4 border-dashed border-[#3D3480] p-8 text-center rotate-[-1deg]">
              <p style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-[#3D3480] text-lg">No cats yet. Add your first cat to start predicting chaos. 🐱</p>
            </div>
          )}

          {showAddForm && (
            <form onSubmit={handleAddCat} className="border-[5px] border-[#3D3480] p-6 bg-white space-y-4 rotate-[-1.5deg]"
              style={{ boxShadow: '12px 12px 0 #FFD700' }}>
              <div>
                <label htmlFor="cat-name" className="font-mono text-[10px] uppercase tracking-widest text-[#3D3480] block mb-1">Cat Name</label>
                <div className="flex gap-2">
                  <input id="cat-name" type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Lord Whiskers" required maxLength={30}
                    className="flex-1 border-2 border-[#1A1A2E] p-2 text-sm font-body bg-white" />
                  <button type="button" onClick={handleGenerateName} disabled={generatingName}
                    className="bg-[#00CFFF] text-[#1A1A2E] font-impact text-sm border-2 border-[#1A1A2E] px-3 py-2 rotate-[2deg] hover:rotate-[0deg] transition-transform disabled:opacity-50"
                    style={{ boxShadow: '3px 3px 0 #3D3480' }}>
                    {generatingName ? '...' : '✨ Generate'}
                  </button>
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#3D3480] block mb-1">Age Category</label>
                <div className="flex gap-2">
                  {['kitten', 'adult', 'senior'].map((age, i) => (
                    <button key={age} type="button" onClick={() => setNewCatAge(age)}
                      style={{ transform: `rotate(${i === 0 ? -2 : i === 2 ? 2 : 0}deg)` }}
                      className={`flex-1 py-2 border-2 border-[#1A1A2E] font-impact text-sm uppercase ${newCatAge === age ? 'bg-[#1A1A2E] text-[#FFD700]' : 'bg-white text-[#1A1A2E]'}`}>
                      {age}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-[#FF3366] text-sm font-black border-2 border-[#FF3366] p-2 rotate-[1deg]" role="alert">{error}</p>}
              <button type="submit" disabled={addLoading}
                className="w-full bg-[#FF3366] text-white font-impact text-xl py-4 border-4 border-[#1A1A2E] uppercase rotate-[1deg] hover:rotate-[0deg] transition-all disabled:opacity-50"
                style={{ boxShadow: '8px 8px 0 #1A1A2E', animation: addLoading ? 'none' : undefined }}>
                {addLoading ? 'Adding...' : 'Add Cat'}
              </button>
            </form>
          )}
        </section>

        {selectedCat && (
          <section className="space-y-10" aria-label={`${selectedCat.name} details`}>
            <CatProfileCard cat={selectedCat} predictions={predictions} />
            {feedingReminder && (
              <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF3366] border-[5px] border-[#1A1A2E] p-3 font-impact text-sm text-white uppercase tracking-wide"
                style={{ boxShadow: '8px 8px 0 #1A1A2E', animation: 'shake 0.5s infinite' }} role="alert">
                {feedingReminder}
              </div>
            )}
            <PredictionForm cat={selectedCat} predictions={predictions} unlockedIds={unlockedIds} onPrediction={handlePrediction} onAchievementUnlock={handleAchievementUnlock} />
            {latestResult && <ResultCard result={latestResult} cat={selectedCat} onConfirm={handleConfirm} />}
            <PredictionHistory predictions={predictions} onDelete={handleDeletePrediction} />
            <ConspiracyReport cat={selectedCat} predictions={predictions} unlockedIds={unlockedIds} onAchievementUnlock={handleConspiracyAchievement} />
            <AchievementGallery unlockedIds={unlockedIds} />
            <HealthLog cat={selectedCat} />
            <VetReport cat={selectedCat} predictions={predictions} healthLogs={healthLogs} />
          </section>
        )}
      </main>

      <footer className="bg-[#1A1A2E] px-4 py-4 mt-8 text-center" style={{ borderTop: '5px solid #FFD700' }}>
        <p className="font-mono text-xs text-[#FFD700]">Purridiction · #HackTheKitty 2026 · World Cat Domination Day 👑</p>
      </footer>
    </div>
  )
}
