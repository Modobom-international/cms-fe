import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Card,
  CardPosition,
  CardResponse,
  CreateCardPayload,
  MoveCardPayload,
  UpdateCardPayload,
} from "@/types/card.type";

import apiClient from "@/lib/api/client";

export function useGetCards(listId: string) {
  return useQuery({
    queryKey: ["cards", listId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/lists/${listId}/cards`);
      return data.data || [];
    },
    staleTime: 0, // Consider data stale immediately
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      list_id,
      title,
      description,
    }: {
      list_id: string;
      title: string;
      description: string;
    }) => {
      const { data } = await apiClient.post(`/api/lists/${list_id}/cards`, {
        title,
        description,
      });
      return data as Card;
    },
    onMutate: async (newCard) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cards", newCard.list_id] });

      // Snapshot the previous value
      const previousCards =
        queryClient.getQueryData<Card[]>(["cards", newCard.list_id]) || [];

      // Create an optimistic card
      const optimisticCard: Card = {
        id: -Date.now(), // Temporary ID using negative timestamp to avoid conflicts
        title: newCard.title,
        description: newCard.description,
        list_id: Number(newCard.list_id),
        position: previousCards.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Optimistically update the UI
      queryClient.setQueryData(
        ["cards", newCard.list_id],
        [...previousCards, optimisticCard]
      );

      // Return a context with the previous cards
      return { previousCards };
    },
    onError: (err, newCard, context) => {
      // If the mutation fails, roll back to the previous state
      if (context?.previousCards) {
        queryClient.setQueryData(
          ["cards", newCard.list_id],
          context.previousCards
        );
      }
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({ queryKey: ["cards", variables.list_id] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (card: Partial<Card> & { id: number }) => {
      const { data } = await apiClient.post(`/api/cards/${card.id}`, card);
      return data as Card;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cards", data.list_id] });
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
      cardId: number;
      listId: number;
    }) => {
      await apiClient.delete(`/api/cards/${cardId}`);
      return { listId };
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["cards", String(variables.listId)],
      });

      // Snapshot the previous value
      const previousCards =
        queryClient.getQueryData<Card[]>(["cards", String(variables.listId)]) ||
        [];

      // Optimistically remove the card
      const newCards = previousCards.filter(
        (card) => card.id !== variables.cardId
      );
      queryClient.setQueryData(["cards", String(variables.listId)], newCards);

      // Return a context with the previous cards
      return { previousCards };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, roll back to the previous state
      if (context?.previousCards) {
        queryClient.setQueryData(
          ["cards", String(variables.listId)],
          context.previousCards
        );
      }
    },
    onSettled: (data) => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({
        queryKey: ["cards", String(data?.listId)],
      });
    },
  });
}

export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MoveCardPayload) => {
      console.log("🚀 Move Card Payload:", {
        cardId: payload.cardId,
        sourceListId: payload.sourceListId,
        destinationListId: payload.destinationListId,
        newOrder: payload.newOrder,
      });

      // Calculate new positions for all affected cards
      const positions: CardPosition[] = [];

      if (payload.sourceListId === payload.destinationListId) {
        console.log("🔄 Same List Reordering");
        // Get current cached data instead of fetching
        const currentCards =
          queryClient.getQueryData<Card[]>([
            "cards",
            String(payload.sourceListId),
          ]) || [];

        const cards = [...currentCards];
        const movedCardIndex = cards.findIndex(
          (c: Card) => c.id === payload.cardId
        );
        console.log("📍 Found Card Index:", movedCardIndex);

        if (movedCardIndex === -1) {
          console.error("❌ Card not found in source list:", payload.cardId);
          throw new Error("Card not found in source list");
        }

        const [movedCard] = cards.splice(movedCardIndex, 1);
        console.log("🎴 Moved Card:", movedCard);

        cards.splice(payload.newOrder, 0, movedCard);
        console.log("📋 Reordered Cards:", cards);

        // Update positions for all cards in the list
        const updatedPositions = cards.map((card: Card, index: number) => ({
          id: card.id,
          position: index,
          list_id: Number(payload.sourceListId),
        }));

        positions.push(...updatedPositions);
      } else {
        console.log("↔️ Cross-List Movement");
        // Get current cached data instead of fetching
        const sourceCards =
          queryClient.getQueryData<Card[]>([
            "cards",
            String(payload.sourceListId),
          ]) || [];
        const destCards =
          queryClient.getQueryData<Card[]>([
            "cards",
            String(payload.destinationListId),
          ]) || [];

        // Update source list positions
        const sourceCardsUpdated = sourceCards.filter(
          (c: Card) => c.id !== payload.cardId
        );
        console.log("📤 Updated Source Cards:", sourceCardsUpdated);

        // Update positions for source list
        const sourcePositions = sourceCardsUpdated.map(
          (card: Card, index: number) => ({
            id: card.id,
            position: index,
            list_id: Number(payload.sourceListId),
          })
        );
        positions.push(...sourcePositions);

        // Get the moved card
        const movedCard = sourceCards.find(
          (c: Card) => c.id === payload.cardId
        );
        console.log("🎴 Moved Card:", movedCard);

        if (!movedCard) {
          console.error("❌ Card not found or missing ID:", payload.cardId);
          throw new Error("Card not found or missing ID");
        }

        // Update destination list positions
        const destCardsUpdated = [...destCards];
        destCardsUpdated.splice(payload.newOrder, 0, {
          ...movedCard,
          list_id: payload.destinationListId,
        });
        console.log("📥 Updated Destination Cards:", destCardsUpdated);

        // Update positions for destination list
        const destPositions = destCardsUpdated.map(
          (card: Card, index: number) => ({
            id: card.id,
            position: index,
            list_id: Number(payload.destinationListId),
          })
        );
        positions.push(...destPositions);
      }

      // Ensure positions array is not empty
      if (positions.length === 0) {
        console.error("❌ No positions to update");
        throw new Error("No positions to update");
      }

      console.log("📊 Final Positions Payload:", positions);

      // Send the batch update request
      const updatePayload = {
        positions,
      };
      const { data } = await apiClient.put(
        "/api/cards/positions",
        updatePayload
      );
      console.log("✅ API Response:", data);

      if (!data.success) {
        throw new Error(data.message || "Failed to update card positions");
      }

      return data.data;
    },
    onMutate: async (variables) => {
      console.log("🔄 Starting Optimistic Update:", variables);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cards"] });

      // Get current cached data
      const previousSourceCards =
        queryClient.getQueryData<Card[]>([
          "cards",
          String(variables.sourceListId),
        ]) || [];
      const previousDestCards =
        variables.sourceListId === variables.destinationListId
          ? previousSourceCards
          : queryClient.getQueryData<Card[]>([
              "cards",
              String(variables.destinationListId),
            ]) || [];

      console.log("💾 Previous Source Cards:", previousSourceCards);
      console.log("💾 Previous Dest Cards:", previousDestCards);

      if (variables.sourceListId === variables.destinationListId) {
        // Same list reordering
        const cards = [...previousSourceCards];
        const movedCardIndex = cards.findIndex(
          (c) => c.id === variables.cardId
        );

        if (movedCardIndex === -1) {
          console.error("❌ Card not found for optimistic update");
          return { previousSourceCards, previousDestCards };
        }

        const [movedCard] = cards.splice(movedCardIndex, 1);
        cards.splice(variables.newOrder, 0, {
          ...movedCard,
          position: variables.newOrder,
        });

        // Update positions for all cards
        const updatedCards = cards.map((card, index) => ({
          ...card,
          position: index,
        }));

        queryClient.setQueryData(
          ["cards", String(variables.sourceListId)],
          updatedCards
        );
      } else {
        // Moving between different lists
        const sourceCards = [...previousSourceCards];
        const destCards = [...previousDestCards];

        // Remove card from source list
        const movedCardIndex = sourceCards.findIndex(
          (c) => c.id === variables.cardId
        );

        if (movedCardIndex === -1) {
          console.error("❌ Card not found for optimistic update");
          return { previousSourceCards, previousDestCards };
        }

        const [movedCard] = sourceCards.splice(movedCardIndex, 1);

        // Update source list positions
        const updatedSourceCards = sourceCards.map((card, index) => ({
          ...card,
          position: index,
        }));

        // Add card to destination list
        destCards.splice(variables.newOrder, 0, {
          ...movedCard,
          list_id: variables.destinationListId,
          position: variables.newOrder,
        });

        // Update destination list positions
        const updatedDestCards = destCards.map((card, index) => ({
          ...card,
          position: index,
        }));

        // Update both lists in cache
        queryClient.setQueryData(
          ["cards", String(variables.sourceListId)],
          updatedSourceCards
        );
        queryClient.setQueryData(
          ["cards", String(variables.destinationListId)],
          updatedDestCards
        );
      }

      return { previousSourceCards, previousDestCards };
    },
    onError: (err, variables, context) => {
      console.error("❌ Error during card move:", err);
      console.log("🔄 Rolling back to previous state");

      if (context?.previousSourceCards) {
        queryClient.setQueryData(
          ["cards", String(variables.sourceListId)],
          context.previousSourceCards
        );
      }
      if (
        variables.sourceListId !== variables.destinationListId &&
        context?.previousDestCards
      ) {
        queryClient.setQueryData(
          ["cards", String(variables.destinationListId)],
          context.previousDestCards
        );
      }
    },
    onSettled: async (_, __, variables) => {
      console.log("✅ Card move operation settled");

      // Invalidate affected lists and their cards
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["cards", String(variables.sourceListId)],
        }),
        queryClient.invalidateQueries({
          queryKey: ["lists"],
        }),
      ]);

      // If moving between lists, also invalidate destination list
      if (variables.sourceListId !== variables.destinationListId) {
        await queryClient.invalidateQueries({
          queryKey: ["cards", String(variables.destinationListId)],
        });
      }
    },
  });
}
