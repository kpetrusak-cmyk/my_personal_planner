import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, addDays } from "date-fns";

interface Props { date: Date; }

const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

export function MealPlanner({ date }: Props) {
  const { user } = useAuth();
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekKey = format(weekStart, "yyyy-MM-dd");
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const [data, setData] = useState<Record<string, string>>({});
  const [shoppingList, setShoppingList] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    const { data: rows } = await supabase
      .from("planner_entries")
      .select("field_name, value")
      .eq("user_id", user.id)
      .eq("page_type", "meal_planner")
      .eq("date_key", weekKey);
    const m: Record<string, string> = {};
    rows?.forEach((r: any) => { m[r.field_name] = r.value; });
    setData(m);
    setShoppingList(m["shopping_list"] || "");
  }, [user, weekKey]);

  useEffect(() => { load(); }, [load]);

  const save = async (field: string, value: string) => {
    if (!user) return;
    setData((p) => ({ ...p, [field]: value }));
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "meal_planner", date_key: weekKey, field_name: field, value, updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="planner-heading text-xl">Meal Planner</p>
        <p className="text-xs text-muted-foreground">Week of {format(weekStart, "MMM d")}</p>
      </div>

      {days.map((day) => {
        const dayKey = format(day, "EEE").toLowerCase();
        return (
          <section key={dayKey} className="planner-card p-3">
            <h3 className="text-xs font-bold text-foreground/70 mb-2">{format(day, "EEEE")}</h3>
            <div className="grid grid-cols-2 gap-2">
              {MEALS.map((meal) => {
                const fieldKey = `${dayKey}_${meal.toLowerCase()}`;
                return (
                  <div key={meal}>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">{meal}</label>
                    <input
                      type="text"
                      value={data[fieldKey] || ""}
                      onChange={(e) => save(fieldKey, e.target.value)}
                      placeholder={meal}
                      className="planner-input text-sm"
                    />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-2">🛒 Shopping List</h3>
        <textarea
          value={shoppingList}
          onChange={(e) => { setShoppingList(e.target.value); save("shopping_list", e.target.value); }}
          placeholder="Items to buy..."
          className="planner-input min-h-[100px] resize-none"
          rows={5}
        />
      </section>
    </div>
  );
}
