import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const QUADRANTS = [
  { key: "urgent_important", label: "Urgent & Important", emoji: "🔴", color: "hsl(0 60% 65%)" },
  { key: "not_urgent_important", label: "Not Urgent & Important", emoji: "🟡", color: "hsl(42 80% 65%)" },
  { key: "urgent_not_important", label: "Urgent & Not Important", emoji: "🔵", color: "hsl(210 55% 62%)" },
  { key: "neither", label: "Neither", emoji: "⚪", color: "hsl(300 15% 75%)" },
];

interface Props { date: Date; }

export function PriorityMatrix({ date }: Props) {
  const { user } = useAuth();
  const dateKey = format(date, "yyyy-MM-dd");
  const [items, setItems] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("planner_entries")
      .select("field_name, value")
      .eq("user_id", user.id)
      .eq("page_type", "priority_matrix")
      .eq("date_key", dateKey);
    const m: Record<string, string> = {};
    data?.forEach((r: any) => { m[r.field_name] = r.value; });
    setItems(m);
  }, [user, dateKey]);

  useEffect(() => { load(); }, [load]);

  const save = async (field: string, value: string) => {
    if (!user) return;
    setItems((p) => ({ ...p, [field]: value }));
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "priority_matrix", date_key: dateKey, field_name: field, value, updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="planner-heading text-xl">Priority Matrix</p>
        <p className="text-xs text-muted-foreground">{format(date, "EEEE, MMMM d")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {QUADRANTS.map((q) => (
          <section key={q.key} className="planner-card p-3" style={{ borderLeft: `3px solid ${q.color}` }}>
            <h3 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: q.color }}>
              {q.emoji} {q.label}
            </h3>
            <textarea
              value={items[q.key] || ""}
              onChange={(e) => save(q.key, e.target.value)}
              placeholder="Add tasks..."
              className="planner-input text-sm min-h-[80px] resize-none"
              rows={4}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
