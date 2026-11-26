import { TOTAL_DAYS } from "@/content/loader";
import {
  calcStreak,
  completionDateKeys,
  getCurrentDay,
  isUnlocked,
} from "@/lib/progress";
import { useProgressStore } from "@/stores/progressStore";

export type DayStatus = "completed" | "current" | "unlocked" | "locked";

/** 스토어의 원본 기록을 화면에서 쓰기 좋은 값으로 가공한다. */
export function useProgress() {
  const completions = useProgressStore((s) => s.completions);
  const completedDays = Object.keys(completions).map(Number);
  const currentDay = getCurrentDay(completedDays, TOTAL_DAYS);
  const streak = calcStreak(completionDateKeys(completions), new Date());

  function statusOf(day: number): DayStatus {
    if (completions[day]) return "completed";
    if (!isUnlocked(day, completedDays)) return "locked";
    return day === currentDay ? "current" : "unlocked";
  }

  return {
    completions,
    completedCount: completedDays.length,
    currentDay,
    streak,
    allDone: completedDays.length >= TOTAL_DAYS,
    statusOf,
  };
}
