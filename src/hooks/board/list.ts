import { useCallback, useRef } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiResponse, List } from "@/types/board.type";

import apiClient from "@/lib/api/client";

const DEBOUNCE_TIME = 3000; // 3 seconds

export function useGetLists(boardId: number) {
  return useQuery({
    queryKey: ["lists", boardId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<List[]>>(
        `/api/boards/${boardId}/lists`
      );
      return data.data;
    },
  });
}

export function useCreateList(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { title: string; position: number }) => {
      const { data } = await apiClient.post<ApiResponse<List>>(`/api/lists`, {
        title: params.title,
        board_id: boardId,
        position: params.position,
      });
      return data.data;
    },
    onMutate: async (newList) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["lists", boardId] });

      // Snapshot the previous value
      const previousLists = queryClient.getQueryData<List[]>([
        "lists",
        boardId,
      ]);

      // Optimistically update to the new value
      if (previousLists) {
        const optimisticList: List = {
          id: -Date.now(), // Temporary ID using negative timestamp to avoid conflicts
          title: newList.title,
          position: String(newList.position),
          board_id: boardId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData(
          ["lists", boardId],
          [...previousLists, optimisticList]
        );
      }

      // Return a context object with the snapshotted value
      return { previousLists };
    },
    onError: (err, newList, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLists) {
        queryClient.setQueryData(["lists", boardId], context.previousLists);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({ queryKey: ["lists", boardId] });
    },
  });
}

export function useUpdateList(boardId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { data } = await apiClient.post<ApiResponse<List>>(
        `/api/lists/${id}`,
        {
          title,
        }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", boardId] });
    },
  });
}

export function useDeleteList(boardId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<null>>(
        `/api/lists/${id}`
      );
      return data.success;
    },
    onMutate: async (deletedListId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["lists", boardId] });

      // Snapshot the previous value
      const previousLists = queryClient.getQueryData<List[]>([
        "lists",
        boardId,
      ]);

      // Optimistically remove the list
      if (previousLists) {
        const newLists = previousLists.filter(
          (list) => list.id !== deletedListId
        );
        queryClient.setQueryData(["lists", boardId], newLists);
      }

      // Return a context object with the snapshotted value
      return { previousLists };
    },
    onError: (err, deletedListId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLists) {
        queryClient.setQueryData(["lists", boardId], context.previousLists);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({ queryKey: ["lists", boardId] });
    },
  });
}

export function useUpdateListsPositions(boardId: number) {
  const queryClient = useQueryClient();
  const timerRef = useRef<NodeJS.Timeout>();

  const { mutate: updatePositions } = useMutation({
    mutationFn: async (positions: { id: number; position: number }[]) => {
      const { data } = await apiClient.put<ApiResponse<List[]>>(
        `/api/lists/positions`,
        { positions }
      );
      return data.data;
    },
  });

  const debouncedUpdatePositions = useCallback(
    (lists: List[]) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const positions = lists.map((list) => ({
        id: list.id,
        position: parseInt(list.position),
      }));

      timerRef.current = setTimeout(() => {
        updatePositions(positions);
      }, DEBOUNCE_TIME);
    },
    [updatePositions]
  );

  return {
    mutate: async ({ id, position }: { id: number; position: number }) => {
      await queryClient.cancelQueries({ queryKey: ["lists", boardId] });

      const previousLists = queryClient.getQueryData<List[]>([
        "lists",
        boardId,
      ]);

      if (previousLists) {
        const newLists = [...previousLists];
        const listIndex = newLists.findIndex((list) => list.id === id);

        if (listIndex !== -1) {
          const [list] = newLists.splice(listIndex, 1);
          newLists.splice(position - 1, 0, {
            ...list,
            position: String(position),
          });
          newLists.forEach((list, idx) => {
            list.position = String(idx + 1);
          });

          queryClient.setQueryData(["lists", boardId], newLists);
          debouncedUpdatePositions(newLists);
        }
      }
    },
  };
}
