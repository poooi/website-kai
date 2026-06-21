import { z } from 'zod'

export interface PoiVersions {
  version: string
  betaVersion: string
}

export const poiVersionsSchema = z.object({
  version: z.string(),
  betaVersion: z.string(),
})

export type FetchLike = typeof fetch

export const poiVersionsUrl =
  'https://raw.githubusercontent.com/poooi/poi-release/master/latest.json'

export class UpstreamResponseError extends Error {
  constructor(readonly status: number) {
    super(`Upstream responded with ${status}`)
  }
}

export class UpstreamTimeoutError extends Error {
  constructor() {
    super('Upstream request timed out')
  }
}

export class UpstreamNetworkError extends Error {
  constructor(cause: unknown) {
    super('Upstream request failed')
    this.cause = cause
  }
}

export class InvalidUpstreamResponseError extends Error {
  constructor(cause: unknown) {
    super('Upstream response did not match expected schema')
    this.cause = cause
  }
}

interface FetchPoiVersionsOptions {
  fetcher?: FetchLike
  timeoutMs?: number
  signal?: AbortSignal
}

export const DEFAULT_TIMEOUT_MS = 10_000

export const fetchWithTimeout = async (
  fetcher: FetchLike,
  input: Parameters<FetchLike>[0],
  init: Parameters<FetchLike>[1] = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> => {
  let timeout: ReturnType<typeof setTimeout> | undefined
  let timedOut = false
  const controller = new AbortController()
  const abortFromSignal = () => {
    controller.abort(init.signal?.reason)
  }

  if (init.signal?.aborted) {
    abortFromSignal()
  } else {
    init.signal?.addEventListener('abort', abortFromSignal, { once: true })
  }

  try {
    return await Promise.race([
      fetcher(input, { ...init, signal: controller.signal }),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          timedOut = true
          controller.abort(new UpstreamTimeoutError())
          reject(new UpstreamTimeoutError())
        }, timeoutMs)
      }),
    ])
  } catch (error) {
    if (timedOut) {
      throw new UpstreamTimeoutError()
    }
    throw error
  } finally {
    if (timeout) {
      clearTimeout(timeout)
    }
    init.signal?.removeEventListener('abort', abortFromSignal)
  }
}

export const fetchPoiVersions = async ({
  fetcher = fetch,
  timeoutMs,
  signal,
}: FetchPoiVersionsOptions = {}): Promise<PoiVersions> => {
  let resp: Response
  try {
    resp = await fetchWithTimeout(
      fetcher,
      poiVersionsUrl,
      { signal },
      timeoutMs,
    )
  } catch (error) {
    if (error instanceof UpstreamTimeoutError) {
      throw error
    }
    throw new UpstreamNetworkError(error)
  }

  if (!resp.ok) {
    throw new UpstreamResponseError(resp.status)
  }

  try {
    return poiVersionsSchema.parse(await resp.json())
  } catch (error) {
    throw new InvalidUpstreamResponseError(error)
  }
}
