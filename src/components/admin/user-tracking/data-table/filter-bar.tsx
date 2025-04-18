"use client";

import { CalendarDate } from "@internationalized/date";
import { format } from "date-fns";
import { Calendar, Check, Globe, X } from "lucide-react";
import { DatePicker } from "react-aria-components";

import { IDomainActual } from "@/types/domain.type";

import { cn } from "@/lib/utils";

import { useGetDomainList } from "@/hooks/domain";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { DateInput } from "@/components/ui/datefield-rac";
import {
  PopoverContent,
  PopoverTrigger,
  Popover as PopoverUI,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface FilterBarProps {
  selectedDomains: string[];
  onDomainSelect: (domain: string) => void;
  onClearDomains: () => void;
  openDomainSelect: boolean;
  setOpenDomainSelect: (open: boolean) => void;
  date: string;
  setDate: (date: string) => void;
  calendarDate: CalendarDate | undefined;
  handleDateChange: (date: CalendarDate | null) => void;
  refetch: () => void;
  setCurrentPage: (page: number) => void;
  resetFilters: () => void;
  t: (key: string) => string;
}

export function FilterBar({
  selectedDomains,
  onDomainSelect,
  onClearDomains,
  openDomainSelect,
  setOpenDomainSelect,
  date,
  setDate,
  calendarDate,
  handleDateChange,
  refetch,
  setCurrentPage,
  resetFilters,
  t,
}: FilterBarProps) {
  const {
    data: domainResponse,
    isLoading: isLoadingDomains,
    error: domainError,
  } = useGetDomainList(1, 100, "");

  const domains: IDomainActual[] =
    domainResponse && "data" in domainResponse && domainResponse.data?.data
      ? domainResponse.data.data
      : [];

  const defaultDate = format(new Date(), "yyyy-MM-dd");
  const isDateActive = date && date !== defaultDate;
  const isDomainActive = selectedDomains.length > 0;
  const isFilterActive = isDateActive || isDomainActive;

  return (
    <div className="flex flex-row gap-2">
      {/* Domain Filter */}
      <div>
        <PopoverUI open={openDomainSelect} onOpenChange={setOpenDomainSelect}>
          <PopoverTrigger asChild>
            <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-2.5 py-0.5 text-sm font-medium text-gray-500 hover:bg-gray-50">
              <Globe className="size-3.5" />
              {selectedDomains.length > 0 ? (
                <>
                  <span className="text-gray-800">Domain</span>
                  <Separator orientation="vertical" className="mx-1 h-4" />
                  <span className="text-primary font-semibold">
                    {selectedDomains[0]}
                  </span>
                </>
              ) : (
                "Select domain"
              )}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0" side="bottom" align="start">
            <Command>
              <CommandInput
                placeholder={t("placeholders.searchDomain")}
                className="h-9"
              />
              <CommandList>
                <CommandEmpty>{t("loadingStates.noDomains")}</CommandEmpty>
                <CommandGroup>
                  {isLoadingDomains ? (
                    <div className="py-2 text-center text-sm text-gray-500">
                      {t("loadingStates.loadingDomains")}
                    </div>
                  ) : domainError ? (
                    <div className="py-2 text-center text-sm text-red-500">
                      {t("errors.fetchDomainsFailed")}
                    </div>
                  ) : domains.length === 0 ? (
                    <div className="py-2 text-center text-sm text-gray-500">
                      {t("loadingStates.noDomains")}
                    </div>
                  ) : (
                    domains.map((domainItem: IDomainActual) => {
                      const isSelected = selectedDomains.includes(
                        domainItem.domain
                      );
                      return (
                        <CommandItem
                          key={domainItem.id}
                          value={domainItem.domain}
                          onSelect={() => onDomainSelect(domainItem.domain)}
                        >
                          <span>{domainItem.domain}</span>
                          {isSelected && (
                            <Check className="text-primary ml-auto h-4 w-4" />
                          )}
                        </CommandItem>
                      );
                    })
                  )}
                </CommandGroup>
                {selectedDomains.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={onClearDomains}
                        className="justify-center text-center"
                      >
                        Clear filters
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </PopoverUI>
      </div>

      {/* Date Filter */}
      <div>
        <PopoverUI>
          <PopoverTrigger asChild>
            <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-2.5 py-0.5 text-sm font-medium text-gray-500 hover:bg-gray-50">
              <Calendar className="size-3.5" />
              {isDateActive ? (
                <>
                  <span className="text-gray-800">Date</span>
                  <Separator orientation="vertical" className="mx-1 h-4" />
                  <span className="text-primary font-semibold">
                    {format(new Date(date), "yyyy-MM-dd")}
                  </span>
                </>
              ) : (
                "Select date"
              )}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <div className="px-3 pt-3">
              <h3 className="text-sm font-medium">Select Date</h3>
            </div>
            <ScrollArea className="max-h-72">
              <div className="p-3">
                <DatePicker value={calendarDate} onChange={handleDateChange}>
                  <DateInput className="w-full" />
                </DatePicker>
              </div>
            </ScrollArea>
            <div className="flex items-center justify-between border-t border-gray-100 p-3">
              <Button
                onClick={() => {
                  setCurrentPage(1);
                  refetch();
                }}
                className="w-full"
              >
                Apply Filter
              </Button>
            </div>
            {isDateActive && (
              <div className="border-t border-gray-100 p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setDate(defaultDate)}
                >
                  Clear date filter
                </Button>
              </div>
            )}
          </PopoverContent>
        </PopoverUI>
      </div>
      <div>
        {/* Reset Button */}
        {isFilterActive && (
          <span
            onClick={resetFilters}
            className="text-primary hover:text-primary/80 ml-auto inline-flex cursor-pointer items-center gap-1.5 px-2.5 py-0.5 font-medium"
          >
            Clear filters
          </span>
        )}
      </div>
    </div>
  );
}
