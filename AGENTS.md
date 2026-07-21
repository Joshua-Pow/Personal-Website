# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js 16 personal website (App Router, Turbopack) that is deployed to
Cloudflare Workers via OpenNext. For local development you run plain Next.js — you do
**not** need Cloudflare/wrangler auth or any remote bindings.

### Services

There is a single service: the Next.js app.

- Dev server: `npm run dev` (Next.js + Turbopack on http://localhost:3000).
- Lint + typecheck: `npm run lint` (runs `eslint src` then `tsc --noEmit`). The Husky
  `pre-commit` hook runs this.
- Build: `npm run build` (standard Next.js build).
- Cloudflare preview/deploy: `npm run preview` / `npm run deploy` build with OpenNext and
  require Cloudflare credentials + real bindings (KV `VISITOR_LOCATION`, R2
  `ADAGES_IMAGES`). These are **not** needed to develop or run the app locally.

### Non-obvious notes

- `src/lib/adages-manifest.ts` is generated (and gitignored) by
  `scripts/generate-adages-manifest.mjs` from the `.mdx` files in `src/content/adages/`.
  Every relevant npm script (`dev`, `build`, `lint`) regenerates it first, so you rarely
  need to run it by hand — but if you add/edit adages you must re-run one of those scripts.
- Local dev degrades external integrations gracefully:
  - `POST /api/visitor-location` mocks the location as "Toronto, Ontario 🇨🇦" when
    `NODE_ENV=development` and uses an in-memory store instead of Cloudflare KV.
  - `/api/spotify` returns HTTP 500 without Spotify secrets; this is expected locally.
 To enable it, provide `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and
 `SPOTIFY_REFRESH_TOKEN`. `src/lib/spotify.ts` reads them straight from `process.env`,
 so injecting them as env vars (Cursor Secrets) or adding them to `.dev.vars` both work —
 the running dev server must be restarted after they change.
- The interactive globe (the `cobe` WebGL canvas on the homepage) may render as a solid
  black circle in headless/virtualized displays. This is a rendering-environment
  limitation, not a code or setup bug — the rest of the page works normally.
- `.dev.vars` only sets `NEXTJS_ENV=development`; no secrets are required for local dev.
