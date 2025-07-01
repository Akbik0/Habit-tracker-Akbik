export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const scheduleHabitReminders = (
  habits: Array<{ name: string; reminderTime: string; id: string }>,
) => {
  // Clear existing reminders
  clearAllReminders();

  // Schedule new reminders for each habit
  habits.forEach((habit) => {
    scheduleHabitReminder(habit.name, habit.reminderTime, habit.id);
  });
};

export const scheduleHabitReminder = (
  habitName: string,
  time: string,
  habitId: string,
) => {
  // For now, this is a placeholder for notification scheduling
  // In a real app, you'd use service workers or a backend service
  console.log(`Reminder scheduled for ${habitName} at ${time}`);

  // Store reminder in localStorage for demo purposes
  const reminders = getStoredReminders();
  reminders[habitId] = {
    habitName,
    time,
    habitId,
  };
  localStorage.setItem("habit-reminders", JSON.stringify(reminders));
};

export const clearAllReminders = () => {
  localStorage.removeItem("habit-reminders");
};

export const getStoredReminders = (): Record<
  string,
  { habitName: string; time: string; habitId: string }
> => {
  try {
    const stored = localStorage.getItem("habit-reminders");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const showDemoNotification = (habitName: string) => {
  if (Notification.permission === "granted") {
    new Notification("Habit Quest Reminder! 🎯", {
      body: `Time to check in with your ${habitName} habit!`,
      icon: "/placeholder.svg",
      tag: `habit-reminder-${habitName}`,
    });
  }
};

export const showSuccessNotification = (message: string) => {
  if (Notification.permission === "granted") {
    new Notification("Habit Completed! 🎉", {
      body: message,
      icon: "/placeholder.svg",
      tag: "habit-success",
    });
  }
};
