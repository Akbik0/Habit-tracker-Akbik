import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Habit, getRandomHabitColor } from "@/lib/storage";

interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
  onSave: (habitData: {
    name: string;
    color: string;
    reminderTime: string;
  }) => void;
}

const PRESET_COLORS = [
  "#9855f6", // purple
  "#f472b6", // pink
  "#60a5fa", // blue
  "#34d399", // green
  "#fbbf24", // yellow
  "#fb7185", // rose
  "#a78bfa", // violet
  "#38bdf8", // sky
];

export default function HabitForm({
  open,
  onOpenChange,
  habit,
  onSave,
}: HabitFormProps) {
  const [name, setName] = useState(habit?.name || "");
  const [color, setColor] = useState(habit?.color || getRandomHabitColor());
  const [reminderTime, setReminderTime] = useState(
    habit?.reminderTime || "19:00",
  );

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      color,
      reminderTime,
    });

    // Reset form
    setName("");
    setColor(getRandomHabitColor());
    setReminderTime("19:00");
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setName(habit?.name || "");
    setColor(habit?.color || getRandomHabitColor());
    setReminderTime(habit?.reminderTime || "19:00");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{habit ? "Edit Habit" : "Create New Habit"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Habit Name */}
          <div>
            <Label htmlFor="habit-name">Habit Name</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Exercise, Study, Meditate"
              className="mt-1"
            />
          </div>

          {/* Color Selection */}
          <div>
            <Label>Color Theme</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    color === presetColor
                      ? "border-foreground scale-110"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => setColor(presetColor)}
                />
              ))}
            </div>
          </div>

          {/* Reminder Time */}
          <div>
            <Label htmlFor="reminder-time">Daily Reminder Time</Label>
            <Input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              You'll get a notification at this time each day
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={!name.trim()}
            >
              {habit ? "Update Habit" : "Create Habit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
