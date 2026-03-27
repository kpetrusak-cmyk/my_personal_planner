import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Props { date: Date; }

export function GratitudeJournal({ date }: Props) {
  const { user } = useAuth();
  const dateKey = format(date, "yyyy-MM-dd");
  const [morning, setMorning] = useState("");
  const [evening, setEvening] = useState("");
  const [reflection, setReflection] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("planner_entries")
      .select("field_name, value")
      .eq("user_id", user.id)
      .eq("page_type", "gratitude")
      .eq("date_key", dateKey);
    data?.forEach((r: any) => {
      if (r.field_name === "morning") setMorning(r.value);
      if (r.field_name === "evening") setEvening(r.value);
      if (r.field_name === "reflection") setReflection(r.value);
    });
  }, [user, dateKey]);

  useEffect(() => { load(); }, [load]);

  const save = async (field: string, value: string) => {
    if (!user) return;
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "gratitude", date_key: dateKey, field_name: field, value, updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="planner-heading text-xl">Gratitude Journal</p>
        <p className="text-xs text-muted-foreground">{format(date, "EEEE, MMMM d, yyyy")}</p>
      </div>

      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-2">🌅 Morning Gratitude</h3>
        <textarea
          value={morning}
          onChange={(e) => { setMorning(e.target.value); save("morning", e.target.value); }}
          placeholder="I am grateful for..."
          className="planner-input min-h-[80px] resize-none"
          rows={4}
        />
      </section>

      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-2">🌙 Evening Gratitude</h3>
        <textarea
          value={evening}
          onChange={(e) => { setEvening(e.target.value); save("evening", e.target.value); }}
          placeholder="Today I appreciated..."
          className="planner-input min-h-[80px] resize-none"
          rows={4}
        />
      </section>

      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-2">🪞 Reflection</h3>
        <textarea
          value={reflection}
          onChange={(e) => { setReflection(e.target.value); save("reflection", e.target.value); }}
          placeholder="What did I learn today?"
          className="planner-input min-h-[80px] resize-none"
          rows={4}
        />
      </section>
    </div>
  );
}
