import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { WorkspaceMember } from "@/types/workspaces.type";

import apiClient from "@/lib/api/client";

interface AddMemberDto {
  email: string;
  role: string;
}

interface UpdateMemberDto {
  role: string;
}

interface MemberResponse {
  success: boolean;
  message: string;
  members: WorkspaceMember[];
}

export const useGetWorkspaceMembers = (workspaceId: number) => {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      const response = await apiClient.get<MemberResponse>(
        `/api/workspaces/${workspaceId}/members`
      );
      return response.data.members;
    },
  });
};

export const useAddWorkspaceMember = (workspaceId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddMemberDto) => {
      const response = await apiClient.post(
        `/api/workspaces/${workspaceId}/members`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", workspaceId],
      });
      // Also invalidate workspaces list as member count might have changed
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useJoinPublicWorkspace = (workspaceId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(
        `/api/workspaces/${workspaceId}/members/join`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", workspaceId],
      });
      // Also invalidate workspaces list as the user has joined a new workspace
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useUpdateWorkspaceMember = (workspaceId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      data,
    }: {
      memberId: number;
      data: UpdateMemberDto;
    }) => {
      const response = await apiClient.put(
        `/api/workspaces/${workspaceId}/members/${memberId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", workspaceId],
      });
    },
  });
};

export const useRemoveWorkspaceMember = (workspaceId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user_id }: { user_id: number }) => {
      const response = await apiClient.delete(`/api/workspaces/${workspaceId}/members`, {
        data: {
          workspace_id: workspaceId,
          user_id: user_id,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};
