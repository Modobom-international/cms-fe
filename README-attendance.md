# Attendance Management UI Components

This documentation describes the attendance management UI components built for both employees and administrators.

## Overview

The attendance system provides a comprehensive solution for managing employee attendance, including check-in/check-out functionality, attendance tracking, and complaint management.

## Components Structure

```
src/components/attendance/
├── employee/
│   ├── attendance-dashboard.tsx    # Main dashboard for employees
│   ├── complaints-list.tsx         # List and manage complaints
│   ├── create-complaint-form.tsx   # Create new complaints
│   ├── complaint-details.tsx       # View complaint details
│   └── index.ts                   # Export file
├── admin/
│   ├── attendance-report.tsx       # Admin attendance reports
│   ├── complaints-management.tsx   # Admin complaint management
│   └── index.ts                   # Export file
└── index.ts                       # Main export file
```

## Employee Components

### AttendanceDashboard

Main dashboard component for employees to manage their daily attendance.

**Features:**

- Real-time clock display
- Check-in/Check-out functionality
- Today's attendance status
- Leave and remote work information
- Visual status indicators

**Usage:**

```tsx
import { AttendanceDashboard } from "@/components/attendance/employee";

<AttendanceDashboard employeeId={employeeId} />;
```

**Props:**

- `employeeId: number` - The ID of the employee

### ComplaintsList

Component for employees to view and manage their attendance complaints.

**Features:**

- List all complaints with filtering
- Status-based filtering (pending, approved, rejected)
- Create new complaints
- View complaint details
- Responsive table design

**Usage:**

```tsx
import { ComplaintsList } from "@/components/attendance/employee";

<ComplaintsList employeeId={employeeId} />;
```

**Props:**

- `employeeId: number` - The ID of the employee

### CreateComplaintForm

Form component for creating new attendance complaints.

**Features:**

- Multiple complaint types support
- Proposed time corrections
- Rich text description
- Form validation
- Real-time feedback

**Usage:**

```tsx
import { CreateComplaintForm } from "@/components/attendance/employee";

<CreateComplaintForm
  employeeId={employeeId}
  onSuccess={() => {
    /* handle success */
  }}
/>;
```

**Props:**

- `employeeId: number` - The ID of the employee
- `onSuccess: () => void` - Callback when complaint is successfully created

### ComplaintDetails

Component for viewing detailed information about a specific complaint.

**Features:**

- Complete complaint information
- Status tracking
- Admin responses
- Timeline view
- Action buttons for pending complaints

**Usage:**

```tsx
import { ComplaintDetails } from "@/components/attendance/employee";

<ComplaintDetails
  complaint={complaintData}
  onClose={() => {
    /* handle close */
  }}
  onEdit={(complaint) => {
    /* handle edit */
  }}
/>;
```

**Props:**

- `complaint: IAttendanceComplaint` - The complaint object
- `onClose: () => void` - Callback to close the details view
- `onEdit?: (complaint: IAttendanceComplaint) => void` - Optional edit callback

## Admin Components

### AttendanceReport

Comprehensive reporting component for administrators to view employee attendance.

**Features:**

- Date-based filtering
- Employee search functionality
- Branch-based filtering
- Attendance type filtering
- Summary statistics
- CSV export functionality
- Responsive table with pagination

**Usage:**

```tsx
import { AttendanceReport } from "@/components/attendance/admin";

<AttendanceReport />;
```

### ComplaintsManagement

Admin component for managing employee attendance complaints.

**Features:**

- All complaints overview
- Advanced filtering options
- Approve/reject functionality
- Detailed complaint view
- Bulk operations
- Response management
- Statistics dashboard

**Usage:**

```tsx
import { ComplaintsManagement } from "@/components/attendance/admin";

<ComplaintsManagement />;
```

## Data Types

### Core Types

```typescript
// Attendance record structure
interface IAttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  type: AttendanceType;
  checkin_time: string | null;
  checkout_time: string | null;
  total_work_hours: number | null;
  status: AttendanceStatus;
  description: string | null;
  branch_name: string | null;
  created_at: string;
  updated_at: string;
}

// Complaint structure
interface IAttendanceComplaint {
  id: number;
  attendance_id: number;
  employee_id: number;
  complaint_type: ComplaintType;
  description: string;
  proposed_changes: Record<string, any>;
  status: ComplaintStatus;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: number;
    name: string;
    email: string;
  };
  attendance?: IAttendanceRecord;
}
```

### Enums

```typescript
type AttendanceType = "full_day" | "half_day";

type AttendanceStatus = "incomplete" | "completed" | "on_leave" | "remote_work";

type ComplaintType =
  | "incorrect_time"
  | "missing_record"
  | "technical_issue"
  | "other";

type ComplaintStatus = "pending" | "under_review" | "resolved" | "rejected";
```

## Hooks

The components use custom React Query hooks for data management:

### Employee Hooks

- `useCheckIn()` - Handle employee check-in
- `useCheckOut()` - Handle employee check-out
- `useTodayAttendance(employeeId)` - Get today's attendance
- `useAttendanceComplaints(params)` - Get employee complaints
- `useCreateComplaint()` - Create new complaint
- `useUpdateComplaint()` - Update existing complaint

### Admin Hooks

- `useAttendanceReport(params)` - Get attendance reports
- `useAdminAttendanceComplaints(params)` - Get all complaints
- `useRespondToComplaint()` - Respond to complaints
- `useComplaintStatistics()` - Get complaint statistics

## Styling

Components use Tailwind CSS with shadcn/ui design system:

- Consistent color scheme
- Responsive design
- Dark/light mode support
- Accessible components
- Modern UI patterns

## API Integration

All components integrate with the backend API through:

- RESTful endpoints
- Proper error handling
- Loading states
- Optimistic updates
- Real-time data fetching

## Example Usage

```tsx
// Employee Dashboard Page
import { AttendanceDashboard, ComplaintsList } from "@/components/attendance";
// Admin Dashboard Page
import {
  AttendanceReport,
  ComplaintsManagement,
} from "@/components/attendance";

function EmployeePage({ employeeId }: { employeeId: number }) {
  return (
    <div className="space-y-6">
      <AttendanceDashboard employeeId={employeeId} />
      <ComplaintsList employeeId={employeeId} />
    </div>
  );
}

function AdminPage() {
  return (
    <div className="space-y-6">
      <AttendanceReport />
      <ComplaintsManagement />
    </div>
  );
}
```

## Features Summary

### Employee Features

- ✅ Real-time attendance dashboard
- ✅ Check-in/check-out functionality
- ✅ Attendance status tracking
- ✅ Complaint submission and management
- ✅ Leave and remote work information
- ✅ Responsive design

### Admin Features

- ✅ Comprehensive attendance reporting
- ✅ Advanced filtering and search
- ✅ Complaint review and response
- ✅ CSV export functionality
- ✅ Statistical dashboards
- ✅ Bulk operations support

The attendance management system provides a complete solution for both employees and administrators, with modern UI/UX patterns and robust functionality.
