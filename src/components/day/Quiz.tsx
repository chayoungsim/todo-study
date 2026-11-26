import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { gradeQuiz, type QuizGrade } from "@/lib/progress";
import { useProgressStore } from "@/stores/progressStore";
import type { Quiz as QuizData } from "@/content/types";

interface QuizProps {
  day: number;
  quiz: QuizData;
}

/** 객관식 퀴즈. 모든 문항에 답하고 제출하면 점수와 무관하게 Day 가 완료된다. */
export default function Quiz({ day, quiz }: QuizProps) {
  const submitQuiz = useProgressStore((s) => s.submitQuiz);
  const [answers, setAnswers] = useState<number[]>(() => quiz.map(() => -1));
  const [grade, setGrade] = useState<QuizGrade | null>(null);

  const allAnswered = answers.every((a) => a >= 0);
  const submitted = grade !== null;

  function handleSubmit() {
    const result = gradeQuiz(quiz, answers);
    setGrade(result);
    const accepted = submitQuiz(day, result);
    if (accepted) {
      toast.success(`Day ${day} 완료! (${result.correct}/${result.total})`);
    }
  }

  function handleRetry() {
    setAnswers(quiz.map(() => -1));
    setGrade(null);
  }

  return (
    <section className="space-y-6" aria-label="퀴즈">
      {quiz.map((q, qi) => (
        <fieldset key={qi} className="space-y-3 rounded-lg border p-4" disabled={submitted}>
          <legend className="px-1 font-medium">
            {qi + 1}. {q.question}
          </legend>
          <div className="space-y-2">
            {q.choices.map((choice, ci) => {
              const selected = answers[qi] === ci;
              const isAnswer = q.answer === ci;
              return (
                <label
                  key={ci}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm",
                    selected && !submitted && "border-primary bg-primary/5",
                    submitted && isAnswer && "border-green-600 bg-green-50 dark:bg-green-950/30",
                    submitted && selected && !isAnswer && "border-destructive bg-destructive/5",
                    submitted && "cursor-default",
                  )}
                >
                  <input
                    type="radio"
                    name={`q-${qi}`}
                    checked={selected}
                    onChange={() =>
                      setAnswers((prev) => prev.map((a, i) => (i === qi ? ci : a)))
                    }
                  />
                  {choice}
                </label>
              );
            })}
          </div>
          {submitted && (
            <p className="text-sm text-muted-foreground" role="note">
              {grade.results[qi] ? "정답입니다. " : "오답입니다. "}
              {q.explanation}
            </p>
          )}
        </fieldset>
      ))}

      <div className="flex items-center gap-3">
        {submitted ? (
          <>
            <p className="font-medium">
              결과: {grade.correct} / {grade.total}
            </p>
            <Button variant="outline" onClick={handleRetry}>
              다시 풀기
            </Button>
          </>
        ) : (
          <Button onClick={handleSubmit} disabled={!allAnswered}>
            제출하기
          </Button>
        )}
      </div>
    </section>
  );
}
