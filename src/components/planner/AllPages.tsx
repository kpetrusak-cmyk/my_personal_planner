import type { NavTab } from "./BottomNav";

interface AllPagesProps {
  onNavigate: (tab: NavTab) => void;
}

const pageCategories = [
  {
    label: "Planning",
    emoji: "📋",
    pages: [
      { label: "Weekly Planner", id: "weekly" as NavTab },
      { label: "Monthly Calendar", id: "monthly" as NavTab },
      { label: "Daily Planner", id: "daily" as NavTab },
      { label: "Priority Matrix", id: "priority_matrix" as NavTab },
      { label: "To-Do List 1", id: "todo1" as NavTab },
      { label: "To-Do List 2", id: "todo2" as NavTab },
    ],
  },
  {
    label: "Wellness",
    emoji: "🧘",
    pages: [
      { label: "Mood Tracker", id: "mood" as NavTab },
      { label: "Sleep Tracker", id: "sleep" as NavTab },
      { label: "Exercise Tracker", id: "exercise" as NavTab },
      { label: "Self Care", id: "selfcare" as NavTab },
      { label: "Skincare Routine", id: "skincare" as NavTab },
    ],
  },
  {
    label: "Life & Goals",
    emoji: "🌟",
    pages: [
      { label: "Vision Board 2026", id: "vision" as NavTab },
      { label: "Yearly Goals", id: "yearly_goals" as NavTab },
      { label: "Goal Setting", id: "goal_setting" as NavTab },
      { label: "Habit Tracker", id: "habit" as NavTab },
      { label: "Bucket List", id: "bucket_list" as NavTab },
    ],
  },
  {
    label: "Culture",
    emoji: "📚",
    pages: [
      { label: "Book Tracker", id: "book" as NavTab },
      { label: "Movie Tracker", id: "movie" as NavTab },
      { label: "Recipe Cards", id: "recipe" as NavTab },
    ],
  },
  {
    label: "Notes",
    emoji: "✏️",
    pages: [
      { label: "Gratitude Journal", id: "gratitude" as NavTab },
      { label: "Therapy Notes", id: "therapy" as NavTab },
      { label: "Lined Notes", id: "lined_notes" as NavTab },
      { label: "Dotted Notes", id: "dotted_notes" as NavTab },
      { label: "Grid Notes", id: "grid_notes" as NavTab },
      { label: "Monthly Reflection", id: "reflection" as NavTab },
    ],
  },
  {
    label: "Finance",
    emoji: "💰",
    pages: [
      { label: "Budget Tracker", id: "budget" as NavTab },
      { label: "Savings Tracker", id: "savings" as NavTab },
    ],
  },
  {
    label: "Home",
    emoji: "🏡",
    pages: [
      { label: "Meal Planner", id: "meal_planner" as NavTab },
      { label: "Cleaning Schedule", id: "cleaning" as NavTab },
    ],
  },
];

export function AllPages({ onNavigate }: AllPagesProps) {
  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="planner-heading text-xl">All Pages</p>
        <p className="text-xs text-muted-foreground mt-1">Your complete planner</p>
      </div>

      {pageCategories.map((cat) => (
        <section key={cat.label} className="planner-card p-4">
          <h3 className="text-sm font-bold text-foreground/80 mb-3 flex items-center gap-2">
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {cat.pages.map((page) => (
              <button
                key={page.id}
                onClick={() => onNavigate(page.id)}
                className="text-left text-sm text-foreground/70 bg-secondary/50 hover:bg-secondary px-3 py-2.5 rounded-lg transition-all active:scale-[0.97]"
              >
                {page.label}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
