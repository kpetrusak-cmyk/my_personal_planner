import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface SavingsGoal { name: string; target: number; months: number[]; }
const EMPTY: SavingsGoal = { name: "", target: 0, months: Array(12).fill(0) };
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function SavingsTracker() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([{ ...EMPTY, months: [...EMPTY.months] }, { ...EMPTY, months: [...EMPTY.months] }, { ...EMPTY, months: [...EMPTY.months] }]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("planner_entries").select("field_name, value").eq("user_id", user.id).eq("page_type", "savings").eq("date_key", "2026");
    if (!data) return;
    const loaded = [{ ...EMPTY, months: [...EMPTY.months] }, { ...EMPTY, months: [...EMPTY.months] }, { ...EMPTY, months: [...EMPTY.months] }];
    data.forEach((r: any) => {
      const m = r.field_name.match(/^goal_(\d+)$/);
      if (m) { try { loaded[parseInt(m[1])] = JSON.parse(r.value); } catch {} }
    });
    setGoals(loaded);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async (index: number, goal: SavingsGoal) => {
    if (!user) return;
    const u = [...goals]; u[index] = goal; setGoals(u);
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "savings", date_key: "2026", field_name: `goal_${index}`, value: JSON.stringify(goal), updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2"><p className="planner-heading text-xl">💰 Savings Tracker</p></div>
      {goals.map((goal, gi) => {
        const total = goal.months.reduce((s, v) => s + v, 0);
        const pct = goal.target > 0 ? Math.min((total / goal.target) * 100, 100) : 0;
        return (
          <section key={gi} className="planner-card p-4 space-y-2">
            <div className="flex gap-2">
              <input value={goal.name} onChange={(e) => save(gi, { ...goal, name: e.target.value })} placeholder="Savings goal" className="planner-input flex-1" />
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">$</span>
                <input type="number" value={goal.target || ""} onChange={(e) => save(gi, { ...goal, target: Number(e.target.value) })} placeholder="Target" className="w-20 text-sm text-right font-handwritten bg-transparent border-b border-border/50 focus:border-primary/40 focus:outline-none" />
              </div>
            </div>
            <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
              <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground text-right">${total} / ${goal.target} ({pct.toFixed(0)}%)</p>
            <div className="grid grid-cols-6 gap-1.5">
              {MONTH_LABELS.map((m, mi) => (
                <div key={mi}>
                  <label className="text-[9px] text-muted-foreground">{m}</label>
                  <input
                    type="number"
                    value={goal.months[mi] || ""}
                    onChange={(e) => { const months = [...goal.months]; months[mi] = Number(e.target.value); save(gi, { ...goal, months }); }}
                    className="w-full text-[11px] text-center font-handwritten bg-transparent border-b border-border/30 focus:border-primary/40 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
