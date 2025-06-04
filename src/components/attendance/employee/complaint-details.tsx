"use client";

import { format } from "date-fns";
import {
  Calendar,
  CheckCircle,
  Clock,
  Edit2,
  Eye,
  FileText,
  MessageSquare,
  User,
  XCircle,
} from "lucide-react";

import {
  ComplaintStatus,
  ComplaintType,
  IAttendanceComplaint,
} from "@/types/attendance.type";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ComplaintDetailsProps {
  complaint: IAttendanceComplaint;
  onClose: () => void;
  onEdit?: () => void;
}

export function ComplaintDetails({
  complaint,
  onClose,
  onEdit,
}: ComplaintDetailsProps) {
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

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' HH:mm");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">
            {getComplaintTypeLabel(complaint.complaint_type)} - #{complaint.id}
          </h3>
          <p className="text-muted-foreground text-sm">
            Filed {formatDateTime(complaint.created_at)}
          </p>
        </div>
        {getStatusBadge(complaint.status)}
      </div>

      {/* Complaint Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Complaint Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium">Description</h4>
            <p className="text-muted-foreground text-sm">
              {complaint.description}
            </p>
          </div>

          {Object.keys(complaint.proposed_changes).length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="mb-3 text-sm font-medium">Proposed Changes</h4>
                <div className="space-y-2">
                  {Object.entries(complaint.proposed_changes).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium capitalize">
                          {key.replace("_", " ").replace("time", " Time")}:
                        </span>
                        <span className="text-muted-foreground">
                          {typeof value === "string" && key.includes("time")
                            ? format(new Date(value), "HH:mm")
                            : String(value)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Related Attendance Record */}
      {complaint.attendance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Related Attendance Record
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Date:</span>
                <p className="text-muted-foreground">
                  {format(
                    new Date(complaint.attendance.date),
                    "EEEE, MMMM d, yyyy"
                  )}
                </p>
              </div>
              <div>
                <span className="font-medium">Type:</span>
                <p className="text-muted-foreground capitalize">
                  {complaint.attendance.type.replace("_", " ")}
                </p>
              </div>
              <div>
                <span className="font-medium">Check-in:</span>
                <p className="text-muted-foreground">
                  {complaint.attendance.checkin_time
                    ? format(
                        new Date(complaint.attendance.checkin_time),
                        "HH:mm"
                      )
                    : "Not recorded"}
                </p>
              </div>
              <div>
                <span className="font-medium">Check-out:</span>
                <p className="text-muted-foreground">
                  {complaint.attendance.checkout_time
                    ? format(
                        new Date(complaint.attendance.checkout_time),
                        "HH:mm"
                      )
                    : "Not recorded"}
                </p>
              </div>
              {complaint.attendance.total_work_hours && (
                <div className="col-span-2">
                  <span className="font-medium">Total Hours:</span>
                  <p className="text-muted-foreground">
                    {complaint.attendance.total_work_hours} hours
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Response */}
      {complaint.admin_response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              Admin Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm">{complaint.admin_response}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                Updated {formatDateTime(complaint.updated_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Complaint filed</p>
                <p className="text-muted-foreground text-xs">
                  {formatDateTime(complaint.created_at)}
                </p>
              </div>
            </div>

            {complaint.status !== "pending" && (
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Status updated to {complaint.status.replace("_", " ")}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatDateTime(complaint.updated_at)}
                  </p>
                </div>
              </div>
            )}

            {complaint.admin_response && (
              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${
                    complaint.status === "resolved"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Admin response added</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDateTime(complaint.updated_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {complaint.status === "pending" && onEdit && (
          <Button onClick={onEdit} className="flex items-center gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Complaint
          </Button>
        )}
      </div>
    </div>
  );
}
