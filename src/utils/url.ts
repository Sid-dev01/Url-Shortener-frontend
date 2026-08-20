export function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function getShortCode(shortUrl: string) {
  return shortUrl.split('/').filter(Boolean).at(-1) ?? shortUrl
}
