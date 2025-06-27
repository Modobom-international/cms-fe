import { appInformationQueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import qs from "qs";

import {
  IAppInformationFilterMenuResponse,
  IGetAppInformationByUserIdResponse,
  IGetAppInformationResponse,
  IGetAppInformationChartResponse,
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
    event_value?: string | string[];
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
      finalFilters.event_value,
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

export const useGetAppInformationChart = () => {
  const searchParams = useSearchParams();

  // Get all filter parameters from URL search params (same as in index.tsx)
  const appFilter = searchParams.get("app_name") || "";
  const osFilter = searchParams.get("os_name") || "";
  const categoryFilter = searchParams.get("category") || "";
  const eventFilter = searchParams.get("event_name") || "";
  const platformFilter = searchParams.get("platform") || "";
  const countryFilter = searchParams.get("country") || "";
  const appVersionFilter = searchParams.get("app_version") || "";
  const osVersionFilter = searchParams.get("os_version") || "";
  const networkFilter = searchParams.get("network") || "";
  const eventValueFilter = searchParams.get("event_value") || "";
  const dateFromFilter = searchParams.get("date_from") || "";
  const dateToFilter = searchParams.get("date_to") || "";

  // Get default date range if dates are not provided
  const defaultDateRange = getDefaultDateRange();

  // Build filters object similar to the main data table
  const filters = {
    app_name: appFilter ? appFilter.split(",").filter(Boolean) : undefined,
    os_name: osFilter ? osFilter.split(",").filter(Boolean) : undefined,
    os_version: osVersionFilter
      ? osVersionFilter.split(",").filter(Boolean)
      : undefined,
    app_version: appVersionFilter
      ? appVersionFilter.split(",").filter(Boolean)
      : undefined,
    category: categoryFilter
      ? categoryFilter.split(",").filter(Boolean)
      : undefined,
    platform: platformFilter
      ? platformFilter.split(",").filter(Boolean)
      : undefined,
    country: countryFilter
      ? countryFilter.split(",").filter(Boolean)
      : undefined,
    event_name: eventFilter
      ? eventFilter.split(",").filter(Boolean)
      : undefined,
    network: networkFilter
      ? networkFilter.split(",").filter(Boolean)
      : undefined,
    event_value: eventValueFilter
      ? eventValueFilter.split(",").filter(Boolean)
      : undefined,
    from: dateFromFilter || defaultDateRange.from,
    to: dateToFilter || defaultDateRange.to,
  };

  const paramsObj = {
    ...filters,
  };

  const params = qs.stringify(paramsObj, {
    skipNulls: true,
    arrayFormat: "brackets",
  });

  return useQuery({
    queryKey: appInformationQueryKeys.chart(
      filters.app_name,
      filters.os_name,
      filters.os_version,
      filters.app_version,
      filters.category,
      filters.platform,
      filters.country,
      filters.event_name,
      filters.network,
      filters.event_value,
      filters.from,
      filters.to
    ),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<IGetAppInformationChartResponse>(
          `/api/app-information/data-chart?${params}`
        );
        return data;
      } catch (error) {
        throw new Error("Failed to fetch app information chart data");
      }
    },
  });
};