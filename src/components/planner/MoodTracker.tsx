import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, eachDayOfInterval, startOfYear, endOfYear, getDay } from "date-fns";

const MOODS = [
  { label: "Happy", color: "#f9d56e" },
  { label: "Excited", color: "#ff9a76" },
  { label: "Calm", color: "#a8d8ea" },
  { label: "Grateful", color: "#c4a8c1" },
  { label: "Loved", color: "#f4a4c0" },
  { label: "Neutral", color: "#d3d3d3" },
  { label: "Tired", color: "#b0c4de" },
  { label: "Anxious", color: "#dda0dd" },
  { label: "Sad", color: "#87ceeb" },
  { label: "Angry", color: "#e88080" },
  { label: "Stressed", color: "#ffb347" },
  { label: "Sick", color: "#98d4a6" },
];

export function MoodTracker() {
  const { user } = useAuth();
  const year = 2026;
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 0, 1));
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
  const [moods, setMoods] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("mood_tracker")
      .select("date_key, mood_index")
      .eq("user_id", user.id);
    const m: Record<string, number> = {};
    data?.forEach((r: any) => { m[r.date_key] = r.mood_index; });
    setMoods(m);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggleMood = async (dateKey: string) => {
    if (!user) return;
    const current = moods[dateKey] ?? -1;
    const next = (current + 1) % (MOODS.length + 1);
    if (next === MOODS.length) {
      // remove
      setMoods((p) => { const n = { ...p }; delete n[dateKey]; return n; });
      await supabase.from("mood_tracker").delete().eq("user_id", user.id).eq("date_key", dateKey);
    } else {
      setMoods((p) => ({ ...p, [dateKey]: next }));
      await supabase.from("mood_tracker").upsert(
        { user_id: user.id, date_key: dateKey, mood_index: next, updated_at: new Date().toISOString() },
        { onConflict: "user_id,date_key" }
      );
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="planner-heading text-xl">Mood Tracker 2026</p>
      </div>

      {/* Legend */}
      <div className="planner-card p-3">
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: m.color }} />
              <span className="text-[10px] text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Year grid by month */}
      {months.map((month) => {
        const monthDays = allDays.filter((d) => d.getMonth() === month);
        return (
          <section key={month} className="planner-card p-3">
            <h3 className="text-xs font-bold text-foreground/70 mb-2">{format(new Date(year, month, 1), "MMMM")}</h3>
            <div className="grid grid-cols-7 gap-1">
              {/* offset for first day */}
              {Array.from({ length: getDay(monthDays[0]) }, (_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {monthDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const moodIdx = moods[key];
                const bg = moodIdx !== undefined ? MOODS[moodIdx]?.color : undefined;
                return (
                  <button
                    key={key}
                    onClick={() => toggleMood(key)}
                    className="w-full aspect-square rounded-sm text-[9px] font-semibold transition-all active:scale-90"
                    style={{ backgroundColor: bg || "hsl(300 15% 85% / 0.3)" }}
                    title={moodIdx !== undefined ? MOODS[moodIdx]?.label : format(day, "MMM d")}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
