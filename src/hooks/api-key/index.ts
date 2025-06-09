"use client";

import { apiKeyQueryKeys } from "@/constants/query-keys";
import apiClient from "@/lib/api/client";
import { IGetApiKeysResponse, ICreateApiKeyResponse } from "@/types/api-key.type";
import { CreateApiKeySchema, ICreateApiKeyForm } from "@/validations/api-key.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

export const useGetApiKeys = () => {
    return useQuery({
        queryKey: apiKeyQueryKeys.list(),
        queryFn: async () => {
            try {
                const { data } = await apiClient.get<IGetApiKeysResponse>("/api/api-keys")
                return data
            } catch (error) {
                throw new Error("Failed to fetch API keys")
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
            const { data } = await apiClient.post<ICreateApiKeyResponse>("/api/api-keys", formData)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.list() });
        },
    });

    return {
        createApiKeyForm,
        useCreateApiKeyMutation,
    }
};