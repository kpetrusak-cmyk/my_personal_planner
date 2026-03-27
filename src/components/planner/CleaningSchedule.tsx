import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek } from "date-fns";

interface Props { date: Date; }

const DAILY_TASKS = ["Make bed", "Dishes", "Wipe counters", "Tidy up", "Laundry"];
const WEEKLY_TASKS = ["Vacuum", "Mop floors", "Clean bathrooms", "Dust surfaces", "Change sheets"];
const MONTHLY_TASKS = ["Deep clean kitchen", "Clean windows", "Organize closets", "Clean fridge", "Wash curtains"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CleaningSchedule({ date }: Props) {
  const { user } = useAuth();
  const weekKey = format(startOfWeek(date, { weekStartsOn: 0 }), "yyyy-MM-dd");
  const [data, setData] = useState<Record<string, boolean>>({});
  const [supplies, setSupplies] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    const { data: rows } = await supabase.from("planner_entries").select("field_name, value").eq("user_id", user.id).eq("page_type", "cleaning").eq("date_key", weekKey);
    const m: Record<string, boolean> = {};
    rows?.forEach((r: any) => {
      if (r.field_name === "supplies") { setSupplies(r.value); return; }
      m[r.field_name] = r.value === "true";
    });
    setData(m);
  }, [user, weekKey]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (field: string) => {
    if (!user) return;
    const newVal = !data[field];
    setData((p) => ({ ...p, [field]: newVal }));
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "cleaning", date_key: weekKey, field_name: field, value: String(newVal), updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  const TaskRow = ({ task, prefix }: { task: string; prefix: string }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toggle(`${prefix}_${task}`)}
        className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all active:scale-90 ${data[`${prefix}_${task}`] ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}
      >
        {data[`${prefix}_${task}`] && <span className="text-[9px]">✓</span>}
      </button>
      <span className={`text-sm font-handwritten ${data[`${prefix}_${task}`] ? "line-through opacity-50" : ""}`}>{task}</span>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2"><p className="planner-heading text-xl">🧹 Cleaning Schedule</p></div>

      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-2">Daily Tasks</h3>
        <div className="grid grid-cols-1 gap-1.5">
          {DAILY_TASKS.map((task) => <TaskRow key={task} task={task} prefix="daily" />)}
        </div>
      </section>

      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-2">Weekly Tasks</h3>
        <div className="grid grid-cols-1 gap-1.5">
          {WEEKLY_TASKS.map((task) => <TaskRow key={task} task={task} prefix="weekly" />)}
        </div>
      </section>

      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-2">Monthly Tasks</h3>
        <div className="grid grid-cols-1 gap-1.5">
          {MONTHLY_TASKS.map((task) => <TaskRow key={task} task={task} prefix="monthly" />)}
        </div>
      </section>

      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-2">🧴 Supplies Needed</h3>
        <textarea
          value={supplies}
          onChange={(e) => { setSupplies(e.target.value); if (!user) return; supabase.from("planner_entries").upsert({ user_id: user.id, page_type: "cleaning", date_key: weekKey, field_name: "supplies", value: e.target.value, updated_at: new Date().toISOString() }, { onConflict: "user_id,page_type,date_key,field_name" }); }}
          placeholder="List supplies..."
          className="planner-input min-h-[60px] resize-none"
          rows={3}
        />
      </section>
    </div>
  );
}
