import { Link } from "react-router";
import DayStatusIcon from "@/components/day/DayStatusIcon";
import { dayStatusLabel } from "@/components/day/dayStatus";
import { getDaySummary, TOTAL_DAYS } from "@/content/loader";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";

export default function CoursePage() {
  const { statusOf, completions } = useProgress();
  const dayNumbers = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">전체 코스</h1>
      <ul className="divide-y rounded-lg border">
        {dayNumbers.map((day) => {
          const summary = getDaySummary(day);
          const status = statusOf(day);
          const locked = status === "locked";
          const record = completions[day];
          const row = (
            <div className={cn("flex items-center gap-3 px-4 py-3", locked && "opacity-60")}>
              <DayStatusIcon status={status} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  Day {day}
                  {summary ? ` · ${summary.title}` : " · 준비 중"}
                </p>
                {summary && (
                  <p className="truncate text-sm text-muted-foreground">{summary.summary}</p>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {record ? `${record.bestScore}/${record.total}` : dayStatusLabel(status)}
              </span>
            </div>
          );
          return (
            <li key={day}>
              {locked || !summary ? row : (
                <Link to={`/days/${day}`} className="block hover:bg-muted/50">
                  {row}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
