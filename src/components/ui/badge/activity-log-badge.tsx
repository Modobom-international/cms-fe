import { ActivityLogActionEnum } from "@/enums/activity-log";
import {
  Eye,
  FileDown,
  FilePlus2,
  FileSearch,
  FileUp,
  LogIn,
  LogOut,
  type LucideIcon,
  MonitorCheck,
  PenSquare,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

type ActionConfig = {
  variant:
    | "create"
    | "update"
    | "delete"
    | "view"
    | "login"
    | "logout"
    | "export"
    | "import"
    | "search"
    | "access_view"
    | "default";
  icon: LucideIcon;
  label: string;
};

const ACTION_VARIANTS = {
  create: "bg-green-50 text-green-700 border-green-200",
  update: "bg-blue-50 text-blue-700 border-blue-200",
  delete: "bg-red-50 text-red-700 border-red-200",
  view: "bg-indigo-50 text-indigo-700 border-indigo-200",
  login: "bg-emerald-50 text-emerald-700 border-emerald-200",
  logout: "bg-amber-50 text-amber-700 border-amber-200",
  export: "bg-purple-50 text-purple-700 border-purple-200",
  import: "bg-cyan-50 text-cyan-700 border-cyan-200",
  search: "bg-sky-50 text-sky-700 border-sky-200",
  access_view: "bg-teal-50 text-teal-700 border-teal-200",
  default: "bg-gray-50 text-gray-700 border-gray-200",
} as const;

export function ActivityLogBadge({
  action,
  className,
}: {
  action: string;
  className?: string;
}) {
  const getActionConfig = (action: string): ActionConfig => {
    const normalizedAction = action.toLowerCase();

    switch (normalizedAction) {
      case ActivityLogActionEnum.CREATE:
        return {
          variant: "create",
          icon: FilePlus2,
          label: "Create",
        };
      case ActivityLogActionEnum.UPDATE:
        return {
          variant: "update",
          icon: PenSquare,
          label: "Update",
        };
      case ActivityLogActionEnum.DELETE:
        return {
          variant: "delete",
          icon: Trash2,
          label: "Delete",
        };
      case ActivityLogActionEnum.VIEW:
        return {
          variant: "view",
          icon: Eye,
          label: "View",
        };
      case ActivityLogActionEnum.LOGIN:
        return {
          variant: "login",
          icon: LogIn,
          label: "Login",
        };
      case ActivityLogActionEnum.LOGOUT:
        return {
          variant: "logout",
          icon: LogOut,
          label: "Logout",
        };
      case ActivityLogActionEnum.EXPORT:
        return {
          variant: "export",
          icon: FileDown,
          label: "Export",
        };
      case ActivityLogActionEnum.IMPORT:
        return {
          variant: "import",
          icon: FileUp,
          label: "Import",
        };
      case ActivityLogActionEnum.SEARCH:
        return {
          variant: "search",
          icon: FileSearch,
          label: "Search",
        };
      case ActivityLogActionEnum.ACCESS_VIEW:
        return {
          variant: "access_view",
          icon: MonitorCheck,
          label: "Access View",
        };
      default:
        return {
          variant: "default",
          icon: Eye,
          label: action,
        };
    }
  };

  const config = getActionConfig(action);
  const { icon: Icon, variant, label } = config;

  return (
    <div className={cn("flex items-center", className)}>
      <Badge
        variant="outline"
        className={cn(
          ACTION_VARIANTS[variant],
          "flex items-center gap-1.5 px-2.5 py-0.5 font-medium"
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
        <span>{label}</span>
      </Badge>
    </div>
  );
}
