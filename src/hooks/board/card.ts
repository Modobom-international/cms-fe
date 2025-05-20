import { useCallback, useRef } from "react";

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

const DEBOUNCE_TIME = 5000; // 5 seconds debounce for card moves

// Define the context type
interface MoveCardContext {
  previousSourceCards: Card[] | undefined;
  previousDestCards: Card[] | undefined;
  cardToMove: Card;
}

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
    mutationFn: async (card: {
      id: number;
      title: string;
      description: string;
      list_id: number;
    }) => {
      console.log("🚀 Updating card with data:", card);
      const { data } = await apiClient.post(`/api/cards/${card.id}`, {
        title: card.title,
        description: card.description,
      });
      console.log("✅ Update response:", data);
      // Return the card data we sent since server only returns success status
      return {
        ...card,
        position: 0, // Default position
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Card;
    },
    onMutate: async (updatedCard) => {
      console.log("🔄 Starting optimistic update for card:", updatedCard);
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["cards", String(updatedCard.list_id)],
      });

      // Snapshot the previous value
      const previousCards =
        queryClient.getQueryData<Card[]>([
          "cards",
          String(updatedCard.list_id),
        ]) || [];
      console.log("📸 Previous cards:", previousCards);

      // Optimistically update the card
      const optimisticCards = previousCards.map((card) =>
        card.id === updatedCard.id
          ? {
              ...card,
              title: updatedCard.title,
              description: updatedCard.description,
            }
          : card
      );
      console.log("✨ Optimistic cards:", optimisticCards);

      // Optimistically update the UI
      queryClient.setQueryData(
        ["cards", String(updatedCard.list_id)],
        optimisticCards
      );

      // Return a context with the previous cards
      return { previousCards };
    },
    onError: (err, updatedCard, context) => {
      console.error("❌ Update error:", err);
      // If the mutation fails, roll back to the previous state
      if (context?.previousCards) {
        queryClient.setQueryData(
          ["cards", String(updatedCard.list_id)],
          context.previousCards
        );
      }
    },
    onSettled: (data) => {
      console.log("🏁 Update settled, data:", data);
      // Always refetch after error or success to ensure we have the correct data
      if (data) {
        console.log("🔄 Invalidating queries for list:", data.list_id);
        queryClient.invalidateQueries({
          queryKey: ["cards", String(data.list_id)],
        });
        queryClient.invalidateQueries({ queryKey: ["lists"] });
        queryClient.invalidateQueries({ queryKey: ["card", data.id] });
      }
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
  const timerRef = useRef<NodeJS.Timeout>();
  const latestPositionsRef = useRef<Map<string, CardPosition[]>>(new Map());

  const calculatePositions = (
    sourceListId: string | number,
    destinationListId: string | number,
    cardId: number,
    newOrder: number
  ): CardPosition[] => {
    console.log("📊 Calculating positions:", {
      sourceListId,
      destinationListId,
      cardId,
      newOrder,
    });

    const positions: CardPosition[] = [];

    if (sourceListId === destinationListId) {
      console.log("🔄 Same list movement");
      const currentCards =
        queryClient.getQueryData<Card[]>(["cards", String(sourceListId)]) || [];

      console.log("📋 Current cards in list:", currentCards);

      const cards = [...currentCards];
      const movedCardIndex = cards.findIndex((c) => c.id === cardId);

      if (movedCardIndex !== -1) {
        const [movedCard] = cards.splice(movedCardIndex, 1);
        console.log("🎴 Moving card:", movedCard);
        cards.splice(newOrder, 0, movedCard);

        const updatedPositions = cards.map((card, index) => ({
          id: card.id,
          position: index,
          list_id: Number(sourceListId),
        }));

        positions.push(...updatedPositions);
        console.log("📍 Updated positions:", updatedPositions);
      } else {
        console.warn("⚠️ Card not found in source list:", cardId);
      }
    } else {
      console.log("↔️ Cross-list movement");
      const sourceCards =
        queryClient.getQueryData<Card[]>(["cards", String(sourceListId)]) || [];

      const destCards =
        queryClient.getQueryData<Card[]>([
          "cards",
          String(destinationListId),
        ]) || [];

      console.log("📤 Source list cards:", sourceCards);
      console.log("📥 Destination list cards:", destCards);

      // Update source list positions
      const sourceCardsUpdated = sourceCards
        .filter((c) => c.id !== cardId)
        .map((card, index) => ({
          id: card.id,
          position: index,
          list_id: Number(sourceListId),
        }));
      positions.push(...sourceCardsUpdated);

      // Update destination list positions
      const destCardsUpdated = [...destCards];
      const movedCard = sourceCards.find((c) => c.id === cardId);
      if (movedCard) {
        console.log("🎴 Moving card between lists:", movedCard);
        destCardsUpdated.splice(newOrder, 0, {
          ...movedCard,
          list_id: Number(destinationListId),
        });
        const destPositions = destCardsUpdated.map((card, index) => ({
          id: card.id,
          position: index,
          list_id: Number(destinationListId),
        }));
        positions.push(...destPositions);
        console.log("📍 Updated positions for both lists:", positions);
      } else {
        console.warn("⚠️ Card not found for cross-list movement:", cardId);
      }
    }

    return positions;
  };

  const { mutate: executeMutation } = useMutation({
    mutationFn: async (payload: { positions: CardPosition[] }) => {
      console.log("🚀 Executing API call with positions:", payload.positions);
      const { data } = await apiClient.put("/api/cards/positions", payload);

      if (!data.success) {
        console.error("❌ API call failed:", data.message);
        throw new Error(data.message || "Failed to update card positions");
      }

      console.log("✅ API call successful:", data);
      return data.data;
    },
    onError: (err, variables, context: MoveCardContext | undefined) => {
      console.error("❌ Error during mutation:", err);
      console.log("🔄 Rolling back to previous state:", context);

      if (context?.previousSourceCards) {
        queryClient.setQueryData(
          ["cards", String(context.cardToMove.list_id)],
          context.previousSourceCards
        );
      }
      if (context?.previousDestCards) {
        queryClient.setQueryData(
          ["cards", String(context.cardToMove.list_id)],
          context.previousDestCards
        );
      }
    },
    onSettled: async (_, __, ___, context: MoveCardContext | undefined) => {
      console.log("✨ Mutation settled, invalidating queries");
      if (context) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["cards", String(context.cardToMove.list_id)],
          }),
          queryClient.invalidateQueries({
            queryKey: ["lists"],
          }),
        ]);
      }
    },
  });

  const debouncedMutation = useCallback(() => {
    console.log("⏳ Debounced mutation triggered");
    console.log("📊 Current positions map:", latestPositionsRef.current);

    if (timerRef.current) {
      console.log("🔄 Clearing previous debounce timer");
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      console.log("⌛ Debounce timer expired, preparing to send positions");
      // Get all positions from the latest state
      const allPositions: CardPosition[] = [];
      latestPositionsRef.current.forEach((positions) => {
        allPositions.push(...positions);
      });

      console.log("📊 Final positions to send:", allPositions);

      if (allPositions.length > 0) {
        console.log("🚀 Executing mutation with all positions");
        executeMutation({ positions: allPositions });
        // Clear the positions after sending
        latestPositionsRef.current.clear();
        console.log("🧹 Cleared positions map");
      } else {
        console.warn("⚠️ No positions to update");
      }
    }, DEBOUNCE_TIME);
  }, [executeMutation]);

  return {
    mutate: async (payload: MoveCardPayload) => {
      console.log("🎯 Card move initiated:", payload);

      await queryClient.cancelQueries({
        queryKey: ["cards", String(payload.sourceListId)],
      });
      if (payload.sourceListId !== payload.destinationListId) {
        await queryClient.cancelQueries({
          queryKey: ["cards", String(payload.destinationListId)],
        });
      }

      const previousSourceCards = queryClient.getQueryData<Card[]>([
        "cards",
        String(payload.sourceListId),
      ]);
      const previousDestCards = queryClient.getQueryData<Card[]>([
        "cards",
        String(payload.destinationListId),
      ]);

      console.log("💾 Previous source cards:", previousSourceCards);
      console.log("💾 Previous destination cards:", previousDestCards);

      const cardToMove = previousSourceCards?.find(
        (c) => c.id === payload.cardId
      );

      if (!cardToMove) {
        console.error("❌ Card not found:", payload.cardId);
        return;
      }

      console.log("🎴 Card to move:", cardToMove);

      // Store context for potential rollback
      const context = {
        previousSourceCards,
        previousDestCards,
        cardToMove,
      };

      // Calculate new positions
      const positions = calculatePositions(
        payload.sourceListId,
        payload.destinationListId,
        payload.cardId,
        payload.newOrder
      );

      console.log("📊 Calculated positions:", positions);

      // Update the latest positions map
      if (payload.sourceListId === payload.destinationListId) {
        console.log("🔄 Updating positions for same list");
        latestPositionsRef.current.set(String(payload.sourceListId), positions);
      } else {
        console.log("↔️ Updating positions for cross-list movement");
        // Split positions by list
        const sourcePositions = positions.filter(
          (p) => p.list_id === Number(payload.sourceListId)
        );
        const destPositions = positions.filter(
          (p) => p.list_id === Number(payload.destinationListId)
        );
        latestPositionsRef.current.set(
          String(payload.sourceListId),
          sourcePositions
        );
        latestPositionsRef.current.set(
          String(payload.destinationListId),
          destPositions
        );
      }

      console.log("📊 Updated positions map:", latestPositionsRef.current);

      // Perform optimistic update
      if (payload.sourceListId === payload.destinationListId) {
        console.log("🔄 Applying optimistic update for same list");
        const updatedCards = positions.map((pos) => ({
          ...(previousSourceCards?.find((c) => c.id === pos.id) as Card),
          position: pos.position,
        }));
        queryClient.setQueryData(
          ["cards", String(payload.sourceListId)],
          updatedCards
        );
        console.log("✨ Optimistic update applied:", updatedCards);
      } else {
        console.log("↔️ Applying optimistic update for cross-list movement");
        const sourceCards = positions
          .filter((p) => p.list_id === Number(payload.sourceListId))
          .map((pos) => ({
            ...(previousSourceCards?.find((c) => c.id === pos.id) as Card),
            position: pos.position,
          }));

        const destCards = positions
          .filter((p) => p.list_id === Number(payload.destinationListId))
          .map((pos) => ({
            ...(previousDestCards?.find((c) => c.id === pos.id) || cardToMove),
            position: pos.position,
            list_id: Number(payload.destinationListId),
          }));

        console.log("📤 Updated source cards:", sourceCards);
        console.log("📥 Updated destination cards:", destCards);

        queryClient.setQueryData(
          ["cards", String(payload.sourceListId)],
          sourceCards
        );
        queryClient.setQueryData(
          ["cards", String(payload.destinationListId)],
          destCards
        );
      }

      // Store the card data for the mutation
      queryClient.setQueryData(["tempCard", payload.cardId], cardToMove);

      // Trigger debounced update
      debouncedMutation();
    },
  };
}

export function useGetCard(cardId: number) {
  return useQuery({
    queryKey: ["card", cardId],
    queryFn: async () => {
      console.log("📥 Fetching card details for ID:", cardId);
      const { data } = await apiClient.get(`/api/cards/${cardId}`);
      console.log("📦 Card details response:", data);
      return data.data as Card;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
