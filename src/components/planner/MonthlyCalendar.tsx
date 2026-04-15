import { useState } from "react";
import { format, getMonthCalendarDays, startOfMonth, isSameDay } from "@/lib/dateUtils";

interface MonthlyCalendarProps {
  date: Date;
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthlyCalendar({ date }: MonthlyCalendarProps) {
  const monthStart = startOfMonth(date);
  const days = getMonthCalendarDays(date);
  const currentMonth = date.getMonth();
  const [cellNotes, setCellNotes] = useState<Record<string, string>>({});
  const [goals, setGoals] = useState("");
  const [notes, setNotes] = useState("");
  const [reminders, setReminders] = useState("");

  const updateCell = (key: string, value: string) => {
    setCellNotes((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="planner-heading text-xl">{format(date, "MMMM yyyy")}</p>
      </div>

{/* Calendar Grid */}
<div className="w-full max-w-[900px] mx-auto aspect-square relative">
  <section className="planner-card p-3 h-full">
    {/* Day headers */}
    <div className="grid grid-cols-7 mb-1">
      {dayLabels.map((d) => (
        <div
          key={d}
          className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-1"
        >
          {d}
        </div>
      ))}
    </div>

    {/* Day cells */}
    <div className="grid grid-cols-7 gap-px bg-border/30 rounded-lg overflow-hidden h-full">
      {days.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const isCurrentMonth = day.getMonth() === currentMonth;
        const today = isSameDay(day, new Date());
        return (
          <div
            key={key}
            className={`min-h-[52px] p-1 bg-card ${
              !isCurrentMonth ? "opacity-30" : ""
            } ${today ? "ring-1 ring-inset ring-primary/40" : ""}`}
          >
            <div
              className={`text-[10px] font-bold mb-0.5 ${
                today ? "text-primary" : "text-foreground/60"
              }`}
            >
              {format(day, "d")}
            </div>
            <input
              type="text"
              value={cellNotes[key] || ""}
              onChange={(e) => updateCell(key, e.target.value)}
              className="w-full text-[10px] font-handwritten bg-transparent outline-none placeholder:text-border"
              placeholder="·"
            />
          </div>
        );
      })}
    </div>
  </section>
</div>

      {/* Footer sections */}
      <div className="grid grid-cols-1 gap-3">
        <section className="planner-card p-4">
          <h3 className="planner-heading text-base mb-2">🎯 Monthly Goals</h3>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="What do you want to achieve this month?"
            className="planner-input text-sm min-h-[48px] resize-none"
            rows={2}
          />
        </section>
        <section className="planner-card p-4">
          <h3 className="planner-heading text-base mb-2">📝 Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Monthly notes..."
            className="planner-input text-sm min-h-[48px] resize-none"
            rows={2}
          />
        </section>
        <section className="planner-card p-4">
          <h3 className="planner-heading text-base mb-2">🔔 Reminders</h3>
          <textarea
            value={reminders}
            onChange={(e) => setReminders(e.target.value)}
            placeholder="Don't forget..."
            className="planner-input text-sm min-h-[48px] resize-none"
            rows={2}
          />
        </section>
      </div>
    </div>
  );
}
