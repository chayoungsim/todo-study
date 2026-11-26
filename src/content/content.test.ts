import { describe, expect, it } from "vitest";
import type { DayMeta, Quiz } from "./types";

// 모든 Day 콘텐츠가 규칙을 지키는지 검사한다. (새 Day 를 추가할 때 실수를 바로 잡는다.)
const metas = import.meta.glob<DayMeta>("./day-*/meta.ts", { eager: true, import: "default" });
const quizzes = import.meta.glob<Quiz>("./day-*/quiz.json", { eager: true, import: "default" });
const lessons = import.meta.glob<string>("./day-*/lesson.md", { eager: true, query: "?raw", import: "default" });
const examples = import.meta.glob<string>("./day-*/example.tsx", { eager: true, query: "?raw", import: "default" });

const dayOf = (path: string) => Number(path.match(/day-(\d+)\//)![1]);
const dayNumbers = Object.keys(metas).map(dayOf).sort((a, b) => a - b);
const byDay = <T>(modules: Record<string, T>) =>
  new Map(Object.entries(modules).map(([p, m]) => [dayOf(p), m]));

const metaByDay = byDay(metas);
const quizByDay = byDay(quizzes);
const lessonByDay = byDay(lessons);
const exampleByDay = byDay(examples);

// Sandpack 에서 기본으로 쓸 수 있는 패키지 (react-ts 템플릿)
const BUILTIN = ["react", "react-dom"];

describe("콘텐츠 전체", () => {
  it("Day 가 1부터 빠짐없이 이어진다", () => {
    expect(dayNumbers.length).toBeGreaterThan(0);
    expect(dayNumbers).toEqual(dayNumbers.map((_, i) => i + 1));
  });

  it("Day 마다 네 파일이 모두 있다", () => {
    for (const day of dayNumbers) {
      expect(quizByDay.has(day), `Day ${day} quiz.json`).toBe(true);
      expect(lessonByDay.has(day), `Day ${day} lesson.md`).toBe(true);
      expect(exampleByDay.has(day), `Day ${day} example.tsx`).toBe(true);
    }
  });
});

describe.each(dayNumbers)("Day %i", (day) => {
  const meta = metaByDay.get(day)!;
  const quiz = quizByDay.get(day)!;
  const lesson = lessonByDay.get(day)!;
  const example = exampleByDay.get(day)!;

  it("meta 정보가 올바르다", () => {
    expect(meta.title.trim().length).toBeGreaterThan(0);
    expect(meta.summary.trim().length).toBeGreaterThan(0);
    expect(Number.isInteger(meta.minutes)).toBe(true);
    expect(meta.minutes).toBeGreaterThan(0);
    for (const [name, version] of Object.entries(meta.dependencies ?? {})) {
      expect(name.length, "패키지 이름").toBeGreaterThan(0);
      expect(version.length, `${name} 버전`).toBeGreaterThan(0);
    }
  });

  it("퀴즈가 3~5문항이고 모두 유효하다", () => {
    expect(quiz.length).toBeGreaterThanOrEqual(3);
    expect(quiz.length).toBeLessThanOrEqual(5);
    quiz.forEach((q, i) => {
      const where = `문항 ${i + 1}`;
      expect(q.question.trim().length, where).toBeGreaterThan(0);
      expect(q.explanation.trim().length, `${where} 해설`).toBeGreaterThan(0);
      expect(q.choices.length, `${where} 보기 수`).toBeGreaterThanOrEqual(2);
      expect(Number.isInteger(q.answer), `${where} 정답 번호`).toBe(true);
      expect(q.answer, `${where} 정답 범위`).toBeGreaterThanOrEqual(0);
      expect(q.answer, `${where} 정답 범위`).toBeLessThan(q.choices.length);
      expect(new Set(q.choices).size, `${where} 중복 보기`).toBe(q.choices.length);
    });
  });

  it("퀴즈 정답이 한 번호에 몰려 있지 않다", () => {
    const answers = quiz.map((q) => q.answer);
    expect(new Set(answers).size, `정답 번호: ${answers.join(",")}`).toBeGreaterThanOrEqual(2);
  });

  it("레슨이 비어 있지 않고 페이지 제목(h1)과 중복되는 # 제목이 없다", () => {
    expect(lesson.trim().length).toBeGreaterThan(0);
    expect(lesson.split("\n").some((line) => /^# /.test(line))).toBe(false);
  });

  it("예제가 default export 컴포넌트를 가진다", () => {
    expect(example).toMatch(/export\s+default\s+function\s+App|export\s+default\s+App/);
  });

  it("예제가 선언하지 않은 패키지를 import 하지 않는다", () => {
    const allowed = [...BUILTIN, ...Object.keys(meta.dependencies ?? {})];
    const imports = [...example.matchAll(/from\s+["']([^"'./][^"']*)["']/g)].map((m) => m[1]);
    for (const spec of imports) {
      const ok = allowed.some((name) => spec === name || spec.startsWith(name + "/"));
      expect(ok, `"${spec}" 는 meta.dependencies 에 없습니다`).toBe(true);
    }
  });

  it("예제의 반복문이 Sandpack 무한 루프 보호 한도(10만 회)를 넘지 않는다", () => {
    const limits = [...example.matchAll(/for\s*\([^;]*;[^;<]*<\s*([\d_]+)/g)].map((m) =>
      Number(m[1].replaceAll("_", "")),
    );
    for (const limit of limits) {
      expect(limit, `반복 횟수 ${limit}`).toBeLessThanOrEqual(100000);
    }
  });
});
