# Activity Log API Documentation

## Overview

The Activity Log API provides comprehensive logging and monitoring capabilities for all user activities within the system. The API has been enhanced with advanced filtering, grouping, statistics, and export functionality.

## Base URL

```
/api/activity-log
```

## Endpoints

### 1. List Activity Logs

**GET** `/api/activity-log/`

Retrieves a paginated list of activity logs with advanced filtering capabilities.

#### Query Parameters

| Parameter      | Type    | Required | Description                                                 |
| -------------- | ------- | -------- | ----------------------------------------------------------- |
| `date`         | string  | No       | Specific date (YYYY-MM-DD format). Defaults to current date |
| `date_from`    | string  | No       | Start date for date range (YYYY-MM-DD format)               |
| `date_to`      | string  | No       | End date for date range (YYYY-MM-DD format)                 |
| `user_id`      | integer | No       | Filter by specific user ID                                  |
| `action`       | string  | No       | Filter by specific action                                   |
| `group_action` | string  | No       | Filter by action group (see available groups below)         |
| `search`       | string  | No       | Search in description, action, user email, or user name     |
| `pageSize`     | integer | No       | Number of items per page (default: 10)                      |
| `page`         | integer | No       | Page number (default: 1)                                    |

#### Available Group Actions

- `site_management` - Site management operations
- `page_management` - Page management operations
- `attendance_management` - Attendance management operations
- `attendance_complaints` - Attendance complaint operations
- `board_management` - Board management operations
- `cloudflare_operations` - Cloudflare-related operations
- `domain_operations` - Domain-related operations
- `general_operations` - General system operations

#### Example Request

```bash
GET /api/activity-log/?date_from=2024-01-01&date_to=2024-01-31&group_action=site_management&search=create&pageSize=20&page=1
```

#### Response

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": 1,
        "action": "create_site",
        "action_label": "Tạo site",
        "group_action": "site_management",
        "description": "Tạo site mới",
        "user_id": 1,
        "user_email": "user@example.com",
        "user_name": "John Doe",
        "created_at": "2024-01-15 10:30:00",
        "formatted_created_at": "2024-01-15 10:30:00",
        "details": {
          "site_name": "example.com",
          "site_id": 123
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 150,
      "last_page": 8,
      "from": 1,
      "to": 20
    },
    "filters_applied": {
      "date_from": "2024-01-01",
      "date_to": "2024-01-31",
      "group_action": "site_management",
      "search": "create"
    }
  },
  "message": "Lấy danh sách activity log thành công",
  "type": "list_activity_log_success"
}
```

### 2. Get Activity Statistics

**GET** `/api/activity-log/stats`

Retrieves statistical information about activity logs.

#### Query Parameters

| Parameter   | Type    | Required | Description                                   |
| ----------- | ------- | -------- | --------------------------------------------- |
| `date`      | string  | No       | Specific date (YYYY-MM-DD format)             |
| `date_from` | string  | No       | Start date for date range (YYYY-MM-DD format) |
| `date_to`   | string  | No       | End date for date range (YYYY-MM-DD format)   |
| `user_id`   | integer | No       | Filter by specific user ID                    |

#### Example Request

```bash
GET /api/activity-log/stats?date_from=2024-01-01&date_to=2024-01-31
```

#### Response

```json
{
  "success": true,
  "data": {
    "total_activities": 1250,
    "actions_by_group": {
      "site_management": 150,
      "page_management": 300,
      "attendance_management": 400,
      "attendance_complaints": 50,
      "board_management": 200,
      "cloudflare_operations": 100,
      "domain_operations": 30,
      "general_operations": 20
    },
    "top_users": [
      {
        "user_id": 1,
        "email": "admin@example.com",
        "name": "Admin User",
        "count": 250
      },
      {
        "user_id": 2,
        "email": "user@example.com",
        "name": "Regular User",
        "count": 180
      }
    ],
    "filters_applied": {
      "date_from": "2024-01-01",
      "date_to": "2024-01-31"
    }
  },
  "message": "Lấy thống kê activity log thành công",
  "type": "get_activity_stats_success"
}
```

### 3. Get Available Filters

**GET** `/api/activity-log/filters`

Retrieves all available filter options for the activity log.

#### Example Request

```bash
GET /api/activity-log/filters
```

#### Response

```json
{
  "success": true,
  "data": {
    "group_actions": [
      {
        "value": "site_management",
        "label": "Quản lý Site",
        "description": "Các hoạt động liên quan đến quản lý site"
      },
      {
        "value": "page_management",
        "label": "Quản lý Trang",
        "description": "Các hoạt động liên quan đến quản lý trang"
      }
    ],
    "date_filters": {
      "today": "Hôm nay",
      "yesterday": "Hôm qua",
      "this_week": "Tuần này",
      "last_week": "Tuần trước",
      "this_month": "Tháng này",
      "last_month": "Tháng trước",
      "custom_range": "Khoảng thời gian tùy chỉnh"
    },
    "sort_options": {
      "created_at_desc": "Thời gian tạo (Mới nhất)",
      "created_at_asc": "Thời gian tạo (Cũ nhất)",
      "action_asc": "Hành động (A-Z)",
      "action_desc": "Hành động (Z-A)",
      "user_name_asc": "Tên người dùng (A-Z)",
      "user_name_desc": "Tên người dùng (Z-A)"
    }
  },
  "message": "Lấy danh sách bộ lọc thành công",
  "type": "get_available_filters_success"
}
```

### 4. Export Activity Logs

**GET** `/api/activity-log/export`

Exports activity logs in various formats.

#### Query Parameters

| Parameter      | Type    | Required | Description                                             |
| -------------- | ------- | -------- | ------------------------------------------------------- |
| `date`         | string  | No       | Specific date (YYYY-MM-DD format)                       |
| `date_from`    | string  | No       | Start date for date range (YYYY-MM-DD format)           |
| `date_to`      | string  | No       | End date for date range (YYYY-MM-DD format)             |
| `user_id`      | integer | No       | Filter by specific user ID                              |
| `action`       | string  | No       | Filter by specific action                               |
| `group_action` | string  | No       | Filter by action group                                  |
| `search`       | string  | No       | Search in description, action, user email, or user name |
| `format`       | string  | No       | Export format (csv, excel, json). Default: csv          |

#### Example Request

```bash
GET /api/activity-log/export?date_from=2024-01-01&date_to=2024-01-31&group_action=site_management&format=json
```

#### Response

```json
{
  "success": true,
  "data": {
    "export_data": [
      {
        "id": 1,
        "action": "create_site",
        "action_label": "Tạo site",
        "group_action": "site_management",
        "description": "Tạo site mới",
        "user_id": 1,
        "user_email": "user@example.com",
        "user_name": "John Doe",
        "created_at": "2024-01-15 10:30:00",
        "details": {
          "site_name": "example.com",
          "site_id": 123
        }
      }
    ],
    "total_records": 150,
    "export_format": "json",
    "filters_applied": {
      "date_from": "2024-01-01",
      "date_to": "2024-01-31",
      "group_action": "site_management"
    }
  },
  "message": "Xuất activity log thành công",
  "type": "export_activity_log_success"
}
```

## Activity Action Groups

### Site Management

- `create_site` - Create new site
- `update_site` - Update site information
- `delete_site` - Delete site
- `activate_site` - Activate site
- `deactivate_site` - Deactivate site
- `update_site_language` - Update site language
- `update_site_platform` - Update site platform

### Page Management

- `create_page` - Create new page
- `update_page` - Update page
- `delete_page` - Delete page
- `export_page` - Export page
- `update_tracking_script` - Update tracking script
- `remove_tracking_script` - Remove tracking script
- `get_tracking_script` - Get tracking script
- `cancel_export` - Cancel export
- `create_page_exports` - Create page exports
- `update_pages` - Update pages

### Attendance Management

- `checkin_attendance` - Check-in attendance
- `checkout_attendance` - Check-out attendance
- `get_attendance` - Get attendance
- `get_attendance_report` - Get attendance report
- `add_custom_attendance` - Add custom attendance
- `update_custom_attendance` - Update custom attendance

### Attendance Complaints

- `create_attendance_complaint` - Create attendance complaint
- `update_attendance_complaint` - Update attendance complaint
- `get_attendance_complaints` - Get attendance complaints
- `review_attendance_complaint` - Review attendance complaint
- `respond_to_attendance_complaint` - Respond to attendance complaint
- `get_attendance_complaint_stats` - Get attendance complaint statistics

### Board Management

- `create_list` - Create list
- `update_list` - Update list
- `delete_list` - Delete list
- `update_list_positions` - Update list positions
- `get_board_lists` - Get board lists
- `add_board_member` - Add board member
- `remove_board_member` - Remove board member
- `get_board_members` - Get board members

### Cloudflare Operations

- `create_project_cloudflare_page` - Create Cloudflare project page
- `update_project_cloudflare_page` - Update Cloudflare project page
- `create_deploy_cloudflare_page` - Create Cloudflare deploy page
- `apply_page_domain_cloudflare_page` - Apply page domain to Cloudflare
- `deploy_export_cloudflare_page` - Deploy export to Cloudflare

### Domain Operations

- `refresh_list_domain` - Refresh domain list
- `get_list_path_by_domain` - Get list path by domain

### General Operations

- `access_view` - Access view
- `show_record` - Show record
- `create_record` - Create record
- `update_record` - Update record
- `delete_record` - Delete record
- `get_permission_by_team` - Get permission by team

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "type": "error_type",
  "error": "Detailed error message"
}
```

## Authentication

All endpoints require authentication. Include the appropriate authentication token in the request headers.

## Rate Limiting

The API implements rate limiting to prevent abuse. Please respect the rate limits and implement appropriate retry logic in your applications.

## Best Practices

1. **Use appropriate filters**: Use specific filters to reduce response time and data transfer
2. **Implement pagination**: Always use pagination for large datasets
3. **Cache filter options**: Cache the available filters to reduce API calls
4. **Handle errors gracefully**: Implement proper error handling for all API responses
5. **Use date ranges**: Use date ranges instead of individual dates for better performance
6. **Monitor usage**: Keep track of API usage to stay within rate limits
