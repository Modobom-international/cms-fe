import { useCallback, useRef } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiResponse, List } from "@/types/board";

import apiClient from "@/lib/api/client";

const BOARD_ID = 1; // Temporarily fixed board ID
const DEBOUNCE_TIME = 3000; // 3 seconds

export function useGetLists() {
  return useQuery({
    queryKey: ["lists", BOARD_ID],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<List[]>>(
        `/api/boards/${BOARD_ID}/lists`
      );
      return data.data;
    },
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { title: string; position: number }) => {
      const { data } = await apiClient.post<ApiResponse<List>>(`/api/lists`, {
        title: params.title,
        board_id: BOARD_ID,
        position: params.position,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", BOARD_ID] });
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { data } = await apiClient.put<ApiResponse<List>>(
        `/api/lists/${id}`,
        {
          title,
        }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", BOARD_ID] });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<null>>(
        `/api/lists/${id}`
      );
      return data.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", BOARD_ID] });
    },
  });
}

export function useUpdateListsPositions() {
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
      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Create positions array
      const positions = lists.map((list) => ({
        id: list.id,
        position: parseInt(list.position),
      }));

      // Set new timer
      timerRef.current = setTimeout(() => {
        updatePositions(positions);
      }, DEBOUNCE_TIME);
    },
    [updatePositions]
  );

  return {
    mutate: async ({ id, position }: { id: number; position: number }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["lists", BOARD_ID] });

      // Get current lists
      const previousLists = queryClient.getQueryData<List[]>([
        "lists",
        BOARD_ID,
      ]);

      if (previousLists) {
        const newLists = [...previousLists];
        const listIndex = newLists.findIndex((list) => list.id === id);

        if (listIndex !== -1) {
          // Remove list from current position
          const [list] = newLists.splice(listIndex, 1);
          // Insert at new position
          newLists.splice(position - 1, 0, {
            ...list,
            position: String(position),
          });
          // Update positions for all lists
          newLists.forEach((list, idx) => {
            list.position = String(idx + 1);
          });

          // Update UI immediately
          queryClient.setQueryData(["lists", BOARD_ID], newLists);

          // Debounce the API call
          debouncedUpdatePositions(newLists);
        }
      }
    },
  };
}
