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
      page,
      pageSize,
      date,
      domain,
      path,
    ] as const,
};

export const domainQueryKeys = {
  all: ["domains"],
  lists: () => [...domainQueryKeys.all, "list"],
  list: (
    page: number,
    pageSize: number,
    search: string,
    filters?: {
      status?: string;
      is_locked?: boolean;
      renewable?: boolean;
      registrar?: string;
      has_sites?: boolean;
      time_expired?: string;
      renew_deadline?: string;
      registrar_created_at?: string;
    }
  ) => [...domainQueryKeys.lists(), { page, pageSize, search, ...filters }],
  available: (page: number, pageSize: number, search: string) => [
    ...domainQueryKeys.lists(),
    "available",
    { page, pageSize, search },
  ],

  domains: () => [...domainQueryKeys.all, "domains"],
  details: (id: string) => [...domainQueryKeys.all, "detail", id],
  refresh: () => [...domainQueryKeys.all, "refresh"],
  domainPaths: (domain: string, page: number, pageSize: number) =>
    [...domainQueryKeys.all, "domain-paths", domain, page, pageSize] as const,
};

export const domainWithoutPaginationQueryKeys = {
  list: (user_id?: string, search: string = "") => [
    "domains",
    "without-pagination",
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
