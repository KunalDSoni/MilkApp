# Order confirmation + history visibility (web fix)

Date: 2026-06-25
Status: Approved

## Problem

After placing an order, the retailer should get a clear "order placed
successfully" confirmation and see the order in Order History. On the **web**
build this does not happen.

Root cause: `src/app/(app)/order/edit.tsx` reports success and failure via React
Native's `Alert.alert(...)`, and the navigation to Order History is performed
only inside the success alert's "OK" handler. `Alert` is a **no-op on
react-native-web**, so on web:

- no success dialog appears,
- the `router.replace(...)` inside the OK handler never runs (no navigation to
  history),
- order-placement errors are likewise invisible.

The order itself IS created and added to history under the hood (mock
`orders.unshift` + `orderKeys.list` invalidation); only the user-facing
confirmation and navigation are broken on web.

## Goal

Cross-platform (web + native) feedback that does not depend on `Alert`:

1. On success, navigate to Order History and show a dismissible success banner
   "Order placed successfully".
2. On failure, show the error inline on the cart screen.

## Non-goals

- Reflecting orders in the separate MilkAdmin app. That requires both apps to
  share a real backend; this app currently runs in mock mode
  (`EXPO_PUBLIC_USE_MOCKS=true`), so placed orders live only in the on-device
  mock DB. Tracked separately (see "Follow-up" below).

## Design

### 1. Reusable banner component

Add `src/components/Banner.tsx` — a small dismissible inline banner with a
`tone` ("success" | "error") and optional auto-dismiss. Pure presentational,
cross-platform (no `Alert`).

### 2. Place-order success path — `src/app/(app)/order/edit.tsx`

- On `onSuccess`: `clear()` the cart, then
  `router.replace({ pathname: "/(app)/(tabs)/orders", params: { placed: "1" } })`.
  Do NOT gate navigation behind `Alert`.
- On `onError`: store the message in local state and render an error `Banner`
  above the Place Order button. Remove the `Alert.alert` calls.

### 3. Order History success banner — `src/app/(app)/(tabs)/orders.tsx`

- Read the `placed` route param via `useLocalSearchParams`.
- When `placed === "1"`, show a success `Banner` ("Order placed successfully")
  at the top of the list that auto-dismisses after ~4s.
- The newly placed order already appears at the top of the list (mock unshift +
  query invalidation), so no list change is needed.

## Error handling

- Placement failure: inline error banner on the cart screen (replaces the
  no-op web `Alert`). Existing offline guard is unchanged.

## Testing / verification

- Typecheck (`tsc --noEmit`).
- Headless-Chrome screenshot of the web flow: seed a mock session, place an
  order, confirm redirect to Order History shows the success banner and the new
  order at the top.

## Follow-up (out of scope)

To make orders "reflect in admin" (separate MilkAdmin repo), point both apps at
a shared real backend and set `EXPO_PUBLIC_USE_MOCKS=false` with a working
`/orders` API. UI is already wired for the real endpoints in
`src/features/orders/api.ts`.
