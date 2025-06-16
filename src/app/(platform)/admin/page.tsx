"use client";

import { useAuth } from "@/providers/auth-provider";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Globe,
  RefreshCw,
  Server,
  TrendingUp,
  Users,
  Zap,
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

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  trend?: string;
  status?: "up" | "down" | "warning";
  icon: React.ReactNode;
}

interface ServiceStatusProps {
  name: string;
  status: "operational" | "degraded" | "down";
  uptime: string;
  lastChecked: string;
  responseTime: string;
}

function MetricCard({
  title,
  value,
  description,
  trend,
  icon,
}: MetricCardProps) {
  return (
    <Card className="border-border/50 transition-shadow hover:shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-foreground text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        {trend && (
          <div className="mt-2 flex items-center">
            <TrendingUp className="text-primary mr-1 size-3" />
            <span className="text-primary text-xs">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ServiceStatus({
  name,
  status,
  uptime,
  lastChecked,
  responseTime,
}: ServiceStatusProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "operational":
        return (
          <Badge
            variant="secondary"
            className="border-green-200 bg-green-50 text-green-700"
          >
            <CheckCircle className="mr-1 size-3" />
            Operational
          </Badge>
        );
      case "degraded":
        return (
          <Badge
            variant="secondary"
            className="border-yellow-200 bg-yellow-50 text-yellow-700"
          >
            <AlertTriangle className="mr-1 size-3" />
            Degraded
          </Badge>
        );
      case "down":
        return (
          <Badge
            variant="secondary"
            className="border-red-200 bg-red-50 text-red-700"
          >
            <AlertTriangle className="mr-1 size-3" />
            Down
          </Badge>
        );
    }
  };

  return (
    <div className="border-border/50 flex items-center justify-between border-b p-4 last:border-b-0">
      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-foreground text-sm font-medium">{name}</h4>
          {getStatusBadge()}
        </div>
        <div className="text-muted-foreground flex items-center space-x-4 text-xs">
          <span>Uptime: {uptime}</span>
          <span>Response: {responseTime}</span>
          <span>Last checked: {lastChecked}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();

  const systemMetrics = [
    {
      title: "Total Users",
      value: "12,847",
      description: "+12% from last month",
      trend: "+1,247 this month",
      status: "up" as const,
      icon: <Users className="size-4" />,
    },
    {
      title: "System Uptime",
      value: "99.98%",
      description: "Last 30 days",
      trend: "+0.02% improvement",
      status: "up" as const,
      icon: <Activity className="size-4" />,
    },
    {
      title: "Avg Response Time",
      value: "89ms",
      description: "Across all endpoints",
      trend: "-12ms faster",
      status: "up" as const,
      icon: <Zap className="size-4" />,
    },
    {
      title: "Active Sessions",
      value: "3,247",
      description: "Currently online",
      status: "up" as const,
      icon: <Globe className="size-4" />,
    },
  ];

  const services = [
    {
      name: "API Gateway",
      status: "operational" as const,
      uptime: "99.99%",
      lastChecked: "2 mins ago",
      responseTime: "45ms",
    },
    {
      name: "Database Primary",
      status: "operational" as const,
      uptime: "99.95%",
      lastChecked: "1 min ago",
      responseTime: "12ms",
    },
    {
      name: "Authentication Service",
      status: "operational" as const,
      uptime: "99.97%",
      lastChecked: "30s ago",
      responseTime: "67ms",
    },
    {
      name: "File Storage",
      status: "degraded" as const,
      uptime: "98.23%",
      lastChecked: "45s ago",
      responseTime: "234ms",
    },
    {
      name: "Email Service",
      status: "operational" as const,
      uptime: "99.89%",
      lastChecked: "1 min ago",
      responseTime: "156ms",
    },
    {
      name: "Background Jobs",
      status: "operational" as const,
      uptime: "99.94%",
      lastChecked: "2 mins ago",
      responseTime: "89ms",
    },
  ];

  const recentActivities = [
    {
      action: "Database backup completed",
      time: "2 minutes ago",
      status: "success",
    },
    {
      action: "SSL certificate renewed",
      time: "1 hour ago",
      status: "success",
    },
    {
      action: "Security scan completed",
      time: "3 hours ago",
      status: "success",
    },
    {
      action: "High memory usage detected",
      time: "6 hours ago",
      status: "warning",
    },
    {
      action: "System update deployed",
      time: "1 day ago",
      status: "success",
    },
  ];

  return (
    <div className="">
      <div className="border-border/50 bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground text-2xl font-semibold">
                Good {new Date().getHours() < 12 ? "morning" : "afternoon"},{" "}
                {user?.name}! 👋
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                System overview and monitoring dashboard
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 size-4" />
                Refresh
              </Button>
              <Button size="sm">
                <Bell className="mr-2 size-4" />
                Alerts
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 py-6">
        {/* System Metrics */}
        <section>
          <h2 className="text-foreground mb-4 text-lg font-semibold">
            System Metrics
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {systemMetrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Service Status */}
          <section>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="size-5" />
                      Service Status
                    </CardTitle>
                    <CardDescription>
                      Real-time status of all system services
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="border-green-200 bg-green-50 text-green-700"
                  >
                    <CheckCircle className="mr-1 size-3" />
                    All Systems Operational
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {services.map((service, index) => (
                  <ServiceStatus key={index} {...service} />
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Recent Activity */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest system events and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="bg-muted/30 flex items-center justify-between rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-2 rounded-full ${
                            activity.status === "success"
                              ? "bg-green-500"
                              : activity.status === "warning"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        />
                        <span className="text-foreground text-sm">
                          {activity.action}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

