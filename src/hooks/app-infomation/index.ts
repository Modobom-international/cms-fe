import { appInformationQueryKeys } from "@/constants/query-keys";
import apiClient from "@/lib/api/client";
import { IAppInformationFilterMenuResponse } from "@/types/app-information.type";
import { useQuery } from "@tanstack/react-query";
import qs from "qs";


export const useGetAppInformation = (
    page: number = 1,
    pageSize: number = 10,
    search: string,
    filters?: {
        app_name?: string
        os_name?: string
        category?: string
        event_name?: string
    }
) => {
    const paramsObj = {
        page,
        pageSize,
        search,
        ...filters,
    }

    const params = qs.stringify(paramsObj, { skipNulls: true })

    return useQuery({
        queryKey: appInformationQueryKeys.list(
            page,
            pageSize,
            search,
            filters?.app_name,
            filters?.os_name,
            filters?.category,
            filters?.event_name
        ),
        queryFn: async () => {
            try {
                const { data } = await apiClient.get(`/api/app-information?${params}`);
                return data;
            } catch (error) {
                throw new Error("Failed to fetch app information");
            }
        },
    })
};

export const useGetAppInformationFilterMenu = () => {
    return useQuery({
        queryKey: appInformationQueryKeys.filterMenu(),
        queryFn: async (): Promise<IAppInformationFilterMenuResponse> => {
            try {
                const { data } = await apiClient.get("/api/app-information/menu");
                return data;
            } catch (error) {
                throw new Error("Failed to fetch app information filter menu");
            }
        },
    });
};
