import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Label } from "@/types/board.type";

import apiClient from "@/lib/api/client";

// Get all labels
export function useGetLabels() {
  return useQuery({
    queryKey: ["labels"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/labels");
      return data.data as Label[];
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

// Create a new label
export function useCreateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (label: { name: string; color: string }) => {
      const { data } = await apiClient.post("/api/labels", label);
      return data.data as Label;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
    },
  });
}

// Update a label
export function useUpdateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      color,
    }: {
      id: number;
      name: string;
      color: string;
    }) => {
      const { data } = await apiClient.put(`/api/labels/${id}`, {
        name,
        color,
      });
      return data.data as Label;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
    },
  });
}

// Delete a label
export function useDeleteLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/labels/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
    },
  });
}
