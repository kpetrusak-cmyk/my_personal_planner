import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

interface Book { title: string; author: string; genre: string; review: string; stars: number; }
const EMPTY_BOOK: Book = { title: "", author: "", genre: "", review: "", stars: 0 };

export function BookTracker() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>(Array.from({ length: 6 }, () => ({ ...EMPTY_BOOK })));
  const [readingList, setReadingList] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("planner_entries")
      .select("field_name, value")
      .eq("user_id", user.id)
      .eq("page_type", "book_tracker")
      .eq("date_key", "2026");
    if (!data) return;
    const loaded = Array.from({ length: 6 }, () => ({ ...EMPTY_BOOK }));
    data.forEach((r: any) => {
      if (r.field_name === "reading_list") { setReadingList(r.value); return; }
      const match = r.field_name.match(/^book_(\d+)$/);
      if (match) { try { loaded[parseInt(match[1])] = JSON.parse(r.value); } catch {} }
    });
    setBooks(loaded);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const saveBook = async (index: number, book: Book) => {
    if (!user) return;
    const updated = [...books]; updated[index] = book; setBooks(updated);
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "book_tracker", date_key: "2026", field_name: `book_${index}`, value: JSON.stringify(book), updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  const saveReadingList = async (val: string) => {
    if (!user) return;
    setReadingList(val);
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "book_tracker", date_key: "2026", field_name: "reading_list", value: val, updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2"><p className="planner-heading text-xl">📚 Book Tracker</p></div>
      {books.map((book, i) => (
        <section key={i} className="planner-card p-4 space-y-1.5">
          <input value={book.title} onChange={(e) => saveBook(i, { ...book, title: e.target.value })} placeholder="Book title" className="planner-input" />
          <div className="flex gap-2">
            <input value={book.author} onChange={(e) => saveBook(i, { ...book, author: e.target.value })} placeholder="Author" className="planner-input text-sm flex-1" />
            <input value={book.genre} onChange={(e) => saveBook(i, { ...book, genre: e.target.value })} placeholder="Genre" className="planner-input text-sm w-24" />
          </div>
          <textarea value={book.review} onChange={(e) => saveBook(i, { ...book, review: e.target.value })} placeholder="Review..." className="planner-input text-sm min-h-[40px] resize-none" rows={2} />
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => saveBook(i, { ...book, stars: s })} className={`star-rating ${s <= book.stars ? "filled" : "empty"}`}>
                <Star className="w-5 h-5" />
              </button>
            ))}
          </div>
        </section>
      ))}
      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-2">📖 Reading List</h3>
        <textarea value={readingList} onChange={(e) => saveReadingList(e.target.value)} placeholder="Books to read..." className="planner-input min-h-[80px] resize-none" rows={4} />
      </section>
    </div>
  );
}
