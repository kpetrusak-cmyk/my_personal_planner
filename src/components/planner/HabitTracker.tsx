import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, eachDayOfInterval, startOfMonth, endOfMonth, getDay } from "date-fns";

function WaterCupIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      {/* Straw */}
      <rect x="11" y="2" width="2" height="5" rx="0.5" fill="#d48ca8" />
      {/* Lid */}
      <rect x="7" y="6" width="10" height="2" rx="1" fill="#f3d7e3" />
      {/* Cup body */}
      <rect x="8" y="8" width="8" height="11" rx="3" fill="#f7c9dd" />
      {/* Stainless rim */}
      <rect x="8" y="7.5" width="8" height="1" fill="#d9d9dd" />
      {/* Handle */}
      <path
        d="M16 9.5c1.8 0 3 1.3 3 3.2v3.6c0 1.4-0.9 2.4-2.2 2.4"
        fill="none"
        stroke="#f7c9dd"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const DEFAULT_HABITS = [
  { name: "Exercise", color: "#a8d5ba" },
  { name: "Read", color: "#aec6e0" },
  { name: "Meditate", color: "#c4a8c1" },
  { name: "Journal", color: "#f5c6aa" },
  { name: "Water", color: "#5ab8ff" }, //
];

const MONTHS = Array.from({ length: 12 }, (_, i) => i);

export function HabitTracker() {
  const { user } = useAuth();
  const year = 2026;
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [data, setData] = useState<Record<string, boolean>>({});
  const [editingNames, setEditingNames] = useState(false);

  const makeKey = (hi: number, dateKey: string) => `${hi}:${dateKey}`;

  const load = useCallback(async () => {
    if (!user) return;
    const { data: rows } = await supabase
      .from("habit_tracker")
      .select("habit_index, habit_name, habit_color, date_key, done")
      .eq("user_id", user.id);
    if (!rows) return;
    const d: Record<string, boolean> = {};
    const nameMap: Record<number, { name: string; color: string }> = {};
    rows.forEach((r: any) => {
      d[makeKey(r.habit_index, r.date_key)] = r.done;
      if (r.habit_name) nameMap[r.habit_index] = { name: r.habit_name, color: r.habit_color };
    });
    setData(d);
    if (Object.keys(nameMap).length > 0) {
      setHabits(habits.map((h, i) => nameMap[i] || h));
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (habitIndex: number, dateKey: string) => {
  if (!user) return;
  const key = makeKey(habitIndex, dateKey);

  let newVal;

  if (habits[habitIndex].name === "Water") {
    // Increment water count
    const current = Number(data[key] || 0);
    newVal = current + 1;
  } else {
    // Normal boolean toggle
    newVal = !data[key];
  }

  setData((p) => ({ ...p, [key]: newVal }));

  await supabase.from("habit_tracker").upsert(
    {
      user_id: user.id,
      habit_index: habitIndex,
      habit_name: habits[habitIndex].name,
      habit_color: habits[habitIndex].color,
      date_key: dateKey,
      done: newVal,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,habit_index,date_key" }
  );
};

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const monthStart = startOfMonth(new Date(year, selectedMonth, 1));
  const monthEnd = endOfMonth(monthStart);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="planner-heading text-xl">Habit Tracker 2026</p>
      </div>

      {/* Month selector */}
      <div className="flex gap-1 overflow-x-auto pb-1 px-1">
        {MONTHS.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
              m === selectedMonth ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/60"
            }`}
          >
            {format(new Date(year, m, 1), "MMM")}
          </button>
        ))}
      </div>

      {/* Habit legend */}
      <div className="planner-card p-3 flex flex-wrap gap-2">
        {habits.map((h, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: h.color }} />
            <span className="text-xs text-foreground/70">{h.name}</span>
          </div>
        ))}
      </div>

      {/* Grid per habit */}
      {habits.map((habit, hi) => (
        <section key={hi} className="planner-card p-3">
          <h3 className="text-xs font-bold text-foreground/70 mb-2" style={{ color: habit.color }}>{habit.name}</h3>
          <div className="grid grid-cols-7 gap-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-[9px] text-center font-bold text-muted-foreground">{d}</div>
            ))}
            {Array.from({ length: getDay(monthDays[0]) }, (_, i) => <div key={`p-${i}`} />)}
            {monthDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const done = data[makeKey(hi, key)];
              return (
                <button
                  key={key}
                  onClick={() => toggle(hi, key)}
                  className="w-full aspect-square rounded-sm text-[9px] font-semibold transition-all active:scale-90"
                  style={{ backgroundColor: done ? habit.color : "hsl(300 15% 85% / 0.3)" }}
                >
              {habits[hi].name === "Water" ? (
                <div className="flex flex-wrap justify-center items-center">
                  {Array.from({ length: Number(data[makeKey(hi, key)] || 0) }).map((_, i) => (
                    <WaterCupIcon key={i} className="w-3=6 h-6" />
                  ))}
                </div>
              ) : (
              day.getDate()
              )}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
