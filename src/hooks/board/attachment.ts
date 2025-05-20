import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiResponse, Attachment } from "@/types/board.type";

import apiClient from "@/lib/api/client";

// Get card attachments
export function useGetCardAttachments(cardId: number) {
  return useQuery({
    queryKey: ["card-attachments", cardId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Attachment[]>>(
        `/api/cards/${cardId}/attachments`
      );
      return data.data;
    },
  });
}

// Create attachment
export function useCreateAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cardId,
      formData,
    }: {
      cardId: number;
      formData: FormData;
    }) => {
      console.log("Starting attachment creation...");
      const { data } = await apiClient.post<{
        success: boolean;
        message: string;
        attachment: Attachment;
        url: string | null;
        type: string;
      }>(`/api/cards/${cardId}/attachments`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("🚀 ~ mutationFn: ~ data:", data);
      return data.attachment;
    },
    onSuccess: (data) => {
      console.log("✅ Attachment created successfully:", data);
      queryClient.invalidateQueries({
        queryKey: ["card-attachments", Number(data.card_id)],
      });
    },
    onError: (error) => {
      console.error("❌ Error creating attachment:", error);
    },
  });
}

// Update attachment
export function useUpdateAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      attachmentId,
      formData,
    }: {
      attachmentId: number;
      formData: FormData;
    }) => {
      const { data } = await apiClient.post<
        ApiResponse<{ attachment: Attachment }>
      >(`/api/attachments/${attachmentId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data.data.attachment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["card-attachments", data.card_id],
      });
    },
  });
}

// Delete attachment
export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      attachmentId,
      cardId,
    }: {
      attachmentId: number;
      cardId: number;
    }) => {
      const { data } = await apiClient.delete<ApiResponse<null>>(
        `/api/attachments/${attachmentId}`
      );
      return { attachmentId, cardId };
    },
    onSuccess: (_, { cardId }) => {
      queryClient.invalidateQueries({
        queryKey: ["card-attachments", cardId],
      });
    },
  });
}
