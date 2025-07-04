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
  origin: ["domains"],
  all: () => [...domainQueryKeys.origin, "all"],
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
  ) => [
    ...domainQueryKeys.origin,
    "list",
    { page, pageSize, search, ...filters },
  ],
  available: (page: number, pageSize: number, search: string) => [
    ...domainQueryKeys.origin,
    "list",
    "available",
    { page, pageSize, search },
  ],
  details: (id: string) => [...domainQueryKeys.origin, "detail", id],
  refresh: () => [...domainQueryKeys.origin, "refresh"],
  domainPaths: (domain: string, page: number, pageSize: number) =>
    [
      ...domainQueryKeys.origin,
      "list",
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
  list: (
    page: number,
    pageSize: number,
    search?: string,
    dateFrom?: string,
    dateTo?: string,
    userId?: string,
    actionGroups?: string[],
    actions?: string[],
    sortField?: string,
    sortDirection?: string
  ) =>
    [
      ...activityLogQueryKeys.origin,
      "list",
      {
        page,
        pageSize,
        search: search || "",
        dateFrom,
        dateTo,
        userId,
        actionGroups,
        actions,
        sortField,
        sortDirection,
      },
    ] as const,
  stats: (dateFrom?: string, dateTo?: string, userId?: string | string[]) =>
    [
      ...activityLogQueryKeys.origin,
      "stats",
      { dateFrom, dateTo, userId },
    ] as const,
  filters: () => [...activityLogQueryKeys.origin, "filters"] as const,
  export: (params?: any) =>
    [...activityLogQueryKeys.origin, "export", params] as const,
};

export const notificationQueryKeys = {
  origin: ["notifications"] as const,
  list: (email: string) =>
    [...notificationQueryKeys.origin, "list", email] as const,
};

export const htmlSourceQueryKeys = {
  origin: ["htmlSources"] as const,
  all: () => [...htmlSourceQueryKeys.origin, "all"],
  list: (page: number, pageSize: number, search: string) => [
    ...htmlSourceQueryKeys.origin,
    "list",
    { page, pageSize, search },
  ],
  details: (id: string) => [...htmlSourceQueryKeys.origin, "detail", id],
};

export const teamQueryKeys = {
  origin: ["teams"] as const,
  all: () => [...teamQueryKeys.origin, "all"],
  list: (page: number, pageSize: number, search: string = "") => [
    ...teamQueryKeys.origin,
    "list",
    { page, pageSize, search },
  ],
  details: (id: string) => [...teamQueryKeys.origin, "detail", id],
  create: () => [...teamQueryKeys.origin, "create"],
};

export const teamPermissionQueryKeys = {
  origin: ["team-permissions"] as const,
  list: () => [...teamPermissionQueryKeys.origin, "list"] as const,
};

export const userQueryKeys = {
  origin: ["users"] as const,
  all: (team?: string, search?: string) => [
    ...userQueryKeys.origin,
    "all",
    { team, search },
  ],
  list: (page: number, pageSize: number, search: string = "") => [
    ...userQueryKeys.origin,
    "list",
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
  create: () => [...serverQueryKeys.origin, "create"],
  update: (id: string) => [...serverQueryKeys.origin, "update", id],
  delete: (id: string) => [...serverQueryKeys.origin, "delete", id],
};

export const siteQueryKeys = {
  origin: ["sites"] as const,
  all: () => [...siteQueryKeys.origin, "all"] as const,
  list: (filters: string) =>
    [...siteQueryKeys.origin, "list", { filters }] as const,
  details: (siteId: string) =>
    [...siteQueryKeys.origin, "detail", siteId] as const,
};

export const pageQueryKeys = {
  origin: ["pages"] as const,
  all: () => [...pageQueryKeys.origin, "all"] as const,
  listBySiteId: (siteId: string) =>
    [...pageQueryKeys.origin, "list", siteId] as const,
  details: (pageId: string) =>
    [...pageQueryKeys.origin, "detail", pageId] as const,
};

export const attendanceQueryKeys = {
  origin: ["attendance"] as const,
  today: (employeeId: number) =>
    [...attendanceQueryKeys.origin, "today", employeeId] as const,
  report: (
    date: string,
    filters?: { type?: string; branch_name?: string; include_leave?: boolean }
  ) => [...attendanceQueryKeys.origin, "report", { date, ...filters }] as const,
  complaints: (params?: {
    status?: string;
    employee_id?: number;
    complaint_type?: string;
    page?: number;
    per_page?: number;
  }) => [...attendanceQueryKeys.origin, "complaints", { ...params }] as const,
  complaintDetails: (id: number) =>
    [...attendanceQueryKeys.origin, "complaints", "detail", id] as const,
  complaintStatistics: () =>
    [...attendanceQueryKeys.origin, "complaints", "statistics"] as const,
};

export const apiKeyQueryKeys = {
  origin: ["api-keys"] as const,
  list: () => [...apiKeyQueryKeys.origin, "list"],
  create: () => [...apiKeyQueryKeys.origin, "create"],
  update: (id: string) => [...apiKeyQueryKeys.origin, "update", id],
  delete: (id: string) => [...apiKeyQueryKeys.origin, "delete", id],
};

export const appInformationQueryKeys = {
  origin: ["app-information"] as const,
  list: (
    page: number,
    pageSize: number,
    app_name?: string | string[],
    os_name?: string | string[],
    os_version?: string | string[],
    app_version?: string | string[],
    category?: string | string[],
    platform?: string | string[],
    country?: string | string[],
    event_name?: string | string[],
    network?: string | string[],
    event_value?: string | string[],
    from?: string,
    to?: string
  ) =>
    [
      ...appInformationQueryKeys.origin,
      "list",
      {
        page,
        pageSize,
        app_name,
        os_name,
        os_version,
        app_version,
        category,
        platform,
        country,
        event_name,
        network,
        event_value,
        from: from || "",
        to: to || "",
      },
    ] as const,
  filterMenu: () => [...appInformationQueryKeys.origin, "filter-menu"] as const,
  byUserId: (userId: string) =>
    [...appInformationQueryKeys.origin, "user", userId] as const,
  chart: (
    app_name?: string | string[],
    os_name?: string | string[],
    os_version?: string | string[],
    app_version?: string | string[],
    category?: string | string[],
    platform?: string | string[],
    country?: string | string[],
    event_name?: string | string[],
    network?: string | string[],
    event_value?: string | string[],
    from?: string,
    to?: string
  ) =>
    [
      ...appInformationQueryKeys.origin,
      "chart",
      {
        app_name,
        os_name,
        os_version,
        app_version,
        category,
        platform,
        country,
        event_name,
        network,
        event_value,
        from,
        to,
      },
    ] as const,
};

export const storageQueryKeys = {
  origin: ["storage"] as const,
  all: () => [...storageQueryKeys.origin, "all"] as const,
  fileStructure: (prefix: string = "") =>
    [...storageQueryKeys.origin, "file-structure", prefix] as const,
  files: (prefix: string = "") =>
    [...storageQueryKeys.origin, "files", prefix] as const,
  upload: () => [...storageQueryKeys.origin, "upload"] as const,
  presignedUrls: () => [...storageQueryKeys.origin, "presigned-urls"] as const,
  createFolder: () => [...storageQueryKeys.origin, "create-folder"] as const,
  delete: (itemId: string) =>
    [...storageQueryKeys.origin, "delete", itemId] as const,
  download: (itemId: string) =>
    [...storageQueryKeys.origin, "download", itemId] as const,
};
