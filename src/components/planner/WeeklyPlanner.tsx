import { useState } from "react";
import { format, getWeekDays } from "@/lib/dateUtils";

interface WeeklyPlannerProps {
  date: Date;
}

export function WeeklyPlanner({ date }: WeeklyPlannerProps) {
  const days = getWeekDays(date);
  const weekLabel = `${format(days[0], "MMM d")} – ${format(days[6], "MMM d, yyyy")}`;
  const [weekGoal, setWeekGoal] = useState("");
  const [brainDump, setBrainDump] = useState("");
  const [dayNotes, setDayNotes] = useState<Record<string, string>>({});

  const updateDayNote = (dateKey: string, value: string) => {
    setDayNotes((prev) => ({ ...prev, [dateKey]: value }));
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{weekLabel}</p>
      </div>

      {/* Week Goal */}
      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-2">🎯 Week's Goal</h3>
        <input
          type="text"
          value={weekGoal}
          onChange={(e) => setWeekGoal(e.target.value)}
          placeholder="What do you want to accomplish this week?"
          className="planner-input"
        />
      </section>

      {/* Days */}
      <section className="space-y-2">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          return (
            <div
              key={key}
              className={`planner-card p-3 ${isToday ? "ring-2 ring-primary/30" : ""}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {format(day, "EEE")}
                </span>
                <span className={`text-xs font-semibold ${isToday ? "text-primary" : "text-foreground/60"}`}>
                  {format(day, "MMM d")}
                </span>
                {isToday && (
                  <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
                    TODAY
                  </span>
                )}
              </div>
              <textarea
                value={dayNotes[key] || ""}
                onChange={(e) => updateDayNote(key, e.target.value)}
                placeholder="Plans, notes, reminders..."
                className="planner-input text-sm min-h-[48px] resize-none"
                rows={2}
              />
            </div>
          );
        })}
      </section>

      {/* Brain Dump */}
      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-2">🧠 Brain Dump</h3>
        <textarea
          value={brainDump}
          onChange={(e) => setBrainDump(e.target.value)}
          placeholder="Anything else on your mind this week..."
          className="planner-input min-h-[80px] resize-none"
          rows={4}
        />
      </section>
    </div>
  );
}
