type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class HttpError extends Error {
  status: number;
  bodyText?: string;

  constructor(message: string, opts: { status: number; bodyText?: string }) {
    super(message);
    this.name = 'HttpError';
    this.status = opts.status;
    this.bodyText = opts.bodyText;
  }
}

export async function http<TResponse>(
  path: string,
  opts?: {
    method?: HttpMethod;
    body?: unknown;
    signal?: AbortSignal;
  },
): Promise<TResponse> {
  const res = await fetch(path, {
    method: opts?.method ?? 'GET',
    headers: opts?.body ? { 'Content-Type': 'application/json' } : undefined,
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
    signal: opts?.signal,
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => undefined);
    throw new HttpError(`HTTP ${res.status} ${res.statusText}`, {
      status: res.status,
      bodyText,
    });
  }

  return (await res.json()) as TResponse;
}

