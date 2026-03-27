import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Props { date: Date; }

interface Entry { id?: string; category: string; label: string; amount: number; }

const CATEGORIES = [
  { key: "fixed_income", label: "Fixed Income", emoji: "💵" },
  { key: "variable_income", label: "Variable Income", emoji: "💸" },
  { key: "fixed_expenses", label: "Fixed Expenses", emoji: "🏠" },
  { key: "variable_expenses", label: "Variable Expenses", emoji: "🛒" },
  { key: "bills", label: "Bills", emoji: "📄" },
  { key: "debts", label: "Debts", emoji: "💳" },
];

export function BudgetTracker({ date }: Props) {
  const { user } = useAuth();
  const monthKey = format(date, "yyyy-MM");
  const [entries, setEntries] = useState<Record<string, Entry[]>>({});

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("budget_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("month_key", monthKey);
    const grouped: Record<string, Entry[]> = {};
    CATEGORIES.forEach((c) => { grouped[c.key] = []; });
    data?.forEach((r: any) => {
      if (!grouped[r.category]) grouped[r.category] = [];
      grouped[r.category].push(r);
    });
    setEntries(grouped);
  }, [user, monthKey]);

  useEffect(() => { load(); }, [load]);

  const addEntry = async (category: string) => {
    if (!user) return;
    await supabase.from("budget_entries").insert({ user_id: user.id, month_key: monthKey, category, label: "", amount: 0 });
    load();
  };

  const updateEntry = async (id: string, field: "label" | "amount", value: string | number) => {
    await supabase.from("budget_entries").update({ [field]: value, updated_at: new Date().toISOString() }).eq("id", id);
  };

  const removeEntry = async (id: string) => {
    await supabase.from("budget_entries").delete().eq("id", id);
    load();
  };

  const totalIncome = [...(entries.fixed_income || []), ...(entries.variable_income || [])].reduce((s, e) => s + Number(e.amount), 0);
  const totalExpenses = [...(entries.fixed_expenses || []), ...(entries.variable_expenses || []), ...(entries.bills || []), ...(entries.debts || [])].reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2">
        <p className="planner-heading text-xl">Budget Tracker</p>
        <p className="text-xs text-muted-foreground">{format(date, "MMMM yyyy")}</p>
      </div>

      {/* Recap */}
      <section className="planner-card p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Income</p>
            <p className="text-lg font-bold text-sage font-handwritten">${totalIncome.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Expenses</p>
            <p className="text-lg font-bold text-destructive font-handwritten">${totalExpenses.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Balance</p>
            <p className={`text-lg font-bold font-handwritten ${totalIncome - totalExpenses >= 0 ? "text-sage" : "text-destructive"}`}>
              ${(totalIncome - totalExpenses).toFixed(0)}
            </p>
          </div>
        </div>
      </section>

      {CATEGORIES.map((cat) => (
        <section key={cat.key} className="planner-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="planner-heading text-base">{cat.emoji} {cat.label}</h3>
            <button
              onClick={() => addEntry(cat.key)}
              className="text-xs text-primary font-semibold active:scale-95 transition-all"
            >
              + Add
            </button>
          </div>
          <div className="space-y-1.5">
            {(entries[cat.key] || []).map((entry) => (
              <div key={entry.id} className="flex items-center gap-2">
                <input
                  type="text"
                  defaultValue={entry.label}
                  onBlur={(e) => entry.id && updateEntry(entry.id, "label", e.target.value)}
                  placeholder="Description"
                  className="planner-input text-sm flex-1"
                />
                <input
                  type="number"
                  defaultValue={entry.amount}
                  onBlur={(e) => entry.id && updateEntry(entry.id, "amount", Number(e.target.value))}
                  className="w-20 text-sm text-right font-handwritten bg-transparent border-b border-border/50 focus:border-primary/40 focus:outline-none"
                />
                <button onClick={() => entry.id && removeEntry(entry.id)} className="text-xs text-destructive/60 hover:text-destructive active:scale-90">✕</button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
