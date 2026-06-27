const WEATHER_EMOJI = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️' }
const WEATHER_TYPES = ['rainy', 'cloudy', 'sunny']

export default function WeatherCorrelation({ predictions }) {
  if (predictions.length < 5) {
    return (
      <div className="border-4 border-dashed border-[#00CFFF] p-4 text-center rotate-[1deg]">
        <p className="font-impact text-lg text-[#3D3480] uppercase">Weather Correlation Locked 🌧️</p>
        <p className="font-mono text-[10px] text-[#3D3480]/60 mt-1">
          Unlock after 5 predictions. Currently: {predictions.length}/5
        </p>
      </div>
    )
  }

  // Group by weather
  const groups = {}
  for (const type of WEATHER_TYPES) {
    const matching = predictions.filter(p => p.input_data?.weather === type)
    groups[type] = {
      count: matching.length,
      avgScore: matching.length > 0 ? Math.round(matching.reduce((s, p) => s + p.chaos_score, 0) / matching.length) : 0,
    }
  }

  const overallAvg = Math.round(predictions.reduce((s, p) => s + p.chaos_score, 0) / predictions.length)

  // Find highest and lowest
  const sorted = WEATHER_TYPES.filter(t => groups[t].count > 0).sort((a, b) => groups[b].avgScore - groups[a].avgScore)
  const highest = sorted[0] || 'sunny'
  const lowest = sorted[sorted.length - 1] || 'sunny'
  const diff = groups[highest].avgScore - groups[lowest].avgScore

  // Generate insight
  let insight
  if (diff < 10) {
    insight = "Chaotic regardless of weather. A true professional."
  } else if (highest === 'rainy') {
    insight = `${diff}% more chaotic when it rains.`
  } else if (highest === 'sunny') {
    insight = `${diff}% more chaotic on sunny days. Unusual specimen.`
  } else {
    insight = `Peaks during overcast conditions. Dramatic.`
  }

  // Max score for bar scaling
  const maxScore = Math.max(...WEATHER_TYPES.map(t => groups[t].avgScore), 1)

  return (
    <div className="bg-[#00CFFF] border-[5px] border-[#1A1A2E] rotate-[-1.5deg] overflow-hidden"
      style={{ boxShadow: '10px 10px 0 #3D3480' }}>

      {/* Title */}
      <div className="p-4 pb-2">
        <h3 className="font-impact text-2xl text-[#1A1A2E] uppercase tracking-wide">
          Weather Chaos Correlation
        </h3>
      </div>

      {/* Insight banner */}
      <div className="mx-4 mb-4 bg-[#1A1A2E] text-white p-4 rotate-[0.5deg]">
        <p className="font-impact text-lg uppercase">{insight}</p>
      </div>

      {/* Weather columns */}
      <div className="grid grid-cols-3 gap-3 px-4 pb-4">
        {WEATHER_TYPES.map((type) => (
          <div key={type} className="bg-white border-[3px] border-[#1A1A2E] p-4 text-center">
            <p className="text-3xl mb-2">{WEATHER_EMOJI[type]}</p>
            <p className="font-impact text-5xl text-[#1A1A2E] leading-none mb-1">
              {groups[type].avgScore}
            </p>
            <p className="font-mono text-[10px] text-[#3D3480] uppercase mb-3">
              {groups[type].count} predictions
            </p>
            {/* Bar */}
            <div className="w-full h-4 border border-[#1A1A2E] bg-[#FFFBF0]">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${(groups[type].avgScore / maxScore) * 100}%`,
                  backgroundColor: type === highest ? '#FF3366' : type === lowest ? '#00FF88' : '#FFD700',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Winner badge */}
      {groups[highest].count > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-[#FFD700] text-[#1A1A2E] font-impact text-sm px-4 py-2 border-[3px] border-[#1A1A2E] rotate-[2deg] inline-block uppercase">
            Most Chaos Weather: {WEATHER_EMOJI[highest]} {highest}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="px-4 pb-4">
        <p className="font-mono text-[10px] text-[#1A1A2E]/50">
          Based on {predictions.length} predictions · avg overall: {overallAvg}
        </p>
      </div>
    </div>
  )
}
