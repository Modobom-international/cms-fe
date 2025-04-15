import { notificationQueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import qs from "qs";

import { INotificationsResponse } from "@/types/notification";

import apiClient from "@/lib/api/client";

type NotificationsResult = INotificationsResponse | IErrorResponse;

export const useNotificationsData = (email: string) => {
  const params = qs.stringify({ email });

  return useQuery({
    queryKey: notificationQueryKeys.list(email),
    queryFn: async (): Promise<INotificationsResponse | IErrorResponse> => {
      try {
        const { data } = await apiClient.get<INotificationsResponse>(
          `/api/notifications?${params}`
        );
        return data;
      } catch {
        return {
          success: false,
          data: [],
          message: "Lấy dữ liệu thông báo thất bại",
          type: "list_notifications_fail",
        };
      }
    },
    select: (data: NotificationsResult) => data,
    enabled: !!email,
  });
};
