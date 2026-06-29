import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const getLocalToday = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: userTimezone })
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('id-ID', { timeZone: userTimezone, hour: '2-digit', minute: '2-digit', hour12: false })
}

const getTimeSince = (timestamp) => {
  if (!timestamp) return 'Not logged today'
  const diff = Date.now() - new Date(timestamp).getTime()
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  if (hours === 0) return `${minutes}m ago`
  if (minutes === 0) return `${hours}h ago`
  return `${hours}h ${minutes}m ago`
}

const getTimeSinceMs = (log) => {
  if (!log) return Infinity
  return Date.now() - new Date(log.logged_at).getTime()
}

const ACTIVITIES = [
  { type: 'meal', emoji: '🍽️', label: 'FED', bg: '#FFD700', color: '#1A1A2E' },
  { type: 'water', emoji: '💧', label: 'WATER', bg: '#00CFFF', color: '#1A1A2E' },
  { type: 'poop', emoji: '💩', label: 'POOPED', bg: '#FF6B00', color: 'white' },
  { type: 'play', emoji: '🎮', label: 'PLAYED', bg: '#00FF88', color: '#1A1A2E' },
]

export default function ActivityTracker({ cat, session, onActivityUpdate }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [localTime, setLocalTime] = useState(new Date().toLocaleTimeString('id-ID', { timeZone: userTimezone, hour: '2-digit', minute: '2-digit', hour12: false }))

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('cat_id', cat.id)
        .order('logged_at', { ascending: false })
        .limit(50)
      if (error) throw error
      setLogs(data || [])
    } catch (err) {
      console.error('Activity fetch failed:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 60000)
    return () => clearInterval(interval)
  }, [cat.id])

  useEffect(() => {
    const t = setInterval(() => {
      setLocalTime(new Date().toLocaleTimeString('id-ID', { timeZone: userTimezone, hour: '2-digit', minute: '2-digit', hour12: false }))
    }, 60000)
    return () => clearInterval(t)
  }, [])

  // Filter today's logs
  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.logged_at).toLocaleDateString('en-CA', { timeZone: userTimezone })
    return logDate === getLocalToday()
  })

  const todayMeals = todayLogs.filter(l => l.activity_type === 'meal').length
  const todayWater = todayLogs.filter(l => l.activity_type === 'water').length
  const todayPoops = todayLogs.filter(l => l.activity_type === 'poop').length
  const todayPlay = todayLogs.filter(l => l.activity_type === 'play').length

  const lastMeal = logs.find(l => l.activity_type === 'meal')
  const lastWater = logs.find(l => l.activity_type === 'water')
  const lastPoop = logs.find(l => l.activity_type === 'poop')
  const lastPlay = logs.find(l => l.activity_type === 'play')

  const counts = { meal: todayMeals, water: todayWater, poop: todayPoops, play: todayPlay }
  const lasts = { meal: lastMeal, water: lastWater, poop: lastPoop, play: lastPlay }

  // Propagate activity data to parent
  useEffect(() => {
    if (onActivityUpdate) {
      onActivityUpdate({
        lastMealHour: lastMeal ? new Date(lastMeal.logged_at).getHours() : null,
        playedToday: todayPlay > 0,
        mealsToday: todayMeals,
        poopsToday: todayPoops,
        waterToday: todayWater,
      })
    }
  }, [todayMeals, todayPlay, todayPoops, todayWater, lastMeal?.logged_at])

  const logActivity = async (type) => {
    try {
      const { error } = await supabase.from('activity_logs').insert([{
        cat_id: cat.id,
        user_id: session.user.id,
        activity_type: type,
        logged_at: new Date().toISOString(),
      }])
      if (!error) fetchLogs()
    } catch (err) {
      console.error('Log activity failed:', err.message)
    }
  }

  const undoActivity = async (logId, type) => {
    if (!window.confirm(`Undo last ${type} log?`)) return
    try {
      await supabase.from('activity_logs').delete().eq('id', logId)
      fetchLogs()
    } catch (err) {
      console.error('Undo failed:', err.message)
    }
  }

  const currentHour = new Date().getHours()

  // Alerts
  const alerts = []
  if (!lastMeal || getTimeSinceMs(lastMeal) > 6 * 3600000) {
    const hours = lastMeal ? Math.floor(getTimeSinceMs(lastMeal) / 3600000) : null
    alerts.push({ msg: hours ? `🚨 ${cat.name} hasn't eaten in ${hours}h. Chaos risk rising.` : `🚨 No meal logged for ${cat.name}.`, bg: '#FF3366', color: 'white' })
  }
  if (todayMeals === 0 && currentHour > 12) {
    alerts.push({ msg: `⚠️ No meals logged today. Is ${cat.name} on a hunger strike?`, bg: '#FF6B00', color: 'white' })
  }
  if (!lastPoop && currentHour > 14) {
    alerts.push({ msg: `💩 No poop logged today. Monitor closely.`, bg: '#FFD700', color: '#1A1A2E' })
  }
  if (todayPoops > 4) {
    alerts.push({ msg: `⚠️ Unusually high poop frequency today. Consider vet check.`, bg: '#FF6B00', color: 'white' })
  }

  if (loading) {
    return (
      <div style={{ border: '4px dashed #FFD700', transform: 'rotate(1deg)' }} className="p-6 text-center">
        <p className="font-mono text-sm text-[#FFD700]">Loading activity tracker...</p>
      </div>
    )
  }

  return (
    <div className="bg-[#FFFBF0] relative overflow-hidden"
      style={{ border: '5px solid #1A1A2E', boxShadow: '12px 12px 0 #FFD700', transform: 'rotate(1deg)' }}>

      {/* Header */}
      <div className="bg-[#1A1A2E] text-white p-4" style={{ borderBottom: '4px solid #FFD700', letterSpacing: '3px' }}>
        <p className="font-impact text-xl uppercase">Activity Tracker</p>
        <p className="text-xs mt-1 text-[#C4B5FD]" style={{ fontFamily: "'Comic Sans MS', cursive" }}>{cat.name}&apos;s day so far</p>
      </div>

      {/* Timezone/time */}
      <div className="px-4 py-2 flex items-center justify-between" style={{ background: 'rgba(0,207,255,0.1)', borderBottom: '2px solid #00CFFF' }}>
        <span className="font-mono text-[10px] text-[#00CFFF]">📍 {userTimezone}</span>
        <span className="font-mono text-[10px] text-[#00CFFF]">🕐 {localTime}</span>
      </div>

      {/* Quick log buttons */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {ACTIVITIES.map((a) => (
          <button key={a.type} onClick={() => logActivity(a.type)}
            className="relative text-center py-5 px-4 active:scale-95 transition-transform"
            style={{ backgroundColor: a.bg, color: a.color, border: '4px solid #1A1A2E', boxShadow: '6px 6px 0 #1A1A2E' }}>
            <p className="text-4xl mb-1">{a.emoji}</p>
            <p className="font-impact text-sm uppercase">{a.label}</p>
            {counts[a.type] > 0 && (
              <span className="absolute top-2 right-2 w-6 h-6 bg-[#FF3366] text-white font-impact text-xs rounded-full border-2 border-[#1A1A2E] flex items-center justify-center">
                {counts[a.type]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        {ACTIVITIES.map((a, i) => (
          <div key={a.type} className="bg-white p-3" style={{ border: '2px solid #1A1A2E', boxShadow: '3px 3px 0 #1A1A2E', transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}>
            <p className="text-sm">{a.emoji} <span className="font-impact text-3xl" style={{ color: a.bg === '#FFD700' ? '#1A1A2E' : a.bg }}>{counts[a.type]}</span><span className="font-mono text-[10px] text-[#6B7280]">x</span></p>
            <p className="font-mono text-[10px] text-[#6B7280] mt-1">Last: {getTimeSince(lasts[a.type]?.logged_at)}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="px-4 pb-4 space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className="p-3 font-impact text-sm uppercase"
              style={{ backgroundColor: alert.bg, color: alert.color, border: '3px solid #1A1A2E', boxShadow: '4px 4px 0 #1A1A2E', transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}>
              {alert.msg}
            </div>
          ))}
        </div>
      )}

      {/* Activity log timeline */}
      {todayLogs.length > 0 && (
        <div className="px-4 pb-4">
          <div style={{ borderTop: '3px solid #1A1A2E', maxHeight: '200px', overflowY: 'auto' }}>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#3D3480] py-2">Today&apos;s Log</p>
            {todayLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 px-1" style={{ borderBottom: '1px solid #e5e7eb' }}>
                <span className="font-mono text-xs text-[#3D3480]">{formatTime(log.logged_at)}</span>
                <span className="font-body text-sm">{ACTIVITIES.find(a => a.type === log.activity_type)?.emoji} {log.activity_type}</span>
                <button onClick={() => undoActivity(log.id, log.activity_type)}
                  className="font-mono text-[10px] text-[#9CA3AF] hover:text-[#FF3366] transition-colors cursor-pointer">
                  ↩ undo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
