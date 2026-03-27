import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = ["Learn", "Travel", "Read", "Achieve", "Try", "Visit"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function YearlyGoals() {
  const { user } = useAuth();
  const [data, setData] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!user) return;
    const { data: rows } = await supabase.from("planner_entries").select("field_name, value").eq("user_id", user.id).eq("page_type", "yearly_goals").eq("date_key", "2026");
    const m: Record<string, string> = {};
    rows?.forEach((r: any) => { m[r.field_name] = r.value; });
    setData(m);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async (field: string, value: string) => {
    if (!user) return;
    setData((p) => ({ ...p, [field]: value }));
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "yearly_goals", date_key: "2026", field_name: field, value, updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2"><p className="planner-heading text-xl">Yearly Goals 2026</p></div>
      {CATEGORIES.map((cat) => (
        <section key={cat} className="planner-card p-4">
          <h3 className="planner-heading text-base mb-2">{cat}</h3>
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((month, mi) => {
              const field = `${cat.toLowerCase()}_${mi}`;
              return (
                <div key={mi}>
                  <label className="text-[9px] font-bold uppercase text-muted-foreground">{month}</label>
                  <input
                    type="text"
                    value={data[field] || ""}
                    onChange={(e) => save(field, e.target.value)}
                    className="planner-input text-xs"
                    placeholder="..."
                  />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
