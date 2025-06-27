import { getPlatformInfo, type PlatformValue } from "@/constants/platform";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

interface PlatformBadgeProps {
  platform: PlatformValue;
  className?: string;
  showIcon?: boolean;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function PlatformBadge({
  platform,
  className,
  showIcon = true,
  variant = "secondary",
}: PlatformBadgeProps) {
  const platformInfo = getPlatformInfo(platform);

  const colorClasses = {
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
    indigo:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300",
    pink: "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300",
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        variant === "secondary" &&
          colorClasses[platformInfo.color as keyof typeof colorClasses],
        className
      )}
    >
      {showIcon && <span>{platformInfo.icon}</span>}
      <span>{platformInfo.label}</span>
    </Badge>
  );
}
