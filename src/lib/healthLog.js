export function validateHealthLog(inputs) {
  const { mealsEaten, waterIntake, litterVisits, mood } = inputs;
  if (mealsEaten < 0 || mealsEaten > 10) throw new Error("Invalid meals eaten");
  if (!["low", "normal", "high"].includes(waterIntake)) throw new Error("Invalid water intake");
  if (litterVisits < 0 || litterVisits > 20) throw new Error("Invalid litter visits");
  if (!["calm", "playful", "anxious", "aggressive", "lethargic"].includes(mood)) throw new Error("Invalid mood");
}

export function buildHealthInsightPrompt(cat, recentLogs) {
  const logSummary = recentLogs.map((log, i) =>
    `Day ${i + 1}: meals=${log.meals_eaten}, water=${log.water_intake}, litter=${log.litter_visits}, mood=${log.mood}${log.notes ? `, notes: ${log.notes}` : ""}`
  ).join("\n");

  return `You are a cat health assistant helping a concerned pet owner monitor their cat's wellbeing.
You are NOT a veterinarian and must not diagnose. You can only flag patterns worth watching.

Cat: ${cat.name} (${cat.age_category})
Recent health logs (newest first):
${logSummary}

Write exactly 2-3 sentences:
- Sentence 1: Observe the most notable pattern in the data (positive or concerning).
- Sentence 2: Give one specific, actionable suggestion the owner can act on today.
- Sentence 3 (optional): Add a gentle flag if anything warrants a vet visit, phrased as a suggestion not a warning.

Keep it warm, clear, and non-alarmist. Never diagnose.`;
}

export function getWaterIntakeFlag(recentLogs) {
  const last3 = recentLogs.slice(0, 3);
  return last3.length >= 3 && last3.every(l => l.water_intake === "low");
}

export function getMoodFlag(recentLogs) {
  const last2 = recentLogs.slice(0, 2);
  return last2.length >= 2 && last2.every(l => ["lethargic", "anxious"].includes(l.mood));
}
