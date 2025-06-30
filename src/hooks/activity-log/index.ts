import { activityLogQueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import qs from "qs";

import { IActivityLogResponse } from "@/types/activity-log.type";

import apiClient from "@/lib/api/client";

// Enhanced activity log hook with advanced filtering
export const useGetActivityLogs = (
  page: number,
  pageSize: number,
  search?: string,
  dateFrom?: string,
  dateTo?: string,
  userId?: string,
  actionGroups?: string[],
  sortBy?: string
) => {
  const params = qs.stringify(
    {
      page,
      pageSize,
      search,
      date_from: dateFrom,
      date_to: dateTo,
      user_id: userId,
      group_action: actionGroups?.join(","),
      sort: sortBy,
    },
    { skipNulls: true }
  );

  return useQuery({
    queryKey: activityLogQueryKeys.list(
      page,
      pageSize,
      search,
      dateFrom,
      dateTo,
      userId,
      actionGroups,
      sortBy
    ),
    queryFn: async (): Promise<IActivityLogResponse> => {
      try {
        const { data } = await apiClient.get<IActivityLogResponse>(
          `/api/activity-log?${params}`
        );
        return data;
      } catch {
        return {
          success: false,
          data: {
            activities: [],
            pagination: {
              current_page: 1,
              from: 0,
              to: 0,
              total: 0,
              last_page: 1,
              per_page: 10,
            },
          },
          message: "Failed to fetch activity logs",
          type: "list_activity_logs_error",
        };
      }
    },
  });
};

// Hook for activity log statistics
export const useGetActivityLogStats = (
  dateFrom?: string,
  dateTo?: string,
  userId?: string
) => {
  const params = qs.stringify(
    {
      date_from: dateFrom,
      date_to: dateTo,
      user_id: userId,
    },
    { skipNulls: true }
  );

  return useQuery({
    queryKey: activityLogQueryKeys.stats(dateFrom, dateTo, userId),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(
          `/api/activity-log/stats?${params}`
        );
        return data;
      } catch (error) {
        return {
          success: false,
          data: {
            total_activities: 0,
            actions_by_group: {},
            top_users: [],
            filters_applied: {},
          },
          message: "Failed to fetch activity log statistics",
          type: "get_activity_stats_error",
        };
      }
    },
  });
};

// Hook for available filter options
export const useGetActivityLogFilters = () => {
  return useQuery({
    queryKey: activityLogQueryKeys.filters(),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/api/activity-log/filters");
        return data;
      } catch (error) {
        return {
          success: false,
          data: {
            group_actions: [],
            date_filters: {},
            sort_options: {},
          },
          message: "Failed to fetch available filters",
          type: "get_available_filters_error",
        };
      }
    },
  });
};

// Hook for exporting activity logs
export const useExportActivityLogs = (
  dateFrom?: string,
  dateTo?: string,
  userId?: string,
  actionGroups?: string[],
  search?: string,
  format?: "csv" | "excel" | "json"
) => {
  const params = qs.stringify(
    {
      date_from: dateFrom,
      date_to: dateTo,
      user_id: userId,
      group_action: actionGroups?.join(","),
      search: search,
      format: format || "csv",
    },
    { skipNulls: true }
  );

  return useQuery({
    queryKey: activityLogQueryKeys.export({
      dateFrom,
      dateTo,
      userId,
      actionGroups,
      search,
      format,
    }),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(
          `/api/activity-log/export?${params}`
        );
        return data;
      } catch (error) {
        return {
          success: false,
          data: {
            export_data: [],
            total_records: 0,
            export_format: "csv",
            filters_applied: {},
          },
          message: "Failed to export activity logs",
          type: "export_activity_log_error",
        };
      }
    },
    enabled: false, // Only run when manually triggered
  });
};
