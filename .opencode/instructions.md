# Resume Context — MilkApp (Mobile)

## Current State
- **Branch**: `feat/enterprise-testing` (pushed to `origin`)
- **Last commit**: `aad8a7e` — `feat: add enterprise-grade testing framework for mobile app`
- **Working tree**: clean, nothing to commit

## What Was Completed

### Enterprise Testing Framework (current sprint)
- **Jest configured** with expo preset, 95% coverage thresholds
- **Test setup** (`jest.setup.ts`): mocks for AsyncStorage, SecureStore, expo-router, NetInfo, expo-notifications
- **40+ test files** across all layers — all written (need Jest installed to run)

#### Core Tests — `src/__tests__/core/`
| File | Tests | What it covers |
|------|-------|----------------|
| `api/client.test.ts` | 8 | Axios instance, Bearer token injection, 401 refresh with single-flight, session expiry callback, non-401 passthrough, network errors |
| `api/errors.test.ts` | 7 | Axios errors with/without response, 500 vs 400 codes, fieldErrors, non-Axios errors, string errors |
| `auth/jwt.test.ts` | 6 | decodeJwt valid/invalid/missing payload, userFromToken with/without claims |
| `auth/session.test.ts` | 8 | saveTokens, loadTokens (cache-first vs storage-first), clearTokens, sync accessor, web platform fallback |
| `auth/AuthProvider.test.tsx` | 4 | Loading boot state, authenticated from persisted session, unauthenticated, signIn/signOut flows, session expiry callback |
| `auth/useAuth.test.ts` | 2 | Returns context value, throws outside provider |
| `config/env.test.ts` | 3 | Valid config, invalid config throws, default values |
| `observability/logger.test.ts` | 5 | info (dev-only), warn, error + Sentry |
| `offline/useNetworkStatus.test.ts` | 3 | Online, offline, unknown state |

#### Feature Tests — `src/__tests__/features/`
| File | Tests | What it covers |
|------|-------|----------------|
| `auth/api.test.ts` | 5 | requestOtp endpoint, verifyOtp valid/invalid mock OTP, real API parsing, logout |
| `auth/hooks.test.tsx` | 3 | useRequestOtp mutation, error normalization |
| `auth/schemas.test.ts` | 7 | phone validation (valid/invalid/boundary), OTP validation, toE164 |
| `cart/store.test.ts` | 7 | Initial empty, setQty add/update/remove, clear, lines, itemCount |
| `customers/api.test.ts` | 4 | fetchCustomers, createCustomer phone transformation |
| `customers/schemas.test.ts` | 7 | Valid form, empty name, invalid phone, GSTIN validation, optional fields |
| `orders/api.test.ts` | 8 | fetchCurrentWindow, 404 → WINDOW_UNAVAILABLE, createOrder, submitOrder, fetchOrders/fetchOrderById, decimal parsing |
| `orders/hooks.test.tsx` | 5 | useCurrentWindow, retry disabled, usePlaceOrder create+submit flow, query invalidation |
| `orders/schemas.test.ts` | 4 | Order status enum, window status, order/line schema validation |
| `products/api.test.ts` | 3 | fetchProducts, active-only filter, mock mode |
| `products/schemas.test.ts` | 6 | productUnitLabel all UOM types (LITRE<1→ml, KG<1→g, ≥1→unit, piece) |
| `notifications/api.test.ts` | 3 | fetchNotifications, markRead, markAllRead |

#### Component Tests — `src/__tests__/components/`
| File | Tests | What it covers |
|------|-------|----------------|
| `ui/Button.test.tsx` | 4 | Renders, variants (primary/secondary/outline/ghost), sizes (sm/md/lg), loading, disabled, press handler |
| `ui/Input.test.tsx` | 3 | Renders with label, error message, value/onChange, disabled |
| `ErrorState.test.tsx` | 2 | Error message display, retry button |
| `EmptyState.test.tsx` | 2 | Empty message, action button |
| `LoadingState.test.tsx` | 2 | Loading indicator, custom message |
| `OfflineBanner.test.tsx` | 2 | Shows when offline, hides when online |
| `QuantityStepper.test.tsx` | 5 | Display, increment, decrement, min/max bounds |
| `orders/components/OrderStatusBadge.test.tsx` | 3 | All 9 status variants rendered, color mapping |
| `orders/components/OrderSummaryCard.test.tsx` | 2 | Order details display, press navigation |
| `orders/components/CutoffBanner.test.tsx` | 3 | Time remaining, urgent (<1hr), closed state |
| `products/components/ProductCard.test.tsx` | 3 | Product info display, quantity stepper integration |

#### Lib Tests — `src/__tests__/lib/`
| File | Tests | What it covers |
|------|-------|----------------|
| `format.test.ts` | 8 | Currency, date, number formatting, edge cases (zero, null, undefined, large numbers) |
| `cn.test.ts` | 3 | Class merge, conditional classes, deduplication |
| `useDebouncedCallback.test.ts` | 4 | Debounce timing, cancellation on unmount, latest args preserved |
| `constants.test.ts` | 2 | All constants defined, API endpoints |

## Architecture
- **Framework**: Expo SDK 52, React Native 0.76.5
- **Routing**: Expo Router v4 (file-based)
- **State**: Zustand (cart, beat) + TanStack Query v5 (server state)
- **API**: Axios with interceptor-based JWT refresh (single-flight)
- **Auth**: JWT-based, tokens in expo-secure-store, identity from JWT claims
- **Styling**: NativeWind v4 (Tailwind CSS)
- **Forms**: react-hook-form + zod validation
- **Offline**: NetInfo + TanStack persist to AsyncStorage
- **Structure**: Feature-based (`src/features/<name>/` with api/hooks/schemas/components)

## Testing Infrastructure

### Setup (needs Jest installed)
```bash
cd /path/to/MilkApp
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native jest-expo
npx jest --passWithNoTests
```

### Running Tests
```bash
npm test              # jest (once configured)
npx jest              # direct invocation
npx jest --watch      # watch mode
npx jest --coverage   # with coverage report
```

### Mocking Strategy
| Native Module | Mock Location |
|---------------|---------------|
| AsyncStorage | `jest.setup.ts` — auto-mock |
| SecureStore | `jest.setup.ts` — manual mock |
| expo-router | `jest.setup.ts` — useRouter, useLocalSearchParams, Stack/Tabs |
| expo-notifications | `jest.setup.ts` — manual mock |
| @react-native-community/netinfo | `jest.setup.ts` — manual mock |
| lucide-react-native | `jest.setup.ts` — stub icon component |

### Key Testing Patterns
- All native modules mocked at setup level
- Axios mocked per-test with `jest.spyOn` or `__mocks__/axios.ts`
- Zustand stores tested directly (no provider needed)
- Components rendered with `@testing-library/react-native`
- Follow AAA pattern throughout
- Every test deterministic, isolated, no flaky behavior

## What to Do Next

### Install Jest & Run Tests
Jest and testing libraries need to be installed:
```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native jest-expo @types/jest
```
Then run `npx jest` to execute all 100+ tests.

### Complete Coverage Gaps
- **Screen-level tests**: Use E2E (Detox) for app screens
- **E2E tests**: Detox for native flows (login, order placement, navigation)
- **Remaining features**: beat store, ledger api/hooks, dashboard api/hooks, sales-visits api/hooks, standing api/hooks, profile api/hooks
- **Remaining components**: BackButton, Banner, AnimatedItem, ScreenContainer, NotificationCard, StandingOrderCard
- **Visual regression**: storybook + chromatic
- **Accessibility**: jest-axe for RN components

### Feature Work (Epic 2 — Field App)
- Distributor dashboard: pending onboarding, self-orders, payment logging
- Sales Officer: retailer management, self-orders, payment collection
- Order deadlines / cutoff enforcement UI
- Standing orders management UI
- Password login UI (currently OTP-only)
- File upload UI for payment proofs

### CI/CD
- Add GitHub Actions workflow for test + typecheck + lint
- Configure EAS Build for Android/iOS testing

## Relevant Files & Paths
| Area | Path |
|------|------|
| Jest config | `jest.config.js` |
| Test setup | `jest.setup.ts` |
| Core tests | `src/__tests__/core/` |
| Feature tests | `src/__tests__/features/` |
| Component tests | `src/__tests__/components/` |
| Lib tests | `src/__tests__/lib/` |
| API client | `src/core/api/client.ts` |
| Auth provider | `src/core/auth/AuthProvider.tsx` |
| Cart store | `src/features/cart/store.ts` |
| Mock DB | `src/features/_mocks/db.ts` |
| Package.json | `package.json` |

## Key Decisions
- Identity derived from JWT claims (no `/auth/me` endpoint)
- Mock mode via `EXPO_PUBLIC_USE_MOCKS=true` — uses in-memory db
- Single-flight token refresh prevents concurrent refresh storms
- Unknown network state treated as online (prevents false offline flash)
- Mutations never auto-retry (prevents double-submit)
- GET queries retry 3x with backoff, skip 4xx client errors
- Cache persists to AsyncStorage for offline viewing
- Switch to `feat/enterprise-testing` branch before starting new work
