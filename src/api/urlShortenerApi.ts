import { API_ENDPOINTS } from '../config/apiEndpoints'
import { appEnv } from '../config/env'
import type { HealthResponse, ShortLink, ShortenResponse } from '../types/url'

const requestUrl = (path: string) => new URL(path, appEnv.apiBaseUrl).toString()

export class NetworkRequestError extends Error {
  constructor() {
    super('Network request failed. Check your connection or API URL.')
    this.name = 'NetworkRequestError'
  }
}

export class ApiRequestError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
  }
}

export async function getApiHealth(): Promise<HealthResponse> {
  let response: Response

  try {
    response = await fetch(requestUrl(API_ENDPOINTS.system.health))
  } catch {
    throw new NetworkRequestError()
  }

  if (!response.ok) {
    throw new ApiRequestError('API health check failed.', response.status)
  }

  return response.json()
}

export async function shortenUrl(originalUrl: string): Promise<ShortLink> {
  let response: Response

  try {
    response = await fetch(
      requestUrl(API_ENDPOINTS.urls.shorten(appEnv.apiVersion)),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl }),
      },
    )
  } catch {
    throw new NetworkRequestError()
  }

  const payload = await readShortenResponse(response)

  if (!response.ok || !payload.data) {
    throw new ApiRequestError(
      payload.message ?? 'The API could not create a short URL.',
      response.status,
    )
  }

  return payload.data
}

async function readShortenResponse(response: Response) {
  try {
    return (await response.json()) as Partial<ShortenResponse> & {
      message?: string
    }
  } catch {
    return {
      message: 'The API returned an unreadable response.',
    }
  }
}
