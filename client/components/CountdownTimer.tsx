import { useEffect, useState } from "react";
import {
  getTimeUntilMidnightEST,
  formatTimeUntilReset,
  TimeUntilReset,
} from "@/lib/countdown";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  isCompleted: boolean;
  className?: string;
}

export default function CountdownTimer({
  isCompleted,
  className,
}: CountdownTimerProps) {
  const [timeUntilReset, setTimeUntilReset] = useState<TimeUntilReset>(
    getTimeUntilMidnightEST(),
  );

  useEffect(() => {
    const updateTimer = () => {
      setTimeUntilReset(getTimeUntilMidnightEST());
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const message = isCompleted
    ? `Next check-in available in ${formatTimeUntilReset(timeUntilReset).replace("until reset", "")}`
    : `${formatTimeUntilReset(timeUntilReset)}`;

  return (
    <div
      className={`flex items-center gap-1 text-xs text-muted-foreground ${className}`}
    >
      <Clock className="h-3 w-3" />
      <span>{message}</span>
    </div>
  );
}
