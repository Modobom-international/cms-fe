"use client";

import { cloneElement, ReactElement, useState } from "react";

import { ICreateApiKeyForm } from "@/validations/api-key.validation";
import {
  Calendar as CalendarIcon,
  Copy,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { DropdownNavProps, DropdownProps } from "react-day-picker";
import { toast } from "sonner";

import { IApiKeyWithKey } from "@/types/api-key.type";

import { cn } from "@/lib/utils";

import { useCreateApiKey } from "@/hooks/api-key";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateApiKeyDialogProps {
  trigger?: ReactElement;
}

export default function CreateApiKeyDialog({
  trigger,
}: CreateApiKeyDialogProps) {
  const t = useTranslations("ApiKeyPage.dialogs.create");
  const tStatus = useTranslations("ApiKeyPage.status");
  const tNotifications = useTranslations("ApiKeyPage.notifications");

  const [isOpen, setIsOpen] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState<IApiKeyWithKey | null>(
    null
  );
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [expirationOption, setExpirationOption] =
    useState<string>("no_expiration");

  const { createApiKeyForm, useCreateApiKeyMutation } = useCreateApiKey();

  // Set default values to prevent controlled/uncontrolled input error
  const { handleSubmit, control, reset, formState, setValue } =
    createApiKeyForm;
  const { isSubmitting } = formState;

  const { mutateAsync: createApiKey, isPending } = useCreateApiKeyMutation;

  const onSubmit = async (data: ICreateApiKeyForm) => {
    try {
      const response = await createApiKey(data);

      if (response.success && response.data) {
        setCreatedApiKey(response.data);
        toast.success(tNotifications("created"));
      }
    } catch (error) {
      toast.error(tNotifications("error"));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCreatedApiKey(null);
    setIsKeyVisible(false);
    setExpirationOption("no_expiration");
    reset({
      name: "",
      expires_at: null,
    });
  };

  const getExpirationDate = (option: string): Date | null => {
    const today = new Date();
    switch (option) {
      case "7_days":
        return new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "30_days":
        return new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      case "60_days":
        return new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
      case "90_days":
        return new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
      case "no_expiration":
        return null;
      default:
        return null;
    }
  };

  const handleExpirationChange = (
    option: string,
    fieldOnChange: (value: Date | null) => void
  ) => {
    setExpirationOption(option);
    if (option === "custom") {
      // Keep current field value for custom
      return;
    }
    const expirationDate = getExpirationDate(option);
    fieldOnChange(expirationDate);
  };

  const handleCalendarChange = (
    _value: string | number,
    _e: React.ChangeEventHandler<HTMLSelectElement>
  ) => {
    const _event = {
      target: {
        value: String(_value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    _e(_event);
  };

  const copyToClipboard = async () => {
    if (!createdApiKey?.key) return;

    try {
      await navigator.clipboard.writeText(createdApiKey.key);
      toast.success(tNotifications("copied"));
    } catch (err) {
      toast.error(tNotifications("copyError"));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  // If API key was created successfully, show the key display
  if (createdApiKey) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        {trigger && (
          <DialogTrigger asChild onClick={() => setIsOpen(true)}>
            {cloneElement(trigger)}
          </DialogTrigger>
        )}
        <DialogContent className="!min-w-[500px] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("success.title")}</DialogTitle>
            <DialogDescription>{t("success.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Warning Notice */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex">
                <div className="">
                  <h3 className="text-sm font-medium text-amber-800">
                    {t("warning.title")}
                  </h3>
                  <div className="mt-2 text-sm tracking-tight text-amber-700">
                    <p>{t("warning.message")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* API Key Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("form.generatedKey.label")}
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <code className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm">
                    {isKeyVisible ? createdApiKey.key : "•".repeat(32)}
                  </code>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsKeyVisible(!isKeyVisible)}
                >
                  {isKeyVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* API Key Details */}
            <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
              <div>
                <label className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                  {t("form.name.label")}
                </label>
                <p className="mt-1 text-sm font-medium">{createdApiKey.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                  {t("form.expiresAt.label")}
                </label>
                <p className="mt-1 text-sm font-medium">
                  {createdApiKey.expires_at
                    ? formatDate(new Date(createdApiKey.expires_at))
                    : tStatus("never")}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              {t("buttons.done")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Regular form dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild onClick={() => setIsOpen(true)}>
          {cloneElement(trigger)}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <Form {...createApiKeyForm}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.name.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.name.placeholder")}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("form.name.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expiration Date Field */}
            <FormField
              control={control}
              name="expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.expiresAt.label")}</FormLabel>
                  <div className="space-y-2">
                    {/* Expiration Options Select */}
                    <Select
                      value={expirationOption}
                      onValueChange={(value) =>
                        handleExpirationChange(value, field.onChange)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("form.expiresAt.placeholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7_days">
                          {t("form.expirationOptions.7days")} (
                          {formatDate(getExpirationDate("7_days")!)})
                        </SelectItem>
                        <SelectItem value="30_days">
                          {t("form.expirationOptions.30days")} (
                          {formatDate(getExpirationDate("30_days")!)})
                        </SelectItem>
                        <SelectItem value="60_days">
                          {t("form.expirationOptions.60days")} (
                          {formatDate(getExpirationDate("60_days")!)})
                        </SelectItem>
                        <SelectItem value="90_days">
                          {t("form.expirationOptions.90days")} (
                          {formatDate(getExpirationDate("90_days")!)})
                        </SelectItem>
                        <SelectItem value="custom">
                          {t("form.expirationOptions.custom")}
                        </SelectItem>
                        <SelectItem value="no_expiration">
                          {t("form.expirationOptions.noExpiration")}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Custom Date Picker - only show when "custom" is selected */}
                    {expirationOption === "custom" && (
                      <div>
                        <FormLabel className="text-sm font-medium">
                          {t("form.customDate.label")}
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  formatDate(field.value)
                                ) : (
                                  <span>
                                    {t("form.customDate.placeholder")}
                                  </span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-1.5"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              className="rounded-md border-none p-2"
                              classNames={{
                                month_caption: "mx-0",
                              }}
                              captionLayout="dropdown"
                              defaultMonth={new Date()}
                              startMonth={new Date(1980, 6)}
                              hideNavigation
                              initialFocus
                              components={{
                                DropdownNav: (props: DropdownNavProps) => {
                                  return (
                                    <div className="flex w-full items-center gap-2">
                                      {props.children}
                                    </div>
                                  );
                                },
                                Dropdown: (props: DropdownProps) => {
                                  return (
                                    <Select
                                      value={String(props.value)}
                                      onValueChange={(value) => {
                                        if (props.onChange) {
                                          handleCalendarChange(
                                            value,
                                            props.onChange
                                          );
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="h-8 w-fit font-medium first:grow">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                                        {props.options?.map((option) => (
                                          <SelectItem
                                            key={option.value}
                                            value={String(option.value)}
                                            disabled={option.disabled}
                                          >
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  );
                                },
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {t("form.customDate.description")}
                        </p>
                      </div>
                    )}
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting || isPending}
              >
                {t("buttons.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isPending}
                className="min-w-[100px]"
              >
                {isSubmitting || isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t("buttons.creating")}
                  </div>
                ) : (
                  <>{t("buttons.create")}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

