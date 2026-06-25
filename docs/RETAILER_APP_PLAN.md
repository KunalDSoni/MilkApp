# Retailer Mobile App — Production Implementation Plan

Dairy Distribution Ordering Platform · Retailer App · Expo + React Native + TypeScript

> Backend (NestJS + PostgreSQL + Prisma) is **already built and approved**. This plan builds the mobile client on top of the existing APIs. No backend or DB redesign.

---

## 0. Guiding Decisions (CTO-level)

| Concern | Decision | Rationale |
|---|---|---|
| App framework | Expo SDK (latest) Managed Workflow | Fastest builds, OTA updates, EAS Build, no native toolchain to babysit |
| Routing | **Expo Router** (file-based) | First-party, typed routes, deep linking for free |
| Server state | TanStack Query | Caching, retries, background refetch, offline persistence |
| Local/UI state | React state + Zustand (tiny) only where needed | No Redux. Avoid global state unless shared across tabs |
| Forms | React Hook Form + Zod | Minimal re-renders, schema validation shared with API contracts |
| Styling | NativeWind (Tailwind) + React Native Reusables | Utility-first, consistent, fast to build |
| Icons | lucide-react-native | Lightweight, consistent |
| Auth | Phone + OTP, JWT (access + refresh), tokens in SecureStore | Production-grade, no passwords |
| Push | Firebase Cloud Messaging via `@react-native-firebase` (dev build) | Required; not available in Expo Go |
| Offline | TanStack Query persisted cache + AsyncStorage queue | Lightweight, no SQLite needed for MVP |
| Error tracking | Sentry (free tier) | Cheap, production visibility |
| State of truth | **Server is always authoritative.** Client never computes order eligibility/cutoff — it reads from API | Avoids divergence from the approved state machine |

**Non-negotiable:** cutoff logic, order state transitions, and standing-order generation live in the backend. The app only *renders* state and *submits intent*.

---

## 1. Final Architecture

### Layered view

```
┌─────────────────────────────────────────────┐
│  Screens (Expo Router routes)               │  presentation
├─────────────────────────────────────────────┤
│  Feature modules (hooks + components)       │  product, order, standing, auth…
├─────────────────────────────────────────────┤
│  Data layer: TanStack Query hooks           │  useProducts, useTodayOrder…
│  + API client (axios) + Zod parsers         │
├─────────────────────────────────────────────┤
│  Core: auth/session, storage, fcm, config   │  infrastructure
└─────────────────────────────────────────────┘
```

Rules:
- A screen never calls `axios` directly — only feature hooks.
- Every API response is parsed by a Zod schema before it enters the cache.
- Shared UI primitives live in `components/ui`; feature-specific components live with their feature.

---

## 2. Folder Structure

```
src/
  app/                          # Expo Router (file-based routing)
    _layout.tsx                 # root: providers, auth gate, font load
    index.tsx                   # splash / redirect resolver
    (auth)/
      _layout.tsx               # stack, redirects to app if logged in
      login.tsx                 # phone entry
      otp.tsx                   # otp verification
    (app)/
      _layout.tsx               # tab navigator + auth guard
      (tabs)/
        _layout.tsx             # bottom tabs
        index.tsx               # Home Dashboard
        catalog.tsx             # Product Catalog
        orders.tsx              # Order History
        notifications.tsx       # Notifications
        profile.tsx             # Profile
      order/
        edit.tsx                # Create/Edit today's order (modal/stack)
      standing/
        index.tsx               # Standing orders list
        edit.tsx                # Create/edit a standing order
      settings.tsx
    +not-found.tsx

  features/
    auth/
      api.ts                    # requestOtp, verifyOtp, refresh, logout
      hooks.ts                  # useRequestOtp, useVerifyOtp
      schemas.ts                # Zod: phone, otp, tokens
    products/
      api.ts
      hooks.ts                  # useProducts
      schemas.ts
      components/ProductCard.tsx
    orders/
      api.ts                    # getTodayOrder, updateDraft, confirmOrder, history
      hooks.ts                  # useTodayOrder, useUpdateDraft, useConfirmOrder, useOrderHistory
      schemas.ts
      components/
        OrderLineRow.tsx
        OrderSummaryCard.tsx
        CutoffBanner.tsx
    standing/
      api.ts
      hooks.ts
      schemas.ts
      components/StandingOrderCard.tsx
    notifications/
      api.ts                    # list, markRead
      hooks.ts
      schemas.ts
      components/NotificationCard.tsx
    profile/
      api.ts
      hooks.ts

  components/
    ui/                         # React Native Reusables wrappers
      Button.tsx Text.tsx Card.tsx Input.tsx Sheet.tsx Badge.tsx
    QuantityStepper.tsx
    EmptyState.tsx
    ErrorState.tsx
    LoadingState.tsx
    ScreenContainer.tsx
    Header.tsx

  core/
    api/
      client.ts                 # axios instance, base URL, interceptors
      queryClient.ts            # TanStack Query config + persistence
      errors.ts                 # normalizeError, ApiError type
    auth/
      session.ts                # token get/set/clear (SecureStore)
      AuthProvider.tsx          # context: user, status, login, logout
      useAuth.ts
    fcm/
      firebase.ts               # init
      registerDevice.ts         # token registration to backend
      handlers.ts               # foreground/background/notification-open
    offline/
      netInfo.ts                # connectivity hook
      mutationQueue.ts          # queued offline mutations
    storage/
      mmkv.ts | asyncStorage.ts
    config/
      env.ts                    # typed env (EXPO_PUBLIC_*)

  lib/
    format.ts                   # currency, quantity, date
    constants.ts
    theme.ts                    # tailwind tokens, colors

  types/
    api.d.ts

assets/
  fonts/  icons/  images/
```

---

## 3. Navigation Flow

```
App launch
   │
   ▼
[Splash] (index.tsx) ── resolve session ──┐
   │                                       │
   ├─ no valid token ──► (auth) stack      │
   │     Login (phone) ──► OTP ──► verify ─┤
   │                                       ▼
   └─ valid token ──────────────────► (app) tab navigator
                                          │
              ┌───────────┬──────────┬────┴─────┬───────────────┐
            Home       Catalog    Orders   Notifications     Profile
              │           │          │                          │
   ┌──────────┴───┐   add to     history                     Settings
   Today's draft  draft → order/edit
   Standing CTA       │
   order/edit ◄───────┘
   standing/index ──► standing/edit
```

### Auth flow
- `(auth)` group: unauthenticated only. `_layout` redirects to `(app)` if a session exists.
- `(app)` group: `_layout` guards — redirects to `/login` if no session.
- Token refresh is transparent (axios interceptor). Hard logout only when refresh fails.

### Deep linking strategy
Scheme: `dairyretailer://` + universal link `https://app.<domain>.com`.

| Notification type | Deep link | Lands on |
|---|---|---|
| Order reminder | `/(app)/(tabs)` | Home (today's draft) |
| Cutoff reminder | `/(app)/order/edit` | Order edit screen |
| Order confirmed | `/(app)/(tabs)/orders` | Order history |
| Broadcast message | `/(app)/(tabs)/notifications` | Notifications |

Expo Router maps FCM `data.route` directly to the path. Guard: if unauthenticated, store intended route and replay after login.

---

## 4. Component Library

### UI primitives (`components/ui`, from React Native Reusables + NativeWind)
`Button` (sizes: lg default for one-hand), `Text` (scaled typography), `Card`, `Input`, `Sheet` (bottom sheet), `Badge`, `Skeleton`.

### Shared app components

| Component | Purpose | Key props |
|---|---|---|
| `ScreenContainer` | Safe-area + padding + scroll/refresh wrapper | `refreshing`, `onRefresh`, `scroll` |
| `Header` | Title + optional back/action | `title`, `right`, `onBack` |
| `ProductCard` | Product row in catalog/order | `product`, `quantity`, `onChange`, `editable` |
| `QuantityStepper` | −/+ with large 48px targets, long-press repeat, manual entry sheet | `value`, `min`, `max`, `step`, `onChange`, `disabled` |
| `OrderLineRow` | One product line in order edit | `line`, `onQtyChange`, `locked` |
| `OrderSummaryCard` | Totals: item count, qty, cutoff, status | `order`, `cutoffAt` |
| `CutoffBanner` | Countdown + window status (open/locked) | `cutoffAt`, `status` |
| `StandingOrderCard` | Standing order summary | `standingOrder`, `onEdit`, `onToggle` |
| `NotificationCard` | Title, body, time, read state | `notification`, `onPress` |
| `EmptyState` | Icon + message + optional CTA | `icon`, `title`, `subtitle`, `action` |
| `ErrorState` | Error + retry | `message`, `onRetry` |
| `LoadingState` | Skeleton/spinner | `variant` |

**State component pattern:** every data screen renders exactly one of `LoadingState` → `ErrorState` → `EmptyState` → content, driven by TanStack Query `status` + data length. Encapsulate as a `<QueryView>` helper to avoid repetition.

---

## 5. Screen Specifications

### 5.1 Splash (`app/index.tsx`)
- **Purpose:** resolve session, route to auth or app.
- **Logic:** read tokens from SecureStore → if present, validate via `GET /auth/me` (or trust + lazy refresh) → redirect.
- **API:** `GET /auth/me`.
- **Edge cases:** expired token (attempt refresh), no network (use cached session if access token unexpired, else show retry), cold start <1.5s target.

### 5.2 Login (`(auth)/login.tsx`)
- **Purpose:** capture phone, request OTP.
- **Components:** `Input` (phone, numeric keypad, country prefix fixed +91), `Button` (Send OTP).
- **API:** `POST /auth/otp/request { phone }`.
- **Validation (Zod):** phone = 10 digits, Indian mobile pattern `^[6-9]\d{9}$`.
- **Actions:** submit → navigate to `/otp` with phone param.
- **Edge cases:** rate limit (429 → show "try again in Ns"), unregistered number (backend decides — show backend message), network error (retry).

### 5.3 OTP Verification (`(auth)/otp.tsx`)
- **Purpose:** verify OTP, establish session.
- **Components:** 6-box OTP input (auto-advance, autofill via SMS retriever), resend timer (30s), `Button` (Verify).
- **API:** `POST /auth/otp/verify { phone, otp }` → `{ accessToken, refreshToken, user }`.
- **Validation:** OTP = 6 digits.
- **Actions:** verify → store tokens → register FCM token → redirect to Home.
- **Edge cases:** wrong OTP (show error, keep entry), expired OTP (prompt resend), max attempts lockout (backend 429), resend cooldown.

### 5.4 Home Dashboard (`(tabs)/index.tsx`)
- **Purpose:** the daily landing — today's order status + 2-tap path to confirm.
- **Components:** greeting/shop name, `CutoffBanner`, `OrderSummaryCard` (today's draft), primary CTA **"Review & Confirm Today's Order"**, quick links (Standing Orders, Catalog), unread notification badge.
- **API:** `GET /orders/today`, `GET /products` (prefetch), `GET /notifications/unread-count`.
- **Actions:** tap CTA → `/order/edit`; tap standing → `/standing`.
- **Edge cases:** no draft yet (show "No order for today" + Create button), window closed (show locked state, last confirmed order), no standing orders (nudge to create one).

### 5.5 Product Catalog (`(tabs)/catalog.tsx`)
- **Purpose:** browse all products, add quantities into today's draft.
- **Components:** search/filter (optional, minimal), list of `ProductCard` with inline `QuantityStepper`, sticky footer **"Add to Today's Order (N items)"**.
- **API:** `GET /products`, `PATCH /orders/today` (draft update).
- **Validation:** qty ≥ 0, ≤ product max (if defined), integer multiples of `step`.
- **Actions:** adjust qty → debounced draft update (optimistic); footer → go to order edit.
- **Edge cases:** product inactive/out of stock (disable stepper, badge), window closed (read-only), empty catalog (EmptyState).

### 5.6 Create/Edit Order (`(app)/order/edit.tsx`)
- **Purpose:** review and modify today's draft, then confirm. The money screen.
- **Components:** `CutoffBanner`, list of `OrderLineRow` (only products with qty>0, plus "Add items" → catalog), `OrderSummaryCard`, sticky **Confirm Order** button.
- **API:** `GET /orders/today`, `PATCH /orders/{id}` (line updates), `POST /orders/{id}/confirm`.
- **Validation:** at least 1 line with qty>0 to confirm; window must be open (server-enforced; client also checks).
- **Actions:** change qty (optimistic + debounced PATCH), remove line (qty→0), **Confirm** → POST confirm → success state → back to Home.
- **Edge cases:**
  - Cutoff passes while editing → confirm returns 409/422 → show "Window closed" + refetch.
  - Already confirmed → show confirmed state, allow re-edit only if window open and backend permits.
  - Concurrent edit (standing order regenerated) → server version mismatch → refetch + merge prompt.
  - Offline → queue PATCH, disable Confirm (confirm requires live window check).

### 5.7 Standing Orders (`(app)/standing/index.tsx` + `edit.tsx`)
- **Purpose:** manage recurring auto-generated orders.
- **List components:** `StandingOrderCard` per schedule (products, days, active toggle), FAB **Create Standing Order**.
- **Edit components:** product+quantity rows (`QuantityStepper`), day-of-week selector, active toggle, Save.
- **API:** `GET /standing-orders`, `POST /standing-orders`, `PATCH /standing-orders/{id}`, `DELETE /standing-orders/{id}`.
- **Validation (Zod):** ≥1 product with qty>0; ≥1 day selected; quantities valid.
- **Actions:** create/edit/save, toggle active, delete (confirm dialog).
- **Edge cases:** editing affects only future generated drafts (show note), delete with active toggle, empty list (EmptyState + CTA).

### 5.8 Order History (`(tabs)/orders.tsx`)
- **Purpose:** past orders, status, reorder reference.
- **Components:** paginated list grouped by date, status `Badge`, tap → detail (line items, totals). Optional "Reorder" → prefill today's draft.
- **API:** `GET /orders?status=&page=` (infinite query), `GET /orders/{id}`.
- **Actions:** open detail, reorder.
- **Edge cases:** empty history, failed/cancelled orders styling, pagination end.

### 5.9 Notifications (`(tabs)/notifications.tsx`)
- **Purpose:** in-app feed of reminders/confirmations/broadcasts.
- **Components:** list of `NotificationCard`, mark-all-read, unread highlight.
- **API:** `GET /notifications` (infinite), `POST /notifications/{id}/read`, `POST /notifications/read-all`.
- **Actions:** tap → deep link to relevant screen + mark read.
- **Edge cases:** empty, deep link target unavailable, mark-read failure (optimistic + rollback).

### 5.10 Profile (`(tabs)/profile.tsx`)
- **Purpose:** shop/retailer info, entry to settings & logout.
- **Components:** shop name, phone, distributor, address (read-only for MVP), links to Settings & Order History, Logout button.
- **API:** `GET /auth/me` (cached).
- **Actions:** logout (confirm).
- **Edge cases:** stale profile (pull-to-refresh).

### 5.11 Settings (`(app)/settings.tsx`)
- **Purpose:** notification prefs, language (future), app version, logout.
- **Components:** notification toggles (maps to FCM topic subscribe/unsubscribe + backend pref), app version, support contact, Logout.
- **API:** `PATCH /me/notification-prefs` (if backend supports), else local.
- **Actions:** toggle prefs, logout, clear cache.
- **Edge cases:** permission revoked at OS level (prompt to open settings).

---

## 6. API Mapping

> Adjust paths to match the actual NestJS controllers. Shapes below are the client contract; validate with Zod on arrival.

| Screen | Method + Endpoint | Request | Response |
|---|---|---|---|
| Login | `POST /auth/otp/request` | `{ phone }` | `{ requestId, expiresIn }` |
| OTP | `POST /auth/otp/verify` | `{ phone, otp }` | `{ accessToken, refreshToken, user }` |
| (interceptor) | `POST /auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| Splash/Profile | `GET /auth/me` | — | `{ id, name, phone, shop, distributorId }` |
| Catalog/Home | `GET /products` | — | `Product[]` |
| Home | `GET /orders/today` | — | `Order \| null` |
| Order edit | `PATCH /orders/{id}` | `{ lines:[{productId, quantity}] }` | `Order` |
| Order edit | `POST /orders/{id}/confirm` | — | `Order` |
| History | `GET /orders?page=&status=` | query | `{ items:Order[], nextPage }` |
| History detail | `GET /orders/{id}` | — | `Order` |
| Standing list | `GET /standing-orders` | — | `StandingOrder[]` |
| Standing create | `POST /standing-orders` | `{ lines, days, active }` | `StandingOrder` |
| Standing edit | `PATCH /standing-orders/{id}` | partial | `StandingOrder` |
| Standing delete | `DELETE /standing-orders/{id}` | — | `204` |
| Notifications | `GET /notifications?page=` | query | `{ items, nextPage }` |
| Notifications | `POST /notifications/{id}/read` | — | `204` |
| FCM register | `POST /devices` | `{ token, platform }` | `204` |

### Request/response models (Zod, illustrative)
```ts
const Product = z.object({
  id: z.string(), name: z.string(), unit: z.string(),
  price: z.number(), active: z.boolean(),
  maxQty: z.number().nullable(), step: z.number().default(1),
});
const OrderLine = z.object({ productId: z.string(), quantity: z.number().int().min(0), product: Product.optional() });
const Order = z.object({
  id: z.string(), date: z.string(),
  status: z.enum(['DRAFT','CONFIRMED','LOCKED','CANCELLED','DELIVERED']),
  windowStatus: z.enum(['OPEN','CLOSED']),
  cutoffAt: z.string(), lines: z.array(OrderLine), version: z.number().optional(),
});
```

### Error handling
- `core/api/errors.ts` normalizes axios errors → `{ code, message, status, fieldErrors? }`.
- Surface backend `message` to users for 4xx; generic copy for 5xx.
- Specific handling: `401` → refresh-or-logout; `409/422` on confirm → "window closed/conflict" refetch; `429` → cooldown UI.

### Retry strategy
- Queries: TanStack default exponential backoff, **3 retries** for GET; **no retry** for mutations except idempotent ones.
- `confirm` mutation: **never auto-retry** (could double-confirm) — explicit user retry only.
- Network-aware: pause retries when offline, resume on reconnect (`onlineManager` + NetInfo).

---

## 7. State Management

### Server state (TanStack Query)
- Query keys: `['products']`, `['order','today']`, `['orders', {page}]`, `['standing']`, `['notifications']`, `['me']`.
- `staleTime`: products 5m, today's order 30s, me 10m.
- Optimistic updates for qty changes and notification read; rollback on error.
- `invalidateQueries(['order','today'])` after confirm; `['orders']` after any order change.

### Local/UI state
- React local state for form/in-screen UI.
- Zustand only for: pending-deep-link route, offline banner, FCM permission status. Keep it tiny.
- React Hook Form owns form state for standing-order and order edits.

### Offline cache
- Persist Query cache with `@tanstack/query-async-storage-persister` (24h max age).
- Persisted, viewable offline: products, standing orders, last today's order, history first page.
- Pull-to-refresh everywhere as the manual sync escape hatch.

---

## 8. Offline Strategy (lightweight)

| Capability offline | How |
|---|---|
| View products | Persisted query cache |
| View standing orders | Persisted query cache |
| View last order/history | Persisted query cache |
| Draft order edits (qty) | Optimistic cache update + queued `PATCH` in `mutationQueue` |
| **Confirm order** | **Blocked offline** — requires live cutoff check. Show "Connect to confirm." |

Sync mechanism:
1. NetInfo detects reconnect → `onlineManager.setOnline(true)`.
2. TanStack `resumePausedMutations()` flushes queued draft PATCHes in order.
3. Invalidate affected queries → UI reconciles with server truth.
4. On conflict (window closed / version mismatch), drop optimistic change and toast the user.

Deliberately **no SQLite, no custom sync engine** for MVP. AsyncStorage + Query persistence covers it.

---

## 9. Notification Strategy (FCM)

### Setup
- `@react-native-firebase/app` + `/messaging` (requires EAS **development build**, not Expo Go).
- Android: `google-services.json` via EAS; POST_NOTIFICATIONS runtime permission (Android 13+).
- iOS optional for later; Android is the priority per low-end target.

### Flow
1. After login → request permission → get FCM token → `POST /devices`.
2. Token refresh listener re-registers.
3. On logout → delete device token (`DELETE /devices/{token}`).

### Message types (data messages with `type` + `route`)
| Type | Trigger (backend) | Foreground behavior | Tap action |
|---|---|---|---|
| `ORDER_REMINDER` | morning, before window | local heads-up + Home badge | open Home |
| `CUTOFF_REMINDER` | N min before cutoff | heads-up, high priority | open `/order/edit` |
| `ORDER_CONFIRMATION` | after confirm | toast | open order detail |
| `BROADCAST` | admin message | banner | open Notifications |

### Handling
- Foreground: `onMessage` → in-app toast/banner + refetch relevant query, do not duplicate as system notification (use Notifee or local toast).
- Background/quit: system tray; `getInitialNotification` / `onNotificationOpenedApp` → deep link via Expo Router (replay after auth if needed).
- Always also write to the in-app Notifications feed (backend persists), so FCM is best-effort delivery, not source of truth.

---

## 10. Authentication Flow & Security

```
Phone → request OTP → enter OTP → verify
   → { accessToken (short, ~15m), refreshToken (long, ~30d) }
   → store in SecureStore (encrypted keystore)
   → AuthProvider sets status=authenticated
   → register FCM device
```

- **Storage:** `expo-secure-store` for both tokens. Never AsyncStorage for tokens.
- **Access token:** attached by axios request interceptor.
- **Refresh:** response interceptor on `401` → single-flight refresh (queue concurrent requests) → retry original. Refresh failure → clear session → route to `/login`.
- **Session:** `AuthProvider` exposes `{ user, status, login, logout }`. Root layout gates routes on `status`.
- **Logout:** clear SecureStore, clear Query cache, unregister device token, reset to `(auth)`.
- **Hardening:** rate-limit handled by backend; client respects 429 cooldown; no secrets in bundle; only `EXPO_PUBLIC_*` for non-secret config; certificate pinning optional post-MVP.

---

## 11. Development Roadmap (AI-assisted, build order)

Each phase is independently testable and shippable to internal testers.

**Phase 0 — Foundation (Day 1)**
1. Expo + TS + Expo Router scaffold.
2. NativeWind + React Native Reusables + lucide + theme tokens.
3. `core/api/client.ts`, `queryClient.ts`, `env.ts`, base providers in root `_layout`.
4. UI primitives + state components (`Loading/Error/Empty/ScreenContainer`).
Dependency for everything below.

**Phase 1 — Auth (Day 2)**
5. SecureStore session + AuthProvider + route guards.
6. Login + OTP screens, `useRequestOtp`/`useVerifyOtp`, refresh interceptor.
Gate: can log in and stay logged in across restarts.

**Phase 2 — Products & Today's Order (Day 3–4)**
7. `useProducts` + Catalog + `ProductCard` + `QuantityStepper`.
8. `useTodayOrder` + Home dashboard + `CutoffBanner` + `OrderSummaryCard`.
9. Order edit screen: draft PATCH (optimistic) + Confirm.
Gate: **2-tap confirm path works end to end.** This is the core MVP.

**Phase 3 — Standing Orders (Day 5)**
10. Standing list + create/edit with RHF + Zod.
Gate: create/edit/delete standing orders.

**Phase 4 — History & Notifications feed (Day 6)**
11. Order history (infinite query) + detail + reorder.
12. In-app notifications feed + read state.

**Phase 5 — Push (Day 7)**
13. EAS dev build + FCM register + handlers + deep links.

**Phase 6 — Profile/Settings + Offline + Polish (Day 8)**
14. Profile, Settings, logout.
15. Query persistence + offline banner + mutation queue.
16. Sentry, empty/error states audit, low-end perf pass.

**Phase 7 — Release (Day 9–10)**
17. EAS production build, internal testing track, checklist, store assets.

> AI-assisted note: build feature-by-feature vertically (api → schema → hook → component → screen) so each unit is small enough to generate and test in isolation. Write the Zod schema first; it anchors both the hook and the form.

---

## 12. Production Readiness Checklist

**Build & release**
- [ ] EAS Build configured (`eas.json`: development, preview, production profiles).
- [ ] Android `applicationId`, versionCode auto-increment, app signing via EAS.
- [ ] `google-services.json` injected per environment via EAS secrets.
- [ ] OTA updates channel (`expo-updates`) mapped to production.
- [ ] Internal testing track → closed testing → production on Play Console.

**Environment**
- [ ] `EXPO_PUBLIC_API_URL` per profile (dev/staging/prod); no secrets in client.
- [ ] Backend CORS / mobile origin handled; API base URL HTTPS only.

**Auth & security**
- [ ] Tokens in SecureStore; refresh single-flight; logout clears everything.
- [ ] 401/refresh/expiry paths tested; no token leaks in logs.

**Reliability**
- [ ] Every data screen has Loading/Error/Empty states.
- [ ] Confirm mutation never auto-retries; window-closed handled.
- [ ] Offline: cache persists, mutation queue flushes, confirm blocked offline.
- [ ] Pull-to-refresh on all lists.

**Notifications**
- [ ] FCM permission flow (Android 13+), token registered/unregistered.
- [ ] Foreground/background/quit handling + deep link replay after auth.

**Quality & ops**
- [ ] Sentry wired with release tagging + source maps.
- [ ] TypeScript strict; ESLint/Prettier; no `any` in API layer.
- [ ] Cold start < 2s on low-end Android; bundle size checked; Hermes enabled.
- [ ] Accessibility: ≥48dp touch targets, scalable text, contrast.
- [ ] Crash-free smoke test on a real low-end device.
- [ ] Privacy policy + Play data-safety form (phone number collection).

---

## 13. Initial Dependencies

```
expo expo-router expo-secure-store expo-updates expo-notifications
react-native nativewind tailwindcss
@react-native-reusables/* lucide-react-native
@tanstack/react-query @tanstack/query-async-storage-persister
@react-native-async-storage/async-storage
axios zod react-hook-form @hookform/resolvers
zustand
@react-native-community/netinfo
@react-native-firebase/app @react-native-firebase/messaging
@sentry/react-native
```

---

## 14. Open Items to Confirm With Backend Team
1. Exact endpoint paths/payloads (this plan assumes REST shapes above).
2. Is today's draft auto-created by standing-order job, or created on first edit?
3. Order `version`/optimistic-concurrency field for conflict detection.
4. Notification preferences endpoint existence.
5. OTP provider rate-limit/cooldown values to mirror in UI.
6. Device registration endpoint contract for FCM tokens.
```
