import {
  Habit,
  AppData,
  saveAppData,
  getTodayStringEST,
  calculateStreakReset,
  updateHabit,
  canUseMonthlySkip,
  resetMonthlySkipIfNeeded,
  getCurrentMonthEST,
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

  const today = getTodayStringEST();

  // Reset monthly skips if needed
  const habitWithResetSkips = resetMonthlySkipIfNeeded(habit);

  // Check if streak should reset due to missing days
  const shouldReset = calculateStreakReset(habitWithResetSkips);

  const newStreak = shouldReset ? 1 : habitWithResetSkips.currentStreak + 1;

  const now = new Date();
  const updatedHabit: Habit = {
    ...habitWithResetSkips,
    currentStreak: newStreak,
    bestStreak: Math.max(habitWithResetSkips.bestStreak, newStreak),
    lastCheckIn: today,
    lastCheckInTimestamp: now.toISOString(),
    totalCompletions: habitWithResetSkips.totalCompletions + 1,
    history: [
      ...habitWithResetSkips.history.filter((h) => h.date !== today),
      { date: today, completed: true, timestamp: now.toISOString() },
    ].sort((a, b) => b.date.localeCompare(a.date)),
  };

  // Check for new badges
  const newBadges = checkBadgeEarned(habitWithResetSkips, updatedHabit);
  updatedHabit.badges = [...habitWithResetSkips.badges, ...newBadges];

  let newAppData = updateHabit(appData, habitId, updatedHabit);

  // Update all-time longest streak if this is a new record
  if (newStreak > newAppData.allTimeLongestStreak) {
    newAppData = {
      ...newAppData,
      allTimeLongestStreak: newStreak,
    };
  }

  saveAppData(newAppData);
  return newAppData;
};

export const skipHabitToday = (
  appData: AppData,
  habitId: string,
  useMonthlySkip: boolean = false,
): AppData => {
  const habit = appData.habits.find((h) => h.id === habitId);
  if (!habit) return appData;

  const today = getTodayStringEST();

  // Reset monthly skips if needed
  const habitWithResetSkips = resetMonthlySkipIfNeeded(habit);

  let updatedHabit: Habit;

  const now = new Date();

  if (useMonthlySkip && canUseMonthlySkip(habitWithResetSkips)) {
    // Use monthly skip - keep streak but mark as skipped
    updatedHabit = {
      ...habitWithResetSkips,
      lastCheckIn: today,
      lastCheckInTimestamp: now.toISOString(),
      monthlySkipsUsed: habitWithResetSkips.monthlySkipsUsed + 1,
      history: [
        ...habitWithResetSkips.history.filter((h) => h.date !== today),
        {
          date: today,
          completed: false,
          skipped: true,
          timestamp: now.toISOString(),
        },
      ].sort((a, b) => b.date.localeCompare(a.date)),
    };
  } else {
    // Regular skip - reset streak
    updatedHabit = {
      ...habitWithResetSkips,
      currentStreak: 0,
      lastCheckIn: today,
      lastCheckInTimestamp: now.toISOString(),
      history: [
        ...habitWithResetSkips.history.filter((h) => h.date !== today),
        { date: today, completed: false, timestamp: now.toISOString() },
      ].sort((a, b) => b.date.localeCompare(a.date)),
    };
  }

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
