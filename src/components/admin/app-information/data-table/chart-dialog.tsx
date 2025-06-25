"use client";

import { useState } from "react";

import { BarChart3, Calendar, TrendingUp, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ChartDialog() {
  const t = useTranslations("AppInformationPage.table.chart");
  const [isOpen, setIsOpen] = useState(false);

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
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("totalUsers")}
                </CardTitle>
                <Users className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">123</div>
                <p className="text-muted-foreground text-xs">
                  {t("uniqueUsers")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("totalEvents")}
                </CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">123</div>
                <p className="text-muted-foreground text-xs">
                  {t("totalRecords")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("avgEventsPerUser")}
                </CardTitle>
                <Calendar className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">777</div>
                <p className="text-muted-foreground text-xs">
                  {t("eventsPerUser")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Placeholder for future charts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("comingSoon")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-muted-foreground/25 flex h-48 items-center justify-center rounded-lg border-2 border-dashed">
                <div className="text-center">
                  <BarChart3 className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground text-sm">
                    {t("chartsComingSoon")}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {t("inDevelopment")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
