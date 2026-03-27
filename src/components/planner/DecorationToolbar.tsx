import { useState, useEffect, useRef } from "react";
import { Smile, Scissors, Pen, Highlighter, Eraser, Undo2, Trash2, Upload, Palette, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { uploadDecorationImage, loadCustomUploads, deleteCustomUpload, type WashiPattern } from "@/hooks/useDecorations";

export type DecoTool = "sticker" | "washi" | "pen" | "highlighter" | "eraser" | null;

const EMOJI_PACKS = {
  "Flowers": ["🌸", "🌺", "🌻", "🌷", "🌹", "💐", "🌼", "🪻", "🌿", "🍀", "🌱", "🪴"],
  "Stars & Hearts": ["⭐", "✨", "💫", "🌟", "💖", "💗", "💕", "❤️", "🩷", "🩵", "💜", "🤍"],
  "Cute": ["🎀", "🧸", "🦋", "🐝", "🐞", "🌈", "☁️", "🍓", "🍰", "🧁", "🫧", "✏️"],
  "Planner": ["📌", "📎", "🗓️", "📝", "✅", "⏰", "💡", "🎯", "🏷️", "📖", "🔖", "🗂️"],
  "Weather": ["☀️", "🌤️", "⛅", "🌧️", "⛈️", "🌩️", "❄️", "🌬️", "🌊", "🌙", "🌕", "💧"],
  "Food": ["🍕", "🥑", "🍩", "☕", "🧋", "🍪", "🍫", "🥐", "🧇", "🍑", "🍒", "🫐"],
  "Animals": ["🐱", "🐶", "🦊", "🐰", "🐻", "🦄", "🐸", "🐧", "🦢", "🕊️", "🐾", "🦎"],
  "Travel": ["✈️", "🗺️", "🏖️", "⛰️", "🎡", "🚲", "🌅", "🏕️", "🧳", "🗼", "🎪", "⛵"],
  "Nature": ["🌙", "☀️", "🍂", "🍃", "🪵", "🌊", "🏔️", "🌴", "🦩", "🐚", "🍄", "🪷"],
  "Seasonal": ["🎃", "🎄", "❄️", "🌞", "🎆", "🎇", "🧨", "🎊", "🎋", "🎑", "🪔", "🕯️"],
  "Zodiac": ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"],
  "Symbols": ["☮️", "☯️", "♾️", "🔮", "🧿", "🪬", "💎", "🪩", "🎵", "🎶", "🕯️", "🧘"],
  "Custom": [],
};

export const WASHI_PATTERNS: WashiPattern[] = [
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
  return pattern.colors[0];
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
  onUndo, onClearAll, onClose,
}: DecorationToolbarProps) {
  const { user } = useAuth();
  const [emojiPack, setEmojiPack] = useState<keyof typeof EMOJI_PACKS>("Flowers");
  const [customStickers, setCustomStickers] = useState<string[]>([]);
  const [customWashi, setCustomWashi] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

        {/* Sticker picker */}
        {activeTool === "sticker" && (
          <div className="space-y-2">
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {Object.keys(EMOJI_PACKS).map((pack) => (
                <button
                  key={pack}
                  onClick={() => setEmojiPack(pack as keyof typeof EMOJI_PACKS)}
                  className={`px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${
                    emojiPack === pack ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-foreground/60"
                  }`}
                >
                  {pack}
                </button>
              ))}
            </div>
            {emojiPack === "Custom" ? (
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
                        <img src={url} alt="custom sticker" className="w-full h-full object-contain" />
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
                {EMOJI_PACKS[emojiPack].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(selectedEmoji === emoji ? null : emoji)}
                    className={`text-2xl p-1 rounded-lg transition-all active:scale-90 ${
                      selectedEmoji === emoji ? "bg-primary/15 ring-2 ring-primary/40" : "hover:bg-secondary/40"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            {/* Upload shortcut visible from any pack */}
            {emojiPack !== "Custom" && (
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

        {/* Washi tape picker */}
        {activeTool === "washi" && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              {WASHI_PATTERNS.map((pattern) => (
                <button
                  key={pattern.name}
                  onClick={() => setSelectedWashi(selectedWashi?.name === pattern.name ? null : pattern)}
                  className={`h-9 rounded-lg transition-all active:scale-95 relative overflow-hidden ${
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
                    <img src={url} alt="custom washi" className="w-full h-full object-cover" />
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
            {selectedWashi && <p className="text-[10px] text-muted-foreground text-center">Tap on the page to place washi tape</p>}
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
