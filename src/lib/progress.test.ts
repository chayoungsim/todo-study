import { describe, expect, it } from "vitest";
import {
  applyCompletion,
  calcStreak,
  completionDateKeys,
  getCurrentDay,
  gradeQuiz,
  isUnlocked,
  toDateKey,
} from "./progress";
import type { Quiz } from "@/content/types";

// 월은 0부터 시작하므로 헬퍼로 가독성을 높인다.
const d = (y: number, m: number, day: number, h = 12) =>
  new Date(y, m - 1, day, h);

describe("toDateKey", () => {
  it("로컬 시간 기준 YYYY-MM-DD 를 반환한다", () => {
    expect(toDateKey(d(2026, 3, 5))).toBe("2026-03-05");
  });

  it("자정 직후/직전도 로컬 날짜를 따른다", () => {
    expect(toDateKey(new Date(2026, 0, 1, 0, 0, 1))).toBe("2026-01-01");
    expect(toDateKey(new Date(2025, 11, 31, 23, 59, 59))).toBe("2025-12-31");
  });
});

describe("isUnlocked", () => {
  it("Day 1 은 항상 열려 있다", () => {
    expect(isUnlocked(1, [])).toBe(true);
  });

  it("이전 Day 를 완료해야 열린다", () => {
    expect(isUnlocked(2, [])).toBe(false);
    expect(isUnlocked(2, [1])).toBe(true);
  });

  it("건너뛴 Day 는 열리지 않는다", () => {
    expect(isUnlocked(3, [1])).toBe(false);
    expect(isUnlocked(3, [1, 2])).toBe(true);
  });

  it("0 이하의 Day 는 열리지 않는다", () => {
    expect(isUnlocked(0, [])).toBe(false);
  });
});

describe("getCurrentDay", () => {
  it("아무것도 안 했으면 Day 1", () => {
    expect(getCurrentDay([], 30)).toBe(1);
  });

  it("연속 완료의 다음 Day 를 반환한다", () => {
    expect(getCurrentDay([1, 2, 3], 30)).toBe(4);
  });

  it("중간에 빈 Day 가 있으면 그 Day 를 반환한다", () => {
    expect(getCurrentDay([1, 3], 30)).toBe(2);
  });

  it("전부 완료하면 마지막 Day 에 머문다", () => {
    expect(getCurrentDay([1, 2, 3], 3)).toBe(3);
  });
});

describe("calcStreak", () => {
  const today = d(2026, 3, 10);

  it("기록이 없으면 0", () => {
    expect(calcStreak([], today)).toBe(0);
  });

  it("오늘만 했으면 1", () => {
    expect(calcStreak(["2026-03-10"], today)).toBe(1);
  });

  it("오늘까지 연속된 날을 센다", () => {
    expect(calcStreak(["2026-03-08", "2026-03-09", "2026-03-10"], today)).toBe(3);
  });

  it("오늘 아직 안 했으면 어제까지의 값을 유지한다", () => {
    expect(calcStreak(["2026-03-08", "2026-03-09"], today)).toBe(2);
  });

  it("어제도 안 했으면 0 으로 초기화된다", () => {
    expect(calcStreak(["2026-03-07", "2026-03-08"], today)).toBe(0);
  });

  it("중간에 하루 건너뛰면 그 앞은 세지 않는다", () => {
    expect(calcStreak(["2026-03-07", "2026-03-09", "2026-03-10"], today)).toBe(2);
  });

  it("같은 날 여러 번 완료해도 하루로 센다", () => {
    expect(
      calcStreak(["2026-03-10", "2026-03-10", "2026-03-09"], today),
    ).toBe(2);
  });

  it("월 경계를 넘어 연속된다", () => {
    expect(
      calcStreak(["2026-02-27", "2026-02-28", "2026-03-01"], d(2026, 3, 1)),
    ).toBe(3);
  });

  it("연도 경계를 넘어 연속된다", () => {
    expect(
      calcStreak(["2025-12-31", "2026-01-01"], d(2026, 1, 1)),
    ).toBe(2);
  });

  it("윤년 2월 29일을 지난다", () => {
    expect(calcStreak(["2028-02-28", "2028-02-29", "2028-03-01"], d(2028, 3, 1))).toBe(3);
  });

  it("서머타임 전환일(2026-03-08 미국)을 지나도 연속된다", () => {
    expect(
      calcStreak(["2026-03-07", "2026-03-08", "2026-03-09"], d(2026, 3, 9)),
    ).toBe(3);
  });

  it("서머타임 종료일(2026-11-01 미국)을 지나도 연속된다", () => {
    expect(
      calcStreak(["2026-10-31", "2026-11-01", "2026-11-02"], d(2026, 11, 2)),
    ).toBe(3);
  });

  it("자정 직후(00:00:01)에도 오늘 기준으로 계산한다", () => {
    const justAfterMidnight = new Date(2026, 2, 10, 0, 0, 1);
    expect(calcStreak(["2026-03-09"], justAfterMidnight)).toBe(1);
    expect(calcStreak(["2026-03-10"], justAfterMidnight)).toBe(1);
  });

  it("미래 날짜는 오늘 기준 연속에 영향을 주지 않는다", () => {
    expect(calcStreak(["2026-03-12"], today)).toBe(0);
  });
});

describe("gradeQuiz", () => {
  const quiz: Quiz = [
    { question: "Q1", choices: ["a", "b"], answer: 1, explanation: "e1" },
    { question: "Q2", choices: ["a", "b", "c"], answer: 0, explanation: "e2" },
    { question: "Q3", choices: ["a", "b"], answer: 1, explanation: "e3" },
  ];

  it("정답 개수와 문항별 결과를 계산한다", () => {
    const result = gradeQuiz(quiz, [1, 2, 1]);
    expect(result.correct).toBe(2);
    expect(result.total).toBe(3);
    expect(result.results).toEqual([true, false, true]);
  });

  it("전부 맞히면 만점", () => {
    expect(gradeQuiz(quiz, [1, 0, 1]).correct).toBe(3);
  });

  it("전부 틀려도 채점은 정상 동작한다", () => {
    expect(gradeQuiz(quiz, [0, 1, 0]).correct).toBe(0);
  });

  it("답이 비어 있는 문항이 있으면 에러", () => {
    expect(() => gradeQuiz(quiz, [1, 0])).toThrow();
    expect(() => gradeQuiz(quiz, [1, -1, 1])).toThrow();
  });
});

describe("applyCompletion", () => {
  const now = d(2026, 3, 10);
  const grade = { correct: 2, total: 3 };

  it("최초 제출이면 완료 기록을 만든다", () => {
    const next = applyCompletion({}, 1, grade, now);
    expect(next[1]).toEqual({
      completedAt: now.toISOString(),
      bestScore: 2,
      total: 3,
      attempts: 1,
    });
  });

  it("만점이 아니어도 완료로 처리된다", () => {
    const next = applyCompletion({}, 1, { correct: 0, total: 3 }, now);
    expect(next[1]).toBeDefined();
  });

  it("열리지 않은 Day 는 기록하지 않는다", () => {
    const empty = {};
    expect(applyCompletion(empty, 2, grade, now)).toBe(empty);
  });

  it("재도전하면 최초 완료 시각은 유지하고 최고 점수와 횟수만 갱신한다", () => {
    const first = applyCompletion({}, 1, grade, now);
    const later = d(2026, 3, 12);
    const second = applyCompletion(first, 1, { correct: 3, total: 3 }, later);
    expect(second[1].completedAt).toBe(now.toISOString());
    expect(second[1].bestScore).toBe(3);
    expect(second[1].attempts).toBe(2);
  });

  it("재도전 점수가 낮아도 최고 점수는 내려가지 않는다", () => {
    const first = applyCompletion({}, 1, { correct: 3, total: 3 }, now);
    const second = applyCompletion(first, 1, { correct: 1, total: 3 }, now);
    expect(second[1].bestScore).toBe(3);
  });

  it("원본 객체를 변경하지 않는다", () => {
    const first = applyCompletion({}, 1, grade, now);
    const snapshot = JSON.stringify(first);
    applyCompletion(first, 1, grade, now);
    applyCompletion(first, 2, grade, now);
    expect(JSON.stringify(first)).toBe(snapshot);
  });

  it("완료하면 다음 Day 가 열린다", () => {
    const next = applyCompletion({}, 1, grade, now);
    expect(isUnlocked(2, Object.keys(next).map(Number))).toBe(true);
  });
});

describe("completionDateKeys", () => {
  it("완료 시각을 로컬 날짜 키로 변환한다", () => {
    const completions = applyCompletion({}, 1, { correct: 1, total: 1 }, d(2026, 3, 10));
    expect(completionDateKeys(completions)).toEqual(["2026-03-10"]);
  });
});
