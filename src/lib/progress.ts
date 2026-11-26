import type { Quiz } from "@/content/types";

// 해금, streak, 퀴즈 채점 같은 순수 로직 모음 (React/스토어 의존성 없음)

/** 로컬 시간 기준 "YYYY-MM-DD" 키. 날짜 경계는 항상 브라우저 로컬 시간을 따른다. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 완료 기준 해금: Day 1 은 항상 열리고, 그 외에는 이전 Day 를 완료해야 열린다. */
export function isUnlocked(day: number, completedDays: number[]): boolean {
  if (day < 1) return false;
  if (day === 1) return true;
  return completedDays.includes(day - 1);
}

/** 지금 풀어야 할 Day: 완료하지 않은 가장 앞 번호. 전부 완료했으면 마지막 Day. */
export function getCurrentDay(completedDays: number[], totalDays: number): number {
  const done = new Set(completedDays);
  for (let day = 1; day <= totalDays; day++) {
    if (!done.has(day)) return day;
  }
  return totalDays;
}

/** 하루 전 날짜. new Date(y, m, d - 1) 이 월/연/윤년/DST 경계를 처리한다. */
function previousDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
}

/**
 * 연속 학습일 계산.
 * - 오늘 학습했으면 오늘부터, 아직 안 했으면 어제부터 거슬러 올라가며 센다.
 * - 어제도 안 했으면 0.
 */
export function calcStreak(dateKeys: string[], today: Date): number {
  const days = new Set(dateKeys);
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (!days.has(toDateKey(cursor))) {
    cursor = previousDay(cursor);
  }

  let streak = 0;
  while (days.has(toDateKey(cursor))) {
    streak++;
    cursor = previousDay(cursor);
  }
  return streak;
}

export interface QuizGrade {
  correct: number;
  total: number;
  /** 문항별 정답 여부 */
  results: boolean[];
}

/** 퀴즈 채점. answers[i] 는 i번 문항에서 고른 보기 인덱스이고, 미응답이 있으면 에러. */
export function gradeQuiz(quiz: Quiz, answers: number[]): QuizGrade {
  if (answers.length !== quiz.length || answers.some((a) => a < 0)) {
    throw new Error("모든 문항에 답해야 채점할 수 있습니다.");
  }
  const results = quiz.map((q, i) => answers[i] === q.answer);
  return {
    correct: results.filter(Boolean).length,
    total: quiz.length,
    results,
  };
}

/** Day 하나의 완료 기록 */
export interface DayCompletion {
  /** 최초 완료 시각 (ISO). streak 계산의 기준이 되며 재도전해도 바뀌지 않는다. */
  completedAt: string;
  /** 최고 점수 */
  bestScore: number;
  total: number;
  /** 퀴즈 제출 횟수 */
  attempts: number;
}

export type Completions = Record<number, DayCompletion>;

/**
 * 퀴즈 제출 결과를 완료 기록에 반영한 새 객체를 반환한다.
 * - 열리지 않은 Day 는 기록하지 않고 그대로 반환한다.
 * - 최초 제출이면 완료 처리, 재도전이면 최고 점수와 횟수만 갱신한다.
 */
export function applyCompletion(
  completions: Completions,
  day: number,
  grade: Pick<QuizGrade, "correct" | "total">,
  now: Date,
): Completions {
  const completedDays = Object.keys(completions).map(Number);
  if (!isUnlocked(day, completedDays)) return completions;

  const prev = completions[day];
  return {
    ...completions,
    [day]: {
      completedAt: prev?.completedAt ?? now.toISOString(),
      bestScore: Math.max(prev?.bestScore ?? 0, grade.correct),
      total: grade.total,
      attempts: (prev?.attempts ?? 0) + 1,
    },
  };
}

/** 완료 기록에서 streak 계산용 날짜 키(로컬)를 뽑는다. */
export function completionDateKeys(completions: Completions): string[] {
  return Object.values(completions).map((c) => toDateKey(new Date(c.completedAt)));
}
