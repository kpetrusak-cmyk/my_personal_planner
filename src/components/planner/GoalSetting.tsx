import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Goal {
  title: string;
  why: string;
  steps: string;
  deadline: string;
  affirmation: string;
}

const EMPTY_GOAL: Goal = { title: "", why: "", steps: "", deadline: "", affirmation: "" };

export function GoalSetting() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([{ ...EMPTY_GOAL }, { ...EMPTY_GOAL }, { ...EMPTY_GOAL }, { ...EMPTY_GOAL }]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("planner_entries")
      .select("field_name, value")
      .eq("user_id", user.id)
      .eq("page_type", "goal_setting")
      .eq("date_key", "2026");
    if (!data) return;
    const loaded = [...goals];
    data.forEach((r: any) => {
      const match = r.field_name.match(/^goal_(\d+)$/);
      if (match) {
        try { loaded[parseInt(match[1])] = JSON.parse(r.value); } catch {}
      }
    });
    setGoals(loaded);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const update = async (index: number, field: keyof Goal, value: string) => {
    if (!user) return;
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "goal_setting", date_key: "2026", field_name: `goal_${index}`, value: JSON.stringify(updated[index]), updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="planner-heading text-xl">Goal Setting 2026</p>
      </div>

      {goals.map((goal, i) => (
        <section key={i} className="planner-card p-4 space-y-2">
          <h3 className="planner-heading text-base">Goal {i + 1}</h3>
          <input value={goal.title} onChange={(e) => update(i, "title", e.target.value)} placeholder="Goal title" className="planner-input" />
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Why it matters</label>
            <textarea value={goal.why} onChange={(e) => update(i, "why", e.target.value)} placeholder="Why is this important?" className="planner-input text-sm min-h-[40px] resize-none" rows={2} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Action Steps</label>
            <textarea value={goal.steps} onChange={(e) => update(i, "steps", e.target.value)} placeholder="Break it down..." className="planner-input text-sm min-h-[40px] resize-none" rows={2} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Deadline</label>
              <input type="date" value={goal.deadline} onChange={(e) => update(i, "deadline", e.target.value)} className="w-full text-xs bg-transparent border-b border-border/50 focus:border-primary/40 focus:outline-none py-1" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Affirmation</label>
            <input value={goal.affirmation} onChange={(e) => update(i, "affirmation", e.target.value)} placeholder="I am capable of..." className="planner-input text-sm" />
          </div>
        </section>
      ))}
    </div>
  );
}
