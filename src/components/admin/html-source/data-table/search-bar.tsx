"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, SearchIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  day: z.date().optional(),
  application: z.string().optional(),
  nation: z.string().optional(),
  device: z.string().optional(),
  platform: z.string().optional(),
  sourceKeyword: z.string().optional(),
});

type SearchBarProps = {
  onSearch: (values: z.infer<typeof formSchema>) => void;
  applications: { value: string; label: string }[];
  nations: { value: string; label: string }[];
  platforms: { value: string; label: string }[];
};

export function SearchBar({
  onSearch,
  applications = [],
  nations = [],
  platforms = [],
}: SearchBarProps) {
  // State for searchable dropdowns
  const [openApp, setOpenApp] = useState(false);
  const [openNation, setOpenNation] = useState(false);
  const [openPlatform, setOpenPlatform] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceKeyword: "",
      device: "",
      platform: "",
      application: "",
      nation: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSearch(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-wrap items-end gap-4"
      >
        {/* Day Selection */}
        <div className="flex w-full flex-col space-y-1.5 md:w-auto md:flex-1">
          <FormField
            control={form.control}
            name="day"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Day</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "h-10 w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        </div>

        {/* Application Selection with Command */}
        <div className="flex w-full flex-col space-y-1.5 md:w-auto md:flex-1">
          <FormField
            control={form.control}
            name="application"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Application</FormLabel>
                <Popover open={openApp} onOpenChange={setOpenApp}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openApp}
                        className="h-10 w-full justify-between"
                      >
                        {field.value && field.value !== "all"
                          ? applications.find(
                              (app) => app.value === field.value
                            )?.label || "All applications"
                          : "All applications"}
                        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search application..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No application found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all"
                            onSelect={() => {
                              form.setValue("application", "all");
                              setOpenApp(false);
                            }}
                            className="cursor-pointer"
                          >
                            All applications
                            <Check
                              className={cn(
                                "ml-auto",
                                field.value === "all" || !field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                          {applications.map((app) => (
                            <CommandItem
                              key={app.value}
                              value={app.value}
                              onSelect={() => {
                                form.setValue("application", app.value);
                                setOpenApp(false);
                              }}
                              className="cursor-pointer"
                            >
                              {app.label}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  field.value === app.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        </div>

        {/* Nation Selection with Command */}
        <div className="flex w-full flex-col space-y-1.5 md:w-auto md:flex-1">
          <FormField
            control={form.control}
            name="nation"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nation</FormLabel>
                <Popover open={openNation} onOpenChange={setOpenNation}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openNation}
                        className="h-10 w-full justify-between"
                      >
                        {field.value && field.value !== "all"
                          ? nations.find(
                              (nation) => nation.value === field.value
                            )?.label || "All nations"
                          : "All nations"}
                        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search nation..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No nation found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all"
                            onSelect={() => {
                              form.setValue("nation", "all");
                              setOpenNation(false);
                            }}
                            className="cursor-pointer"
                          >
                            All nations
                            <Check
                              className={cn(
                                "ml-auto",
                                field.value === "all" || !field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                          {nations.map((nation) => (
                            <CommandItem
                              key={nation.value}
                              value={nation.value}
                              onSelect={() => {
                                form.setValue("nation", nation.value);
                                setOpenNation(false);
                              }}
                              className="cursor-pointer"
                            >
                              {nation.label}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  field.value === nation.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        </div>

        {/* Platform Selection with Command */}
        <div className="flex w-full flex-col space-y-1.5 md:w-auto md:flex-1">
          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Platform</FormLabel>
                <Popover open={openPlatform} onOpenChange={setOpenPlatform}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openPlatform}
                        className="h-10 w-full justify-between"
                      >
                        {field.value && field.value !== "all"
                          ? platforms.find(
                              (platform) => platform.value === field.value
                            )?.label || "All platforms"
                          : "All platforms"}
                        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search platform..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No platform found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all"
                            onSelect={() => {
                              form.setValue("platform", "all");
                              setOpenPlatform(false);
                            }}
                            className="cursor-pointer"
                          >
                            All platforms
                            <Check
                              className={cn(
                                "ml-auto",
                                field.value === "all" || !field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                          {platforms.map((platform) => (
                            <CommandItem
                              key={platform.value}
                              value={platform.value}
                              onSelect={() => {
                                form.setValue("platform", platform.value);
                                setOpenPlatform(false);
                              }}
                              className="cursor-pointer"
                            >
                              {platform.label}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  field.value === platform.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        </div>

        {/* Device Input */}
        <div className="flex w-full flex-col space-y-1.5 md:w-auto md:flex-1">
          <FormField
            control={form.control}
            name="device"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Device</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter device ID"
                    {...field}
                    className="h-10"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Source Keyword Input */}
        <div className="flex w-full flex-col space-y-1.5 md:w-auto md:flex-1">
          <FormField
            control={form.control}
            name="sourceKeyword"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Source keyword</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      placeholder="Search in source"
                      {...field}
                      className="h-10"
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    size="icon"
                    className="h-10 w-10 flex-shrink-0"
                  >
                    <SearchIcon className="h-4 w-4" />
                  </Button>
                </div>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
