"use client";

import { apiKeyQueryKeys } from "@/constants/query-keys";
import apiClient from "@/lib/api/client";
import { IGetApiKeysResponse } from "@/types/api-key.type";
import { useQuery } from "@tanstack/react-query";

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