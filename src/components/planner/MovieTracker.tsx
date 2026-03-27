import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

interface Movie { title: string; genre: string; review: string; stars: number; }
const EMPTY: Movie = { title: "", genre: "", review: "", stars: 0 };

export function MovieTracker() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>(Array.from({ length: 6 }, () => ({ ...EMPTY })));
  const [watchList, setWatchList] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("planner_entries").select("field_name, value").eq("user_id", user.id).eq("page_type", "movie_tracker").eq("date_key", "2026");
    if (!data) return;
    const loaded = Array.from({ length: 6 }, () => ({ ...EMPTY }));
    data.forEach((r: any) => {
      if (r.field_name === "watch_list") { setWatchList(r.value); return; }
      const m = r.field_name.match(/^movie_(\d+)$/);
      if (m) { try { loaded[parseInt(m[1])] = JSON.parse(r.value); } catch {} }
    });
    setMovies(loaded);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const saveMovie = async (i: number, movie: Movie) => {
    if (!user) return;
    const u = [...movies]; u[i] = movie; setMovies(u);
    await supabase.from("planner_entries").upsert(
      { user_id: user.id, page_type: "movie_tracker", date_key: "2026", field_name: `movie_${i}`, value: JSON.stringify(movie), updated_at: new Date().toISOString() },
      { onConflict: "user_id,page_type,date_key,field_name" }
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="text-center pt-2"><p className="planner-heading text-xl">🎬 Movie Tracker</p></div>
      {movies.map((m, i) => (
        <section key={i} className="planner-card p-4 space-y-1.5">
          <div className="flex gap-2">
            <input value={m.title} onChange={(e) => saveMovie(i, { ...m, title: e.target.value })} placeholder="Movie title" className="planner-input flex-1" />
            <input value={m.genre} onChange={(e) => saveMovie(i, { ...m, genre: e.target.value })} placeholder="Genre" className="planner-input text-sm w-24" />
          </div>
          <textarea value={m.review} onChange={(e) => saveMovie(i, { ...m, review: e.target.value })} placeholder="Review..." className="planner-input text-sm min-h-[40px] resize-none" rows={2} />
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => saveMovie(i, { ...m, stars: s })} className={`star-rating ${s <= m.stars ? "filled" : "empty"}`}>
                <Star className="w-5 h-5" />
              </button>
            ))}
          </div>
        </section>
      ))}
      <section className="planner-card p-4">
        <h3 className="planner-heading text-base mb-2">🎥 Watch List</h3>
        <textarea value={watchList} onChange={(e) => { setWatchList(e.target.value); if (!user) return; supabase.from("planner_entries").upsert({ user_id: user.id, page_type: "movie_tracker", date_key: "2026", field_name: "watch_list", value: e.target.value, updated_at: new Date().toISOString() }, { onConflict: "user_id,page_type,date_key,field_name" }); }} placeholder="Movies to watch..." className="planner-input min-h-[80px] resize-none" rows={4} />
      </section>
    </div>
  );
}
