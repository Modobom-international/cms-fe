import { DomainStatusEnum } from "@/enums/domain-status";
import { CheckCircle, HelpCircle, Lock, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

type StatusConfig = {
  variant: "pending" | "active" | "inactive" | "default" | "verified";
  icon: LucideIcon;
  label: string;
};

const STATUS_VARIANTS = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-red-50 text-red-700 border-red-200",
  default: "bg-gray-50 text-gray-700 border-gray-200",
  verified: "bg-green-50 text-green-700 border-green-200",
} as const;

export function DomainStatusBadge({
  status,
  className,
}: {
  status: DomainStatusEnum;
  className?: string;
}) {
  const getStatusConfig = (status: DomainStatusEnum): StatusConfig => {
    switch (status) {
      case DomainStatusEnum.ACTIVE:
        return {
          variant: "active",
          icon: CheckCircle,
          label: "Active",
        };
      case DomainStatusEnum.INACTIVE:
        return {
          variant: "inactive",
          icon: Lock,
          label: "Inactive",
        };

      default:
        return {
          variant: "default",
          icon: HelpCircle,
          label: String(status),
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
