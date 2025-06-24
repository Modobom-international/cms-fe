"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import { LANGUAGES } from "@/constants/languages";
import { SiteStatusEnum } from "@/enums/site-status";
import { PlusCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";

import { Site } from "@/types/site.type";

import {
  useActivateSite,
  useDeactivateSite,
  useDeleteSite,
  useGetSites,
} from "@/hooks/sites";
import { useDebounce } from "@/hooks/use-debounce";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/inputs/search-input";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { EmptyTable } from "@/components/data-table/empty-table";
import { Spinner } from "@/components/global/spinner";

import DeleteSiteDialog from "./delete-site-dialog";
import UpdateLanguageDialog from "./update-language-dialog";

interface UserFilter {
  email: string;
  name: string;
}

const paginateData = (
  data: Site[],
  currentPage: number,
  pageSize: number,
  searchTerm: string,
  selectedUser: string,
  selectedStatus: string
) => {
  // First, filter the data based on search term, selected user and status
  const filteredData = data.filter((item) => {
    const matchesSearch = searchTerm
      ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.domain.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesUser =
      selectedUser && selectedUser !== "all"
        ? item.user.email === selectedUser
        : true;

    const matchesStatus =
      selectedStatus && selectedStatus !== "all"
        ? item.status.toLowerCase() === selectedStatus.toLowerCase()
        : true;

    return matchesSearch && matchesUser && matchesStatus;
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

export default function SitesDataTable() {
  const t = useTranslations("Studio.Sites");

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

  // Local state for filters
  const [localSearch, setLocalSearch] = useState(search);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [ownerSearchTerm, setOwnerSearchTerm] = useState("");
  const [isOwnerPopoverOpen, setIsOwnerPopoverOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);
  const [processingStatusSiteId, setProcessingStatusSiteId] = useState<
    string | null
  >(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data: sitesResponse, isLoading } = useGetSites();

  const [selectedUser, setSelectedUser] = useQueryState(
    "user",
    parseAsString.withDefault("all")
  );
  const [selectedStatus, setSelectedStatus] = useQueryState(
    "status",
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

  // Status filter options
  const statusOptions = [
    { value: SiteStatusEnum.ACTIVE, label: t("Table.Status.Active") },
    { value: SiteStatusEnum.INACTIVE, label: t("Table.Status.Inactive") },
  ];

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!ownerSearchTerm) return uniqueUsers;
    return uniqueUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(ownerSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(ownerSearchTerm.toLowerCase())
    );
  }, [uniqueUsers, ownerSearchTerm]);

  // Apply pagination to the data
  const sitesData = useMemo(() => {
    if (!sitesResponse?.data)
      return { data: [], meta: { from: 0, to: 0, total: 0, last_page: 1 } };

    return paginateData(
      sitesResponse.data,
      currentPage,
      pageSize,
      debouncedSearch,
      selectedUser,
      selectedStatus
    );
  }, [
    sitesResponse?.data,
    currentPage,
    pageSize,
    debouncedSearch,
    selectedUser,
    selectedStatus,
  ]);

  const deleteSiteMutation = useDeleteSite();
  const activateSiteMutation = useActivateSite();
  const deactivateSiteMutation = useDeactivateSite();

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

  const handleActivateSite = (siteId: string) => {
    setProcessingStatusSiteId(siteId);
    toast.promise(activateSiteMutation.mutateAsync(siteId), {
      loading: t("Table.Activating"),
      success: () => {
        setProcessingStatusSiteId(null);
        return t("Table.ActivateSuccess");
      },
      error: () => {
        setProcessingStatusSiteId(null);
        return t("Table.ActivateError");
      },
    });
  };

  const handleDeactivateSite = (siteId: string) => {
    setProcessingStatusSiteId(siteId);
    toast.promise(deactivateSiteMutation.mutateAsync(siteId), {
      loading: t("Table.Deactivating"),
      success: () => {
        setProcessingStatusSiteId(null);
        return t("Table.DeactivateSuccess");
      },
      error: () => {
        setProcessingStatusSiteId(null);
        return t("Table.DeactivateError");
      },
    });
  };

  const handleToggleStatus = (siteId: string, currentStatus: string) => {
    const isActive = currentStatus.toLowerCase() === SiteStatusEnum.ACTIVE;
    if (isActive) {
      handleDeactivateSite(siteId);
    } else {
      handleActivateSite(siteId);
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

  // Apply filters
  const applyFilters = () => {
    setSearch(localSearch);
    setSelectedUser(selectedUsers.length > 0 ? selectedUsers[0] : "all");
    setSelectedStatus(
      selectedStatuses.length > 0 ? selectedStatuses[0] : "all"
    );
    setCurrentPage(1);
    setIsOwnerPopoverOpen(false); // Close the popover after applying filters
    setIsStatusPopoverOpen(false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setLocalSearch("");
    setSearch("");
    setSelectedUsers([]);
    setSelectedUser("all");
    setSelectedStatuses([]);
    setSelectedStatus("all");
    setOwnerSearchTerm("");
    setCurrentPage(1);
    setIsOwnerPopoverOpen(false);
    setIsStatusPopoverOpen(false);
  };

  // Remove specific filter
  const removeOwnerFilter = () => {
    setSelectedUsers([]);
    setSelectedUser("all");
    setCurrentPage(1);
  };

  const removeStatusFilter = () => {
    setSelectedStatuses([]);
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  // Handle user filter changes
  const handleUserChange = (userEmail: string, checked: boolean) => {
    setSelectedUsers(checked ? [userEmail] : []);
  };

  const handleStatusChange = (statusValue: string, checked: boolean) => {
    setSelectedStatuses(checked ? [statusValue] : []);
  };

  const isDataEmpty = !sitesData?.data || sitesData.data.length === 0;

  return (
    <div className="flex flex-col">
      {/* Filters Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 items-end justify-end gap-4 md:grid-cols-3">
          <div>
            <Label
              className="text-foreground mb-2 block text-sm font-medium"
              htmlFor="search"
            >
              {t("Table.Search")}
            </Label>
            <SearchInput
              className="w-full"
              placeholder={t("Table.SearchPlaceholder")}
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setSearch(e.target.value); // Apply search immediately
                setCurrentPage(1); // Reset to first page
              }}
            />
          </div>
        </div>

        {/* Applied Filters Display */}
        {(selectedUser !== "all" || selectedStatus !== "all" || search) && (
          <div className="flex items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {search && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
                >
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {t("Table.Search")}:
                  </span>
                  <span className="max-w-32 truncate">{search}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 rounded-full p-0 text-purple-500 transition-colors hover:bg-purple-100 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-800 dark:hover:text-purple-300"
                    onClick={() => {
                      setLocalSearch("");
                      setSearch("");
                      setCurrentPage(1);
                    }}
                  >
                    <X className="h-2.5 w-2.5" />
                    <span className="sr-only">
                      {t("Table.RemoveSearchFilter")}
                    </span>
                  </Button>
                </Badge>
              )}
              {selectedUser !== "all" && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
                >
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {t("Table.FilterByOwner")}:
                  </span>
                  <span className="max-w-32 truncate">
                    {uniqueUsers.find((u) => u.email === selectedUser)?.name ||
                      selectedUser}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 rounded-full p-0 text-purple-500 transition-colors hover:bg-purple-100 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-800 dark:hover:text-purple-300"
                    onClick={removeOwnerFilter}
                  >
                    <X className="h-2.5 w-2.5" />
                    <span className="sr-only">
                      {t("Table.RemoveOwnerFilter")}
                    </span>
                  </Button>
                </Badge>
              )}
              {selectedStatus !== "all" && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
                >
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {t("Table.FilterByStatus")}:
                  </span>
                  <span className="max-w-32 truncate">
                    {statusOptions.find((s) => s.value === selectedStatus)
                      ?.label || selectedStatus}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 rounded-full p-0 text-purple-500 transition-colors hover:bg-purple-100 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-800 dark:hover:text-purple-300"
                    onClick={removeStatusFilter}
                  >
                    <X className="h-2.5 w-2.5" />
                    <span className="sr-only">
                      {t("Table.RemoveStatusFilter")}
                    </span>
                  </Button>
                </Badge>
              )}
            </div>
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground h-7 px-3 text-xs font-medium transition-all duration-200"
              >
                {t("Table.ClearAllFilters")}
              </Button>
            </div>
          </div>
        )}

        {/* Filter Tags Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Owner Filter */}
          <div>
            <Popover
              open={isOwnerPopoverOpen}
              onOpenChange={setIsOwnerPopoverOpen}
            >
              <PopoverTrigger asChild>
                <span className="border-border text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2.5 py-0.5 text-sm font-medium transition-colors">
                  <PlusCircle className="size-3.5" />
                  {t("Table.FilterByOwner")}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start" sideOffset={4}>
                <div className="flex max-h-96 flex-col">
                  <div className="px-3 pt-3 pb-2">
                    <h3 className="text-foreground mb-2 text-sm font-medium">
                      {t("Table.FilterByOwnerTitle")}
                    </h3>
                    <Input
                      placeholder={t("Table.SearchOwners")}
                      value={ownerSearchTerm}
                      onChange={(e) => setOwnerSearchTerm(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <ScrollArea className="h-60">
                    <div className="px-3 pb-2">
                      {filteredUsers.length > 0 ? (
                        <div className="space-y-2">
                          {filteredUsers.map((user: UserFilter) => (
                            <div
                              key={user.email}
                              className="flex items-start space-x-2 py-1"
                            >
                              <Checkbox
                                id={user.email}
                                checked={selectedUsers.includes(user.email)}
                                onCheckedChange={(checked) =>
                                  handleUserChange(user.email, checked === true)
                                }
                                className="mt-0.5"
                              />
                              <label
                                htmlFor={user.email}
                                className="text-foreground min-w-0 flex-1 cursor-pointer text-sm"
                              >
                                <div className="flex flex-col">
                                  <span className="truncate font-medium">
                                    {user.name}
                                  </span>
                                  <span className="text-muted-foreground truncate text-xs">
                                    {user.email}
                                  </span>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-muted-foreground py-8 text-center text-sm">
                          {t("Table.NoOwnersFound")}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="border-border mt-auto border-t p-3">
                    <Button onClick={applyFilters} className="w-full" size="sm">
                      {t("Table.ApplyFilter")}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Status Filter */}
          <div>
            <Popover
              open={isStatusPopoverOpen}
              onOpenChange={setIsStatusPopoverOpen}
            >
              <PopoverTrigger asChild>
                <span className="border-border text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2.5 py-0.5 text-sm font-medium transition-colors">
                  <PlusCircle className="size-3.5" />
                  {t("Table.FilterByStatus")}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start" sideOffset={4}>
                <div className="flex max-h-96 flex-col">
                  <div className="px-3 pt-3 pb-2">
                    <h3 className="text-foreground mb-2 text-sm font-medium">
                      {t("Table.FilterByStatusTitle")}
                    </h3>
                  </div>
                  <ScrollArea className="h-60">
                    <div className="px-3 pb-2">
                      <div className="space-y-2">
                        {statusOptions.map((status) => (
                          <div
                            key={status.value}
                            className="flex items-start space-x-2 py-1"
                          >
                            <Checkbox
                              id={status.value}
                              checked={selectedStatuses.includes(status.value)}
                              onCheckedChange={(checked) =>
                                handleStatusChange(
                                  status.value,
                                  checked === true
                                )
                              }
                              className="mt-0.5"
                            />
                            <label
                              htmlFor={status.value}
                              className="text-foreground min-w-0 flex-1 cursor-pointer text-sm"
                            >
                              <span className="truncate font-medium">
                                {status.label}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="border-border mt-auto border-t p-3">
                    <Button onClick={applyFilters} className="w-full" size="sm">
                      {t("Table.ApplyFilter")}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="mt-6 flex-grow">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : isDataEmpty ? (
          <EmptyTable />
        ) : (
          <div className="flex flex-col">
            <div className="relative w-full overflow-auto">
              <Table className="w-full">
                <TableHeader className="bg-background dark:bg-card sticky top-0 z-10">
                  <TableRow className="border-border hover:bg-muted/50 border-b">
                    <TableHead className="text-foreground w-[200px] py-3 font-medium">
                      {t("Table.Name")}
                    </TableHead>
                    <TableHead className="text-foreground w-[250px] py-3 font-medium">
                      {t("Table.Domain")}
                    </TableHead>
                    <TableHead className="text-foreground w-[150px] py-3 font-medium">
                      {t("Table.Language")}
                    </TableHead>
                    <TableHead className="text-foreground w-[200px] py-3 font-medium">
                      {t("Table.Owner")}
                    </TableHead>
                    <TableHead className="text-foreground w-[150px] py-3 font-medium">
                      {t("Table.CreatedAt")}
                    </TableHead>
                    <TableHead className="text-foreground w-[100px] py-3 text-center font-medium">
                      {t("Table.Status.Header")}
                    </TableHead>
                    <TableHead className="text-foreground w-[200px] py-3 font-medium">
                      {t("Table.Actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sitesData.data.map((site: Site) => (
                    <TableRow
                      key={site.id}
                      className="border-border hover:bg-muted/50 group border-b transition-colors"
                    >
                      <TableCell className="py-3">
                        <span className="text-foreground font-medium">
                          {site.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground py-3 text-sm">
                        {site.domain}
                      </TableCell>
                      <TableCell className="text-foreground py-3 text-sm">
                        {LANGUAGES.find(
                          (language) => language.code === site.language
                        )?.name || "-"}
                      </TableCell>
                      <TableCell className="text-foreground py-3 text-sm">
                        <div className="flex flex-col">
                          <span>{site.user.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {site.user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground py-3 text-sm">
                        {new Date(site.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center justify-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="relative flex items-center">
                              <Switch
                                checked={
                                  site.status.toLowerCase() ===
                                  SiteStatusEnum.ACTIVE
                                }
                                onCheckedChange={() =>
                                  handleToggleStatus(site.id, site.status)
                                }
                                disabled={processingStatusSiteId === site.id}
                                className={`data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 ${processingStatusSiteId === site.id ? "opacity-60" : ""} `}
                              />
                              {processingStatusSiteId === site.id && (
                                <div className="absolute -right-6 flex items-center">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              {processingStatusSiteId === site.id ? (
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                  {site.status.toLowerCase() ===
                                  SiteStatusEnum.ACTIVE
                                    ? t("Table.Deactivating")
                                    : t("Table.Activating")}
                                </span>
                              ) : site.status.toLowerCase() ===
                                SiteStatusEnum.ACTIVE ? (
                                <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                  {t("Table.Status.Active")}
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                  {t("Table.Status.Inactive")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-7 px-2 text-xs"
                          >
                            <Link href={`/studio/sites/${site.id}/pages`}>
                              {t("Table.Pages")}
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setUpdateLanguageDialog({
                                isOpen: true,
                                site,
                              })
                            }
                            className="h-7 px-2 text-xs"
                          >
                            {t("Table.Language")}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteClick(site.id, site.name)
                            }
                            className="h-7 px-2 text-xs"
                          >
                            {t("Table.Delete")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Improved Pagination Section */}
            <div className="border-border bg-background dark:bg-card sticky bottom-0 mt-auto border-t">
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {t("Table.Showing")}:
                  </span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(parseInt(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="border-border h-8 w-auto text-sm">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent className="text-sm">
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 text-sm font-medium"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    {t("Table.Previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 text-sm font-medium"
                    onClick={handleNextPage}
                    disabled={currentPage === sitesData.meta.last_page}
                  >
                    {t("Table.Next")}
                  </Button>
                </div>
              </div>

              <div className="border-border bg-muted text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-xs">
                <div>
                  {t("Table.Showing")} {sitesData.meta.from}-{sitesData.meta.to}{" "}
                  {t("Table.Of")} {sitesData.meta.total} {t("Table.Results")}
                </div>
                <div>
                  {t("Table.Page", {
                    current: currentPage,
                    total: sitesData.meta.last_page,
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <DeleteSiteDialog
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
