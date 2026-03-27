import { useState, useRef, useCallback, useEffect } from "react";
import { Smile, Scissors, Pen, Highlighter, Eraser, Undo2, Trash2, Upload, Palette } from "lucide-react";

type Tool = "sticker" | "washi" | "pen" | "highlighter" | "eraser" | null;

const EMOJI_PACKS = {
  "Flowers": ["🌸", "🌺", "🌻", "🌷", "🌹", "💐", "🌼", "🪻", "🌿", "🍀", "🌱", "🪴"],
  "Stars & Hearts": ["⭐", "✨", "💫", "🌟", "💖", "💗", "💕", "❤️", "🩷", "🩵", "💜", "🤍"],
  "Cute": ["🎀", "🧸", "🦋", "🐝", "🐞", "🌈", "☁️", "🍓", "🍰", "🧁", "🫧", "✏️"],
  "Planner": ["📌", "📎", "🗓️", "📝", "✅", "⏰", "💡", "🎯", "🏷️", "📖", "🔖", "🗂️"],
  "Weather": ["☀️", "🌤️", "⛅", "🌧️", "⛈️", "🌩️", "❄️", "🌬️", "🌊", "🌙", "🌕", "💧"],
  "Food": ["🍕", "🥑", "🍩", "☕", "🧋", "🍪", "🍫", "🥐", "🧇", "🍑", "🍒", "🫐"],
  "Animals": ["🐱", "🐶", "🦊", "🐰", "🐻", "🦄", "🐸", "🐧", "🦢", "🕊️", "🐾", "🦎"],
  "Travel": ["✈️", "🗺️", "🏖️", "⛰️", "🎡", "🚲", "🌅", "🏕️", "🧳", "🗼", "🎪", "⛵"],
  "Zodiac": ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"],
  "Symbols": ["☮️", "☯️", "♾️", "🔮", "🧿", "🪬", "💎", "🪩", "🎵", "🎶", "🕯️", "🧘"],
};

const WASHI_PATTERNS = [
  { name: "Rose", colors: ["hsl(340, 30%, 80%)", "hsl(340, 30%, 85%)"], style: "striped" },
  { name: "Lavender", colors: ["hsl(300, 24%, 76%)", "hsl(300, 30%, 85%)"], style: "dotted" },
  { name: "Sage", colors: ["hsl(140, 15%, 70%)", "hsl(140, 15%, 78%)"], style: "striped" },
  { name: "Cream", colors: ["hsl(30, 33%, 90%)", "hsl(30, 20%, 85%)"], style: "solid" },
  { name: "Plum", colors: ["hsl(303, 16%, 42%)", "hsl(303, 16%, 52%)"], style: "striped" },
  { name: "Gold", colors: ["hsl(42, 60%, 70%)", "hsl(42, 60%, 78%)"], style: "dotted" },
  { name: "Sky", colors: ["hsl(200, 45%, 78%)", "hsl(200, 45%, 85%)"], style: "striped" },
  { name: "Peach", colors: ["hsl(20, 60%, 82%)", "hsl(20, 50%, 88%)"], style: "solid" },
  { name: "Mint", colors: ["hsl(160, 35%, 75%)", "hsl(160, 30%, 82%)"], style: "dotted" },
  { name: "Coral", colors: ["hsl(10, 55%, 72%)", "hsl(10, 50%, 80%)"], style: "striped" },
  { name: "Lilac", colors: ["hsl(270, 30%, 80%)", "hsl(270, 25%, 87%)"], style: "dotted" },
  { name: "Blush", colors: ["hsl(350, 40%, 86%)", "hsl(350, 35%, 90%)"], style: "solid" },
  { name: "Ocean", colors: ["hsl(210, 40%, 60%)", "hsl(210, 35%, 70%)"], style: "striped" },
  { name: "Honey", colors: ["hsl(38, 65%, 72%)", "hsl(38, 55%, 80%)"], style: "dotted" },
  { name: "Moss", colors: ["hsl(100, 20%, 55%)", "hsl(100, 18%, 65%)"], style: "striped" },
  { name: "Dusk", colors: ["hsl(260, 20%, 65%)", "hsl(260, 18%, 75%)"], style: "solid" },
];

const PEN_COLORS = [
  "hsl(303, 16%, 42%)",   // plum
  "hsl(340, 30%, 60%)",   // rose
  "hsl(210, 50%, 50%)",   // blue
  "hsl(140, 30%, 45%)",   // sage
  "hsl(30, 40%, 35%)",    // brown
  "hsl(0, 0%, 15%)",      // black
];

const HIGHLIGHTER_COLORS = [
  "hsla(50, 90%, 70%, 0.4)",
  "hsla(340, 70%, 80%, 0.35)",
  "hsla(140, 50%, 70%, 0.35)",
  "hsla(210, 60%, 75%, 0.35)",
  "hsla(300, 40%, 78%, 0.35)",
  "hsla(25, 80%, 75%, 0.35)",
];

interface Placed {
  id: string;
  type: "sticker" | "washi";
  content: string;
  x: number;
  y: number;
  washiPattern?: typeof WASHI_PATTERNS[0];
}

interface DrawStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: "pen" | "highlighter";
}

export function DecoratePanel() {
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [selectedWashi, setSelectedWashi] = useState<typeof WASHI_PATTERNS[0] | null>(null);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const [highlighterColor, setHighlighterColor] = useState(HIGHLIGHTER_COLORS[0]);
  const [emojiPack, setEmojiPack] = useState<keyof typeof EMOJI_PACKS>("Flowers");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const currentStroke = useRef<DrawStroke | null>(null);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(2, 2);
    redraw();
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (stroke.tool === "highlighter") ctx.globalAlpha = 1;
      else ctx.globalAlpha = 1;
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
  }, [strokes]);

  useEffect(() => { redraw(); }, [strokes, redraw]);

  const getCanvasPoint = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    if (activeTool !== "pen" && activeTool !== "highlighter" && activeTool !== "eraser") return;
    e.preventDefault();
    isDrawing.current = true;

    if (activeTool === "eraser") return;

    const pt = getCanvasPoint(e);
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
    const pt = getCanvasPoint(e);

    if (activeTool === "eraser") {
      setStrokes((prev) =>
        prev.filter((s) => !s.points.some((p) => Math.hypot(p.x - pt.x, p.y - pt.y) < 12))
      );
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
      setStrokes((prev) => [...prev, currentStroke.current!]);
    }
    currentStroke.current = null;
    isDrawing.current = false;
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === "sticker" && selectedEmoji) {
      setPlaced((prev) => [...prev, { id: crypto.randomUUID(), type: "sticker", content: selectedEmoji, x, y }]);
    } else if (activeTool === "washi" && selectedWashi) {
      setPlaced((prev) => [...prev, { id: crypto.randomUUID(), type: "washi", content: selectedWashi.name, x, y: y - 17, washiPattern: selectedWashi }]);
    }
  };

  const handleDragStart = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const item = placed.find((p) => p.id === id);
    if (!item || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragging(id);
    setDragOffset({ x: clientX - rect.left - item.x, y: clientY - rect.top - item.y });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging || !containerRef.current) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setPlaced((prev) =>
      prev.map((p) => (p.id === dragging ? { ...p, x: clientX - rect.left - dragOffset.x, y: clientY - rect.top - dragOffset.y } : p))
    );
  };

  const handleDragEnd = () => setDragging(null);

  const removeItem = (id: string) => setPlaced((prev) => prev.filter((p) => p.id !== id));

  const renderWashiPattern = (pattern: typeof WASHI_PATTERNS[0], width = 120) => {
    if (pattern.style === "striped") {
      return `repeating-linear-gradient(135deg, ${pattern.colors[0]} 0px, ${pattern.colors[0]} 4px, ${pattern.colors[1]} 4px, ${pattern.colors[1]} 8px)`;
    }
    if (pattern.style === "dotted") {
      return `radial-gradient(circle 2px, ${pattern.colors[1]} 100%, transparent 100%), ${pattern.colors[0]}`;
    }
    return pattern.colors[0];
  };

  const toolButtons: { tool: Tool; icon: React.ElementType; label: string }[] = [
    { tool: "sticker", icon: Smile, label: "Stickers" },
    { tool: "washi", icon: Scissors, label: "Washi" },
    { tool: "pen", icon: Pen, label: "Pen" },
    { tool: "highlighter", icon: Highlighter, label: "Highlight" },
    { tool: "eraser", icon: Eraser, label: "Eraser" },
  ];

  return (
    <div className="space-y-3 animate-fade-in-up">
      <div className="text-center pt-1">
        <p className="planner-heading text-xl">🎨 Decorate</p>
      </div>

      {/* Tool bar */}
      <div className="flex gap-1 justify-center flex-wrap">
        {toolButtons.map(({ tool, icon: Icon, label }) => (
          <button
            key={tool}
            onClick={() => setActiveTool(activeTool === tool ? null : tool)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              activeTool === tool ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-foreground/70"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Sticker picker */}
      {activeTool === "sticker" && (
        <div className="planner-card p-3 space-y-2">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {Object.keys(EMOJI_PACKS).map((pack) => (
              <button
                key={pack}
                onClick={() => setEmojiPack(pack as keyof typeof EMOJI_PACKS)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${
                  emojiPack === pack ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-foreground/60"
                }`}
              >
                {pack}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-6 gap-1">
            {EMOJI_PACKS[emojiPack].map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedEmoji(selectedEmoji === emoji ? null : emoji)}
                className={`text-2xl p-1.5 rounded-lg transition-all active:scale-90 ${
                  selectedEmoji === emoji ? "bg-primary/15 ring-2 ring-primary/40" : "hover:bg-secondary/40"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          {selectedEmoji && (
            <p className="text-[10px] text-muted-foreground text-center">Tap on the canvas to place {selectedEmoji}</p>
          )}
        </div>
      )}

      {/* Washi tape picker */}
      {activeTool === "washi" && (
        <div className="planner-card p-3 space-y-2">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Select tape pattern</p>
          <div className="grid grid-cols-2 gap-2">
            {WASHI_PATTERNS.map((pattern) => (
              <button
                key={pattern.name}
                onClick={() => setSelectedWashi(selectedWashi?.name === pattern.name ? null : pattern)}
                className={`h-10 rounded-lg transition-all active:scale-95 relative overflow-hidden ${
                  selectedWashi?.name === pattern.name ? "ring-2 ring-primary/60" : ""
                }`}
                style={{ background: renderWashiPattern(pattern) }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground/60 mix-blend-multiply">
                  {pattern.name}
                </span>
              </button>
            ))}
          </div>
          {selectedWashi && (
            <p className="text-[10px] text-muted-foreground text-center">Tap on the canvas to place washi tape</p>
          )}
        </div>
      )}

      {/* Pen color picker */}
      {activeTool === "pen" && (
        <div className="planner-card p-3">
          <div className="flex items-center gap-2 justify-center">
            <Palette className="w-3.5 h-3.5 text-muted-foreground" />
            {PEN_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setPenColor(c)}
                className={`w-7 h-7 rounded-full transition-all active:scale-90 ${penColor === c ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Highlighter color picker */}
      {activeTool === "highlighter" && (
        <div className="planner-card p-3">
          <div className="flex items-center gap-2 justify-center">
            <Palette className="w-3.5 h-3.5 text-muted-foreground" />
            {HIGHLIGHTER_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setHighlighterColor(c)}
                className={`w-7 h-7 rounded-full transition-all active:scale-90 border border-border/40 ${highlighterColor === c ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                style={{ background: c.replace(/[\d.]+\)$/, "1)") }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="planner-card relative overflow-hidden"
        style={{ minHeight: 400, touchAction: (activeTool === "pen" || activeTool === "highlighter" || activeTool === "eraser") ? "none" : "auto" }}
        onClick={handleCanvasClick}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Drawing canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 1, pointerEvents: (activeTool === "pen" || activeTool === "highlighter" || activeTool === "eraser") ? "auto" : "none" }}
          onMouseDown={startDraw}
          onMouseMove={moveDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={moveDraw}
          onTouchEnd={endDraw}
        />

        {/* Placed items */}
        {placed.map((item) => (
          <div
            key={item.id}
            className="absolute select-none"
            style={{
              left: item.x - (item.type === "sticker" ? 20 : 0),
              top: item.y - (item.type === "sticker" ? 20 : 0),
              zIndex: dragging === item.id ? 30 : 10,
              cursor: "grab",
            }}
            onMouseDown={(e) => handleDragStart(item.id, e)}
            onTouchStart={(e) => handleDragStart(item.id, e)}
            onDoubleClick={() => removeItem(item.id)}
          >
            {item.type === "sticker" ? (
              <span className="text-4xl drop-shadow-sm">{item.content}</span>
            ) : (
              <div
                className="h-[34px] rounded-sm opacity-80"
                style={{
                  width: 160,
                  background: item.washiPattern ? renderWashiPattern(item.washiPattern) : "hsl(var(--accent))",
                }}
              />
            )}
          </div>
        ))}

        {/* Empty state */}
        {placed.length === 0 && strokes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="text-center space-y-2 text-muted-foreground/40">
              <div className="text-4xl">🌸✨🎀</div>
              <p className="text-sm">Select a tool above and start decorating!</p>
              <p className="text-[10px]">Double-tap stickers to remove them</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => {
            if (strokes.length > 0) setStrokes((prev) => prev.slice(0, -1));
            else if (placed.length > 0) setPlaced((prev) => prev.slice(0, -1));
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-secondary/60 text-foreground/60 rounded-lg text-xs font-semibold transition-all active:scale-95"
        >
          <Undo2 className="w-3.5 h-3.5" />
          Undo
        </button>
        <button
          onClick={() => { setPlaced([]); setStrokes([]); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-destructive/10 text-destructive rounded-lg text-xs font-semibold transition-all active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>
    </div>
  );
}
