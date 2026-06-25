# Backend Alignment Report

Source of truth: `Milk/apps/api` (NestJS) + `Milk/packages/contracts` (Zod) +
`Milk/packages/database/prisma/schema.prisma`.

The live backend is **Slice 1: Foundation + Ordering Core**. It exposes only
three modules — **Auth, Catalog, Ordering**. Several screens in this app assume
endpoints that do not exist yet. This document maps reality and flags the gaps.

## Real endpoint inventory (everything that exists)

| Method | Path | Body | Returns | Roles |
|---|---|---|---|---|
| POST | `/auth/otp/request` | `{ phone: E.164 }` | `{ message }` | public |
| POST | `/auth/otp/verify` | `{ phone, code }` | `{ accessToken, refreshToken, expiresIn }` | public |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken, expiresIn }` | public |
| POST | `/auth/logout` | — | 204 | auth |
| GET | `/catalog/products` | `?category=&active=` | `ProductDto[]` | auth |
| POST | `/orders` | `{ orderWindowId, items:[{productId, qty:string}] }` | `Order` | RETAILER |
| POST | `/orders/:id/submit` | — | `Order (+reviewReasons)` | RETAILER |
| POST | `/orders/review` | `{ orderId, decision, reason }` | `Order` | staff only |
| GET | `/orders` | — (no pagination) | `Order[]` (≤100, desc) | auth (scoped) |
| GET | `/orders/:id` | — | `Order` | auth (scoped) |

### Real DTO shapes (decimals are JSON **strings**)
```
ProductDto = { id, sku, name, category: 'MILK'|'DAIRY',
  uom: 'LITRE'|'ML'|'KG'|'GRAM'|'PIECE'|'POUCH',
  packSize: string, taxRate: string, isReturnablePack: boolean, active: boolean }
  // NOTE: no price. Retail price lives in PriceList and is applied server-side.

Order = { id, retailerId, distributorId, orderWindowId, deliveryDate,
  status: 'DRAFT'|'SUBMITTED'|'APPROVED'|'REJECTED'|'IN_PRODUCTION'
        |'DISPATCHED'|'DELIVERED'|'SETTLED'|'CANCELLED',
  source: 'STANDING'|'MANUAL', approvalType?, approvedById?,
  subtotal: string, taxTotal: string, total: string,
  items: [{ id, productId, unitPrice: string, qtyOrdered: string,
            qtyApproved?, qtyDispatched?, qtyDelivered?, qtyReturned, returnReason? }],
  createdAt, updatedAt }
```

## Per-feature alignment status

| App feature | Backend reality | Status |
|---|---|---|
| **Login (phone/OTP)** | `/auth/otp/*`, phone **E.164**, field is **`code`**, response is **tokens only** | ✅ **Aligned now** — phone→`+91…`, `code`, identity decoded from JWT |
| Token refresh | `/auth/refresh` matches | ✅ already correct |
| Profile screen | **No `/auth/me`**; no `shopName` in token | ⚠️ Partial — shows JWT claims only (name/phone/distributor). Shop details need a new endpoint |
| **Product catalog** | `GET /catalog/products`; **no price field** | ⚠️ Needs adapter + **product decision: hide prices or add a price endpoint** |
| **Today's draft order** | **No `/orders/today`; no auto-draft generation in API** | ❌ Missing endpoint |
| **Edit draft line-by-line** | **No `PATCH /orders/:id`** — orders are created whole, then submitted | ❌ Flow mismatch — must move to cart→`POST /orders`→`submit` |
| Order window / cutoff | `POST /orders` requires `orderWindowId` but **no endpoint returns the open window** | ❌ **Hard blocker** — app can't obtain a window id |
| **Confirm order** | `POST /orders/:id/submit` (DRAFT→SUBMITTED, may auto-approve) | ⚠️ Rename "confirm"→"submit"; map statuses |
| **Order history** | `GET /orders` (≤100, no cursor) | ⚠️ Works; drop infinite-scroll/cursor — it's a capped list |
| Order status badge | Real enum has 9 states (no `CONFIRMED`/`LOCKED`) | ⚠️ Remap badge labels |
| **Standing orders** | Contract exists (`weekdayMask` int, `upsertStandingOrderSchema`) but **no controller/route** | ❌ No endpoints — cannot manage from app |
| **Notifications** | **No module at all** | ❌ No endpoints |
| Push / FCM device reg | **No `/devices` endpoint** | ❌ No endpoints |

## Blockers & required decisions

1. **Order window endpoint (blocker).** Placing any order needs an
   `orderWindowId`, but no route returns the current open window for a retailer.
   → Backend must add e.g. `GET /orders/windows/current` (or
   `GET /order-windows?status=OPEN`). Until then, real-mode ordering can't work.

2. **Order UX model.** Backend has no draft auto-generation and no line PATCH —
   it's **cart → `POST /orders` → `POST /:id/submit`**. The app's "today's draft
   you edit and confirm" needs to become a **local cart you build and submit**.
   → Product decision: confirm the cart model is acceptable for retailers.

3. **Prices in catalog.** Products carry no price; totals are only known after
   `POST /orders` returns. → Decide: (a) hide prices, show totals post-submit, or
   (b) backend adds a retailer price endpoint.

4. **Standing orders & notifications are not in Slice 1.** Schema/contract exist
   for standing orders; no controller. Notifications have nothing.
   → Defer these screens to "Slice 2" (keep them mock-only behind the flag), or
   prioritise the backend routes.

## What is aligned in code right now

Decisions taken: **cart model**, **hide prices**, **defer standing/notifications**.

- **Auth** — `features/auth/{schemas,api}.ts` + `core/auth/jwt.ts`: E.164 phone,
  `code` field, tokens-only response, identity decoded from the JWT.
- **Catalog** — `features/products/*`: real `GET /catalog/products` + `ProductDto`
  (sku/uom/packSize/taxRate, decimals as strings); **no price shown**; pack label
  derived (`productUnitLabel`).
- **Ordering (cart model)** — `features/cart/store.ts` (Zustand cart) +
  `features/orders/{schemas,api,hooks}.ts`: `POST /orders` → `POST /:id/submit`,
  `GET /orders`, `GET /orders/:id`; decimal strings parsed to numbers at the api
  boundary; real 9-state `OrderStatus`. Catalog → cart → **Place Order** flow.
- **Window** — `useCurrentWindow()` returns a mock window; real mode throws
  `WINDOW_UNAVAILABLE` (blocker §1) with a clear in-app notice on the cart screen.

Still mock-only (no backend route — deferred to Slice 2):

- **Standing orders** — aligned to the real `weekdayMask` contract shape, but
  `api.ts` throws "not available" in real mode.
- **Notifications** — mock feed only.

Mock mode (`EXPO_PUBLIC_USE_MOCKS=true`) runs the entire app end to end. To go
live, the backend needs: the **order-window endpoint** (§1), then standing-order
and notification routes (§4) to light those features up — each feature's `api.ts`
is the single swap point.
