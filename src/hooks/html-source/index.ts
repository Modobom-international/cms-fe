import { htmlSourceQueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import qs from "qs";

import { IHtmlSourceResponse } from "@/types/html-source.type";

import apiClient from "@/lib/api/client";
import { extractApiError } from "@/lib/api/error-handler";

export const useGetHtmlSourceList = (
  page: number,
  pageSize: number,
  search: string = ""
) => {
  const params = qs.stringify({ page, pageSize, search });
  return useQuery({
    queryKey: htmlSourceQueryKeys.list(page, pageSize, search),
    queryFn: async (): Promise<IHtmlSourceResponse | IBackendErrorRes> => {
      try {
        const { data } = await apiClient.get<IHtmlSourceResponse>(
          `/api/html-source?${params}`
        );
        return data;
      } catch (error) {
        const errorRes = extractApiError(error);
        return {
          success: false,
          message: errorRes.message,
          type: errorRes.type,
          error: errorRes.error,
        };
      }
    },
  });
};

export const useGetHtmlSourceById = (id: string) => {
  return useQuery({
    queryKey: htmlSourceQueryKeys.details(id),
    queryFn: async (): Promise<IHtmlSourceResponse | IBackendErrorRes> => {
      try {
        const { data } = await apiClient.get<IHtmlSourceResponse>(
          `/api/html-sources/${id}`
        );
        return data;
      } catch (error) {
        const errorRes = extractApiError(error);
        return {
          success: false,
          message: errorRes.message,
          type: errorRes.type,
          error: errorRes.error,
        };
      }
    },
    enabled: !!id,
  });
};
