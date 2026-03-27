import { X, CalendarDays, Calendar, Sun, Heart, Target, BookOpen, Palette, DollarSign, FileText, Sparkles, Home, Dumbbell, Moon, LogOut, Type } from "lucide-react";
import type { NavTab } from "./BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { usePlannerTheme, PLANNER_THEMES, HANDWRITING_FONTS } from "@/hooks/usePlannerTheme";

interface SlideMenuProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
}

const menuSections = [
  {
    label: "Planning",
    icon: Sparkles,
    items: [
      { id: "daily" as NavTab, label: "Daily Planner" },
      { id: "weekly" as NavTab, label: "Weekly Planner" },
      { id: "monthly" as NavTab, label: "Monthly Calendar" },
      { id: "priority_matrix" as NavTab, label: "Priority Matrix" },
      { id: "todo1" as NavTab, label: "To-Do List 1" },
      { id: "todo2" as NavTab, label: "To-Do List 2" },
    ],
  },
  {
    label: "Wellness",
    icon: Heart,
    items: [
      { id: "mood" as NavTab, label: "Mood Tracker" },
      { id: "sleep" as NavTab, label: "Sleep Tracker" },
      { id: "exercise" as NavTab, label: "Exercise Tracker" },
      { id: "skincare" as NavTab, label: "Skincare Routine" },
      { id: "selfcare" as NavTab, label: "Self Care" },
    ],
  },
  {
    label: "Life & Goals",
    icon: Target,
    items: [
      { id: "vision" as NavTab, label: "Vision Board" },
      { id: "goal_setting" as NavTab, label: "Goal Setting" },
      { id: "habit" as NavTab, label: "Habit Tracker" },
      { id: "yearly_goals" as NavTab, label: "Yearly Goals" },
      { id: "bucket_list" as NavTab, label: "Bucket List" },
    ],
  },
  {
    label: "Culture",
    icon: BookOpen,
    items: [
      { id: "book" as NavTab, label: "Book Tracker" },
      { id: "movie" as NavTab, label: "Movie Tracker" },
      { id: "recipe" as NavTab, label: "Recipe Cards" },
    ],
  },
  {
    label: "Notes",
    icon: FileText,
    items: [
      { id: "gratitude" as NavTab, label: "Gratitude Journal" },
      { id: "therapy" as NavTab, label: "Therapy Notes" },
      { id: "lined_notes" as NavTab, label: "Lined Notes" },
      { id: "dotted_notes" as NavTab, label: "Dotted Notes" },
      { id: "grid_notes" as NavTab, label: "Grid Notes" },
      { id: "reflection" as NavTab, label: "Monthly Reflection" },
    ],
  },
  {
    label: "Finance",
    icon: DollarSign,
    items: [
      { id: "budget" as NavTab, label: "Budget Tracker" },
      { id: "savings" as NavTab, label: "Savings Tracker" },
    ],
  },
  {
    label: "Home",
    icon: Home,
    items: [
      { id: "meal_planner" as NavTab, label: "Meal Planner" },
      { id: "cleaning" as NavTab, label: "Cleaning Schedule" },
    ],
  },
];

export function SlideMenu({ open, onClose, onNavigate }: SlideMenuProps) {
  const { signOut } = useAuth();
  const { theme, setThemeById, handwritingFont, setHandwritingFontById } = usePlannerTheme();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-card shadow-xl transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h2 className="planner-heading text-lg">My Planner</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary active:scale-95 transition-all">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-60px-56px)] py-2">
          {/* Theme picker */}
          <div className="mb-2 px-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-3.5 h-3.5 text-accent" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Theme
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {PLANNER_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setThemeById(t.id)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all active:scale-95 ${
                    theme.id === t.id
                      ? "ring-2 ring-primary/60 bg-secondary/60"
                      : "hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex gap-0.5">
                    {t.swatch.map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-foreground/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-foreground/70">{t.emoji} {t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font picker */}
          <div className="mb-2 px-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-3.5 h-3.5 text-accent" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Handwriting Font
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {HANDWRITING_FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setHandwritingFontById(f.id)}
                  className={`py-2 px-2 rounded-lg text-left transition-all active:scale-95 ${
                    handwritingFont.id === f.id
                      ? "ring-2 ring-primary/60 bg-secondary/60"
                      : "hover:bg-secondary/40"
                  }`}
                >
                  <span
                    className="text-sm text-foreground/80 block truncate"
                    style={{ fontFamily: `${f.family}, cursive` }}
                  >
                    {f.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-border/30 mx-4 mb-1" />

          {menuSections.map((section) => (
            <div key={section.label} className="mb-1">
              <div className="px-4 py-2 flex items-center gap-2">
                <section.icon className="w-3.5 h-3.5 text-accent" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {section.label}
                </span>
              </div>
              {section.items.map((item, i) => (
                <button
                  key={`${section.label}-${i}`}
                  onClick={() => { onNavigate(item.id); onClose(); }}
                  className="w-full text-left px-6 py-2.5 text-sm text-foreground/80 hover:bg-secondary/60 active:scale-[0.98] transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border/40 p-3">
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-destructive bg-destructive/8 hover:bg-destructive/15 active:scale-[0.98] transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}