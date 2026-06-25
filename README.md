# Dairy Retailer App

Retailer mobile app for the Dairy Distribution Ordering Platform.
Expo + React Native + TypeScript, NativeWind, TanStack Query, React Hook Form + Zod.

> Architecture & full plan: [`docs/RETAILER_APP_PLAN.md`](docs/RETAILER_APP_PLAN.md)

## Quick start

```bash
npm install
cp .env.example .env      # EXPO_PUBLIC_USE_MOCKS=true by default
npx expo start
```

Runs in **mock mode** out of the box — no backend required.
Login with any 10-digit number; the OTP is **`123456`**.

To point at the real backend, set in `.env`:

```
EXPO_PUBLIC_USE_MOCKS=false
EXPO_PUBLIC_API_URL=https://your-nestjs-api
```

## What's implemented (all phases)

- **Foundation:** Expo Router, NativeWind theme, TanStack Query with offline
  persistence, typed env, axios client with single-flight token refresh.
- **UI kit:** Button, Text, Card, Input, ScreenContainer, QuantityStepper,
  Loading / Error / Empty states, OfflineBanner.
- **Auth:** Phone → OTP login, SecureStore tokens, session resolution on boot,
  route guards, logout.
- **Products + Order (cart model):** catalog with quantity steppers → local cart
  → **Place Order** (`POST /orders` + submit). Cutoff banner from the order
  window. Prices are server-side (hidden in catalog; total shown after placing).
- **Standing orders:** list, create/edit (RHF + Zod), weekday mask + products,
  delete. Mock-only until the backend adds routes (Slice 2).
- **History + Notifications:** order history list + detail; in-app notification
  feed with unread badge, mark-read / mark-all-read, deep links (mock-only).
- **Push:** expo-notifications (FCM transport on Android) — permission, token
  registration, foreground refresh, tap deep-linking.
- **Offline:** persisted query cache, offline banner, confirm disabled offline.
- **Production:** EAS profiles + deployment runbook in `docs/PRODUCTION.md`.

Status: `tsc`, `eslint`, and `expo export` (Android bundle) all pass. Runtime
behavior on a device/emulator has not yet been smoke-tested.

## Pinned versions (do not bump without testing)

- **typescript `~5.8.3`** — TanStack Query v5 types use the built-in `NoInfer<>`
  (TS ≥ 5.4); the Expo-default 5.3.3 silently widens `useQuery` data to `any`.
- **nativewind `4.1.23` (exact)** — 4.2.x pulls `react-native-css-interop@0.2`,
  whose babel preset hard-requires `react-native-worklets/plugin` (Reanimated 4),
  which breaks the SDK 52 Reanimated 3.16 build.
- **tsconfig** sets `moduleResolution: "bundler"` for correct package-exports
  type resolution.

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run format      # prettier
```
