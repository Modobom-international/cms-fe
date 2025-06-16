"use client";

import { apiKeyQueryKeys } from "@/constants/query-keys";
import {
  CreateApiKeySchema,
  ICreateApiKeyForm,
  IUpdateApiKeyForm,
  UpdateApiKeySchema,
} from "@/validations/api-key.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import {
  ICreateApiKeyResponse,
  IGetApiKeysResponse,
} from "@/types/api-key.type";

import apiClient from "@/lib/api/client";

export const useGetApiKeys = () => {
  return useQuery({
    queryKey: apiKeyQueryKeys.list(),
    queryFn: async () => {
      try {
        const { data } =
          await apiClient.get<IGetApiKeysResponse>("/api/api-keys");
        return data;
      } catch (error) {
        throw new Error("Failed to fetch API keys");
      }
    },
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();
  const createApiKeyForm = useForm<ICreateApiKeyForm>({
    resolver: zodResolver(CreateApiKeySchema),
    defaultValues: {
      name: "",
      expires_at: null,
    },
  });

  const useCreateApiKeyMutation = useMutation({
    mutationKey: apiKeyQueryKeys.create(),
    mutationFn: async (formData: ICreateApiKeyForm) => {
      const { data } = await apiClient.post<ICreateApiKeyResponse>(
        "/api/api-keys",
        formData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.list() });
    },
  });

  return {
    createApiKeyForm,
    useCreateApiKeyMutation,
  };
};

export const useDeleteApiKey = (id: string) => {
  const queryClient = useQueryClient();

  const useDeleteApiKeyMutation = useMutation({
    mutationKey: apiKeyQueryKeys.delete(id),
    mutationFn: async () => {
      const { data } = await apiClient.delete(`/api/api-keys/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.list() });
    },
  });

  return {
    useDeleteApiKeyMutation,
  };
};

export const useUpdateApiKey = (id: string) => {
  const queryClient = useQueryClient();
  const updateApiKeyForm = useForm<IUpdateApiKeyForm>({
    resolver: zodResolver(UpdateApiKeySchema),
    defaultValues: {
      name: "",
      is_active: false,
    },
  });

  const useUpdateApiKeyMutation = useMutation({
    mutationKey: apiKeyQueryKeys.update(id),
    mutationFn: async (formData: IUpdateApiKeyForm) => {
      const { data } = await apiClient.put(`/api/api-keys/${id}`, formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.list() });
    },
  });

  return {
    updateApiKeyForm,
    useUpdateApiKeyMutation,
  };
};
