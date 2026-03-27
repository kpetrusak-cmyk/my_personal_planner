import { useState, useRef, useCallback, useEffect } from "react";
import { Palette } from "lucide-react";
import { useDecorations, type PlacedItem, type DrawStroke, type WashiPattern } from "@/hooks/useDecorations";
import { DecorationToolbar, type DecoTool, PEN_COLORS, HIGHLIGHTER_COLORS, renderWashiPattern } from "./DecorationToolbar";

interface DecorationOverlayProps {
  pageKey: string;
  children: React.ReactNode;
}

export function DecorationOverlay({ pageKey, children }: DecorationOverlayProps) {
  const { placed, strokes, loading, setPlaced, setStrokes, clearAll, undo } = useDecorations(pageKey);
  const [decorating, setDecorating] = useState(false);
  const [activeTool, setActiveTool] = useState<DecoTool>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [selectedWashi, setSelectedWashi] = useState<WashiPattern | null>(null);
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const [highlighterColor, setHighlighterColor] = useState(HIGHLIGHTER_COLORS[0]);
  const [, forceRender] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const currentStroke = useRef<DrawStroke | null>(null);

  // Drag state kept in refs for smooth, jank-free movement
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
    const container = containerRef.current;
    if (!canvas || !container) return;
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
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
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
    e.preventDefault();
    e.stopPropagation();
    isDrawing.current = true;
    if (activeTool === "eraser") return;
    const pt = getPoint(e);
    currentStroke.current = {
      points: [pt],
      color: activeTool === "pen" ? penColor : highlighterColor,
      width: activeTool === "pen" ? 2 : 16,
      tool: activeTool,
    };
  };

  const moveDraw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    e.stopPropagation();
    const pt = getPoint(e);
    if (activeTool === "eraser") {
      setStrokes(prev => prev.filter(s => !s.points.some(p => Math.hypot(p.x - pt.x, p.y - pt.y) < 12)));
      return;
    }
    if (currentStroke.current) {
      currentStroke.current.points.push(pt);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && currentStroke.current.points.length >= 2) {
        const pts = currentStroke.current.points;
        ctx.beginPath();
        ctx.strokeStyle = currentStroke.current.color;
        ctx.lineWidth = currentStroke.current.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
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

  // ---- Seamless drag via global listeners + direct DOM manipulation ----
  const handleDragStart = useCallback((id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const item = placedRef.current.find(p => p.id === id);
    if (!item || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const offsetX = item.type === "sticker" ? 20 : 0;
    const offsetY = item.type === "sticker" ? 20 : 0;
    draggingId.current = id;
    dragOffsetRef.current = {
      x: clientX - rect.left - (item.x - offsetX),
      y: clientY - rect.top + containerRef.current.scrollTop - (item.y - offsetY),
    };
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
      const newLeft = clientX - rect.left - dragOffsetRef.current.x;
      const newTop = clientY - rect.top + containerRef.current.scrollTop - dragOffsetRef.current.y;
      // Direct DOM update for zero-lag movement
      const el = itemRefs.current.get(draggingId.current);
      if (el) {
        el.style.left = `${newLeft}px`;
        el.style.top = `${newTop}px`;
      }
    };

    const onEnd = () => {
      if (!draggingId.current || !containerRef.current) return;
      const id = draggingId.current;
      const el = itemRefs.current.get(id);
      if (el) {
        const left = parseFloat(el.style.left);
        const top = parseFloat(el.style.top);
        const item = placedRef.current.find(p => p.id === id);
        if (item) {
          const offsetX = item.type === "sticker" ? 20 : 0;
          const offsetY = item.type === "sticker" ? 20 : 0;
          setPlaced(prev => prev.map(p => p.id === id ? { ...p, x: left + offsetX, y: top + offsetY } : p));
        }
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

  // ---- Place new items ----
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (!decorating || draggingId.current) return;
    const pt = getPoint(e);
    if (activeTool === "sticker" && selectedEmoji) {
      const isUrl = selectedEmoji.startsWith("http");
      setPlaced(prev => [...prev, {
        id: crypto.randomUUID(),
        type: "sticker",
        content: selectedEmoji,
        x: pt.x, y: pt.y,
        width: isUrl ? 60 : undefined,
        height: isUrl ? 60 : undefined,
      }]);
    } else if (activeTool === "washi" && selectedWashi) {
      setPlaced(prev => [...prev, {
        id: crypto.randomUUID(),
        type: "washi",
        content: selectedWashi.name,
        x: pt.x - 80, y: pt.y - 17,
        washiPattern: selectedWashi,
        rotation: (Math.random() - 0.5) * 4,
      }]);
    }
  };

  const removeItem = (id: string) => setPlaced(prev => prev.filter(p => p.id !== id));

  const isDrawTool = activeTool === "pen" || activeTool === "highlighter" || activeTool === "eraser";
  const isPlaceTool = activeTool === "sticker" || activeTool === "washi";

  const setItemRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {children}

      {(placed.length > 0 || strokes.length > 0 || decorating) && (
        <>
          {/* Drawing canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full pointer-events-none"
            style={{
              zIndex: 20,
              pointerEvents: decorating && isDrawTool ? "auto" : "none",
              touchAction: decorating && isDrawTool ? "none" : "auto",
            }}
            onMouseDown={startDraw}
            onMouseMove={moveDraw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={moveDraw}
            onTouchEnd={endDraw}
          />

          {/* Click target for placing — below items so items are grabbable */}
          {decorating && isPlaceTool && (
            <div
              className="absolute inset-0"
              style={{ zIndex: 15, cursor: "crosshair" }}
              onClick={handleOverlayClick}
            />
          )}

          {/* Placed items — larger touch target for easy grabbing */}
          {placed.map((item) => {
            const offsetX = item.type === "sticker" ? 20 : 0;
            const offsetY = item.type === "sticker" ? 20 : 0;
            return (
              <div
                key={item.id}
                ref={setItemRef(item.id)}
                className="absolute select-none"
                style={{
                  left: item.x - offsetX,
                  top: item.y - offsetY,
                  zIndex: 22,
                  cursor: decorating ? "grab" : "default",
                  transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined,
                  pointerEvents: decorating ? "auto" : "none",
                  touchAction: decorating ? "none" : "auto",
                }}
                onMouseDown={decorating ? (e) => handleDragStart(item.id, e) : undefined}
                onTouchStart={decorating ? (e) => handleDragStart(item.id, e) : undefined}
                onDoubleClick={decorating ? () => removeItem(item.id) : undefined}
              >
                {/* Invisible enlarged touch target */}
                {decorating && (
                  <div className="absolute -inset-3" style={{ zIndex: -1 }} />
                )}
                {item.type === "sticker" ? (
                  item.content.startsWith("http") ? (
                    <img
                      src={item.content}
                      alt="sticker"
                      className="drop-shadow-sm pointer-events-none"
                      style={{ width: item.width || 60, height: item.height || 60, objectFit: "contain" }}
                      draggable={false}
                    />
                  ) : (
                    <span className="text-4xl drop-shadow-sm pointer-events-none">{item.content}</span>
                  )
                ) : (
                  item.washiPattern?.imageUrl ? (
                    <div className="h-[34px] rounded-sm opacity-80 overflow-hidden pointer-events-none" style={{ width: 160 }}>
                      <img src={item.washiPattern.imageUrl} alt="washi" className="w-full h-full object-cover" draggable={false} />
                    </div>
                  ) : (
                    <div
                      className="h-[34px] rounded-sm opacity-80 pointer-events-none"
                      style={{
                        width: 160,
                        background: item.washiPattern ? renderWashiPattern(item.washiPattern) : "hsl(var(--accent))",
                      }}
                    />
                  )
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Floating decorate toggle */}
      <button
        onClick={() => setDecorating(!decorating)}
        className={`fixed right-4 z-[60] w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 active:scale-90 ring-2 ring-background ${
          decorating ? "bg-primary text-primary-foreground shadow-primary/30" : "bg-accent text-accent-foreground"
        }`}
        style={{ bottom: decorating ? "calc(52vh + env(safe-area-inset-bottom, 0px))" : "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <Palette className="w-5 h-5" />
      </button>

      {decorating && (
        <DecorationToolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          selectedEmoji={selectedEmoji}
          setSelectedEmoji={setSelectedEmoji}
          selectedWashi={selectedWashi}
          setSelectedWashi={setSelectedWashi}
          penColor={penColor}
          setPenColor={setPenColor}
          highlighterColor={highlighterColor}
          setHighlighterColor={setHighlighterColor}
          onUndo={undo}
          onClearAll={clearAll}
          onClose={() => setDecorating(false)}
        />
      )}
    </div>
  );
}
