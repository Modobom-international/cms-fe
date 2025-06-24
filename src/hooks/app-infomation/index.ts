import { appInformationQueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import qs from "qs";

import {
  IAppInformationFilterMenuResponse,
  IGetAppInformationResponse,
} from "@/types/app-information.type";

import apiClient from "@/lib/api/client";

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
  const paramsObj = {
    page,
    pageSize,
    ...filters,
  };

  const params = qs.stringify(paramsObj, {
    skipNulls: true,
    arrayFormat: "brackets",
  });

  return useQuery({
    queryKey: appInformationQueryKeys.list(
      page,
      pageSize,
      filters?.app_name,
      filters?.os_name,
      filters?.os_version,
      filters?.app_version,
      filters?.category,
      filters?.platform,
      filters?.country,
      filters?.event_name,
      filters?.network,
      filters?.from,
      filters?.to
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
