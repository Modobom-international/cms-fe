"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  ChevronRight,
  Home,
  Info,
  Plus,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import CalendarSample from "@/components/calendar/calendar-sample";

const statusData = [
  {
    service: "Push Gateway",
    status: "healthy",
    latency: "24ms",
    uptime: "99.98%",
  },
  {
    service: "Domain API",
    status: "healthy",
    latency: "42ms",
    uptime: "99.95%",
  },
  {
    service: "HTML Scraper",
    status: "degraded",
    latency: "187ms",
    uptime: "99.82%",
  },
  {
    service: "Log Service",
    status: "healthy",
    latency: "18ms",
    uptime: "100%",
  },
  {
    service: "Auth Service",
    status: "healthy",
    latency: "31ms",
    uptime: "99.99%",
  },
];

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>Dashboard</span>
        </nav>

        {/* Title and Actions Section */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Hệ thống giám sát
            </h1>
            <p className="text-muted-foreground text-sm">
              Theo dõi và quản lý hoạt động hệ thống trong thời gian thực
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline">
              Xem nhật ký
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Thêm widget
            </Button>
          </div>
        </div>
      </div>

      <div>
        <CalendarSample />
      </div>

      {/* System Status Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Activity className="text-primary mr-2 h-5 w-5" />
              Tổng quan hệ thống
            </CardTitle>
            <CardDescription>
              Tình trạng hoạt động các dịch vụ chính
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statusData.map((service) => (
                <div
                  key={service.service}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    {service.status === "healthy" ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : service.status === "degraded" ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Info className="h-5 w-5 text-rose-500" />
                    )}
                    <div>
                      <p className="font-medium">{service.service}</p>
                      <p className="text-muted-foreground text-xs">
                        Độ trễ: {service.latency}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        service.status === "healthy"
                          ? "default"
                          : service.status === "degraded"
                            ? "outline"
                            : "destructive"
                      }
                      className={
                        service.status === "healthy"
                          ? "bg-emerald-500 hover:bg-emerald-600"
                          : ""
                      }
                    >
                      {service.status === "healthy"
                        ? "Hoạt động tốt"
                        : service.status === "degraded"
                          ? "Hiệu suất giảm"
                          : "Lỗi"}
                    </Badge>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Uptime: {service.uptime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Summary */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="text-primary mr-2 h-5 w-5" />
              Chỉ số chính
            </CardTitle>
            <CardDescription>
              Hiệu suất hệ thống trong 24 giờ qua
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CPU</span>
                  <span className="text-sm font-medium">72%</span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: "72%" }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Bộ nhớ</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Băng thông</span>
                  <span className="text-sm font-medium">48%</span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: "48%" }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Disk I/O</span>
                  <span className="text-sm font-medium">34%</span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: "34%" }}
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-500">
                      Dịch vụ đang hoạt động
                    </span>
                  </div>
                  <span className="font-bold">23/25</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
