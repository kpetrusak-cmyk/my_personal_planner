import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_TILES = [
  { emoji: "💼", text: "Career Growth" },
  { emoji: "✈️", text: "Travel Adventures" },
  { emoji: "🏠", text: "Dream Home" },
  { emoji: "💪", text: "Health & Fitness" },
  { emoji: "📚", text: "Learn New Skills" },
  { emoji: "❤️", text: "Relationships" },
  { emoji: "🎨", text: "Creative Projects" },
  { emoji: "💰", text: "Financial Freedom" },
  { emoji: "🧘", text: "Inner Peace" },
  { emoji: "🌍", text: "Make an Impact" },
  { emoji: "🎯", text: "Big Achievement" },
  { emoji: "✨", text: "Personal Growth" },
];

export function VisionBoard() {
  const { user } = useAuth();
  const [tiles, setTiles] = useState(DEFAULT_TILES);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("planner_entries")
      .select("field_name, value")
      .eq("user_id", user.id)
      .eq("page_type", "vision_board")
      .eq("date_key", "2026");
    if (data && data.length > 0) {
      const loaded = [...DEFAULT_TILES];
      data.forEach((r: any) => {
        const idx = parseInt(r.field_name.replace("tile_", ""));
        if (!isNaN(idx) && loaded[idx]) {
          try { const parsed = JSON.parse(r.value); loaded[idx] = parsed; } catch {}
        }
      });
      setTiles(loaded);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const updateTile = async (index: number, field: "emoji" | "text", value: string) => {
    if (!user) return;
    const updated = [...tiles];
    updated[index] = { ...updated[index], [field]: value };
    setTiles(updated);
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "vision_board", date_key: "2026", field_name: `tile_${index}`, value: JSON.stringify(updated[index]), updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="planner-heading text-xl">Vision Board 2026</p>
        <p className="text-xs text-muted-foreground mt-1">Tap to edit your vision tiles</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile, i) => (
          <div key={i} className="planner-card p-4 text-center space-y-2">
            <input
              type="text"
              value={tile.emoji}
              onChange={(e) => updateTile(i, "emoji", e.target.value)}
              className="text-3xl bg-transparent text-center w-full outline-none"
              maxLength={4}
            />
            <input
              type="text"
              value={tile.text}
              onChange={(e) => updateTile(i, "text", e.target.value)}
              className="text-sm font-handwritten text-center bg-transparent w-full outline-none border-b border-border/30 focus:border-primary/40 transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
