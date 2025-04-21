import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export const useActiveUsers = (domain: string, path: string) => {
  return useQuery({
    queryKey: ["active-users", domain, path],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<{
          success: boolean;
          data: number;
          message: string;
        }>("/api/users-tracking/get-current-users-active", {
          params: {
            domain,
            path,
          },
        });

        return {
          success: data.success,
          count: data.data,
        };
      } catch (error) {
        return {
          success: false,
          count: 0,
        };
      }
    },
    enabled: !!domain,
    refetchInterval: 10000,
  });
};