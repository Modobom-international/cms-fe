import { useQuery } from "@tanstack/react-query";

import apiClient from "@/lib/api/client";

export const useActiveUsers = (domain: string, path: string) => {
  return useQuery({
    queryKey: ["active-users", domain, path],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<{
          success: boolean;
          data: { online_count: number };
          message: string;
        }>("/api/users-tracking/get-current-users-active", {
          params: {
            domain,
            path,
          },
        });

        return {
          success: data.success,
          online_count: data.data.online_count,
        };
      } catch (error) {
        return {
          success: false,
          online_count: 0,
        };
      }
    },
    enabled: !!domain,
    refetchInterval: 10000,
  });
};
