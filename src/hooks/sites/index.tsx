import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import apiClient from "@/lib/api/client";

// Types
export interface Site {
  id: number;
  name: string;
  domain: string;
  created_at: string;
  updated_at: string;
}

// Query Keys
export const siteQueryKeys = {
  all: ["sites"] as const,
  lists: () => [...siteQueryKeys.all, "list"] as const,
  list: (filters: string) => [...siteQueryKeys.lists(), { filters }] as const,
  details: (siteId: number) =>
    [...siteQueryKeys.all, "detail", siteId] as const,
};

// Zod Schemas
export const CreateSiteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.string().min(1, "Domain is required"),
});

export const UpdateSiteSchema = CreateSiteSchema;

export type CreateSiteData = z.infer<typeof CreateSiteSchema>;
export type UpdateSiteData = z.infer<typeof UpdateSiteSchema>;

// Hooks
export const useGetSites = () => {
  return useQuery({
    queryKey: siteQueryKeys.lists(),
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

export const useGetSiteById = (siteId: number) => {
  return useQuery({
    queryKey: siteQueryKeys.details(siteId),
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/sites/${siteId}`);
        return {
          isSuccess: true,
          data: response.data.data,
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
        queryKey: siteQueryKeys.lists(),
      });
    },
  });
};

export const useUpdateSite = (siteId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSiteData) => {
      try {
        const response = await apiClient.put(`/api/sites/${siteId}`, data);
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
        queryKey: siteQueryKeys.lists(),
      });
    },
  });
};

export const useDeleteSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: number) => {
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
        queryKey: siteQueryKeys.lists(),
      });
    },
  });
};
