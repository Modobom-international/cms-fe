"use client";

import Link from "next/link";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  CheckCircle,
  ChevronRight,
  Code,
  Home,
  Info,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample data for charts and tables
const systemMetricsData = [
  { time: "00:00", cpu: 42, memory: 65, requests: 120, errors: 2 },
  { time: "04:00", cpu: 38, memory: 59, requests: 80, errors: 1 },
  { time: "08:00", cpu: 65, memory: 72, requests: 340, errors: 4 },
  { time: "12:00", cpu: 89, memory: 85, requests: 580, errors: 12 },
  { time: "16:00", cpu: 72, memory: 79, requests: 460, errors: 8 },
  { time: "20:00", cpu: 56, memory: 68, requests: 220, errors: 3 },
  { time: "24:00", cpu: 45, memory: 62, requests: 140, errors: 2 },
];

const logEventsData = [
  {
    id: "LOG001",
    source: "Push System",
    level: "error",
    message: "Failed to deliver notification to device: TOKEN_EXPIRED",
    timestamp: "2023-05-20 14:32:15",
  },
  {
    id: "LOG002",
    source: "HTML Source",
    level: "warn",
    message: "Resource loading timeout for domain example.com",
    timestamp: "2023-05-20 15:45:22",
  },
  {
    id: "LOG003",
    source: "Domain Service",
    level: "info",
    message: "Domain registration renewed: client-domain.com",
    timestamp: "2023-05-21 09:12:45",
  },
  {
    id: "LOG004",
    source: "User Service",
    level: "error",
    message: "Authentication failed multiple times for user ID: 28456",
    timestamp: "2023-05-22 18:02:37",
  },
  {
    id: "LOG005",
    source: "Push System",
    level: "info",
    message: "Batch notification successfully delivered to 12,543 devices",
    timestamp: "2023-05-24 11:24:18",
  },
];

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
            <Link
              href="/admin/logs"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              Xem nhật ký
            </Link>
            <Link
              href="/admin/alerts"
              className={buttonVariants({
                variant: "default",
                size: "sm",
              })}
            >
              <BellRing className="mr-2 h-4 w-4" />
              Cảnh báo (2)
            </Link>
          </div>
        </div>
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

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="text-primary mr-2 h-5 w-5" />
            Sự kiện nhật ký gần đây
          </CardTitle>
          <CardDescription>
            Các sự kiện hệ thống quan trọng gần đây nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nguồn</TableHead>
                <TableHead>Mức độ</TableHead>
                <TableHead>Thông báo</TableHead>
                <TableHead className="text-right">Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logEventsData.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.id}</TableCell>
                  <TableCell>{log.source}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.level === "error"
                          ? "destructive"
                          : log.level === "warn"
                            ? "outline"
                            : "default"
                      }
                      className={
                        log.level === "info"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : ""
                      }
                    >
                      {log.level === "error"
                        ? "Lỗi"
                        : log.level === "warn"
                          ? "Cảnh báo"
                          : "Thông tin"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {log.message}
                  </TableCell>
                  <TableCell className="text-right">{log.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-center">
          <Link
            href="/admin/logs"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
            })}
          >
            Xem tất cả nhật ký
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
