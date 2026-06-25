# UI Modernization — premium design system

Date: 2026-06-25
Status: Approved

## Objective

Transform the UI/UX into a premium SaaS/fintech-grade mobile experience
(Stripe/Linear/CRED/Revolut feel) while preserving 100% of existing
functionality. Presentation layer only.

## Hard guardrails (DO NOT CHANGE)

APIs, services, business logic, validation, navigation routes/structure, screen
workflows, user journeys, state management, data models, calculations, forms'
validation. Behavior must be identical. Verified via typecheck/lint + the
place-order e2e screenshot flow.

## Palette (semantic tokens)

primary #0F172A · secondary #1E293B · accent #2563EB · success #10B981 ·
warning #F59E0B · error #EF4444 · bg #F8FAFC · card #FFFFFF · border #E2E8F0 ·
text #0F172A · textSecondary #64748B.

Existing `brand`/`ink`/`surface` token names are remapped to the new palette so
the re-skin cascades automatically; new semantic names added alongside.

## Plan

1. **Foundation** — rewrite `tailwind.config.js` theme (colors, radius, spacing
   confirmation); add `src/lib/theme.ts` with hex constants for icon colors;
   add Inter (`@expo-google-fonts/inter` + `expo-font`) loaded in
   `src/app/_layout.tsx` with splash gating.
2. **Typography** — expand `Txt` to Heading XL/L/M + Body L/M/S with Inter
   weights, line-height, letter-spacing; tabular figures for money/qty.
3. **Primitives** — restyle `Card` (soft shadow, 16px radius, variants),
   `Button` (filled/outline/text/danger + Reanimated press-scale), `Input`
   (floating label + focus/error). Add reusable `Badge` (same status map).
4. **States** — premium `LoadingState`, `EmptyState`, `ErrorState`, `Banner`,
   `OfflineBanner`.
5. **Animations** — Reanimated entrance (FadeInDown, staggered), button press,
   banner slide. <250ms.
6. **Screens** — restyle all: auth (login/otp), home dashboard, catalog +
   ProductCard + cart bar, cart/edit, orders list, order detail + summary,
   notifications + NotificationCard, standing index/edit, profile, settings,
   tab bar, not-found. No route/logic changes.
7. **Verify** — tsc + eslint clean; headless-Chrome screenshots of key screens;
   re-run place-order e2e.

## New dependencies

`@expo-google-fonts/inter`, `expo-font` (Inter typeface only). No other
non-styling additions.

## Out of scope

Dark mode (structure for it via tokens, do not implement). Admin integration.
Any behavioral/logic change.
