# Production Deployment Runbook

Retailer app · Expo + EAS · Android-first.

## 1. Environments

| Profile | Channel | API | Mocks | Distribution |
|---|---|---|---|---|
| development | development | staging | on | internal dev build |
| preview | preview | staging | off | internal APK |
| production | production | prod | off | Play Store AAB |

Config lives in `eas.json` (build profiles) and `.env` / EAS secrets
(`EXPO_PUBLIC_*`). **Never** commit `.env`; set production values as EAS
secrets:

```bash
eas secret:create --name EXPO_PUBLIC_API_URL --value https://api.prod...
eas secret:create --name EXPO_PUBLIC_SENTRY_DSN --value https://...
```

## 2. First-time setup

```bash
npm i -g eas-cli
eas login
eas build:configure          # links project, sets projectId
```

## 3. FCM setup (push)

Transport is FCM via expo-notifications.

1. Firebase console → create project → add **Android app** with package
   `com.dairyplatform.retailer`.
2. Download `google-services.json` → provide to EAS as a secret file or commit
   to a secure location (it is gitignored here):
   ```bash
   eas credentials   # Android → upload google-services.json / FCM key
   ```
3. Backend sends data messages including a `route` field, e.g.
   `{ "type": "CUTOFF_REMINDER", "route": "/(app)/order/edit" }`.
4. Verify token registration hits `POST /devices` after login (live mode).

> To switch to bare `@react-native-firebase` later, only
> `core/push/usePushNotifications.ts` and `registerDevice.ts` change.

## 4. Build & release

```bash
# Internal test build (APK)
eas build --profile preview --platform android

# Production app bundle
eas build --profile production --platform android

# Submit to Play Console
eas submit --profile production --platform android
```

OTA (JS-only) updates between store releases:

```bash
eas update --branch production --message "fix: ..."
```

## 5. Android release process

1. Build production AAB (above).
2. Play Console → Internal testing → upload → smoke test on a low-end device.
3. Promote Internal → Closed → Production.
4. Fill **Data safety** form: app collects **phone number** (auth) and a
   **device push token**; no location, no payments.
5. Add privacy policy URL.

## 6. Production checklist

**Build / config**
- [ ] `eas.json` profiles correct; `appVersionSource: remote`, autoIncrement on.
- [ ] Production `EXPO_PUBLIC_API_URL` set as EAS secret; `USE_MOCKS=false`.
- [ ] App icon + splash + adaptive icon assets added under `assets/`.
- [ ] `google-services.json` uploaded via EAS credentials.

**Auth / security**
- [ ] Tokens in SecureStore; single-flight refresh verified; logout clears all.
- [ ] No secrets in bundle; only `EXPO_PUBLIC_*` non-secret config.
- [ ] HTTPS-only API base URL.

**Reliability**
- [ ] Loading / Error / Empty states on every data screen.
- [ ] Confirm never auto-retries; WINDOW_CLOSED handled with refetch.
- [ ] Offline: cache persists, confirm disabled offline, mutations resume.
- [ ] Pull-to-refresh on lists.

**Notifications**
- [ ] Permission flow (Android 13+ POST_NOTIFICATIONS).
- [ ] Token register on login / unregister on logout.
- [ ] Foreground refresh + tap deep-link verified for all 4 types.

**Quality / ops**
- [ ] `npm run typecheck` and `npm run lint` clean in CI.
- [ ] Sentry DSN set; release tagging + source maps uploaded.
- [ ] Hermes enabled (default); cold start < 2s on low-end Android.
- [ ] Touch targets ≥ 48dp; text scales; contrast checked.
- [ ] Crash-free smoke test on a real low-end device.
- [ ] Privacy policy + Play data-safety completed.
```
