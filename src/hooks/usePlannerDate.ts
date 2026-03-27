import { useState, useCallback } from "react";
import { addDays, subWeeks, addWeeks, subMonths, addMonths, setYear } from "date-fns";

export function usePlannerDate() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const goToToday = useCallback(() => setCurrentDate(new Date()), []);
  const prevDay = useCallback(() => setCurrentDate(d => addDays(d, -1)), []);
  const nextDay = useCallback(() => setCurrentDate(d => addDays(d, 1)), []);
  const prevWeek = useCallback(() => setCurrentDate(d => subWeeks(d, 1)), []);
  const nextWeek = useCallback(() => setCurrentDate(d => addWeeks(d, 1)), []);
  const prevMonth = useCallback(() => setCurrentDate(d => subMonths(d, 1)), []);
  const nextMonth = useCallback(() => setCurrentDate(d => addMonths(d, 1)), []);
  const changeYear = useCallback((year: number) => setCurrentDate(d => setYear(d, year)), []);

  return {
    currentDate, setCurrentDate,
    goToToday, prevDay, nextDay, prevWeek, nextWeek, prevMonth, nextMonth, changeYear,
  };
}