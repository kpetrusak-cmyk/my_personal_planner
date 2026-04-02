import { useState } from "react";
import { format } from "@/lib/dateUtils";
import { usePlannerDate } from "@/hooks/usePlannerDate";
import { useAuth } from "@/hooks/useAuth";
import { PlannerHeader } from "@/components/planner/PlannerHeader";
import { BottomNav, type NavTab } from "@/components/planner/BottomNav";
import { SlideMenu } from "@/components/planner/SlideMenu";
import { DecorationOverlay } from "@/components/planner/DecorationOverlay";
import { DailyPlanner } from "@/components/planner/DailyPlanner";
import { WeeklyPlanner } from "@/components/planner/WeeklyPlanner";
import { MonthlyCalendar } from "@/components/planner/MonthlyCalendar";
import { AllPages } from "@/components/planner/AllPages";
import { MoodTracker } from "@/components/planner/MoodTracker";
import { SleepTracker } from "@/components/planner/SleepTracker";
import { ExerciseTracker } from "@/components/planner/ExerciseTracker";
import { HabitTracker } from "@/components/planner/HabitTracker";
import { VisionBoard } from "@/components/planner/VisionBoard";
import { GoalSetting } from "@/components/planner/GoalSetting";
import { BudgetTracker } from "@/components/planner/BudgetTracker";
import { SavingsTracker } from "@/components/planner/SavingsTracker";
import { GratitudeJournal } from "@/components/planner/GratitudeJournal";
import { TherapyNotes } from "@/components/planner/TherapyNotes";
import { PriorityMatrix } from "@/components/planner/PriorityMatrix";
import { TodoList } from "@/components/planner/TodoList";
import { NotesPage } from "@/components/planner/NotesPage";
import { MealPlanner } from "@/components/planner/MealPlanner";
import { CleaningSchedule } from "@/components/planner/CleaningSchedule";
import { BookTracker } from "@/components/planner/BookTracker";
import { MovieTracker } from "@/components/planner/MovieTracker";
import { SkincareRoutine } from "@/components/planner/SkincareRoutine";
import { SelfCareRoutine } from "@/components/planner/SelfCareRoutine";
import { BucketList } from "@/components/planner/BucketList";
import { RecipeCards } from "@/components/planner/RecipeCards";
import { MonthlyReflection } from "@/components/planner/MonthlyReflection";
import { YearlyGoals } from "@/components/planner/YearlyGoals";

const Index = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("daily");
  const [menuOpen, setMenuOpen] = useState(false);
  const planner = usePlannerDate();

  const currentYear = planner.currentDate.getFullYear();

  const getHeaderProps = () => {
    switch (activeTab) {
      case "daily":
        return { title: format(planner.currentDate, "MMMM d"), subtitle: format(planner.currentDate, "EEEE"), onPrev: planner.prevDay, onNext: planner.nextDay };
      case "weekly":
      case "meal_planner":
      case "exercise":
      case "cleaning":
        return { title: "Weekly View", subtitle: format(planner.currentDate, "MMMM yyyy"), onPrev: planner.prevWeek, onNext: planner.nextWeek };
      case "monthly":
      case "sleep":
      case "budget":
      case "reflection":
        return { title: format(planner.currentDate, "MMMM"), subtitle: format(planner.currentDate, "yyyy"), onPrev: planner.prevMonth, onNext: planner.nextMonth };
      default:
        return { title: "My Planner", subtitle: undefined, onPrev: () => {}, onNext: () => {} };
    }
  };

  const headerProps = getHeaderProps();

  const renderContent = () => {
    switch (activeTab) {
      case "daily": return <DailyPlanner date={planner.currentDate} />;
      case "weekly": return <WeeklyPlanner date={planner.currentDate} />;
      case "monthly": return <MonthlyCalendar date={planner.currentDate} />;
      case "mood": return <MoodTracker />;
      case "sleep": return <SleepTracker date={planner.currentDate} />;
      case "exercise": return <ExerciseTracker date={planner.currentDate} />;
      case "habit": return <HabitTracker />;
      case "vision": return <VisionBoard />;
      case "goal_setting": return <GoalSetting />;
      case "budget": return <BudgetTracker date={planner.currentDate} />;
      case "savings": return <SavingsTracker />;
      case "gratitude": return <GratitudeJournal date={planner.currentDate} />;
      case "therapy": return <TherapyNotes date={planner.currentDate} />;
      case "priority_matrix": return <PriorityMatrix date={planner.currentDate} />;
      case "todo1": return <TodoList listId="1" defaultTitle="To-Do List 1" />;
      case "todo2": return <TodoList listId="2" defaultTitle="To-Do List 2" />;
      case "lined_notes": return <NotesPage variant="lined" />;
      case "dotted_notes": return <NotesPage variant="dotted" />;
      case "grid_notes": return <NotesPage variant="grid" />;
      case "meal_planner": return <MealPlanner date={planner.currentDate} />;
      case "cleaning": return <CleaningSchedule date={planner.currentDate} />;
      case "book": return <BookTracker />;
      case "movie": return <MovieTracker />;
      case "skincare": return <SkincareRoutine />;
      case "selfcare": return <SelfCareRoutine />;
      case "bucket_list": return <BucketList />;
      case "recipe": return <RecipeCards />;
      case "reflection": return <MonthlyReflection date={planner.currentDate} />;
      case "yearly_goals": return <YearlyGoals />;
      case "all": return <AllPages onNavigate={setActiveTab} />;
      default: return <DailyPlanner date={planner.currentDate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SlideMenu open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={setActiveTab} />

      <PlannerHeader
        {...headerProps}
        onToday={planner.goToToday}
        onMenuToggle={() => setMenuOpen(true)}
        currentYear={currentYear}
        onYearChange={planner.changeYear}
      />

      {/* Quick access pills */}
      <div className="sticky top-[57px] z-20 bg-background/95 backdrop-blur-sm border-b border-border/30 px-4 py-2">
        <div className="flex gap-1.5 overflow-x-auto max-w-2xl mx-auto no-scrollbar">
          {([
            { id: "daily" as NavTab, label: "Daily" },
            { id: "mood" as NavTab, label: "Mood" },
            { id: "habit" as NavTab, label: "Habits" },
            { id: "gratitude" as NavTab, label: "Gratitude" },
            { id: "budget" as NavTab, label: "Budget" },
            { id: "vision" as NavTab, label: "Vision" },
            { id: "meal_planner" as NavTab, label: "Meals" },
          ]).map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveTab(pill.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                activeTab === pill.id ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-foreground/60"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-4 bottom-nav-safe">
        <DecorationOverlay pageKey={activeTab} date={planner.currentDate}>
         {renderContent()}
      </DecorationOverlay>
      </main>

      <BottomNav active={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;