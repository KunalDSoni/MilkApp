# Tier 1 — Credit & Collections, Dashboard KPIs, WhatsApp

Date: 2026-06-29 · Status: approved

Surfaces backend capabilities the app already has but never rendered: the
credit ledger, the field dashboard, and WhatsApp outreach. No backend changes.

## Backend reality (confirmed against `Milk/`)

- `GET /customers/:id/ledger` → `OutletLedgerDto { retailerId, outletName,
  balance: string, creditLimit: string, entries: LedgerEntryDto[] }`.
  `LedgerEntryDto = { id, type: 'DEBIT'|'CREDIT', amount, refType, refId,
  balanceAfter, note, createdAt }`. Decimals are JSON **strings**.
- `POST /collections` body `{ retailerId, amount: string, mode:
  'CASH'|'UPI'|'CHEQUE'|'OTHER', note? }` → returns the updated `OutletLedgerDto`.
- `GET /dashboard` → `{ network: { distributors, outlets, salesReps },
  dues: { outstanding: string, outletsWithDues: number },
  visits: { count, newOutlets, withOrder, strikeRatePct },
  topSkus: [{ productId, name, qty: number, value: string }] }`.
- The customer-list `id` (`GET /customers`) **is** the retailer id the ledger
  routes expect (`Retailer.id`). No id translation needed.

## Architecture

Two new feature modules following the repo convention `schemas → api → hooks`,
with mock/real switched on `env.useMocks` and decimal strings parsed to numbers
at the `api.ts` boundary (same as `features/orders`).

```
src/features/ledger/      schemas.ts · api.ts · hooks.ts
src/features/dashboard/   schemas.ts · api.ts · hooks.ts
src/lib/whatsapp.ts       openWhatsApp(phone, message)
src/app/(app)/customers/[id].tsx          NEW  outlet detail + statement
src/app/(app)/customers/[id]/collect.tsx  NEW  record-payment form
src/app/(app)/(tabs)/index.tsx            EDIT KPI strip
src/app/(app)/(tabs)/customers.tsx        EDIT cards → detail
src/features/customers/api.ts             EDIT seed ~4 demo outlets
```

## 1. Credit & Collections ("Khata")

- **`features/ledger/schemas.ts`** — `paymentModeSchema`
  (`CASH|UPI|CHEQUE|OTHER`), `ledgerEntrySchema` (amount/balanceAfter parsed to
  numbers via `z.coerce.number()`), `outletLedgerSchema`, and a UI form schema
  `recordCollectionFormSchema { amount (positive), mode, note? }`.
- **`features/ledger/api.ts`** — `fetchOutletLedger(retailerId)` →
  `GET /customers/:id/ledger`; `recordCollection({ retailerId, amount, mode,
  note })` → `POST /collections`. Mock branch reads/writes an in-memory
  `Map<retailerId, OutletLedger>` seeded with realistic data; `recordCollection`
  appends a CREDIT entry and lowers the balance so the demo round-trips.
- **`features/ledger/hooks.ts`** — `useOutletLedger(retailerId)`;
  `useRecordCollection()` invalidates the ledger, `customers`, and `dashboard`
  query keys.
- **Outlet detail** (`customers/[id].tsx`): header card showing **balance vs.
  credit limit** (utilisation bar; danger tone when over limit), `Record
  Payment` and `Send Statement` (WhatsApp) buttons, then a statement list —
  DEBIT red (↑ owes), CREDIT green (↓ paid), each with note, date, running
  `balanceAfter`. Loading/Error/Empty states per the repo pattern.
- **Record payment** (`customers/[id]/collect.tsx`): RHF + Zod form mirroring
  `customers/new.tsx` — amount (numeric), mode chips, optional note → submit →
  `router.back()` to a refreshed detail.

## 2. Home Dashboard KPIs

- **`features/dashboard/`** — `useDashboard()` → `GET /dashboard`; mock returns
  seeded KPIs consistent with the seeded ledgers (outstanding = sum of seeded
  balances).
- **Home edit**: a KPI strip under the greeting — **Dues to collect**
  (₹ outstanding · N outlets, taps to Customers), **Visits 30d** + strike-rate %,
  **New outlets**, and a compact **Top products** list. Existing "Place order"
  CTA and quick actions remain. KPIs degrade gracefully (skeleton/hidden) while
  loading or if the endpoint is unavailable — they never block the screen.

## 3. WhatsApp

- **`lib/whatsapp.ts`** — `openWhatsApp(phone, message)` builds a
  `https://wa.me/<digits>?text=<encoded>` URL and opens it via
  `Linking.openURL`, with a graceful `alertDialog` fallback if WhatsApp can't be
  opened. Phone is normalised to digits; prefers the outlet `whatsapp`, falls
  back to `phone`.
- Used on the outlet detail for **Send Statement** (balance + recent entries
  summary) and a **Payment reminder** action.

## Constraint (documented, not built)

The customers-list endpoint returns no balance, so per-outlet dues render on the
**detail** screen (one ledger call), not on every list card — avoids an N+1.
Total outstanding lives on the dashboard. A future `balance` field on the list
endpoint would let cards show dues inline.

## Mock seeding

`customers/api.ts` seeds ~4 outlets (currently empty). The ledger mock seeds a
per-outlet `OutletLedger` with order DEBITs and payment CREDITs, realistic
balances/limits (one outlet over limit, one clear), and the dashboard mock
reports totals consistent with those balances.

## Verification

No test runner is configured (scripts: typecheck/lint/format). Verification is:
`npm run typecheck` and `npm run lint` pass, plus a web screenshot of Home, the
outlet detail, and the record-payment flow (visual proof). No new test
framework is introduced.
