import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface Props { date: Date; }

export function SleepTracker({ date }: Props) {
  const { user } = useAuth();
  const [sleepData, setSleepData] = useState<Record<string, number>>({});
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("sleep_tracker")
      .select("date_key, hours")
      .eq("user_id", user.id)
      .gte("date_key", format(monthStart, "yyyy-MM-dd"))
      .lte("date_key", format(monthEnd, "yyyy-MM-dd"));
    const m: Record<string, number> = {};
    data?.forEach((r: any) => { m[r.date_key] = Number(r.hours); });
    setSleepData(m);
  }, [user, format(monthStart, "yyyy-MM")]);

  useEffect(() => { load(); }, [load]);

  const updateHours = async (dateKey: string, hours: number) => {
    if (!user) return;
    setSleepData((p) => ({ ...p, [dateKey]: hours }));
    await supabase.from("sleep_tracker").upsert(
      { user_id: user.id, date_key: dateKey, hours, updated_at: new Date().toISOString() },
      { onConflict: "user_id,date_key" }
    );
  };

  const getBarColor = (h: number) => {
    if (h >= 8) return "hsl(140 40% 60%)";
    if (h >= 6) return "hsl(42 80% 65%)";
    return "hsl(0 60% 65%)";
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="planner-heading text-xl">Sleep Tracker</p>
        <p className="text-xs text-muted-foreground">{format(date, "MMMM yyyy")}</p>
      </div>

      <section className="planner-card p-4">
        <div className="space-y-1.5">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const h = sleepData[key] || 0;
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground w-8">{format(day, "d")}</span>
                <div className="flex-1 h-6 bg-secondary/50 rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(h / 12 * 100, 100)}%`, backgroundColor: getBarColor(h) }}
                  />
                </div>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={h || ""}
                  onChange={(e) => updateHours(key, Number(e.target.value))}
                  placeholder="hrs"
                  className="w-12 text-xs text-center bg-transparent border-b border-border/50 focus:border-primary/40 focus:outline-none font-handwritten"
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
