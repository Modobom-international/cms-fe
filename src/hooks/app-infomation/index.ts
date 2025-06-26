import { appInformationQueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import qs from "qs";

import {
  IAppInformationFilterMenuResponse,
  IGetAppInformationByUserIdResponse,
  IGetAppInformationResponse,
} from "@/types/app-information.type";

import apiClient from "@/lib/api/client";
import { getDefaultDateRange } from "@/lib/utils";

export const useGetAppInformation = (
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    app_name?: string | string[];
    os_name?: string | string[];
    os_version?: string | string[];
    app_version?: string | string[];
    category?: string | string[];
    platform?: string | string[];
    country?: string | string[];
    event_name?: string | string[];
    network?: string | string[];
    from?: string;
    to?: string;
  }
) => {
  // Get default date range if dates are not provided
  const defaultDateRange = getDefaultDateRange();

  // Ensure from and to dates are always present and properly formatted
  const finalFilters = {
    ...filters,
    from: filters?.from || defaultDateRange.from,
    to: filters?.to || defaultDateRange.to,
  };

  const paramsObj = {
    page,
    pageSize,
    ...finalFilters,
  };

  const params = qs.stringify(paramsObj, {
    skipNulls: true,
    arrayFormat: "brackets",
  });

  return useQuery({
    queryKey: appInformationQueryKeys.list(
      page,
      pageSize,
      finalFilters.app_name,
      finalFilters.os_name,
      finalFilters.os_version,
      finalFilters.app_version,
      finalFilters.category,
      finalFilters.platform,
      finalFilters.country,
      finalFilters.event_name,
      finalFilters.network,
      finalFilters.from,
      finalFilters.to
    ),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<IGetAppInformationResponse>(
          `/api/app-information?${params}`
        );
        return data;
      } catch (error) {
        throw new Error("Failed to fetch app information");
      }
    },
  });
};

export const useGetAppInformationFilterMenu = () => {
  return useQuery({
    queryKey: appInformationQueryKeys.filterMenu(),
    queryFn: async (): Promise<IAppInformationFilterMenuResponse> => {
      try {
        const { data } = await apiClient.get("/api/app-information/menu");
        return data;
      } catch (error) {
        throw new Error("Failed to fetch app information filter menu");
      }
    },
  });
};

export const useGetAppInformationByUserId = (userId: string) => {
  return useQuery({
    queryKey: appInformationQueryKeys.byUserId(userId),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<IGetAppInformationByUserIdResponse>(`/api/app-information/detail-userid?user_id=${userId}`);
        return data;
      } catch (error) {
        throw new Error("Failed to fetch app information by user id");
      }
    },
    enabled: !!userId,
  });
};