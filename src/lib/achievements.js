export const ACHIEVEMENTS = [
  {
    id: "first_blood",
    title: "First Blood",
    description: "Made your first chaos prediction",
    emoji: "🩸",
    check: (predictions) => predictions.length >= 1,
  },
  {
    id: "midnight_menace",
    title: "Midnight Menace",
    description: "Got Midnight Zoomies 5 times",
    emoji: "🌙",
    check: (predictions) =>
      predictions.filter(p => p.chaos_genre === "Midnight Zoomies").length >= 5,
  },
  {
    id: "calm_before_storm",
    title: "The Calm Before The Storm",
    description: "Went from chaos score under 20 to over 90 between predictions",
    emoji: "⛈️",
    check: (predictions) => {
      for (let i = 1; i < predictions.length; i++) {
        if (predictions[i - 1].chaos_score < 20 && predictions[i].chaos_score > 90) return true;
      }
      return false;
    },
  },
  {
    id: "domination_complete",
    title: "Domination Complete",
    description: "Unlocked all 8 chaos genres",
    emoji: "👑",
    check: (predictions) => {
      const genres = new Set(predictions.map(p => p.chaos_genre));
      return genres.size >= 8;
    },
  },
  {
    id: "week_streak",
    title: "7-Day Tyrant",
    description: "Made predictions for 7 days in a row",
    emoji: "🔥",
    check: (predictions) => {
      const dates = [...new Set(predictions.map(p =>
        new Date(p.created_at).toDateString()
      ))].sort((a, b) => new Date(a) - new Date(b));
      let streak = 1, maxStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const diff = (new Date(dates[i]) - new Date(dates[i - 1])) / 86400000;
        if (diff === 1) { streak++; maxStreak = Math.max(maxStreak, streak); }
        else streak = 1;
      }
      return maxStreak >= 7;
    },
  },
  {
    id: "intelligence_breach",
    title: "Intelligence Breach",
    description: "Generated your first Cat Conspiracy Report",
    emoji: "🕵️",
    check: (predictions, meta) => meta?.conspiracyGenerated === true,
  },
  {
    id: "court_in_session",
    title: "Court Is In Session",
    description: "Took your cat to Chaos Court",
    emoji: "⚖️",
    check: (predictions, meta) => meta?.courtUsed === true,
  },
];

export function checkAchievements(predictions, unlockedIds, meta = {}) {
  return ACHIEVEMENTS.filter(a =>
    !unlockedIds.includes(a.id) && a.check(predictions, meta)
  );
}
