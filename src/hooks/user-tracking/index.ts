import { userTrackingQueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import qs from "qs";

import { IUserTrackingResponse } from "@/types/user-tracking.type";

import apiClient from "@/lib/api/client";

export const useGetUserTracking = (
  page: number,
  pageSize: number,
  date: string,
  domain: string
) => {
  const params = qs.stringify({ page, pageSize, date, domain });
  return useQuery({
    queryKey: userTrackingQueryKeys.list(page, pageSize, date, domain),
    queryFn: async (): Promise<
      IUserTrackingResponse | IErrorPaginationResponse
    > => {
      try {
        const { data } = await apiClient.get<IUserTrackingResponse>(
          `/api/users-tracking?${params}`
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
          message: "Lấy danh sách tracking thành công",
          type: "list_tracking_success",
        };
      }
    },
    enabled: !!date || !!domain,
  });
};

