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
  list: (
    page: number,
    pageSize: number,
    date: string,
    domain: string,
    path: string
  ) =>
    [
      ...userTrackingQueryKeys.origin,
      "list",
      { page, pageSize, date, domain, path },
    ] as const,
};

export const domainQueryKeys = {
  origin: ["domains"] as const,
  lists: () => [...domainQueryKeys.origin, "list"],
  list: (page: number, pageSize: number, search: string) => [
    ...domainQueryKeys.lists(),
    { page, pageSize, search },
  ],
  available: (page: number, pageSize: number, search: string) => [
    ...domainQueryKeys.lists(),
    "available",
    { page, pageSize, search },
  ],
  details: (id: string) => [...domainQueryKeys.origin, "detail", id],
  refresh: () => [...domainQueryKeys.origin, "refresh"],
  domainPaths: (domain: string, page: number, pageSize: number) =>
    [
      ...domainQueryKeys.origin,
      "domain-paths",
      { domain, page, pageSize },
    ] as const,
  domainWithoutPagination: (user_id?: string, search: string = "") => [
    ...domainQueryKeys.origin,
    "domain-without-pagination",
    { user_id, search },
  ],
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
  origin: ["htmlSources"] as const,
  lists: () => [...htmlSourceQueryKeys.origin, "list"],
  list: (page: number, pageSize: number, search: string) => [
    ...htmlSourceQueryKeys.lists(),
    { page, pageSize, search },
  ],
  details: (id: string) => [...htmlSourceQueryKeys.origin, "detail", id],
};

export const teamQueryKeys = {
  origin: ["teams"] as const,
  lists: () => [...teamQueryKeys.origin, "list"],
  list: (page: number, pageSize: number, search: string = "") => [
    ...teamQueryKeys.lists(),
    { page, pageSize, search },
  ],
  details: (id: string) => [...teamQueryKeys.origin, "detail", id],
  create: () => [...teamQueryKeys.origin, "create"],
};

export const userQueryKeys = {
  origin: ["users"] as const,
  lists: () => [...userQueryKeys.origin, "list"],
  list: (page: number, pageSize: number, search: string = "") => [
    ...userQueryKeys.lists(),
    { page, pageSize, search },
  ],
  details: (id: string) => [...userQueryKeys.origin, "detail", id],
  create: () => [...userQueryKeys.origin, "create"],
};

export const serverQueryKeys = {
  origin: ["servers"] as const,
  list: (page: number, pageSize: number, search: string = "") => [
    ...serverQueryKeys.origin,
    "list",
    { page, pageSize, search },
  ],
};
