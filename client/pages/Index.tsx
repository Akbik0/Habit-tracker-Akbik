import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trophy, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import HabitCard from "@/components/HabitCard";
import HabitForm from "@/components/HabitForm";
import Badge from "@/components/Badge";

import {
  loadAppData,
  saveAppData,
  addHabit,
  updateHabit,
  deleteHabit,
  Habit,
  AppData,
} from "@/lib/storage";
import {
  completeHabitToday,
  skipHabitToday,
  getMotivationalMessage,
  BADGES,
} from "@/lib/habit-tracker";
import {
  requestNotificationPermission,
  scheduleHabitReminders,
  showDemoNotification,
} from "@/lib/notifications";

export default function Index() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showBadges, setShowBadges] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const data = loadAppData();
    setAppData(data);

    // Request notification permission and schedule reminders
    requestNotificationPermission().then((granted) => {
      if (granted && data.habits.length > 0) {
        scheduleHabitReminders(
          data.habits.map((h) => ({
            name: h.name,
            reminderTime: h.reminderTime,
            id: h.id,
          })),
        );
      }
    });
  }, []);

  const handleCompleteHabit = (habitId: string) => {
    if (!appData) return;

    const habit = appData.habits.find((h) => h.id === habitId);
    if (!habit) return;

    const newData = completeHabitToday(appData, habitId);
    setAppData(newData);

    const updatedHabit = newData.habits.find((h) => h.id === habitId);
    if (updatedHabit) {
      toast({
        title: "🎉 Habit completed!",
        description: getMotivationalMessage(updatedHabit.currentStreak),
      });
    }
  };

  const handleSkipHabit = (habitId: string) => {
    if (!appData) return;

    const habit = appData.habits.find((h) => h.id === habitId);
    if (!habit) return;

    const newData = skipHabitToday(appData, habitId);
    setAppData(newData);

    toast({
      title: "No worries!",
      description: `Tomorrow is a fresh start for ${habit.name}! 🌅`,
      variant: "destructive",
    });
  };

  const handleCreateHabit = (habitData: {
    name: string;
    color: string;
    reminderTime: string;
  }) => {
    if (!appData) return;

    const newData = addHabit(appData, habitData.name, habitData.color);
    const newHabit = newData.habits[newData.habits.length - 1];

    // Update the reminder time
    const finalData = updateHabit(newData, newHabit.id, {
      reminderTime: habitData.reminderTime,
    });

    setAppData(finalData);
    saveAppData(finalData);

    // Update reminders
    scheduleHabitReminders(
      finalData.habits.map((h) => ({
        name: h.name,
        reminderTime: h.reminderTime,
        id: h.id,
      })),
    );

    toast({
      title: "🎯 New habit created!",
      description: `${habitData.name} is ready to track!`,
    });
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowHabitForm(true);
  };

  const handleUpdateHabit = (habitData: {
    name: string;
    color: string;
    reminderTime: string;
  }) => {
    if (!appData || !editingHabit) return;

    const newData = updateHabit(appData, editingHabit.id, {
      name: habitData.name,
      color: habitData.color,
      reminderTime: habitData.reminderTime,
    });

    setAppData(newData);
    saveAppData(newData);
    setEditingHabit(null);

    // Update reminders
    scheduleHabitReminders(
      newData.habits.map((h) => ({
        name: h.name,
        reminderTime: h.reminderTime,
        id: h.id,
      })),
    );

    toast({
      title: "✅ Habit updated!",
      description: `${habitData.name} has been updated!`,
    });
  };

  const handleDeleteHabit = (habitId: string) => {
    if (!appData) return;

    const habit = appData.habits.find((h) => h.id === habitId);
    if (!habit) return;

    const newData = deleteHabit(appData, habitId);
    setAppData(newData);
    saveAppData(newData);
    setDeleteConfirm(null);

    // Update reminders
    scheduleHabitReminders(
      newData.habits.map((h) => ({
        name: h.name,
        reminderTime: h.reminderTime,
        id: h.id,
      })),
    );

    toast({
      title: "🗑️ Habit deleted",
      description: `${habit.name} has been removed.`,
    });
  };

  const getAllBadges = () => {
    if (!appData) return [];
    const allBadges = new Set<string>();
    appData.habits.forEach((habit) => {
      habit.badges.forEach((badge) => allBadges.add(badge));
    });
    return Array.from(allBadges);
  };

  const getTotalStats = () => {
    if (!appData)
      return { totalCompletions: 0, totalBadges: 0, activeStreaks: 0 };

    return {
      totalCompletions: appData.habits.reduce(
        (sum, h) => sum + h.totalCompletions,
        0,
      ),
      totalBadges: getAllBadges().length,
      activeStreaks: appData.habits.filter((h) => h.currentStreak > 0).length,
    };
  };

  if (!appData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-game-purple/5 to-game-pink/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-game-purple/5 to-game-pink/5">
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-game-purple to-game-pink bg-clip-text text-transparent">
              Habit Quest
            </h1>
            <p className="text-sm text-muted-foreground">
              {appData.habits.length}{" "}
              {appData.habits.length === 1 ? "habit" : "habits"} •{" "}
              {stats.activeStreaks} active streaks
            </p>
          </div>

          <div className="flex gap-2">
            <Dialog open={showBadges} onOpenChange={setShowBadges}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Trophy className="h-4 w-4" />
                  {stats.totalBadges > 0 && (
                    <div className="absolute -top-1 -right-1 bg-game-gold text-xs text-black rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {stats.totalBadges}
                    </div>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>🏆 Your Achievements</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(BADGES).map((badgeId) => (
                    <Badge
                      key={badgeId}
                      badgeId={badgeId}
                      earned={getAllBadges().includes(badgeId)}
                    />
                  ))}
                </div>
                {getAllBadges().length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Complete habits to earn badges! 🎯
                  </p>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        {appData.habits.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-game-purple">
                    {stats.totalCompletions}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Completed
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-game-gold">
                    {stats.activeStreaks}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Streaks
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-game-green">
                    {stats.totalBadges}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Badges Earned
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Habits List */}
        {appData.habits.length === 0 ? (
          <Card className="border-2 border-dashed border-muted-foreground/25">
            <CardContent className="text-center py-12">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">No habits yet!</h3>
              <p className="text-muted-foreground mb-6">
                Create your first habit to start your journey
              </p>
              <Button onClick={() => setShowHabitForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appData.habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={handleCompleteHabit}
                onSkip={handleSkipHabit}
                onEdit={handleEditHabit}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            ))}
          </div>
        )}

        {/* Floating Add Button */}
        {appData.habits.length > 0 && (
          <div className="fixed bottom-6 right-6">
            <Button
              onClick={() => setShowHabitForm(true)}
              size="lg"
              className="rounded-full h-14 w-14 shadow-lg gap-2"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Habit Form Dialog */}
        <HabitForm
          open={showHabitForm}
          onOpenChange={(open) => {
            setShowHabitForm(open);
            if (!open) setEditingHabit(null);
          }}
          habit={editingHabit}
          onSave={editingHabit ? handleUpdateHabit : handleCreateHabit}
        />

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Habit?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this habit and all its data. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteConfirm && handleDeleteHabit(deleteConfirm)
                }
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
