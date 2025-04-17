import { htmlSourceQueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import qs from "qs";

import { IHtmlSourceResponse } from "@/types/html-source.type";

import apiClient from "@/lib/api/client";

export const useGetHtmlSourceList = (
  page: number,
  pageSize: number,
  search: string = ""
) => {
  const params = qs.stringify({ page, pageSize, search });
  return useQuery({
    queryKey: htmlSourceQueryKeys.list(page, pageSize, search),
    queryFn: async (): Promise<IHtmlSourceResponse | IErrorResponse> => {
      try {
        const { data } = await apiClient.get<IHtmlSourceResponse>(
          `/api/html-source?${params}`
        );
        return data;
      } catch {
        return {
          success: false,
          message: "Failed to fetch HTML source data",
          type: "list_html_source_fail",
        };
      }
    },
  });
};

export const useGetHtmlSourceById = (id: string) => {
  return useQuery({
    queryKey: htmlSourceQueryKeys.details(id),
    queryFn: async (): Promise<IHtmlSourceResponse | IErrorResponse> => {
      try {
        const { data } = await apiClient.get<IHtmlSourceResponse>(
          `/api/html-sources/${id}`
        );
        return data;
      } catch {
        return {
          success: false,
          message: "Failed to fetch HTML source details",
          type: "get_html_source_fail",
        };
      }
    },
    enabled: !!id,
  });
};
