export function getThreatLevel(avgChaosScore) {
  if (avgChaosScore >= 80) return { level: "BLACK", color: "#1A1A1A", textColor: "#FFFFFF" };
  if (avgChaosScore >= 60) return { level: "RED", color: "#FF4500", textColor: "#FFFFFF" };
  if (avgChaosScore >= 40) return { level: "ORANGE", color: "#FF8C00", textColor: "#1A1A1A" };
  if (avgChaosScore >= 20) return { level: "YELLOW", color: "#FFD700", textColor: "#1A1A1A" };
  return { level: "GREEN", color: "#00C896", textColor: "#1A1A1A" };
}

export function calculateReportMetrics(predictions, cat) {
  const totalPredictions = predictions.length;

  const averageChaos = Math.round(
    predictions.reduce((sum, p) => sum + p.chaos_score, 0) / totalPredictions
  );

  const genreCounts = predictions.reduce((acc, p) => {
    acc[p.chaos_genre] = (acc[p.chaos_genre] || 0) + 1;
    return acc;
  }, {});
  const dominantGenre = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])[0][0];

  const topWeapons = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([genre]) => genre);

  const windowCounts = predictions.reduce((acc, p) => {
    acc[p.predicted_window] = (acc[p.predicted_window] || 0) + 1;
    return acc;
  }, {});
  const peakChaosWindow = Object.entries(windowCounts)
    .sort((a, b) => b[1] - a[1])[0][0];

  const confirmed = predictions.filter(p => p.confirmed_accurate === true).length;
  const predictionAccuracy = Math.round((confirmed / totalPredictions) * 100);

  const coupProbability = Math.min(
    Math.round((averageChaos * 0.7) + (predictionAccuracy * 0.3)),
    99
  );

  const threat = getThreatLevel(averageChaos);

  return {
    catName: cat.name,
    ageCategory: cat.age_category,
    totalPredictions,
    averageChaos,
    dominantGenre,
    topWeapons,
    peakChaosWindow,
    predictionAccuracy,
    coupProbability,
    threatLevel: threat.level,
    threatColor: threat.color,
    threatTextColor: threat.textColor,
  };
}

export function buildConspiracyPrompt(metrics) {
  return `You are a senior analyst at the International Feline Intelligence Bureau (IFIB).
You have been tasked with producing a classified threat assessment report on a domestic cat.
Write in the style of a deadpan, overly serious intelligence document. Be funny but never break character.

Subject data:
- Name: ${metrics.catName}
- Age Category: ${metrics.ageCategory}
- Threat Level: ${metrics.threatLevel}
- Average Chaos Score: ${metrics.averageChaos}/100
- Total Observations: ${metrics.totalPredictions}
- Dominant Behavior Pattern: ${metrics.dominantGenre}
- Primary Weapons: ${metrics.topWeapons.join(", ")}
- Peak Activity Window: ${metrics.peakChaosWindow}
- Prediction Accuracy Rate: ${metrics.predictionAccuracy}%
- Estimated Coup Probability: ${metrics.coupProbability}%

Produce a structured intelligence report with exactly these sections:
1. THREAT SUMMARY (2-3 sentences, behavioral overview)
2. PRIMARY WEAPONS (list the weapons with 1 sentence each explaining the threat)
3. STRATEGIC ANALYSIS (2-3 sentences on infiltration patterns and household vulnerability)
4. COUP PROBABILITY: ${metrics.coupProbability}%
5. FIELD RECOMMENDATIONS (2 actionable recommendations for the human)

Maximum 300 words total. Keep it classified, funny, and deadpan.`;
}
