import { SiteStatusEnum } from "@/enums/site-status";
import { CheckCircle, CircleOff, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

type StatusConfig = {
  variant: "active" | "inactive" | "default";
  icon: LucideIcon;
  label: string;
};

const STATUS_VARIANTS = {
  active:
    "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/30",
  inactive:
    "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800/30",
  default:
    "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300 dark:border-gray-800/30",
} as const;

export function SiteStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const t = useTranslations("Studio.Sites.Table");

  const getStatusConfig = (status: string): StatusConfig => {
    switch (status.toLowerCase()) {
      case SiteStatusEnum.ACTIVE:
        return {
          variant: "active",
          icon: CheckCircle,
          label: t("Status.Active"),
        };

      case SiteStatusEnum.INACTIVE:
        return {
          variant: "inactive",
          icon: CircleOff,
          label: t("Status.Inactive"),
        };

      default:
        return {
          variant: "default",
          icon: CircleOff,
          label: status || "Unknown",
        };
    }
  };

  const config = getStatusConfig(status);
  const { icon: Icon, variant, label } = config;

  return (
    <div className={cn("flex items-center", className)}>
      <Badge
        variant="outline"
        className={cn(
          STATUS_VARIANTS[variant],
          "flex items-center gap-1.5 px-2.5 py-0.5 font-medium"
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
        <span>{label}</span>
      </Badge>
    </div>
  );
}
