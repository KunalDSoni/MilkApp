# MilkApp — Coding Instructions

## Current Epic: Epic 5 — MilkApp Polish

### Completed (Epic 5)
- Added `expo-image-picker` and `expo-file-system` packages
- Added `uploadProofImage()` to `src/features/payment/api.ts` (mock + live)
- Updated `src/app/(app)/payments/new.tsx` with image picker, upload preview, and remove button
- Added `POST /auth/reset-password` backend endpoint (verifies OTP, sets new password hash, revokes all tokens)
- Created Forgot Password screen at `src/app/(auth)/forgot-password.tsx`
- Added "Forgot password?" link on login screen (`src/app/(auth)/login.tsx`)
- Added `changePassword` / `useChangePassword` to profile API and hooks (`src/features/profile/api.ts`, `src/features/profile/hooks.ts`)
- Added change password section to profile edit screen (`src/app/(app)/profile/edit.tsx`)

### Pending (Epic 5)
- Push notification FCM token registration endpoint + MilkApp token hook
- Bulk operations (CSV export, batch status update) in Admin Web

### Setup
- Branch: `feat/enterprise-testing` (pushed to `origin`)
- Backend: NestJS on port 4000
- `EXPO_PUBLIC_USE_MOCKS=false`
- `EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1`

### Next Session
1. Start by reading this file
2. Work remaining items under "Pending (Epic 5)"
3. Push code + update this file when done
