import { describe, expect, it } from "vitest";
import indexHtml from "../../index.html?raw";
import {
  applyTheme,
  parseTheme,
  readStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  writeStoredTheme,
} from "./theme";

describe("parseTheme", () => {
  it("올바른 값은 그대로 돌려준다", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
    expect(parseTheme("system")).toBe("system");
  });

  it("없거나 잘못된 값은 system 으로 취급한다", () => {
    expect(parseTheme(null)).toBe("system");
    expect(parseTheme(undefined)).toBe("system");
    expect(parseTheme("")).toBe("system");
    expect(parseTheme("Dark")).toBe("system"); // 대소문자도 구분한다
    expect(parseTheme("garbage")).toBe("system");
  });
});

describe("resolveTheme", () => {
  it("light / dark 는 OS 설정과 무관하게 그대로다", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("light", false)).toBe("light");
    expect(resolveTheme("dark", true)).toBe("dark");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("system 은 OS 설정을 따른다", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});

describe("readStoredTheme / writeStoredTheme", () => {
  it("저장된 값을 읽는다", () => {
    const storage = { getItem: (key: string) => (key === THEME_STORAGE_KEY ? "dark" : null) };
    expect(readStoredTheme(storage)).toBe("dark");
  });

  it("저장된 값이 없으면 system", () => {
    expect(readStoredTheme({ getItem: () => null })).toBe("system");
  });

  it("저장소가 없거나 접근 시 예외가 나도 system (사생활 보호 모드 등)", () => {
    expect(readStoredTheme(null)).toBe("system");
    expect(
      readStoredTheme({
        getItem: () => {
          throw new Error("SecurityError");
        },
      }),
    ).toBe("system");
  });

  it("값을 저장하고, 저장에 실패해도 예외를 던지지 않는다", () => {
    const saved: Record<string, string> = {};
    expect(writeStoredTheme({ setItem: (k, v) => void (saved[k] = v) }, "dark")).toBe(true);
    expect(saved[THEME_STORAGE_KEY]).toBe("dark");

    const failing = {
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(writeStoredTheme(failing, "dark")).toBe(false);
    expect(writeStoredTheme(null, "dark")).toBe(false);
  });
});

describe("applyTheme", () => {
  const makeElement = () => {
    const classes = new Set<string>();
    return {
      classes,
      classList: {
        toggle: (name: string, force?: boolean) => {
          if (force) classes.add(name);
          else classes.delete(name);
          return !!force;
        },
      },
      style: { colorScheme: "" },
    };
  };

  it("dark 이면 dark 클래스를 붙이고 color-scheme 을 dark 로 둔다", () => {
    const el = makeElement();
    applyTheme(el, "dark");
    expect(el.classes.has("dark")).toBe(true);
    expect(el.style.colorScheme).toBe("dark");
  });

  it("light 이면 dark 클래스를 떼고 color-scheme 을 light 로 둔다", () => {
    const el = makeElement();
    applyTheme(el, "dark");
    applyTheme(el, "light");
    expect(el.classes.has("dark")).toBe(false);
    expect(el.style.colorScheme).toBe("light");
  });

  it("같은 값을 여러 번 적용해도 결과가 같다", () => {
    const el = makeElement();
    applyTheme(el, "dark");
    applyTheme(el, "dark");
    expect(el.classes.has("dark")).toBe(true);
  });
});

// index.html 의 인라인 스크립트(첫 페인트 전에 테마를 적용)는 React 코드를 가져다 쓸 수 없어서
// 같은 규칙이 두 곳에 있다. 둘이 어긋나지 않는지 모든 조합으로 확인한다.
describe("index.html 인라인 스크립트와 theme.ts 의 규칙 일치", () => {
  const source = indexHtml.match(/<script>([\s\S]*?)<\/script>/)?.[1];

  function runInlineScript(stored: string | null, osDark: boolean) {
    const added: string[] = [];
    const style: { colorScheme?: string } = {};
    const fakeDocument = { documentElement: { classList: { add: (c: string) => added.push(c) }, style } };
    const fakeStorage = { getItem: (key: string) => (key === THEME_STORAGE_KEY ? stored : null) };
    new Function("localStorage", "matchMedia", "document", source!)(
      fakeStorage,
      () => ({ matches: osDark }),
      fakeDocument,
    );
    return { dark: added.includes("dark"), colorScheme: style.colorScheme };
  }

  it("인라인 스크립트가 존재한다", () => {
    expect(source).toBeTruthy();
  });

  const storedValues: (string | null)[] = [null, "light", "dark", "system", "garbage", ""];
  for (const stored of storedValues) {
    for (const osDark of [true, false]) {
      it(`저장값 ${JSON.stringify(stored)} / OS ${osDark ? "dark" : "light"}`, () => {
        const expected = resolveTheme(parseTheme(stored), osDark);
        const result = runInlineScript(stored, osDark);
        expect(result.dark).toBe(expected === "dark");
        expect(result.colorScheme).toBe(expected);
      });
    }
  }

  it("저장소 접근에서 예외가 나도 스크립트가 죽지 않는다", () => {
    const fakeDocument = { documentElement: { classList: { add: () => {} }, style: {} } };
    const throwing = {
      getItem: () => {
        throw new Error("SecurityError");
      },
    };
    expect(() =>
      new Function("localStorage", "matchMedia", "document", source!)(throwing, () => ({ matches: true }), fakeDocument),
    ).not.toThrow();
  });
});
