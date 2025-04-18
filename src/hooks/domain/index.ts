import { useState } from "react";

import { domainQueryKeys } from "@/constants/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import qs from "qs";

import { IDomainActual, IDomainResponse } from "@/types/domain.type";

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
          `/api/domain?${params}`
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

export const useGetAllDomains = () => {
  return useQuery({
    queryKey: ["domains"],
    queryFn: async (): Promise<IDomainActual[] | IErrorResponse> => {
      try {
        const { data } = await apiClient.get<IDomainResponse>(`/api/domain`);

        return data.data.data;
      } catch {
        return {
          success: false,
          message: "Lấy danh sách domain không thành công",
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

export interface RefreshDomainsResponse extends IDomainResponse {
  progress: number;
}

export const useRefreshDomains = () => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (): Promise<RefreshDomainsResponse> => {
      setProgress(0);
      setError(null);

      try {
        const { data } = await apiClient.post<RefreshDomainsResponse>(
          "/api/refresh-domain"
        );
        setProgress(data.progress || 0);

        // Poll for progress updates if not complete
        if (data.progress < 100) {
          const pollInterval = setInterval(async () => {
            try {
              const { data: pollData } =
                await apiClient.post<RefreshDomainsResponse>(
                  "/api/refresh-domain"
                );
              setProgress(pollData.progress || 0);

              if (pollData.progress >= 100) {
                clearInterval(pollInterval);
              }
            } catch (err) {
              clearInterval(pollInterval);
              setError("Failed to refresh. Please try again.");
              throw err;
            }
          }, 1000);
        }

        return data;
      } catch (err) {
        setError("Failed to refresh. Please try again.");
        throw err;
      }
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch the domain list
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.all });
    },
  });

  return {
    refreshDomains: mutation.mutate,
    refreshDomainsAsync: mutation.mutateAsync,
    isRefreshing: mutation.isPending,
    progress,
    error,
    resetError: () => setError(null),
  };
};
