import { useState, useEffect, useCallback } from "react";
import { format } from "@/lib/dateUtils";
import { Droplets, Star, Smile } from "lucide-react";
import { TimeBlockSchedule } from "./TimeBlockSchedule";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDateKey } from "@/lib/dateUtils";

interface DailyPlannerProps {
  date: Date;
}

export function DailyPlanner({ date }: DailyPlannerProps) {
  const { user } = useAuth();
  const dateStr = format(date, "EEEE, MMMM d, yyyy");
  const dateKey = formatDateKey(date);
  const [mainFocus, setMainFocus] = useState("");
  const [priorities, setPriorities] = useState(["", "", ""]);
  const [todos, setTodos] = useState<{ text: string; done: boolean }[]>(
    Array.from({ length: 8 }, () => ({ text: "", done: false }))
  );
  const [water, setWater] = useState(0);
  const [mood, setMood] = useState(0);
  const [productivity, setProductivity] = useState(0);
  const [gratitude, setGratitude] = useState("");
  const [brainDump, setBrainDump] = useState("");
  const [meals, setMeals] = useState({ breakfast: "", lunch: "", dinner: "", snack: "" });

  // Load data
  const load = useCallback(async () => {
    if (!user) return;
    const { data: entries } = await supabase
      .from("planner_entries")
      .select("field_name, value")
      .eq("user_id", user.id)
      .eq("page_type", "daily")
      .eq("date_key", dateKey);
    entries?.forEach((r: any) => {
      switch (r.field_name) {
        case "main_focus": setMainFocus(r.value); break;
        case "gratitude": setGratitude(r.value); break;
        case "brain_dump": setBrainDump(r.value); break;
        case "water": setWater(Number(r.value)); break;
        case "mood": setMood(Number(r.value)); break;
        case "productivity": setProductivity(Number(r.value)); break;
        case "priorities": try { setPriorities(JSON.parse(r.value)); } catch {} break;
        case "meals": try { setMeals(JSON.parse(r.value)); } catch {} break;
      }
    });
    const { data: todoData } = await supabase
      .from("planner_todos")
      .select("item_index, text, done")
      .eq("user_id", user.id)
      .eq("page_type", "daily")
      .eq("date_key", dateKey)
      .order("item_index");
    if (todoData && todoData.length > 0) {
      const loaded = Array.from({ length: 8 }, () => ({ text: "", done: false }));
      todoData.forEach((r: any) => { if (r.item_index < 8) loaded[r.item_index] = { text: r.text, done: r.done }; });
      setTodos(loaded);
    }
  }, [user, dateKey]);

  useEffect(() => { load(); }, [load]);

  // Auto-save helpers
  const saveEntry = useCallback(async (field: string, value: string) => {
    if (!user) return;
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "daily", date_key: dateKey, field_name: field, value, updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  }, [user, dateKey]);

  const saveTodo = useCallback(async (index: number, text: string, done: boolean) => {
    if (!user) return;
    await supabase.from("planner_todos").upsert(
      { user_id: user.id, page_type: "daily", date_key: dateKey, item_index: index, text, done, updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,item_index" }
    );
  }, [user, dateKey]);

  const updatePriority = (i: number, val: string) => {
    const next = [...priorities]; next[i] = val; setPriorities(next);
    saveEntry("priorities", JSON.stringify(next));
  };

  const toggleTodo = (i: number) => {
    const next = [...todos]; next[i] = { ...next[i], done: !next[i].done }; setTodos(next);
    saveTodo(i, next[i].text, next[i].done);
  };

  const updateTodo = (i: number, text: string) => {
    const next = [...todos]; next[i] = { ...next[i], text }; setTodos(next);
    saveTodo(i, text, next[i].done);
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{dateStr}</p>
      </div>

      {/* Main Focus */}
      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-2">✦ Main Focus</h3>
        <input
          type="text" value={mainFocus}
          onChange={(e) => { setMainFocus(e.target.value); saveEntry("main_focus", e.target.value); }}
          placeholder="What matters most today?"
          className="planner-input text-lg"
        />
      </section>

      {/* Top Priorities */}
      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-3">Top 3 Priorities</h3>
        <div className="space-y-2">
          {priorities.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-bold text-accent w-5 text-center">{i + 1}</span>
              <input type="text" value={p} onChange={(e) => updatePriority(i, e.target.value)} placeholder={`Priority ${i + 1}`} className="planner-input" />
            </div>
          ))}
        </div>
      </section>

      {/* Time Block Schedule */}
      <TimeBlockSchedule date={date} />

      {/* To-Do List */}
      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-3">To-Do List</h3>
        <div className="space-y-1.5">
          {todos.map((todo, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => toggleTodo(i)}
                className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all active:scale-90 ${
                  todo.done ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-accent"
                }`}
              >
                {todo.done && <span className="text-xs">✓</span>}
              </button>
              <input type="text" value={todo.text} onChange={(e) => updateTodo(i, e.target.value)} placeholder="Add task..." className={`planner-input ${todo.done ? "line-through opacity-50" : ""}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Meals */}
      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-3">🍽 Meals</h3>
        <div className="grid grid-cols-2 gap-3">
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((meal) => (
            <div key={meal}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{meal}</label>
              <input type="text" value={meals[meal]} onChange={(e) => { const m = { ...meals, [meal]: e.target.value }; setMeals(m); saveEntry("meals", JSON.stringify(m)); }} placeholder={meal} className="planner-input text-sm" />
            </div>
          ))}
        </div>
      </section>

      {/* Water + Mood + Productivity */}
      <section className="planner-card p-4">
        <div className="space-y-4">
          <div>
            <h3 className="planner-heading text-base mb-2">💧 Water</h3>
            <div className="flex gap-1.5">
              {Array.from({ length: 8 }, (_, i) => (
                <button key={i} onClick={() => { const v = water === i + 1 ? i : i + 1; setWater(v); saveEntry("water", String(v)); }} className={`water-drop ${i < water ? "filled" : "empty"}`}>
                  <Droplets className="w-full h-full" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Mood</span>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => { setMood(s); saveEntry("mood", String(s)); }} className={`star-rating ${s <= mood ? "filled" : "empty"}`}>
                    <Smile className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Productivity</span>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => { setProductivity(s); saveEntry("productivity", String(s)); }} className={`star-rating ${s <= productivity ? "filled" : "empty"}`}>
                    <Star className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gratitude */}
      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-2">🙏 Gratitude</h3>
        <textarea value={gratitude} onChange={(e) => { setGratitude(e.target.value); saveEntry("gratitude", e.target.value); }} placeholder="What are you grateful for today?" className="planner-input min-h-[60px] resize-none" rows={3} />
      </section>

      {/* Brain Dump */}
      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-2">🧠 Brain Dump</h3>
        <textarea value={brainDump} onChange={(e) => { setBrainDump(e.target.value); saveEntry("brain_dump", e.target.value); }} placeholder="Get it all out of your head..." className="planner-input min-h-[80px] resize-none" rows={4} />
      </section>
    </div>
  );
}
