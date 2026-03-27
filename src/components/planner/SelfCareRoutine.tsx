import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const SECTIONS = [
  { key: "daily", label: "Daily", emoji: "☀️", items: ["Drink water", "Take vitamins", "Skincare", "Move body", "Read", "Journal"] },
  { key: "weekly", label: "Weekly", emoji: "🌸", items: ["Date night", "Call a friend", "Hobby time", "Deep clean", "Meal prep"] },
  { key: "monthly", label: "Monthly", emoji: "🌙", items: ["Spa day", "Declutter", "Budget review", "Goal check-in", "Try something new"] },
  { key: "whenever", label: "Whenever Needed", emoji: "💕", items: ["Take a bath", "Watch comfort show", "Go for a walk", "Say no", "Cry it out", "Nap"] },
];

export function SelfCareRoutine() {
  const { user } = useAuth();
  const [data, setData] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    if (!user) return;
    const { data: rows } = await supabase.from("planner_entries").select("field_name, value").eq("user_id", user.id).eq("page_type", "selfcare").eq("date_key", "static");
    const m: Record<string, boolean> = {};
    rows?.forEach((r: any) => { m[r.field_name] = r.value === "true"; });
    setData(m);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (field: string) => {
    if (!user) return;
    const newVal = !data[field];
    setData((p) => ({ ...p, [field]: newVal }));
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "selfcare", date_key: "static", field_name: field, value: String(newVal), updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2"><p className="planner-heading text-xl">💆 Self Care Routine</p></div>
      {SECTIONS.map((s) => (
        <section key={s.key} className="planner-card p-4">
          <h3 className="planner-heading text-base mb-2">{s.emoji} {s.label}</h3>
          <div className="space-y-1.5">
            {s.items.map((item) => {
              const field = `${s.key}_${item}`;
              return (
                <div key={item} className="flex items-center gap-2">
                  <button onClick={() => toggle(field)} className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all active:scale-90 ${data[field] ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                    {data[field] && <span className="text-[9px]">✓</span>}
                  </button>
                  <span className={`text-sm font-handwritten ${data[field] ? "line-through opacity-50" : ""}`}>{item}</span>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
