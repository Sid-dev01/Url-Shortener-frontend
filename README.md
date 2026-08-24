# URL Shortner Frontend

#Currently under construction.
React, TypeScript, Vite, and Tailwind CSS frontend for the Fastify URL Shortner API.

The UI checks API health, creates short URLs, copies generated links, and opens short links.

## Folder Structure

```text
src/
  api/                 API request functions
  config/              Environment and endpoint objects
  types/               Shared TypeScript response types
  utils/               Small URL and storage helpers
  App.tsx              App composition and state
  index.css            Tailwind import and global typography reset
```

Endpoint strings are kept in `src/config/apiEndpoints.ts` and imported into `src/api/urlShortenerApi.ts`.

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:4001
VITE_API_VERSION=v1
```

## Local Development

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```




