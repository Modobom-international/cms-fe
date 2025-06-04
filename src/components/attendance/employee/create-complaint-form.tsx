"use client";

import { useState } from "react";

import { format } from "date-fns";
import { AlertTriangle, Calendar, Clock, FileText } from "lucide-react";

import {
  ComplaintType,
  ICreateComplaintRequest,
} from "@/types/attendance.type";

import { useCreateComplaint, useTodayAttendance } from "@/hooks/attendance";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CreateComplaintFormProps {
  employeeId: number;
  onSuccess: () => void;
}

export function CreateComplaintForm({
  employeeId,
  onSuccess,
}: CreateComplaintFormProps) {
  const [formData, setFormData] = useState({
    complaint_type: "" as ComplaintType,
    description: "",
    proposed_checkin_time: "",
    proposed_checkout_time: "",
    reason: "",
  });

  const { data: todayAttendance } = useTodayAttendance(employeeId);
  const createComplaintMutation = useCreateComplaint();

  const attendanceRecord = todayAttendance?.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!attendanceRecord) {
      return;
    }

    const proposedChanges: Record<string, any> = {};

    if (formData.proposed_checkin_time) {
      proposedChanges.checkin_time = `${attendanceRecord.date} ${formData.proposed_checkin_time}:00`;
    }

    if (formData.proposed_checkout_time) {
      proposedChanges.checkout_time = `${attendanceRecord.date} ${formData.proposed_checkout_time}:00`;
    }

    if (formData.reason) {
      proposedChanges.reason = formData.reason;
    }

    const complaintData: ICreateComplaintRequest = {
      attendance_id: attendanceRecord.id,
      complaint_type: formData.complaint_type,
      description: formData.description,
      proposed_changes: proposedChanges,
    };

    try {
      await createComplaintMutation.mutateAsync(complaintData);
      onSuccess();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const complaintTypes = [
    {
      value: "incorrect_time",
      label: "Incorrect Time",
      description: "Check-in or check-out time is wrong",
    },
    {
      value: "missing_record",
      label: "Missing Record",
      description: "Attendance record is missing",
    },
    {
      value: "technical_issue",
      label: "Technical Issue",
      description: "System or app problems",
    },
    {
      value: "other",
      label: "Other",
      description: "Other attendance-related issues",
    },
  ] as const;

  if (!attendanceRecord) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No attendance record found for today. You need to check in first
          before filing a complaint.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Attendance Record */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h4 className="font-medium">Current Attendance Record</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Date</Label>
                <p>
                  {format(
                    new Date(attendanceRecord.date),
                    "EEEE, MMMM d, yyyy"
                  )}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <p className="capitalize">
                  {attendanceRecord.type.replace("_", " ")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Check-in Time</Label>
                <p>
                  {attendanceRecord.checkin_time
                    ? format(new Date(attendanceRecord.checkin_time), "HH:mm")
                    : "Not recorded"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Check-out Time</Label>
                <p>
                  {attendanceRecord.checkout_time
                    ? format(new Date(attendanceRecord.checkout_time), "HH:mm")
                    : "Not recorded"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaint Type */}
      <div className="space-y-2">
        <Label htmlFor="complaint_type">Complaint Type *</Label>
        <Select
          value={formData.complaint_type}
          onValueChange={(value: ComplaintType) =>
            setFormData((prev) => ({ ...prev, complaint_type: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select complaint type" />
          </SelectTrigger>
          <SelectContent>
            {complaintTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex flex-col items-start">
                  <span>{type.label}</span>
                  <span className="text-muted-foreground text-xs">
                    {type.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Please describe the issue in detail..."
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={4}
          required
        />
      </div>

      {/* Proposed Changes */}
      {(formData.complaint_type === "incorrect_time" ||
        formData.complaint_type === "missing_record") && (
        <div className="space-y-4">
          <Label className="text-base font-medium">Proposed Corrections</Label>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proposed_checkin_time">
                Correct Check-in Time
              </Label>
              <Input
                id="proposed_checkin_time"
                type="time"
                value={formData.proposed_checkin_time}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    proposed_checkin_time: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposed_checkout_time">
                Correct Check-out Time
              </Label>
              <Input
                id="proposed_checkout_time"
                type="time"
                value={formData.proposed_checkout_time}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    proposed_checkout_time: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Correction</Label>
            <Textarea
              id="reason"
              placeholder="Explain why these times are correct..."
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            !formData.complaint_type ||
            !formData.description ||
            createComplaintMutation.isPending
          }
        >
          {createComplaintMutation.isPending
            ? "Submitting..."
            : "Submit Complaint"}
        </Button>
      </div>
    </form>
  );
}
