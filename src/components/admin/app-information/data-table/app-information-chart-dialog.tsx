"use client";

import { useMemo, useState } from "react";

import { useSearchParams } from "next/navigation";

import { BarChart3, Calendar, Filter, TrendingUp, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useGetAppInformationChart } from "@/hooks/app-information";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Spinner } from "@/components/global/spinner";

// Component to display applied filters
function AppliedFilters() {
  const searchParams = useSearchParams();
  const t = useTranslations("AppInformationPage.table.chart");

  const filters = [
    {
      key: "app_name",
      label: t("filterLabels.app_name"),
      value: searchParams.get("app_name"),
    },
    {
      key: "os_name",
      label: t("filterLabels.os_name"),
      value: searchParams.get("os_name"),
    },
    {
      key: "os_version",
      label: t("filterLabels.os_version"),
      value: searchParams.get("os_version"),
    },
    {
      key: "app_version",
      label: t("filterLabels.app_version"),
      value: searchParams.get("app_version"),
    },
    {
      key: "category",
      label: t("filterLabels.category"),
      value: searchParams.get("category"),
    },
    {
      key: "platform",
      label: t("filterLabels.platform"),
      value: searchParams.get("platform"),
    },
    {
      key: "country",
      label: t("filterLabels.country"),
      value: searchParams.get("country"),
    },
    {
      key: "event_name",
      label: t("filterLabels.event_name"),
      value: searchParams.get("event_name"),
    },
    {
      key: "network",
      label: t("filterLabels.network"),
      value: searchParams.get("network"),
    },
    {
      key: "event_value",
      label: t("filterLabels.event_value"),
      value: searchParams.get("event_value"),
    },
    {
      key: "date_from",
      label: t("filterLabels.date_from"),
      value: searchParams.get("date_from"),
    },
    {
      key: "date_to",
      label: t("filterLabels.date_to"),
      value: searchParams.get("date_to"),
    },
  ].filter((filter) => filter.value && filter.value.trim() !== "");

  if (filters.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {t("noFiltersApplied")}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <div
            key={filter.key}
            className="border-primary/20 bg-primary/10 flex items-center gap-1 rounded-lg border px-3 py-1"
          >
            <span className="text-primary/90 text-xs font-medium">
              {filter.label}:
            </span>
            <span className="text-primary text-xs">
              {filter.key.includes("date")
                ? new Date(filter.value!).toLocaleDateString()
                : filter.value!.split(",").join(", ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const dailyUsersChartConfig = {
  unique_users: {
    label: "Unique Users",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

const dailyEventsChartConfig = {
  total_events: {
    label: "Total Events",
    color: "#10b981",
  },
} satisfies ChartConfig;

function DailyUsersChart({ data }: { data: any[] }) {
  const t = useTranslations("AppInformationPage.table.chart");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.dailyUsers.title")}</CardTitle>
        <CardDescription>{t("charts.dailyUsers.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={dailyUsersChartConfig} className="h-64 w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: -20,
              right: 12,
              top: 10,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={6}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <defs>
              <linearGradient id="fillUniqueUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="unique_users"
              type="linear"
              fill="url(#fillUniqueUsers)"
              stroke="#3b82f6"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function DailyEventsChart({ data }: { data: any[] }) {
  const t = useTranslations("AppInformationPage.table.chart");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.dailyEvents.title")}</CardTitle>
        <CardDescription>{t("charts.dailyEvents.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={dailyEventsChartConfig} className="h-64 w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: -20,
              right: 12,
              top: 10,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={6}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <defs>
              <linearGradient id="fillTotalEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="total_events"
              type="linear"
              fill="url(#fillTotalEvents)"
              stroke="#10b981"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function AppInformationChartDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: chartData, isLoading, isError } = useGetAppInformationChart();
  const t = useTranslations("AppInformationPage.table.chart");

  // Memoize the processed data
  const processedData = useMemo(() => {
    if (!chartData?.success || !chartData?.data) {
      return {
        chartData: [],
        totals: {
          total_users: 0,
          total_events: 0,
          unique_apps: 0,
          total_requests: 0,
        },
      };
    }

    const data = chartData.data;
    const totals = data.reduce(
      (acc, curr) => ({
        total_users: acc.total_users + curr.unique_users,
        total_events: acc.total_events + curr.total_events,
        unique_apps: Math.max(acc.unique_apps, curr.unique_apps),
        total_requests: acc.total_requests + curr.total_requests,
      }),
      {
        total_users: 0,
        total_events: 0,
        unique_apps: 0,
        total_requests: 0,
      }
    );

    return {
      chartData: data,
      totals,
    };
  }, [chartData]);

  const avgEventsPerUser =
    processedData.totals.total_users > 0
      ? (
          processedData.totals.total_events / processedData.totals.total_users
        ).toFixed(1)
      : "0";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <BarChart3 className="size-3.5" />
          {t("viewAnalytics")}
        </Button>
      </DialogTrigger>
      <DialogContent className="lg:min-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t("analyticsOverview")}
            {isLoading && (
              <Badge variant="secondary" className="text-xs">
                {t("loading")}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {t("loadingError")}
            </div>
          )}

          {/* Content */}
          {!isLoading && !isError && (
            <>
              {/* Applied Filters */}
              <AppliedFilters />

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("metrics.totalUsers")}
                    </CardTitle>
                    <Users className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {processedData.totals.total_users.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {t("metrics.uniqueUsers")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("metrics.totalEvents")}
                    </CardTitle>
                    <TrendingUp className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {processedData.totals.total_events.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {t("metrics.totalRecords")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("metrics.uniqueApps")}
                    </CardTitle>
                    <BarChart3 className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {processedData.totals.unique_apps.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {t("metrics.differentApps")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("metrics.avgEventsPerUser")}
                    </CardTitle>
                    <Calendar className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{avgEventsPerUser}</div>
                    <p className="text-muted-foreground text-xs">
                      {t("metrics.eventsPerUser")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DailyUsersChart data={processedData.chartData} />
                <DailyEventsChart data={processedData.chartData} />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
