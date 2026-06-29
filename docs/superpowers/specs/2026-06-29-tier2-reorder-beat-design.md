# Tier 2 — Smart Reorder & Today's Beat

Date: 2026-06-29 · Status: approved

Two field-force features that run on data the backend already exposes. No
backend changes.

## Backend reality (confirmed against `Milk/`)

- **Reorder**: `GET /orders` + `GET /orders/:id` return past orders with items
  (`productId`, `qty`). The cart is a client-side Zustand store
  (`features/cart/store.ts`). Reorder is therefore 100% client-side: read a past
  order → fill the cart → submit through the existing window flow.
- **Beat**: `GET /customers` returns a `route: string | null` per outlet. There
  is **no** `lat`/`lng` in the customer DTO and **no** `GET /sales-visits`
  endpoint (only `POST /sales-visits`). So the beat is grouped by `route` (not
  GPS), and check-in state is tracked on-device.

## A. Smart Reorder

- **`features/orders/hooks.ts`** — add `useReorder()`: given an `Order`, if the
  cart is non-empty confirm via `confirmDialog` before replacing it, then
  `useCart.setQty(productId, qty)` for each item and `router.push("/(app)/order/edit")`.
  Reorder only *fills* the cart; submission still passes through the existing
  cutoff/window checks.
- **`app/(app)/order/[id].tsx`** — a primary **"Reorder these items"** button.

## B. Today's Beat

- **`features/beat/store.ts`** — Zustand store persisted to AsyncStorage
  (`zustand/middleware` `persist` + the app's existing async-storage dep),
  shaped `{ [dateKey: string]: { [customerId: string]: "VISITED" | "SKIPPED" } }`.
  API: `markVisited(id)`, `markSkipped(id)`, `clearStatus(id)`, and a
  `statusesForToday()` selector. `dateKey` = `YYYY-MM-DD` local.
- **`app/(app)/beat/index.tsx`** — Today's Beat:
  - Reuses `useCustomers()` (real `/customers`).
  - Groups outlets by `route` (null/empty → "Unassigned") into sections.
  - Progress header: "N of M done" for today; a "pending only" toggle.
  - Per outlet row: tap → outlet detail (`/(app)/customers/:id`); **Check in**
    (mark VISITED), **Skip** (mark SKIPPED), **Book visit** → `sales-visits/new`
    prefilled with the outlet.
  - Loading/Error/Empty states per the repo pattern.
- **`app/(app)/sales-visits/new.tsx`** — accept optional `?retailerId=` (and
  `?route=`) params and use them as form defaults so "Book visit" lands ready.
- **`app/(app)/(tabs)/index.tsx`** — a **"Today's Beat"** entry point in the
  Home quick actions.

## Constraints (documented, not built)

- **No GPS/map** — customer DTO has no coordinates; beat is route-ordered, not
  distance-sorted. GPS would require extending the backend DTO (deferred).
- **Check-in is on-device** — no `GET /sales-visits`, so "visited" is local
  state. Booking a visit still writes server-side via `POST /sales-visits`.

## Verification

No test runner is configured. Verification = `npm run typecheck` and
`npm run lint` pass, plus `expo export` (web bundle) builds. No new test
framework.

## Branching

Built on `feat/tier1-credit-dashboard-whatsapp` (both edit the Home screen);
new branch `feat/tier2-reorder-beat`.
