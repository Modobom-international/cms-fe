"use client";

import { useEffect, useState } from "react";

import { format } from "date-fns";
import { AlertCircle, Calendar, Clock, Home, MapPin, Wifi } from "lucide-react";

import { AttendanceType } from "@/types/attendance.type";

import {
  formatTimeForDisplay,
  getCurrentLocaleTime,
  getTimezoneInfo,
} from "@/lib/utils";

import {
  useCheckIn,
  useCheckOut,
  useTodayAttendance,
} from "@/hooks/attendance";
import { useIsClient } from "@/hooks/use-client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceDashboardProps {
  employeeId: number;
  employeeName: string;
}

export function AttendanceDashboard({
  employeeId,
  employeeName,
}: AttendanceDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceType, setAttendanceType] =
    useState<AttendanceType>("full_day");
  const isClient = useIsClient();

  const {
    data: todayAttendance,
    isLoading: loadingToday,
    refetch,
  } = useTodayAttendance(employeeId);
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    await checkInMutation.mutateAsync({
      employee_id: employeeId,
      type: attendanceType,
    });
    refetch();
  };

  const handleCheckOut = async () => {
    await checkOutMutation.mutateAsync({
      employee_id: employeeId,
    });
    refetch();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      incomplete: "secondary",
      on_leave: "outline",
      remote_work: "secondary",
    } as const;

    const colors = {
      completed: "bg-green-100 text-green-800 border-green-200",
      incomplete: "bg-orange-100 text-orange-800 border-orange-200",
      on_leave: "bg-blue-100 text-blue-800 border-blue-200",
      remote_work: "bg-purple-100 text-purple-800 border-purple-200",
    } as const;

    return (
      <Badge
        variant={variants[status as keyof typeof variants]}
        className={colors[status as keyof typeof colors]}
      >
        {status === "completed" && "Completed"}
        {status === "incomplete" && "In Progress"}
        {status === "on_leave" && "On Leave"}
        {status === "remote_work" && "Remote Work"}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "remote_work":
        return <Home className="h-4 w-4" />;
      case "on_leave":
        return <Calendar className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  if (loadingToday) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasCheckedIn = todayAttendance?.data?.checkin_time;
  const hasCheckedOut = todayAttendance?.data?.checkout_time;
  const isOnLeave =
    todayAttendance?.data?.status === "on_leave" ||
    (!todayAttendance?.data && todayAttendance?.leave_info);
  const isRemoteWork = todayAttendance?.data?.status === "remote_work";

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6" />
              <span>
                Attendance -{" "}
                {isClient
                  ? currentTime.toLocaleDateString(
                      getTimezoneInfo(isClient).locale,
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        timeZone: getTimezoneInfo(isClient).timezone,
                      }
                    )
                  : format(currentTime, "EEEE, MMMM d, yyyy")}
              </span>
            </div>
            <div className="text-muted-foreground font-mono text-2xl">
              {isClient
                ? currentTime.toLocaleTimeString(
                    getTimezoneInfo(isClient).locale,
                    {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      timeZone: getTimezoneInfo(isClient).timezone,
                    }
                  )
                : format(currentTime, "HH:mm:ss")}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            Welcome back, <span className="font-medium">{employeeName}</span>
            {isClient && (
              <span className="ml-2 text-xs">
                ({getTimezoneInfo(isClient).timezone})
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      {todayAttendance?.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(todayAttendance.data.status)}
              Today's Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge(todayAttendance.data.status)}
            </div>

            {todayAttendance.data.checkin_time && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Check-in:</span>
                <span className="text-sm">
                  {formatTimeForDisplay(
                    todayAttendance.data.checkin_time,
                    false,
                    isClient
                  )}
                </span>
              </div>
            )}

            {todayAttendance.data.checkout_time && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Check-out:</span>
                <span className="text-sm">
                  {formatTimeForDisplay(
                    todayAttendance.data.checkout_time,
                    false,
                    isClient
                  )}
                </span>
              </div>
            )}

            {todayAttendance.data.total_work_hours && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Hours:</span>
                <span className="font-mono text-sm">
                  {todayAttendance.data.total_work_hours} hours
                </span>
              </div>
            )}

            {todayAttendance.data.description && (
              <div className="space-y-1">
                <span className="text-sm font-medium">Description:</span>
                <p className="text-muted-foreground text-sm">
                  {todayAttendance.data.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leave Information */}
      {isOnLeave && todayAttendance?.leave_info && (
        <Alert className="border-blue-200 bg-blue-50">
          <Calendar className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div className="font-medium">
              You are on {todayAttendance.leave_info.leave_type} leave today
            </div>
            <div className="text-sm">
              <strong>Reason:</strong> {todayAttendance.leave_info.reason}
            </div>
            {todayAttendance.leave_info.remote_work_details && (
              <div className="text-sm">
                <strong>Location:</strong>{" "}
                {todayAttendance.leave_info.remote_work_details.location}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Remote Work Information */}
      {isRemoteWork && todayAttendance?.leave_info?.remote_work_details && (
        <Alert className="border-purple-200 bg-purple-50">
          <Wifi className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div className="font-medium">Working remotely today</div>
            <div className="text-sm">
              <strong>Location:</strong>{" "}
              {todayAttendance.leave_info.remote_work_details.location}
            </div>
            {todayAttendance.leave_info.remote_work_details.equipment_needed
              ?.length > 0 && (
              <div className="text-sm">
                <strong>Equipment:</strong>{" "}
                {todayAttendance.leave_info.remote_work_details.equipment_needed.join(
                  ", "
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Card */}
      {!isOnLeave && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasCheckedIn ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Attendance Type</label>
                  <Select
                    value={attendanceType}
                    onValueChange={(value: AttendanceType) =>
                      setAttendanceType(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select attendance type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_day">
                        Full Day (8 hours)
                      </SelectItem>
                      <SelectItem value="half_day">
                        Half Day (4 hours)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCheckIn}
                  disabled={checkInMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {checkInMutation.isPending ? "Checking in..." : "Check In"}
                </Button>
              </>
            ) : !hasCheckedOut ? (
              <Button
                onClick={handleCheckOut}
                disabled={checkOutMutation.isPending}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {checkOutMutation.isPending ? "Checking out..." : "Check Out"}
              </Button>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You have completed your attendance for today. Great work!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {todayAttendance?.data?.status === "incomplete" &&
        hasCheckedIn &&
        !hasCheckedOut && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Don't forget to check out at the end of your work day!
            </AlertDescription>
          </Alert>
        )}
    </div>
  );
}
