import { domainQueryKeys } from "@/constants/query-keys";
import { useMutation, useQuery } from "@tanstack/react-query";
import qs from "qs";

import {
  IDomainActual,
  IDomainPathResponse,
  IDomainResponse,
} from "@/types/domain.type";

import apiClient from "@/lib/api/client";

export const useGetDomainList = (
  page: number,
  pageSize: number,
  search: string = ""
) => {
  const params = qs.stringify({ page, pageSize, search });
  return useQuery({
    queryKey: domainQueryKeys.list(page, pageSize, search),
    queryFn: async (): Promise<IDomainResponse | IErrorResponse> => {
      try {
        const { data } = await apiClient.get<IDomainResponse>(
          `/api/domains?${params}`
        );
        return data;
      } catch {
        return {
          success: false,
          message: "Lấy danh sách domain không thành công",
          type: "list_domain_fail",
        };
      }
    },
  });
};

export const useRefreshDomainList = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.get<{
        success: boolean;
        message: string;
      }>(`/api/domains/refresh`);
      return data;
    },
    mutationKey: domainQueryKeys.refresh(),
  });
};

export const useGetDomainPaths = (
  domain: string,
  page: number,
  pageSize: number
) => {
  return useQuery({
    queryKey: domainQueryKeys.domainPaths(domain, page, pageSize),
    queryFn: async () => {
      const params = qs.stringify({ domain, page, pageSize });
      try {
        const { data } = await apiClient.get<IDomainPathResponse>(
          `/api/domains/list-url-path?${params}`
        );
        return data;
      } catch {
        return {
          success: false,
          message: "Lấy danh sách domain không thành công",
          type: "list_domain_fail",
        };
      }
    },
    enabled: !!domain,
  });
};
