import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ThemeContext } from "@/hooks/useTheme";
import {
  applyTheme,
  DARK_MEDIA_QUERY,
  getLocalStorage,
  parseTheme,
  readStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  writeStoredTheme,
  type Theme,
} from "@/lib/theme";

/**
 * 라이트/다크 테마를 관리한다.
 * - 사용자의 선택(light / dark / system)을 localStorage 에 저장한다.
 * - system 이면 OS 설정을 따르고, OS 설정이 바뀌면 바로 반영한다.
 * - 다른 탭에서 바꾼 테마도 반영한다.
 * 첫 페인트 전의 적용은 index.html 의 인라인 스크립트가 맡는다. (React 가 뜨기 전이라 여기서는 할 수 없다.)
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() =>
    readStoredTheme(getLocalStorage()),
  );
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia(DARK_MEDIA_QUERY).matches,
  );

  // OS 설정(다크모드)이 바뀌면 따라간다.
  useEffect(() => {
    const query = window.matchMedia(DARK_MEDIA_QUERY);
    const onChange = (event: MediaQueryListEvent) =>
      setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // 다른 탭에서 테마를 바꾸면 이 탭에도 반영한다. (storage 이벤트는 다른 탭에서만 발생한다.)
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === THEME_STORAGE_KEY) {
        setThemeState(parseTheme(event.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const resolvedTheme = resolveTheme(theme, systemDark);

  // 실제 적용: <html> 의 dark 클래스와 color-scheme
  useEffect(() => {
    applyTheme(document.documentElement, resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    writeStoredTheme(getLocalStorage(), next); // 저장에 실패해도 이번 세션에서는 바뀐다.
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
