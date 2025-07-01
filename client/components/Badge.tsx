import { cn } from "@/lib/utils";
import { BADGES } from "@/lib/habit-tracker";

interface BadgeProps {
  badgeId: string;
  earned?: boolean;
  newlyEarned?: boolean;
  className?: string;
}

export default function Badge({
  badgeId,
  earned = false,
  newlyEarned = false,
  className,
}: BadgeProps) {
  const badge = BADGES[badgeId as keyof typeof BADGES];
  if (!badge) return null;

  return (
    <div
      className={cn(
        "relative p-3 rounded-2xl border-2 transition-all duration-300",
        earned
          ? "bg-gradient-to-br from-game-gold/20 to-game-orange/20 border-game-gold shadow-lg"
          : "bg-muted/50 border-muted-foreground/20 grayscale",
        newlyEarned && "animate-bounce-in",
        className,
      )}
    >
      <div className="text-center space-y-1">
        <div className={cn("text-2xl", earned ? "grayscale-0" : "grayscale")}>
          {badge.icon}
        </div>
        <div
          className={cn(
            "text-xs font-medium",
            earned ? "text-game-gold" : "text-muted-foreground",
          )}
        >
          {badge.name}
        </div>
      </div>
      {newlyEarned && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-game-orange rounded-full animate-ping" />
      )}
    </div>
  );
}
