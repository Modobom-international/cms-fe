"use client";

import React from "react";

import {
  Activity,
  AlertCircle,
  BarChart3,
  Clock,
  Eye,
  FileText,
} from "lucide-react";

import { cn } from "@/lib/utils";

// Action group configuration with icons and colors
export const ACTION_GROUPS = {
  SITE_MANAGEMENT: {
    label: "Site Management",
    actions: [
      "create_site",
      "update_site",
      "delete_site",
      "activate_site",
      "deactivate_site",
      "update_site_language",
      "update_site_platform",
    ] as const,
    color: "bg-blue-500/10 text-blue-700 border-blue-200",
    icon: Activity,
  },
  PAGE_MANAGEMENT: {
    label: "Page Management",
    actions: [
      "create_page",
      "update_page",
      "delete_page",
      "export_page",
      "update_tracking_script",
      "remove_tracking_script",
      "get_tracking_script",
      "cancel_export",
      "create_page_exports",
      "create_pages",
      "update_pages",
    ] as const,
    color: "bg-green-500/10 text-green-700 border-green-200",
    icon: FileText,
  },
  ATTENDANCE_MANAGEMENT: {
    label: "Attendance Management",
    actions: [
      "checkin_attendance",
      "checkout_attendance",
      "get_attendance",
      "get_attendance_report",
      "add_custom_attendance",
      "update_custom_attendance",
    ] as const,
    color: "bg-purple-500/10 text-purple-700 border-purple-200",
    icon: Clock,
  },
  ATTENDANCE_COMPLAINTS: {
    label: "Attendance Complaints",
    actions: [
      "create_attendance_complaint",
      "update_attendance_complaint",
      "get_attendance_complaints",
      "review_attendance_complaint",
      "respond_to_attendance_complaint",
      "get_attendance_complaint_stats",
    ] as const,
    color: "bg-orange-500/10 text-orange-700 border-orange-200",
    icon: AlertCircle,
  },
  BOARD_MANAGEMENT: {
    label: "Board Management",
    actions: [
      "create_list",
      "update_list",
      "delete_list",
      "update_list_positions",
      "get_board_lists",
      "add_board_member",
      "remove_board_member",
      "get_board_members",
    ] as const,
    color: "bg-teal-500/10 text-teal-700 border-teal-200",
    icon: BarChart3,
  },
  CLOUDFLARE_OPERATIONS: {
    label: "Cloudflare Operations",
    actions: [
      "create_project_cloudflare_page",
      "update_project_cloudflare_page",
      "create_deploy_cloudflare_page",
      "apply_page_domain_cloudflare_page",
      "deploy_export_cloudflare_page",
    ] as const,
    color: "bg-orange-500/10 text-orange-700 border-orange-200",
    icon: BarChart3,
  },
  DOMAIN_OPERATIONS: {
    label: "Domain Operations",
    actions: ["refresh_list_domain", "get_list_path_by_domain"] as const,
    color: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
    icon: Clock,
  },
  GENERAL_OPERATIONS: {
    label: "General Operations",
    actions: [
      "access_view",
      "show_record",
      "create_record",
      "update_record",
      "delete_record",
      "get_permission_by_team",
      "detail_monitor_server",
    ] as const,
    color: "bg-gray-500/10 text-gray-700 border-gray-200",
    icon: Eye,
  },
} as const;

export type ActionGroupKey = keyof typeof ACTION_GROUPS;

interface ActionGroupBadgeProps {
  groupKey: ActionGroupKey | string;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ActionGroupBadge({
  groupKey,
  className,
  showIcon = true,
  size = "md",
}: ActionGroupBadgeProps) {
  const group = ACTION_GROUPS[groupKey as ActionGroupKey];

  if (!group) {
    return <span className="text-muted-foreground text-xs">{groupKey}</span>;
  }

  const Icon = group.icon;

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-xs",
    lg: "px-2.5 py-1.5 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border font-medium",
        group.color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={cn("size-3", size === "lg" && "size-4")} />}
      {group.label}
    </span>
  );
}
