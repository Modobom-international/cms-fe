# Site Platform API Documentation

## Overview

The Site API has been updated to include a new `platform` field that allows sites to be associated with different platforms. This document outlines all the changes and new endpoints available for frontend implementation.

## Platform Values

The following platform values are supported:

- `google` (default)
- `facebook`
- `tiktok`

## Updated API Endpoints

### 1. Get All Sites

**GET** `/api/sites`

**Response Example:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "My Website",
      "domain": "example.com",
      "description": "A sample website",
      "cloudflare_project_name": "my-website",
      "cloudflare_domain_status": "active",
      "branch": "main",
      "user_id": 1,
      "status": "active",
      "language": "en",
      "platform": "google",
      "created_at": "2025-06-27T10:30:00.000000Z",
      "updated_at": "2025-06-27T10:30:00.000000Z",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### 2. Get Single Site

**GET** `/api/sites/{id}`

**Response Example:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My Website",
    "domain": "example.com",
    "description": "A sample website",
    "cloudflare_project_name": "my-website",
    "cloudflare_domain_status": "active",
    "branch": "main",
    "user_id": 1,
    "status": "active",
    "language": "en",
    "platform": "google",
    "created_at": "2025-06-27T10:30:00.000000Z",
    "updated_at": "2025-06-27T10:30:00.000000Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### 3. Create Site

**POST** `/api/sites`

**Request Body:**

```json
{
  "name": "My New Website",
  "domain": "newsite.com",
  "description": "Description of the new site",
  "branch": "main",
  "language": "en",
  "platform": "facebook"
}
```

**Request Fields:**

- `name` (required, string, max:255) - Site name
- `domain` (required, string, unique) - Site domain
- `description` (optional, string) - Site description
- `branch` (optional, string, max:50) - Git branch (default: "main")
- `language` (optional, string, size:2) - Language code (default: "en")
- `platform` (optional, enum) - Platform type (default: "google")
  - Valid values: `google`, `facebook`, `tiktok`

**Success Response (201):**

```json
{
  "success": true,
  "message": "Site created successfully",
  "data": {
    "id": 2,
    "name": "My New Website",
    "domain": "newsite.com",
    "description": "Description of the new site",
    "cloudflare_project_name": "my-new-website",
    "cloudflare_domain_status": "active",
    "branch": "main",
    "user_id": 1,
    "status": "active",
    "language": "en",
    "platform": "facebook",
    "created_at": "2025-06-27T10:35:00.000000Z",
    "updated_at": "2025-06-27T10:35:00.000000Z"
  }
}
```

**Error Response (422):**

```json
{
  "success": false,
  "errors": {
    "platform": ["The selected platform is invalid."],
    "domain": ["The domain has already been taken."]
  }
}
```

### 4. Update Site

**POST** `/api/sites/{id}`

**Request Body:**

```json
{
  "name": "Updated Website Name",
  "domain": "updated-domain.com",
  "description": "Updated description",
  "status": "active",
  "language": "th",
  "platform": "tiktok"
}
```

**Request Fields:**

- `name` (required, string, max:255) - Site name
- `domain` (required, string, unique except current) - Site domain
- `description` (optional, string) - Site description
- `status` (optional, enum) - Site status (`active`, `inactive`)
- `language` (optional, string, size:2) - Language code
- `platform` (optional, enum) - Platform type
  - Valid values: `google`, `facebook`, `tiktok`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Site updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Website Name",
    "domain": "updated-domain.com",
    "description": "Updated description",
    "cloudflare_project_name": "my-website",
    "cloudflare_domain_status": "active",
    "branch": "main",
    "user_id": 1,
    "status": "active",
    "language": "th",
    "platform": "tiktok",
    "created_at": "2025-06-27T10:30:00.000000Z",
    "updated_at": "2025-06-27T10:40:00.000000Z"
  }
}
```

### 5. Delete Site

**DELETE** `/api/sites/{id}`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Site deleted successfully"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Site not found"
}
```

## New Dedicated Platform Endpoints

### 6. Update Site Platform Only

**PATCH** `/api/sites/{id}/platform`

This endpoint allows updating only the platform field without affecting other site properties.

**Request Body:**

```json
{
  "platform": "facebook"
}
```

**Request Fields:**

- `platform` (required, enum) - Platform type
  - Valid values: `google`, `facebook`, `tiktok`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Site platform updated successfully",
  "data": {
    "id": 1,
    "name": "My Website",
    "domain": "example.com",
    "description": "A sample website",
    "cloudflare_project_name": "my-website",
    "cloudflare_domain_status": "active",
    "branch": "main",
    "user_id": 1,
    "status": "active",
    "language": "en",
    "platform": "facebook",
    "created_at": "2025-06-27T10:30:00.000000Z",
    "updated_at": "2025-06-27T10:45:00.000000Z"
  }
}
```

**Error Response (422):**

```json
{
  "success": false,
  "errors": {
    "platform": ["The selected platform is invalid."]
  }
}
```

### 7. Update Site Language Only

**PATCH** `/api/sites/{id}/language`

**Request Body:**

```json
{
  "language": "th"
}
```

**Request Fields:**

- `language` (required, string, size:2) - Language code

**Success Response (200):**

```json
{
  "success": true,
  "message": "Site language updated successfully",
  "data": {
    "id": 1,
    "name": "My Website",
    "domain": "example.com",
    "description": "A sample website",
    "cloudflare_project_name": "my-website",
    "cloudflare_domain_status": "active",
    "branch": "main",
    "user_id": 1,
    "status": "active",
    "language": "th",
    "platform": "google",
    "created_at": "2025-06-27T10:30:00.000000Z",
    "updated_at": "2025-06-27T10:50:00.000000Z"
  }
}
```

## Site Management Endpoints

### 8. Activate Site

**PATCH** `/api/sites/{id}/activate`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Site activated and deployed successfully",
  "data": {
    "id": 1,
    "name": "My Website",
    "domain": "example.com",
    "status": "active",
    "platform": "google"
    // ... other fields
  }
}
```

### 9. Deactivate Site

**PATCH** `/api/sites/{id}/deactivate`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Site deactivated successfully",
  "data": {
    "id": 1,
    "name": "My Website",
    "domain": "example.com",
    "status": "inactive",
    "platform": "google"
    // ... other fields
  }
}
```

## Frontend Implementation Guide

### 1. Platform Selection Component

Create a dropdown/select component for platform selection:

```javascript
const platformOptions = [
  { value: "google", label: "Google" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
];

// Default platform should be 'google'
const [selectedPlatform, setSelectedPlatform] = useState("google");
```

### 2. Form Validation

Ensure platform validation in your forms:

```javascript
const validatePlatform = (platform) => {
  const validPlatforms = ["google", "facebook", "tiktok"];
  return validPlatforms.includes(platform);
};
```

### 3. API Integration Examples

**Creating a site:**

```javascript
const createSite = async (siteData) => {
  try {
    const response = await fetch("/api/sites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: siteData.name,
        domain: siteData.domain,
        description: siteData.description,
        platform: siteData.platform || "google", // default to google
      }),
    });

    const result = await response.json();
    if (result.success) {
      // Handle success
      console.log("Site created:", result.data);
    } else {
      // Handle validation errors
      console.error("Validation errors:", result.errors);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};
```

**Updating platform only:**

```javascript
const updateSitePlatform = async (siteId, platform) => {
  try {
    const response = await fetch(`/api/sites/${siteId}/platform`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ platform }),
    });

    const result = await response.json();
    if (result.success) {
      console.log("Platform updated:", result.data);
    }
  } catch (error) {
    console.error("Error updating platform:", error);
  }
};
```

### 4. Display Platform Information

In your site listing/display components, show the platform information:

```javascript
const PlatformBadge = ({ platform }) => {
  const getPlatformColor = (platform) => {
    switch (platform) {
      case "google":
        return "blue";
      case "facebook":
        return "indigo";
      case "tiktok":
        return "pink";
      default:
        return "gray";
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "google":
        return "🔍";
      case "facebook":
        return "📘";
      case "tiktok":
        return "🎵";
      default:
        return "🌐";
    }
  };

  return (
    <span className={`badge badge-${getPlatformColor(platform)}`}>
      {getPlatformIcon(platform)}{" "}
      {platform.charAt(0).toUpperCase() + platform.slice(1)}
    </span>
  );
};
```

## Error Handling

### Common Error Responses

**Validation Error (422):**

```json
{
  "success": false,
  "errors": {
    "platform": ["The selected platform is invalid."]
  }
}
```

**Not Found Error (404):**

```json
{
  "success": false,
  "message": "Site not found"
}
```

**Server Error (500):**

```json
{
  "success": false,
  "message": "Failed to create site",
  "error": "Detailed error message"
}
```

## Migration Notes

### For Existing Sites

- All existing sites will automatically have `platform: "google"` as the default value
- No data migration is required for existing sites
- Frontend should handle the new platform field gracefully

### Backward Compatibility

- All existing API endpoints continue to work as before
- The platform field is optional in create/update requests
- If not provided, platform defaults to "google"

## Testing Checklist

- [ ] Site creation with platform selection
- [ ] Site creation without platform (should default to "google")
- [ ] Site update including platform change
- [ ] Platform-only update using dedicated endpoint
- [ ] Platform validation (invalid platform values)
- [ ] Display platform information in site listings
- [ ] Platform filtering (if implementing search/filter features)
- [ ] Existing site compatibility (sites created before platform feature)

## Summary

The platform feature is now fully integrated into the Site API with:

- ✅ Platform field added to all site endpoints
- ✅ New dedicated platform update endpoint
- ✅ Proper validation for platform values
- ✅ Default value handling
- ✅ Backward compatibility maintained
- ✅ Comprehensive error handling

Contact the backend team if you need any clarifications or encounter issues during implementation.
