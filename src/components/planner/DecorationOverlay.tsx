import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Palette, RotateCw } from "lucide-react";
import { useDecorations, type PlacedItem, type DrawStroke, type WashiPattern } from "@/hooks/useDecorations";
import { DecorationToolbar, type DecoTool, PEN_COLORS, HIGHLIGHTER_COLORS, renderWashiPattern } from "./DecorationToolbar";
import { formatDateKey, startOfWeek, startOfMonth } from "@/lib/dateUtils";
import { format } from "date-fns";

interface DecorationOverlayProps {
  pageKey: string;
  date?: Date;
  children: React.ReactNode;
}

const GRID_SIZE = 16;
const DEFAULT_WASHI_WIDTH = 34;
const DEFAULT_WASHI_LENGTH = 160;
const MIN_WASHI_LENGTH = 48;
const MAX_WASHI_LENGTH = 600;
const MIN_WASHI_THICKNESS = 16;
const MAX_WASHI_THICKNESS = 120;
const DEFAULT_STICKER_SIZE = 60;
const MIN_STICKER_SIZE = 24;
const MAX_STICKER_SIZE = 200;
const DEFAULT_TEXT_WIDTH = 120;
const DEFAULT_TEXT_HEIGHT = 30;
const DEFAULT_TEXT_FONT_SIZE = 14;
const MIN_TEXT_WIDTH = 40;
const MAX_TEXT_WIDTH = 500;

function snapToGrid(val: number) {
  return Math.round(val / GRID_SIZE) * GRID_SIZE;
}

// ---- Resize handles for washi (length + thickness) ----
function WashiResizeHandles({
  item,
  onResize,
  onToggleOrientation,
}: {
  item: PlacedItem;
  onResize: (id: string, newLength: number, newThickness: number, newX: number, newY: number) => void;
  onToggleOrientation: (id: string) => void;
}) {
  const isVert = item.orientation === "vertical";
  const len = item.washiLength || DEFAULT_WASHI_LENGTH;
  const thickness = isVert ? (item.width || DEFAULT_WASHI_WIDTH) : (item.height || DEFAULT_WASHI_WIDTH);
  const w = isVert ? thickness : len;
  const h = isVert ? len : thickness;

  const resizingRef = useRef<{
    edge: "start" | "end" | "thick-start" | "thick-end";
    startClient: number;
    origLength: number;
    origThickness: number;
    origX: number;
    origY: number;
  } | null>(null);

  const handleResizeStart = useCallback(
    (edge: "start" | "end" | "thick-start" | "thick-end", e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const isThickness = edge.startsWith("thick");
      const axis = isThickness ? (isVert ? "x" : "y") : (isVert ? "y" : "x");
      const clientVal = "touches" in e
        ? (axis === "y" ? e.touches[0].clientY : e.touches[0].clientX)
        : (axis === "y" ? (e as React.MouseEvent).clientY : (e as React.MouseEvent).clientX);
      resizingRef.current = { edge, startClient: clientVal, origLength: len, origThickness: thickness, origX: item.x, origY: item.y };

      const onMove = (ev: MouseEvent | TouchEvent) => {
        if (!resizingRef.current) return;
        ev.preventDefault();
        const cur = "touches" in ev
          ? (axis === "y" ? ev.touches[0].clientY : ev.touches[0].clientX)
          : (axis === "y" ? ev.clientY : ev.clientX);
        const delta = cur - resizingRef.current.startClient;
        const r = resizingRef.current;
        let newLength = r.origLength, newThickness = r.origThickness, newX = r.origX, newY = r.origY;

        if (edge === "end") {
          newLength = snapToGrid(Math.max(MIN_WASHI_LENGTH, Math.min(MAX_WASHI_LENGTH, r.origLength + delta)));
        } else if (edge === "start") {
          const rawDelta = snapToGrid(delta);
          newLength = Math.max(MIN_WASHI_LENGTH, Math.min(MAX_WASHI_LENGTH, r.origLength - rawDelta));
          newLength = snapToGrid(newLength);
          const actualDelta = r.origLength - newLength;
          if (isVert) newY = r.origY + actualDelta;
          else newX = r.origX + actualDelta;
        } else if (edge === "thick-end") {
          newThickness = Math.max(MIN_WASHI_THICKNESS, Math.min(MAX_WASHI_THICKNESS, r.origThickness + delta));
        } else if (edge === "thick-start") {
          const rawDelta = delta;
          newThickness = Math.max(MIN_WASHI_THICKNESS, Math.min(MAX_WASHI_THICKNESS, r.origThickness - rawDelta));
          const actualDelta = r.origThickness - newThickness;
          if (isVert) newX = r.origX + actualDelta;
          else newY = r.origY + actualDelta;
        }
        onResize(item.id, newLength, newThickness, newX, newY);
      };

      const onEnd = () => {
        resizingRef.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onEnd);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);
      };

      window.addEventListener("mousemove", onMove, { passive: false });
      window.addEventListener("mouseup", onEnd);
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onEnd);
    },
    [item.id, item.x, item.y, len, thickness, isVert, onResize]
  );

  const handleSize = 14;
  const lengthHandleClass = isVert
    ? "absolute bg-primary/80 border-2 border-background rounded-full shadow-md cursor-ns-resize z-[35] active:scale-110 transition-transform"
    : "absolute bg-primary/80 border-2 border-background rounded-full shadow-md cursor-ew-resize z-[35] active:scale-110 transition-transform";
  const thickHandleClass = isVert
    ? "absolute bg-accent-foreground/60 border-2 border-background rounded-full shadow-md cursor-ew-resize z-[35] active:scale-110 transition-transform"
    : "absolute bg-accent-foreground/60 border-2 border-background rounded-full shadow-md cursor-ns-resize z-[35] active:scale-110 transition-transform";

  return (
    <>
      <div className="absolute border-2 border-primary/40 border-dashed rounded-sm pointer-events-none" style={{ left: -2, top: -2, width: w + 4, height: h + 4 }} />
      {/* Length handles */}
      {isVert ? (
        <>
          <div className={lengthHandleClass} style={{ left: w / 2 - handleSize / 2, top: -handleSize / 2 - 2, width: handleSize, height: handleSize }}
            onMouseDown={(e) => handleResizeStart("start", e)} onTouchStart={(e) => handleResizeStart("start", e)} />
          <div className={lengthHandleClass} style={{ left: w / 2 - handleSize / 2, top: h - handleSize / 2 + 2, width: handleSize, height: handleSize }}
            onMouseDown={(e) => handleResizeStart("end", e)} onTouchStart={(e) => handleResizeStart("end", e)} />
        </>
      ) : (
        <>
          <div className={lengthHandleClass} style={{ left: -handleSize / 2 - 2, top: h / 2 - handleSize / 2, width: handleSize, height: handleSize }}
            onMouseDown={(e) => handleResizeStart("start", e)} onTouchStart={(e) => handleResizeStart("start", e)} />
          <div className={lengthHandleClass} style={{ left: w - handleSize / 2 + 2, top: h / 2 - handleSize / 2, width: handleSize, height: handleSize }}
            onMouseDown={(e) => handleResizeStart("end", e)} onTouchStart={(e) => handleResizeStart("end", e)} />
        </>
      )}
      {/* Thickness handles */}
      {isVert ? (
        <>
          <div className={thickHandleClass} style={{ left: -handleSize / 2 - 2, top: h / 2 - handleSize / 2, width: handleSize, height: handleSize }}
            onMouseDown={(e) => handleResizeStart("thick-start", e)} onTouchStart={(e) => handleResizeStart("thick-start", e)} />
          <div className={thickHandleClass} style={{ left: w - handleSize / 2 + 2, top: h / 2 - handleSize / 2, width: handleSize, height: handleSize }}
            onMouseDown={(e) => handleResizeStart("thick-end", e)} onTouchStart={(e) => handleResizeStart("thick-end", e)} />
        </>
      ) : (
        <>
          <div className={thickHandleClass} style={{ left: w / 2 - handleSize / 2, top: -handleSize / 2 - 2, width: handleSize, height: handleSize }}
            onMouseDown={(e) => handleResizeStart("thick-start", e)} onTouchStart={(e) => handleResizeStart("thick-start", e)} />
          <div className={thickHandleClass} style={{ left: w / 2 - handleSize / 2, top: h - handleSize / 2 + 2, width: handleSize, height: handleSize }}
            onMouseDown={(e) => handleResizeStart("thick-end", e)} onTouchStart={(e) => handleResizeStart("thick-end", e)} />
        </>
      )}
      <button
        className="absolute bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center shadow-md z-[36] active:scale-90 transition-transform"
        style={{ right: isVert ? -28 : -8, top: isVert ? -8 : -28 }}
        onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
        onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); }}
        onClick={(e) => { e.stopPropagation(); onToggleOrientation(item.id); }}
        title="Rotate 90°"
      >
        <RotateCw className="w-3.5 h-3.5" />
      </button>
    </>
  );
}

// ---- Resize handles for stickers (proportional corner handles) ----
function StickerResizeHandles({
  item,
  onResize,
}: {
  item: PlacedItem;
  onResize: (id: string, newW: number, newH: number) => void;
}) {
  const w = item.width || DEFAULT_STICKER_SIZE;
  const h = item.height || DEFAULT_STICKER_SIZE;
  const resizingRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    resizingRef.current = { startX: clientX, startY: clientY, origW: w, origH: h };

    const onMove = (ev: MouseEvent | TouchEvent) => {
      if (!resizingRef.current) return;
      ev.preventDefault();
      const cx = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
      const r = resizingRef.current;
      const delta = cx - r.startX;
      const ratio = r.origH / r.origW;
      const newW = Math.max(MIN_STICKER_SIZE, Math.min(MAX_STICKER_SIZE, r.origW + delta));
      const newH = Math.round(newW * ratio);
      onResize(item.id, newW, newH);
    };
    const onEnd = () => {
      resizingRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("mousemove", onMove, { passive: false });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }, [item.id, w, h, onResize]);

  const handleSize = 12;
  return (
    <>
      <div className="absolute border-2 border-primary/40 border-dashed rounded-sm pointer-events-none" style={{ left: -2, top: -2, width: w + 4, height: h + 4 }} />
      {/* Bottom-right corner handle */}
      <div
        className="absolute bg-primary/80 border-2 border-background rounded-full shadow-md cursor-nwse-resize z-[35] active:scale-110 transition-transform"
        style={{ left: w - handleSize / 2 + 2, top: h - handleSize / 2 + 2, width: handleSize, height: handleSize }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      />
    </>
  );
}

// ---- Resize handles for text (corner drag, scales font proportionally) ----
function TextResizeHandles({
  item,
  onResize,
}: {
  item: PlacedItem;
  onResize: (id: string, newW: number, newH: number) => void;
}) {
  const w = item.width || DEFAULT_TEXT_WIDTH;
  const h = item.height || DEFAULT_TEXT_HEIGHT;
  const resizingRef = useRef<{ startX: number; origW: number; origH: number } | null>(null);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    resizingRef.current = { startX: clientX, origW: w, origH: h };

    const onMove = (ev: MouseEvent | TouchEvent) => {
      if (!resizingRef.current) return;
      ev.preventDefault();
      const cx = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
      const r = resizingRef.current;
      const delta = cx - r.startX;
      const ratio = r.origH / r.origW;
      const newW = Math.max(MIN_TEXT_WIDTH, Math.min(MAX_TEXT_WIDTH, r.origW + delta));
      const newH = Math.round(newW * ratio);
      onResize(item.id, newW, newH);
    };
    const onEnd = () => {
      resizingRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("mousemove", onMove, { passive: false });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }, [item.id, w, h, onResize]);

  const handleSize = 12;
  return (
    <>
      <div className="absolute border-2 border-primary/40 border-dashed rounded-sm pointer-events-none" style={{ left: -4, top: -4, width: w + 8, height: h + 8 }} />
      <div
        className="absolute bg-primary/80 border-2 border-background rounded-full shadow-md cursor-nwse-resize z-[35] active:scale-110 transition-transform"
        style={{ left: w - handleSize / 2 + 2, top: h - handleSize / 2 + 2, width: handleSize, height: handleSize }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      />
    </>
  );
}

// ---- Draggable palette button ----
function DraggablePaletteButton({ decorating, onToggle }: { decorating: boolean; onToggle: () => void }) {
  const [pos, setPos] = useState({ x: -1, y: -1 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null);
  const ignoreNextToggle = useRef(false);

  useEffect(() => {
    if (pos.x === -1) {
      setPos({ x: window.innerWidth - 64, y: window.innerHeight - 140 });
    }
  }, []);

const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
  const cx = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
  const cy = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

  dragRef.current = { startX: cx, startY: cy, origX: pos.x, origY: pos.y, moved: false };

  const onMove = (ev: MouseEvent | TouchEvent) => {
    if (!dragRef.current) return;
    ev.preventDefault();

    const mx = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
    const my = "touches" in ev ? ev.touches[0].clientY : ev.clientY;

    const dx = mx - dragRef.current.startX;
    const dy = my - dragRef.current.startY;

    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) dragRef.current.moved = true;

    setPos({
      x: Math.max(8, Math.min(window.innerWidth - 56, dragRef.current.origX + dx)),
      y: Math.max(8, Math.min(window.innerHeight - 56, dragRef.current.origY + dy)),
    });
  };

  const onEnd = () => {
    const wasDrag = dragRef.current?.moved;
    dragRef.current = null;

    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onEnd);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("touchend", onEnd);

    if (!wasDrag) {
      // If the button already handled the toggle,
      // skip the drag-end toggle to prevent double firing.
      if (ignoreNextToggle.current) {
        ignoreNextToggle.current = false;
        return; // Prevent double toggle
      }

      // Otherwise, this was a true tap (not a drag),
      // so allow the toggle to happen normally.
      onToggle();
    }
  };

  window.addEventListener("mousemove", onMove, { passive: false });
  window.addEventListener("mouseup", onEnd);
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("touchend", onEnd);

}, [pos, onToggle]);   // <-- THIS NOW MATCHES CORRECTLY

  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        ignoreNextToggle.current = true;
        onToggle();
        handleStart(e);
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
        ignoreNextToggle.current = true;
        onToggle();
        handleStart(e);
      }}
      className={`fixed z-[60] w-12 h-12 rounded-full shadow-xl flex items-center justify-center ring-2 ring-background cursor-grab active:cursor-grabbing select-none ${
        decorating ? "bg-primary text-primary-foreground shadow-primary/30" : "bg-accent text-accent-foreground"
      }`}
      style={{ left: pos.x, top: pos.y, touchAction: "none" }}
    >
      <Palette className="w-5 h-5 pointer-events-none" />
    </button>
  );
}

export function DecorationOverlay({ pageKey, date, children }: DecorationOverlayProps) {
const resolvedKey = useMemo(() => {
  // Pages without a date (notes, yearly goals, static pages)
  if (!date) {
    // Notes pages
    if (
      pageKey.startsWith("lined_notes") ||
      pageKey.startsWith("dotted_notes") ||
      pageKey.startsWith("grid_notes")
    ) {
      return `notes-${pageKey}`;
    }

    // Yearly goals page
    if (pageKey === "yearly_goals") {
      return `yearly-${new Date().getFullYear()}`;
    }

    return pageKey;
  }

  // Tabs grouped by type
  const DAILY_TABS = ["daily", "gratitude", "therapy", "priority_matrix"];
  const WEEKLY_TABS = ["weekly", "meal_planner", "exercise", "cleaning"];
  const MONTHLY_TABS = ["monthly", "sleep", "budget", "reflection"];
  const YEARLY_TABS = ["yearly_goals"];

  // Daily pages → daily-{tab}-YYYY-MM-DD
  if (DAILY_TABS.includes(pageKey)) {
    return `daily-${pageKey}-${format(date, "yyyy-MM-dd")}`;
  }

  // Weekly pages → weekly-{tab}-YYYY-WII
  if (WEEKLY_TABS.includes(pageKey)) {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    return `weekly-${pageKey}-${format(weekStart, "yyyy")}-W${format(
      weekStart,
      "II"
    )}`;
  }

  // Monthly pages → monthly-{tab}-YYYY-MM
  if (MONTHLY_TABS.includes(pageKey)) {
    return `monthly-${pageKey}-${format(date, "yyyy-MM")}`;
  }

  // Yearly pages → yearly-YYYY
  if (YEARLY_TABS.includes(pageKey)) {
    return `yearly-${format(date, "yyyy")}`;
  }

  return pageKey;
}, [pageKey, date]);

  const { placed, strokes, loading, setPlaced, setStrokes, clearAll, undo } = useDecorations(resolvedKey);
  const [decorating, setDecorating] = useState(false);
  const [activeTool, setActiveTool] = useState<DecoTool>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [selectedWashi, setSelectedWashi] = useState<WashiPattern | null>(null);
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const [highlighterColor, setHighlighterColor] = useState(HIGHLIGHTER_COLORS[0]);
  const [washiOrientation, setWashiOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [washiLength, setWashiLength] = useState(DEFAULT_WASHI_LENGTH);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isBold, setIsBold] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const currentStroke = useRef<DrawStroke | null>(null);
  const draggingId = useRef<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const placedRef = useRef(placed);
  placedRef.current = placed;

  // ---- Canvas setup ----
  useEffect(() => {
    if (!decorating && strokes.length === 0) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = container.scrollHeight * 2;
      canvas.style.height = `${container.scrollHeight}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) { ctx.scale(2, 2); redraw(); }
    };
    resize();
    const obs = new ResizeObserver(resize);
    obs.observe(container);
    return () => obs.disconnect();
  }, [decorating, strokes]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      ctx.stroke();
    });
  }, [strokes]);

  useEffect(() => { redraw(); }, [strokes, redraw]);

  // ---- Drawing ----
  const getPoint = (e: React.TouchEvent | React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top + container.scrollTop };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    if (activeTool !== "pen" && activeTool !== "highlighter" && activeTool !== "eraser") return;
    e.preventDefault(); e.stopPropagation();
    isDrawing.current = true;
    if (activeTool === "eraser") return;
    const pt = getPoint(e);
    currentStroke.current = { points: [pt], color: activeTool === "pen" ? penColor : highlighterColor, width: activeTool === "pen" ? 2 : 16, tool: activeTool };
  };

  const moveDraw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault(); e.stopPropagation();
    const pt = getPoint(e);
    if (activeTool === "eraser") {
      setStrokes(prev => prev.filter(s => !s.points.some(p => Math.hypot(p.x - pt.x, p.y - pt.y) < 12)));
      return;
    }
    if (currentStroke.current) {
      currentStroke.current.points.push(pt);
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && currentStroke.current.points.length >= 2) {
        const pts = currentStroke.current.points;
        ctx.beginPath();
        ctx.strokeStyle = currentStroke.current.color;
        ctx.lineWidth = currentStroke.current.width;
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
      }
    }
  };

  const endDraw = () => {
    if (currentStroke.current && currentStroke.current.points.length > 1) {
      const stroke = currentStroke.current;
      setStrokes(prev => [...prev, stroke]);
    }
    currentStroke.current = null;
    isDrawing.current = false;
  };

  // ---- Drag ----
  const handleDragStart = useCallback((id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); e.preventDefault();
    const item = placedRef.current.find(p => p.id === id);
    if (!item || !containerRef.current) return;
    setSelectedItemId(id);
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    draggingId.current = id;
    dragOffsetRef.current = { x: clientX - rect.left - item.x, y: clientY - rect.top + containerRef.current.scrollTop - item.y };
    const el = itemRefs.current.get(id);
    if (el) el.style.zIndex = "30";
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingId.current || !containerRef.current) return;
      e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const el = itemRefs.current.get(draggingId.current);
      if (el) {
        el.style.left = `${clientX - rect.left - dragOffsetRef.current.x}px`;
        el.style.top = `${clientY - rect.top + containerRef.current.scrollTop - dragOffsetRef.current.y}px`;
      }
    };
    const onEnd = () => {
      if (!draggingId.current || !containerRef.current) return;
      const id = draggingId.current;
      const el = itemRefs.current.get(id);
      if (el) {
        const left = parseFloat(el.style.left);
        const top = parseFloat(el.style.top);
        const snappedX = snapToGrid(left);
        const snappedY = snapToGrid(top);
        setPlaced(prev => prev.map(p => p.id === id ? { ...p, x: snappedX, y: snappedY } : p));
        el.style.zIndex = "22";
      }
      draggingId.current = null;
    };
    window.addEventListener("mousemove", onMove, { passive: false });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [setPlaced]);

  // ---- Washi resize (length + thickness) ----
  const handleWashiResize = useCallback((id: string, newLength: number, newThickness: number, newX: number, newY: number) => {
    setPlaced(prev => prev.map(p => {
      if (p.id !== id) return p;
      const isVert = p.orientation === "vertical";
      return {
        ...p,
        washiLength: newLength,
        x: newX,
        y: newY,
        width: isVert ? newThickness : undefined,
        height: isVert ? undefined : newThickness,
      };
    }));
  }, [setPlaced]);

  const handleToggleOrientation = useCallback((id: string) => {
    setPlaced(prev => prev.map(p => {
      if (p.id !== id || p.type !== "washi") return p;
      return { ...p, orientation: p.orientation === "vertical" ? "horizontal" : "vertical", rotation: 0 };
    }));
  }, [setPlaced]);

  // ---- Sticker resize ----
  const handleStickerResize = useCallback((id: string, newW: number, newH: number) => {
    setPlaced(prev => prev.map(p => p.id === id ? { ...p, width: newW, height: newH } : p));
  }, [setPlaced]);

  // ---- Text resize ----
  const handleTextResize = useCallback((id: string, newW: number, newH: number) => {
    setPlaced(prev => prev.map(p => p.id === id ? { ...p, width: newW, height: newH } : p));
  }, [setPlaced]);

  // ---- Place items ----
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (!decorating || draggingId.current) return;
    setSelectedItemId(null);
    const pt = getPoint(e);

    if (activeTool === "sticker" && selectedSticker) {
      setPlaced(prev => [...prev, {
        id: crypto.randomUUID(), type: "sticker", content: selectedSticker,
        x: snapToGrid(pt.x), y: snapToGrid(pt.y),
        width: DEFAULT_STICKER_SIZE, height: DEFAULT_STICKER_SIZE,
      }]);
    } else if (activeTool === "washi" && selectedWashi) {
      const snappedX = snapToGrid(pt.x - (washiOrientation === "horizontal" ? washiLength / 2 : DEFAULT_WASHI_WIDTH / 2));
      const snappedY = snapToGrid(pt.y - (washiOrientation === "vertical" ? washiLength / 2 : DEFAULT_WASHI_WIDTH / 2));
      setPlaced(prev => [...prev, {
        id: crypto.randomUUID(), type: "washi", content: selectedWashi.name,
        x: snappedX, y: snappedY,
        washiPattern: selectedWashi, rotation: 0,
        orientation: washiOrientation, washiLength,
      }]);
    } else if (activeTool === "text") {
      const newId = crypto.randomUUID();
      setPlaced(prev => [...prev, {
        id: newId, type: "sticker" as const, content: `__text__${isBold ? "bold:" : ""}Type here`,
        x: snapToGrid(pt.x), y: snapToGrid(pt.y),
        width: DEFAULT_TEXT_WIDTH, height: DEFAULT_TEXT_HEIGHT,
      }]);
      setEditingTextId(newId);
      setSelectedItemId(newId);
    }
  };

  const removeItem = (id: string) => {
    setPlaced(prev => prev.filter(p => p.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
    if (editingTextId === id) setEditingTextId(null);
  };

  const isDrawTool = activeTool === "pen" || activeTool === "highlighter" || activeTool === "eraser";
  const isPlaceTool = activeTool === "sticker" || activeTool === "washi" || activeTool === "text";

  const setItemRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);

  // Parse text content
  const parseTextContent = (content: string) => {
    if (!content.startsWith("__text__")) return null;
    const rest = content.slice(8);
    const bold = rest.startsWith("bold:");
    const text = bold ? rest.slice(5) : rest;
    return { text, isBold: bold };
  };

  const updateTextContent = (id: string, text: string, bold: boolean) => {
    setPlaced(prev => prev.map(p =>
      p.id === id ? { ...p, content: `__text__${bold ? "bold:" : ""}${text}` } : p
    ));
  };

  // Compute font size from width for text items
  const getTextFontSize = (item: PlacedItem) => {
    const w = item.width || DEFAULT_TEXT_WIDTH;
    return Math.round(DEFAULT_TEXT_FONT_SIZE * (w / DEFAULT_TEXT_WIDTH));
  };

  return (
    <div ref={containerRef} className="relative">
      {children}

      {(placed.length > 0 || strokes.length > 0 || decorating) && (
        <>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full pointer-events-none"
            style={{ zIndex: 20, pointerEvents: decorating && isDrawTool ? "auto" : "none", touchAction: decorating && isDrawTool ? "none" : "auto" }}
            onMouseDown={startDraw} onMouseMove={moveDraw} onMouseUp={endDraw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchMove={moveDraw} onTouchEnd={endDraw}
          />

          {decorating && isPlaceTool && (
            <div className="absolute inset-0" style={{ zIndex: 15, cursor: "crosshair" }} onClick={handleOverlayClick} />
          )}

          {placed.map((item) => {
            const isSelected = decorating && selectedItemId === item.id;
            const textParsed = parseTextContent(item.content);
            const isTextItem = textParsed !== null;
            const fontSize = isTextItem ? getTextFontSize(item) : undefined;

            return (
              <div
                key={item.id}
                ref={setItemRef(item.id)}
                className="absolute select-none"
                style={{
                  left: item.x,
                  top: item.y,
                  zIndex: isSelected ? 25 : 22,
                  cursor: decorating ? "grab" : "default",
                  pointerEvents: decorating ? "auto" : "none",
                  touchAction: decorating ? "none" : "auto",
                }}
                onMouseDown={decorating ? (e) => handleDragStart(item.id, e) : undefined}
                onTouchStart={decorating ? (e) => handleDragStart(item.id, e) : undefined}
                onDoubleClick={decorating ? () => {
                  if (isTextItem) {
                    setEditingTextId(item.id);
                    setSelectedItemId(item.id);
                  } else {
                    removeItem(item.id);
                  }
                } : undefined}
              >
                {decorating && <div className="absolute -inset-3" style={{ zIndex: -1 }} />}

                {isTextItem ? (
                  // Text decoration
                  <div className="relative" style={{ width: item.width || DEFAULT_TEXT_WIDTH, height: item.height || DEFAULT_TEXT_HEIGHT }}>
                    {editingTextId === item.id ? (
                      <input
                        autoFocus
                        className="bg-transparent border-b-2 border-primary/50 outline-none px-1 w-full h-full"
                        style={{ fontWeight: textParsed.isBold ? "bold" : "normal", fontSize: `${fontSize}px` }}
                        value={textParsed.text}
                        onChange={(e) => updateTextContent(item.id, e.target.value, textParsed.isBold)}
                        onBlur={() => setEditingTextId(null)}
                        onKeyDown={(e) => { if (e.key === "Enter") setEditingTextId(null); }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className="pointer-events-none whitespace-nowrap"
                        style={{ fontWeight: textParsed.isBold ? "bold" : "normal", fontSize: `${fontSize}px` }}
                      >
                        {textParsed.text || "Type here"}
                      </span>
                    )}
                    {isSelected && (
                      <>
                        <TextResizeHandles item={item} onResize={handleTextResize} />
                        <button
                          className="absolute -top-6 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center shadow-md z-[36] active:scale-90 text-[10px] font-bold"
                          onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateTextContent(item.id, textParsed.text, !textParsed.isBold);
                          }}
                          title="Toggle bold"
                        >
                          B
                        </button>
                        <button
                          className="absolute -top-6 -right-8 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center shadow-md z-[36] active:scale-90 text-[10px]"
                          onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                          onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                          title="Delete"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                ) : item.type === "sticker" ? (
                  // PNG sticker
                  <div className="relative">
                    <img
                      src={item.content}
                      alt="sticker"
                      className="drop-shadow-sm pointer-events-none"
                      style={{ width: item.width || DEFAULT_STICKER_SIZE, height: item.height || DEFAULT_STICKER_SIZE, objectFit: "contain" }}
                      draggable={false}
                      loading="lazy"
                    />
                    {isSelected && (
                      <>
                        <StickerResizeHandles item={item} onResize={handleStickerResize} />
                        <button
                          className="absolute -top-6 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center shadow-md z-[36] active:scale-90 text-[10px]"
                          onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                          onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                          title="Delete"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  // Washi tape (PNG image)
                  (() => {
                    const isVert = item.orientation === "vertical";
                    const len = item.washiLength || DEFAULT_WASHI_LENGTH;
                    const thickness = isVert ? (item.width || DEFAULT_WASHI_WIDTH) : (item.height || DEFAULT_WASHI_WIDTH);
                    const w = isVert ? thickness : len;
                    const h = isVert ? len : thickness;
                    return (
                      <div className="relative" style={{ width: w, height: h }}>
                        {item.washiPattern?.imageUrl ? (
                          <div className="rounded-sm opacity-80 overflow-hidden pointer-events-none" style={{ width: w, height: h }}>
                            <img src={item.washiPattern.imageUrl} alt="washi" className="w-full h-full object-cover" draggable={false} loading="lazy" />
                          </div>
                        ) : (
                          <div
                            className="rounded-sm opacity-80 pointer-events-none"
                            style={{ width: w, height: h, background: item.washiPattern ? renderWashiPattern(item.washiPattern) : "hsl(var(--accent))" }}
                          />
                        )}
                        {isSelected && (
                          <>
                            <WashiResizeHandles item={item} onResize={handleWashiResize} onToggleOrientation={handleToggleOrientation} />
                            <button
                              className="absolute -top-6 left-0 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center shadow-md z-[36] active:scale-90 text-[10px]"
                              onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                              onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                              title="Delete"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Floating draggable decorate toggle */}
      <DraggablePaletteButton
        decorating={decorating}
        onToggle={() => { setDecorating(!decorating); if (decorating) { setSelectedItemId(null); setEditingTextId(null); } }}
      />

      {decorating && (
        <DecorationToolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          selectedSticker={selectedSticker}
          setSelectedEmoji={setSelectedEmoji}
          selectedWashi={selectedWashi}
          setSelectedWashi={setSelectedWashi}
          penColor={penColor}
          setPenColor={setPenColor}
          highlighterColor={highlighterColor}
          setHighlighterColor={setHighlighterColor}
          washiOrientation={washiOrientation}
          setWashiOrientation={setWashiOrientation}
          washiLength={washiLength}
          setWashiLength={setWashiLength}
          isBold={isBold}
          setIsBold={setIsBold}
          onUndo={undo}
          onClearAll={clearAll}
          onClose={() => { setDecorating(false); setSelectedItemId(null); setEditingTextId(null); }}
        />
      )}
    </div>
  );
}
