"use client";

import { useState } from "react";

import { format } from "date-fns";
import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Filter,
  MessageSquare,
  RefreshCw,
  Search,
  User,
  XCircle,
} from "lucide-react";

import {
  ComplaintStatus,
  ComplaintType,
  IAttendanceComplaint,
  ICustomAttendanceRequest,
} from "@/types/attendance.type";

import {
  convertUtcToVietnamTime,
  convertVietnamTimeToUtc,
  formatDateTimeForDisplay,
  formatFullDateTime,
  prepareTimeForApi,
} from "@/lib/utils";

import {
  useAdminAttendanceComplaints,
  useRespondToComplaint,
  useUpdateCustomAttendance,
} from "@/hooks/attendance";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";

interface ComplaintFilters {
  status?: ComplaintStatus;
  complaint_type?: ComplaintType;
  startDate?: string;
  endDate?: string;
}

interface CustomTimeInputs {
  checkin_time?: string;
  checkout_time?: string;
}

export function ComplaintsManagement() {
  const [filters, setFilters] = useState<ComplaintFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComplaint, setSelectedComplaint] =
    useState<IAttendanceComplaint | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responseAction, setResponseAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [customTimeInputs, setCustomTimeInputs] = useState<CustomTimeInputs>(
    {}
  );
  const [useCustomTime, setUseCustomTime] = useState(false);

  const {
    data: complaintsResponse,
    isLoading,
    refetch,
  } = useAdminAttendanceComplaints({});
  const { mutate: respondToComplaint, isPending: isResponding } =
    useRespondToComplaint();
  const { mutate: updateCustomAttendance } = useUpdateCustomAttendance();

  // Extract complaints from paginated response and filter based on filters and search
  const complaints = complaintsResponse?.data || [];
  const filteredComplaints = complaints.filter(
    (complaint: IAttendanceComplaint) => {
      const employeeName = complaint.employee?.name || "";
      const matchesSearch = employeeName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        !filters.status || complaint.status === filters.status;
      const matchesType =
        !filters.complaint_type ||
        complaint.complaint_type === filters.complaint_type;

      let matchesDateRange = true;
      if (filters.startDate) {
        matchesDateRange =
          new Date(complaint.created_at) >= new Date(filters.startDate);
      }
      if (filters.endDate && matchesDateRange) {
        matchesDateRange =
          new Date(complaint.created_at) <= new Date(filters.endDate);
      }

      return matchesSearch && matchesStatus && matchesType && matchesDateRange;
    }
  );

  const handleFilterChange = (key: keyof ComplaintFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    const configs = {
      pending: {
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending",
      },
      under_review: {
        icon: Eye,
        className: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Under Review",
      },
      resolved: {
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 border-green-200",
        label: "Resolved",
      },
      rejected: {
        icon: XCircle,
        className: "bg-red-100 text-red-800 border-red-200",
        label: "Rejected",
      },
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getComplaintTypeLabel = (type: ComplaintType) => {
    const labels: Record<ComplaintType, string> = {
      incorrect_time: "Incorrect Time",
      missing_record: "Missing Record",
      technical_issue: "Technical Issue",
      other: "Other",
    };

    return labels[type] || type;
  };

  const handleResponse = (
    complaint: IAttendanceComplaint,
    action: "approve" | "reject"
  ) => {
    setSelectedComplaint(complaint);
    setResponseAction(action);
    setResponseText("");

    // Initialize custom time inputs with proposed changes if they exist
    if (complaint.proposed_changes) {
      const proposedTimes = {
        checkin_time: complaint.proposed_changes.checkin_time
          ? formatFullDateTime(complaint.proposed_changes.checkin_time)
          : "",
        checkout_time: complaint.proposed_changes.checkout_time
          ? formatFullDateTime(complaint.proposed_changes.checkout_time)
          : "",
      };
      setCustomTimeInputs(proposedTimes);
    } else {
      setCustomTimeInputs({});
    }

    setIsResponseDialogOpen(true);
  };

  const submitResponse = () => {
    if (!selectedComplaint || !responseAction || !responseText.trim()) return;

    const responseData = {
      complaintId: selectedComplaint.id,
      response_type: responseAction,
      admin_response: responseText,
      ...(responseAction === "approve" && {
        attendance_data: {
          date:
            selectedComplaint.attendance?.date ||
            format(new Date(), "yyyy-MM-dd"),
          ...(useCustomTime
            ? prepareTimeForApi(customTimeInputs)
            : selectedComplaint.proposed_changes),
          type: selectedComplaint.attendance?.type || "full_day",
          description: "Manually created from approved complaint",
        },
      }),
    };

    respondToComplaint(responseData, {
      onSuccess: (response) => {
        // No need to make a separate call to update attendance
        // as it's handled by the complaint response API
        setIsResponseDialogOpen(false);
        setSelectedComplaint(null);
        setResponseAction(null);
        setResponseText("");
        setCustomTimeInputs({});
        setUseCustomTime(false);
        refetch();
      },
    });
  };

  const getComplaintSummary = () => {
    const total = filteredComplaints.length;
    const pending = filteredComplaints.filter(
      (c: IAttendanceComplaint) => c.status === "pending"
    ).length;
    const resolved = filteredComplaints.filter(
      (c: IAttendanceComplaint) => c.status === "resolved"
    ).length;
    const rejected = filteredComplaints.filter(
      (c: IAttendanceComplaint) => c.status === "rejected"
    ).length;
    const underReview = filteredComplaints.filter(
      (c: IAttendanceComplaint) => c.status === "under_review"
    ).length;

    return { total, pending, resolved, rejected, underReview };
  };

  const summary = getComplaintSummary();

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Employee",
      "Type",
      "Status",
      "Created",
      "Description",
    ];

    const csvData = [
      headers.join(","),
      ...filteredComplaints.map((complaint: IAttendanceComplaint) =>
        [
          complaint.id,
          complaint.employee?.name || "N/A",
          getComplaintTypeLabel(complaint.complaint_type),
          complaint.status,
          formatFullDateTime(complaint.created_at),
          complaint.description.replace(/,/g, ";"), // Replace commas to avoid CSV issues
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complaints-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Attendance Complaints Management
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
                disabled={filteredComplaints.length === 0}
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
              <Label htmlFor="search">Search Employee</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="search"
                  placeholder="Search by employee name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "status",
                    value === "all" ? undefined : (value as ComplaintStatus)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={filters.complaint_type || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "complaint_type",
                    value === "all" ? undefined : (value as ComplaintType)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="incorrect_time">Incorrect Time</SelectItem>
                  <SelectItem value="missing_record">Missing Record</SelectItem>
                  <SelectItem value="technical_issue">
                    Technical Issue
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Date Range</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value || undefined)
                  }
                  placeholder="Start date"
                />
                <Input
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value || undefined)
                  }
                  placeholder="End date"
                />
              </div>
            </div>
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
              <MessageSquare className="text-muted-foreground h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {summary.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Under Review
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.underReview}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Resolved
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.resolved}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Rejected
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {summary.rejected}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Complaints List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">No complaints found</h3>
              <p className="text-muted-foreground">
                No complaints match your current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-mono text-sm">
                        #{complaint.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {complaint.employee?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {getComplaintTypeLabel(complaint.complaint_type)}
                      </TableCell>
                      <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-sm">
                            {formatDateTimeForDisplay(complaint.created_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate" title={complaint.description}>
                          {complaint.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Complaint #{complaint.id} -{" "}
                                  {getComplaintTypeLabel(
                                    complaint.complaint_type
                                  )}
                                </DialogTitle>
                                <DialogDescription>
                                  Submitted by{" "}
                                  {complaint.employee?.name || "N/A"} on{" "}
                                  {formatFullDateTime(complaint.created_at)}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1">
                                    {getStatusBadge(complaint.status)}
                                  </div>
                                </div>

                                <div>
                                  <Label>Description</Label>
                                  <p className="mt-1 text-sm">
                                    {complaint.description}
                                  </p>
                                </div>

                                {complaint.proposed_changes &&
                                  Object.keys(complaint.proposed_changes)
                                    .length > 0 && (
                                    <div>
                                      <Label>Proposed Changes</Label>
                                      <div className="mt-1 space-y-1 text-sm">
                                        {Object.entries(
                                          complaint.proposed_changes
                                        ).map(([key, value]) => (
                                          <p key={key}>
                                            <strong>{key}:</strong>{" "}
                                            {key === "checkin_time" ||
                                            key === "checkout_time"
                                              ? formatDateTimeForDisplay(
                                                  value as string
                                                )
                                              : String(value)}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                {complaint.admin_response && (
                                  <div>
                                    <Label>Admin Response</Label>
                                    <p className="mt-1 text-sm">
                                      {complaint.admin_response}
                                    </p>
                                  </div>
                                )}

                                {complaint.attendance && (
                                  <div>
                                    <Label>Related Attendance Record</Label>
                                    <div className="mt-2 rounded-lg border p-4">
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div>
                                          <span className="text-muted-foreground">
                                            Date:
                                          </span>{" "}
                                          <span className="font-medium">
                                            {formatDateTimeForDisplay(
                                              complaint.attendance.date
                                            )}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">
                                            Type:
                                          </span>{" "}
                                          <span className="font-medium capitalize">
                                            {complaint.attendance.type}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">
                                            Check-in:
                                          </span>{" "}
                                          <span className="font-medium">
                                            {complaint.attendance.checkin_time
                                              ? formatDateTimeForDisplay(
                                                  complaint.attendance
                                                    .checkin_time
                                                )
                                              : "Not recorded"}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">
                                            Check-out:
                                          </span>{" "}
                                          <span className="font-medium">
                                            {complaint.attendance.checkout_time
                                              ? formatDateTimeForDisplay(
                                                  complaint.attendance
                                                    .checkout_time
                                                )
                                              : "Not recorded"}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">
                                            Total Hours:
                                          </span>{" "}
                                          <span className="font-medium">
                                            {complaint.attendance
                                              .total_work_hours
                                              ? `${complaint.attendance.total_work_hours} hours`
                                              : "N/A"}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">
                                            Status:
                                          </span>{" "}
                                          <Badge
                                            variant="outline"
                                            className={
                                              complaint.attendance.status ===
                                              "completed"
                                                ? "border-green-200 bg-green-50 text-green-700"
                                                : complaint.attendance
                                                      .status === "incomplete"
                                                  ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                                                  : complaint.attendance
                                                        .status === "on_leave"
                                                    ? "border-blue-200 bg-blue-50 text-blue-700"
                                                    : "border-purple-200 bg-purple-50 text-purple-700"
                                            }
                                          >
                                            {complaint.attendance.status
                                              .replace("_", " ")
                                              .toUpperCase()}
                                          </Badge>
                                        </div>
                                        {complaint.attendance.branch_name && (
                                          <div className="col-span-2">
                                            <span className="text-muted-foreground">
                                              Branch:
                                            </span>{" "}
                                            <span className="font-medium">
                                              {complaint.attendance.branch_name}
                                            </span>
                                          </div>
                                        )}
                                        {complaint.attendance.description && (
                                          <div className="col-span-2">
                                            <span className="text-muted-foreground">
                                              Description:
                                            </span>{" "}
                                            <span className="font-medium">
                                              {complaint.attendance.description}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {complaint.status === "pending" && (
                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      onClick={() =>
                                        handleResponse(complaint, "approve")
                                      }
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() =>
                                        handleResponse(complaint, "reject")
                                      }
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {complaint.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleResponse(complaint, "approve")
                                }
                                className="text-green-600 hover:bg-green-50 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleResponse(complaint, "reject")
                                }
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog
        open={isResponseDialogOpen}
        onOpenChange={setIsResponseDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {responseAction === "approve" ? "Approve" : "Reject"} Complaint
            </DialogTitle>
            <DialogDescription>
              {responseAction === "approve"
                ? "Approve this attendance complaint and provide feedback."
                : "Reject this attendance complaint and provide a reason."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedComplaint && (
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  <strong>{selectedComplaint.employee?.name || "N/A"}</strong> -{" "}
                  {getComplaintTypeLabel(selectedComplaint.complaint_type)}
                  <br />
                  {selectedComplaint.description}
                </AlertDescription>
              </Alert>
            )}

            {selectedComplaint &&
              responseAction === "approve" &&
              selectedComplaint.proposed_changes && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <strong className="text-green-800">
                      Proposed Changes:
                    </strong>
                    <div className="mt-2 space-y-1 text-sm">
                      {Object.entries(selectedComplaint.proposed_changes).map(
                        ([key, value]) => {
                          // Special handling for time fields
                          if (
                            key === "checkin_time" ||
                            key === "checkout_time"
                          ) {
                            return (
                              <div key={key} className="grid grid-cols-2 gap-2">
                                <span className="font-medium">
                                  {key === "checkin_time"
                                    ? "Check-in Time"
                                    : "Check-out Time"}
                                  :
                                </span>
                                <span>
                                  {formatDateTimeForDisplay(value as string)}
                                </span>
                              </div>
                            );
                          }
                          return (
                            <div key={key} className="grid grid-cols-2 gap-2">
                              <span className="font-medium">{key}:</span>
                              <span>{String(value)}</span>
                            </div>
                          );
                        }
                      )}
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-800 hover:bg-green-100"
                        onClick={() => {
                          // Initialize with the proposed times in local format
                          const proposedTimes = {
                            checkin_time: selectedComplaint.proposed_changes
                              ?.checkin_time
                              ? formatDateTimeForDisplay(
                                  selectedComplaint.proposed_changes
                                    .checkin_time as string
                                )
                              : "",
                            checkout_time: selectedComplaint.proposed_changes
                              ?.checkout_time
                              ? formatDateTimeForDisplay(
                                  selectedComplaint.proposed_changes
                                    .checkout_time as string
                                )
                              : "",
                          };
                          setCustomTimeInputs(proposedTimes);
                          setUseCustomTime(false);
                        }}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Use Proposed Times
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

            <div className="space-y-4">
              {responseAction === "approve" && (
                <>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="useCustomTime">Time Update Method:</Label>
                    <Select
                      value={useCustomTime ? "custom" : "proposed"}
                      onValueChange={(value) => {
                        setUseCustomTime(value === "custom");
                        if (
                          value === "proposed" &&
                          selectedComplaint?.proposed_changes
                        ) {
                          // Reset to proposed times when switching back
                          const proposedTimes = {
                            checkin_time: selectedComplaint.proposed_changes
                              ?.checkin_time
                              ? formatDateTimeForDisplay(
                                  selectedComplaint.proposed_changes
                                    .checkin_time as string
                                )
                              : "",
                            checkout_time: selectedComplaint.proposed_changes
                              ?.checkout_time
                              ? formatDateTimeForDisplay(
                                  selectedComplaint.proposed_changes
                                    .checkout_time as string
                                )
                              : "",
                          };
                          setCustomTimeInputs(proposedTimes);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select time update method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="proposed">
                          Use Proposed Times
                        </SelectItem>
                        <SelectItem value="custom">Use Custom Times</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {useCustomTime && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-medium">Custom Time Input</h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="checkin_time">Check-in Time</Label>
                          <Input
                            type="datetime-local"
                            id="checkin_time"
                            value={customTimeInputs.checkin_time || ""}
                            onChange={(e) =>
                              setCustomTimeInputs((prev) => ({
                                ...prev,
                                checkin_time: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="checkout_time">Check-out Time</Label>
                          <Input
                            type="datetime-local"
                            id="checkout_time"
                            value={customTimeInputs.checkout_time || ""}
                            onChange={(e) =>
                              setCustomTimeInputs((prev) => ({
                                ...prev,
                                checkout_time: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="response">
                {responseAction === "approve"
                  ? "Approval Notes"
                  : "Rejection Reason"}{" "}
                *
              </Label>
              <Textarea
                id="response"
                placeholder={
                  responseAction === "approve"
                    ? "Provide any additional notes about the approval..."
                    : "Explain why this complaint is being rejected..."
                }
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsResponseDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={submitResponse}
                disabled={!responseText.trim() || isResponding}
                className={
                  responseAction === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {isResponding
                  ? "Processing..."
                  : responseAction === "approve"
                    ? "Approve Complaint"
                    : "Reject Complaint"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
