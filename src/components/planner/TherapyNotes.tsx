import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Props { date: Date; }

const FIELDS = [
  { key: "session_topic", label: "Session Topic", emoji: "📋" },
  { key: "feelings", label: "How I'm Feeling", emoji: "💭" },
  { key: "insights", label: "Key Insights", emoji: "💡" },
  { key: "homework", label: "Homework / Action Items", emoji: "📝" },
  { key: "progress", label: "Progress Notes", emoji: "📈" },
  { key: "next_session", label: "For Next Session", emoji: "🗓" },
];

export function TherapyNotes({ date }: Props) {
  const { user } = useAuth();
  const dateKey = format(date, "yyyy-MM-dd");
  const [data, setData] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!user) return;
    const { data: rows } = await supabase.from("planner_entries").select("field_name, value").eq("user_id", user.id).eq("page_type", "therapy").eq("date_key", dateKey);
    const m: Record<string, string> = {};
    rows?.forEach((r: any) => { m[r.field_name] = r.value; });
    setData(m);
  }, [user, dateKey]);

  useEffect(() => { load(); }, [load]);

  const save = async (field: string, value: string) => {
    if (!user) return;
    setData((p) => ({ ...p, [field]: value }));
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "therapy", date_key: dateKey, field_name: field, value, updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="planner-heading text-xl">Therapy Notes</p>
        <p className="text-xs text-muted-foreground">{format(date, "EEEE, MMMM d, yyyy")}</p>
      </div>
      {FIELDS.map((f) => (
        <section key={f.key} className="planner-card p-4">
          <h3 className="planner-heading text-base mb-2">{f.emoji} {f.label}</h3>
          <textarea
            value={data[f.key] || ""}
            onChange={(e) => save(f.key, e.target.value)}
            placeholder={`${f.label}...`}
            className="planner-input min-h-[60px] resize-none"
            rows={3}
          />
        </section>
      ))}
    </div>
  );
}
