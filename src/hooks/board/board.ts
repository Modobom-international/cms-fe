import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  BoardMembersResponse,
  BoardsResponse,
  CreateBoardDto,
  CreateBoardResponse,
  DeleteBoardResponse,
  UpdateBoardDto,
  UpdateBoardResponse,
} from "@/types/board.type";

import apiClient from "@/lib/api/client";

export const useGetBoards = (workspaceId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["boards", workspaceId],
    queryFn: async () => {
      const response = await apiClient.get<BoardsResponse>(
        `/api/workspaces/${workspaceId}/boards`
      );
      return {
        boards: response.data.boards,
        workspace: response.data.workspace,
      };
    },
  });

  return {
    boards: data?.boards,
    workspace: data?.workspace,
    isLoading,
    error,
  };
};

export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBoardDto) => {
      const response = await apiClient.post<CreateBoardResponse>(
        `/api/boards`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["boards", variables.workspace_id.toString()],
      });
    },
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      data,
    }: {
      boardId: number;
      data: UpdateBoardDto;
    }) => {
      const response = await apiClient.put<UpdateBoardResponse>(
        `/api/boards/${boardId}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["boards"],
      });
    },
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boardId: number) => {
      const response = await apiClient.delete<DeleteBoardResponse>(
        `/api/boards/${boardId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["boards"],
      });
    },
  });
};

export const useGetBoardMembers = (boardId: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["board-members", boardId],
    queryFn: async () => {
      const response = await apiClient.get<BoardMembersResponse>(
        `/api/boards/${boardId}/members`
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

export const useAddBoardMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      userId,
    }: {
      boardId: number;
      userId: number;
    }) => {
      const response = await apiClient.post<{ message: string }>(
        `/api/boards/${boardId}/members`,
        { user_id: userId }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["board-members", variables.boardId],
      });
    },
  });
};

export const useRemoveBoardMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      memberId,
    }: {
      boardId: number;
      memberId: number;
    }) => {
      const response = await apiClient.delete<{ message: string }>(
        `/api/boards/${boardId}/members`,
        { data: { member_id: memberId } }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["board-members", variables.boardId],
      });
    },
  });
};
