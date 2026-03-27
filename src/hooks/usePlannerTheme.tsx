import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PlannerTheme {
  id: string;
  name: string;
  emoji: string;
  // HSL values (without hsl() wrapper) for CSS variables
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  ring: string;
  mutedForeground: string;
  foreground: string;
  cardForeground: string;
  popoverForeground: string;
  // Custom planner tokens
  plum: string;
  plumLight: string;
  lavender: string;
  lavenderLight: string;
  rose: string;
  sage: string;
  // Preview swatch colors (actual CSS colors for the picker UI)
  swatch: [string, string, string];
}

export const PLANNER_THEMES: PlannerTheme[] = [
  {
    id: "plum",
    name: "Plum",
    emoji: "🍇",
    primary: "303 16% 42%",
    primaryForeground: "30 33% 98%",
    secondary: "300 20% 92%",
    secondaryForeground: "303 16% 42%",
    accent: "300 24% 76%",
    accentForeground: "300 16% 20%",
    border: "300 15% 85%",
    input: "300 15% 85%",
    ring: "303 16% 42%",
    mutedForeground: "300 8% 50%",
    foreground: "300 16% 25%",
    cardForeground: "300 16% 25%",
    popoverForeground: "300 16% 25%",
    plum: "303 16% 42%",
    plumLight: "300 24% 76%",
    lavender: "300 24% 76%",
    lavenderLight: "300 30% 92%",
    rose: "340 30% 80%",
    sage: "140 15% 70%",
    swatch: ["hsl(303,16%,42%)", "hsl(300,24%,76%)", "hsl(340,30%,80%)"],
  },
  {
    id: "rose",
    name: "Rose",
    emoji: "🌹",
    primary: "340 32% 45%",
    primaryForeground: "30 33% 98%",
    secondary: "340 25% 92%",
    secondaryForeground: "340 32% 45%",
    accent: "340 30% 75%",
    accentForeground: "340 25% 20%",
    border: "340 18% 85%",
    input: "340 18% 85%",
    ring: "340 32% 45%",
    mutedForeground: "340 10% 50%",
    foreground: "340 20% 22%",
    cardForeground: "340 20% 22%",
    popoverForeground: "340 20% 22%",
    plum: "340 32% 45%",
    plumLight: "340 30% 75%",
    lavender: "340 30% 75%",
    lavenderLight: "340 30% 92%",
    rose: "340 35% 78%",
    sage: "160 15% 70%",
    swatch: ["hsl(340,32%,45%)", "hsl(340,30%,75%)", "hsl(340,35%,78%)"],
  },
  {
    id: "sage",
    name: "Sage",
    emoji: "🌿",
    primary: "150 20% 38%",
    primaryForeground: "30 33% 98%",
    secondary: "150 18% 91%",
    secondaryForeground: "150 20% 38%",
    accent: "150 18% 72%",
    accentForeground: "150 20% 18%",
    border: "150 12% 84%",
    input: "150 12% 84%",
    ring: "150 20% 38%",
    mutedForeground: "150 8% 48%",
    foreground: "150 15% 22%",
    cardForeground: "150 15% 22%",
    popoverForeground: "150 15% 22%",
    plum: "150 20% 38%",
    plumLight: "150 18% 72%",
    lavender: "150 18% 72%",
    lavenderLight: "150 20% 91%",
    rose: "160 20% 76%",
    sage: "150 18% 68%",
    swatch: ["hsl(150,20%,38%)", "hsl(150,18%,72%)", "hsl(160,20%,76%)"],
  },
  {
    id: "ocean",
    name: "Ocean",
    emoji: "🌊",
    primary: "210 30% 42%",
    primaryForeground: "30 33% 98%",
    secondary: "210 22% 92%",
    secondaryForeground: "210 30% 42%",
    accent: "210 25% 74%",
    accentForeground: "210 25% 18%",
    border: "210 15% 85%",
    input: "210 15% 85%",
    ring: "210 30% 42%",
    mutedForeground: "210 10% 48%",
    foreground: "210 18% 22%",
    cardForeground: "210 18% 22%",
    popoverForeground: "210 18% 22%",
    plum: "210 30% 42%",
    plumLight: "210 25% 74%",
    lavender: "210 25% 74%",
    lavenderLight: "210 25% 92%",
    rose: "200 28% 78%",
    sage: "180 15% 68%",
    swatch: ["hsl(210,30%,42%)", "hsl(210,25%,74%)", "hsl(200,28%,78%)"],
  },
  {
    id: "mocha",
    name: "Mocha",
    emoji: "☕",
    primary: "25 28% 36%",
    primaryForeground: "30 33% 98%",
    secondary: "25 20% 91%",
    secondaryForeground: "25 28% 36%",
    accent: "25 22% 72%",
    accentForeground: "25 22% 18%",
    border: "25 15% 84%",
    input: "25 15% 84%",
    ring: "25 28% 36%",
    mutedForeground: "25 10% 48%",
    foreground: "25 18% 20%",
    cardForeground: "25 18% 20%",
    popoverForeground: "25 18% 20%",
    plum: "25 28% 36%",
    plumLight: "25 22% 72%",
    lavender: "25 22% 72%",
    lavenderLight: "25 22% 91%",
    rose: "20 25% 76%",
    sage: "35 18% 70%",
    swatch: ["hsl(25,28%,36%)", "hsl(25,22%,72%)", "hsl(20,25%,76%)"],
  },
  {
    id: "dusty-blue",
    name: "Dusty Blue",
    emoji: "🦋",
    primary: "220 18% 48%",
    primaryForeground: "30 33% 98%",
    secondary: "220 18% 92%",
    secondaryForeground: "220 18% 48%",
    accent: "220 18% 76%",
    accentForeground: "220 18% 20%",
    border: "220 12% 86%",
    input: "220 12% 86%",
    ring: "220 18% 48%",
    mutedForeground: "220 8% 50%",
    foreground: "220 15% 22%",
    cardForeground: "220 15% 22%",
    popoverForeground: "220 15% 22%",
    plum: "220 18% 48%",
    plumLight: "220 18% 76%",
    lavender: "220 18% 76%",
    lavenderLight: "220 18% 92%",
    rose: "225 20% 78%",
    sage: "200 12% 70%",
    swatch: ["hsl(220,18%,48%)", "hsl(220,18%,76%)", "hsl(225,20%,78%)"],
  },
  {
    id: "daffodil",
    name: "Daffodil",
    emoji: "🌼",
    primary: "50 55% 42%",
    primaryForeground: "30 33% 98%",
    secondary: "50 40% 91%",
    secondaryForeground: "50 55% 42%",
    accent: "50 45% 70%",
    accentForeground: "50 35% 18%",
    border: "50 25% 84%",
    input: "50 25% 84%",
    ring: "50 55% 42%",
    mutedForeground: "50 15% 48%",
    foreground: "48 25% 20%",
    cardForeground: "48 25% 20%",
    popoverForeground: "48 25% 20%",
    plum: "50 55% 42%",
    plumLight: "50 45% 70%",
    lavender: "50 45% 70%",
    lavenderLight: "50 40% 91%",
    rose: "48 48% 74%",
    sage: "55 22% 68%",
    swatch: ["hsl(50,55%,42%)", "hsl(50,45%,70%)", "hsl(48,48%,74%)"],
  },
  {
    id: "gray",
    name: "Pebble",
    emoji: "🪨",
    primary: "0 0% 40%",
    primaryForeground: "30 33% 98%",
    secondary: "0 0% 92%",
    secondaryForeground: "0 0% 40%",
    accent: "0 0% 74%",
    accentForeground: "0 0% 18%",
    border: "0 0% 85%",
    input: "0 0% 85%",
    ring: "0 0% 40%",
    mutedForeground: "0 0% 50%",
    foreground: "0 0% 20%",
    cardForeground: "0 0% 20%",
    popoverForeground: "0 0% 20%",
    plum: "0 0% 40%",
    plumLight: "0 0% 74%",
    lavender: "0 0% 74%",
    lavenderLight: "0 0% 92%",
    rose: "0 0% 78%",
    sage: "0 0% 68%",
    swatch: ["hsl(0,0%,40%)", "hsl(0,0%,74%)", "hsl(0,0%,78%)"],
  },
  {
    id: "teal",
    name: "Lagoon",
    emoji: "🪷",
    primary: "175 30% 38%",
    primaryForeground: "30 33% 98%",
    secondary: "175 20% 91%",
    secondaryForeground: "175 30% 38%",
    accent: "175 22% 72%",
    accentForeground: "175 22% 18%",
    border: "175 14% 84%",
    input: "175 14% 84%",
    ring: "175 30% 38%",
    mutedForeground: "175 8% 48%",
    foreground: "175 18% 20%",
    cardForeground: "175 18% 20%",
    popoverForeground: "175 18% 20%",
    plum: "175 30% 38%",
    plumLight: "175 22% 72%",
    lavender: "175 22% 72%",
    lavenderLight: "175 20% 91%",
    rose: "170 24% 76%",
    sage: "180 18% 68%",
    swatch: ["hsl(175,30%,38%)", "hsl(175,22%,72%)", "hsl(170,24%,76%)"],
  },
];

const CSS_VAR_MAP: Record<string, string> = {
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  border: "--border",
  input: "--input",
  ring: "--ring",
  mutedForeground: "--muted-foreground",
  foreground: "--foreground",
  cardForeground: "--card-foreground",
  popoverForeground: "--popover-foreground",
  plum: "--plum",
  plumLight: "--plum-light",
  lavender: "--lavender",
  lavenderLight: "--lavender-light",
  rose: "--rose",
  sage: "--sage",
};

export const HANDWRITING_FONTS = [
  { id: "caveat", name: "Caveat", family: "'Caveat'" },
  { id: "dancing-script", name: "Dancing Script", family: "'Dancing Script'" },
  { id: "kalam", name: "Kalam", family: "'Kalam'" },
  { id: "patrick-hand", name: "Patrick Hand", family: "'Patrick Hand'" },
  { id: "indie-flower", name: "Indie Flower", family: "'Indie Flower'" },
  { id: "architects-daughter", name: "Architects Daughter", family: "'Architects Daughter'" },
];

interface ThemeContextType {
  theme: PlannerTheme;
  setThemeById: (id: string) => void;
  handwritingFont: typeof HANDWRITING_FONTS[0];
  setHandwritingFontById: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: PLANNER_THEMES[0],
  setThemeById: () => {},
  handwritingFont: HANDWRITING_FONTS[0],
  setHandwritingFontById: () => {},
});

function applyTheme(theme: PlannerTheme) {
  const root = document.documentElement;
  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
    root.style.setProperty(cssVar, (theme as any)[key]);
  }
  // Also update sidebar vars that mirror primary
  root.style.setProperty("--sidebar-primary", theme.primary);
  root.style.setProperty("--sidebar-primary-foreground", theme.primaryForeground);
  root.style.setProperty("--sidebar-accent", theme.secondary);
  root.style.setProperty("--sidebar-accent-foreground", theme.foreground);
  root.style.setProperty("--sidebar-foreground", theme.foreground);
  root.style.setProperty("--sidebar-ring", theme.ring);
  root.style.setProperty("--sidebar-border", theme.border);
}

function applyHandwritingFont(font: typeof HANDWRITING_FONTS[0]) {
  document.documentElement.style.setProperty("--handwriting-font", font.family);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<PlannerTheme>(() => {
    const saved = localStorage.getItem("planner-theme");
    return PLANNER_THEMES.find(t => t.id === saved) || PLANNER_THEMES[0];
  });
  const [handwritingFont, setHandwritingFont] = useState(() => {
    const saved = localStorage.getItem("planner-handwriting-font");
    return HANDWRITING_FONTS.find(f => f.id === saved) || HANDWRITING_FONTS[0];
  });
  const isLoadedFromDb = useRef(false);

  // Load theme from DB when user logs in
  useEffect(() => {
    if (!user) {
      isLoadedFromDb.current = false;
      return;
    }
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("theme_preference")
        .eq("id", user.id)
        .single();
      if (data?.theme_preference) {
        const found = PLANNER_THEMES.find(t => t.id === data.theme_preference);
        if (found) {
          setTheme(found);
          localStorage.setItem("planner-theme", found.id);
        }
      }
      isLoadedFromDb.current = true;
    };
    load();
  }, [user]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyHandwritingFont(handwritingFont);
  }, [handwritingFont]);

  const setThemeById = (id: string) => {
    const found = PLANNER_THEMES.find(t => t.id === id);
    if (found) {
      setTheme(found);
      localStorage.setItem("planner-theme", id);
      if (user) {
        supabase
          .from("profiles")
          .update({ theme_preference: id } as any)
          .eq("id", user.id)
          .then();
      }
    }
  };

  const setHandwritingFontById = (id: string) => {
    const found = HANDWRITING_FONTS.find(f => f.id === id);
    if (found) {
      setHandwritingFont(found);
      localStorage.setItem("planner-handwriting-font", id);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeById, handwritingFont, setHandwritingFontById }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const usePlannerTheme = () => useContext(ThemeContext);