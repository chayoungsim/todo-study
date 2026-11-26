import { describe, expect, it } from "vitest";
import { parseBackup, serializeBackup } from "./backup";
import type { Completions } from "./progress";

const sample: Completions = {
  1: { completedAt: "2026-03-10T03:00:00.000Z", bestScore: 2, total: 3, attempts: 1 },
  2: { completedAt: "2026-03-11T03:00:00.000Z", bestScore: 3, total: 3, attempts: 2 },
};

describe("serializeBackup / parseBackup", () => {
  it("내보낸 데이터를 다시 가져오면 그대로 복원된다", () => {
    const text = serializeBackup(sample, new Date("2026-03-12T00:00:00Z"));
    const result = parseBackup(text);
    expect(result).toEqual({ ok: true, completions: sample });
  });

  it("기록이 비어 있어도 왕복된다", () => {
    const result = parseBackup(serializeBackup({}, new Date()));
    expect(result).toEqual({ ok: true, completions: {} });
  });
});

describe("parseBackup 검증", () => {
  const fail = (text: string) => {
    const r = parseBackup(text);
    expect(r.ok).toBe(false);
    return r;
  };
  const make = (completions: unknown, extra: object = {}) =>
    JSON.stringify({ app: "react-daily", version: 1, completions, ...extra });

  it("JSON 이 아니면 실패한다", () => {
    fail("이건 JSON 이 아님");
    fail("");
  });

  it("객체가 아니면 실패한다", () => {
    fail("[]");
    fail("null");
    fail("123");
  });

  it("다른 앱의 파일은 거부한다", () => {
    fail(JSON.stringify({ app: "other", version: 1, completions: {} }));
  });

  it("지원하지 않는 버전은 거부한다", () => {
    fail(make({}, { version: 99 }));
  });

  it("completions 가 없거나 객체가 아니면 실패한다", () => {
    fail(JSON.stringify({ app: "react-daily", version: 1 }));
    fail(make([]));
    fail(make("x"));
  });

  it("Day 키가 양의 정수가 아니면 실패한다", () => {
    const entry = sample[1];
    fail(make({ abc: entry }));
    fail(make({ "0": entry }));
    fail(make({ "-1": entry }));
    fail(make({ "1.5": entry }));
  });

  it("필드 타입이 틀리면 실패한다", () => {
    fail(make({ 1: { ...sample[1], bestScore: "2" } }));
    fail(make({ 1: { ...sample[1], total: null } }));
    fail(make({ 1: { ...sample[1], attempts: 1.5 } }));
    fail(make({ 1: "x" }));
    fail(make({ 1: null }));
  });

  it("날짜가 올바르지 않으면 실패한다", () => {
    fail(make({ 1: { ...sample[1], completedAt: "어제" } }));
    fail(make({ 1: { ...sample[1], completedAt: 12345 } }));
  });

  it("점수 범위가 어긋나면 실패한다", () => {
    fail(make({ 1: { ...sample[1], bestScore: 4, total: 3 } }));
    fail(make({ 1: { ...sample[1], bestScore: -1 } }));
    fail(make({ 1: { ...sample[1], total: 0 } }));
    fail(make({ 1: { ...sample[1], attempts: 0 } }));
  });

  it("30일을 넘는 Day 는 거부한다", () => {
    fail(make({ 31: sample[1] }));
  });

  it("실패하면 사용자에게 보여줄 한국어 메시지를 준다", () => {
    const r = fail("{");
    expect(r.ok === false && r.error.length).toBeGreaterThan(0);
  });

  it("알 수 없는 추가 필드는 버리고 알려진 필드만 가져온다", () => {
    const r = parseBackup(make({ 1: { ...sample[1], hack: "<script>" } }));
    expect(r).toEqual({ ok: true, completions: { 1: sample[1] } });
  });
});
