import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Star } from "lucide-react";

interface Props { date: Date; }

const FIELDS = [
  { key: "achievements", label: "Achievements", emoji: "🏆" },
  { key: "best_experience", label: "Best Experience", emoji: "⭐" },
  { key: "new_habits", label: "New Habits Formed", emoji: "🌱" },
  { key: "lessons", label: "Life Lessons", emoji: "💡" },
  { key: "affirmation", label: "Affirmation", emoji: "💪" },
];

export function MonthlyReflection({ date }: Props) {
  const { user } = useAuth();
  const monthKey = format(date, "yyyy-MM");
  const [data, setData] = useState<Record<string, string>>({});
  const [rating, setRating] = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    const { data: rows } = await supabase.from("planner_entries").select("field_name, value").eq("user_id", user.id).eq("page_type", "reflection").eq("date_key", monthKey);
    const m: Record<string, string> = {};
    rows?.forEach((r: any) => {
      if (r.field_name === "rating") { setRating(Number(r.value)); return; }
      m[r.field_name] = r.value;
    });
    setData(m);
  }, [user, monthKey]);

  useEffect(() => { load(); }, [load]);

  const save = async (field: string, value: string) => {
    if (!user) return;
    setData((p) => ({ ...p, [field]: value }));
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "reflection", date_key: monthKey, field_name: field, value, updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  const saveRating = async (val: number) => {
    setRating(val);
    if (!user) return;
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "reflection", date_key: monthKey, field_name: "rating", value: String(val), updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="planner-heading text-xl">Monthly Reflection</p>
        <p className="text-xs text-muted-foreground">{format(date, "MMMM yyyy")}</p>
      </div>

      {FIELDS.map((f) => (
        <section key={f.key} className="planner-card p-4">
          <h3 className="planner-heading text-base mb-2">{f.emoji} {f.label}</h3>
          <textarea value={data[f.key] || ""} onChange={(e) => save(f.key, e.target.value)} placeholder={`${f.label}...`} className="planner-input min-h-[60px] resize-none" rows={3} />
        </section>
      ))}

      <section className="planner-card p-4 text-center">
        <h3 className="planner-heading text-base mb-2">Overall Rating</h3>
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => saveRating(s)} className={`star-rating ${s <= rating ? "filled" : "empty"}`}>
              <Star className="w-7 h-7" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
