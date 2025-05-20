import { useQuery } from "@tanstack/react-query";

import { WorkspaceMember } from "@/types/workspaces.type";

import apiClient from "@/lib/api/client";

interface WorkspaceMembersResponse {
  success: boolean;
  members: WorkspaceMember[];
  message: string;
  type: string;
}

export const useGetWorkspaceMembers = (workspaceId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      const response = await apiClient.get<WorkspaceMembersResponse>(
        `/api/workspaces/${workspaceId}/members`
      );
      return response.data;
    },
  });

  return {
    members: data?.members,
    isLoading,
    error,
  };
};
