export interface TimeUntilReset {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export const getTimeUntilMidnightEST = (): TimeUntilReset => {
  const now = new Date();
  const currentEST = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );

  // Get tomorrow at midnight EST
  const tomorrowMidnightEST = new Date(currentEST);
  tomorrowMidnightEST.setDate(tomorrowMidnightEST.getDate() + 1);
  tomorrowMidnightEST.setHours(0, 1, 0, 0); // 12:01 AM

  // Convert back to local time for calculation
  const tomorrowMidnightLocal = new Date(
    tomorrowMidnightEST.toLocaleString("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  );

  const totalMs = tomorrowMidnightLocal.getTime() - now.getTime();

  if (totalMs <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }

  const hours = Math.floor(totalMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, totalMs };
};

export const formatTimeUntilReset = (time: TimeUntilReset): string => {
  if (time.totalMs <= 0) return "Resetting now...";

  if (time.hours > 0) {
    return `${time.hours}h ${time.minutes}m until reset`;
  } else if (time.minutes > 0) {
    return `${time.minutes}m ${time.seconds}s until reset`;
  } else {
    return `${time.seconds}s until reset`;
  }
};
