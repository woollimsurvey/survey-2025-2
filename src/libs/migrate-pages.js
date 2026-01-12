// 이 파일은 마이그레이션을 위한 유틸리티입니다.
// 각 페이지에서 MUI를 shadcn로 교체할 때 사용할 수 있는 공통 패턴입니다.

export const MUI_TO_SHADCN_REPLACEMENTS = {
  imports: {
    from: 'import { Box, LinearProgress, Typography, Tooltip } from "@mui/material";',
    to: `import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";`
  },
  progress: {
    from: /<Box sx=\{\{ display: "flex", alignItems: "center" \}\}>\s*<Box sx=\{\{ width: "100%", mr: 1 \}\}>\s*<LinearProgress\s+variant="determinate"\s+value=\{(\d+)\}\s+sx=\{\{ height: 35 \}\}\s+\/>\s*<\/Box>\s*<Box sx=\{\{ minWidth: 35 \}\}>\s*<Typography variant="(body1|h6)">(\d+)%<\/Typography>\s*<\/Box>\s*<\/Box>/g,
    to: `<div className="flex items-center gap-2">
        <div className="flex-1">
          <Progress value={$1} className="h-9" />
        </div>
        <div className="min-w-[35px] text-lg font-semibold">$3%</div>
      </div>`
  },
  colors: {
    'bg-gray-50': 'bg-muted',
    'bg-gray-100': 'bg-muted',
    'bg-blue-950': 'bg-primary',
    'text-white': 'text-primary-foreground',
    'text-red-400': 'text-destructive',
    'text-red-700': 'text-destructive',
    'text-zinc-950': 'text-foreground',
  },
  tooltip: {
    from: /<Tooltip\s+title=\{\s*<Typography variant="body1">\s*\{([^}]+)\}\s*<\/Typography>\s*\}\s*>\s*<button type="button" className="text-red-400">\s*\(!\)\s*<\/button>\s*<\/Tooltip>/g,
    to: `<TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-destructive">
                          (!)
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{$1}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>`
  }
}

