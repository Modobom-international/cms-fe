"use client";

import { useState } from "react";

import { BarChart3, Calendar, TrendingUp, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

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
  ChartLegend,
  ChartLegendContent,
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

const dailyUsersData = [
  { date: "2025-06-20", unique_users: 8 },
  { date: "2025-06-21", unique_users: 12 },
  { date: "2025-06-22", unique_users: 15 },
  { date: "2025-06-23", unique_users: 6 },
  { date: "2025-06-24", unique_users: 18 },
];

const dailyEventsData = [
  { date: "2025-06-20", total_events: 28 },
  { date: "2025-06-21", total_events: 42 },
  { date: "2025-06-22", total_events: 36 },
  { date: "2025-06-23", total_events: 19 },
  { date: "2025-06-24", total_events: 64 },
];

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

const platformData = [
  { name: "Samsung", value: 42, color: "#3b82f6" },
  { name: "Xiaomi", value: 38, color: "#10b981" },
  { name: "Google", value: 25, color: "#f59e0b" },
];

const platformChartConfig = {
  Samsung: { label: "Samsung", color: "#3b82f6" },
  Xiaomi: { label: "Xiaomi", color: "#10b981" },
  Google: { label: "Google", color: "#f59e0b" },
} satisfies ChartConfig;

const appNameData = [
  { name: "VALORANT", value: 68, color: "#8b5cf6" },
  { name: "DeltaForce", value: 45, color: "#ef4444" },
  { name: "Other Apps", value: 32, color: "#06b6d4" },
];

const appNameChartConfig = {
  VALORANT: { label: "VALORANT", color: "#8b5cf6" },
  DeltaForce: {
    label: "DeltaForce",
    color: "#ef4444",
  },
  "Other Apps": {
    label: "Other Apps",
    color: "#06b6d4",
  },
} satisfies ChartConfig;

function DailyUsersChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Unique Users</CardTitle>
        <CardDescription>
          Unique users activity from June 20-24, 2025
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={dailyUsersChartConfig} className="h-64 w-full">
          <AreaChart
            accessibilityLayer
            data={dailyUsersData}
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

function DailyEventsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Events</CardTitle>
        <CardDescription>
          Total events activity from June 20-24, 2025
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={dailyEventsChartConfig} className="h-64 w-full">
          <AreaChart
            accessibilityLayer
            data={dailyEventsData}
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

function PlatformDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Distribution</CardTitle>
        <CardDescription>
          Event distribution across device manufacturers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={platformChartConfig} className="h-48 w-full">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel nameKey="name" />}
            />
            <Pie data={platformData} dataKey="value" nameKey="name">
              {platformData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              verticalAlign="bottom"
              align="center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function AppNameDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Usage</CardTitle>
        <CardDescription>
          Event distribution by application name
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={appNameChartConfig} className="h-48 w-full">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel nameKey="name" />}
            />
            <Pie
              data={appNameData}
              dataKey="value"
              nameKey="name"
              innerRadius={40}
            >
              {appNameData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              verticalAlign="bottom"
              align="center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function AppInformationChartDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const totals = {
    total_users: dailyUsersData.reduce(
      (acc, curr) => acc + curr.unique_users,
      0
    ),
    total_events: dailyEventsData.reduce(
      (acc, curr) => acc + curr.total_events,
      0
    ),
  };

  const avgEventsPerUser =
    totals.total_users > 0
      ? (totals.total_events / totals.total_users).toFixed(1)
      : "0";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <BarChart3 className="size-3.5" />
          View Analytics
        </Button>
      </DialogTrigger>
      <DialogContent className="lg:min-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Overview
            <Badge variant="default" className="text-xs">
              Sample Data
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.total_users}</div>
                <p className="text-muted-foreground text-xs">
                  Unique users tracked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Events
                </CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.total_events}</div>
                <p className="text-muted-foreground text-xs">
                  Total records processed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Events/User
                </CardTitle>
                <Calendar className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgEventsPerUser}</div>
                <p className="text-muted-foreground text-xs">Events per user</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DailyUsersChart />
            <DailyEventsChart />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PlatformDistributionChart />
            <AppNameDistributionChart />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

