"use client";

import { useState } from "react";

import { LANGUAGES } from "@/constants/languages";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { SiteFormSchema, SiteFormValues } from "@/types/site.type";

import { cn } from "@/lib/utils";

import { useGetAvailableDomain } from "@/hooks/domain";
import { useCreateSite } from "@/hooks/sites";
import { useDebounce } from "@/hooks/use-debounce";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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

import { Spinner } from "@/components/global/spinner";

export default function CreateSiteDialog() {
  const t = useTranslations("Studio.Sites.CreateSite");
  const [openDomainSelect, setOpenDomainSelect] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");
  const debouncedSearchValue = useDebounce(searchInputValue, 500);

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(SiteFormSchema(t)),
    defaultValues: {
      name: "",
      domain: "",
      language: "en",
    },
    mode: "onChange",
  });

  // Fetch domain list
  const {
    data: domainResponse = { data: { data: [] } },
    isLoading: isLoadingDomains,
  } = useGetAvailableDomain(1, 10, debouncedSearchValue);

  const domains =
    "data" in domainResponse && domainResponse.data?.data
      ? domainResponse.data.data
      : [];

  const handleDomainSearchChange = (value: string) => {
    setSearchInputValue(value);
  };

  const handleDomainChange = (currentValue: string) => {
    form.setValue("domain", currentValue);
    setOpenDomainSelect(false);
  };

  const createSiteMutation = useCreateSite();
  const [open, setOpen] = useState(false);

  const handleCreateSite = async (data: SiteFormValues) => {
    try {
      const trimmedData = {
        ...data,
        name: data.name.trim(),
        language: data.language,
      };

      await toast.promise(createSiteMutation.mutateAsync(trimmedData), {
        loading: t("Loading"),
        success: t("Success"),
        error: t("Error"),
      });
      form.reset();
      setOpen(false);
    } catch (err) {
      console.error("Error creating site:", err);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer gap-2">
          <PlusIcon className="h-4 w-4" />
          {t("Button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed top-[50%] left-[50%] w-full translate-x-[-50%] translate-y-[-50%] sm:max-w-1/2">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t("Title")}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t("Description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateSite)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-foreground">
                      {t("SiteName.Label")}
                      <span className="text-destructive ml-1">
                        {t("SiteName.Required")}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("SiteName.Placeholder")}
                        {...field}
                        disabled={createSiteMutation.isPending}
                        className="w-full"
                      />
                    </FormControl>
                    <p className="text-muted-foreground text-xs">
                      {t("SiteName.Helper")}
                    </p>
                    <FormMessage className="text-destructive text-sm font-medium" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-foreground">
                      {t("Domain.Label")}
                      <span className="text-destructive ml-1">
                        {t("Domain.Required")}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Popover
                        open={openDomainSelect}
                        onOpenChange={setOpenDomainSelect}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openDomainSelect}
                            className="w-full justify-between"
                            disabled={
                              isLoadingDomains || createSiteMutation.isPending
                            }
                            type="button"
                          >
                            <span className="truncate">
                              {field.value
                                ? domains.find((d) => d.domain === field.value)
                                    ?.domain || field.value
                                : t("Domain.Placeholder")}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[calc(100vw-2rem)] p-0 sm:w-[24rem]"
                          side="bottom"
                          align="start"
                        >
                          <Command>
                            <div className="relative">
                              <CommandInput
                                placeholder={t("Domain.SearchPlaceholder")}
                                className="h-9"
                                onValueChange={handleDomainSearchChange}
                              />
                            </div>
                            <CommandList>
                              <CommandEmpty>
                                {isLoadingDomains ? (
                                  <div className="py-6">
                                    <Spinner noPadding />
                                  </div>
                                ) : (
                                  t("Domain.NoDomains")
                                )}
                              </CommandEmpty>
                              <CommandGroup>
                                {isLoadingDomains && domains.length === 0 ? (
                                  <div className="flex items-center justify-center py-6">
                                    <Spinner noPadding />
                                  </div>
                                ) : (
                                  domains.map((domainItem) => (
                                    <CommandItem
                                      key={domainItem.id}
                                      value={domainItem.domain}
                                      onSelect={handleDomainChange}
                                    >
                                      <span className="truncate">
                                        {domainItem.domain}
                                      </span>
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          field.value === domainItem.domain
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <p className="text-muted-foreground text-xs">
                      {t("Domain.Helper")}
                    </p>
                    <FormMessage className="text-destructive text-sm font-medium" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-foreground">
                      {t("Language.Label")}
                      <span className="text-destructive ml-1">
                        {t("Language.Required")}
                      </span>
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={createSiteMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t("Language.Placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGES.map((language) => (
                          <SelectItem key={language.code} value={language.code}>
                            {language.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-xs">
                      {t("Language.Helper")}
                    </p>
                    <FormMessage className="text-destructive text-sm font-medium" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                disabled={createSiteMutation.isPending}
                className="w-full"
              >
                {createSiteMutation.isPending ? (
                  <>
                    <Spinner />
                    {t("Loading")}
                  </>
                ) : (
                  t("Submit")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
