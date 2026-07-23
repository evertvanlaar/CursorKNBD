# A3 — Release notes (TWA shell 3.1.103) + Windows build instructie

**Doel:** Google Play target API — `targetSdkVersion` **36** (Android 16). Deadline Play: 31 augustus 2026.

**Android build (TWA):** `versionCode` **9** · `versionName` **3.1.103** (aligned met `asset-version.txt`)

---

## Windows werkplek — build & upload

1. Pull branch `PLAYSTORE-START` (of sync deze commit).
2. Controleer `kalanera-twa/keystore.properties` (niet in git) — zelfde upload-keystore als eerdere Play-releases.
3. Controleer `kalanera-twa/local.properties` → `sdk.dir` wijst naar je Windows Android SDK.
4. In `kalanera-twa/`:

```bat
gradlew.bat clean bundleRelease assembleRelease
```

5. Kopieer/hernoem outputs:

| Bron | Doel |
|------|------|
| `app\build\outputs\bundle\release\app-release.aab` | `kalanera-guide-3.1.103-vc9-release.aab` |
| `app\build\outputs\apk\release\app-release.apk` | `kalanera-guide-3.1.103-vc9-release.apk` |

6. Upload de **`.aab`** naar Play Console → Internal of Closed testing (daarna production).
7. Optioneel: sideload de **`.apk`** op een toestel om de shell te smoke-testen.

---

## English (EN) — kort (Play release notes)

```
• Updated app to meet Google Play target API requirements (Android 16 / API 36)
• Compatibility and stability improvements for newer Android versions
• Updated app shell aligned with Kala Nera Guide 3.1.103
```

## Greek (EL) — kort

```
• Ενημέρωση εφαρμογής για τις απαιτήσεις Google Play (Android 16 / API 36)
• Βελτιώσεις συμβατότητας και σταθερότητας για νεότερα Android
• Ενημερωμένο shell ευθυγραμμισμένο με Kala Nera Guide 3.1.103
```
