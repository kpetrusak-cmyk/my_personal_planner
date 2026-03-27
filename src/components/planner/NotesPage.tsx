import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Props { variant: "lined" | "dotted" | "grid"; }

export function NotesPage({ variant }: Props) {
  const { user } = useAuth();
  const [content, setContent] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("planner_entries")
      .select("value")
      .eq("user_id", user.id)
      .eq("page_type", `notes_${variant}`)
      .eq("date_key", "static")
      .eq("field_name", "content")
      .maybeSingle();
    if (data?.value) setContent(data.value);
  }, [user, variant]);

  useEffect(() => { load(); }, [load]);

  const save = async (val: string) => {
    if (!user) return;
    setContent(val);
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: `notes_${variant}`, date_key: "static", field_name: "content", value: val, updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  const bgClass = variant === "lined" ? "paper-lined" : variant === "dotted" ? "paper-dotted" : "paper-grid";

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="planner-heading text-xl">{variant.charAt(0).toUpperCase() + variant.slice(1)} Notes</p>
      </div>

      <section className={`planner-card p-4 ${bgClass}`}>
        <textarea
          value={content}
          onChange={(e) => save(e.target.value)}
          placeholder="Write your notes..."
          className="w-full min-h-[60vh] bg-transparent font-handwritten text-lg leading-[32px] resize-none outline-none"
        />
      </section>
    </div>
  );
}
