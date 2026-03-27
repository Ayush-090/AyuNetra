# How to Run Sanjeevni

## "No supported devices connected"

This project was set up without **macOS** or **web** platform folders. Your Mac has:
- **macOS (desktop)** and **Chrome (web)** available  
- No iOS simulator or Android device connected  

Add platform support, then run on the device you want.

---

## 1. Add macOS and web support (one-time)

In your project folder, run:

```bash
cd ~/Documents/FlutterDev/Sanjeevni
flutter create . --platforms=macos,web
```

This creates the `macos/` and `web/` folders and keeps your existing `lib/` code.

---

## 2. Run the app

**On macOS (desktop):**
```bash
flutter run -d macos
```

**In Chrome (web):**
```bash
flutter run -d chrome
```

**Without specifying a device** (uses the first available):
```bash
flutter run
```

---

## Optional: iOS Simulator

1. Open **Xcode**.
2. **Xcode → Settings → Platforms** → install an **iOS Simulator**.
3. Start a simulator: **Xcode → Open Developer Tool → Simulator**.
4. Add iOS to the project and run:
   ```bash
   flutter create . --platforms=ios
   flutter run -d ios
   ```

---

## Optional: Android

Connect an Android device (USB debugging on) or start an Android emulator, then:

```bash
flutter create . --platforms=android
flutter run -d android
```
..
