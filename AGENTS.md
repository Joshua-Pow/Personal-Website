# AGENTS.md

## Cursor Cloud specific instructions

This is a Vite + TanStack Start personal website (TanStack Router, Query, and Ultracite/Oxlint) deployed to Cloudflare Workers via the Cloudflare Vite plugin. For local development you run Vite — you do **not** need remote Cloudflare bindings authenticated against production.

### Services

There is a single service: the TanStack Start app.

- Dev server: `npm run dev` (Vite on http://localhost:3000, with the Cloudflare Vite plugin so Worker bindings work locally).
- Lint + typecheck: `npm run lint` (regenerates the adages manifest, then `ultracite check` + `tsc --noEmit`). The Husky `pre-commit` hook runs this.
- Format/fix: `npm run fix` (`ultracite fix`).
- Build: `npm run build` (Vite / TanStack Start).
- Cloudflare preview/deploy: `npm run preview` / `npm run deploy`. Deploy also syncs adage images to R2. Preview uses `vite preview` (Cloudflare Vite plugin). Production bindings are KV `VISITOR_LOCATION` and R2 `ADAGES_IMAGES`. These are **not** required to develop or run the app locally.

### Non-obvious notes

- `src/lib/adages-manifest.ts` is generated (and gitignored) by `scripts/generate-adages-manifest.mjs` from the `.mdx` files in `src/content/adages/`. Every relevant npm script (`dev`, `build`, `lint`) regenerates it first, so you rarely need to run it by hand — but if you add/edit adages you must re-run one of those scripts.
- Local dev degrades external integrations gracefully:
  - `POST /api/visitor-location` mocks the location as "Toronto, Ontario 🇨🇦" when `import.meta.env.DEV` is true and uses an in-memory store instead of Cloudflare KV.
  - `/api/adages-images/*` tries R2 first, then `adages-images/web/<slug>.webp` on disk, then proxies from production (`SITE_URL`) and caches into that folder.
  - `/api/spotify` returns HTTP 500 without Spotify secrets; this is expected locally. To enable it, provide `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REFRESH_TOKEN`. `src/lib/spotify.ts` reads them from the Worker `env` (and `process.env` as a fallback), so injecting them as env vars (Cursor Secrets) or adding them to `.dev.vars` both work — the running dev server must be restarted after they change (a tmux/shell session started before the secrets were injected won't have them; start a fresh session). With valid secrets the endpoint returns `{ currentlyPlaying, lastPlayed }`; both are `null` when nothing is playing/recently played, and `SpotifyWidget` renders nothing in that case. Note: `getSpotifyData` mints a new access token on every request, so rapid back-to-back polling can intermittently 401/403 from Spotify token propagation — this is pre-existing behavior, not a setup problem.
- The interactive globe (the `cobe` WebGL canvas on the homepage) may render as a solid black circle in headless/virtualized displays. This is a rendering-environment limitation, not a code or setup bug — the rest of the page works normally.
- Linting/formatting is Ultracite with Oxlint + Oxfmt, including the `anti-slop` preset. `npx ultracite check` / `npx ultracite fix` are the supported entry points.
- `.dev.vars` is for local Worker secrets; no secrets are required for local dev.
