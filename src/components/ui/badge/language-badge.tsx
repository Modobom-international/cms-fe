import { getLanguageInfo, type LanguageCode } from "@/constants/languages";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

interface LanguageBadgeProps {
  language: LanguageCode;
  className?: string;
  showFlag?: boolean;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function LanguageBadge({
  language,
  className,
  showFlag = true,
  variant = "secondary",
}: LanguageBadgeProps) {
  const languageInfo = getLanguageInfo(language);

  const colorClasses = {
    red: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
    yellow:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
    green:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        variant === "secondary" &&
          colorClasses[languageInfo.color as keyof typeof colorClasses],
        className
      )}
    >
      {showFlag && <span>{languageInfo.flag}</span>}
      <span>{languageInfo.name}</span>
    </Badge>
  );
}
