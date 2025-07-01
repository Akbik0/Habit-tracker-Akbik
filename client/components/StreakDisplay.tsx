import { cn } from "@/lib/utils";
import { getStreakColor } from "@/lib/habit-tracker";

interface StreakDisplayProps {
  streak: number;
  bestStreak: number;
  className?: string;
}

export default function StreakDisplay({
  streak,
  bestStreak,
  className,
}: StreakDisplayProps) {
  return (
    <div className={cn("text-center space-y-2", className)}>
      <div className="relative">
        <div
          className={cn(
            "text-6xl font-bold transition-all duration-500",
            getStreakColor(streak),
            streak > 0 && "animate-pulse-glow",
          )}
        >
          {streak}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {streak === 1 ? "day" : "days"}
        </div>
      </div>

      {bestStreak > 0 && (
        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <span>🏆</span>
          <span>Best: {bestStreak}</span>
        </div>
      )}
    </div>
  );
}
