export type ApiErrorBody = {
  code: string;
  message: string;
  details: Record<string, unknown>;
};

export type ApiErrorResponse = {
  error: ApiErrorBody;
};

export class ApiRequestError extends Error {
  readonly code: string;
  readonly details: Record<string, unknown>;
  readonly status?: number;

  constructor(
    error: ApiErrorBody,
    options?: { status?: number; cause?: unknown }
  ) {
    super(error.message);
    this.name = "ApiRequestError";
    this.code = error.code;
    this.details = error.details ?? {};
    this.status = options?.status;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export type Page = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type DataResponse<T> = {
  data: T;
};
