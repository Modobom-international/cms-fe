import { domainQueryKeys } from "@/constants/query-keys";
import { useMutation, useQuery } from "@tanstack/react-query";
import qs from "qs";

import {
  IDomainPathResponse,
  IDomainResponse,
  IDomainResponseTracking,
} from "@/types/domain.type";

import apiClient from "@/lib/api/client";

interface DomainFilters {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  is_locked?: boolean;
  renewable?: boolean;
  registrar?: string;
  has_sites?: boolean;
  time_expired?: string;
  renew_deadline?: string;
  registrar_created_at?: string;
}

export const useGetDomainList = ({
  page,
  pageSize,
  search = "",
  status,
  is_locked,
  renewable,
  registrar,
  has_sites,
  time_expired,
  renew_deadline,
  registrar_created_at,
}: DomainFilters) => {
  const params = qs.stringify(
    {
      page,
      pageSize,
      search,
      status,
      is_locked,
      renewable,
      registrar,
      has_sites,
      time_expired,
      renew_deadline,
      registrar_created_at,
    },
    {
      skipNulls: true, // This will skip null/undefined values
    }
  );

  return useQuery({
    queryKey: domainQueryKeys.list(page, pageSize, search, {
      status,
      is_locked,
      renewable,
      registrar,
      has_sites,
      time_expired,
      renew_deadline,
      registrar_created_at,
    }),
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

export const useGetDomainListWithoutPagination = (
  search: string = "",
  user_id?: string,
  options: { enabled?: boolean } = {}
) => {
  const params = qs.stringify({ search, user_id });
  return useQuery({
    queryKey: domainQueryKeys.domainWithoutPagination(user_id, search),
    queryFn: async (): Promise<IDomainResponseTracking | IBackendErrorRes> => {
      try {
        const { data } = await apiClient.get<IDomainResponseTracking>(
          `/api/domains/get-list-domain-for-tracking?${params}`
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
    enabled: options.enabled,
  });
};

export const useGetAvailableDomain = (
  page: number,
  pageSize: number,
  search: string
) => {
  const params = qs.stringify({ page, pageSize, search });
  return useQuery({
    queryKey: domainQueryKeys.available(page, pageSize, search),
    queryFn: async (): Promise<IDomainResponse | IBackendErrorRes> => {
      try {
        const { data } = await apiClient.get<IDomainResponse>(
          `/api/domains/available?${params}`
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
  pageSize: number,
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: domainQueryKeys.domainPaths(domain, page, pageSize),
    queryFn: async (): Promise<IDomainPathResponse | IBackendErrorRes> => {
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
    enabled: options.enabled && !!domain,
  });
};
