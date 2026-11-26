import type { DayStatus } from "@/hooks/useProgress";

const LABEL: Record<DayStatus, string> = {
  completed: "완료",
  current: "오늘의 학습",
  unlocked: "열림",
  locked: "잠김",
};

export function dayStatusLabel(status: DayStatus) {
  return LABEL[status];
}
