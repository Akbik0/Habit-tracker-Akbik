export interface Habit {
  id: string;
  name: string;
  currentStreak: number;
  bestStreak: number;
  lastCheckIn: string | null;
  totalCompletions: number;
  history: Array<{
    date: string;
    completed: boolean;
    skipped?: boolean;
  }>;
  badges: string[];
  reminderTime: string;
  createdAt: string;
  color: string;
  monthlySkipsUsed: number;
  lastSkipResetMonth: string;
}

export interface AppData {
  habits: Habit[];
  version: number;
  allTimeLongestStreak: number;
}

const STORAGE_KEY = "habit-tracker-data";

export const createDefaultHabit = (name: string, color?: string): Habit => ({
  id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  currentStreak: 0,
  bestStreak: 0,
  lastCheckIn: null,
  totalCompletions: 0,
  history: [],
  badges: [],
  reminderTime: "19:00",
  createdAt: new Date().toISOString(),
  color: color || getRandomHabitColor(),
  monthlySkipsUsed: 0,
  lastSkipResetMonth: getCurrentMonthEST(),
});

const HABIT_COLORS = [
  "#9855f6", // purple
  "#f472b6", // pink
  "#60a5fa", // blue
  "#34d399", // green
  "#fbbf24", // yellow
  "#fb7185", // rose
  "#a78bfa", // violet
  "#38bdf8", // sky
];

export const getRandomHabitColor = (): string => {
  return HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)];
};

export const loadAppData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { habits: [], version: 1, allTimeLongestStreak: 0 };

    const data = JSON.parse(stored) as AppData;

    // Migration from old single habit format
    if (!data.version && (data as any).name) {
      const oldData = data as any;
      const migratedHabit = createDefaultHabit(oldData.name || "My Habit");
      migratedHabit.currentStreak = oldData.currentStreak || 0;
      migratedHabit.bestStreak = oldData.bestStreak || 0;
      migratedHabit.lastCheckIn = oldData.lastCheckIn || null;
      migratedHabit.totalCompletions = oldData.totalCompletions || 0;
      migratedHabit.history = oldData.history || [];
      migratedHabit.badges = oldData.badges || [];
      migratedHabit.reminderTime = oldData.reminderTime || "19:00";

      return {
        habits: [migratedHabit],
        version: 1,
        allTimeLongestStreak: oldData.bestStreak || 0,
      };
    }

    // Migrate existing habits to include new fields
    const migratedHabits = (data.habits || []).map((habit: any) => ({
      ...habit,
      monthlySkipsUsed: habit.monthlySkipsUsed ?? 0,
      lastSkipResetMonth: habit.lastSkipResetMonth ?? getCurrentMonthEST(),
      history: (habit.history || []).map((entry: any) => ({
        date: entry.date,
        completed: entry.completed,
        skipped: entry.skipped ?? false,
      })),
    }));

    // Calculate all-time longest streak from existing data if not present
    const allTimeLongestStreak =
      data.allTimeLongestStreak ??
      Math.max(0, ...migratedHabits.map((habit: any) => habit.bestStreak || 0));

    return {
      habits: migratedHabits,
      version: data.version || 1,
      allTimeLongestStreak,
    };
  } catch {
    return { habits: [], version: 1 };
  }
};

export const saveAppData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save app data:", error);
  }
};

export const getTodayStringEST = (): string => {
  // Get current time in EST/EDT timezone
  const now = new Date();

  // Convert to EST using proper timezone offset
  // This handles both EST (-5) and EDT (-4) automatically
  const estTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );

  // Format as YYYY-MM-DD
  const year = estTime.getFullYear();
  const month = String(estTime.getMonth() + 1).padStart(2, "0");
  const day = String(estTime.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getCurrentMonthEST = (): string => {
  const now = new Date();
  const estTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );

  const year = estTime.getFullYear();
  const month = String(estTime.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

export const hasCheckedInToday = (habit: Habit): boolean => {
  return habit.lastCheckIn === getTodayStringEST();
};

export const calculateStreakReset = (habit: Habit): boolean => {
  if (!habit.lastCheckIn) return false;

  const todayEST = getTodayStringEST();
  const lastCheckInDate = new Date(habit.lastCheckIn + "T00:00:00");
  const todayDate = new Date(todayEST + "T00:00:00");

  const diffTime = todayDate.getTime() - lastCheckInDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 1;
};

export const canUseMonthlySkip = (habit: Habit): boolean => {
  const currentMonth = getCurrentMonthEST();

  // Reset skip count if we're in a new month
  if (habit.lastSkipResetMonth !== currentMonth) {
    return true;
  }

  return habit.monthlySkipsUsed < 1;
};

export const resetMonthlySkipIfNeeded = (habit: Habit): Habit => {
  const currentMonth = getCurrentMonthEST();

  if (habit.lastSkipResetMonth !== currentMonth) {
    return {
      ...habit,
      monthlySkipsUsed: 0,
      lastSkipResetMonth: currentMonth,
    };
  }

  return habit;
};

export const addHabit = (
  appData: AppData,
  habitName: string,
  color?: string,
): AppData => {
  const newHabit = createDefaultHabit(habitName, color);
  return {
    ...appData,
    habits: [...appData.habits, newHabit],
  };
};

export const updateHabit = (
  appData: AppData,
  habitId: string,
  updates: Partial<Habit>,
): AppData => {
  return {
    ...appData,
    habits: appData.habits.map((habit) =>
      habit.id === habitId ? { ...habit, ...updates } : habit,
    ),
  };
};

export const deleteHabit = (appData: AppData, habitId: string): AppData => {
  return {
    ...appData,
    habits: appData.habits.filter((habit) => habit.id !== habitId),
  };
};

export const getHabitById = (
  appData: AppData,
  habitId: string,
): Habit | undefined => {
  return appData.habits.find((habit) => habit.id === habitId);
};
