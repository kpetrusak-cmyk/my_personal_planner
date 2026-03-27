import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PlacedItem {
  id: string;
  type: "sticker" | "washi";
  content: string; // emoji or image URL
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  washiPattern?: WashiPattern;
}

export interface DrawStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: "pen" | "highlighter";
}

export interface WashiPattern {
  name: string;
  colors: string[];
  style: string;
  imageUrl?: string;
}

interface DecorationData {
  placed: PlacedItem[];
  strokes: DrawStroke[];
}

export function useDecorations(pageKey: string) {
  const { user } = useAuth();
  const [placed, setPlaced] = useState<PlacedItem[]>([]);
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [loading, setLoading] = useState(true);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Load decorations for this page
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("planner_entries")
        .select("field_name, value")
        .eq("user_id", user.id)
        .eq("page_type", `decor_${pageKey}`)
        .eq("date_key", "global");
      
      const map: Record<string, string> = {};
      data?.forEach((r: any) => { map[r.field_name] = r.value; });
      
      if (map.placed) {
        try { setPlaced(JSON.parse(map.placed)); } catch {}
      } else { setPlaced([]); }
      if (map.strokes) {
        try { setStrokes(JSON.parse(map.strokes)); } catch {}
      } else { setStrokes([]); }
      setLoading(false);
    })();
  }, [user, pageKey]);

  // Auto-save with debounce
  const save = useCallback((newPlaced: PlacedItem[], newStrokes: DrawStroke[]) => {
    if (!user) return;
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      const base = { user_id: user.id, page_type: `decor_${pageKey}`, date_key: "global", updated_at: new Date().toISOString() };
      await supabase.from("planner_entries").upsert([
        { ...base, field_name: "placed", value: JSON.stringify(newPlaced) },
        { ...base, field_name: "strokes", value: JSON.stringify(newStrokes) },
      ], { onConflict: "user_id,page_type,date_key,field_name" });
    }, 800);
  }, [user, pageKey]);

  const updatePlaced = useCallback((fn: (prev: PlacedItem[]) => PlacedItem[]) => {
    setPlaced(prev => {
      const next = fn(prev);
      save(next, strokes);
      return next;
    });
  }, [save, strokes]);

  const updateStrokes = useCallback((fn: (prev: DrawStroke[]) => DrawStroke[]) => {
    setStrokes(prev => {
      const next = fn(prev);
      save(placed, next);
      return next;
    });
  }, [save, placed]);

  const clearAll = useCallback(() => {
    setPlaced([]);
    setStrokes([]);
    save([], []);
  }, [save]);

  const undo = useCallback(() => {
    if (strokes.length > 0) {
      const next = strokes.slice(0, -1);
      setStrokes(next);
      save(placed, next);
    } else if (placed.length > 0) {
      const next = placed.slice(0, -1);
      setPlaced(next);
      save(next, strokes);
    }
  }, [strokes, placed, save]);

  return { placed, strokes, loading, setPlaced: updatePlaced, setStrokes: updateStrokes, clearAll, undo };
}

// Upload and auto-resize image
export async function uploadDecorationImage(
  file: File,
  type: "sticker" | "washi",
  userId: string
): Promise<string | null> {
  const maxSize = type === "sticker" ? 200 : 400;
  const maxHeight = type === "sticker" ? 200 : 80;

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = async () => {
        // Calculate resize dimensions
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxHeight) {
          const ratio = Math.min(maxSize / w, maxHeight / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        // Draw resized to canvas
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);

        // Convert to blob
        canvas.toBlob(async (blob) => {
          if (!blob) { resolve(null); return; }
          const ext = "png";
          const path = `${userId}/${type}s/${crypto.randomUUID()}.${ext}`;
          const { error } = await supabase.storage
            .from("planner-assets")
            .upload(path, blob, { contentType: "image/png" });
          if (error) { console.error("Upload error:", error); resolve(null); return; }
          const { data } = supabase.storage.from("planner-assets").getPublicUrl(path);
          resolve(data.publicUrl);
        }, "image/png");
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Load user's custom uploads
export async function loadCustomUploads(userId: string, type: "sticker" | "washi"): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from("planner-assets")
    .list(`${userId}/${type}s`, { limit: 50 });
  if (error || !data) return [];
  return data
    .filter(f => f.name !== ".emptyFolderPlaceholder")
    .map(f => supabase.storage.from("planner-assets").getPublicUrl(`${userId}/${type}s/${f.name}`).data.publicUrl);
}

// Delete a custom uploaded image
export async function deleteCustomUpload(url: string, userId: string, type: "sticker" | "washi"): Promise<boolean> {
  // Extract filename from URL
  const prefix = `${userId}/${type}s/`;
  const idx = url.indexOf(prefix);
  if (idx === -1) return false;
  const path = url.substring(idx);
  const { error } = await supabase.storage.from("planner-assets").remove([path]);
  return !error;
}
