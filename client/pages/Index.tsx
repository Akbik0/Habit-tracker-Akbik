import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import StreakDisplay from "@/components/StreakDisplay";
import ProgressBar from "@/components/ProgressBar";
import Badge from "@/components/Badge";
import { loadHabitData, hasCheckedInToday, HabitData } from "@/lib/storage";
import {
  completeHabitToday,
  skipHabitToday,
  updateHabitName,
  getMotivationalMessage,
  BADGES,
} from "@/lib/habit-tracker";
import { Settings, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Index() {
  const [habitData, setHabitData] = useState<HabitData | null>(null);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [showBadges, setShowBadges] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const data = loadHabitData();
    setHabitData(data);
    setCheckedInToday(hasCheckedInToday(data));
    setNewHabitName(data.name);
  }, []);

  const handleCompleteHabit = () => {
    if (!habitData || checkedInToday) return;

    const newData = completeHabitToday(habitData);
    setHabitData(newData);
    setCheckedInToday(true);

    toast({
      title: "🎉 Habit completed!",
      description: getMotivationalMessage(newData.currentStreak),
    });
  };

  const handleSkipHabit = () => {
    if (!habitData || checkedInToday) return;

    const newData = skipHabitToday(habitData);
    setHabitData(newData);
    setCheckedInToday(true);

    toast({
      title: "No worries!",
      description: "Tomorrow is a fresh start! 🌅",
      variant: "destructive",
    });
  };

  const handleUpdateHabitName = () => {
    if (!habitData || !newHabitName.trim()) return;

    const newData = updateHabitName(habitData, newHabitName.trim());
    setHabitData(newData);
    setShowSettings(false);

    toast({
      title: "Habit updated!",
      description: `Now tracking: ${newHabitName}`,
    });
  };

  if (!habitData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-game-purple/5 to-game-pink/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const needsHabitName = !habitData.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-game-purple/5 to-game-pink/5">
      <div className="container max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-game-purple to-game-pink bg-clip-text text-transparent">
            Habit Quest
          </h1>
          <div className="flex gap-2">
            <Dialog open={showBadges} onOpenChange={setShowBadges}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Trophy className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>🏆 Your Badges</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(BADGES).map((badgeId) => (
                    <Badge
                      key={badgeId}
                      badgeId={badgeId}
                      earned={habitData.badges.includes(badgeId)}
                    />
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>⚙️ Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="habit-name">Habit Name</Label>
                    <Input
                      id="habit-name"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      placeholder="e.g., Exercise, Study, Meditate"
                    />
                  </div>
                  <Button onClick={handleUpdateHabitName} className="w-full">
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Setup Prompt */}
        {needsHabitName && (
          <Card className="border-2 border-game-orange animate-bounce-in">
            <CardHeader>
              <CardTitle className="text-center">
                Welcome to Habit Quest! 🎯
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                First, let's set up your habit to track:
              </p>
              <div>
                <Label htmlFor="initial-habit">
                  What habit do you want to build?
                </Label>
                <Input
                  id="initial-habit"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Exercise, Study, Meditate"
                />
              </div>
              <Button onClick={handleUpdateHabitName} className="w-full">
                Start My Journey! 🚀
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Habit Card */}
        {!needsHabitName && (
          <>
            <Card className="border-2 border-border">
              <CardHeader>
                <CardTitle className="text-center text-xl">
                  Did you complete your
                  <br />
                  <span className="text-2xl text-primary font-bold">
                    {habitData.name}
                  </span>
                  <br />
                  today?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <StreakDisplay
                  streak={habitData.currentStreak}
                  bestStreak={habitData.bestStreak}
                />

                {!checkedInToday ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleCompleteHabit}
                      className="h-16 text-lg bg-success hover:bg-success/90"
                    >
                      ✅ Yes!
                    </Button>
                    <Button
                      onClick={handleSkipHabit}
                      variant="outline"
                      className="h-16 text-lg border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      ❌ No
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <div className="text-2xl mb-2">🎉</div>
                    <p className="font-medium">Already checked in today!</p>
                    <p className="text-sm text-muted-foreground">
                      Come back tomorrow to continue your streak
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Cards */}
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardContent className="p-4">
                  <ProgressBar
                    current={habitData.currentStreak}
                    target={7}
                    label="Week Progress"
                    color="bg-game-orange"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <ProgressBar
                    current={habitData.currentStreak}
                    target={30}
                    label="Month Challenge"
                    color="bg-game-purple"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Recent Badges */}
            {habitData.badges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    🏆 Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {habitData.badges.slice(-3).map((badgeId) => (
                      <Badge key={badgeId} badgeId={badgeId} earned />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-game-blue">
                    {habitData.totalCompletions}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Completed
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-game-gold">
                    {habitData.badges.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Badges Earned
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
