const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export const appEnv = {
  apiBaseUrl: trimTrailingSlash(
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4001',
  ),
  apiVersion: import.meta.env.VITE_API_VERSION ?? 'v1',
} as const
