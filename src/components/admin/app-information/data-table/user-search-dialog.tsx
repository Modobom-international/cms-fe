"use client";

import { useMemo, useState } from "react";

import { Activity, AppWindow, Clock, Search, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { formatDateTime } from "@/lib/utils";

import { useGetAppInformationByUserId } from "@/hooks/app-infomation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Spinner } from "@/components/global/spinner";

export function UserSearchDialog() {
  const t = useTranslations("AppInformationPage.userSearch");
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [searchedUserId, setSearchedUserId] = useState<string>("");

  // Use the API hook with the searched user ID
  const {
    data: apiResponse,
    isLoading,
    error: queryError,
  } = useGetAppInformationByUserId(searchedUserId);

  // Transform the API response to match UI expectations
  const searchResult = useMemo(() => {
    if (!apiResponse?.success || !apiResponse.data) return null;

    const appNames = Object.keys(apiResponse.data);
    const totalEvents = appNames.reduce((total, appName) => {
      return total + apiResponse.data[appName].length;
    }, 0);

    const apps = appNames.map((appName) => {
      const appData = apiResponse.data[appName];
      const firstRecord = appData[0];

      return {
        app_name: appName,
        app_version: firstRecord?.app_version || "Unknown",
        platform: firstRecord?.platform || "Unknown",
        country: firstRecord?.country || "Unknown",
        events: appData.map((record) => ({
          event_name: record.event_name,
          event_value: record.event_value,
          category: record.category,
          created_at: record.created_at,
        })),
      };
    });

    return {
      user_id: searchedUserId,
      total_events: totalEvents,
      apps: apps,
    };
  }, [apiResponse, searchedUserId]);

  const handleSearch = () => {
    if (!userId.trim()) return;
    setSearchedUserId(userId);
  };

  const handleClear = () => {
    setUserId("");
    setSearchedUserId("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2 text-xs">
          <Search className="size-3.5" />
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] lg:min-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="user-id">{t("form.userId.label")}</Label>
              <Input
                id="user-id"
                placeholder={t("form.userId.placeholder")}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleSearch}
                disabled={!userId.trim() || isLoading}
                className="gap-2"
                isLoading={isLoading}
                loadingText={t("form.searching")}
              >
                <Search className="h-4 w-4" />
                {t("form.search")}
              </Button>
              <Button variant="outline" onClick={handleClear}>
                {t("form.clear")}
              </Button>
            </div>
          </div>

          {/* Error State */}
          {queryError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {t("error.searchFailed")}
            </div>
          )}

          {/* Loading State */}
          {isLoading && searchedUserId && (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          )}

          {/* Search Results */}
          {searchResult && !isLoading && (
            <ScrollArea className="h-[500px] w-full">
              <div className="space-y-6">
                {/* Summary Overview */}
                <div className="space-y-4">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="bg-card rounded-lg border p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm font-medium">
                            {t("results.summary.userId")}
                          </p>
                          <p className="font-mono text-2xl font-bold">
                            {searchResult.user_id}
                          </p>
                        </div>
                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                          <User className="text-primary h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-card rounded-lg border p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm font-medium">
                            {t("results.summary.totalApps")}
                          </p>
                          <p className="text-2xl font-bold">
                            {searchResult.apps.length}
                          </p>
                        </div>
                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                          <AppWindow className="text-primary h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-card rounded-lg border p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm font-medium">
                            {t("results.summary.totalEvents")}
                          </p>
                          <p className="text-2xl font-bold">
                            {searchResult.total_events.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                          <Activity className="text-primary h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apps and Events */}
                {searchResult.apps.length > 0 && (
                  <div className="space-y-5">
                    {searchResult.apps.map((app, appIndex) => (
                      <div
                        key={appIndex}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                      >
                        {/* App Header */}
                        <div className="dark:bg-gray-750 border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                                <AppWindow className="text-primary h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {app.app_name}
                                </h4>
                                <div className="mt-1 flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    v{app.app_version}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {app.platform}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {app.country}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {app.events.length}
                              </div>
                              <div className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                {t("results.events.title")}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Events List */}
                        <div className="p-6">
                          <div className="space-y-3">
                            {app.events.slice(0, 5).map((event, eventIndex) => (
                              <div
                                key={eventIndex}
                                className="group dark:hover:bg-gray-750 rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {event.event_name}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {event.category}
                                      </Badge>
                                    </div>
                                    {event.event_value && (
                                      <div className="pl-4 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="text-gray-500 dark:text-gray-400">
                                          {t("results.events.value")}:
                                        </span>{" "}
                                        <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-700">
                                          {event.event_value}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    <span className="font-mono">
                                      {formatDateTime(
                                        new Date(event.created_at)
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {app.events.length > 5 && (
                              <div className="py-3 text-center">
                                <Badge variant="secondary" className="text-xs">
                                  +{app.events.length - 5} more events
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {searchResult.apps.length === 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                        <Search className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        No Activity Found
                      </h3>
                      <p className="mx-auto max-w-sm text-gray-500 dark:text-gray-400">
                        {t("results.noData")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {/* No data found after search */}
          {searchedUserId && !isLoading && !queryError && !searchResult && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  No Activity Found
                </h3>
                <p className="mx-auto max-w-sm text-gray-500 dark:text-gray-400">
                  {t("results.noData")}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

