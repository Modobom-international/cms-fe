"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { CreateBoardDto } from "@/types/board.type";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BoardFormProps {
  initialData?: {
    name: string;
    description: string | null;
  };
  workspaceId: number;
  onSubmit: (data: CreateBoardDto) => void;
  isLoading: boolean;
}

export function BoardForm({
  initialData,
  workspaceId,
  onSubmit,
  isLoading,
}: BoardFormProps) {
  const t = useTranslations("Board.form");

  const formSchema = z.object({
    name: z.string().min(1, t("name.required")),
    description: z.string().optional(),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const handleSubmit = (formData: FormData) => {
    const data: CreateBoardDto = {
      name: formData.name,
      description: formData.description || "",
      workspace_id: workspaceId,
    };
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name.label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("name.placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description.label")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("description.placeholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? t("buttons.loading")
            : initialData
              ? t("buttons.update")
              : t("buttons.create")}
        </Button>
      </form>
    </Form>
  );
}
