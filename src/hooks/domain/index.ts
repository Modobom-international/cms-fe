import { domainQueryKeys } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import qs from "qs";

import { IDomainResponse, IDomainActual } from "@/types/domain.type";

import apiClient from "@/lib/api/client";

export interface IErrorPaginationResponse {
  success: boolean;
  data: {
    current_page: number;
    data: any[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
  };
  message: string;
  type: string;
}

export const useGetDomainList = (
  page: number,
  pageSize: number,
  search: string = ""
) => {
  const params = qs.stringify({ page, pageSize, search });
  return useQuery({
    queryKey: domainQueryKeys.list(page, pageSize, search),
    queryFn: async (): Promise<IDomainResponse | IErrorPaginationResponse> => {
      try {
        const { data } = await apiClient.get<IDomainResponse>(
          `/api/domain?${params}`
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
          message: "Failed to fetch domain list",
          type: "list_domain_error",
        };
      }
    },
  });
};

interface IErrorDomainResponse {
  success: boolean;
  data: IDomainActual[];
  message: string;
  type: string;
}

export const useGetAllDomains = () => {
  return useQuery({
    queryKey: ['domains'],
    queryFn: async (): Promise<IDomainActual[] | IErrorDomainResponse> => {
      try {
        const { data } = await apiClient.get<IDomainResponse>(
          `/api/domain`
        );

        return data.data.data;
      } catch {
        return {
          success: false,
          data: [],
          message: "Lấy dữ liệu domain lỗi",
          type: "list_domain_fail",
        };
      }
    },
    select: (data) => {
      if ("success" in data && !data.success) {
        return [];
      }
      return data as IDomainActual[];
    },
  });
};