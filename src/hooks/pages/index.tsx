import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import apiClient from "@/lib/api/client";

// Types
export interface Page {
  id: number;
  name: string;
  slug: string;
  content: string;
  site_id: number;
  updated_at: string;
}

// Query Keys
export const pageQueryKeys = {
  all: ["pages"] as const,
  lists: () => [...pageQueryKeys.all, "list"] as const,
  list: (siteId: number) => [...pageQueryKeys.lists(), { siteId }] as const,
  details: (pageSlug: string) =>
    [...pageQueryKeys.all, "detail", pageSlug] as const,
};

// Zod Schemas
export const CreatePageSchema = z.object({
  site_id: z.number(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string(),
});

export const UpdatePageSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  content: z.string(),
});

export type CreatePageData = z.infer<typeof CreatePageSchema>;
export type UpdatePageData = z.infer<typeof UpdatePageSchema>;

// Hooks
export const useGetPages = (siteId: number) => {
  return useQuery({
    queryKey: pageQueryKeys.list(siteId),
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/sites/${siteId}/pages`);
        return {
          isSuccess: true,
          data: response.data.data || [],
          message: "Pages fetched successfully",
        };
      } catch (error) {
        return {
          isSuccess: false,
          data: [],
          message: "Failed to fetch pages",
        };
      }
    },
    enabled: !!siteId,
  });
};

export const useGetPageBySlug = (pageSlug: string) => {
  return useQuery({
    queryKey: pageQueryKeys.details(pageSlug),
    queryFn: async () => {
      try {
        console.log(`Starting fetch for page slug: ${pageSlug}`);
        const response = await apiClient.get(`/api/page/${pageSlug}`);
        console.log(`Raw API response for ${pageSlug}:`, response);

        if (!response.data) {
          console.error(`No response data for ${pageSlug}`);
          throw new Error("No response data received");
        }

        if (!response.data.data) {
          console.error(
            `Invalid response structure for ${pageSlug}:`,
            response.data
          );
          throw new Error("Invalid response structure from API");
        }

        const result = {
          isSuccess: true,
          data: {
            data: response.data.data,
          },
          message: "Page fetched successfully",
        };

        console.log(`Processed response for ${pageSlug}:`, result);
        return result;
      } catch (error) {
        console.error(`Error in useGetPageBySlug for ${pageSlug}:`, error);
        return {
          isSuccess: false,
          data: null,
          message:
            error instanceof Error ? error.message : "Failed to fetch page",
        };
      }
    },
    enabled: !!pageSlug,
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePageData) => {
      try {
        const response = await apiClient.post(`/api/create-page`, data);
        return {
          isSuccess: true,
          data: response.data,
          message: "Page created successfully",
        };
      } catch (error) {
        return {
          isSuccess: false,
          data: null,
          message: "Failed to create page",
        };
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pageQueryKeys.list(variables.site_id),
      });
    },
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePageData) => {
      try {
        const response = await apiClient.post("/api/update-page", data);
        return {
          isSuccess: true,
          data: response.data,
          message: "Page updated successfully",
        };
      } catch (error) {
        return {
          isSuccess: false,
          data: null,
          message: "Failed to update page",
        };
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pageQueryKeys.details(variables.slug),
      });
    },
  });
};

export const useExportPage = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await apiClient.post("/api/export-pages", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return {
          isSuccess: true,
          data: response.data,
          message: "Page exported successfully",
        };
      } catch (error) {
        return {
          isSuccess: false,
          data: null,
          message: "Failed to export page",
        };
      }
    },
  });
};

export const useDeployPage = () => {
  return useMutation({
    mutationFn: async (data: { site_id: number }) => {
      try {
        const response = await apiClient.post(
          "/api/cloudflare/deploy-exports",
          data
        );
        return {
          isSuccess: true,
          data: response.data,
          message: "Page deployed successfully",
        };
      } catch (error) {
        return {
          isSuccess: false,
          data: null,
          message: "Failed to deploy page",
        };
      }
    },
  });
};
