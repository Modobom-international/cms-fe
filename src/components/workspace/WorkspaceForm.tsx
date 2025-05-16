"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { CreateWorkspaceDto } from "@/types/workspaces.type";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface WorkspaceFormProps {
  initialData?: {
    name: string;
    description: string;
    visibility: number;
  };
  onSubmit: (data: CreateWorkspaceDto) => void;
  isLoading: boolean;
}

export function WorkspaceForm({
  initialData,
  onSubmit,
  isLoading,
}: WorkspaceFormProps) {
  const t = useTranslations("Workspace.form");

  const formSchema = z.object({
    name: z.string().min(1, t("validation.name.required")),
    description: z.string().min(1, t("validation.description.required")),
    visibility: z.coerce.number().min(1).max(2),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      visibility: initialData?.visibility || 1,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("visibility.label")}</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("visibility.placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">{t("visibility.private")}</SelectItem>
                  <SelectItem value="2">{t("visibility.public")}</SelectItem>
                </SelectContent>
              </Select>
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
