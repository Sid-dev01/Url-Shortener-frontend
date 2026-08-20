export type ApiHealth = 'checking' | 'online' | 'offline'

export interface HealthResponse {
  status: string
  message: string
}

export interface ShortLink {
  originalUrl: string
  shortUrl: string
}

export interface ShortenResponse {
  success: boolean
  data: ShortLink
}
