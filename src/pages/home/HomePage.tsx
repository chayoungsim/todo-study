import { Link } from "react-router";
import { Flame, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StateScreen } from "@/components/StateScreen";
import { getDaySummary, TOTAL_DAYS } from "@/content/loader";
import { useProgress } from "@/hooks/useProgress";

export default function HomePage() {
  const { currentDay, completedCount, streak, allDone } = useProgress();
  const today = getDaySummary(currentDay);
  const percent = Math.round((completedCount / TOTAL_DAYS) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">오늘의 학습</h1>

      <section className="rounded-lg border p-6">
        {allDone ? (
          <StateScreen kind="empty" title="30일 코스를 모두 완료했습니다!" />
        ) : today ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Day {today.day} · 약 {today.minutes}분
            </p>
            <h2 className="text-xl font-semibold">{today.title}</h2>
            <p className="text-muted-foreground">{today.summary}</p>
            <Button asChild>
              <Link to={`/days/${today.day}`}>
                <BookOpen /> 학습 시작
              </Link>
            </Button>
          </div>
        ) : (
          <StateScreen
            kind="empty"
            title={`Day ${currentDay} 는 준비 중입니다`}
            hint="아직 작성되지 않은 학습입니다. 콘텐츠가 추가되면 여기에 나타납니다."
          />
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Flame className="size-4" /> 연속 학습일
          </p>
          <p className="mt-1 text-3xl font-bold">{streak}일</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">진행률</p>
          <p className="mt-1 text-3xl font-bold">
            {completedCount} / {TOTAL_DAYS}
          </p>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="코스 진행률"
          >
            <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </section>
    </div>
  );
}
