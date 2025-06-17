import { DomainStatusEnum } from "@/enums/domain-status";
import {
  CheckCircle,
  CircleDashed,
  CircleOff,
  CircleX,
  ClockAlert,
  HelpCircle,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

type StatusConfig = {
  variant:
    | "active"
    | "in_use"
    | "cancelled"
    | "held_expired_redemption_mock"
    | "pending_hold_redemption"
    | "cancelled_redeemable"
    | "default";
  icon: LucideIcon;
  label: string;
};

const STATUS_VARIANTS = {
  cancelled:
    "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50",
  active:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50",
  in_use:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50",
  default:
    "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/50",
  held_expired_redemption_mock:
    "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50",
  pending_hold_redemption:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50",
  cancelled_redeemable:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50",
} as const;

export function DomainStatusBadge({
  status,
  className,
}: {
  status: DomainStatusEnum;
  className?: string;
}) {
  const t = useTranslations("DomainPage.table");

  const getStatusConfig = (status: DomainStatusEnum): StatusConfig => {
    switch (status) {
      case DomainStatusEnum.ACTIVE:
        return {
          variant: "active",
          icon: CheckCircle,
          label: t("status.active"),
        };

      case DomainStatusEnum.CANCELLED:
        return {
          variant: "cancelled",
          icon: CircleOff,
          label: t("status.cancelled"),
        };

      case DomainStatusEnum.HELD_EXPIRED_REDEMPTION_MOCK:
        return {
          variant: "held_expired_redemption_mock",
          icon: Lock,
          label: t("status.heldExpiredRedemptionMock"),
        };

      case DomainStatusEnum.PENDING_HOLD_REDEMPTION:
        return {
          variant: "pending_hold_redemption",
          icon: CircleDashed,
          label: t("status.pendingHoldRedemption"),
        };

      case DomainStatusEnum.CANCELLED_REDEEMABLE:
        return {
          variant: "cancelled_redeemable",
          icon: CircleX,
          label: t("status.cancelledRedeemable"),
        };

      case DomainStatusEnum.IN_USE:
        return {
          variant: "in_use",
          icon: ClockAlert,
          label: t("status.inUse"),
        };

      default:
        return {
          variant: "default",
          icon: HelpCircle,
          label: t("status.default"),
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
