"use client";

import { useEffect, useState } from "react";

import { CalendarDate, parseDate } from "@internationalized/date";
import { format } from "date-fns";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { DatePicker } from "react-aria-components";

import { IDomainActual } from "@/types/domain.type";

import { cn } from "@/lib/utils";

import { useGetDomainList, useGetDomainPaths } from "@/hooks/domain";
import { useDebounce } from "@/hooks/use-debounce";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DateInput } from "@/components/ui/datefield-rac";
import {
  PopoverContent,
  PopoverTrigger,
  Popover as PopoverUI,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Spinner } from "@/components/global/spinner";

interface FilterBarProps {
  onFilterChange?: () => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const t = useTranslations("UserTrackingPage.table");
  const [openDomainSelect, setOpenDomainSelect] = useState(false);
  const [openPathSelect, setOpenPathSelect] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");
  const debouncedSearchValue = useDebounce(searchInputValue, 500);

  // URL query state
  const [date, setDate] = useQueryState(
    "date",
    parseAsString.withDefault(format(new Date(), "yyyy-MM-dd"))
  );
  const [domain, setDomain] = useQueryState(
    "domains",
    parseAsString.withDefault("")
  );
  const [path, setPath] = useQueryState(
    "path",
    parseAsString.withDefault("all")
  );

  // Fetch domain list
  const {
    data: domainResponse = { data: { data: [] } },
    isLoading: isLoadingDomains,
  } = useGetDomainList(1, 10, debouncedSearchValue);

  const domains =
    "data" in domainResponse && domainResponse.data?.data
      ? domainResponse.data.data
      : [];

  // Reset path when domain changes
  useEffect(() => {
    setPath("all");
  }, [domain, setPath]);

  // Fetch domain paths when a domain is selected
  const { data: pathsResponse, isLoading: isLoadingPaths } = useGetDomainPaths(
    domain,
    1,
    100
  );

  // Extract paths from the response with type safety
  const availablePaths = (() => {
    if (!pathsResponse || !pathsResponse.success) return ["all"];

    try {
      // For type safety, handle any possible structure without relying on specific properties
      const responseData = (pathsResponse as any).data;

      if (responseData) {
        // If response has path items directly
        if (Array.isArray(responseData)) {
          return [
            "all",
            ...responseData.map(
              (item: any) => item.path || item.url_path || item.slug || ""
            ),
          ];
        }

        // If response has nested data array
        if (responseData.data && Array.isArray(responseData.data)) {
          return [
            "all",
            ...responseData.data.map(
              (item: any) => item.path || item.url_path || item.slug || ""
            ),
          ];
        }
      }
    } catch (e) {
      console.error("Error parsing path data:", e);
    }

    // Fallback
    return ["all"];
  })();

  useEffect(() => {
    if (domain === "" && domains.length > 0) {
      setDomain(domains[0].domain);
    }
  }, [domains, domain, setDomain]);

  const handleDomainSearchChange = (value: string) => {
    setSearchInputValue(value);
  };

  const calendarDate = date ? parseDate(date) : undefined;
  const handleDateChange = (newDate: CalendarDate | null) => {
    if (newDate) {
      setDate(newDate.toString());
    } else {
      setDate("");
    }
    if (onFilterChange) onFilterChange();
  };

  const handleDomainChange = (currentValue: string) => {
    setDomain(currentValue);
    setOpenDomainSelect(false);
    if (onFilterChange) onFilterChange();
  };

  const handlePathChange = (currentValue: string) => {
    setPath(currentValue);
    setOpenPathSelect(false);
    if (onFilterChange) onFilterChange();
  };

  const handleApplyDateFilter = () => {
    if (onFilterChange) onFilterChange();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
        {/* Domain Filter */}
        <div>
          <label
            className="mb-2 block text-sm font-medium text-gray-700"
            htmlFor="domain"
          >
            {t("filters.selectDomain")}
          </label>
          <PopoverUI open={openDomainSelect} onOpenChange={setOpenDomainSelect}>
            <PopoverTrigger asChild>
              <Button
                id="domain-select"
                variant="outline"
                role="combobox"
                aria-expanded={openDomainSelect}
                className="w-full justify-between"
                disabled={isLoadingDomains}
              >
                {domain
                  ? domains.find((d) => d.domain === domain)?.domain || domain
                  : t("placeholders.selectDomain")}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[24rem] p-0"
              side="bottom"
              align="start"
            >
              <Command>
                <div className="relative">
                  <CommandInput
                    placeholder={t("placeholders.searchDomain")}
                    className="h-9"
                    onValueChange={handleDomainSearchChange}
                  />
                </div>
                <CommandList>
                  <CommandEmpty>
                    {isLoadingDomains ? (
                      <div className="py-6">
                        <Spinner noPadding />
                      </div>
                    ) : (
                      t("loadingStates.noDomains")
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {isLoadingDomains && domains.length === 0 ? (
                      <div className="flex items-center justify-center py-6">
                        <Spinner noPadding />
                      </div>
                    ) : (
                      domains.map((domainItem: IDomainActual) => (
                        <CommandItem
                          key={domainItem.id}
                          value={domainItem.domain}
                          onSelect={handleDomainChange}
                        >
                          {domainItem.domain}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              domain === domainItem.domain
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </PopoverUI>
        </div>

        {/* Path Filter */}
        <div>
          <label
            className="mb-2 block text-sm font-medium text-gray-700"
            htmlFor="path"
          >
            {t("filters.selectPath")}
          </label>
          <PopoverUI open={openPathSelect} onOpenChange={setOpenPathSelect}>
            <PopoverTrigger asChild>
              <Button
                id="path-select"
                variant="outline"
                role="combobox"
                aria-expanded={openPathSelect}
                className="w-full justify-between"
                disabled={!domain || isLoadingPaths}
              >
                {path === "all"
                  ? "All Paths"
                  : path || t("placeholders.selectPath")}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[24rem] p-0"
              side="bottom"
              align="start"
            >
              <Command>
                <div className="relative">
                  <CommandInput
                    placeholder={t("placeholders.searchPath")}
                    className="h-9"
                  />
                </div>
                <CommandList>
                  <CommandEmpty>
                    {isLoadingPaths ? (
                      <div className="py-6">
                        <Spinner noPadding />
                      </div>
                    ) : (
                      t("loadingStates.noPaths")
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {isLoadingPaths ? (
                      <div className="flex items-center justify-center py-6">
                        <Spinner noPadding />
                      </div>
                    ) : (
                      availablePaths.map((pathItem: string) => (
                        <CommandItem
                          key={pathItem}
                          value={pathItem}
                          onSelect={handlePathChange}
                        >
                          {pathItem === "all" ? "All Paths" : pathItem}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              path === pathItem ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </PopoverUI>
        </div>
      </div>
      {/* Date Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <PopoverUI>
          <PopoverTrigger asChild>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-2.5 py-0.5 text-sm font-medium text-gray-500 hover:bg-gray-50">
              <PlusCircle className="size-3.5" />
              {t("filters.date")}
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
              <Button className="w-full">Apply Filter</Button>
            </div>
          </PopoverContent>
        </PopoverUI>
      </div>
    </div>
  );
}
