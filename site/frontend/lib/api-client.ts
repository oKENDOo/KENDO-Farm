import type { ApiErrorBody } from "@shared/api-contracts";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json().catch(() => ({}))) as Partial<ApiErrorBody> & T;
  if (!response.ok) {
    throw new ApiRequestError(body.error ?? "Request failed.", response.status);
  }
  return body as T;
}
