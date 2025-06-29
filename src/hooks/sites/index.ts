import { siteQueryKeys } from "@/constants/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CreateSiteData,
  Site,
  UpdateSiteData,
  UpdateSiteLanguageData,
  UpdateSitePlatformData,
} from "@/types/site.type";

import apiClient from "@/lib/api/client";

export const useGetSites = () => {
  return useQuery({
    queryKey: siteQueryKeys.all(),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/api/sites");
        return {
          isSuccess: true,
          data: response.data.data || [],
          message: "Sites fetched successfully",
        };
      } catch (error) {
        return {
          isSuccess: false,
          data: [],
          message: "Failed to fetch sites",
        };
      }
    },
  });
};

export const useGetSiteById = (siteId: string) => {
  return useQuery<{
    isSuccess: boolean;
    data: Site | null;
    message: string;
  }>({
    queryKey: siteQueryKeys.details(siteId),
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/sites/${siteId}`);
        return {
          isSuccess: true,
          data: response.data.data as Site,
          message: "Site fetched successfully",
        };
      } catch (error) {
        return {
          isSuccess: false,
          data: null,
          message: "Failed to fetch site",
        };
      }
    },
    enabled: !!siteId,
  });
};

export const useCreateSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSiteData) => {
      try {
        const response = await apiClient.post("/api/sites", data);
        return {
          isSuccess: true,
          data: response.data,
          message: "Site created successfully",
        };
      } catch (error) {
        return {
          isSuccess: false,
          data: null,
          message: "Failed to create site",
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: siteQueryKeys.all(),
      });
    },
  });
};

export const useUpdateSite = (siteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSiteData) => {
      try {
        const response = await apiClient.patch(`/api/sites/${siteId}`, data);
        return {
          isSuccess: true,
          data: response.data,
          message: "Site updated successfully",
        };
      } catch (error) {
        return {
          isSuccess: false,
          data: null,
          message: "Failed to update site",
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: siteQueryKeys.details(siteId),
      });
      queryClient.invalidateQueries({
        queryKey: siteQueryKeys.all(),
      });
    },
  });
};

export const useUpdateSiteLanguage = (siteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSiteLanguageData) => {
      try {
        const response = await apiClient.patch(
          `/api/sites/${siteId}/language`,
          data
        );
        return {
          isSuccess: true,
          data: response.data,
          message: "Site language updated successfully",
        };
      } catch (error) {
        return {
          isSuccess: false,
          data: null,
          message: "Failed to update site language",
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: siteQueryKeys.details(siteId),
      });
      queryClient.invalidateQueries({
        queryKey: siteQueryKeys.all(),
      });
    },
  });
};

export const useUpdateSitePlatform = (siteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSitePlatformData) => {
      try {
        const response = await apiClient.patch(
          `/api/sites/${siteId}/platform`,
          data
        );
        return {
          isSuccess: true,
          data: response.data,
          message: "Site platform updated successfully",
        };
      } catch (error) {
        return {
          isSuccess: false,
          data: null,
          message: "Failed to update site platform",
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: siteQueryKeys.details(siteId),
      });
      queryClient.invalidateQueries({
        queryKey: siteQueryKeys.all(),
      });
    },
  });
};

export const useDeleteSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: string) => {
      try {
        const response = await apiClient.delete(`/api/sites/${siteId}`);
        return {
          isSuccess: true,
          data: response.data,
          message: "Site deleted successfully",
        };
      } catch (error) {
        return {
          isSuccess: false,
          data: null,
          message: "Failed to delete site",
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: siteQueryKeys.all(),
      });
    },
  });
};

export const useActivateSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: string) => {
      const response = await apiClient.patch(`/api/sites/${siteId}/activate`);
      return {
        isSuccess: true,
        data: response.data,
        message: "Site activated successfully",
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: siteQueryKeys.all(),
      });
    },
  });
};

export const useDeactivateSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: string) => {
      const response = await apiClient.patch(`/api/sites/${siteId}/deactivate`);
      return {
        isSuccess: true,
        data: response.data,
        message: "Site deactivated successfully",
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: siteQueryKeys.all(),
      });
    },
  });
};
