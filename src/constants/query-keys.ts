export const authQueryKeys = {
  origin: ["auth"] as const,
  me: () => [...authQueryKeys.origin, "me"] as const,
  login: () => [...authQueryKeys.origin, "login"] as const,
  register: () => [...authQueryKeys.origin, "register"] as const,
  forgotPassword: () => [...authQueryKeys.origin, "forgot-password"] as const,
  resetPassword: () => [...authQueryKeys.origin, "reset-password"] as const,
  logout: () => [...authQueryKeys.origin, "logout"] as const,
};

export const userTrackingQueryKeys = {
  origin: ["users-tracking"] as const,
  list: (page: number, pageSize: number, date: string, domain: string) =>
    [
      ...userTrackingQueryKeys.origin,
      "list",
      page,
      pageSize,
      date,
      domain,
    ] as const,
};

export const domainQueryKeys = {
  origin: ["domains"] as const,
  list: (page: number, pageSize: number, search: string) =>
    [...domainQueryKeys.origin, "list", page, pageSize, search] as const,
};

export const activityLogQueryKeys = {
  origin: ["activity-logs"] as const,
  list: (page: number, pageSize: number, search: string = "") =>
    [...activityLogQueryKeys.origin, "list", page, pageSize, search] as const,
};

export const notificationQueryKeys = {
  origin: ["notifications"] as const,
  list: (email: string) =>
    [...notificationQueryKeys.origin, "list", email] as const,
};