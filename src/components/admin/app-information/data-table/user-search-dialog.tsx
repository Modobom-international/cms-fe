"use client";

import { useState } from "react";

import { Activity, AppWindow, Clock, Search, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { formatDateTime } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface UserAppData {
  app_name: string;
  app_version: string;
  platform: string;
  country: string;
  events: {
    event_name: string;
    event_value: string;
    category: string;
    created_at: string;
  }[];
}

interface UserSearchResult {
  user_id: string;
  total_events: number;
  apps: UserAppData[];
}

export function UserSearchDialog() {
  const t = useTranslations("AppInformationPage.userSearch");
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<UserSearchResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!userId.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResult(null);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/app-information/user/${userId}`);
      // const data = await response.json();

      // Mock data for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockResult: UserSearchResult = {
        user_id: userId,
        total_events: 25,
        apps: [
          {
            app_name: "MyApp Mobile",
            app_version: "2.1.0",
            platform: "Android",
            country: "Vietnam",
            events: [
              {
                event_name: "app_open",
                event_value: "main_screen",
                category: "user_engagement",
                created_at: "2024-01-15T10:30:00Z",
              },
              {
                event_name: "button_click",
                event_value: "login_button",
                category: "user_interaction",
                created_at: "2024-01-15T10:31:00Z",
              },
              {
                event_name: "form_submit",
                event_value: "registration_form",
                category: "user_action",
                created_at: "2024-01-15T10:35:00Z",
              },
            ],
          },
          {
            app_name: "MyApp Web",
            app_version: "1.5.2",
            platform: "Web",
            country: "Vietnam",
            events: [
              {
                event_name: "page_view",
                event_value: "dashboard",
                category: "navigation",
                created_at: "2024-01-14T15:20:00Z",
              },
              {
                event_name: "feature_use",
                event_value: "export_data",
                category: "feature_usage",
                created_at: "2024-01-14T15:25:00Z",
              },
            ],
          },
        ],
      };

      setSearchResult(mockResult);
    } catch (err) {
      setError(t("error.searchFailed"));
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setUserId("");
    setSearchResult(null);
    setError(null);
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
                disabled={!userId.trim() || isSearching}
                className="gap-2"
                isLoading={isSearching}
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
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Search Results */}
          {searchResult && (
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-4">
                {/* Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5" />
                      {t("results.summary.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-primary text-2xl font-bold">
                          {searchResult.user_id}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {t("results.summary.userId")}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {searchResult.apps.length}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {t("results.summary.totalApps")}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {searchResult.total_events}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {t("results.summary.totalEvents")}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Apps and Events */}
                <div className="space-y-4">
                  {searchResult.apps.map((app, appIndex) => (
                    <Card key={appIndex}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <AppWindow className="h-5 w-5 text-blue-600" />
                          {app.app_name}
                          <Badge variant="secondary">{app.app_version}</Badge>
                          <Badge variant="outline">{app.platform}</Badge>
                          <Badge variant="outline">{app.country}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Activity className="text-muted-foreground h-4 w-4" />
                            <span className="text-sm font-medium">
                              {t("results.events.title")} ({app.events.length})
                            </span>
                          </div>
                          <div className="space-y-2">
                            {app.events.map((event, eventIndex) => (
                              <div
                                key={eventIndex}
                                className="bg-muted/50 flex items-center justify-between rounded-lg p-3"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
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
                                    <div className="text-muted-foreground mt-1 text-xs">
                                      {t("results.events.value")}:{" "}
                                      {event.event_value}
                                    </div>
                                  )}
                                </div>
                                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                  <Clock className="h-3 w-3" />
                                  {formatDateTime(new Date(event.created_at))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* No Results */}
                {searchResult.apps.length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <div className="text-muted-foreground">
                        {t("results.noData")}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
