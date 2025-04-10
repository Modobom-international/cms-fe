import { activityLogQueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import qs from "qs";

import {
  IActivityLogResponse,
  IErrorPaginationResponse,
} from "@/types/activity-log.type";

import apiClient from "@/lib/api/client";

export const useGetActivityLogs = (
  page: number,
  pageSize: number,
  search: string = ""
) => {
  const params = qs.stringify({ page, pageSize, search });
  return useQuery({
    queryKey: activityLogQueryKeys.list(page, pageSize, search),
    queryFn: async (): Promise<
      IActivityLogResponse | IErrorPaginationResponse
    > => {
      try {
        const { data } = await apiClient.get<IActivityLogResponse>(
          `/api/activity-log?${params}`
        );
        return data;
      } catch {
        return {
          success: false,
          data: {
            current_page: 1,
            data: [],
            first_page_url: "?page=1",
            from: null,
            last_page: 1,
            last_page_url: "?page=1",
            links: [
              {
                url: null,
                label: "pagination.previous",
                active: false,
              },
              {
                url: "?page=1",
                label: "1",
                active: true,
              },
              {
                url: null,
                label: "pagination.next",
                active: false,
              },
            ],
            next_page_url: null,
            path: "",
            per_page: 15,
            prev_page_url: null,
            to: null,
            total: 0,
          },
          message: "Failed to fetch activity logs",
          type: "list_activity_logs_error",
        };
      }
    },
  });
};
