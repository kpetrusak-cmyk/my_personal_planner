import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Debounced auto-save for planner_entries
export function useAutoSaveEntry(pageType: string, dateKey: string, fieldName: string, value: string) {
  const { user } = useAuth();
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!user || !value && value !== "") return;
    clearTimeout(timeout.current);
    timeout.current = setTimeout(async () => {
      await supabase.from("planner_entries").upsert(
        { user_id: user.id, page_type: pageType, date_key: dateKey, field_name: fieldName, value, updated_at: new Date().toISOString() },
        { onConflict: "user_id,page_type,date_key,field_name" }
      );
    }, 500);
    return () => clearTimeout(timeout.current);
  }, [user, pageType, dateKey, fieldName, value]);
}

// Load entries for a page
export function useLoadEntries(pageType: string, dateKey: string) {
  const { user } = useAuth();
  const loaded = useRef(false);

  const load = useCallback(async () => {
    if (!user) return {};
    const { data } = await supabase
      .from("planner_entries")
      .select("field_name, value")
      .eq("user_id", user.id)
      .eq("page_type", pageType)
      .eq("date_key", dateKey);
    const result: Record<string, string> = {};
    data?.forEach((r: any) => { result[r.field_name] = r.value; });
    return result;
  }, [user, pageType, dateKey]);

  return { load, loaded };
}

// Auto-save for todos
export function useAutoSaveTodo(pageType: string, dateKey: string) {
  const { user } = useAuth();
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const save = useCallback((index: number, text: string, done: boolean) => {
    if (!user) return;
    clearTimeout(timeout.current);
    timeout.current = setTimeout(async () => {
      await supabase.from("planner_todos").upsert(
        { user_id: user.id, page_type: pageType, date_key: dateKey, item_index: index, text, done, updated_at: new Date().toISOString() },
        { onConflict: "user_id,page_type,date_key,item_index" }
      );
    }, 500);
  }, [user, pageType, dateKey]);

  const loadTodos = useCallback(async () => {
    if (!user) return [];
    const { data } = await supabase
      .from("planner_todos")
      .select("item_index, text, done")
      .eq("user_id", user.id)
      .eq("page_type", pageType)
      .eq("date_key", dateKey)
      .order("item_index");
    return data || [];
  }, [user, pageType, dateKey]);

  return { save, loadTodos };
}
