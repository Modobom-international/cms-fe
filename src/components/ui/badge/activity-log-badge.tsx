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
import { useTranslations } from "next-intl";

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
  create:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50",
  update:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50",
  delete:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50",
  view: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50",
  login:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50",
  logout:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50",
  export:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50",
  import:
    "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800/50",
  search:
    "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800/50",
  access_view:
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/50",
  default:
    "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/50",
} as const;

export function ActivityLogBadge({
  action,
  className,
}: {
  action: string;
  className?: string;
}) {
  const t = useTranslations("ActivityLogPage.table.actionTypes");

  const getActionConfig = (action: string): ActionConfig => {
    const normalizedAction = action.toLowerCase();

    switch (normalizedAction) {
      case ActivityLogActionEnum.CREATE:
      case "create_record":
        return {
          variant: "create",
          icon: FilePlus2,
          label: t("CREATE_RECORD"),
        };
      case ActivityLogActionEnum.UPDATE:
      case "update_record":
        return {
          variant: "update",
          icon: PenSquare,
          label: t("UPDATE_RECORD"),
        };
      case ActivityLogActionEnum.DELETE:
      case "delete_record":
        return {
          variant: "delete",
          icon: Trash2,
          label: t("DELETE_RECORD"),
        };
      case ActivityLogActionEnum.VIEW:
      case "show_record":
        return {
          variant: "view",
          icon: Eye,
          label: t("SHOW_RECORD"),
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
      case "access_view":
        return {
          variant: "access_view",
          icon: MonitorCheck,
          label: t("ACCESS_VIEW"),
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
