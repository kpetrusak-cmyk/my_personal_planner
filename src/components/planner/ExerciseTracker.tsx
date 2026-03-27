import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, startOfWeek, addDays } from "date-fns";

interface Props { date: Date; }

interface ExerciseEntry { id?: string; date_key: string; activity: string; duration: number; }

export function ExerciseTracker({ date }: Props) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const load = useCallback(async () => {
    if (!user) return;
    const keys = weekDays.map((d) => format(d, "yyyy-MM-dd"));
    const { data } = await supabase
      .from("exercise_tracker")
      .select("*")
      .eq("user_id", user.id)
      .in("date_key", keys);
    if (data) setEntries(data as any);
  }, [user, format(weekStart, "yyyy-MM-dd")]);

  useEffect(() => { load(); }, [load]);

  const updateEntry = async (dateKey: string, activity: string, duration: number) => {
    if (!user) return;
    const existing = entries.find((e) => e.date_key === dateKey && e.activity === activity);
    if (existing?.id) {
      await supabase.from("exercise_tracker").update({ duration, updated_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      await supabase.from("exercise_tracker").insert({ user_id: user.id, date_key: dateKey, activity, duration });
    }
    load();
  };

  const [newActivity, setNewActivity] = useState("");
  const [newDay, setNewDay] = useState(format(new Date(), "yyyy-MM-dd"));
  const [newDuration, setNewDuration] = useState(30);

  const addEntry = async () => {
    if (!user || !newActivity) return;
    await supabase.from("exercise_tracker").insert({ user_id: user.id, date_key: newDay, activity: newActivity, duration: newDuration });
    setNewActivity("");
    load();
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="planner-heading text-xl">Exercise Tracker</p>
        <p className="text-xs text-muted-foreground">Week of {format(weekStart, "MMM d, yyyy")}</p>
      </div>

      {/* Add new */}
      <section className="planner-card p-4 space-y-2">
        <h3 className="planner-heading text-base mb-2">Add Activity</h3>
        <input value={newActivity} onChange={(e) => setNewActivity(e.target.value)} placeholder="e.g. Running, Yoga..." className="planner-input text-sm" />
        <div className="flex gap-2">
          <select value={newDay} onChange={(e) => setNewDay(e.target.value)} className="flex-1 text-xs bg-background border border-border rounded-lg px-2 py-1.5">
            {weekDays.map((d) => <option key={format(d, "yyyy-MM-dd")} value={format(d, "yyyy-MM-dd")}>{format(d, "EEE, MMM d")}</option>)}
          </select>
          <input type="number" value={newDuration} onChange={(e) => setNewDuration(Number(e.target.value))} min={5} step={5} className="w-16 text-xs text-center bg-background border border-border rounded-lg px-2 py-1.5" />
          <span className="text-xs text-muted-foreground self-center">min</span>
        </div>
        <button onClick={addEntry} className="w-full bg-primary text-primary-foreground text-sm py-2 rounded-lg font-semibold active:scale-[0.98] transition-all">Add</button>
      </section>

      {/* Week view */}
      {weekDays.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const dayEntries = entries.filter((e) => e.date_key === key);
        const totalMin = dayEntries.reduce((s, e) => s + e.duration, 0);
        return (
          <section key={key} className="planner-card p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-foreground/70">{format(day, "EEEE, MMM d")}</span>
              {totalMin > 0 && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{totalMin} min</span>}
            </div>
            {dayEntries.length === 0 && <p className="text-[11px] text-muted-foreground/60">Rest day ☁️</p>}
            {dayEntries.map((e, i) => (
              <div key={i} className="flex justify-between text-sm py-0.5">
                <span className="font-handwritten">{e.activity}</span>
                <span className="text-xs text-muted-foreground">{e.duration} min</span>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
