import {
  HabitData,
  saveHabitData,
  getTodayString,
  calculateStreakReset,
} from "./storage";

export const BADGES = {
  "first-day": {
    name: "First Step",
    icon: "🎯",
    description: "Complete your first day!",
  },
  "week-warrior": {
    name: "Week Warrior",
    icon: "🔥",
    description: "7 days in a row!",
  },
  champion: { name: "Champion", icon: "🏆", description: "30 days strong!" },
  legend: { name: "Legend", icon: "👑", description: "100 days unstoppable!" },
  "comeback-king": {
    name: "Comeback King",
    icon: "💪",
    description: "Bounced back after a reset!",
  },
} as const;

export const checkBadgeEarned = (
  oldData: HabitData,
  newData: HabitData,
): string[] => {
  const newBadges: string[] = [];

  // First day badge
  if (newData.currentStreak === 1 && !oldData.badges.includes("first-day")) {
    newBadges.push("first-day");
  }

  // Week warrior badge
  if (newData.currentStreak >= 7 && !oldData.badges.includes("week-warrior")) {
    newBadges.push("week-warrior");
  }

  // Champion badge
  if (newData.currentStreak >= 30 && !oldData.badges.includes("champion")) {
    newBadges.push("champion");
  }

  // Legend badge
  if (newData.currentStreak >= 100 && !oldData.badges.includes("legend")) {
    newBadges.push("legend");
  }

  // Comeback badge (started a new streak after having one before)
  if (
    newData.currentStreak === 1 &&
    oldData.bestStreak > 0 &&
    oldData.currentStreak === 0 &&
    !oldData.badges.includes("comeback-king")
  ) {
    newBadges.push("comeback-king");
  }

  return newBadges;
};

export const completeHabitToday = (currentData: HabitData): HabitData => {
  const today = getTodayString();

  // Check if streak should reset due to missing days
  const shouldReset = calculateStreakReset(currentData);

  const newStreak = shouldReset ? 1 : currentData.currentStreak + 1;

  const newData: HabitData = {
    ...currentData,
    currentStreak: newStreak,
    bestStreak: Math.max(currentData.bestStreak, newStreak),
    lastCheckIn: today,
    totalCompletions: currentData.totalCompletions + 1,
    history: [
      ...currentData.history.filter((h) => h.date !== today),
      { date: today, completed: true },
    ].sort((a, b) => b.date.localeCompare(a.date)),
  };

  // Check for new badges
  const newBadges = checkBadgeEarned(currentData, newData);
  newData.badges = [...currentData.badges, ...newBadges];

  saveHabitData(newData);
  return newData;
};

export const skipHabitToday = (currentData: HabitData): HabitData => {
  const today = getTodayString();

  const newData: HabitData = {
    ...currentData,
    currentStreak: 0,
    lastCheckIn: today,
    history: [
      ...currentData.history.filter((h) => h.date !== today),
      { date: today, completed: false },
    ].sort((a, b) => b.date.localeCompare(a.date)),
  };

  saveHabitData(newData);
  return newData;
};

export const updateHabitName = (
  currentData: HabitData,
  name: string,
): HabitData => {
  const newData = { ...currentData, name };
  saveHabitData(newData);
  return newData;
};

export const getMotivationalMessage = (streak: number): string => {
  if (streak === 0) return "Ready to start your journey? 🚀";
  if (streak === 1) return "Great start! Keep it going! 🎯";
  if (streak < 7) return "You're building momentum! 🔥";
  if (streak < 30) return "You're crushing it! 💪";
  if (streak < 100) return "Absolutely unstoppable! 🏆";
  return "You're a true legend! 👑";
};

export const getStreakColor = (streak: number): string => {
  if (streak === 0) return "text-gray-500";
  if (streak < 7) return "text-orange-500";
  if (streak < 30) return "text-purple-500";
  if (streak < 100) return "text-blue-500";
  return "text-yellow-500";
};
