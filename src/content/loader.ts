import type { DayContent, DayMeta, DaySummary, Quiz } from "./types";

// 폴더 규칙: src/content/day-NN/{meta.ts, lesson.md, example.tsx, quiz.json}
// 폴더를 추가하기만 하면 코드 수정 없이 자동으로 인식된다.
const metaModules = import.meta.glob<DayMeta>("./day-*/meta.ts", {
  eager: true,
  import: "default",
});
const lessonModules = import.meta.glob<string>("./day-*/lesson.md", {
  query: "?raw",
  import: "default",
});
const exampleModules = import.meta.glob<string>("./day-*/example.tsx", {
  query: "?raw",
  import: "default",
});
const quizModules = import.meta.glob<Quiz>("./day-*/quiz.json", {
  import: "default",
});

/** "./day-03/meta.ts" -> 3 */
function parseDay(path: string): number {
  const match = path.match(/day-(\d+)\//);
  if (!match) throw new Error(`Day 경로를 해석할 수 없습니다: ${path}`);
  return Number(match[1]);
}

/** 경로 키를 day 번호 키로 바꾼다. */
function byDay<T>(modules: Record<string, T>): Map<number, T> {
  return new Map(Object.entries(modules).map(([p, m]) => [parseDay(p), m]));
}

const metaByDay = byDay(metaModules);
const lessonByDay = byDay(lessonModules);
const exampleByDay = byDay(exampleModules);
const quizByDay = byDay(quizModules);

/** 작성된 모든 Day 목록 (day 오름차순) */
export const days: DaySummary[] = [...metaByDay.entries()]
  .map(([day, meta]) => ({ day, ...meta }))
  .sort((a, b) => a.day - b.day);

/** 전체 코스 일수 */
export const TOTAL_DAYS = 30;

export function getDaySummary(day: number): DaySummary | undefined {
  return days.find((d) => d.day === day);
}

/** Day 하나의 본문 전체를 불러온다. 없으면 undefined. */
export async function loadDay(day: number): Promise<DayContent | undefined> {
  const summary = getDaySummary(day);
  const loadLesson = lessonByDay.get(day);
  const loadExample = exampleByDay.get(day);
  const loadQuiz = quizByDay.get(day);
  if (!summary || !loadLesson || !loadExample || !loadQuiz) return undefined;

  const [lesson, example, quiz] = await Promise.all([
    loadLesson(),
    loadExample(),
    loadQuiz(),
  ]);
  return { ...summary, lesson, example, quiz };
}
