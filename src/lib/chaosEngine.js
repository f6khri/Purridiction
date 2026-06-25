export const CHAOS_GENRES = [
  "Midnight Zoomies",
  "Ankle Assassination",
  "Knocking Things Off Tables",
  "Screaming Into The Void",
  "Aggressive Biscuit Making",
  "Unprovoked Sprinting",
  "Staring At Nothing For 10 Minutes",
  "Biting Hand That Feeds",
];

export function calculateChaosScore(inputs) {
  const { lastMealHour, playedToday, weather, ageCategory, hoursSlept } = inputs;
  let score = 0;

  const hoursSinceLastMeal = (new Date().getHours() - lastMealHour + 24) % 24;
  if (hoursSinceLastMeal >= 4 && hoursSinceLastMeal <= 6) score += 30;
  else if (hoursSinceLastMeal > 6) score += 20;
  else score += 5;

  if (!playedToday) score += 25;
  if (weather === "rainy") score += 15;
  else if (weather === "cloudy") score += 8;

  if (ageCategory === "kitten") score += 20;
  else if (ageCategory === "senior") score -= 10;

  if (hoursSlept >= 14) score += 15;
  else if (hoursSlept <= 8) score -= 5;

  return Math.min(Math.max(score, 0), 100);
}

export function predictChaosWindow(lastMealHour) {
  const peakHour = (lastMealHour + 5) % 24;
  const endHour = (peakHour + 2) % 24;
  const format = (h) => `${h % 12 || 12}:00 ${h < 12 ? "AM" : "PM"}`;
  return `${format(peakHour)} - ${format(endHour)}`;
}

export function assignChaosGenre(score, ageCategory) {
  if (score >= 80) return ageCategory === "kitten"
    ? "Unprovoked Sprinting"
    : "Midnight Zoomies";
  if (score >= 60) return "Ankle Assassination";
  if (score >= 40) return "Knocking Things Off Tables";
  if (score >= 20) return "Aggressive Biscuit Making";
  return "Staring At Nothing For 10 Minutes";
}

export function analyzeChaos(inputs) {
  const score = calculateChaosScore(inputs);
  const window = predictChaosWindow(inputs.lastMealHour);
  const genre = assignChaosGenre(score, inputs.ageCategory);
  return { score, window, genre };
}
