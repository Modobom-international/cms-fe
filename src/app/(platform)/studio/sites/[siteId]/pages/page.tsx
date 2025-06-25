"use client";

import { useMemo, useState } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { env } from "@/env";
import { ChevronRight, Home, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useDeletePage, useGetPages } from "@/hooks/pages";
import { useGetSiteById } from "@/hooks/sites";
import { useDebounce } from "@/hooks/use-debounce";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  CreatePageDialog,
  DeletePageDialog,
  PreviewPageDialog,
  TrackingScriptDialog,
} from "@/components/admin/pages/dialogs";
import { Spinner } from "@/components/global/spinner";

interface Page {
  id: string;
  name: string;
  slug: string;
  updated_at: string;
}

interface Site {
  id: string;
  name: string;
  domain: string;
}

export default function PagesPage() {
  const t = useTranslations("Studio.Sites.Pages");
  const params = useParams();
  const router = useRouter();
  const { data: siteData } = useGetSiteById(params.siteId?.toString() || "");
  const { data: pagesData, isLoading } = useGetPages(
    params.siteId?.toString() || ""
  );
  const deletePageMutation = useDeletePage();

  const site = siteData?.data as Site | undefined;
  const pages = pagesData?.data as Page[] | undefined;

  // Add search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    pageId: string;
    pageName: string;
  }>({
    isOpen: false,
    pageId: "",
    pageName: "",
  });

  const [previewDialogState, setPreviewDialogState] = useState<{
    isOpen: boolean;
    previewUrl: string;
    pageName: string;
  }>({
    isOpen: false,
    previewUrl: "",
    pageName: "",
  });

  // Filter pages based on search query
  const filteredPages = useMemo(() => {
    if (!pages) return [];
    if (!debouncedSearch) return pages;

    const searchLower = debouncedSearch.toLowerCase();
    return pages.filter(
      (page) =>
        page.name.toLowerCase().includes(searchLower) ||
        page.slug.toLowerCase().includes(searchLower)
    );
  }, [pages, debouncedSearch]);

  const handleDeletePage = async () => {
    try {
      await toast.promise(
        deletePageMutation.mutateAsync({
          pageId: parseInt(deleteDialogState.pageId),
          siteId: params.siteId?.toString() || "",
        }),
        {
          loading: t("Delete.Toast.Loading"),
          success: t("Delete.Toast.Success"),
          error: t("Delete.Toast.Error"),
        }
      );
      setDeleteDialogState({ isOpen: false, pageId: "", pageName: "" });
    } catch (err) {
      console.error("Error deleting page:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <Link href="/studio/sites" className="hover:text-foreground">
            {t("Breadcrumb")}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>{site?.name || ""}</span>
        </nav>

        {/* Title and Actions Section */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("Title", { siteName: site?.domain || "" })}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("Description", { siteName: site?.name || "" })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CreatePageDialog site={site?.domain || ""} />
          </div>
        </div>
      </div>

      <div className="pt-6">
        {/* Add Search Bar */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder={t("List.Search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        {/* Table content */}
        {isLoading ? (
          <div className="text-muted-foreground py-8 text-center">
            <Spinner />
            <p className="mt-2">{t("List.Loading")}</p>
          </div>
        ) : !filteredPages || filteredPages.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            {debouncedSearch ? t("List.NoSearchResults") : t("List.NoPages")}
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-gray-200 hover:bg-white">
                  <TableHead className="w-[250px] py-3 font-medium text-gray-700">
                    {t("List.Table.Name")}
                  </TableHead>
                  <TableHead className="w-[200px] py-3 font-medium text-gray-700">
                    {t("List.Table.Slug")}
                  </TableHead>
                  <TableHead className="w-[150px] py-3 font-medium text-gray-700">
                    {t("List.Table.LastUpdated")}
                  </TableHead>
                  <TableHead className="w-[300px] py-3 text-right font-medium text-gray-700">
                    {t("List.Table.Actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page: Page) => (
                  <TableRow
                    key={page.id}
                    className="border-border hover:bg-muted/50 border-b transition-colors"
                  >
                    <TableCell className="py-3">
                      <span className="text-primary font-medium">
                        {page.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3 font-mono text-sm">
                      {page.slug}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3 text-sm">
                      {new Date(page.updated_at || "").toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/editor/${params.siteId}/${page.slug}?pageId=${page.id}`
                            )
                          }
                        >
                          {t("List.Table.Edit")}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() =>
                            setPreviewDialogState({
                              isOpen: true,
                              previewUrl: `${env.NEXT_PUBLIC_BACKEND_URL}/storage/exports/${site?.name}/${page.slug}/index.html`,
                              pageName: page.name,
                            })
                          }
                        >
                          {t("List.Table.PreviewExported")}
                        </Button>
                        <TrackingScriptDialog
                          pageId={page.id}
                          pageName={page.name}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() =>
                            setDeleteDialogState({
                              isOpen: true,
                              pageId: page.id,
                              pageName: page.name,
                            })
                          }
                        >
                          {t("List.Table.Delete")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() =>
                            window.open(
                              `https://${site?.domain}/${page.slug}`,
                              "_blank"
                            )
                          }
                        >
                          {t("List.Table.View")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <DeletePageDialog
        isOpen={deleteDialogState.isOpen}
        onClose={() =>
          setDeleteDialogState({ isOpen: false, pageId: "", pageName: "" })
        }
        onConfirm={handleDeletePage}
        pageName={deleteDialogState.pageName}
        isDeleting={deletePageMutation.isPending}
      />

      <PreviewPageDialog
        isOpen={previewDialogState.isOpen}
        onClose={() =>
          setPreviewDialogState({
            isOpen: false,
            previewUrl: "",
            pageName: "",
          })
        }
        previewUrl={previewDialogState.previewUrl}
        pageName={previewDialogState.pageName}
      />
    </div>
  );
}
