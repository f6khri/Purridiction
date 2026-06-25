export function buildVetReportPrompt(cat, predictions, healthLogs) {
  const predSummary = predictions.slice(0, 7).map((p, i) =>
    `Day ${i + 1}: chaos score ${p.chaos_score}, genre: ${p.chaos_genre}, confirmed: ${p.confirmed_accurate ?? "not confirmed"}`
  ).join("\n");

  const healthSummary = healthLogs.slice(0, 7).map((log, i) =>
    `Day ${i + 1} (${log.logged_at}): meals=${log.meals_eaten}, water=${log.water_intake}, litter=${log.litter_visits}, mood=${log.mood}${log.notes ? `, notes: ${log.notes}` : ""}`
  ).join("\n");

  return `You are helping a cat owner prepare a clear summary for their veterinarian.
Write a professional but friendly behavior and health summary for the past 7 days.
Do not diagnose. Just summarize patterns clearly so a vet can understand the cat's recent state.

Cat: ${cat.name} (${cat.age_category})

Behavior data (chaos predictions):
${predSummary || "No prediction data available."}

Health log data:
${healthSummary || "No health log data available."}

Write the summary in 3 short paragraphs:
1. Behavioral patterns observed (activity level, chaos trends, peak times)
2. Health observations (eating, drinking, litter habits, mood patterns)
3. Any notable changes or things the vet should be aware of

Keep it under 200 words. Use clear, plain language. No bullet points.`;
}
