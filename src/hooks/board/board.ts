import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Board,
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
      const response = await apiClient.post<UpdateBoardResponse>(
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
