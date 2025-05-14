import { pageQueryKeys } from "@/constants/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ICreatePageData,
  ICreatePageResponse,
  IDeletePageResponse,
  IPage,
  IPageDetailResponse,
  IPageListResponse,
  IPageResponse,
  ITrackingScriptResponse,
  IUpdatePageData,
  IUpdatePageResponse,
  IUpdateTrackingScriptData,
} from "@/types/page.type";

import apiClient from "@/lib/api/client";

// Hooks
export const useGetPages = (siteId: string) => {
  return useQuery({
    queryKey: pageQueryKeys.listBySiteId(siteId),
    queryFn: async () => {
      try {
        const response = await apiClient.get<IPageListResponse>(
          `/api/sites/${siteId}/pages`
        );
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
        const response = await apiClient.get<IPageDetailResponse>(
          `/api/pages/${pageId}`
        );

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
            site: response.data.site,
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

  return useMutation<ICreatePageResponse, Error, ICreatePageData>({
    mutationFn: async (data) => {
      const response = await apiClient.post(`/api/pages`, data);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create page");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pageQueryKeys.listBySiteId(variables.site_id),
      });
    },
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IUpdatePageResponse,
    Error,
    IUpdatePageData & { pageId: string }
  >({
    mutationFn: async (data) => {
      const response = await apiClient.post(`/api/pages/${data.pageId}`, data);
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
  return useMutation<IUpdatePageResponse, Error, FormData>({
    mutationFn: async (formData) => {
      const response = await apiClient.post(
        `/api/pages/${pageId}/exports`,
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
  return useMutation<
    IUpdatePageResponse,
    Error,
    { site_id: number; page_slug: string }
  >({
    mutationFn: async (data) => {
      const response = await apiClient.post(
        "/api/cloudflare/deployments/exports",
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

  return useMutation<
    IDeletePageResponse,
    Error,
    { pageId: number; siteId: string }
  >({
    mutationFn: async ({ pageId, siteId }) => {
      const response = await apiClient.delete(`/api/pages/${pageId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete page");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pageQueryKeys.listBySiteId(variables.siteId),
      });
    },
  });
};

export const useGetTrackingScript = (pageId: string) => {
  return useQuery({
    queryKey: [...pageQueryKeys.details(pageId), "tracking-script"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ITrackingScriptResponse>(
          `/api/pages/${pageId}/tracking-scripts`
        );
        return {
          isSuccess: true,
          data: response.data.data,
          message: "Tracking script fetched successfully",
        };
      } catch (error) {
        return {
          isSuccess: false,
          data: null,
          message: "Failed to fetch tracking script",
        };
      }
    },
    enabled: !!pageId,
  });
};

export const useUpdateTrackingScript = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IUpdatePageResponse,
    Error,
    { pageId: string; data: IUpdateTrackingScriptData }
  >({
    mutationFn: async ({ pageId, data }) => {
      const response = await apiClient.post(
        `/api/pages/${pageId}/tracking-scripts`,
        data
      );
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update tracking script"
        );
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

export const useDeleteTrackingScript = () => {
  const queryClient = useQueryClient();

  return useMutation<IDeletePageResponse, Error, string>({
    mutationFn: async (pageId) => {
      const response = await apiClient.delete(
        `/api/pages/${pageId}/tracking-scripts`
      );
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete tracking script"
        );
      }
      return response.data;
    },
    onSuccess: (_, pageId) => {
      queryClient.invalidateQueries({
        queryKey: pageQueryKeys.details(pageId),
      });
    },
  });
};

export const useLoadFromAPI = (pageId: string) => {
  return useQuery<{ language: string; content: any }>({
    queryKey: pageQueryKeys.details(pageId),
    queryFn: async () => {
      try {
        const response = await apiClient.get<IPageResponse>(
          `/api/pages/${pageId}`
        );

        if (response.status !== 200) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = response.data.data;
        const content = JSON.parse(data.content);
        console.log(`Loaded content for page ID: ${pageId}`, content);
        return {
          language: response.data.site.language,
          content: content,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load page";
        console.warn(
          `Could not load content for page ID: ${pageId}`,
          errorMessage
        );
        throw new Error(errorMessage);
      }
    },
    enabled: !!pageId,
  });
};
