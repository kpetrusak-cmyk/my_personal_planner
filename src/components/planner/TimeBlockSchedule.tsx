import { useState, useEffect, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDateKey } from "@/lib/dateUtils";

interface TimeBlock {
  id?: string;
  start_time: string;
  end_time: string;
  activity: string;
  color: string;
}

const COLORS = [
  "#c4a8c1", "#7d5b7a", "#d4a5c7", "#a8d5ba",
  "#f5c6aa", "#aec6e0", "#f0e68c", "#e8a8a8",
  "#b8c9d9", "#d4c5a0", "#c1d5c0", "#e0b8c8",
  "#a8c0c8", "#d9c4b0", "#c8b8d4", "#b0c4a8",
];

function generateTimeOptions() {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      opts.push(`${hh}:${mm}`);
    }
  }
  return opts;
}

const TIME_OPTIONS = generateTimeOptions();

function formatTime12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

interface Props {
  date: Date;
}

export function TimeBlockSchedule({ date }: Props) {
  const { user } = useAuth();
  const dateKey = formatDateKey(date);
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [adding, setAdding] = useState(false);
  const [newBlock, setNewBlock] = useState<TimeBlock>({ start_time: "09:00", end_time: "10:00", activity: "", color: COLORS[0] });

  const loadBlocks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("time_blocks")
      .select("*")
      .eq("user_id", user.id)
      .eq("date_key", dateKey)
      .order("start_time");
    if (data) setBlocks(data);
  }, [user, dateKey]);

  useEffect(() => { loadBlocks(); }, [loadBlocks]);

  const addBlock = async () => {
    if (!user || !newBlock.activity) return;
    await supabase.from("time_blocks").insert({
      user_id: user.id,
      date_key: dateKey,
      ...newBlock,
    });
    setAdding(false);
    setNewBlock({ start_time: "09:00", end_time: "10:00", activity: "", color: COLORS[0] });
    loadBlocks();
  };

  const removeBlock = async (id: string) => {
    await supabase.from("time_blocks").delete().eq("id", id);
    loadBlocks();
  };

  return (
    <section className="planner-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="planner-heading text-base">⏰ Time Blocks</h3>
        <button
          onClick={() => setAdding(!adding)}
          className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 text-primary" />
        </button>
      </div>

      {adding && (
        <div className="space-y-2 mb-3 p-3 bg-secondary/50 rounded-lg">
          <input
            type="text"
            value={newBlock.activity}
            onChange={(e) => setNewBlock({ ...newBlock, activity: e.target.value })}
            placeholder="Activity name"
            className="planner-input text-sm"
          />
          <div className="flex gap-2">
            <select
              value={newBlock.start_time}
              onChange={(e) => setNewBlock({ ...newBlock, start_time: e.target.value })}
              className="flex-1 text-xs bg-background border border-border rounded-lg px-2 py-1.5"
            >
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{formatTime12(t)}</option>)}
            </select>
            <span className="text-xs text-muted-foreground self-center">to</span>
            <select
              value={newBlock.end_time}
              onChange={(e) => setNewBlock({ ...newBlock, end_time: e.target.value })}
              className="flex-1 text-xs bg-background border border-border rounded-lg px-2 py-1.5"
            >
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{formatTime12(t)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewBlock({ ...newBlock, color: c })}
                className={`w-6 h-6 rounded-full border-2 transition-all ${newBlock.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button onClick={addBlock} className="w-full bg-primary text-primary-foreground text-sm py-2 rounded-lg font-semibold active:scale-[0.98] transition-all">
            Add Block
          </button>
        </div>
      )}

      <div className="space-y-1.5">
        {blocks.length === 0 && !adding && (
          <p className="text-xs text-muted-foreground text-center py-2">No time blocks yet. Tap + to add one.</p>
        )}
        {blocks.map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: b.color + "25", borderLeft: `3px solid ${b.color}` }}
          >
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{b.activity}</p>
              <p className="text-[11px] text-muted-foreground">{formatTime12(b.start_time)} – {formatTime12(b.end_time)}</p>
            </div>
            <button onClick={() => b.id && removeBlock(b.id)} className="p-1 hover:bg-destructive/10 rounded active:scale-90 transition-all">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
