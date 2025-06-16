"use client";

import { useState } from "react";

import {
  CheckCircle,
  Clock,
  Eye,
  FileText,
  MessageSquare,
  Plus,
  XCircle,
} from "lucide-react";

import {
  ComplaintStatus,
  ComplaintType,
  IAttendanceComplaint,
} from "@/types/attendance.type";

import { formatDateForDisplay, formatDateTimeForDisplay } from "@/lib/utils";

import { useAttendanceComplaints } from "@/hooks/attendance";
import { useIsClient } from "@/hooks/use-client";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ComplaintDetails } from "./complaint-details";
import { CreateComplaintForm } from "./create-complaint-form";

interface ComplaintsListProps {
  employeeId: number;
}

export function ComplaintsList({ employeeId }: ComplaintsListProps) {
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | "all">(
    "all"
  );
  const [selectedComplaint, setSelectedComplaint] =
    useState<IAttendanceComplaint | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const isClient = useIsClient();

  const { data: complaintsData, isLoading } = useAttendanceComplaints({
    status: selectedStatus === "all" ? undefined : selectedStatus,
  });

  const complaints = complaintsData?.data || [];

  const formatDateTime = (dateString: string | null | undefined) => {
    return formatDateTimeForDisplay(dateString, isClient);
  };

  const formatDate = (dateString: string | null | undefined) => {
    return formatDateForDisplay(dateString, isClient);
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
    const labels = {
      incorrect_time: "Incorrect Time",
      missing_record: "Missing Record",
      technical_issue: "Technical Issue",
      other: "Other",
    };
    return labels[type];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Attendance Complaints
            </div>
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Complaint
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>File Attendance Complaint</DialogTitle>
                </DialogHeader>
                <CreateComplaintForm
                  employeeId={employeeId}
                  onSuccess={() => setShowCreateForm(false)}
                />
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Filter Tabs */}
      <Tabs
        value={selectedStatus}
        onValueChange={(value) =>
          setSelectedStatus(value as ComplaintStatus | "all")
        }
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="under_review">Under Review</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-6">
          {complaints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-medium">
                  No complaints found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {selectedStatus === "all"
                    ? "You haven't filed any attendance complaints yet."
                    : `No ${selectedStatus.replace("_", " ")} complaints found.`}
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  File First Complaint
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <Card
                  key={complaint.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <FileText className="text-muted-foreground h-4 w-4" />
                          <span className="font-medium">
                            {getComplaintTypeLabel(complaint.complaint_type)}
                          </span>
                          {getStatusBadge(complaint.status)}
                        </div>

                        <p className="text-muted-foreground line-clamp-2 text-sm">
                          {complaint.description}
                        </p>

                        <div className="text-muted-foreground flex items-center gap-4 text-xs">
                          <span>
                            Filed {formatDateTime(complaint.created_at)}
                          </span>
                          {complaint.attendance && (
                            <span>
                              For {formatDate(complaint.attendance.date)}
                            </span>
                          )}
                        </div>

                        {complaint.admin_response && (
                          <div className="bg-muted mt-3 rounded-lg p-3">
                            <div className="text-muted-foreground mb-1 text-xs font-medium">
                              Admin Response:
                            </div>
                            <p className="text-sm">
                              {complaint.admin_response}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Complaint Details Dialog */}
      <Dialog
        open={!!selectedComplaint}
        onOpenChange={() => setSelectedComplaint(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <ComplaintDetails
              complaint={selectedComplaint}
              onClose={() => setSelectedComplaint(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
