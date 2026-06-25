export const CAT_RANKS = [
  { min: 0, max: 19, title: "Sleepy Diplomat", emoji: "😴" },
  { min: 20, max: 39, title: "Mild Troublemaker", emoji: "😼" },
  { min: 40, max: 59, title: "Chaos Apprentice", emoji: "😈" },
  { min: 60, max: 79, title: "Domestic Menace", emoji: "👹" },
  { min: 80, max: 100, title: "Supreme Overlord", emoji: "👑" },
];

export function getCatRank(avgChaosScore) {
  return CAT_RANKS.find(r => avgChaosScore >= r.min && avgChaosScore <= r.max)
    || CAT_RANKS[0];
}
