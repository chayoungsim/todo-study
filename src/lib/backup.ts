import { TOTAL_DAYS } from "@/content/loader";
import type { Completions, DayCompletion } from "./progress";

// 학습 기록 JSON 내보내기/가져오기. 가져오는 파일은 외부 입력이므로 모두 검증한다.

const APP_ID = "react-daily";
const BACKUP_VERSION = 1;

export type ParseResult =
  | { ok: true; completions: Completions }
  | { ok: false; error: string };

export function serializeBackup(completions: Completions, now: Date): string {
  return JSON.stringify(
    {
      app: APP_ID,
      version: BACKUP_VERSION,
      exportedAt: now.toISOString(),
      completions,
    },
    null,
    2,
  );
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isInt = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v);

/** 한 Day 의 기록을 검증하고, 알려진 필드만 복사해 돌려준다. 잘못되면 null. */
function parseCompletion(value: unknown): DayCompletion | null {
  if (!isObject(value)) return null;
  const { completedAt, bestScore, total, attempts } = value;
  if (typeof completedAt !== "string" || Number.isNaN(Date.parse(completedAt))) return null;
  if (!isInt(bestScore) || !isInt(total) || !isInt(attempts)) return null;
  if (total < 1 || bestScore < 0 || bestScore > total || attempts < 1) return null;
  return { completedAt, bestScore, total, attempts };
}

export function parseBackup(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "JSON 형식이 올바르지 않습니다." };
  }
  if (!isObject(data) || data.app !== APP_ID) {
    return { ok: false, error: "이 앱에서 내보낸 백업 파일이 아닙니다." };
  }
  if (data.version !== BACKUP_VERSION) {
    return { ok: false, error: "지원하지 않는 백업 파일 버전입니다." };
  }
  if (!isObject(data.completions)) {
    return { ok: false, error: "학습 기록이 들어 있지 않습니다." };
  }

  const completions: Completions = {};
  for (const [key, value] of Object.entries(data.completions)) {
    const day = Number(key);
    if (!/^\d+$/.test(key) || day < 1 || day > TOTAL_DAYS) {
      return { ok: false, error: `올바르지 않은 Day 번호입니다: ${key}` };
    }
    const completion = parseCompletion(value);
    if (!completion) {
      return { ok: false, error: `Day ${day} 의 기록이 올바르지 않습니다.` };
    }
    completions[day] = completion;
  }
  return { ok: true, completions };
}
