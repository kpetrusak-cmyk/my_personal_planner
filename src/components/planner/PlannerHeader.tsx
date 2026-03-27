import { useState } from "react";
import { ChevronLeft, ChevronRight, Menu, CalendarDays } from "lucide-react";

interface PlannerHeaderProps {
  title: string;
  subtitle?: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onMenuToggle: () => void;
  currentYear?: number;
  onYearChange?: (year: number) => void;
}

const MIN_YEAR = 2024;
const MAX_YEAR = 2075;

export function PlannerHeader({ title, subtitle, onPrev, onNext, onToday, onMenuToggle, currentYear, onYearChange }: PlannerHeaderProps) {
  const [showYearPicker, setShowYearPicker] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/40 px-4 py-3">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <button onClick={onMenuToggle} className="p-2 -ml-2 rounded-lg active:scale-95 transition-transform">
          <Menu className="w-5 h-5 text-foreground/70" />
        </button>

        <div className="flex items-center gap-2">
          <button onClick={onPrev} className="p-1.5 rounded-full hover:bg-secondary active:scale-95 transition-all">
            <ChevronLeft className="w-5 h-5 text-primary" />
          </button>
          <div className="text-center min-w-[140px]">
            <h1 className="planner-heading text-xl leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground font-ui mt-0.5">{subtitle}</p>}
            {currentYear !== undefined && onYearChange && (
              <button
                onClick={() => setShowYearPicker(!showYearPicker)}
                className="text-[10px] font-semibold text-primary/70 hover:text-primary mt-0.5 flex items-center gap-0.5 mx-auto transition-colors"
              >
                <CalendarDays className="w-3 h-3" />
                {currentYear}
              </button>
            )}
          </div>
          <button onClick={onNext} className="p-1.5 rounded-full hover:bg-secondary active:scale-95 transition-all">
            <ChevronRight className="w-5 h-5 text-primary" />
          </button>
        </div>

        <button
          onClick={onToday}
          className="text-xs font-semibold text-primary bg-secondary px-3 py-1.5 rounded-full active:scale-95 transition-all"
        >
          Today
        </button>
      </div>

      {/* Year picker dropdown */}
      {showYearPicker && onYearChange && (
        <div className="absolute left-0 right-0 top-full bg-background/98 backdrop-blur-md border-b border-border/40 shadow-lg z-40 max-h-48 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i).map((year) => (
                <button
                  key={year}
                  onClick={() => { onYearChange(year); setShowYearPicker(false); }}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                    year === currentYear
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-foreground/70 hover:bg-secondary"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}