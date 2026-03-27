import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = [
  { key: "travel", label: "Travel", emoji: "✈️" },
  { key: "experiences", label: "Experiences", emoji: "🎪" },
  { key: "skills", label: "Skills", emoji: "🎯" },
  { key: "food", label: "Food", emoji: "🍜" },
  { key: "creative", label: "Creative", emoji: "🎨" },
  { key: "adventures", label: "Adventures", emoji: "🏔" },
];

export function BucketList() {
  const { user } = useAuth();
  const [data, setData] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!user) return;
    const { data: rows } = await supabase.from("planner_entries").select("field_name, value").eq("user_id", user.id).eq("page_type", "bucket_list").eq("date_key", "2026");
    const m: Record<string, string> = {};
    rows?.forEach((r: any) => { m[r.field_name] = r.value; });
    setData(m);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async (field: string, value: string) => {
    if (!user) return;
    setData((p) => ({ ...p, [field]: value }));
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "bucket_list", date_key: "2026", field_name: field, value, updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2"><p className="planner-heading text-xl">🪣 Bucket List 2026</p></div>
      {CATEGORIES.map((cat) => (
        <section key={cat.key} className="planner-card p-4">
          <h3 className="planner-heading text-base mb-2">{cat.emoji} {cat.label}</h3>
          <textarea
            value={data[cat.key] || ""}
            onChange={(e) => save(cat.key, e.target.value)}
            placeholder={`${cat.label} bucket list items...`}
            className="planner-input min-h-[80px] resize-none"
            rows={4}
          />
        </section>
      ))}
    </div>
  );
}
