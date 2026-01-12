"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SurveyProgress } from "@/components/survey/SurveyProgress";
import { cn } from "@/libs/utils";

export function SurveyFooter({
  value,
  prevHref,
  prevLabel = "이전",
  nextLabel = "다음",
  error,
  className,
  progressLabel,
}) {
  return (
    <footer className={cn("mt-6 sticky bottom-4 z-40", className)}>
      <div className="space-y-2 rounded-xl bg-background/85 p-3 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/75">
        {error ? (
          <div className="text-right text-sm font-medium text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <SurveyProgress value={value} label={progressLabel} className="flex-1 border-0 bg-transparent p-0 shadow-none backdrop-blur-0" />

          {prevHref ? (
            <Link href={prevHref}>
              <Button type="button" variant="outline">
                {prevLabel}
              </Button>
            </Link>
          ) : (
            <div />
          )}

          <Button type="submit">
            {nextLabel}
          </Button>
        </div>
      </div>
    </footer>
  );
}


