import { CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import type { DayStatus } from "@/hooks/useProgress";
import { dayStatusLabel } from "./dayStatus";



export default function DayStatusIcon({ status }: { status: DayStatus }) {
  const common = "size-4 shrink-0";
  switch (status) {
    case "completed":
      return <CheckCircle2 className={`${common} text-green-600`} aria-label={dayStatusLabel(status)} />;
    case "current":
      return <PlayCircle className={`${common} text-primary`} aria-label={dayStatusLabel(status)} />;
    case "unlocked":
      return <Circle className={`${common} text-muted-foreground`} aria-label={dayStatusLabel(status)} />;
    case "locked":
      return <Lock className={`${common} text-muted-foreground/60`} aria-label={dayStatusLabel(status)} />;
  }
}
