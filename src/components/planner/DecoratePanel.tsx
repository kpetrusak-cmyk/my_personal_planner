import { useState, useRef, useCallback, useEffect } from "react";
import { Smile, Scissors, Pen, Highlighter, Eraser, Undo2, Trash2, Upload, Palette } from "lucide-react";

type Tool = "sticker" | "washi" | "pen" | "highlighter" | "eraser" | null;

const STICKER_CATEGORIES: Record<string, string[]> = {
  "Flowers": [
    "/stickers/flowers/cherry-blossom.png",
    "/stickers/flowers/hibiscus.png",
    "/stickers/flowers/sunflower.png",
    "/stickers/flowers/tulip.png",
    "/stickers/flowers/rose.png",
    "/stickers/flowers/bouquet.png",
    "/stickers/flowers/daisy.png",
    "/stickers/flowers/lavender.png",
    "/stickers/flowers/clover.png",
    "/stickers/flowers/seedling.png",
    "/stickers/flowers/potted-plant.png",
    "/stickers/flowers/leaves.png",
  ],
  "Stars & Hearts": [
    "/stickers/stars-hearts/star.png",
    "/stickers/stars-hearts/sparkle.png",
    "/stickers/stars-hearts/heart-pink.png",
    "/stickers/stars-hearts/heart-red.png",
    "/stickers/stars-hearts/rainbow.png",
  ],
  "Cute": [
    "/stickers/cute/bow.png",
    "/stickers/cute/teddy-bear.png",
    "/stickers/cute/butterfly.png",
    "/stickers/cute/strawberry.png",
    "/stickers/cute/cupcake.png",
  ],
  "Planner": [
    "/stickers/planner/pushpin.png",
    "/stickers/planner/paperclip.png",
    "/stickers/planner/checkmark.png",
    "/stickers/planner/alarm-clock.png",
    "/stickers/planner/lightbulb.png",
    "/stickers/planner/target.png",
  ],
  "Animals": [
    "/stickers/animals/cat.png",
    "/stickers/animals/dog.png",
    "/stickers/animals/fox.png",
    "/stickers/animals/bunny.png",
    "/stickers/animals/unicorn.png",
  ],
"Holidays": [
  "/stickers/holidays/balloon.png",
  "/stickers/holidays/candy-cane.png",
  "/stickers/holidays/heart.png",
  "/stickers/holidays/ornament.png",
  "/stickers/holidays/party-popper.png",
  "/stickers/holidays/shamrock.png",
  "/stickers/holidays/sparkler.png",
  "/stickers/holidays/star-gold.png",
],
  "Food": [
    "/stickers/food/pizza.png",
    "/stickers/food/coffee.png",
    "/stickers/food/donut.png",
    "/stickers/food/avocado.png",
    "/stickers/food/cookie.png",
    "/stickers/food/boba.png",
  ],
"Coffee & Meals": [
  "/stickers/coffee-meals/breakfast.png",
  "/stickers/coffee-meals/coffee-cup.png",
  "/stickers/coffee-meals/dinner.png",
  "/stickers/coffee-meals/latte.png",
  "/stickers/coffee-meals/lunch-bag.png",
  "/stickers/coffee-meals/tea.png",
],
  "Travel": [
    "/stickers/travel/airplane.png",
    "/stickers/travel/beach.png",
    "/stickers/travel/mountain.png",
    "/stickers/travel/suitcase.png",
    "/stickers/travel/bicycle.png",
    "/stickers/travel/camping.png",
  ],
  "Nature": [
    "/stickers/nature/moon.png",
    "/stickers/nature/sun.png",
    "/stickers/nature/autumn-leaves.png",
    "/stickers/nature/wave.png",
    "/stickers/nature/mushroom.png",
    "/stickers/nature/seashell.png",
  ],
  "Seasonal": [
    "/stickers/seasonal/pumpkin.png",
    "/stickers/seasonal/christmas-tree.png",
    "/stickers/seasonal/snowflake.png",
    "/stickers/seasonal/fireworks.png",
    "/stickers/seasonal/birthday-cake.png",
    "/stickers/seasonal/gift.png",
  ],
  "School & Work": [
  "/stickers/school-work/assignment.png",
  "/stickers/school-work/deadline.png",
  "/stickers/school-work/exam.png",
  "/stickers/school-work/focus.png",
  "/stickers/school-work/lecture.png",
  "/stickers/school-work/meeting.png",
  "/stickers/school-work/study.png",
],
  "Bills": [
    "/stickers/bills/money.png",
    "/stickers/bills/credit-card.png",
    "/stickers/bills/house.png",
    "/stickers/bills/piggy-bank.png",
    "/stickers/bills/receipt.png",
  ],
  "Appointments": [
    "/stickers/appointments/stethoscope.png",
    "/stickers/appointments/tooth.png",
    "/stickers/appointments/clipboard.png",
    "/stickers/appointments/medicine.png",
    "/stickers/appointments/appointment.png",
  ],
  "Custom": [],
};

// PNG washi patterns organized by category
export const WASHI_CATEGORIES: Record<string, WashiPattern[]> = {
  "Classic": [
    { name: "Rose", colors: [], style: "image", imageUrl: "/washi/rose.png" },
    { name: "Lavender", colors: [], style: "image", imageUrl: "/washi/lavender.png" },
    { name: "Sage", colors: [], style: "image", imageUrl: "/washi/sage.png" },
    { name: "Cream", colors: [], style: "image", imageUrl: "/washi/cream.png" },
    { name: "Plum", colors: [], style: "image", imageUrl: "/washi/plum.png" },
    { name: "Gold", colors: [], style: "image", imageUrl: "/washi/gold.png" },
    { name: "Sky", colors: [], style: "image", imageUrl: "/washi/sky.png" },
    { name: "Peach", colors: [], style: "image", imageUrl: "/washi/peach.png" },
    { name: "Mint", colors: [], style: "image", imageUrl: "/washi/mint.png" },
    { name: "Coral", colors: [], style: "image", imageUrl: "/washi/coral.png" },
    { name: "Lilac", colors: [], style: "image", imageUrl: "/washi/lilac.png" },
    { name: "Blush", colors: [], style: "image", imageUrl: "/washi/blush.png" },
    { name: "Ocean", colors: [], style: "image", imageUrl: "/washi/ocean.png" },
    { name: "Honey", colors: [], style: "image", imageUrl: "/washi/honey.png" },
    { name: "Moss", colors: [], style: "image", imageUrl: "/washi/moss.png" },
    { name: "Dusk", colors: [], style: "image", imageUrl: "/washi/dusk.png" },
  ],
  "Floral": [
    { name: "Cherry Blossom", colors: [], style: "image", imageUrl: "/washi/floral/cherry-blossom.png" },
    { name: "Sunflower", colors: [], style: "image", imageUrl: "/washi/floral/sunflower.png" },
    { name: "Wildflower", colors: [], style: "image", imageUrl: "/washi/floral/wildflower.png" },
    { name: "Rose Vine", colors: [], style: "image", imageUrl: "/washi/floral/rose-vine.png" },
    { name: "Daisy", colors: [], style: "image", imageUrl: "/washi/floral/daisy.png" },
    { name: "Tropical Leaves", colors: [], style: "image", imageUrl: "/washi/floral/tropical-leaves.png" },
    { name: "Forget-Me-Not", colors: [], style: "image", imageUrl: "/washi/floral/forget-me-not.png" },
  ],
  "Holidays": [
    { name: "Christmas", colors: [], style: "image", imageUrl: "/washi/holidays/christmas.png" },
    { name: "Easter", colors: [], style: "image", imageUrl: "/washi/holidays/easter.png" },
    { name: "Valentines", colors: [], style: "image", imageUrl: "/washi/holidays/valentines.png" },
    { name: "Halloween", colors: [], style: "image", imageUrl: "/washi/holidays/halloween.png" },
    { name: "Birthday", colors: [], style: "image", imageUrl: "/washi/holidays/birthday.png" },
    { name: "Thanksgiving", colors: [], style: "image", imageUrl: "/washi/holidays/thanksgiving.png" },
    { name: "New Year", colors: [], style: "image", imageUrl: "/washi/holidays/new-year.png" },
  ],
  "Seasons": [
    { name: "Spring", colors: [], style: "image", imageUrl: "/washi/seasons/spring.png" },
    { name: "Summer", colors: [], style: "image", imageUrl: "/washi/seasons/summer.png" },
    { name: "Autumn", colors: [], style: "image", imageUrl: "/washi/seasons/autumn.png" },
    { name: "Winter", colors: [], style: "image", imageUrl: "/washi/seasons/winter.png" },
    { name: "Rainy Day", colors: [], style: "image", imageUrl: "/washi/seasons/rainy-day.png" },
  ],
  "Minimal": [
    { name: "Stripes", colors: [], style: "image", imageUrl: "/washi/minimal/stripes.png" },
    { name: "Dots", colors: [], style: "image", imageUrl: "/washi/minimal/dots.png" },
    { name: "Grid", colors: [], style: "image", imageUrl: "/washi/minimal/grid.png" },
    { name: "Crosshatch", colors: [], style: "image", imageUrl: "/washi/minimal/crosshatch.png" },
  ],
  "Patterns": [
    { name: "Chevron", colors: [], style: "image", imageUrl: "/washi/patterns/chevron.png" },
    { name: "Plaid", colors: [], style: "image", imageUrl: "/washi/patterns/plaid.png" },
    { name: "Gingham", colors: [], style: "image", imageUrl: "/washi/patterns/gingham.png" },
    { name: "Argyle", colors: [], style: "image", imageUrl: "/washi/patterns/argyle.png" },
    { name: "Houndstooth", colors: [], style: "image", imageUrl: "/washi/patterns/houndstooth.png" },
    { name: "Puppy Love", colors: [], style: "image", imageUrl: "/washi/patterns/puppy-love.png" },
  ],
  "Neutral": [
    { name: "Linen", colors: [], style: "image", imageUrl: "/washi/neutral/linen.png" },
    { name: "Kraft", colors: [], style: "image", imageUrl: "/washi/neutral/kraft.png" },
    { name: "Terrazzo", colors: [], style: "image", imageUrl: "/washi/neutral/terrazzo.png" },
    { name: "Oatmeal", colors: [], style: "image", imageUrl: "/washi/neutral/oatmeal.png" },
    { name: "Concrete", colors: [], style: "image", imageUrl: "/washi/neutral/concrete.png" },
  ],
  "Cute": [
    { name: "Cats", colors: [], style: "image", imageUrl: "/washi/cute/cats.png" },
    { name: "Stars & Moons", colors: [], style: "image", imageUrl: "/washi/cute/stars-moons.png" },
    { name: "Rainbows", colors: [], style: "image", imageUrl: "/washi/cute/rainbows.png" },
    { name: "Sweets", colors: [], style: "image", imageUrl: "/washi/cute/sweets.png" },
    { name: "Dogs", colors: [], style: "image", imageUrl: "/washi/cute/dogs.png" },
    { name: "Dog Bones", colors: [], style: "image", imageUrl: "/washi/cute/dog-bones.png" },
    { name: "Corgi", colors: [], style: "image", imageUrl: "/washi/cute/corgi.png" },
    { name: "Bunnies", colors: [], style: "image", imageUrl: "/washi/cute/bunnies.png" },
    { name: "Chihuahua", colors: [], style: "image", imageUrl: "/washi/cute/chihuahua.png" },
    { name: "Yorkie", colors: [], style: "image", imageUrl: "/washi/cute/yorkie.png" },
  ],
  "Functional": [
    { name: "Checklist", colors: [], style: "image", imageUrl: "/washi/functional/checklist.png" },
    { name: "Schedule", colors: [], style: "image", imageUrl: "/washi/functional/schedule.png" },
    { name: "Days", colors: [], style: "image", imageUrl: "/washi/functional/days.png" },
    { name: "Dividers", colors: [], style: "image", imageUrl: "/washi/functional/dividers.png" },
    { name: "Arrows", colors: [], style: "image", imageUrl: "/washi/functional/arrows.png" },
  ],
  "Abstract": [
    { name: "Watercolor", colors: [], style: "image", imageUrl: "/washi/abstract/watercolor.png" },
    { name: "Geometric", colors: [], style: "image", imageUrl: "/washi/abstract/geometric.png" },
    { name: "Marble", colors: [], style: "image", imageUrl: "/washi/abstract/marble.png" },
    { name: "Splatter", colors: [], style: "image", imageUrl: "/washi/abstract/splatter.png" },
    { name: "Ink Brush", colors: [], style: "image", imageUrl: "/washi/abstract/ink-brush.png" },
  ],
  "Custom": []
};

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
  washiPattern?: WashiPattern;
}

interface DrawStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: "pen" | "highlighter";
}

export function DecoratePanel() {
  const [activeTool, setActiveTool] = useState<Tool>(null);
const [selectedSticker, setSelectedSticker] = useState<{
  name: string;
  style: string;
  imageUrl: string;
} | null>(null);
const [selectedWashi, setSelectedWashi] = useState<WashiPattern | null>(null);
const [placed, setPlaced] = useState<Placed[]>([]);
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const [highlighterColor, setHighlighterColor] = useState(HIGHLIGHTER_COLORS[0]);
  const [stickerCategory, setStickerCategory] =
  useState<keyof typeof STICKER_CATEGORIES>("Flowers");
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

    if (activeTool === "sticker" && selectedSticker) {
  setPlaced((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      type: "sticker",
      content: selectedSticker.imageUrl,
      x,
      y
    }
  ]);
}
else if (activeTool === "washi" && selectedWashi) {
  setPlaced((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      type: "washi",
      content: selectedWashi.imageUrl,
      x,
      y: y - 17,
      washiPattern: selectedWashi
    }
  ]);
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

const renderWashiPattern = (pattern: WashiPattern, width = 120) => {
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
      {Object.keys(STICKER_CATEGORIES).map((category) => (
        <button
          key={category}
          onClick={() => setStickerCategory(category as keyof typeof STICKER_CATEGORIES)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${
            stickerCategory === category
              ? "bg-primary text-primary-foreground"
              : "bg-secondary/50 text-foreground/60"
          }`}
        >
          {category}
        </button>
      ))}
    </div>

    <div className="grid grid-cols-6 gap-1">
      {STICKER_CATEGORIES[stickerCategory].map((url) => (
        <button
          key={url}
          onClick={() =>
            setSelectedSticker(
              selectedSticker?.imageUrl === url
                ? null
                : {
                    name: stickerCategory,
                    style: "image",
                    imageUrl: url,
                  }
            )
          }
          className={`text-2xl p-1.5 rounded-lg transition-all active:scale-90 ${
            selectedSticker?.imageUrl === url
              ? "bg-primary/15 ring-2 ring-primary/40"
              : "hover:bg-secondary/40"
          }`}
        >
          <img
            src={url}
            alt={stickerCategory}
            className="w-full h-full object-contain"
          />
        </button>
      ))}
    </div>

    {selectedSticker && (
      <p className="text-[10px] text-muted-foreground text-center">
        Tap on the canvas to place a sticker
      </p>
    )}
  </div>
)}

{/* Washi tape picker */}
{activeTool === "washi" && (
  <div className="planner-card p-3 space-y-2">
    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
      Select tape pattern
    </p>

    <div className="grid grid-cols-2 gap-2">
      {Object.values(WASHI_CATEGORIES).flat().map((pattern) => (
        <button
          key={pattern.name}
          onClick={() =>
            setSelectedWashi(
              selectedWashi?.name === pattern.name ? null : pattern
            )
          }
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
      <p className="text-[10px] text-muted-foreground text-center">
        Tap on the canvas to place washi tape
      </p>
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
          className={`w-7 h-7 rounded-full transition-all active:scale-90 ${
            penColor === c ? "ring-2 ring-offset-2 ring-primary" : ""
          }`}
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
          className={`w-7 h-7 rounded-full transition-all active:scale-90 border border-border/40 ${
            highlighterColor === c ? "ring-2 ring-offset-2 ring-primary" : ""
          }`}
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
  style={{
    minHeight: 400,
    touchAction:
      activeTool === "pen" ||
      activeTool === "highlighter" ||
      activeTool === "eraser"
        ? "none"
        : "auto",
  }}
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
    style={{
      zIndex: 1,
      pointerEvents:
        activeTool === "pen" ||
        activeTool === "highlighter" ||
        activeTool === "eraser"
          ? "auto"
          : "none",
    }}
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
        <img
          src={item.content}
          alt="sticker"
          className="w-10 h-10 object-contain drop-shadow-sm"
        />
      ) : (
        <div
          className="h-[34px] rounded-sm opacity-80"
          style={{
            width: 160,
            background: item.washiPattern
              ? renderWashiPattern(item.washiPattern)
              : "hsl(var(--accent))",
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
    onClick={() => {
      setPlaced([]);
      setStrokes([]);
    }}
    className="flex items-center gap-1.5 px-3 py-2 bg-destructive/10 text-destructive rounded-lg text-xs font-semibold transition-all active:scale-95"
  >
    <Trash2 className="w-3.5 h-3.5" />
    Clear All
  </button>
</div>