import { activityLogQueryKeys } from "@/constants/query-keys";
import { useMutation, useQuery } from "@tanstack/react-query";
import qs from "qs";

import {
  IActivityLogExportResponse,
  IActivityLogFiltersResponse,
  IActivityLogResponse,
  IActivityLogStatsResponse,
} from "@/types/activity-log.type";

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
  actions?: string[],
  sortField?: string,
  sortDirection?: string
) => {
  const params = qs.stringify(
    {
      page,
      pageSize,
      search,
      date_from: dateFrom,
      date_to: dateTo,
      user_id: userId,
      group_action: actionGroups?.length ? actionGroups : undefined,
      action: actions?.length ? actions : undefined,
      sort_field: sortField,
      sort_direction: sortDirection,
    },
    {
      skipNulls: true,
      arrayFormat: "comma", // For multiple values like action groups
    }
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
      actions,
      sortField,
      sortDirection
    ),
    queryFn: async (): Promise<IActivityLogResponse> => {
      try {
        const { data } = await apiClient.get<IActivityLogResponse>(
          `/api/activity-log?${params}`
        );
        return data;
      } catch (error) {
        console.error("Failed to fetch activity logs:", error);
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
              per_page: pageSize,
              has_more_pages: false,
              on_first_page: true,
            },
          },
          message: "Failed to fetch activity logs",
          type: "list_activity_logs_error",
        };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hook for activity log statistics
export const useGetActivityLogStats = (
  dateFrom?: string,
  dateTo?: string,
  userId?: string | string[]
) => {
  // Convert userId to string for the API call
  const userIdString = Array.isArray(userId) ? userId.join(",") : userId;

  const params = qs.stringify(
    {
      date_from: dateFrom,
      date_to: dateTo,
      user_id: userIdString,
    },
    {
      skipNulls: true,
      arrayFormat: "comma",
    }
  );

  return useQuery({
    queryKey: activityLogQueryKeys.stats(dateFrom, dateTo, userId),
    queryFn: async (): Promise<IActivityLogStatsResponse> => {
      try {
        const { data } = await apiClient.get<IActivityLogStatsResponse>(
          `/api/activity-log/stats?${params}`
        );
        return data;
      } catch (error) {
        console.error("Failed to fetch activity log statistics:", error);
        return {
          success: false,
          data: {
            total_activities: 0,
            actions_by_group: {},
            top_users: [],
            daily_activities: [],
            filters_applied: {},
          },
          message: "Failed to fetch activity log statistics",
          type: "get_activity_stats_error",
        };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes for stats
  });
};

// Hook for available filter options
export const useGetActivityLogFilters = () => {
  return useQuery({
    queryKey: activityLogQueryKeys.filters(),
    queryFn: async (): Promise<IActivityLogFiltersResponse> => {
      try {
        const { data } = await apiClient.get<IActivityLogFiltersResponse>(
          "/api/activity-log/filters"
        );
        return data;
      } catch (error) {
        console.error("Failed to fetch available filters:", error);
        return {
          success: false,
          data: {
            group_actions: [],
            date_filters: [],
            sort_options: [],
            filter_options: {
              page_sizes: [10, 20, 50, 100],
              max_page_size: 100,
              default_page_size: 20,
            },
          },
          message: "Failed to fetch available filters",
          type: "get_available_filters_error",
        };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15, // 15 minutes for filters (they change rarely)
  });
};

// Custom hook for triggering export
export const useActivityLogExport = () => {
  const exportMutation = useMutation({
    mutationFn: async (params: {
      dateFrom?: string;
      dateTo?: string;
      userId?: string;
      actionGroups?: string[];
      actions?: string[];
      search?: string;
      format?: "csv" | "json";
      limit?: number;
    }): Promise<IActivityLogExportResponse | Blob> => {
      const {
        dateFrom,
        dateTo,
        userId,
        actionGroups,
        actions,
        search,
        format = "csv",
        limit = 1000,
      } = params;

      try {
        const queryParams = qs.stringify(
          {
            date_from: dateFrom,
            date_to: dateTo,
            user_id: userId,
            group_action: actionGroups?.length ? actionGroups : undefined,
            action: actions?.length ? actions : undefined,
            search: search,
            format: format,
            limit: limit,
          },
          {
            skipNulls: true,
            arrayFormat: "comma",
          }
        );

        if (format === "csv") {
          // For CSV, return blob for download
          const response = await apiClient.get(
            `/api/activity-log/export?${queryParams}`,
            {
              responseType: "blob",
            }
          );
          return response.data as Blob;
        } else {
          // For JSON, return structured data
          const { data } = await apiClient.get<IActivityLogExportResponse>(
            `/api/activity-log/export?${queryParams}`
          );
          return data;
        }
      } catch (error) {
        console.error("Failed to export activity logs:", error);
        if (format === "csv") {
          return new Blob([], { type: "text/csv" });
        } else {
          return {
            success: false,
            data: {
              export_data: [],
              total_records: 0,
              export_format: format,
              export_limit: limit,
              generated_at: new Date().toISOString(),
              filters_applied: {},
            },
            message: "Failed to export activity logs",
            type: "export_activity_log_error",
          };
        }
      }
    },
  });

  const exportLogs = async (params: {
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
    actionGroups?: string[];
    actions?: string[];
    search?: string;
    format?: "csv" | "json";
    limit?: number;
  }) => {
    try {
      const result = await exportMutation.mutateAsync(params);

      if (params.format === "csv" && result instanceof Blob) {
        // Handle CSV download
        const url = window.URL.createObjectURL(result);
        const a = document.createElement("a");
        a.href = url;
        a.download = `activity_log_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return { success: true, type: "download" };
      } else {
        // Handle JSON response
        return result;
      }
    } catch (error) {
      console.error("Export failed:", error);
      return { success: false, error: "Export failed" };
    }
  };

  return {
    exportLogs,
    isExporting: exportMutation.isPending,
    error: exportMutation.error,
  };
};
