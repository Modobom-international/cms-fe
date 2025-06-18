import { ActivityLogActionEnum } from "@/enums/activity-log";
import {
  Eye,
  FilePlus2,
  FileSearch,
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
  | "access_view"
  | "show_record"
  | "create_record"
  | "update_record"
  | "delete_record"
  | "get_permission_by_team"
  | "refresh_list_domain"
  | "get_list_path_by_domain"
  | "create_project_cloudflare_page"
  | "update_project_cloudflare_page"
  | "create_deploy_cloudflare_page"
  | "apply_page_domain_cloudflare_page"
  | "deploy_export_cloudflare_page"
  | "detail_monitor_server"
  | "create_page_exports"
  | "update_pages"
  | "default";
  icon: LucideIcon;
  label: string;
};

const ACTION_VARIANTS = {
  access_view:
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/40",
  show_record:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40",
  create_record:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/40",
  update_record:
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40",
  delete_record:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40",
  get_permission_by_team:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40",
  refresh_list_domain:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
  get_list_path_by_domain:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40",
  create_project_cloudflare_page:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/40",
  update_project_cloudflare_page:
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40",
  create_deploy_cloudflare_page:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/40",
  apply_page_domain_cloudflare_page:
    "bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-400/20 dark:text-neutral-300 dark:border-neutral-400/40",
  deploy_export_cloudflare_page:
    "bg-stone-50 text-stone-700 border-stone-200 dark:bg-stone-400/20 dark:text-stone-300 dark:border-stone-400/40",
  detail_monitor_server:
    "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 dark:border-fuchsia-500/40",
  create_page_exports:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/40",
  update_pages:
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40",
  default:
    "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-400/20 dark:text-gray-300 dark:border-gray-400/40",
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
      case ActivityLogActionEnum.ACCESS_VIEW:
        return {
          variant: "access_view",
          icon: MonitorCheck,
          label: "Access View",
        };
      case ActivityLogActionEnum.SHOW_RECORD:
        return {
          variant: "show_record",
          icon: Eye,
          label: "Show Record",
        };
      case ActivityLogActionEnum.CREATE_RECORD:
        return {
          variant: "create_record",
          icon: FilePlus2,
          label: "Create Record",
        };
      case ActivityLogActionEnum.UPDATE_RECORD:
        return {
          variant: "update_record",
          icon: PenSquare,
          label: "Update Record",
        };
      case ActivityLogActionEnum.DELETE_RECORD:
        return {
          variant: "delete_record",
          icon: Trash2,
          label: "Delete Record",
        };
      case ActivityLogActionEnum.GET_PERMISSiON_BY_TEAM:
        return {
          variant: "get_permission_by_team",
          icon: LogIn,
          label: "Get Permission by Team",
        };
      case ActivityLogActionEnum.REFRESH_LIST_DOMAIN:
        return {
          variant: "refresh_list_domain",
          icon: LogOut,
          label: "Refresh List Domain",
        };
      case ActivityLogActionEnum.GET_LIST_PATH_BY_DOMAIN:
        return {
          variant: "get_list_path_by_domain",
          icon: Eye,
          label: "Get List Path by Domain",
        };
      case ActivityLogActionEnum.CREATE_PROJECT_CLOUDFLARE_PAGE:
        return {
          variant: "create_project_cloudflare_page",
          icon: FilePlus2,
          label: "Create Project Cloudflare Page",
        };
      case ActivityLogActionEnum.UPDATE_PROJECT_CLOUDFLARE_PAGE:
        return {
          variant: "update_project_cloudflare_page",
          icon: PenSquare,
          label: "Update Project Cloudflare Page",
        };
      case ActivityLogActionEnum.CREATE_DEPLOY_CLOUDFLARE_PAGE:
        return {
          variant: "create_deploy_cloudflare_page",
          icon: FilePlus2,
          label: "Create Deploy Cloudflare Page",
        };
      case ActivityLogActionEnum.APPLY_PAGE_DOMAIN_CLOUDFLARE_PAGE:
        return {
          variant: "apply_page_domain_cloudflare_page",
          icon: FileSearch,
          label: "Apply Page Domain Cloudflare Page",
        };
      case ActivityLogActionEnum.DEPLOY_EXPORT_CLOUDFLARE_PAGE:
        return {
          variant: "deploy_export_cloudflare_page",
          icon: FileSearch,
          label: "Deploy Export Cloudflare Page",
        };
      case ActivityLogActionEnum.DETAIL_MONITOR_SERVER:
        return {
          variant: "detail_monitor_server",
          icon: FileSearch,
          label: "Detail Monitor Server",
        };
      case ActivityLogActionEnum.CREATE_PAGE_EXPORTS:
        return {
          variant: "create_page_exports",
          icon: FilePlus2,
          label: "Create Page Exports",
        };
      case ActivityLogActionEnum.UPDATE_PAGES:
        return {
          variant: "update_pages",
          icon: PenSquare,
          label: "Update Pages",
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
