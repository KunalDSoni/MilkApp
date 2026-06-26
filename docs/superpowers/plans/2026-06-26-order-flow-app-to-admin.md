# Order Flow: MilkApp → MilkAdmin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a retailer's order placed in **MilkApp** (Expo) appear in the **MilkAdmin** admin console (`apps/web`) for review, by closing the one missing backend piece — the order-window endpoint — and pointing the app at the real API.

**Architecture:** The two GitHub repos share one backend. **MilkAdmin** is a Turbo monorepo containing the NestJS API (`apps/api`), the Next.js admin web (`apps/web`), Prisma DB (`packages/database`) and Zod contracts (`packages/contracts`). **MilkApp** is a frontend-only Expo client that calls that API. The ordering controller (`POST /orders` → `POST /orders/:id/submit`) and the admin orders list/detail/review UI already exist. The **only** structural gap is that `POST /orders` requires an `orderWindowId`, but no endpoint returns the open window and the seed creates none. We add a read-only `GET /orders/windows/current` endpoint plus a seeded rolling-open window, then wire MilkApp's `fetchCurrentWindow()` to it and flip it out of mock mode.

**Tech Stack:** NestJS, Prisma + PostgreSQL, Zod (`@moderns-milk/contracts`), Vitest (API unit tests), Next.js (admin web), Expo / React Native + TanStack Query (MilkApp).

## Decision: window source (was an open question)

Chosen: **read-only `GET /orders/windows/current` + a seeded, rolling-open `OrderWindow`.**
- Read-only endpoint — no side-effecting GET; the API only *reports* the open window.
- Seed supplies one OPEN window per demo distributor with a cutoff ~18h out, refreshed on every `db:seed` run so re-seeding re-opens it.
- **Deferred (not in this plan):** a scheduled job that opens a window per route per day, and/or an admin "Open/Close window" UI in `apps/web`. Either slots in later behind the same endpoint — MilkApp does not change again.

## Global Constraints

- **Two repos.** MilkAdmin (`KunalDSoni/MilkAdmin`) is **not** checked out locally yet — Task 1 clones it. MilkApp is the current working repo.
- **API base path:** global prefix `api` + URI version `1` ⇒ all routes live under `http://localhost:4000/api/v1`. Health: `GET /api/v1/health`.
- **Money/quantity are decimal strings in JSON** — never floats. The app parses them to numbers at its `api.ts` boundary; do not change that.
- **Let Prisma assign the `OrderWindow` id.** The contract's `cuid` is actually just `z.string().min(1)` (any non-empty string passes), so `orderWindowId` validation is lenient — but still let Prisma generate the id (`@default(cuid())`) rather than hardcoding one, to keep ids consistent and collision-free across re-seeds.
- **NestJS route order:** in `OrderingController`, the static route `@Get('windows/current')` MUST be declared **before** the param route `@Get(':id')`, or `:id` will shadow it.
- **Roles:** the window endpoint is for the app, so `@Roles('RETAILER')`. Order creation/submit are already `@Roles('RETAILER')`; review is staff-only.
- **API tests are pure-domain (no DB).** Existing Vitest tests (`apps/api/test/*.test.ts`) test pure functions only. New backend logic that must be unit-tested goes in a pure function in `apps/api/src/ordering/domain/cutoff.ts`; service/controller wiring is verified by manual curl, not a DB-backed test.
- **MilkApp has no test runner** (scripts are `typecheck`, `lint`, `format` only). MilkApp changes are verified with `npm run typecheck` + `npm run lint` + a manual run against the live API — do not invent a Jest/Vitest harness for it.

---

### Task 1: Bring up MilkAdmin backend locally and confirm the gap

**Files:**
- Clone: `MilkAdmin` repo into a sibling directory of MilkApp (e.g. `../MilkAdmin`)
- Read: `MilkAdmin/README.md`, `MilkAdmin/.env.example`

**Interfaces:**
- Produces: a running API at `http://localhost:4000/api/v1`, a seeded Postgres DB, and a retailer access token used by later manual checks.

- [ ] **Step 1: Clone the monorepo next to MilkApp**

```bash
cd /Users/kunal/Downloads/Agentic/App/MilkApp
git clone https://github.com/KunalDSoni/MilkAdmin.git ../MilkAdmin
cd ../MilkAdmin
```

- [ ] **Step 2: Configure env and install**

```bash
cp .env.example .env      # dev defaults; SMS_PROVIDER=console prints OTP to the log
npm install
```

- [ ] **Step 3: Start infra, generate client, migrate, seed**

```bash
npm run infra:up          # postgres + redis + minio via docker-compose
npm run db:generate
npm run db:migrate
npm run db:seed           # catalog + retail price list + demo distributor/retailer
```

- [ ] **Step 4: Run the API**

```bash
npm run dev --workspace @moderns-milk/api
```
Expected log line: `Moderns Milk API listening on :4000`.

- [ ] **Step 5: Confirm health, log in as the seeded retailer, and reproduce the blocker**

```bash
curl -s http://localhost:4000/api/v1/health

# Request OTP for the seeded retailer (+910000000003). The code prints to the API log.
curl -s -X POST http://localhost:4000/api/v1/auth/otp/request \
  -H 'Content-Type: application/json' -d '{"phone":"+910000000003"}'
# Read the OTP from the API process log, then:
curl -s -X POST http://localhost:4000/api/v1/auth/otp/verify \
  -H 'Content-Type: application/json' -d '{"phone":"+910000000003","code":"<OTP_FROM_LOG>"}'
# -> capture accessToken into $TOK

# Prove the gap: there is currently no window endpoint (404 from the :id route).
curl -s http://localhost:4000/api/v1/orders/windows/current -H "Authorization: Bearer $TOK"
```
Expected: health returns ok; verify returns `{accessToken,...}`; the windows call returns a 404 / "Order not found" (the `:id` route catching `windows` or a plain 404) — confirming no real window endpoint exists yet.

- [ ] **Step 6: No commit** — this task only stands up the environment.

---

### Task 2: Add the `pickOpenWindow` pure selector (TDD)

**Files:**
- Modify: `apps/api/src/ordering/domain/cutoff.ts`
- Test: `apps/api/test/windows.test.ts` (create)

**Interfaces:**
- Consumes: existing `isWindowOpen(window, now)` and `OrderWindowLike` from the same file.
- Produces: `pickOpenWindow<T extends SelectableWindow>(windows: T[], now: Date): T | null` and the `SelectableWindow` interface, used by Task 3's service method.

- [ ] **Step 1: Write the failing test**

Create `apps/api/test/windows.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { pickOpenWindow } from '../src/ordering/domain/cutoff';

const mk = (
  id: string,
  status: 'OPEN' | 'LOCKED',
  deliveryDate: string,
  cutoffAt: string,
) => ({
  id,
  status: status as 'OPEN' | 'LOCKED',
  deliveryDate: new Date(deliveryDate),
  cutoffAt: new Date(cutoffAt),
});

const now = new Date('2026-06-26T08:00:00Z');

describe('pickOpenWindow', () => {
  it('returns null when nothing is open', () => {
    expect(
      pickOpenWindow([mk('a', 'LOCKED', '2026-06-27', '2026-06-26T18:00:00Z')], now),
    ).toBeNull();
  });

  it('ignores OPEN windows whose cutoff has passed', () => {
    expect(
      pickOpenWindow([mk('a', 'OPEN', '2026-06-27', '2026-06-26T07:00:00Z')], now),
    ).toBeNull();
  });

  it('returns the soonest-delivery open window', () => {
    const r = pickOpenWindow(
      [
        mk('late', 'OPEN', '2026-06-28', '2026-06-26T18:00:00Z'),
        mk('soon', 'OPEN', '2026-06-27', '2026-06-26T18:00:00Z'),
      ],
      now,
    );
    expect(r?.id).toBe('soon');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test --workspace @moderns-milk/api -- windows`
Expected: FAIL — `pickOpenWindow` is not exported from `cutoff.ts`.

- [ ] **Step 3: Implement the selector**

Append to `apps/api/src/ordering/domain/cutoff.ts`:

```ts
export interface SelectableWindow extends OrderWindowLike {
  deliveryDate: Date;
}

/**
 * The window a retailer should order into right now: OPEN, before cutoff,
 * soonest delivery first. Pure — caller supplies `now` and the candidate list.
 */
export function pickOpenWindow<T extends SelectableWindow>(
  windows: T[],
  now: Date,
): T | null {
  const open = windows
    .filter((w) => isWindowOpen(w, now))
    .sort((a, b) => a.deliveryDate.getTime() - b.deliveryDate.getTime());
  return open[0] ?? null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test --workspace @moderns-milk/api -- windows`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit (in the MilkAdmin repo)**

```bash
cd ../MilkAdmin
git checkout -b feat/order-window-endpoint
git add apps/api/src/ordering/domain/cutoff.ts apps/api/test/windows.test.ts
git commit -m "feat(ordering): add pickOpenWindow selector for current order window"
```

---

### Task 3: Add `getCurrentWindow` service method + `GET /orders/windows/current` route

**Files:**
- Modify: `apps/api/src/ordering/ordering.service.ts`
- Modify: `apps/api/src/ordering/ordering.controller.ts`

**Interfaces:**
- Consumes: `pickOpenWindow` (Task 2); `PrismaService`, `AuthenticatedUser`, `ForbiddenException`, `NotFoundException` (already imported in the service).
- Produces: `OrderingService.getCurrentWindow(user)` returning a Prisma `OrderWindow`; HTTP `GET /orders/windows/current` (RETAILER) returning that window as JSON, or 404 when none is open.

- [ ] **Step 1: Import the selector in the service**

In `apps/api/src/ordering/ordering.service.ts`, extend the existing cutoff import:

```ts
import { isWindowOpen, pickOpenWindow } from './domain/cutoff';
```

- [ ] **Step 2: Add the service method**

In the same file, add a method to the `OrderingService` class (e.g. directly after `createOrder`):

```ts
// -- current window --------------------------------------------------------

async getCurrentWindow(user: AuthenticatedUser) {
  if (!user.retailerId) {
    throw new ForbiddenException('Only retailers have an order window');
  }
  const retailer = await this.prisma.retailer.findUnique({
    where: { id: user.retailerId },
  });
  if (!retailer) throw new NotFoundException('Retailer not found');

  const windows = await this.prisma.orderWindow.findMany({
    where: { distributorId: retailer.distributorId, status: 'OPEN' },
    orderBy: { deliveryDate: 'asc' },
  });
  const open = pickOpenWindow(windows, new Date());
  if (!open) throw new NotFoundException('No open order window');
  return open;
}
```

- [ ] **Step 3: Add the controller route BEFORE the `:id` getter**

In `apps/api/src/ordering/ordering.controller.ts`, add this method immediately **above** the existing `@Get(':id')` handler:

```ts
@Get('windows/current')
@Roles('RETAILER')
currentWindow(@CurrentUser() user: AuthenticatedUser) {
  return this.ordering.getCurrentWindow(user);
}
```

- [ ] **Step 4: Verify the route compiles and 404s cleanly (still no seeded window)**

With the API still running (restart if not in watch mode), reuse `$TOK` from Task 1:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  http://localhost:4000/api/v1/orders/windows/current -H "Authorization: Bearer $TOK"
```
Expected: `404` with body message `No open order window` (route now exists; no window yet — fixed in Task 4).

- [ ] **Step 5: Commit (MilkAdmin repo)**

```bash
git add apps/api/src/ordering/ordering.service.ts apps/api/src/ordering/ordering.controller.ts
git commit -m "feat(ordering): expose GET /orders/windows/current for retailers"
```

---

### Task 4: Seed a rolling-open order window

**Files:**
- Modify: `packages/database/src/seed.ts`

**Interfaces:**
- Consumes: the `distributor` and `route` records already created in `seed.ts`.
- Produces: one OPEN `OrderWindow` (CUID id, ~18h cutoff) for `DIST-001`, refreshed on every seed run.

- [ ] **Step 1: Add the window seed block**

In `packages/database/src/seed.ts`, after the `retailerAccount` upsert and **before** `console.log('Seed complete.');`, insert:

```ts
  // Open order window for tomorrow's delivery. Rolling cutoff (~18h) so that
  // re-running the seed always leaves an OPEN window the app can order into.
  // Let Prisma assign the id (CUID) — createOrderSchema validates orderWindowId
  // as a CUID, so a hardcoded non-cuid id would be rejected by the API.
  const deliveryDate = new Date();
  deliveryDate.setUTCDate(deliveryDate.getUTCDate() + 1);
  deliveryDate.setUTCHours(0, 0, 0, 0);
  const cutoffAt = new Date(Date.now() + 18 * 60 * 60 * 1000);

  const existingWindow = await prisma.orderWindow.findFirst({
    where: { distributorId: distributor.id, deliveryDate },
  });
  if (existingWindow) {
    await prisma.orderWindow.update({
      where: { id: existingWindow.id },
      data: { status: 'OPEN', cutoffAt, routeId: route.id },
    });
  } else {
    await prisma.orderWindow.create({
      data: {
        distributorId: distributor.id,
        routeId: route.id,
        deliveryDate,
        cutoffAt,
        status: 'OPEN',
      },
    });
  }
  console.log('  open order window');
```

- [ ] **Step 2: Re-run the seed**

```bash
cd ../MilkAdmin
npm run db:seed
```
Expected: log includes `  open order window` and `Seed complete.`

- [ ] **Step 3: Verify the endpoint now returns the window**

```bash
curl -s http://localhost:4000/api/v1/orders/windows/current -H "Authorization: Bearer $TOK"
```
Expected: `200` JSON with `id` (a cuid), `deliveryDate`, `cutoffAt`, `status: "OPEN"`, `distributorId`.

- [ ] **Step 4: Commit (MilkAdmin repo)**

```bash
git add packages/database/src/seed.ts
git commit -m "feat(db): seed a rolling-open order window for the demo distributor"
```

---

### Task 5: Point MilkApp's `fetchCurrentWindow()` at the real endpoint

**Files:**
- Modify: `src/features/orders/api.ts` (MilkApp repo)

**Interfaces:**
- Consumes: `apiClient` (axios, baseURL = `env.apiUrl`); `orderWindowSchema` from `./schemas`.
- Produces: a real-mode `fetchCurrentWindow()` that returns an `OrderWindow` or throws a `WINDOW_UNAVAILABLE`-coded error on 404 (so the cart screen shows its existing "no window" notice). Mock-mode behavior is unchanged.

- [ ] **Step 1: Import the window schema**

In `src/features/orders/api.ts`, extend the schema import to include `orderWindowSchema`:

```ts
import {
  CartLine,
  Order,
  OrderWindow,
  orderSchema,
  orderStatusSchema,
  orderWindowSchema,
} from "./schemas";
```

- [ ] **Step 2: Replace the `fetchCurrentWindow` body**

Replace the entire existing `fetchCurrentWindow` function with:

```ts
/** Returns the retailer's open order window, or throws WINDOW_UNAVAILABLE (404). */
export async function fetchCurrentWindow(): Promise<OrderWindow> {
  if (env.useMocks) {
    await delay(200);
    return currentWindow;
  }
  try {
    const { data } = await apiClient.get("/orders/windows/current");
    return orderWindowSchema.parse({
      id: data.id,
      deliveryDate: data.deliveryDate,
      cutoffAt: data.cutoffAt,
      status: data.status,
    });
  } catch (e) {
    const status = (e as { response?: { status?: number } }).response?.status;
    if (status === 404) {
      const err = new Error("No order window is open right now.");
      (err as { code?: string }).code = "WINDOW_UNAVAILABLE";
      throw err;
    }
    throw e;
  }
}
```

- [ ] **Step 3: Typecheck and lint**

```bash
cd /Users/kunal/Downloads/Agentic/App/MilkApp
npm run typecheck
npm run lint
```
Expected: both pass with no errors.

- [ ] **Step 4: Commit (MilkApp repo)**

```bash
git add src/features/orders/api.ts
git commit -m "feat(orders): fetch the live order window from GET /orders/windows/current"
```

---

### Task 6: Point MilkApp at the live backend

**Files:**
- Create: `.env` (MilkApp repo; gitignored — not committed)

**Interfaces:**
- Produces: real-mode runtime config so the app talks to the local API instead of mocks.

- [ ] **Step 1: Create `.env` from the example and flip to real mode**

Create `/Users/kunal/Downloads/Agentic/App/MilkApp/.env`:

```
EXPO_PUBLIC_USE_MOCKS=false
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_SENTRY_DSN=
```

> **Device/emulator host note:** `localhost` works for the **iOS simulator** and **web**. For an **Android emulator** use `http://10.0.2.2:4000/api/v1`; for a **physical device** use your machine's LAN IP (e.g. `http://192.168.x.x:4000/api/v1`). The API sets `cors origin:false`, which blocks the **react-native-web** target — test the end-to-end flow on iOS sim / Android emulator / a device, not the web build. (CORS for web can be enabled later in `apps/api/src/main.ts`.)

- [ ] **Step 2: Start the app against the live API**

```bash
npx expo start --clear
```
Expected: app boots and reaches the login screen with no `Invalid environment configuration` error.

- [ ] **Step 3: No commit** — `.env` is gitignored by design.

---

### Task 7: End-to-end verification — order in MilkApp appears in MilkAdmin

**Files:** none (manual verification across both running apps).

**Interfaces:**
- Consumes: API + seeded window (Tasks 1–4), real-mode MilkApp (Tasks 5–6), and the existing admin web orders UI.

- [ ] **Step 1: Run the admin web console**

```bash
cd ../MilkAdmin
npm run dev --workspace @moderns-milk/web
```
Open the printed URL, log in as the seeded **distributor** (`+910000000002`, OTP from the API log), and go to **Orders**. Note the current list (likely empty).

- [ ] **Step 2: Place an order from MilkApp**

In the running app: log in as the **retailer** (`+910000000003`, OTP from the API log) → open the **catalog** → add quantities to the cart → **Place Order**. Expected: success (no `WINDOW_UNAVAILABLE`), and the order shows in the app's **Orders/history** as `SUBMITTED` (or `APPROVED` if auto-approval fired).

- [ ] **Step 3: Confirm it registered in the admin console**

Refresh the admin **Orders** page. Expected: the new order appears (correct retailer, delivery date, total). Open it — line items, quantities, and totals match what was ordered. The **review dialog** offers Approve / Reject.

- [ ] **Step 4: (Optional) Confirm review round-trips**

Approve the order in the admin console; reload the app's order detail. Expected: status reflects the decision (e.g. `APPROVED`/`REJECTED`).

- [ ] **Step 5: Push the backend branch and open a PR (MilkAdmin)**

```bash
cd ../MilkAdmin
git push -u origin feat/order-window-endpoint
gh pr create --fill
```

- [ ] **Step 6: Push the MilkApp branch and open a PR**

```bash
cd /Users/kunal/Downloads/Agentic/App/MilkApp
git push -u origin <current-branch>
gh pr create --fill
```

---

## Self-Review

**Spec coverage**
- "Which app has BE/FE" → established in Architecture (MilkAdmin = BE + admin FE; MilkApp = FE-only). ✅
- "Order from MilkApp registers in admin" → Tasks 2–4 (window endpoint + seed) unblock placing; Tasks 5–6 wire the app; Task 7 verifies it lands in the admin orders list. ✅
- Window-source open question → resolved in the Decision section (read-only endpoint + seeded rolling window; admin/scheduled generation deferred). ✅

**Placeholder scan** — no "TBD"/"add error handling"/"similar to Task N"; every code step has full code; the 404→`WINDOW_UNAVAILABLE` path is spelled out. ✅

**Type consistency** — `pickOpenWindow`/`SelectableWindow` defined in Task 2 and consumed by name in Task 3; `getCurrentWindow(user)` defined in Task 3 and called by the controller route in the same task; `orderWindowSchema` is the existing MilkApp schema (`{id, deliveryDate, cutoffAt, status}`), matching the fields parsed in Task 5; the seeded window's id is a Prisma CUID, satisfying `createOrderSchema`'s `cuid` validation when the app later POSTs the order. ✅

## Risks / things to watch

- **Prisma migration for `OrderWindow` exists.** The model is in `schema.prisma`; if `db:migrate` has not been run since it was added, the seed insert will fail — `npm run db:migrate` in Task 1 covers it.
- **No active retail price list ⇒ order creation throws** `No active retail price list configured`. The seed already creates `Default Retail Price List` (RETAILER), so this is covered as long as `db:seed` ran.
- **`GET /orders` staff scoping.** The admin list relies on `listOrders(user)` scoping to the staff member's distributor. The seeded distributor owns the seeded retailer, so the order is in-scope; if a real order doesn't show, check the scope logic in `ordering.service.ts`.
- **OTP retrieval in real mode.** Unlike mock mode (fixed `123456`), real mode prints the OTP to the API log (`SMS_PROVIDER=console`). Read it from the running API process output.

---

# Part 2: Share `@moderns-milk/contracts` (kill the type duplication)

**Goal:** Make MilkApp import the backend's Zod contracts instead of hand-copying them, so order/auth/catalog types can't silently drift between app and API.

**Why this approach:** The package is pure Zod + TS and compiles to plain CJS + `.d.ts`, so a published version is consumed by Metro/Expo (and EAS) with **zero bundler config** — far simpler than a git submodule, which would need Metro `watchFolders` + Babel to transpile out-of-tree TS. Repos stay separate (layout A).

**Scope of the swap (important):** Only the *source-of-truth* pieces move to the shared package — the enums and request-input schemas (`OrderStatus`, `createOrderSchema`/`CreateOrderInput`, `phoneSchema`, `Role`, catalog DTOs). MilkApp **keeps** its UI-only derived models (e.g. the number-parsed `orderSchema`, the `OrderWindow` UI shape) because those don't exist in contracts — the API returns decimal **strings** and the app parses them to numbers at its `api.ts` boundary. Don't delete those.

## Registry: npm public (chosen)

Decided: publish to **npm as a public scoped package** — zero-auth consumption in MilkApp + EAS. Prerequisite: the `@moderns-milk` npm org must exist (free for public scoped packages) — create it under your npm account, or rename the package to a scope you own. Types become public, which is fine since both repos already are.

---

### Task 8: Make `@moderns-milk/contracts` publishable

**Files:**
- Modify: `packages/contracts/package.json` (MilkAdmin repo)

**Interfaces:**
- Produces: a published, versioned `@moderns-milk/contracts` whose `dist/` (CJS + types) MilkApp can install. `zod` becomes a **peerDependency** so the consumer's single zod copy is reused (two zod instances break `instanceof`/parsing).

- [ ] **Step 1: Update the package manifest**

Edit `packages/contracts/package.json` to:

```json
{
  "name": "@moderns-milk/contracts",
  "version": "0.1.1",
  "private": false,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "publishConfig": { "access": "public" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "lint": "echo \"no lint\"",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.7.2",
    "vitest": "^3.2.6",
    "zod": "^3.24.1"
  }
}
```

> For **GitHub Packages** instead: keep `"private": false`, replace `publishConfig` with `{ "registry": "https://npm.pkg.github.com" }`, and ensure the package name scope matches your GitHub org/user.

- [ ] **Step 2: Build and verify the output**

```bash
cd ../MilkAdmin
npm run build -w @moderns-milk/contracts
ls packages/contracts/dist/index.js packages/contracts/dist/index.d.ts
```
Expected: both files exist.

- [ ] **Step 3: Commit (MilkAdmin repo)**

```bash
git add packages/contracts/package.json
git commit -m "chore(contracts): make @moderns-milk/contracts publishable with zod as peer dep"
```

---

### Task 9: Publish the package (outward-facing — confirm before running)

**Files:** none.

**Interfaces:**
- Produces: `@moderns-milk/contracts@0.1.1` available on the chosen registry.

- [ ] **Step 1: Authenticate to the registry**

```bash
npm whoami || npm login        # npm public
# GitHub Packages: configure ~/.npmrc with //npm.pkg.github.com/:_authToken=<PAT(write:packages)>
```

- [ ] **Step 2: Publish**

```bash
cd ../MilkAdmin
npm publish -w @moderns-milk/contracts --access public
```
Expected: `+ @moderns-milk/contracts@0.1.1`. (If the scope/org doesn't exist on npm, create the org first or rename the package.)

---

### Task 10: Consume the package in MilkApp; delete the duplicated schemas

**Files:**
- Modify: `package.json` (MilkApp)
- Modify: `src/features/orders/schemas.ts`
- Modify: `src/features/orders/api.ts`
- Modify: `src/features/auth/schemas.ts`
- Modify: `src/features/products/schemas.ts` (only if it re-declares catalog enums)

**Interfaces:**
- Consumes: `@moderns-milk/contracts` (`OrderStatus`, `createOrderSchema`, `CreateOrderInput`, `phoneSchema`, `Role`, catalog DTOs).
- Produces: MilkApp schemas that re-export the shared source-of-truth and keep only UI-derived models locally.

- [ ] **Step 1: Add the dependency**

```bash
cd /Users/kunal/Downloads/Agentic/App/MilkApp
npm install @moderns-milk/contracts@^0.1.1
```
> GitHub Packages: add `@moderns-milk:registry=https://npm.pkg.github.com` to a project `.npmrc` first (and a `NODE_AUTH_TOKEN` for EAS).

- [ ] **Step 2: Replace the order status enum with the shared one**

In `src/features/orders/schemas.ts`, delete the locally-declared `orderStatusSchema` enum body and re-export the shared one, keeping the alias the rest of the app imports:

```ts
import { OrderStatus as orderStatusSchema } from "@moderns-milk/contracts";
export { orderStatusSchema };
export type OrderStatus = import("@moderns-milk/contracts").OrderStatus;
```
Leave `orderWindowSchema`, `orderLineSchema`, `orderSchema`, `CartLine`, and `CreateOrderInput` as-is **unless** replacing `CreateOrderInput` with the contract's (next step). `windowStatusSchema` stays local (no contract equivalent).

- [ ] **Step 3: Use the contract's create-order input shape**

In `src/features/orders/schemas.ts`, replace the local `CreateOrderInput` interface with the shared type:

```ts
export type { CreateOrderInput } from "@moderns-milk/contracts";
```
Verify `src/features/orders/api.ts`'s `createOrder` body still matches the shared shape (`{ orderWindowId, items: [{ productId, qty: string }] }`) — it does; no change needed.

- [ ] **Step 4: Share the phone schema in auth**

In `src/features/auth/schemas.ts`, replace any locally-declared E.164 phone regex with:

```ts
import { phoneSchema } from "@moderns-milk/contracts";
```
and use `phoneSchema` where the local one was referenced. Keep OTP/`code` field schemas local if they have no contract equivalent.

- [ ] **Step 5: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```
Expected: both pass. Resolve any mismatch by importing the contract type rather than re-declaring it.

- [ ] **Step 6: Smoke-test mock + real mode still parse**

Start the app (`npx expo start --clear`), confirm the catalog, cart, and order-history screens render in mock mode, then (with the backend running and `.env` real) place an order. Expected: no Zod parse errors — the shared schemas accept the API payloads.

- [ ] **Step 7: Commit (MilkApp repo)**

```bash
git add package.json package-lock.json src/features/orders/schemas.ts src/features/auth/schemas.ts
git commit -m "refactor(contracts): consume @moderns-milk/contracts instead of hand-copied schemas"
```

---

## Part 2 — Self-Review

- **Duplication removed where a single source exists** (order status, create-order input, phone, roles, catalog DTOs); **UI-only derived models kept** (number-parsed order/line/window) because contracts has no equivalent. ✅
- **No two-zod-copies hazard** — `zod` is a peerDependency, so MilkApp's existing zod is reused. ✅
- **Metro/EAS** — consumes compiled CJS from `node_modules`; no `watchFolders` needed. ✅
- **Outward-facing gate isolated** to Task 9 (publish), flagged for explicit confirmation. ✅
- **Versioning caveat** — with layout A, MilkApp pins a contracts version; bump + republish (Tasks 8–9) whenever the backend contracts change, then `npm update` in MilkApp. This is the residual cost of separate repos (vs a monorepo's automatic linking). ✅
