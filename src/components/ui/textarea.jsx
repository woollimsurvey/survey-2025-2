import * as React from "react"

import { cn } from "@/libs/utils"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent enabled:bg-background dark:enabled:bg-muted/60 enabled:hover:bg-muted/80 px-3 py-2 text-base shadow-xs transition-[color,box-shadow,background-color] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-transparent md:text-sm",
        className
      )}
      {...props} />
  );
}

export { Textarea }
