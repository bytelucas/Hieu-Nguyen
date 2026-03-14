# Metric Tracking - Frontend POC

POC page connecting to backend metrics API.

## Run locally

```bash
pnpm install
pnpm dev
```

Frontend runs at http://localhost:5173. Vite proxies `/api` to backend (localhost:3000).

## Build

```bash
pnpm build
```

Output in `dist/`.

## Environment variables

- `VITE_API_URL`: API base URL. Default `/api` (when deployed behind same domain with Nginx proxy).
