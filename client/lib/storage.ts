export interface HabitData {
  name: string;
  currentStreak: number;
  bestStreak: number;
  lastCheckIn: string | null;
  totalCompletions: number;
  history: Array<{
    date: string;
    completed: boolean;
  }>;
  badges: string[];
  reminderTime: string;
}

const STORAGE_KEY = "habit-tracker-data";

export const defaultHabitData: HabitData = {
  name: "",
  currentStreak: 0,
  bestStreak: 0,
  lastCheckIn: null,
  totalCompletions: 0,
  history: [],
  badges: [],
  reminderTime: "19:00",
};

export const loadHabitData = (): HabitData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...defaultHabitData };

    const data = JSON.parse(stored) as HabitData;
    return { ...defaultHabitData, ...data };
  } catch {
    return { ...defaultHabitData };
  }
};

export const saveHabitData = (data: HabitData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save habit data:", error);
  }
};

export const getTodayString = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const hasCheckedInToday = (data: HabitData): boolean => {
  return data.lastCheckIn === getTodayString();
};

export const calculateStreakReset = (data: HabitData): boolean => {
  if (!data.lastCheckIn) return false;

  const today = new Date();
  const lastCheckIn = new Date(data.lastCheckIn);
  const diffTime = today.getTime() - lastCheckIn.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 1;
};
