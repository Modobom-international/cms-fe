"use client";

import { useState } from "react";

import { endOfMonth, format, startOfMonth } from "date-fns";
import {
  Calendar,
  Clock,
  Download,
  FileText,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import {
  AttendanceType,
  IAttendanceReportParams,
  IAttendanceReportRecord,
} from "@/types/attendance.type";

import { useAttendanceReport } from "@/hooks/attendance";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AttendanceReport() {
  const [filters, setFilters] = useState<IAttendanceReportParams>({
    date: format(new Date(), "yyyy-MM-dd"),
    include_leave: true,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const { data: reportData, isLoading, refetch } = useAttendanceReport(filters);

  // Filter data based on search term
  const filteredData =
    reportData?.filter(
      (record) =>
        record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.branch_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleFilterChange = (
    key: keyof IAttendanceReportParams,
    value: any
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status: string, statusDisplay: string) => {
    const colors = {
      completed: "bg-green-100 text-green-800 border-green-200",
      incomplete: "bg-orange-100 text-orange-800 border-orange-200",
      on_leave: "bg-blue-100 text-blue-800 border-blue-200",
      remote_work: "bg-purple-100 text-purple-800 border-purple-200",
    } as const;

    return (
      <Badge
        variant="outline"
        className={
          colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {statusDisplay}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const headers = [
      "Employee Name",
      "Check-in Time",
      "Check-out Time",
      "Total Hours",
      "Status",
      "Branch",
    ];

    const csvData = [
      headers.join(","),
      ...filteredData.map((record) =>
        [
          record.employee_name,
          record.checkin_time || "N/A",
          record.checkout_time || "N/A",
          record.total_work_hours || "N/A",
          record.status_display,
          record.branch_name || "N/A",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${filters.date}.csv`;
    a.click();
  };

  const getReportSummary = () => {
    const total = filteredData.length;
    const present = filteredData.filter(
      (r) => r.status === "completed" || r.status === "incomplete"
    ).length;
    const onLeave = filteredData.filter((r) => r.status === "on_leave").length;
    const remoteWork = filteredData.filter(
      (r) => r.status === "remote_work"
    ).length;
    const totalHours = filteredData.reduce(
      (sum, record) => sum + (record.total_work_hours || 0),
      0
    );

    return { total, present, onLeave, remoteWork, totalHours };
  };

  const summary = getReportSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Attendance Report
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredData.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Attendance Type</Label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "type",
                    value === "all" ? undefined : (value as AttendanceType)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full_day">Full Day</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                placeholder="Filter by branch..."
                value={filters.branch_name || ""}
                onChange={(e) =>
                  handleFilterChange("branch_name", e.target.value || undefined)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Search Employee</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="search"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-2">
            <Checkbox
              id="include_leave"
              checked={filters.include_leave}
              onCheckedChange={(checked) =>
                handleFilterChange("include_leave", checked)
              }
            />
            <Label htmlFor="include_leave" className="text-sm">
              Include employees on leave
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total
                </p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
              <Users className="text-muted-foreground h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Present
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.present}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  On Leave
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.onLeave}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Remote
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {summary.remoteWork}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Hours
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {summary.totalHours.toFixed(1)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Attendance for{" "}
            {format(new Date(filters.date), "EEEE, MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">
                No attendance records found
              </h3>
              <p className="text-muted-foreground">
                No attendance data available for the selected date and filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Leave Info</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {record.employee_name}
                      </TableCell>
                      <TableCell>
                        {record.checkin_time ? (
                          <span className="font-mono">
                            {record.checkin_time}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.checkout_time ? (
                          <span className="font-mono">
                            {record.checkout_time}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.total_work_hours ? (
                          <span className="font-mono">
                            {record.total_work_hours}h
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status, record.status_display)}
                      </TableCell>
                      <TableCell>
                        {record.branch_name || (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.leave_info ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-medium">
                                  Leave Information
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <strong>Type:</strong>{" "}
                                    {record.leave_info.leave_type}
                                  </p>
                                  <p>
                                    <strong>Reason:</strong>{" "}
                                    {record.leave_info.reason}
                                  </p>
                                  {record.leave_info.remote_work_details && (
                                    <p>
                                      <strong>Location:</strong>{" "}
                                      {
                                        record.leave_info.remote_work_details
                                          .location
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
