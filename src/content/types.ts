// 학습 콘텐츠 공통 타입

/** Day 메타 정보 (meta.ts 에서 default export) */
export interface DayMeta {
  title: string;
  /** 예상 소요 시간(분) */
  minutes: number;
  /** 한 줄 요약 (코스 목록에 표시) */
  summary: string;
  /** 코드 예제(Sandpack)에서 추가로 쓸 npm 패키지. 예: { zustand: "^5.0.0" } */
  dependencies?: Record<string, string>;
}

/** 객관식 퀴즈 문항 */
export interface QuizQuestion {
  question: string;
  choices: string[];
  /** 정답 보기의 인덱스 (0부터) */
  answer: number;
  /** 제출 후 보여줄 해설 */
  explanation: string;
}

export type Quiz = QuizQuestion[];

/** Day 목록용 정보 (본문은 필요할 때 로드) */
export interface DaySummary extends DayMeta {
  day: number;
}

/** Day 상세 화면용 전체 콘텐츠 */
export interface DayContent extends DaySummary {
  lesson: string;
  example: string;
  quiz: Quiz;
}
