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

      // Simulate a loading delay of 10 seconds
      return new Promise((resolve, reject) => {
        const totalDuration = 10000; // 10 seconds
        const interval = 100; // Update progress every 100ms
        const totalSteps = totalDuration / interval; // Total number of updates
        let currentStep = 0;

        const progressInterval = setInterval(() => {
          currentStep++;
          const currentProgress = Math.min(
            Math.floor((currentStep / totalSteps) * 100),
            100
          );
          setProgress(currentProgress);

          if (currentProgress >= 100) {
            clearInterval(progressInterval);
            //@ts-expect-error type error
            resolve({ success: true, data: [], progress: 100 }); // Simulate successful response
          }
        }, interval);

        // Simulate an error condition (optional)
        // setTimeout(() => {
        //   clearInterval(progressInterval);
        //   setError("Failed to refresh. Please try again.");
        //   reject(new Error("Simulated error"));
        // }, 5000); // Uncomment to simulate an error after 5 seconds
      });
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
