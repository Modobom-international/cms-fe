import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Card,
  CardPosition,
  MoveCardPayload,
  UpdateCardPositionsPayload,
} from "@/types/board.type";

import apiClient from "@/lib/api/client";

export function useGetCards(listId: string) {
  return useQuery({
    queryKey: ["cards", listId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/lists/${listId}/cards`);
      return data.cards || [];
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
      listId,
      title,
      description,
    }: {
      listId: string;
      title: string;
      description: string;
    }) => {
      const { data } = await apiClient.post(`/api/lists/${listId}/cards`, {
        title,
        description,
      });
      return data as Card;
    },
    onMutate: async (newCard) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cards", newCard.listId] });

      // Snapshot the previous value
      const previousCards =
        queryClient.getQueryData<Card[]>(["cards", newCard.listId]) || [];

      // Create an optimistic card
      const optimisticCard: Card = {
        id: Math.random(), // Temporary ID
        title: newCard.title,
        description: newCard.description,
        listId: Number(newCard.listId),
        order: previousCards.length + 1,
      };

      // Optimistically update the UI
      queryClient.setQueryData(
        ["cards", newCard.listId],
        [...previousCards, optimisticCard]
      );

      // Return a context with the previous cards
      return { previousCards };
    },
    onError: (err, newCard, context) => {
      // If the mutation fails, roll back to the previous state
      if (context?.previousCards) {
        queryClient.setQueryData(
          ["cards", newCard.listId],
          context.previousCards
        );
      }
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({ queryKey: ["cards", variables.listId] });
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

      // Fetch fresh data instead of using cache
      const [sourceResponse, destResponse] = await Promise.all([
        apiClient.get(`/api/lists/${payload.sourceListId}/cards`),
        apiClient.get(`/api/lists/${payload.destinationListId}/cards`),
      ]);

      const sourceCards: Card[] = sourceResponse.data?.cards || [];
      const destCards: Card[] = destResponse.data?.cards || [];

      console.log("📦 Source List Cards:", sourceCards);
      console.log("🎯 Destination List Cards:", destCards);

      // Calculate new positions for all affected cards
      const positions: CardPosition[] = [];

      if (payload.sourceListId === payload.destinationListId) {
        console.log("🔄 Same List Reordering");
        // Same list reordering
        const cards = [...sourceCards];
        const movedCardIndex = cards.findIndex(
          (c: Card) => String(c.id) === String(payload.cardId)
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
        const updatedPositions = cards.map((card: Card, index: number) => {
          if (!card.id) {
            console.error("❌ Card missing ID:", card);
            throw new Error(`Card missing ID at position ${index}`);
          }
          return {
            id: card.id,
            position: index,
            list_id: Number(payload.sourceListId),
          };
        });

        positions.push(...updatedPositions);
      } else {
        console.log("↔️ Cross-List Movement");
        // Moving between different lists
        // Update source list positions
        const sourceCardsUpdated = sourceCards.filter(
          (c: Card) => String(c.id) !== String(payload.cardId)
        );
        console.log("📤 Updated Source Cards:", sourceCardsUpdated);

        // Update positions for source list
        const sourcePositions = sourceCardsUpdated.map(
          (card: Card, index: number) => {
            if (!card.id) {
              console.error("❌ Card missing ID:", card);
              throw new Error(
                `Card missing ID at position ${index} in source list`
              );
            }
            return {
              id: card.id,
              position: index,
              list_id: Number(payload.sourceListId),
            };
          }
        );
        positions.push(...sourcePositions);

        // Get the moved card
        const movedCard = sourceCards.find(
          (c: Card) => String(c.id) === String(payload.cardId)
        );
        console.log("🎴 Moved Card:", movedCard);

        if (!movedCard || !movedCard.id) {
          console.error("❌ Card not found or missing ID:", payload.cardId);
          throw new Error("Card not found or missing ID");
        }

        // Update destination list positions
        const destCardsUpdated = [...destCards];
        destCardsUpdated.splice(payload.newOrder, 0, {
          ...movedCard,
          listId: payload.destinationListId,
        });
        console.log("📥 Updated Destination Cards:", destCardsUpdated);

        // Update positions for destination list
        const destPositions = destCardsUpdated.map(
          (card: Card, index: number) => {
            if (!card.id) {
              console.error("❌ Card missing ID:", card);
              throw new Error(
                `Card missing ID at position ${index} in destination list`
              );
            }
            return {
              id: card.id,
              position: index,
              list_id: Number(payload.destinationListId),
            };
          }
        );
        positions.push(...destPositions);
      }

      // Ensure positions array is not empty and all required fields are present
      if (positions.length === 0) {
        console.error("❌ No positions to update");
        throw new Error("No positions to update");
      }

      // Validate all positions have valid IDs
      const invalidPosition = positions.find(
        (pos) => !pos.id || pos.id === undefined
      );
      if (invalidPosition) {
        console.error("❌ Invalid position found:", invalidPosition);
        throw new Error("Invalid card ID in positions array");
      }

      console.log("📊 Final Positions Payload:", positions);

      // Send the batch update request
      const updatePayload: UpdateCardPositionsPayload = {
        positions,
      };
      const { data } = await apiClient.put(
        "/api/cards/positions",
        updatePayload
      );
      console.log("✅ API Response:", data);
      return data;
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

      // Optimistically update the source list
      queryClient.setQueryData<Card[]>(
        ["cards", String(variables.sourceListId)],
        (old = [...previousSourceCards]) => {
          if (variables.sourceListId === variables.destinationListId) {
            // Same list reordering
            const cards = [...old];
            const movedCardIndex = cards.findIndex(
              (c: Card) => Number(c.id) === Number(variables.cardId)
            );

            if (movedCardIndex === -1) {
              console.error("❌ Card not found for optimistic update");
              return old;
            }

            const [movedCard] = cards.splice(movedCardIndex, 1);
            cards.splice(variables.newOrder, 0, movedCard);
            const updatedCards = cards.map((card: Card, index: number) => ({
              ...card,
              position: index + 1,
              listId: variables.sourceListId,
            }));
            console.log("🔄 Optimistically Updated Same List:", updatedCards);
            return updatedCards;
          }

          const filteredCards = old
            .filter(
              (card: Card) => Number(card.id) !== Number(variables.cardId)
            )
            .map((card: Card, index: number) => ({
              ...card,
              position: index + 1,
              listId: variables.sourceListId,
            }));
          console.log("📤 Optimistically Updated Source List:", filteredCards);
          return filteredCards;
        }
      );

      // Optimistically update the destination list
      if (variables.sourceListId !== variables.destinationListId) {
        queryClient.setQueryData<Card[]>(
          ["cards", String(variables.destinationListId)],
          (old = [...previousDestCards]) => {
            const movedCard = previousSourceCards.find(
              (card: Card) => Number(card.id) === Number(variables.cardId)
            );
            console.log("🎴 Found Card to Move:", movedCard);

            if (!movedCard) {
              console.error("❌ Card not found for optimistic update");
              return old;
            }

            const updatedCard = {
              ...movedCard,
              listId: variables.destinationListId,
              position: variables.newOrder + 1,
            };

            const newCards = [...old];
            newCards.splice(variables.newOrder, 0, updatedCard);
            const updatedCards = newCards.map((card: Card, index: number) => ({
              ...card,
              position: index + 1,
              listId: variables.destinationListId,
            }));
            console.log("📥 Optimistically Updated Dest List:", updatedCards);
            return updatedCards;
          }
        );
      }

      return { previousSourceCards, previousDestCards };
    },
    onError: (err, variables, context) => {
      console.error("❌ Error during card move:", err);
      console.log("🔄 Rolling back to previous state");

      // Rollback on error
      if (context?.previousSourceCards) {
        queryClient.setQueryData(
          ["cards", variables.sourceListId],
          context.previousSourceCards
        );
      }
      if (context?.previousDestCards) {
        queryClient.setQueryData(
          ["cards", variables.destinationListId],
          context.previousDestCards
        );
      }
    },
    onSettled: async (_, __, variables) => {
      console.log("✅ Card move operation settled");

      // Invalidate affected lists and their cards
      await Promise.all([
        // Invalidate cards queries
        queryClient.invalidateQueries({
          queryKey: ["cards", String(variables.sourceListId)],
        }),
        // Invalidate lists query to refresh positions
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
