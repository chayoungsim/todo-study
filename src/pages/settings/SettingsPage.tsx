import { useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseBackup, serializeBackup } from "@/lib/backup";
import { toDateKey, type Completions } from "@/lib/progress";
import { useProgressStore } from "@/stores/progressStore";

export default function SettingsPage() {
  const completions = useProgressStore((s) => s.completions);
  const replaceCompletions = useProgressStore((s) => s.replaceCompletions);
  const reset = useProgressStore((s) => s.reset);

  const fileInput = useRef<HTMLInputElement>(null);
  // 가져오기 확인 대화상자에 쓸, 검증을 통과한 대기 중 데이터
  const [pending, setPending] = useState<Completions | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const recordCount = Object.keys(completions).length;

  function handleExport() {
    const now = new Date();
    const blob = new Blob([serializeBackup(completions, now)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `react-daily-backup-${toDateKey(now)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("백업 파일을 저장했습니다.");
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const result = parseBackup(await file.text());
    if (!result.ok) {
      toast.error(`가져오기 실패: ${result.error}`);
      return;
    }
    setPending(result.completions);
  }

  function confirmImport() {
    if (!pending) return;
    replaceCompletions(pending);
    toast.success(`기록 ${Object.keys(pending).length}개를 가져왔습니다.`);
    setPending(null);
  }

  function confirmReset() {
    reset();
    setResetOpen(false);
    toast.success("모든 기록을 지웠습니다.");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold">설정</h1>

      <section className="space-y-3 rounded-lg border p-5">
        <h2 className="text-lg font-semibold">학습 기록 백업</h2>
        <p className="text-sm text-muted-foreground">
          기록은 이 브라우저에만 저장됩니다. 브라우저 데이터를 지우거나 다른 기기에서 이어서
          하려면 백업 파일로 옮기세요. 현재 저장된 기록: {recordCount}개
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExport}>
            <Download /> 내보내기
          </Button>
          <Button variant="outline" onClick={() => fileInput.current?.click()}>
            <Upload /> 가져오기
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
              // 같은 파일을 다시 골라도 change 가 발생하도록 비운다.
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-destructive/40 p-5">
        <h2 className="text-lg font-semibold">기록 초기화</h2>
        <p className="text-sm text-muted-foreground">
          모든 학습 기록을 지웁니다. 되돌릴 수 없으니 먼저 백업하세요.
        </p>
        <Button variant="destructive" onClick={() => setResetOpen(true)} disabled={recordCount === 0}>
          <Trash2 /> 모든 기록 지우기
        </Button>
      </section>

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>백업을 가져올까요?</DialogTitle>
            <DialogDescription>
              현재 기록 {recordCount}개가 백업 파일의 기록 {pending ? Object.keys(pending).length : 0}개로
              완전히 교체됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button onClick={confirmImport}>덮어쓰기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>모든 기록을 지울까요?</DialogTitle>
            <DialogDescription>
              완료 기록 {recordCount}개와 연속 학습일이 사라집니다. 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmReset}>
              지우기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
