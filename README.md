# flood-road — ทางบ้าน
Mobile-first community flood road reports for Klaeng, Rayong. Real OpenStreetMap road segments with three reported states: cars can pass, cars cannot pass, closed/dangerous. Unknown or reports older than 60 minutes never imply safety.

## Cloudflare
Static assets + Workers API + D1. No photo uploads or rescue request dispatch in v1. Reports are shared; reporter counts represent browser identities, not verified people. History shows the latest 100 reports per road with total report/browser counts. Map snapshots may lag by up to 30 seconds. Observation times can be up to 7 days old. A browser identity is limited to 30 reports/hour; this is a basic limit, not strong identity or bot verification.

Road data covers the pilot bounding box, not all of Thailand. Basemap: OpenFreeMap; rendering: MapLibre; roads: OpenStreetMap contributors (ODbL). External map tiles and scripts have their own availability dependencies.

## Development
Requires Node 22+.
```
npm ci
npx wrangler d1 migrations apply klaeng-road-reports --local
npm run dev
```
Local development uses a separate local D1 database. Existing demo reports in localStorage are not uploaded.

## Checks and deployment
```
npm run check
npm test
npx wrangler login
npx wrangler d1 migrations apply klaeng-road-reports --remote
npm run deploy
```
Deployment targets the account and D1 database named in wrangler.jsonc. API tests write only local data. Never run tests against production.

## GitHub CI/CD
Pull requests run packaging and local D1 API integration checks. Pushes to main deploy after checks pass. Set repository Actions secrets `CLOUDFLARE_API_TOKEN` (account-scoped Workers Scripts Edit and D1 Edit with required account read access) and `CLOUDFLARE_ACCOUNT_ID`. Never commit tokens. GitHub Actions does not reuse local Wrangler OAuth login.

Free quotas are not an uptime guarantee. API traffic and D1 rows read/written must be monitored. No paid plan or R2 subscription is required by this version.
