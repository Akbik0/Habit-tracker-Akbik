import {
  Habit,
  AppData,
  saveAppData,
  getTodayString,
  calculateStreakReset,
  updateHabit,
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
  oldHabit: Habit,
  newHabit: Habit,
): string[] => {
  const newBadges: string[] = [];

  // First day badge
  if (newHabit.currentStreak === 1 && !oldHabit.badges.includes("first-day")) {
    newBadges.push("first-day");
  }

  // Week warrior badge
  if (
    newHabit.currentStreak >= 7 &&
    !oldHabit.badges.includes("week-warrior")
  ) {
    newBadges.push("week-warrior");
  }

  // Champion badge
  if (newHabit.currentStreak >= 30 && !oldHabit.badges.includes("champion")) {
    newBadges.push("champion");
  }

  // Legend badge
  if (newHabit.currentStreak >= 100 && !oldHabit.badges.includes("legend")) {
    newBadges.push("legend");
  }

  // Comeback badge (started a new streak after having one before)
  if (
    newHabit.currentStreak === 1 &&
    oldHabit.bestStreak > 0 &&
    oldHabit.currentStreak === 0 &&
    !oldHabit.badges.includes("comeback-king")
  ) {
    newBadges.push("comeback-king");
  }

  return newBadges;
};

export const completeHabitToday = (
  appData: AppData,
  habitId: string,
): AppData => {
  const habit = appData.habits.find((h) => h.id === habitId);
  if (!habit) return appData;

  const today = getTodayString();

  // Check if streak should reset due to missing days
  const shouldReset = calculateStreakReset(habit);

  const newStreak = shouldReset ? 1 : habit.currentStreak + 1;

  const updatedHabit: Habit = {
    ...habit,
    currentStreak: newStreak,
    bestStreak: Math.max(habit.bestStreak, newStreak),
    lastCheckIn: today,
    totalCompletions: habit.totalCompletions + 1,
    history: [
      ...habit.history.filter((h) => h.date !== today),
      { date: today, completed: true },
    ].sort((a, b) => b.date.localeCompare(a.date)),
  };

  // Check for new badges
  const newBadges = checkBadgeEarned(habit, updatedHabit);
  updatedHabit.badges = [...habit.badges, ...newBadges];

  const newAppData = updateHabit(appData, habitId, updatedHabit);
  saveAppData(newAppData);
  return newAppData;
};

export const skipHabitToday = (appData: AppData, habitId: string): AppData => {
  const habit = appData.habits.find((h) => h.id === habitId);
  if (!habit) return appData;

  const today = getTodayString();

  const updatedHabit: Habit = {
    ...habit,
    currentStreak: 0,
    lastCheckIn: today,
    history: [
      ...habit.history.filter((h) => h.date !== today),
      { date: today, completed: false },
    ].sort((a, b) => b.date.localeCompare(a.date)),
  };

  const newAppData = updateHabit(appData, habitId, updatedHabit);
  saveAppData(newAppData);
  return newAppData;
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
