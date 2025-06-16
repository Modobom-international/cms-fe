"use client";

import { useState } from "react";

import { format } from "date-fns";
import { format as formatDate, parseISO } from "date-fns";
import { AlertTriangle, Calendar } from "lucide-react";

import {
  ComplaintType,
  ICreateComplaintRequest,
} from "@/types/attendance.type";

import { vietnamDateToUtcString } from "@/lib/utils";

import { useAttendanceByDate, useCreateComplaint } from "@/hooks/attendance";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
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
    proposed_attendance_type: "full_day" as "full_day" | "half_day",
    reason: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: attendanceData } = useAttendanceByDate(
    employeeId,
    formatDate(selectedDate, "yyyy-MM-dd")
  );
  const createComplaintMutation = useCreateComplaint();

  const attendanceRecord = attendanceData?.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submission - Input values:", {
      attendanceDate:
        attendanceRecord?.date || formatDate(selectedDate, "yyyy-MM-dd"),
      proposedCheckinTime: formData.proposed_checkin_time,
      proposedCheckoutTime: formData.proposed_checkout_time,
    });

    const proposedChanges: Record<string, any> = {};

    // Convert the UTC ISO date to a plain date string
    const plainDate = attendanceRecord
      ? formatDate(parseISO(attendanceRecord.date), "yyyy-MM-dd")
      : formatDate(selectedDate, "yyyy-MM-dd");
    console.log("Using plain date:", plainDate);

    if (formData.proposed_checkin_time) {
      const timeWithSeconds = `${formData.proposed_checkin_time}:00`;
      const fullDateTime = `${plainDate}T${timeWithSeconds}`;
      console.log("Converting check-in time:", {
        fullDateTime,
        timezone: "Asia/Ho_Chi_Minh",
      });

      try {
        // Create a Date object in Vietnam timezone
        const vietnamDate = new Date(fullDateTime);
        proposedChanges.checkin_time = vietnamDateToUtcString(vietnamDate);
        console.log(
          "Converted check-in time (UTC):",
          proposedChanges.checkin_time
        );
      } catch (error) {
        console.error("Error converting check-in time:", error);
        throw error;
      }
    }

    if (formData.proposed_checkout_time) {
      const timeWithSeconds = `${formData.proposed_checkout_time}:00`;
      const fullDateTime = `${plainDate}T${timeWithSeconds}`;
      console.log("Converting check-out time:", {
        fullDateTime,
        timezone: "Asia/Ho_Chi_Minh",
      });

      try {
        // Create a Date object in Vietnam timezone
        const vietnamDate = new Date(fullDateTime);
        proposedChanges.checkout_time = vietnamDateToUtcString(vietnamDate);
        console.log(
          "Converted check-out time (UTC):",
          proposedChanges.checkout_time
        );
      } catch (error) {
        console.error("Error converting check-out time:", error);
        throw error;
      }
    }

    if (formData.reason) {
      proposedChanges.reason = formData.reason;
    }

    // For missing record complaints, include date and type
    if (!attendanceRecord && formData.complaint_type === "missing_record") {
      proposedChanges.date = plainDate;
      proposedChanges.type = formData.proposed_attendance_type;
    }

    const complaintData: ICreateComplaintRequest = {
      ...(attendanceRecord && { attendance_id: attendanceRecord.id }),
      complaint_type: formData.complaint_type,
      description: formData.description,
      proposed_changes: proposedChanges,
    };

    console.log("Final complaint data:", complaintData);

    try {
      await createComplaintMutation.mutateAsync(complaintData);
      onSuccess();
    } catch (error) {
      console.error("Error submitting complaint:", error);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date Selection */}
      <div className="space-y-2">
        <Label>Select Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Current Attendance Record */}
      {attendanceRecord ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h4 className="font-medium">Selected Attendance Record</h4>
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
                  <Label className="text-muted-foreground">
                    Check-out Time
                  </Label>
                  <p>
                    {attendanceRecord.checkout_time
                      ? format(
                          new Date(attendanceRecord.checkout_time),
                          "HH:mm"
                        )
                      : "Not recorded"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No attendance record found for the selected date. You can still
            submit a complaint about missing attendance records.
          </AlertDescription>
        </Alert>
      )}

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

          {/* Attendance Type - only show for missing records */}
          {formData.complaint_type === "missing_record" &&
            !attendanceRecord && (
              <div className="space-y-2">
                <Label htmlFor="proposed_attendance_type">
                  Attendance Type
                </Label>
                <Select
                  value={formData.proposed_attendance_type}
                  onValueChange={(value: "full_day" | "half_day") =>
                    setFormData((prev) => ({
                      ...prev,
                      proposed_attendance_type: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select attendance type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_day">Full Day</SelectItem>
                    <SelectItem value="half_day">Half Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

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
      <div className="flex items-center gap-2">
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
