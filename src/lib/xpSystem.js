export const XP_RULES = {
  basePerPrediction: 10,
  accurateConfirmBonus: 25,
  dailyStreakBonus: 15,
};

export function calculateLevel(totalXP) {
  return Math.floor(Math.sqrt(totalXP / 50)) + 1;
}

export function xpToNextLevel(totalXP) {
  const currentLevel = calculateLevel(totalXP);
  const nextLevelXP = Math.pow(currentLevel, 2) * 50;
  const currentLevelXP = Math.pow(currentLevel - 1, 2) * 50;
  return {
    current: totalXP - currentLevelXP,
    needed: nextLevelXP - currentLevelXP,
    remaining: nextLevelXP - totalXP,
  };
}
