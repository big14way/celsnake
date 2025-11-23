# Celo Snake Mobile - Quick Start Guide

Get the mobile app running in 5 minutes!

## Prerequisites

Before you begin, ensure you have:
- ✅ Node.js 20+ installed
- ✅ npm or yarn
- ✅ For iOS: macOS with Xcode 14+
- ✅ For Android: Android Studio with SDK

## Quick Setup

### 1. Install Dependencies

```bash
cd mobile
npm install --legacy-peer-deps
```

**Note**: We use `--legacy-peer-deps` to handle React Native peer dependency resolution.

### 2. Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your configuration
# At minimum, you need:
# - API_BASE_URL
# - Contract addresses (if using blockchain features)
```

### 3. iOS Setup (Mac only)

```bash
cd ios

# Install Ruby dependencies
bundle install

# Install CocoaPods dependencies
bundle exec pod install

cd ..
```

### 4. Android Setup

No additional setup needed! Android dependencies are managed by Gradle.

## Running the App

### iOS

```bash
# Start Metro bundler in one terminal
npm start

# In another terminal, run iOS
npm run ios

# Or run on a specific device
npm run ios -- --device "Your iPhone Name"
```

### Android

```bash
# Start Metro bundler in one terminal
npm start

# In another terminal, run Android
npm run android

# Or run on a specific device
adb devices  # List devices
npm run android -- --deviceId=DEVICE_ID
```

## Common Issues & Fixes

### iOS: CocoaPods Issues

```bash
cd ios
rm -rf Pods Podfile.lock
bundle exec pod install --repo-update
cd ..
```

### Android: Gradle Build Failed

```bash
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install --legacy-peer-deps
```

### Metro Bundler Cache Issues

```bash
# Clear cache and restart
npm start -- --reset-cache
```

### "Module not found" Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Testing Without Blockchain

The app can run without blockchain features for UI/UX testing:

1. **Comment out wallet connections** in screens
2. **Use mock data** for game stats
3. **Disable** biometric auth in settings

## Next Steps

1. **Configure Firebase** (for notifications and analytics)
   - See [README.md](README.md#firebase-setup)

2. **Add App Icons**
   - Replace placeholder icons in `ios/` and `android/`

3. **Test Features**
   - Navigate between screens
   - Test haptic feedback
   - Try biometric auth (if available)

4. **Deploy to Devices**
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md) for app store submission

## Development Tips

### Hot Reload

- **iOS Simulator**: Cmd+R to reload
- **Android Emulator**: R+R (press R twice) to reload
- **Both**: Shake device/simulator for Dev Menu

### Debug Mode

```bash
# Enable debug mode
npm start

# Then in dev menu:
# - Toggle Inspector
# - Show Perf Monitor
# - Enable Hot Reloading
```

### VS Code Setup

Install these extensions:
- React Native Tools
- React-Native/React/Redux snippets
- ESLint
- Prettier

## Project Structure Overview

```
mobile/
├── src/
│   ├── screens/        # All app screens
│   ├── navigation/     # Navigation setup
│   ├── services/       # Wallet, storage, etc.
│   ├── config/         # App configuration
│   └── types/          # TypeScript types
├── ios/                # iOS native code
├── android/            # Android native code
└── App.tsx             # Main entry point
```

## Available Scripts

```bash
npm start          # Start Metro bundler
npm run ios        # Run on iOS
npm run android    # Run on Android
npm run lint       # Run ESLint
npm test           # Run tests
```

## Getting Help

- **Documentation**: [README.md](README.md)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **React Native Docs**: https://reactnative.dev
- **Issues**: Check GitHub issues or create new one

## What's Working Out of the Box

✅ App launches on iOS/Android
✅ Navigation between screens
✅ Dark theme UI
✅ Haptic feedback (on device)
✅ Storage system
✅ Analytics setup (needs Firebase config)

## What Needs Configuration

🔧 Firebase (for push notifications)
🔧 Contract addresses (for blockchain)
🔧 WalletConnect project ID
🔧 API endpoints
🔧 App icons and splash screens

---

**Happy coding! 🚀**
