export const API_ENDPOINTS = {
  system: {
    health: '/health',
  },
  urls: {
    shorten: (version: string) => `/api/${version}/shorten`,
    redirect: (shortCode: string) => `/${shortCode}`,
  },
} as const
