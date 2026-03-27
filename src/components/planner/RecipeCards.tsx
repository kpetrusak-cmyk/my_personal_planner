import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

interface Recipe { name: string; ingredients: string; instructions: string; stars: number; }
const EMPTY: Recipe = { name: "", ingredients: "", instructions: "", stars: 0 };

export function RecipeCards() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>(Array.from({ length: 4 }, () => ({ ...EMPTY })));

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("planner_entries").select("field_name, value").eq("user_id", user.id).eq("page_type", "recipes").eq("date_key", "2026");
    if (!data) return;
    const loaded = Array.from({ length: 4 }, () => ({ ...EMPTY }));
    data.forEach((r: any) => {
      const m = r.field_name.match(/^recipe_(\d+)$/);
      if (m) { try { loaded[parseInt(m[1])] = JSON.parse(r.value); } catch {} }
    });
    setRecipes(loaded);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const saveRecipe = async (i: number, recipe: Recipe) => {
    if (!user) return;
    const u = [...recipes]; u[i] = recipe; setRecipes(u);
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "recipes", date_key: "2026", field_name: `recipe_${i}`, value: JSON.stringify(recipe), updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2"><p className="planner-heading text-xl">🍳 Recipe Cards</p></div>
      {recipes.map((r, i) => (
        <section key={i} className="planner-card p-4 space-y-2">
          <input value={r.name} onChange={(e) => saveRecipe(i, { ...r, name: e.target.value })} placeholder="Recipe name" className="planner-input" />
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Ingredients</label>
            <textarea value={r.ingredients} onChange={(e) => saveRecipe(i, { ...r, ingredients: e.target.value })} placeholder="List ingredients..." className="planner-input text-sm min-h-[50px] resize-none" rows={3} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Instructions</label>
            <textarea value={r.instructions} onChange={(e) => saveRecipe(i, { ...r, instructions: e.target.value })} placeholder="Steps..." className="planner-input text-sm min-h-[50px] resize-none" rows={3} />
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => saveRecipe(i, { ...r, stars: s })} className={`star-rating ${s <= r.stars ? "filled" : "empty"}`}>
                <Star className="w-5 h-5" />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
