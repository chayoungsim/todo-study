import { createContext, useContext } from "react";
import type { ResolvedTheme, Theme } from "@/lib/theme";

export interface ThemeContextValue {
  /** 사용자가 고른 값 (light / dark / system) */
  theme: Theme;
  /** 실제 적용된 값. system 이면 OS 설정에 따라 light 또는 dark */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("ThemeProvider 안에서 사용하세요.");
  return value;
}
