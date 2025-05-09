import { DomainStatusEnum } from "@/enums/domain-status";
import { CheckCircle, HelpCircle, Lock, CircleOff, CircleX, ClockAlert, CircleDashed, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";

type StatusConfig = {
  variant: "active" | "in_use" | "cancelled" | "held_expired_redemption_mock" | "pending_hold_redemption" | "cancelled_redeemable" | "default";
  icon: LucideIcon;
  label: string;
};

const STATUS_VARIANTS = {
  cancelled: "bg-red-50 text-red-800 border-red-200",
  active: "bg-green-100 text-green-800 border-green-200",
  in_use: "bg-blue-100 text-blue-800 border-blue-200",
  default: "bg-gray-50 text-gray-700 border-gray-200",
  held_expired_redemption_mock: "bg-yellow-50 text-yellow-800 border-yellow-200",
  pending_hold_redemption: "bg-purple-50 text-purple-700 border-purple-200",
  cancelled_redeemable: "bg-amber-50 text-amber-700 border-amber-200",
} as const;

export function DomainStatusBadge({
  status,
  className,
}: {
  status: DomainStatusEnum;
  className?: string;
}) {
  const t = useTranslations("DomainPage.table");

  const getStatusConfig = (
    status: DomainStatusEnum,
  ): StatusConfig => {
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
