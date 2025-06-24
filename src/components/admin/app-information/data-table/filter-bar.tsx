"use client";

import { useState } from "react";

import { format } from "date-fns";
import { PlusCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { useGetAppInformationFilterMenu } from "@/hooks/app-infomation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import { DateRangeFilter } from "@/components/admin/app-information/data-table/date-range-filter";

interface FilterBadgeProps {
  label: string;
  filterValue: string;
  onClear: () => void;
  t: (key: string, params?: any) => string;
}

function FilterBadge({ label, filterValue, onClear, t }: FilterBadgeProps) {
  const values = filterValue.split(",").filter(Boolean);
  const displayText =
    values.length > 3
      ? `${values.length} ${t("filters.selected")}`
      : values.join(", ");

  return (
    <Badge
      variant="secondary"
      className="gap-1.5 border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
    >
      <span className="font-medium text-purple-600 dark:text-purple-400">
        {label}:
      </span>
      <span className="max-w-32 truncate">{displayText}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 rounded-full p-0 text-purple-500 transition-colors hover:bg-purple-100 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-800 dark:hover:text-purple-300"
        onClick={onClear}
      >
        <X className="h-2.5 w-2.5" />
        <span className="sr-only">
          {t("filters.removeFilter", { filterType: label })}
        </span>
      </Button>
    </Badge>
  );
}

interface FilterBarProps {
  appFilter: string;
  osFilter: string;
  osVersionFilter: string;
  categoryFilter: string;
  eventFilter: string;
  platformFilter: string;
  countryFilter: string;
  appVersionFilter: string;
  networkFilter: string;
  dateFilter: { from: Date | null; to: Date | null };
  onFiltersApply: (filters: {
    app_name: string[];
    os_name: string[];
    os_version: string[];
    app_version: string[];
    category: string[];
    platform: string[];
    country: string[];
    event_name: string[];
    network: string[];
    date_range: { from: Date | null; to: Date | null };
  }) => void;
  onClearFilter: (filterType: string) => void;
  onClearAllFilters: () => void;
}

export function FilterBar({
  appFilter,
  osFilter,
  osVersionFilter,
  categoryFilter,
  eventFilter,
  platformFilter,
  countryFilter,
  appVersionFilter,
  networkFilter,
  dateFilter,
  onFiltersApply,
  onClearFilter,
  onClearAllFilters,
}: FilterBarProps) {
  const t = useTranslations("AppInformationPage.table");

  // Fetch filter menu data
  const { data: filterMenuData, isLoading: isMenuLoading } =
    useGetAppInformationFilterMenu();

  const [selectedApps, setSelectedApps] = useState<string[]>(
    appFilter ? appFilter.split(",").filter(Boolean) : []
  );
  const [selectedOS, setSelectedOS] = useState<string[]>(
    osFilter ? osFilter.split(",").filter(Boolean) : []
  );
  const [selectedOSVersions, setSelectedOSVersions] = useState<string[]>(
    osVersionFilter ? osVersionFilter.split(",").filter(Boolean) : []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryFilter ? categoryFilter.split(",").filter(Boolean) : []
  );
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    eventFilter ? eventFilter.split(",").filter(Boolean) : []
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    platformFilter ? platformFilter.split(",").filter(Boolean) : []
  );
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    countryFilter ? countryFilter.split(",").filter(Boolean) : []
  );
  const [selectedAppVersions, setSelectedAppVersions] = useState<string[]>(
    appVersionFilter ? appVersionFilter.split(",").filter(Boolean) : []
  );
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>(
    networkFilter ? networkFilter.split(",").filter(Boolean) : []
  );

  // Date range state - default to yesterday and today
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: dateFilter.from || yesterday,
    to: dateFilter.to || today,
  });

  // Get filter options from API data or fallback to empty arrays
  const filterOptions = filterMenuData?.data?.data || {
    app_name: [],
    os_name: [],
    os_version: [],
    category: [],
    event_name: [],
    platform: [],
    country: [],
    app_version: [],
    network: [],
  };

  // Transform API data to options format
  const appOptions = filterOptions.app_name.map((name) => ({
    value: name,
    label: name,
  }));
  const osOptions = filterOptions.os_name.map((name) => ({
    value: name,
    label: name,
  }));
  const osVersionOptions = filterOptions.os_version.map((version) => ({
    value: version,
    label: version,
  }));
  const categoryOptions = filterOptions.category.map((category) => ({
    value: category,
    label: category,
  }));
  const eventOptions = (filterOptions.event_name || []).map((event) => ({
    value: event,
    label: event,
  }));
  const platformOptions = filterOptions.platform.map((platform) => ({
    value: platform,
    label: platform,
  }));
  const countryOptions = filterOptions.country.map((country) => ({
    value: country,
    label: country,
  }));
  const appVersionOptions = filterOptions.app_version.map((version) => ({
    value: version,
    label: version,
  }));
  const networkOptions = (filterOptions.network || []).map((network) => ({
    value: network,
    label: network,
  }));

  // Check if any filters are applied
  const hasAppliedFilters = !!(
    appFilter ||
    osFilter ||
    osVersionFilter ||
    categoryFilter ||
    eventFilter ||
    platformFilter ||
    countryFilter ||
    appVersionFilter ||
    networkFilter ||
    dateFilter.from ||
    dateFilter.to
  );

  // Apply filters
  const applyFilters = () => {
    onFiltersApply({
      app_name: selectedApps,
      os_name: selectedOS,
      os_version: selectedOSVersions,
      app_version: selectedAppVersions,
      category: selectedCategories,
      platform: selectedPlatforms,
      country: selectedCountries,
      event_name: selectedEvents,
      network: selectedNetworks,
      date_range: dateRange,
    });
  };

  // Handle checkbox changes
  const handleAppChange = (app: string, checked: boolean) => {
    setSelectedApps((prev) =>
      checked ? [...prev, app] : prev.filter((a) => a !== app)
    );
  };

  const handleOSChange = (os: string, checked: boolean) => {
    setSelectedOS((prev) =>
      checked ? [...prev, os] : prev.filter((o) => o !== os)
    );
  };

  const handleOSVersionChange = (osVersion: string, checked: boolean) => {
    setSelectedOSVersions((prev) =>
      checked ? [...prev, osVersion] : prev.filter((v) => v !== osVersion)
    );
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  };

  const handleEventChange = (event: string, checked: boolean) => {
    setSelectedEvents((prev) =>
      checked ? [...prev, event] : prev.filter((e) => e !== event)
    );
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setSelectedPlatforms((prev) =>
      checked ? [...prev, platform] : prev.filter((p) => p !== platform)
    );
  };

  const handleCountryChange = (country: string, checked: boolean) => {
    setSelectedCountries((prev) =>
      checked ? [...prev, country] : prev.filter((c) => c !== country)
    );
  };

  const handleAppVersionChange = (version: string, checked: boolean) => {
    setSelectedAppVersions((prev) =>
      checked ? [...prev, version] : prev.filter((v) => v !== version)
    );
  };

  const handleNetworkChange = (network: string, checked: boolean) => {
    setSelectedNetworks((prev) =>
      checked ? [...prev, network] : prev.filter((n) => n !== network)
    );
  };

  // Clear all local filter states
  const handleClearAllFilters = () => {
    setSelectedApps([]);
    setSelectedOS([]);
    setSelectedOSVersions([]);
    setSelectedCategories([]);
    setSelectedEvents([]);
    setSelectedPlatforms([]);
    setSelectedCountries([]);
    setSelectedAppVersions([]);
    setSelectedNetworks([]);
    setDateRange({ from: yesterday, to: today });
    onClearAllFilters();
  };

  // Clear individual filter state
  const handleClearFilter = (filterType: string) => {
    switch (filterType) {
      case "app_name":
        setSelectedApps([]);
        break;
      case "os_name":
        setSelectedOS([]);
        break;
      case "os_version":
        setSelectedOSVersions([]);
        break;
      case "category":
        setSelectedCategories([]);
        break;
      case "event_name":
        setSelectedEvents([]);
        break;
      case "platform":
        setSelectedPlatforms([]);
        break;
      case "country":
        setSelectedCountries([]);
        break;
      case "app_version":
        setSelectedAppVersions([]);
        break;
      case "network":
        setSelectedNetworks([]);
        break;
      case "date_range":
        setDateRange({ from: yesterday, to: today });
        break;
    }
    onClearFilter(filterType);
  };

  // Show loading state while fetching menu data
  if (isMenuLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-muted-foreground text-sm">
          {t("filters.loadingFilters")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Applied Filters Display */}
      {hasAppliedFilters && (
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(dateFilter.from || dateFilter.to) && (
              <FilterBadge
                label={t("filters.dateRange")}
                filterValue={`${dateFilter.from ? format(dateFilter.from, "MMM d") : ""} - ${dateFilter.to ? format(dateFilter.to, "MMM d") : ""}`}
                onClear={() => handleClearFilter("date_range")}
                t={t}
              />
            )}
            {appFilter && (
              <FilterBadge
                label={t("filters.appName")}
                filterValue={appFilter}
                onClear={() => handleClearFilter("app_name")}
                t={t}
              />
            )}
            {appVersionFilter && (
              <FilterBadge
                label={t("filters.appVersion")}
                filterValue={appVersionFilter}
                onClear={() => handleClearFilter("app_version")}
                t={t}
              />
            )}
            {osVersionFilter && (
              <FilterBadge
                label="OS Version"
                filterValue={osVersionFilter}
                onClear={() => handleClearFilter("os_version")}
                t={t}
              />
            )}
            {platformFilter && (
              <FilterBadge
                label={t("filters.platform")}
                filterValue={platformFilter}
                onClear={() => handleClearFilter("platform")}
                t={t}
              />
            )}
            {countryFilter && (
              <FilterBadge
                label={t("filters.nation")}
                filterValue={countryFilter}
                onClear={() => handleClearFilter("country")}
                t={t}
              />
            )}
            {osFilter && (
              <FilterBadge
                label={t("filters.osName")}
                filterValue={osFilter}
                onClear={() => handleClearFilter("os_name")}
                t={t}
              />
            )}
            {categoryFilter && (
              <FilterBadge
                label={t("filters.category")}
                filterValue={categoryFilter}
                onClear={() => handleClearFilter("category")}
                t={t}
              />
            )}
            {eventFilter && (
              <FilterBadge
                label={t("filters.eventType")}
                filterValue={eventFilter}
                onClear={() => handleClearFilter("event_name")}
                t={t}
              />
            )}
            {networkFilter && (
              <FilterBadge
                label={t("filters.network")}
                filterValue={networkFilter}
                onClear={() => handleClearFilter("network")}
                t={t}
              />
            )}
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="text-muted-foreground h-7 px-3 text-xs font-medium transition-all duration-200"
            >
              {t("filters.clearAllFilters")}
            </Button>
          </div>
        </div>
      )}

      {/* Filter Tags Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Date Range Filter */}
        <DateRangeFilter
          title={t("filters.dateRange")}
          dateRange={dateRange}
          onChange={setDateRange}
          onApply={applyFilters}
        />

        {/* App Filter */}
        <FilterPopover
          title={t("filters.appName")}
          label={t("filters.filterByApp")}
          options={appOptions}
          selectedValues={selectedApps}
          onChange={handleAppChange}
          onApply={applyFilters}
        />

        {/* App Version Filter */}
        <FilterPopover
          title={t("filters.appVersion")}
          label={t("filters.filterByAppVersion")}
          options={appVersionOptions}
          selectedValues={selectedAppVersions}
          onChange={handleAppVersionChange}
          onApply={applyFilters}
        />

        {/* Platform Filter */}
        <FilterPopover
          title={t("filters.platform")}
          label={t("filters.filterByPlatform")}
          options={platformOptions}
          selectedValues={selectedPlatforms}
          onChange={handlePlatformChange}
          onApply={applyFilters}
        />

        {/* Country Filter */}
        <FilterPopover
          title={t("filters.nation")}
          label={t("filters.filterByCountry")}
          options={countryOptions}
          selectedValues={selectedCountries}
          onChange={handleCountryChange}
          onApply={applyFilters}
        />

        {/* OS Filter */}
        <FilterPopover
          title={t("filters.osName")}
          label={t("filters.filterByOS")}
          options={osOptions}
          selectedValues={selectedOS}
          onChange={handleOSChange}
          onApply={applyFilters}
        />

        {/* OS Version Filter */}
        <FilterPopover
          title="OS Version"
          label="Filter by OS Version"
          options={osVersionOptions}
          selectedValues={selectedOSVersions}
          onChange={handleOSVersionChange}
          onApply={applyFilters}
        />

        {/* Category Filter */}
        <FilterPopover
          title={t("filters.category")}
          label={t("filters.filterByCategory")}
          options={categoryOptions}
          selectedValues={selectedCategories}
          onChange={handleCategoryChange}
          onApply={applyFilters}
        />

        {/* Event Filter */}
        <FilterPopover
          title={t("filters.eventType")}
          label={t("filters.filterByEvent")}
          options={eventOptions}
          selectedValues={selectedEvents}
          onChange={handleEventChange}
          onApply={applyFilters}
        />

        {/* Network Filter */}
        <FilterPopover
          title={t("filters.network")}
          label={t("filters.filterByNetwork")}
          options={networkOptions}
          selectedValues={selectedNetworks}
          onChange={handleNetworkChange}
          onApply={applyFilters}
        />
      </div>
    </div>
  );
}

interface FilterPopoverProps {
  title: string;
  label: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (value: string, checked: boolean) => void;
  onApply: () => void;
}

function FilterPopover({
  title,
  label,
  options,
  selectedValues,
  onChange,
  onApply,
}: FilterPopoverProps) {
  const t = useTranslations("AppInformationPage.table");

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <span className="border-border text-muted-foreground hover:bg-muted inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2 py-0.5 text-xs font-medium transition-colors">
            <PlusCircle className="size-3" />
            {title}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <div className="px-3 pt-3">
            <h3 className="text-foreground text-sm font-medium">{label}</h3>
          </div>
          <ScrollArea className="max-h-72">
            <div className="space-y-3 p-3">
              {options.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    {t("filters.noFiltersAvailable")}
                  </p>
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={option.value}
                      checked={selectedValues.includes(option.value)}
                      onCheckedChange={(checked) =>
                        onChange(option.value, checked === true)
                      }
                    />
                    <label
                      htmlFor={option.value}
                      className="text-foreground cursor-pointer text-sm"
                    >
                      {option.label}
                    </label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          {options.length > 0 && (
            <div className="border-border flex items-center justify-between border-t p-3">
              <Button onClick={onApply} className="w-full">
                {t("filters.applyFilter")}
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
