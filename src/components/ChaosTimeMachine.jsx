import { useState } from 'react'

function getScoreColor(score) {
  if (score >= 80) return '#FF3366'
  if (score >= 60) return '#FF6B00'
  if (score >= 40) return '#3D3480'
  return '#00FF88'
}

export default function ChaosTimeMachine({ predictions }) {
  const [selectedDate, setSelectedDate] = useState(null)

  if (predictions.length === 0) {
    return (
      <div className="border-4 border-dashed border-[#FF6B00] p-4 text-center rotate-[1deg]">
        <p className="font-impact text-lg text-[#FF6B00] uppercase">⏰ No chaos recorded yet. Start predicting!</p>
      </div>
    )
  }

  // Group by date
  const groups = {}
  for (const pred of predictions) {
    const date = new Date(pred.created_at).toISOString().split('T')[0]
    if (!groups[date]) groups[date] = []
    groups[date].push(pred)
  }

  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a))

  const formatChipDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatHeaderDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const selectedPredictions = selectedDate ? (groups[selectedDate] || []) : []
  const dayAvg = selectedPredictions.length > 0
    ? Math.round(selectedPredictions.reduce((s, p) => s + p.chaos_score, 0) / selectedPredictions.length)
    : 0

  return (
    <div className="bg-[#FFFBF0] border-[5px] border-[#1A1A2E] rotate-[-1deg] overflow-hidden"
      style={{ boxShadow: '10px 10px 0 #FF6B00' }}>

      {/* Title */}
      <div className="p-4 pb-2">
        <h3 className="font-impact text-2xl text-[#FF6B00] uppercase"
          style={{ textShadow: '2px 2px 0 rgba(255,107,0,0.2)' }}>
          ⏰ Chaos Time Machine
        </h3>
      </div>

      {/* Date chips */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sortedDates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date === selectedDate ? null : date)}
              className={`flex-shrink-0 font-mono text-sm px-3 py-2 border-2 transition-all ${
                selectedDate === date
                  ? 'bg-[#FF3366] text-white border-[#FF3366]'
                  : 'bg-white text-[#1A1A2E] border-[#1A1A2E] hover:bg-[#FFFBF0]'
              }`}
            >
              {formatChipDate(date)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {!selectedDate && (
          <p style={{ fontFamily: "'Comic Sans MS', cursive" }} className="text-[#3D3480] text-sm text-center py-4 italic">
            Select a date to travel back in time 🕰️
          </p>
        )}

        {selectedDate && (
          <div>
            {/* Date header */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-impact text-3xl text-[#1A1A2E]">{formatHeaderDate(selectedDate)}</h4>
              <div className="text-right">
                <p className="font-mono text-[10px] text-[#3D3480] uppercase">Day Avg</p>
                <p className="font-impact text-2xl" style={{ color: getScoreColor(dayAvg) }}>{dayAvg}</p>
              </div>
            </div>

            {/* Prediction list */}
            <div className="space-y-2">
              {selectedPredictions.map((pred, i) => (
                <div key={pred.id || i} className="border-l-4 border-[#FF3366] pl-3 py-2 flex items-center gap-3">
                  {/* Score badge */}
                  <div className="w-10 h-10 flex items-center justify-center border-2 border-[#1A1A2E] font-impact text-sm"
                    style={{ backgroundColor: getScoreColor(pred.chaos_score), color: pred.chaos_score >= 60 ? 'white' : '#1A1A2E' }}>
                    {pred.chaos_score}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-impact text-sm text-[#1A1A2E] uppercase truncate">{pred.chaos_genre}</p>
                    <p className="font-mono text-[10px] text-[#3D3480]">{formatTime(pred.created_at)}</p>
                  </div>

                  {/* Confirmed status */}
                  <span className="text-lg">
                    {pred.confirmed_accurate === true && '✅'}
                    {pred.confirmed_accurate === false && '❌'}
                    {pred.confirmed_accurate === null && '❓'}
                  </span>
                </div>
              ))}
            </div>

            {/* Day summary */}
            <div className="mt-3 pt-3 border-t-2 border-[#1A1A2E]/10">
              <p className="font-mono text-[10px] text-[#3D3480]">
                {selectedPredictions.length} prediction{selectedPredictions.length !== 1 ? 's' : ''} · avg score: {dayAvg}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
