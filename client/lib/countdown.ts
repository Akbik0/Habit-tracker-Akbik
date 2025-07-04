export interface TimeUntilReset {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export const getTimeUntilMidnightEST = (): TimeUntilReset => {
  const now = new Date();

  // Get current EST time
  const currentEST = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );

  // Calculate tomorrow midnight in EST
  const tomorrowEST = new Date(currentEST);
  tomorrowEST.setDate(tomorrowEST.getDate() + 1);
  tomorrowEST.setHours(0, 0, 0, 0);

  // Get the UTC time for tomorrow midnight EST
  const estOffset = tomorrowEST.getTimezoneOffset();
  const nyOffset = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
  const nyTime = new Date(nyOffset);
  const offsetDiff = now.getTimezoneOffset() - nyTime.getTimezoneOffset();

  // Calculate time difference more reliably
  const currentESTMs = now.getTime() + offsetDiff * 60000;
  const tomorrowMidnightMs = tomorrowEST.getTime();

  const totalMs = tomorrowMidnightMs - currentESTMs;

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
