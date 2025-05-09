import { serverQueryKeys } from "@/constants/query-keys";
import {
  CreateServerFormType,
  CreateServerSchema,
  UpdateServerFormType,
  UpdateServerSchema,
} from "@/validations/server.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import qs from "qs";
import { useForm } from "react-hook-form";

import { IGetServerListResponse } from "@/types/server.type";

import apiClient from "@/lib/api/client";
import { extractApiError } from "@/lib/api/error-handler";

export const useGetServerList = (
  page: number,
  pageSize: number,
  search: string
) => {
  const queryString = qs.stringify({ page, pageSize, search });
  return useQuery({
    queryKey: serverQueryKeys.list(1, 10, search),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<IGetServerListResponse>(
          `/api/server?${queryString}`
        );
        return data;
      } catch (error) {
        const errRes = extractApiError(error);
        throw new Error(errRes.type);
      }
    },
  });
};

export const useCreateServer = () => {
  const t = useTranslations("ServerPage");
  const createServerForm = useForm<CreateServerFormType>({
    resolver: zodResolver(CreateServerSchema(t)),
    defaultValues: {
      name: "",
      ip: "",
    },
  });

  const { mutateAsync: createServerMutation, isPending: isCreating } =
    useMutation({
      mutationKey: serverQueryKeys.create(),
      mutationFn: async (formData: CreateServerFormType) => {
        try {
          const { data } = await apiClient.post("/api/server/store", formData);
          return data;
        } catch (error) {
          const errRes = extractApiError(error);
          throw new Error(errRes.type);
        }
      },
    });

  return { createServerForm, createServerMutation, isCreating };
};

export const useUpdateServer = (id: string) => {
  const t = useTranslations("ServerPage");
  const updateServerForm = useForm<UpdateServerFormType>({
    resolver: zodResolver(UpdateServerSchema(t)),
    defaultValues: {
      name: "",
      ip: "",
    },
  });

  const { mutateAsync: updateServerMutation, isPending: isUpdating } =
    useMutation({
      mutationKey: serverQueryKeys.update(id),
      mutationFn: async (formData: UpdateServerFormType) => {
        try {
          const { data } = await apiClient.put(
            `/api/server/update/${id}`,
            formData
          );
          return data;
        } catch (error) {
          const errRes = extractApiError(error);
          throw new Error(errRes.type);
        }
      },
    });

  return { updateServerForm, updateServerMutation, isUpdating };
};

export const useDeleteServer = (id: string) => {
  const { mutateAsync: deleteServerMutation, isPending: isDeleting } =
    useMutation({
      mutationKey: serverQueryKeys.delete(id),
      mutationFn: async () => {
        try {
          const { data } = await apiClient.delete(`/api/server/delete/${id}`);
          return data;
        } catch (error) {
          const errRes = extractApiError(error);
          throw new Error(errRes.type);
        }
      },
    });

  return { deleteServerMutation, isDeleting };
};
