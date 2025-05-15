import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreateWorkspaceDto,
  CreateWorkspaceResponse,
  DeleteWorkspaceResponse,
  SingleWorkspaceResponse,
  UpdateWorkspaceDto,
  UpdateWorkspaceResponse,
  Workspace,
  WorkspaceResponse,
} from "@/types/workspaces.type";

import apiClient from "@/lib/api/client";

export const useGetWorkspaces = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response =
        await apiClient.get<WorkspaceResponse>("/api/workspaces");
      return response.data.workspace;
    },
  });

  return { workspaces: data, isLoading, error };
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkspaceDto) => {
      const response = await apiClient.post<CreateWorkspaceResponse>(
        "/api/workspaces",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateWorkspaceDto;
    }) => {
      const response = await apiClient.post<UpdateWorkspaceResponse>(
        `/api/workspaces/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<DeleteWorkspaceResponse>(
        `/api/workspaces/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};
