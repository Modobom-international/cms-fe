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
    statusCode: number;
    message: string;
    details: string;
  }

  interface IValidationErrors {
    [key: string]: string[];
  }

  interface IPaginatedResponse<T> {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
    data: T[];
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }

  interface IPaginationResponse<T> {
    success: true;
    message: string;
    value: IPaginatedResponse<T>;
  }

  interface IErrorPaginationResponse<T = any> {
    isSuccess: false;
    message: string;
    value: IPaginatedResponse<T>;
  }
}
