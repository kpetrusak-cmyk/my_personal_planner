import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Props { listId: string; defaultTitle: string; }

export function TodoList({ listId, defaultTitle }: Props) {
  const { user } = useAuth();
  const [title, setTitle] = useState(defaultTitle);
  const [items, setItems] = useState<{ text: string; done: boolean }[]>(
    Array.from({ length: 20 }, () => ({ text: "", done: false }))
  );

  const load = useCallback(async () => {
    if (!user) return;
    // Load title
    const { data: titleData } = await supabase
      .from("planner_entries")
      .select("value")
      .eq("user_id", user.id)
      .eq("page_type", `todolist_${listId}`)
      .eq("date_key", "static")
      .eq("field_name", "title")
      .maybeSingle();
    if (titleData?.value) setTitle(titleData.value);

    // Load items
    const { data } = await supabase
      .from("planner_todos")
      .select("item_index, text, done")
      .eq("user_id", user.id)
      .eq("page_type", `todolist_${listId}`)
      .eq("date_key", "static")
      .order("item_index");
    if (data && data.length > 0) {
      const loaded = Array.from({ length: 20 }, () => ({ text: "", done: false }));
      data.forEach((r: any) => { if (r.item_index < 20) loaded[r.item_index] = { text: r.text, done: r.done }; });
      setItems(loaded);
    }
  }, [user, listId]);

  useEffect(() => { load(); }, [load]);

  const saveTitle = async (val: string) => {
    if (!user) return;
    setTitle(val);
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: `todolist_${listId}`, date_key: "static", field_name: "title", value: val, updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  const saveItem = async (index: number, text: string, done: boolean) => {
    if (!user) return;
    const updated = [...items];
    updated[index] = { text, done };
    setItems(updated);
    await supabase.from("planner_todos").upsert(
      { user_id: user.id, page_type: `todolist_${listId}`, date_key: "static", item_index: index, text, done, updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,item_index" }
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <input
          type="text"
          value={title}
          onChange={(e) => saveTitle(e.target.value)}
          className="planner-heading text-xl bg-transparent text-center outline-none border-b border-transparent focus:border-primary/30 transition-colors w-full"
        />
      </div>

      <section className="planner-card p-4">
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => saveItem(i, item.text, !item.done)}
                className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all active:scale-90 ${
                  item.done ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-accent"
                }`}
              >
                {item.done && <span className="text-xs">✓</span>}
              </button>
              <input
                type="text"
                value={item.text}
                onChange={(e) => saveItem(i, e.target.value, item.done)}
                placeholder={`Item ${i + 1}`}
                className={`planner-input text-sm ${item.done ? "line-through opacity-50" : ""}`}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
