"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import * as z from "zod";
import { LANGUAGES } from "@/constants/languages";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Search } from "lucide-react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Site,
  SiteFormSchema,
  SiteFormValues,
  UpdateSiteFormSchema,
  UpdateSiteFormValues,
} from "@/types/site.type";

import { cn } from "@/lib/utils";

import { useGetAvailableDomain, useGetDomainList } from "@/hooks/domain";
import {
  useCreateSite,
  useDeleteSite,
  useGetSites,
  useUpdateSite,
} from "@/hooks/sites";
import { useDebounce } from "@/hooks/use-debounce";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Spinner } from "@/components/global/spinner";

interface UserFilter {
  email: string;
  name: string;
}

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  siteName: string;
  isDeleting: boolean;
}

function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  siteName,
  isDeleting,
}: DeleteDialogProps) {
  const t = useTranslations("Studio.Sites.DeleteSite");
  const [confirmationText, setConfirmationText] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed top-[50%] left-[50%] w-full translate-x-[-50%] translate-y-[-50%] sm:max-w-[400px]">
        <DialogHeader className="space-y-3">
          <DialogTitle>{t("Title")}</DialogTitle>
          <DialogDescription>
            {t("Description")}
            <span className="text-destructive font-semibold">
              {" "}
              {siteName}
            </span>{" "}
            {t("Description2")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {t("Confirmation.Text")}{" "}
              <span className="text-destructive font-mono font-medium">
                {siteName}
              </span>{" "}
              {t("Confirmation.Text2")}
            </p>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={t("Confirmation.Placeholder")}
              className="w-full"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={confirmationText !== siteName || isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Spinner />
                {t("Deleting")}
              </>
            ) : (
              t("Delete")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateSiteDialog() {
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
          <DialogTitle>{t("Title")}</DialogTitle>
          <DialogDescription>{t("Description")}</DialogDescription>
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
                    <FormLabel>
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
                    <FormLabel>
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
                    <FormLabel>
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

function UpdateLanguageDialog({
  site,
  isOpen,
  onClose,
}: {
  site: Site;
  isOpen: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("Studio.Sites");
  const updateSiteMutation = useUpdateSite(site.id);

  const form = useForm<UpdateSiteFormValues>({
    resolver: zodResolver(UpdateSiteFormSchema(t)),
    defaultValues: {
      language: site.language,
    },
  });

  const handleSubmit = async (data: UpdateSiteFormValues) => {
    try {
      await toast.promise(updateSiteMutation.mutateAsync(data), {
        loading: t("UpdateLanguage.Loading"),
        success: t("UpdateLanguage.Success"),
        error: t("UpdateLanguage.Error"),
      });
      onClose();
    } catch (err) {
      console.error("Error updating site language:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed top-[50%] left-[50%] w-full translate-x-[-50%] translate-y-[-50%] sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t("UpdateLanguage.Title")}</DialogTitle>
          <DialogDescription>
            {t("UpdateLanguage.Description", { siteName: site.name })}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>
                    {t("UpdateLanguage.Label")}
                    <span className="text-destructive ml-1">
                      {t("UpdateLanguage.Required")}
                    </span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={updateSiteMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("UpdateLanguage.Placeholder")}
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
                  <FormMessage className="text-destructive text-sm font-medium" />
                </FormItem>
              )}
            />
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                {t("UpdateLanguage.Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={updateSiteMutation.isPending}
                className="w-full sm:w-auto"
              >
                {updateSiteMutation.isPending ? (
                  <>
                    <Spinner />
                    {t("UpdateLanguage.Saving")}
                  </>
                ) : (
                  t("UpdateLanguage.Save")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const paginateData = (
  data: Site[],
  currentPage: number,
  pageSize: number,
  searchTerm: string,
  selectedUser: string
) => {
  // First, filter the data based on search term and selected user
  const filteredData = data.filter((item) => {
    const matchesSearch = searchTerm
      ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.domain.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesUser =
      selectedUser && selectedUser !== "all"
        ? item.user.email === selectedUser
        : true;

    return matchesSearch && matchesUser;
  });

  // Calculate pagination values
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Slice the data for current page
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    meta: {
      from: totalItems === 0 ? 0 : startIndex + 1,
      to: Math.min(endIndex, totalItems),
      total: totalItems,
      last_page: totalPages,
    },
  };
};

export default function SitesManagementPage() {
  const t = useTranslations("Studio.Sites");
  const router = useRouter();
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    siteId: string;
    siteName: string;
  }>({
    isOpen: false,
    siteId: "",
    siteName: "",
  });

  // Add pagination and search state
  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1)
  );
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(10)
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );

  const debouncedSearch = useDebounce(search, 500);

  const { data: sitesResponse, isLoading } = useGetSites();

  const [selectedUser, setSelectedUser] = useQueryState(
    "user",
    parseAsString.withDefault("all")
  );

  // Get unique users from sites data
  const uniqueUsers = useMemo(() => {
    if (!sitesResponse?.data) return [];
    const users: UserFilter[] = sitesResponse.data.map((site: Site) => ({
      email: site.user.email,
      name: site.user.name,
    }));
    return Array.from(
      new Map(users.map((user) => [user.email, user])).values()
    ) as UserFilter[];
  }, [sitesResponse?.data]);

  // Apply pagination to the data
  const sitesData = useMemo(() => {
    if (!sitesResponse?.data)
      return { data: [], meta: { from: 0, to: 0, total: 0, last_page: 1 } };

    return paginateData(
      sitesResponse.data,
      currentPage,
      pageSize,
      debouncedSearch,
      selectedUser
    );
  }, [
    sitesResponse?.data,
    currentPage,
    pageSize,
    debouncedSearch,
    selectedUser,
  ]);

  const updateSiteMutation = useUpdateSite(editingSite?.id || "");
  const deleteSiteMutation = useDeleteSite();

  const handleUpdateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;

    try {
      const updatedSite = {
        ...editingSite,
        name: editingSite.name.trim(),
      };

      await toast.promise(updateSiteMutation.mutateAsync(updatedSite), {
        loading: t("CreateSite.Loading"),
        success: t("CreateSite.Success"),
        error: t("CreateSite.Error"),
      });
      setEditingSite(null);
    } catch (err) {
      console.error("Error updating site:", err);
    }
  };

  const handleDeleteClick = (siteId: string, siteName: string) => {
    setDeleteDialog({
      isOpen: true,
      siteId,
      siteName,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await toast.promise(deleteSiteMutation.mutateAsync(deleteDialog.siteId), {
        loading: t("DeleteSite.Deleting"),
        success: t("DeleteSite.Success"),
        error: t("DeleteSite.Error"),
      });
      setDeleteDialog({
        isOpen: false,
        siteId: "",
        siteName: "",
      });
    } catch (err) {
      console.error("Error deleting site:", err);
    }
  };

  // Handle pagination
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(sitesData.meta.last_page, prev + 1));
    
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    
  };

  const [updateLanguageDialog, setUpdateLanguageDialog] = useState<{
    isOpen: boolean;
    site: Site | null;
  }>({
    isOpen: false,
    site: null,
  });

  return (
    <div className="container space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("Title")}
          </h1>
          <p className="text-muted-foreground text-sm">{t("Description")}</p>
        </div>
        <CreateSiteDialog />
      </div>

      <Card>
        <CardContent>
          {/* Add Search Bar */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  placeholder={t("Table.Search")}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="pl-8"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Select
                  value={selectedUser}
                  onValueChange={(value) => {
                    setSelectedUser(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t("Table.FilterByOwner")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("Table.AllOwners")}</SelectItem>
                    {uniqueUsers.map((user: UserFilter) => (
                      <SelectItem key={user.email} value={user.email}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label htmlFor="pageSize">{t("Table.Showing")}:</Label>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(parseInt(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 30, 50].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table content */}
          {isLoading ? (
            <div className="text-muted-foreground py-8 text-center">
              <Spinner />
              <p className="mt-2">{t("Table.Loading")}</p>
            </div>
          ) : !sitesData?.data || sitesData.data.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              {t("Table.NoSites")}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Table.Name")}</TableHead>
                    <TableHead>{t("Table.Domain")}</TableHead>
                    {/* <TableHead>{t("Table.Description")}</TableHead> */}
                    <TableHead>{t("Table.Language")}</TableHead>
                    <TableHead>{t("Table.Cloudflare")}</TableHead>
                    <TableHead>{t("Table.Status")}</TableHead>
                    <TableHead>{t("Table.Owner")}</TableHead>
                    <TableHead>{t("Table.CreatedAt")}</TableHead>
                    {/* <TableHead>{t("Table.UpdatedAt")}</TableHead> */}
                    <TableHead>{t("Table.Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sitesData.data.map((site: Site) => (
                    <TableRow key={site.id}>
                      <TableCell className="font-medium">{site.name}</TableCell>
                      <TableCell>{site.domain}</TableCell>
                      {/* <TableCell className="max-w-[200px] truncate">
                          {site.description || "-"}
                        </TableCell> */}
                      <TableCell>
                        {LANGUAGES.find(
                          (language) => language.code === site.language
                        )?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center">
                          <span className="capitalize">
                            {site.cloudflare_domain_status}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            ({site.cloudflare_project_name})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{site.status}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{site.user.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {site.user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(site.created_at).toLocaleDateString()}
                      </TableCell>
                      {/* <TableCell>
                        {new Date(site.updated_at).toLocaleDateString()}
                      </TableCell> */}
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link
                            href={`/studio/sites/${site.id}/pages`}
                            className={buttonVariants({
                              variant: "default",
                              size: "sm",
                            })}
                          >
                            {t("Table.Pages")}
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setUpdateLanguageDialog({ isOpen: true, site })
                            }
                          >
                            {t("Table.Language")}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteClick(site.id, site.name)
                            }
                          >
                            {t("Table.Delete")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="mt-4 flex items-center justify-between px-2">
                <div className="text-muted-foreground text-sm">
                  {t("Table.Showing", {
                    from: sitesData.meta.from,
                    to: sitesData.meta.to,
                    total: sitesData.meta.total,
                  })}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    {t("Table.Previous")}
                  </Button>
                  <div className="text-sm">
                    {t("Table.Page", {
                      current: currentPage,
                      total: sitesData.meta.last_page,
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === sitesData.meta.last_page}
                  >
                    {t("Table.Next")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, siteId: "", siteName: "" })
        }
        onConfirm={handleDeleteConfirm}
        siteName={deleteDialog.siteName}
        isDeleting={deleteSiteMutation.isPending}
      />

      {updateLanguageDialog.site && (
        <UpdateLanguageDialog
          site={updateLanguageDialog.site}
          isOpen={updateLanguageDialog.isOpen}
          onClose={() => setUpdateLanguageDialog({ isOpen: false, site: null })}
        />
      )}
    </div>
  );
}
