// 테마(라이트/다크) 판단 로직. React 와 무관한 순수 함수로 두어 단위 테스트할 수 있다.
// index.html 의 인라인 스크립트가 같은 규칙을 쓰므로, 바꿀 때는 theme.test.ts 가 어긋남을 알려 준다.

export const THEMES = ["light", "dark", "system"] as const;
/** 사용자가 고른 값 */
export type Theme = (typeof THEMES)[number];
/** 실제로 화면에 적용되는 값 (system 은 OS 설정에 따라 둘 중 하나가 된다) */
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const DEFAULT_THEME: Theme = "system";
export const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

/** 저장된 문자열을 Theme 으로 바꾼다. 없거나 알 수 없는 값은 기본값(system). */
export function parseTheme(raw: string | null | undefined): Theme {
  return (THEMES as readonly string[]).includes(raw ?? "")
    ? (raw as Theme)
    : DEFAULT_THEME;
}

/** 사용자의 선택과 OS 설정으로 실제 적용할 테마를 정한다. */
export function resolveTheme(theme: Theme, systemDark: boolean): ResolvedTheme {
  if (theme === "system") return systemDark ? "dark" : "light";
  return theme;
}

/** 저장소에서 테마를 읽는다. 저장소가 없거나 접근에서 예외가 나도(사생활 보호 모드 등) 기본값. */
export function readStoredTheme(
  storage: Pick<Storage, "getItem"> | null | undefined,
): Theme {
  try {
    return parseTheme(storage?.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
}

/** 저장소에 테마를 쓴다. 실패해도 예외를 던지지 않고 성공 여부만 돌려준다. */
export function writeStoredTheme(
  storage: Pick<Storage, "setItem"> | null | undefined,
  theme: Theme,
): boolean {
  try {
    if (!storage) return false;
    storage.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

/** window.localStorage 접근은 SecurityError 를 던질 수 있어서 안전하게 가져온다. */
export function getLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** 요소(보통 <html>)에 테마를 적용한다. dark 클래스는 Tailwind 가, color-scheme 은 기본 폼 컨트롤과 스크롤바가 쓴다. */
export function applyTheme(
  element: {
    classList: Pick<DOMTokenList, "toggle">;
    style: Pick<CSSStyleDeclaration, "colorScheme">;
  },
  resolved: ResolvedTheme,
): void {
  element.classList.toggle("dark", resolved === "dark");
  element.style.colorScheme = resolved;
}
