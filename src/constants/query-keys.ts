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
  all: ["domains"],
  lists: () => [...domainQueryKeys.all, "list"],
  list: (page: number, pageSize: number, search: string) => [
    ...domainQueryKeys.lists(),
    { page, pageSize, search },
  ],
  domains: () => [...domainQueryKeys.all, "domains"],
  details: (id: string) => [...domainQueryKeys.all, "detail", id],
  refresh: () => [...domainQueryKeys.all, "refresh"],
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

export const htmlSourceQueryKeys = {
  all: ["htmlSources"],
  lists: () => [...htmlSourceQueryKeys.all, "list"],
  list: (page: number, pageSize: number, search: string) => [
    ...htmlSourceQueryKeys.lists(),
    { page, pageSize, search },
  ],
  details: (id: string) => [...htmlSourceQueryKeys.all, "detail", id],
};

export const teamQueryKeys = {
  all: ["teams"],
  lists: () => [...teamQueryKeys.all, "list"],
  list: (page: number, pageSize: number, search: string = "") => [
    ...teamQueryKeys.lists(),
    { page, pageSize, search },
  ],
  details: (id: string) => [...teamQueryKeys.all, "detail", id],
  create: () => [...teamQueryKeys.all, "create"],
};

export const userQueryKeys = {
  all: ["users"],
  lists: () => [...userQueryKeys.all, "list"],
  list: (page: number, pageSize: number, search: string = "") => [
    ...userQueryKeys.lists(),
    { page, pageSize, search },
  ],
  details: (id: string) => [...userQueryKeys.all, "detail", id],
  create: () => [...userQueryKeys.all, "create"],
};
