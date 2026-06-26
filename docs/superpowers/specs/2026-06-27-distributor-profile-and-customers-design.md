# Distributor Profile & Customer List — Design

**Goal:** Give the distributor (the app's single user) two self-service capabilities:
1. **Profile** — view/edit their own business name, contact-person name, and address.
2. **Customers** — view their retailer/outlet list and add new customers.

**Context:** The Milk App is the distributor-facing app (single role: `DISTRIBUTOR`). The shared NestJS backend + Prisma DB live in the MilkAdmin monorepo (`apps/api`, `packages/database`, `packages/contracts`). This feature spans both repos.

## Decisions (locked with the user)

- Retailers added here are **customer records only** — no login. The distributor is the only account that signs in. (A stub `User` row is still created because the schema ties `Retailer → User`, but it never authenticates.)
- Profile **"Name" = both** business name (`Distributor.name`) and contact-person name (the logged-in `User.name`), plus a new address field.
- **One** contact number per customer (also used as WhatsApp) → the stub user's `phone`.
- **Route** is **free text** — typed per customer; we create-or-reuse a `Route` by name under the distributor.
- The **Customers tab replaces the Alerts tab** (Alerts has no backend yet). Final bar: Home · Products · Orders · Customers · Profile.
- First scope: **List + Add** only. Edit/delete is out of scope for this pass.

## Data model

One new column (migration required):

```prisma
model Distributor {
  // ...existing: id, code, name, region, status
  address String?   // NEW
}
```

Everything else maps to existing fields:

| Customer field | Stored as |
|---|---|
| Outlet Name | `Retailer.shopName` |
| Address | `Retailer.addressLine` |
| Route Name / No. | `Route.name` (via `Retailer.routeId`), create-or-reuse by `(distributorId, name)` |
| GST No. (optional) | `Retailer.gstin` |
| Contact / WhatsApp No. | stub `User.phone` (role `RETAILER`, status ACTIVE) tied to the `Retailer` |

Creating a customer is one transaction: upsert `Route` → create `User` → create `Retailer` → create zeroed `RetailerAccount`.

## Backend — new `distributor` module (`apps/api/src/distributor/`)

All routes `@Roles('DISTRIBUTOR')`, scoped to `user.distributorId`. New Zod contracts in `packages/contracts`.

### Profile

```
GET  /me/profile
  → { businessName, contactName, address, phone, region }
     (businessName = Distributor.name, contactName = User.name,
      address = Distributor.address, phone = User.phone)

PATCH /me/profile
  body: { businessName?, contactName?, address? }   // all optional, trimmed
  → updated profile (same shape as GET)
```
- `businessName` / `address` update the `Distributor`; `contactName` updates the `User`.

### Customers

```
GET  /customers
  → CustomerDto[]  (the distributor's retailers, newest first, ≤200)
     CustomerDto = { id, outletName, address, route, gstin, phone, createdAt }

POST /customers
  body: {
    outletName: string (1..120),
    address:    string (1..240),
    route:      string (1..60),
    gstin?:     string (GSTIN format, optional),
    phone:      10-digit Indian mobile (6-9 start)   // stored as +91XXXXXXXXXX
  }
  → CustomerDto
```
- `phone` is normalized to E.164 (`+91…`). A duplicate phone returns **409** with message `A customer with this number already exists`.
- `route` is upserted under the distributor (find by name, else create with next `sequence`).

### Contracts (`packages/contracts/src/distributor.ts`)
- `updateProfileSchema`, `createCustomerSchema` (with the validations above), and the `CustomerDto`/`ProfileDto` types. Re-exported from `index.ts`. (GST/phone regexes mirror the app's existing rules.)

## App (MilkApp)

### Profile (editable)
- New `features/profile/{api,hooks,schemas}.ts`: `useProfile()` (GET) + `useUpdateProfile()` (PATCH).
- Profile screen shows business name, contact name, address, phone (read-only). An **Edit** action opens a form (RHF + Zod) for business name / contact name / address; Save calls PATCH and shows success. Replaces today's JWT-only read-only view. (Settings/Logout rows stay.)

### Customers tab (replaces Alerts)
- Tab bar: swap the `notifications` tab for a new `customers` tab (icon e.g. `Users`/`Store`). Remove the Alerts tab entry. (Notifications code stays in the repo, just unlinked from the bar.)
- `features/customers/{api,hooks,schemas,components}.ts`: `useCustomers()` (GET list) + `useCreateCustomer()` (POST).
- **List screen** (`(app)/(tabs)/customers.tsx`): cards showing outlet name, route, phone (+ empty state, loading/error). A **"＋ Add customer"** button.
- **Add screen** (`(app)/customers/new.tsx`): RHF + Zod form with the 5 fields — Outlet Name, Address, Route, GST No. (optional), Contact/WhatsApp No. (`+91` fixed prefix, 10-digit). Submit → POST → back to list (invalidate). Cross-platform dialogs (`@/lib/dialog`) for errors. Native stack header with back arrow.

## Error handling
- Backend: Zod validation → 400 with field message; duplicate phone → 409; missing scope → 403. App surfaces `normalizeError(err).message` inline.
- Route create-or-reuse is idempotent per `(distributorId, name)`.

## Testing
- API: a pure unit test for the route create-or-reuse helper (mirrors the repo's no-DB test style); manual curl for the endpoints (profile GET/PATCH, customer create incl. duplicate-phone 409).
- App: typecheck + lint (no test runner); manual/screenshot verification of the Profile edit and Customers list + add flow against the live backend.

## Out of scope (future)
- Editing/deleting customers; customer detail screen.
- Placing orders **on behalf of a selected customer** (today a distributor's order attaches to the first retailer under them; multi-customer ordering is a separate follow-up).
- Routes-as-managed-list, geocoding (lat/lng), retailer login.
