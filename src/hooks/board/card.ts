import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Card, MoveCardPayload } from "@/types/board";

import apiClient from "@/lib/api/client";

export function useGetCards(listId: string) {
  return useQuery({
    queryKey: ["cards", listId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/list/${listId}/cards`);
      return data as Card[];
    },
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      title,
      description,
    }: {
      listId: string;
      title: string;
      description: string;
    }) => {
      const { data } = await apiClient.post(`/api/list/${listId}/card/create`, {
        title,
        description,
      });
      return data as Card;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cards", variables.listId] });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (card: Partial<Card> & { id: string }) => {
      const { data } = await apiClient.post(
        `/api/card/update/${card.id}`,
        card
      );
      return data as Card;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cards", data.listId] });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cardId,
      listId,
    }: {
      cardId: string;
      listId: string;
    }) => {
      await apiClient.delete(`/api/card/delete/${cardId}`);
      return { listId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cards", data.listId] });
    },
  });
}

export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MoveCardPayload) => {
      const { data } = await apiClient.post(
        `/api/card/${payload.cardId}/move`,
        payload
      );
      return data as Card;
    },
    onSuccess: (_, variables) => {
      // Invalidate both source and destination lists
      queryClient.invalidateQueries({
        queryKey: ["cards", variables.sourceListId],
      });
      queryClient.invalidateQueries({
        queryKey: ["cards", variables.destinationListId],
      });
    },
  });
}

