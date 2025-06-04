# Attendance Management - App Router Implementation

This document outlines the implementation of attendance management features in the Next.js App Router structure.

## 📁 Route Structure

```
src/app/(platform)/
├── admin/
│   └── attendance/
│       ├── page.tsx                    # Main admin attendance dashboard (tabs)
│       ├── reports/
│       │   └── page.tsx               # Attendance reports page
│       └── complaints/
│           └── page.tsx               # Complaints management page
└── employee/
    ├── layout.tsx                     # Employee section layout
    └── attendance/
        ├── page.tsx                   # Main employee attendance dashboard (tabs)
        ├── dashboard/
        │   └── page.tsx              # Attendance dashboard page
        └── complaints/
            └── page.tsx              # Employee complaints page
```

## 🚀 Available Routes

### Admin Routes

- `/admin/attendance` - Main admin attendance dashboard with tabs
- `/admin/attendance/reports` - Dedicated attendance reports page
- `/admin/attendance/complaints` - Dedicated complaints management page

### Employee Routes

- `/employee/attendance` - Main employee attendance dashboard with tabs
- `/employee/attendance/dashboard` - Dedicated attendance check-in/out page
- `/employee/attendance/complaints` - Dedicated employee complaints page

## 🧩 Components Integration

### Admin Pages

```tsx
// /admin/attendance/page.tsx
import { AttendanceReport } from "@/components/attendance/admin/attendance-report";
import { ComplaintsManagement } from "@/components/attendance/admin/complaints-management";

// Uses tabs to show both components in one page
```

```tsx
// /admin/attendance/reports/page.tsx
import { AttendanceReport } from "@/components/attendance/admin/attendance-report";

// Dedicated page for just the reports component
```

### Employee Pages

```tsx
// /employee/attendance/page.tsx
import { AttendanceDashboard } from "@/components/attendance/employee/attendance-dashboard";
import { ComplaintsList } from "@/components/attendance/employee/complaints-list";

// Uses tabs to show both components in one page
```

## 🔧 Configuration

### 1. Update API Client

The components use `apiClient` from `@/lib/api/client`. Make sure your API client is configured:

```typescript
// src/lib/api/client.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  timeout: 10000,
});

// Add authentication interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token"); // or get from your auth context
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### 2. Environment Variables

Add these to your `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com
# or for development:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3. Authentication Integration

Replace the mock employee ID with actual authentication:

```tsx
// After (with auth integration)
import { useAuth } from "@/hooks/auth";

// Before (current implementation)
const MOCK_EMPLOYEE_ID = 1;
const MOCK_EMPLOYEE_NAME = "John Doe";

// or your auth hook

function AttendancePage() {
  const { user } = useAuth();

  if (!user) {
    redirect("/auth/login");
  }

  return <AttendanceDashboard employeeId={user.id} employeeName={user.name} />;
}
```

## 🎨 UI Patterns

All pages follow the established patterns from the existing codebase:

### Page Structure

```tsx
export default function PageName() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>Section</span>
        </nav>

        {/* Title Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Page Title</h1>
          <p className="text-muted-foreground text-sm">Page description</p>
        </div>
      </div>

      {/* Main Content */}
      <ComponentName />
    </div>
  );
}
```

### Layout Integration

Both admin and employee routes use the existing layout system:

- Admin routes inherit from the existing admin layout
- Employee routes use a new dedicated employee layout
- Both include sidebar navigation and consistent styling

## 📱 Navigation Integration

### Sidebar Integration

To add attendance links to your sidebar navigation:

```tsx
// In your sidebar component
const navigationItems = [
  // ... existing items
  {
    title: "Attendance",
    href: "/admin/attendance", // or "/employee/attendance"
    icon: ClockIcon,
    children: [
      {
        title: "Dashboard",
        href: "/admin/attendance",
      },
      {
        title: "Reports",
        href: "/admin/attendance/reports",
      },
      {
        title: "Complaints",
        href: "/admin/attendance/complaints",
      },
    ],
  },
];
```

## 🔌 API Integration

### Mock API Routes

Sample API routes are provided for development:

```typescript
// src/app/api/attendance/checkin/route.ts
export async function POST(request: NextRequest) {
  // Replace with actual backend integration
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/attendance/checkin`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  return NextResponse.json(response.data);
}
```

### Required API Endpoints

The frontend expects these backend endpoints:

- `POST /api/attendance/checkin` - Employee check-in
- `POST /api/attendance/checkout` - Employee check-out
- `GET /api/attendance/{employee_id}/today` - Today's attendance
- `GET /api/admin/attendances` - Admin attendance report
- `GET /api/attendance-complaints` - Employee complaints
- `GET /api/admin/attendance-complaints` - Admin view complaints
- `POST /api/attendance-complaints` - Create complaint
- `PUT /api/admin/attendance-complaints/{id}/respond` - Admin respond to complaint

## 🧪 Testing

### Test the Implementation

1. **Admin Routes:**

   ```bash
   # Visit these URLs to test admin functionality
   http://localhost:3000/admin/attendance
   http://localhost:3000/admin/attendance/reports
   http://localhost:3000/admin/attendance/complaints
   ```

2. **Employee Routes:**
   ```bash
   # Visit these URLs to test employee functionality
   http://localhost:3000/employee/attendance
   http://localhost:3000/employee/attendance/dashboard
   http://localhost:3000/employee/attendance/complaints
   ```

### Development with Mock Data

The components include mock data for development. To test:

1. Start your Next.js development server
2. Navigate to any attendance route
3. Components will show with placeholder data
4. Replace mock employee IDs with real authentication

## 🎯 Next Steps

1. **Authentication Integration:**

   - Replace mock employee IDs with real user data
   - Add proper authentication guards to routes

2. **API Integration:**

   - Connect components to your actual backend API
   - Remove mock data and API routes

3. **Internationalization:**

   - Add translation keys for attendance features
   - Update `useTranslations` calls with proper keys

4. **Permissions:**

   - Add role-based access control
   - Restrict admin routes to admin users only

5. **Testing:**
   - Add unit tests for components
   - Add integration tests for user flows

## 🚨 Important Notes

- **Employee ID**: Currently using mock employee ID. Replace with actual authentication.
- **API Base URL**: Configure your backend API URL in environment variables.
- **Permissions**: Add proper role-based access control before production.
- **Error Handling**: Components include error handling, but test with your actual API.
- **Real-time Updates**: Components support real-time updates via React Query.

## 📚 Related Documentation

- [Attendance Components Documentation](./README-attendance.md)
- [API Documentation](./ATTENDANCE_API_DOCUMENTATION.md)
- [TypeScript Types](./src/types/attendance.type.ts)
- [React Query Hooks](./src/hooks/attendance/index.ts)
