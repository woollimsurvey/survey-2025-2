"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/libs/utils";

export function SurveyProgress({ value, className, label }) {
  const pct = Math.max(0, Math.min(100, Math.round(value ?? 0)));

  return (
    <div
      className={cn(
        "rounded-lg border p-3 shadow-sm",
        className
      )}
      aria-label="survey progress"
    >
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Progress value={pct} className="h-3" />
        </div>
        <div className="min-w-[44px] text-right text-sm font-semibold tabular-nums text-muted-foreground">
          {pct}%
        </div>
      </div>

      {label ? (
        <div className="mt-2 text-xs text-muted-foreground">
          {label}
        </div>
      ) : null}
    </div>
  );
}


