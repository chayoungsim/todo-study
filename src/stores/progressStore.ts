import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  applyCompletion,
  type Completions,
  type QuizGrade,
} from "@/lib/progress";

// 학습 진행 상태. localStorage 에 저장된다. (백엔드 없음)
interface ProgressState {
  completions: Completions;
  /** 퀴즈 제출 결과를 반영한다. 열리지 않은 Day 면 false 를 반환한다. */
  submitQuiz: (day: number, grade: Pick<QuizGrade, "correct" | "total">) => boolean;
  /** 기록 전체를 주어진 값으로 교체한다. (백업 가져오기) */
  replaceCompletions: (completions: Completions) => void;
  /** 모든 기록을 지운다. */
  reset: () => void;
}

export const PROGRESS_STORAGE_KEY = "react-daily-progress";

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completions: {},
      submitQuiz: (day, grade) => {
        const next = applyCompletion(get().completions, day, grade, new Date());
        if (next === get().completions) return false;
        set({ completions: next });
        return true;
      },
      replaceCompletions: (completions) => set({ completions }),
      reset: () => set({ completions: {} }),
    }),
    {
      name: PROGRESS_STORAGE_KEY,
      version: 1,
      // 함수는 저장하지 않고 데이터만 저장한다.
      partialize: (state) => ({ completions: state.completions }),
    },
  ),
);
