# Enerza — Frontend

The web app for **Enerza**, a load-shedding and power-outage management system for an electricity distributor. Customers see when their power will be cut and why, report outages and pay their bills; technicians work the outages assigned to them; the control room schedules load shedding, dispatches crews and watches the grid.

Built with Next.js 16 (App Router) on top of the [Enerza API](https://github.com/fh-ratul/enerza-backend).

| | |
|---|---|
| Live site | _to be added after deployment_ |
| API repository | https://github.com/fh-ratul/enerza-backend |
| Demo video | _to be added_ |

## Demo logins

The login page has a **one-click demo button for each role**. The credentials stay on the server: the button calls a Server Action, so nothing is typed and nothing is exposed to the browser.

| Role | Lands on | Sign in |
|---|---|---|
| Customer | `/dashboard` | demo button, or `customer1@enerza.com` / `Enerza@12345` |
| Technician | `/technician` | demo button, or `tech.north@enerza.com` / `Enerza@12345` |
| Admin | `/admin` | demo button |

Payments run against the gateways' **test mode**. On SSLCommerz's sandbox page use card `4111 1111 1111 1111`, any future expiry, any CVV, then press **Success** on the OTP page.

## Features

**Public**
- Home, Services, About, FAQ and Contact, with figures read live from the grid
- **Coverage**: a searchable, filterable, paginated feeder directory (find the feeder that supplies your street)
- **Tariff**: the slab rates and a live bill estimator that uses the same arithmetic as the API

**Customer** (`/dashboard`)
- Overview with a live "is my power on?" status, amount due and a monthly consumption chart
- Feeder schedule grouped by day, with countdowns
- Outage reports with a photo (preview and upload progress) and a repair timeline; the API answers whether it is a planned cut, a known outage or a new one
- Bills with a full breakdown, **payment through bKash or SSLCommerz**, and a payment history
- Profile with photo upload and an area picker

**Technician** (`/technician`)
- Job board: start work and resolve with a note, both with optimistic updates
- On/off duty switch
- Performance: repairs per week and average time to restore by priority

**Admin** (`/admin`)
- Control-room overview: open outages, MTTR, load being shed, revenue, SAIDI/SAIFI by zone, billed against collected
- Feeders: create, edit, soft-delete, with an areas field array
- Schedules: drafts, publish, cancel with a reason
- **Rotation generator**: a three-step wizard that dry-runs a fair load-shedding plan before saving it
- Outage dispatch: automatic or named assignment, reassignment, cancel, log an incident
- Bills (issue from a meter reading), users (block, unblock, promote to technician) and the audit log with a before/after view

## Stack

Next.js 16 (App Router, Cache Components, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Radix) · TanStack Query 5 · Zustand · React Hook Form + Zod 4 · Recharts · Sonner · jose · Nodemailer

## Getting started

Requires Node.js 20.9 or newer and a running [Enerza API](https://github.com/fh-ratul/enerza-backend).

```bash
npm install
cp .env.example .env.local     # then fill it in (see below)
npm run dev                    # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | Generates route types, then `tsc --noEmit` |
| `npm run lint` | ESLint (Next.js rules, including the React Compiler rules) |
| `npm run format` | Prettier |

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | yes | Public URL of this app (metadata, sitemap, Open Graph) |
| `API_URL` | yes | Enerza API base URL including `/api/v1`. Only the server calls it |
| `INTERNAL_API_KEY` | recommended | Same value as in the API's `.env`. Lets the API rate-limit and audit per visitor instead of per frontend server |
| `JWT_ACCESS_SECRET` | optional | Same value as in the API. When set, the proxy verifies the token signature and not only its expiry |
| `DEMO_*_EMAIL`, `DEMO_*_PASSWORD` | for demo buttons | The three demo accounts. Server-side only |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | optional | Shows "Continue with Google". The origin of this app must be authorised for that client in Google Cloud |
| `SMTP_USER`, `SMTP_PASSWORD`, `CONTACT_INBOX` | optional | Gmail SMTP for the contact form |

### Connecting the payment gateways

The gateways send the customer back to **this app**, which asks the API to verify the payment. In the API's environment set:

```
PAYMENT_CALLBACK_URL=<this app's URL>/api      # e.g. http://localhost:3000/api
```

## Architecture

```
src/
├── app/
│   ├── (public)/      marketing pages: static, refreshed in the background
│   ├── (auth)/        login and the registration wizard
│   ├── (app)/         dashboard · technician · admin, one layout per role
│   ├── (checkout)/    /payment/success and /payment/cancel
│   └── api/           proxy to the API, and the two gateway callbacks
├── features/          one folder per domain: components, schemas, queries
├── components/        ui (shadcn), shared (DataTable, StatCard, StatusBadge…), layout, charts
├── hooks/             useAuth, useDebounce, usePagination, useUrlState, useResource…
├── lib/               API clients, auth, formatters, tariff, status tables
├── stores/            Zustand: registration draft, preferences
└── proxy.ts           route protection (Next.js 16's name for middleware)
```

### How the pieces fit

**The browser never holds a token.** Logging in runs on the server and stores the access and refresh tokens in `httpOnly` cookies on this app's own domain. Client components call the same-origin route `/api/proxy/*`, which adds the `Authorization` header on the server, renews an expired access token once, and forwards only an allow-list of API paths. Server Components call the API directly with the cookie.

**Route protection** lives in `src/proxy.ts`. It reads the session cookie and redirects before a page renders: no session goes to `/login?redirect=…`, the wrong role goes to that role's own home, and an expired token is renewed transparently. It is a first line only; the API authorises every request for data.

**Server and Client Components.**
- *Server*: every `page.tsx` and `layout.tsx`, the marketing sections, the coverage results, the payment result pages. They fetch with the visitor's cookie or from the cached public endpoint, and send no JavaScript for what does not need it.
- *Client*: anything with state or events: forms, tables with URL-driven filters, dialogs, charts, the theme toggle.
- The hand-over: a page prefetches its data on the server (`<Prefetch resources={…}>`) into TanStack Query's cache, and the client component underneath reads the same resource with `useResource()`. The first paint is complete, and the browser fetches nothing until the data goes stale. One `resources.*` descriptor defines the path and the cache key for both sides, so they cannot drift apart.

**Loading and errors.** Every data route has a `loading.tsx` skeleton shaped like the page it stands in for; every section has an `error.tsx` boundary; there is a custom 404 and a `global-error.tsx`. Lists have an empty state for "nothing yet" and another for "nothing matches these filters". API failures surface as toasts, in the API's own words.

**URL state.** Search, filters, sorting, page and page size all live in the query string (`useUrlState`, `useTableParams`, `usePagination`), so any view can be bookmarked, shared and reloaded. On the public pages a change navigates, so the server renders the results; in the dashboards it only rewrites the address (History API) and TanStack Query fetches, so filters respond at once.

**Forms** use React Hook Form with Zod schemas that mirror the API's own validation rules, and field errors returned by the API are shown under the matching field. Registration and the rotation generator are multi-step wizards validated step by step.

**Optimistic updates**: starting a job, going on or off duty and blocking a user change on screen immediately and roll back if the API refuses.

**Payments.** The pay dialog asks the API to open a checkout session with bKash or SSLCommerz and sends the browser to the gateway. The gateway returns the customer to `/api/payments/<gateway>/callback`; that handler passes what it received to the API, which verifies it with the gateway itself, and redirects to `/payment/success` or `/payment/cancel` carrying only the payment's id. Those pages read the amount, status and transaction from the API, so a made-up link can never display a payment that did not happen.

**Charts** share one colour-blind-safe palette (validated for light and dark surfaces), and every chart can be switched to a table of the same numbers.

## Accessibility and SEO

Semantic landmarks, a skip link, labelled controls, visible focus rings, keyboard-operable dialogs and menus (Radix), `aria-sort` on sortable columns, reduced-motion support, and colour never used as the only signal. Public pages have their own metadata, canonical URLs, Open Graph tags, a sitemap and `robots.txt`; signed-in pages are marked `noindex`.

## Deployment (Vercel)

1. Import the repository and set the environment variables above (`API_URL` pointing at the deployed API).
2. Set `PAYMENT_CALLBACK_URL=<site URL>/api` and `FRONTEND_URL=<site URL>` in the API's environment.
3. If Google sign-in is enabled, add the site URL to the OAuth client's authorised JavaScript origins.

Uploads pass through this app's server, and Vercel caps a request body at about 4.5 MB, so the app accepts images up to 4 MB.

## Credits

Photography from [Unsplash](https://unsplash.com); see [public/images/CREDITS.md](public/images/CREDITS.md). Tariff rates are illustrative, not an official BERC schedule.
