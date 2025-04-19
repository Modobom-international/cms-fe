"use client";

import { useMemo, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { Search } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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

interface Site {
  id: string;
  name: string;
  domain: string;
  description: string | null;
  cloudflare_project_name: string;
  cloudflare_domain_status: string;
  branch: string;
  created_at: string;
  updated_at: string;
  status: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="space-y-3">
          <DialogTitle>{t("Title")}</DialogTitle>
          <DialogDescription>
            {t("Description")}
            <span className="font-semibold text-destructive"> {siteName}</span> {t("Description2")}
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

// Form Schema
const siteFormSchema = (t: any) => z.object({
  name: z
    .string()
    .min(1, t("Validation.Name.Required"))
    .min(3, t("Validation.Name.MinLength"))
    .max(64, t("Validation.Name.MaxLength"))
    .transform(value => value.trim()),
  domain: z
    .string()
    .min(1, t("Validation.Domain.Required"))
    .min(3, t("Validation.Domain.MinLength"))
    .max(253, t("Validation.Domain.MaxLength"))
    .regex(
      /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
      t("Validation.Domain.Invalid")
    ),
});

type SiteFormValues = z.infer<ReturnType<typeof siteFormSchema>>;

function CreateSiteDialog() {
  const t = useTranslations("Studio.Sites.CreateSite");
  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema(t)),
    defaultValues: {
      name: "",
      domain: "",
    },
    mode: "onChange",
  });

  const createSiteMutation = useCreateSite();
  const [open, setOpen] = useState(false);

  const handleCreateSite = async (data: SiteFormValues) => {
    try {
      const trimmedData = {
        ...data,
        name: data.name.trim()
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
      <DialogContent className="sm:max-w-[475px]">
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
                      <span className="text-destructive ml-1">{t("SiteName.Required")}</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("SiteName.Placeholder")}
                        {...field}
                        disabled={createSiteMutation.isPending}
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
                      <span className="text-destructive ml-1">{t("Domain.Required")}</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("Domain.Placeholder")}
                        {...field}
                        disabled={createSiteMutation.isPending}
                      />
                    </FormControl>
                    <p className="text-muted-foreground text-xs">
                      {t("Domain.Helper")}
                    </p>
                    <FormMessage className="text-destructive text-sm font-medium" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
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

const paginateData = (
  data: any[],
  currentPage: number,
  pageSize: number,
  searchTerm: string
) => {
  // First, filter the data based on search term
  const filteredData = searchTerm
    ? data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.domain.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : data;

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

  // Apply pagination to the data
  const sitesData = useMemo(() => {
    if (!sitesResponse?.data)
      return { data: [], meta: { from: 0, to: 0, total: 0, last_page: 1 } };

    return paginateData(
      sitesResponse.data,
      currentPage,
      pageSize,
      debouncedSearch
    );
  }, [sitesResponse?.data, currentPage, pageSize, debouncedSearch]);

  const updateSiteMutation = useUpdateSite(editingSite?.id || "");
  const deleteSiteMutation = useDeleteSite();

  const handleUpdateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;

    try {
      const updatedSite = {
        ...editingSite,
        name: editingSite.name.trim()
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
      await toast.promise(
        deleteSiteMutation.mutateAsync(deleteDialog.siteId),
        {
          loading: t("DeleteSite.Deleting"),
          success: t("DeleteSite.Success"),
          error: t("DeleteSite.Error"),
        }
      );
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("Title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("Description")}
          </p>
        </div>
        <CreateSiteDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Table.Name")}</CardTitle>
          <CardDescription>
            {t("Table.Description")}
          </CardDescription>
        </CardHeader>
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
                    <TableHead>{t("Table.Description")}</TableHead>
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
                      <TableCell className="max-w-[200px] truncate">
                        {site.description || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center ">
                          <span className="capitalize">{site.cloudflare_domain_status}</span>
                          <span className="text-muted-foreground text-xs ">
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
                          <span className="text-muted-foreground text-xs">{site.user.email}</span>
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
                          {editingSite?.id === site.id ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateSite}
                                disabled={updateSiteMutation.isPending}
                              >
                                {updateSiteMutation.isPending
                                  ? t("Table.Saving")
                                  : t("Table.Save")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingSite(null)}
                              >
                                {t("Table.Cancel")}
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingSite(site)}
                            >
                              {t("Table.Edit")}
                            </Button>
                          )}
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
    </div>
  );
}
