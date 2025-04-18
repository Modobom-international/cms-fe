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
  list: (siteId: string) => [...pageQueryKeys.lists(), { siteId }] as const,
  details: (pageId: string) =>
    [...pageQueryKeys.all, "detail", pageId] as const,
};

// Zod Schemas
export const CreatePageSchema = z.object({
  site_id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string(),
});

export const UpdatePageSchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
  content: z.string(),
});

export type CreatePageData = z.infer<typeof CreatePageSchema>;
export type UpdatePageData = z.infer<typeof UpdatePageSchema>;

// Hooks
export const useGetPages = (siteId: string) => {
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

export const useGetPageById = (pageId: string) => {
  return useQuery({
    queryKey: pageQueryKeys.details(pageId),
    queryFn: async () => {
      try {
        console.log(`Starting fetch for page ID: ${pageId}`);
        const response = await apiClient.get(`/api/page/${pageId}`);
        console.log(`Raw API response for ${pageId}:`, response);

        if (!response.data) {
          console.error(`No response data for ${pageId}`);
          throw new Error("No response data received");
        }

        if (!response.data.data) {
          console.error(
            `Invalid response structure for ${pageId}:`,
            response.data
          );
          throw new Error("Invalid response structure from API");
        }

        return {
          isSuccess: true,
          data: {
            data: response.data.data,
          },
          message: "Page fetched successfully",
        };
      } catch (error) {
        return {
          isSuccess: false,
          data: null,
          message: "Failed to fetch page",
        };
      }
    },
    enabled: !!pageId,
  });
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePageData) => {
      const response = await apiClient.post(`/api/create-page`, data);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create page");
      }
      return response.data;
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
    mutationFn: async (data: UpdatePageData & { pageId: string }) => {
      const response = await apiClient.post(
        `/api/update-page/${data.pageId}`,
        data
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update page");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pageQueryKeys.details(variables.pageId),
      });
    },
  });
};

export const useExportPage = (pageId: string) => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post(
        `/api/export-pages/${pageId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to export page");
      }
      return response.data;
    },
  });
};

export const useDeployPage = () => {
  return useMutation({
    mutationFn: async (data: { site_id: number; page_slug: string }) => {
      const response = await apiClient.post(
        "/api/cloudflare/deploy-exports",
        data
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to deploy page");
      }
      return response.data;
    },
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pageId: number) => {
      const response = await apiClient.delete(`/api/pages/${pageId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete page");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pageQueryKeys.lists(),
      });
    },
  });
};
