"use client";

import { format } from "date-fns";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangeFilterProps {
  title: string;
  dateRange: { from: Date | null; to: Date | null };
  onChange: (dateRange: { from: Date | null; to: Date | null }) => void;
  onApply: () => void;
}

export function DateRangeFilter({
  title,
  dateRange,
  onChange,
  onApply,
}: DateRangeFilterProps) {
  const t = useTranslations("AppInformationPage.table");

  // Helper functions to check if a quick range is currently active
  const isSameDay = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const isToday = () => {
    const today = new Date();
    return isSameDay(dateRange.from, today) && isSameDay(dateRange.to, today);
  };

  const isYesterday = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      isSameDay(dateRange.from, yesterday) && isSameDay(dateRange.to, today)
    );
  };

  const isLast7Days = () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    return (
      isSameDay(dateRange.from, lastWeek) && isSameDay(dateRange.to, today)
    );
  };

  const isLast30Days = () => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);
    return (
      isSameDay(dateRange.from, lastMonth) && isSameDay(dateRange.to, today)
    );
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <span className="border-border text-muted-foreground hover:bg-muted inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2 py-0.5 text-xs font-medium transition-colors">
            <PlusCircle className="size-3" />
            {title}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <h3 className="text-foreground text-sm font-medium">
                {t("filters.dateRangeLabel")}
              </h3>

              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-2">
                  {/* From Date */}
                  <div className="space-y-1">
                    <label className="text-muted-foreground text-xs">
                      {t("filters.fromDate")}
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            format(dateRange.from, "MMM d, yyyy")
                          ) : (
                            <span>{t("filters.selectDate")}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.from || undefined}
                          onSelect={(date: Date | undefined) =>
                            onChange({ ...dateRange, from: date || null })
                          }
                          disabled={(date: Date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* To Date */}
                  <div className="space-y-1">
                    <label className="text-muted-foreground text-xs">
                      {t("filters.toDate")}
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.to && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to ? (
                            format(dateRange.to, "MMM d, yyyy")
                          ) : (
                            <span>{t("filters.selectDate")}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.to || undefined}
                          onSelect={(date: Date | undefined) =>
                            onChange({ ...dateRange, to: date || null })
                          }
                          disabled={(date: Date) =>
                            date > new Date() ||
                            date < new Date("1900-01-01") ||
                            (dateRange.from ? date < dateRange.from : false)
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Quick Date Range Options */}
                <div className="space-y-2">
                  <label className="text-muted-foreground text-xs">
                    {t("filters.quickRanges")}
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant={isToday() ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "justify-start text-xs transition-all",
                        isToday()
                          ? "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
                          : "hover:bg-muted"
                      )}
                      onClick={() => {
                        const today = new Date();
                        onChange({ from: today, to: today });
                      }}
                    >
                      {t("filters.today")}
                    </Button>
                    <Button
                      variant={isYesterday() ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "justify-start text-xs transition-all",
                        isYesterday()
                          ? "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
                          : "hover:bg-muted"
                      )}
                      onClick={() => {
                        const today = new Date();
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        onChange({ from: yesterday, to: today });
                      }}
                    >
                      {t("filters.yesterday")}
                    </Button>
                    <Button
                      variant={isLast7Days() ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "justify-start text-xs transition-all",
                        isLast7Days()
                          ? "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
                          : "hover:bg-muted"
                      )}
                      onClick={() => {
                        const today = new Date();
                        const lastWeek = new Date(today);
                        lastWeek.setDate(lastWeek.getDate() - 7);
                        onChange({ from: lastWeek, to: today });
                      }}
                    >
                      {t("filters.last7Days")}
                    </Button>
                    <Button
                      variant={isLast30Days() ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "justify-start text-xs transition-all",
                        isLast30Days()
                          ? "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
                          : "hover:bg-muted"
                      )}
                      onClick={() => {
                        const today = new Date();
                        const lastMonth = new Date(today);
                        lastMonth.setDate(lastMonth.getDate() - 30);
                        onChange({ from: lastMonth, to: today });
                      }}
                    >
                      {t("filters.last30Days")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <Button onClick={onApply} className="w-full">
                {t("filters.applyFilter")}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

