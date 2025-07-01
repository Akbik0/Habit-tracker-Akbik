import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
  color?: string;
  className?: string;
}

export default function ProgressBar({
  current,
  target,
  label,
  color = "bg-game-purple",
  className,
}: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {current}/{target}
        </span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            color,
            percentage > 0 && "animate-slide-up",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
