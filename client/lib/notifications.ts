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

export const scheduleHabitReminder = (habitName: string, time: string) => {
  // For now, this is a placeholder for notification scheduling
  // In a real app, you'd use service workers or a backend service
  console.log(`Reminder scheduled for ${habitName} at ${time}`);

  // Show a simple notification as demo
  if (Notification.permission === "granted") {
    setTimeout(() => {
      new Notification("Habit Quest Reminder! 🎯", {
        body: `Time to check in with your ${habitName} habit!`,
        icon: "/placeholder.svg",
        tag: "habit-reminder",
      });
    }, 1000); // Demo notification after 1 second
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
