import { CalendarDays, Calendar, Sun, MoreHorizontal } from "lucide-react";

export type NavTab =
  | "weekly" | "monthly" | "daily" | "all"
  | "mood" | "sleep" | "exercise" | "habit"
  | "vision" | "goals" | "goal_setting" | "priority_matrix"
  | "todo1" | "todo2"
  | "lined_notes" | "dotted_notes" | "grid_notes"
  | "meal_planner" | "cleaning"
  | "book" | "movie"
  | "skincare" | "selfcare"
  | "bucket_list" | "recipe"
  | "budget" | "savings"
  | "gratitude" | "therapy"
  | "reflection" | "yearly_goals";

interface BottomNavProps {
  active: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const tabs: { id: NavTab; label: string; icon: React.ElementType }[] = [
  { id: "weekly", label: "Weekly", icon: CalendarDays },
  { id: "monthly", label: "Monthly", icon: Calendar },
  { id: "daily", label: "Daily", icon: Sun },
  { id: "all", label: "All", icon: MoreHorizontal },
];

export function BottomNav({ active, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-t border-border/50" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-center justify-around max-w-lg mx-auto h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all active:scale-95 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
