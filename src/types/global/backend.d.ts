export {};

declare global {
  interface IRequest {
    url: string;
    method: string;
    body?: { [key: string]: any };
    queryParams?: any;
    useCredentials?: boolean;
    headers?: any;
    nextOption?: any;
  }

  interface IBackendRes<T> {
    success: true;
    message: string;
    value: T;
  }

  interface IBackendErrorRes {
    success: false;

    message: string;
    type: string;
    error: string;
  }

  interface IValidationErrors {
    [key: string]: string[];
  }

  interface IPaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: ILink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
  }

  interface IPaginationResponse<T> {
    success: true;
    message: string;
    data: IPaginatedResponse<T>;
    type: string;
  }
  export interface ILink {
    url?: string | null;
    label: string;
    active: boolean;
  }

  interface IErrorPaginationResponse {
    success: false;
    message: string;
    data: IPaginatedResponse<any>;
    type: string;
  }
}
