import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Bell } from "lucide-react";
import { Habit, hasCheckedInToday } from "@/lib/storage";
import { getStreakColor, getMotivationalMessage } from "@/lib/habit-tracker";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string) => void;
  onSkip: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitCard({
  habit,
  onComplete,
  onSkip,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const checkedIn = hasCheckedInToday(habit);
  const streakColor = getStreakColor(habit.currentStreak);

  return (
    <Card
      className="relative overflow-hidden border-2 transition-all duration-200 hover:shadow-lg"
      style={{ borderColor: `${habit.color}40` }}
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: habit.color }}
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{habit.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(habit)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(habit.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Streak Display */}
        <div className="text-center">
          <div
            className={cn("text-4xl font-bold transition-colors", streakColor)}
          >
            {habit.currentStreak}
          </div>
          <div className="text-sm text-muted-foreground">
            {habit.currentStreak === 1 ? "day" : "days"}
          </div>
          {habit.bestStreak > 0 && habit.bestStreak !== habit.currentStreak && (
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
              <span>🏆</span>
              <span>Best: {habit.bestStreak}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!checkedIn ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => onComplete(habit.id)}
              className="h-12 bg-success hover:bg-success/90"
            >
              ✅ Done
            </Button>
            <Button
              onClick={() => onSkip(habit.id)}
              variant="outline"
              className="h-12 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              ❌ Skip
            </Button>
          </div>
        ) : (
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg mb-1">✓</div>
            <p className="text-sm font-medium">Checked in today!</p>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex justify-between text-center text-sm">
          <div>
            <div className="font-semibold" style={{ color: habit.color }}>
              {habit.totalCompletions}
            </div>
            <div className="text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="font-semibold text-game-gold">
              {habit.badges.length}
            </div>
            <div className="text-muted-foreground">Badges</div>
          </div>
          <div className="flex items-center gap-1">
            <Bell className="h-3 w-3 text-muted-foreground" />
            <div className="text-muted-foreground text-xs">
              {habit.reminderTime}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
