import { CheckCircle, CircleOff, CircleX, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { IApiKey } from "@/types/api-key.type";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

type StatusConfig = {
  variant: "active" | "inactive" | "expired" | "default";
  icon: LucideIcon;
  label: string;
};

const STATUS_VARIANTS = {
  active:
    "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/30",
  inactive:
    "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800/30",
  expired:
    "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/30",
  default:
    "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300 dark:border-gray-800/30",
} as const;

export function ApiKeyStatusBadge({
  apiKey,
  className,
}: {
  apiKey: IApiKey;
  className?: string;
}) {
  const t = useTranslations("ApiKeyPage.table");

  const getStatusConfig = (apiKey: IApiKey): StatusConfig => {
    if (!apiKey.is_active) {
      return {
        variant: "inactive",
        icon: CircleOff,
        label: t("status.inactive"),
      };
    }

    if (apiKey.expires_at) {
      const expirationDate = new Date(apiKey.expires_at);
      const now = new Date();

      if (expirationDate < now) {
        return {
          variant: "expired",
          icon: CircleX,
          label: t("status.expired"),
        };
      }
    }

    return {
      variant: "active",
      icon: CheckCircle,
      label: t("status.active"),
    };
  };

  const config = getStatusConfig(apiKey);
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
