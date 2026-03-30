import { useState, useEffect, useRef } from "react";
import { Smile, Scissors, Pen, Highlighter, Eraser, Undo2, Trash2, Upload, Palette, X, Type, Bold, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { uploadDecorationImage, loadCustomUploads, deleteCustomUpload, type WashiPattern } from "@/hooks/useDecorations";

export type DecoTool = "sticker" | "washi" | "pen" | "highlighter" | "eraser" | "text" | null;

// PNG sticker packs — each entry is a path under /stickers/
const STICKER_PACKS: Record<string, string[]> = {
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
  "Food": [
    "/stickers/food/pizza.png",
    "/stickers/food/coffee.png",
    "/stickers/food/donut.png",
    "/stickers/food/avocado.png",
    "/stickers/food/cookie.png",
    "/stickers/food/boba.png",
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
};

// Flat list for backward compat
export const WASHI_PATTERNS: WashiPattern[] = Object.values(WASHI_CATEGORIES).flat();

export const PEN_COLORS = [
  "hsl(303, 16%, 42%)",
  "hsl(340, 30%, 60%)",
  "hsl(210, 50%, 50%)",
  "hsl(140, 30%, 45%)",
  "hsl(30, 40%, 35%)",
  "hsl(0, 0%, 15%)",
];

export const HIGHLIGHTER_COLORS = [
  "hsla(50, 90%, 70%, 0.4)",
  "hsla(340, 70%, 80%, 0.35)",
  "hsla(140, 50%, 70%, 0.35)",
  "hsla(210, 60%, 75%, 0.35)",
  "hsla(300, 40%, 78%, 0.35)",
  "hsla(25, 80%, 75%, 0.35)",
];

export function renderWashiPattern(pattern: WashiPattern) {
  if (pattern.imageUrl) return `url(${pattern.imageUrl})`;
  if (pattern.style === "striped") {
    return `repeating-linear-gradient(135deg, ${pattern.colors[0]} 0px, ${pattern.colors[0]} 4px, ${pattern.colors[1]} 4px, ${pattern.colors[1]} 8px)`;
  }
  if (pattern.style === "dotted") {
    return `radial-gradient(circle 2px, ${pattern.colors[1]} 100%, transparent 100%), ${pattern.colors[0]}`;
  }
  return pattern.colors[0] || "hsl(var(--accent))";
}

interface DecorationToolbarProps {
  activeTool: DecoTool;
  setActiveTool: (t: DecoTool) => void;
  selectedEmoji: string | null;
  setSelectedEmoji: (e: string | null) => void;
  selectedWashi: WashiPattern | null;
  setSelectedWashi: (w: WashiPattern | null) => void;
  penColor: string;
  setPenColor: (c: string) => void;
  highlighterColor: string;
  setHighlighterColor: (c: string) => void;
  washiOrientation: "horizontal" | "vertical";
  setWashiOrientation: (o: "horizontal" | "vertical") => void;
  washiLength: number;
  setWashiLength: (l: number) => void;
  isBold: boolean;
  setIsBold: (b: boolean) => void;
  onUndo: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

export function DecorationToolbar({
  activeTool, setActiveTool,
  selectedEmoji, setSelectedEmoji,
  selectedWashi, setSelectedWashi,
  penColor, setPenColor,
  highlighterColor, setHighlighterColor,
  washiOrientation, setWashiOrientation,
  washiLength, setWashiLength,
  isBold, setIsBold,
  onUndo, onClearAll, onClose,
}: DecorationToolbarProps) {
  const { user } = useAuth();
  const [stickerPack, setStickerPack] = useState<keyof typeof STICKER_PACKS>("Flowers");
  const [customStickers, setCustomStickers] = useState<string[]>([]);
  const [customWashi, setCustomWashi] = useState<string[]>([]);
  const [expandedWashiCategory, setExpandedWashiCategory] = useState<string | null>("Classic");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadCustomUploads(user.id, "sticker").then(setCustomStickers);
    loadCustomUploads(user.id, "washi").then(setCustomWashi);
  }, [user]);

  const handleUpload = async (type: "sticker" | "washi") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !user) return;
      setUploading(true);
      const url = await uploadDecorationImage(file, type, user.id);
      if (url) {
        if (type === "sticker") setCustomStickers(prev => [...prev, url]);
        else setCustomWashi(prev => [...prev, url]);
      }
      setUploading(false);
    };
    input.click();
  };

  const handleDelete = async (url: string, type: "sticker" | "washi") => {
    if (!user) return;
    const ok = await deleteCustomUpload(url, user.id, type);
    if (ok) {
      if (type === "sticker") {
        setCustomStickers(prev => prev.filter(u => u !== url));
        if (selectedEmoji === url) setSelectedEmoji(null);
      } else {
        setCustomWashi(prev => prev.filter(u => u !== url));
        if (selectedWashi?.imageUrl === url) setSelectedWashi(null);
      }
    }
  };

  const toolButtons: { tool: DecoTool; icon: React.ElementType; label: string }[] = [
    { tool: "sticker", icon: Smile, label: "Stickers" },
    { tool: "washi", icon: Scissors, label: "Washi" },
    { tool: "pen", icon: Pen, label: "Pen" },
    { tool: "highlighter", icon: Highlighter, label: "Highlight" },
    { tool: "eraser", icon: Eraser, label: "Eraser" },
  ];

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 bg-card/98 backdrop-blur-md border-t border-border/50 shadow-lg max-h-[50vh] overflow-y-auto" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="max-w-2xl mx-auto px-3 py-2 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground/70">🎨 Decorating</span>
          <div className="flex gap-1.5">
            <button onClick={onUndo} className="flex items-center gap-1 px-2 py-1 bg-secondary/60 text-foreground/60 rounded-md text-[10px] font-semibold active:scale-95">
              <Undo2 className="w-3 h-3" /> Undo
            </button>
            <button onClick={onClearAll} className="flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive rounded-md text-[10px] font-semibold active:scale-95">
              <Trash2 className="w-3 h-3" /> Clear
            </button>
            <button onClick={onClose} className="p-1 rounded-md bg-secondary/60 text-foreground/60 active:scale-95">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tool bar */}
        <div className="flex gap-1 justify-center flex-wrap">
          {toolButtons.map(({ tool, icon: Icon, label }) => (
            <button
              key={tool}
              onClick={() => setActiveTool(activeTool === tool ? null : tool)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95 ${
                activeTool === tool ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-foreground/70"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Sticker picker — now PNG images */}
        {activeTool === "sticker" && (
          <div className="space-y-2">
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {Object.keys(STICKER_PACKS).map((pack) => (
                <button
                  key={pack}
                  onClick={() => setStickerPack(pack as keyof typeof STICKER_PACKS)}
                  className={`px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${
                    stickerPack === pack ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-foreground/60"
                  }`}
                >
                  {pack}
                </button>
              ))}
            </div>
            {stickerPack === "Custom" ? (
              <div className="space-y-2">
                <div className="grid grid-cols-6 gap-1">
                  {customStickers.map((url) => (
                    <div key={url} className="relative group">
                      <button
                        onClick={() => setSelectedEmoji(selectedEmoji === url ? null : url)}
                        className={`p-1 rounded-lg transition-all active:scale-90 aspect-square w-full ${
                          selectedEmoji === url ? "bg-primary/15 ring-2 ring-primary/40" : "hover:bg-secondary/40"
                        }`}
                      >
                        <img src={url} alt="custom sticker" className="w-full h-full object-contain" loading="lazy" />
                      </button>
                      <button
                        onClick={() => handleDelete(url, "sticker")}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center active:scale-90 shadow-sm"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleUpload("sticker")}
                    disabled={uploading}
                    className="flex items-center justify-center p-1 rounded-lg border-2 border-dashed border-border/60 text-muted-foreground hover:bg-secondary/40 aspect-square active:scale-90"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
                {uploading && <p className="text-[10px] text-muted-foreground text-center animate-pulse">Uploading & resizing...</p>}
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-1">
                {STICKER_PACKS[stickerPack].map((src) => (
                  <button
                    key={src}
                    onClick={() => setSelectedEmoji(selectedEmoji === src ? null : src)}
                    className={`p-1 rounded-lg transition-all active:scale-90 aspect-square ${
                      selectedEmoji === src ? "bg-primary/15 ring-2 ring-primary/40" : "hover:bg-secondary/40"
                    }`}
                  >
                    <img src={src} alt="sticker" className="w-full h-full object-contain" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
            {/* Upload shortcut visible from any pack */}
            {stickerPack !== "Custom" && (
              <button
                onClick={() => handleUpload("sticker")}
                disabled={uploading}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-dashed border-border/60 text-muted-foreground text-[10px] font-semibold hover:bg-secondary/40 active:scale-95"
              >
                <Upload className="w-3 h-3" />
                {uploading ? "Uploading..." : "Upload custom sticker"}
              </button>
            )}
            {selectedEmoji && (
              <p className="text-[10px] text-muted-foreground text-center">Tap on the page to place</p>
            )}
          </div>
        )}

        {/* Washi tape picker — categorized PNG images */}
        {activeTool === "washi" && (
          <div className="space-y-2">
            {/* Category list */}
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {Object.entries(WASHI_CATEGORIES).map(([category, patterns]) => (
                <div key={category}>
                  <button
                    onClick={() => setExpandedWashiCategory(expandedWashiCategory === category ? null : category)}
                    className="flex items-center gap-1 w-full px-2 py-1.5 rounded-md text-[11px] font-semibold text-foreground/70 hover:bg-secondary/40 transition-all"
                  >
                    {expandedWashiCategory === category ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    {category}
                    <span className="text-[9px] text-muted-foreground ml-1">({patterns.length})</span>
                  </button>
                  {expandedWashiCategory === category && (
                    <div className="grid grid-cols-2 gap-1.5 px-1 pb-1">
                      {patterns.map((pattern) => (
                        <button
                          key={pattern.imageUrl}
                          onClick={() => setSelectedWashi(selectedWashi?.imageUrl === pattern.imageUrl ? null : pattern)}
                          className={`h-9 rounded-lg transition-all active:scale-95 relative overflow-hidden ${
                            selectedWashi?.imageUrl === pattern.imageUrl ? "ring-2 ring-primary/60" : ""
                          }`}
                        >
                          <img src={pattern.imageUrl} alt={pattern.name} className="w-full h-full object-cover" loading="lazy" />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground/60 mix-blend-multiply">
                            {pattern.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Custom washi */}
            <div className="flex gap-1.5 flex-wrap">
              {customWashi.map((url) => (
                <div key={url} className="relative group">
                  <button
                    onClick={() => setSelectedWashi(selectedWashi?.imageUrl === url ? null : { name: "Custom", colors: [], style: "image", imageUrl: url })}
                    className={`h-9 w-24 rounded-lg overflow-hidden transition-all active:scale-95 ${
                      selectedWashi?.imageUrl === url ? "ring-2 ring-primary/60" : ""
                    }`}
                  >
                    <img src={url} alt="custom washi" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                  <button
                    onClick={() => handleDelete(url, "washi")}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center active:scale-90 shadow-sm"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleUpload("washi")}
                disabled={uploading}
                className="h-9 w-24 rounded-lg border-2 border-dashed border-border/60 flex items-center justify-center text-muted-foreground hover:bg-secondary/40 active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 mr-1" />
                <span className="text-[10px] font-semibold">Upload</span>
              </button>
            </div>
            {/* Washi controls: orientation + length */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <button
                  onClick={() => setWashiOrientation("horizontal")}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${washiOrientation === "horizontal" ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-foreground/60"}`}
                >
                  ― Horizontal
                </button>
                <button
                  onClick={() => setWashiOrientation("vertical")}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${washiOrientation === "vertical" ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-foreground/60"}`}
                >
                  | Vertical
                </button>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">Length</span>
                <input
                  type="range"
                  min={60}
                  max={400}
                  step={16}
                  value={washiLength}
                  onChange={(e) => setWashiLength(Number(e.target.value))}
                  className="flex-1 h-2 accent-primary"
                />
                <span className="text-[10px] text-muted-foreground w-8">{washiLength}</span>
              </div>
            </div>
            {selectedWashi && <p className="text-[10px] text-muted-foreground text-center">Tap on the page to place washi tape</p>}
          </div>
        )}

        {/* Text tool */}
        {activeTool === "text" && (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground text-center">Tap on the page to add a text decoration</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setIsBold(!isBold)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95 ${
                  isBold ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-foreground/70"
                }`}
              >
                <Bold className="w-3.5 h-3.5" />
                Bold
              </button>
            </div>
          </div>
        )}

        {/* Pen colors */}
        {activeTool === "pen" && (
          <div className="flex items-center gap-2 justify-center py-1">
            <Palette className="w-3.5 h-3.5 text-muted-foreground" />
            {PEN_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setPenColor(c)}
                className={`w-6 h-6 rounded-full transition-all active:scale-90 ${penColor === c ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                style={{ background: c }}
              />
            ))}
          </div>
        )}

        {/* Highlighter colors */}
        {activeTool === "highlighter" && (
          <div className="flex items-center gap-2 justify-center py-1">
            <Palette className="w-3.5 h-3.5 text-muted-foreground" />
            {HIGHLIGHTER_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setHighlighterColor(c)}
                className={`w-6 h-6 rounded-full transition-all active:scale-90 border border-border/40 ${highlighterColor === c ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                style={{ background: c.replace(/[\d.]+\)$/, "1)") }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
