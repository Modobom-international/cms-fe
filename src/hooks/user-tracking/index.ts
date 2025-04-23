import { userTrackingQueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import qs from "qs";

import {
  IErrorPaginationResponse,
  IUserTrackingResponse,
} from "@/types/user-tracking.type";

import apiClient from "@/lib/api/client";

export const useGetUserTracking = (
  page: number,
  pageSize: number,
  date: string,
  domain: string,
  path: string
) => {
  const params = qs.stringify({ date, domain, page, pageSize, path });
  return useQuery({
    queryKey: userTrackingQueryKeys.list(page, pageSize, date, domain, path),
    queryFn: async (): Promise<
      IUserTrackingResponse | IErrorPaginationResponse
    > => {
      try {
        const response = await apiClient.get<IUserTrackingResponse>(
          `/api/users-tracking?${params}`
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching user tracking data:", error);
        return {
          success: false,
          message: "Failed to fetch user tracking data",
          type: "list_tracking_error",
          data: {
            current_page: 1,
            data: [],
            first_page_url: "?page=1",
            from: null,
            last_page: 1,
            last_page_url: "?page=1",
            links: [],
            next_page_url: null,
            path: "",
            per_page: pageSize,
            prev_page_url: null,
            to: null,
            total: 0,
          },
        };
      }
    },
    enabled: !!date || !!domain || !!path,
  });
};