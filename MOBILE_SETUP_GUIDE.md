# Celo Snake Mobile - Configuration Setup Guide

This guide will help you configure all the required services and credentials for the mobile app.

## Table of Contents

1. [Firebase Setup](#firebase-setup)
2. [WalletConnect Configuration](#walletconnect-configuration)
3. [Contract Addresses](#contract-addresses)
4. [Environment Variables](#environment-variables)
5. [Installation Steps](#installation-steps)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Firebase Setup

Firebase is required for push notifications, analytics, and crashlytics.

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `celo-snake-mobile` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Choose or create an Analytics account
6. Click "Create project"

### Step 2: Add iOS App

1. In your Firebase project, click the iOS icon
2. Enter iOS bundle ID: `com.celosnake.mobile` (or match your app's bundle ID)
3. Enter App nickname: `Celo Snake iOS`
4. Enter App Store ID: (leave empty for now)
5. Click "Register app"
6. Download `GoogleService-Info.plist`
7. Place it at: `mobile/ios/GoogleService-Info.plist`

### Step 3: Add Android App

1. In your Firebase project, click the Android icon
2. Enter Android package name: `com.celosnake.mobile`
3. Enter App nickname: `Celo Snake Android`
4. Enter SHA-1 certificate (get from debug keystore - see below)
5. Click "Register app"
6. Download `google-services.json`
7. Place it at: `mobile/android/app/google-services.json`

#### Get SHA-1 for Debug Keystore

```bash
cd mobile/android
keytool -list -v -keystore app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy the SHA-1 fingerprint and paste it in Firebase Android app configuration.

### Step 4: Enable Firebase Services

In Firebase Console, enable these services:

1. **Cloud Messaging** (for push notifications):
   - Go to Project Settings > Cloud Messaging
   - Enable Cloud Messaging API

2. **Analytics**:
   - Already enabled if you chose it during project creation
   - Go to Analytics > Dashboard to verify

3. **Crashlytics**:
   - Go to Crashlytics in left menu
   - Click "Enable Crashlytics"

### Step 5: Get Firebase Configuration

You can also configure Firebase using environment variables instead of the config files.

In Firebase Console:
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Select your iOS/Android app
4. Copy the configuration values:

```
API Key: AIzaSy...
Auth Domain: your-project.firebaseapp.com
Project ID: your-project-id
Storage Bucket: your-project.appspot.com
Messaging Sender ID: 123456789
App ID: 1:123456789:android:abcdef
```

---

## WalletConnect Configuration

WalletConnect is used for connecting wallets other than MiniPay.

### Step 1: Create WalletConnect Cloud Account

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Click "Create New Project"
4. Enter project name: `Celo Snake Mobile`
5. Select "Mobile" as platform

### Step 2: Get Project ID

1. After creating the project, you'll see your Project ID
2. Copy the Project ID (format: `abc123def456...`)
3. You'll use this in your `.env` file

**Example Project ID**: `c4f79cc821944d9680842e34466bfbd`

---

## Contract Addresses

Your smart contracts have already been deployed! Here are the addresses:

### Celo Sepolia Testnet (Chain ID: 44787)

```
SnakeAchievementNFT: 0x6559B28fd6bEc8ff450D4f654841AADa273ac876
AchievementTracker: 0x85e3569ef3DDEE12Bb68772d2Cf73612e82e39Ea
SnakesGameV2: 0x6315d606bBfcC28d9f037A7bdB1dCb21387cEA73
MultiplayerSnakesGameV2: 0x7f59A01F0BfD7970846Db71814c9A17F488CCfcF
TournamentManager: 0x7BE60377E17aD50b289F306996fa31494364c56a
SocialFeatures: 0x445383147Ad5Aba947C1b2aeE6dD607E26dfFCEB
```

These addresses are already configured in the codebase, but you can verify them in:
- `/deployments/V2System_celoSepolia.json`
- `/src/contracts/addresses.ts`

---

## Environment Variables

### Step 1: Create .env File

In the `mobile` directory, create a `.env` file:

```bash
cd mobile
cp .env.example .env
```

### Step 2: Fill in Configuration

Open `mobile/.env` and fill in the values:

```env
# API Configuration
# If you have a backend API, put its URL here
# For now, you can use localhost or leave as placeholder
API_BASE_URL=https://your-api-url.com
SOCKET_URL=wss://your-socket-url.com

# Smart Contract Addresses (Already deployed!)
GAME_CONTRACT_ADDRESS=0x6315d606bBfcC28d9f037A7bdB1dCb21387cEA73
TOURNAMENT_CONTRACT_ADDRESS=0x7BE60377E17aD50b289F306996fa31494364c56a
NFT_CONTRACT_ADDRESS=0x6559B28fd6bEc8ff450D4f654841AADa273ac876
ACHIEVEMENT_CONTRACT_ADDRESS=0x85e3569ef3DDEE12Bb68772d2Cf73612e82e39Ea
SOCIAL_CONTRACT_ADDRESS=0x445383147Ad5Aba947C1b2aeE6dD607E26dfFCEB

# WalletConnect Project ID (Get from WalletConnect Cloud)
WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Firebase Configuration (Optional if using config files)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:android:abcdef

# Feature Flags
ENABLE_BIOMETRIC_AUTH=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_OFFLINE_MODE=true
ENABLE_HAPTIC_FEEDBACK=true
ENABLE_ANALYTICS=true

# Environment
NODE_ENV=development
```

### What to Replace:

1. **WALLET_CONNECT_PROJECT_ID**: Replace with your WalletConnect Project ID from Step 2 above
2. **FIREBASE_* values**: Replace with your Firebase configuration from Firebase Console
3. **API_BASE_URL & SOCKET_URL**: 
   - If you have a backend, use its URL
   - For local development: `http://localhost:3000` and `ws://localhost:3000`
   - For now, you can leave as placeholder

---

## Installation Steps

Now that you have all configurations, let's install and run the app!

### Step 1: Install Dependencies

```bash
cd mobile

# Install npm packages
npm install --legacy-peer-deps
```

**Note**: We use `--legacy-peer-deps` because of React Native 0.82.1 peer dependency requirements.

### Step 2: Install iOS Dependencies (Mac only)

```bash
cd ios
pod install
cd ..
```

### Step 3: Verify Configuration Files

Make sure these files exist:
- `mobile/.env` (you just created it)
- `mobile/ios/GoogleService-Info.plist` (from Firebase)
- `mobile/android/app/google-services.json` (from Firebase)

---

## Testing

### Run on iOS Simulator (Mac only)

```bash
cd mobile

# Start Metro bundler
npm start

# In another terminal, run iOS
npm run ios
```

**Troubleshooting iOS**:
- If build fails, try: `cd ios && pod install && cd ..`
- If simulator doesn't start: Open Xcode → Preferences → Locations → Command Line Tools (select version)

### Run on Android Emulator

```bash
cd mobile

# Make sure Android emulator is running
# (Start from Android Studio or use: emulator -avd <device_name>)

# Start Metro bundler
npm start

# In another terminal, run Android
npm run android
```

**Troubleshooting Android**:
- Make sure `ANDROID_HOME` is set: `export ANDROID_HOME=$HOME/Library/Android/sdk`
- If build fails: `cd android && ./gradlew clean && cd ..`
- If "SDK location not found": Create `mobile/android/local.properties` with:
  ```
  sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
  ```

### Run on Physical Device

#### iOS Device:
1. Open `mobile/ios/CeloSnakeMobile.xcworkspace` in Xcode
2. Select your device from the device dropdown
3. Click Run (▶️)
4. First time: Trust developer certificate on device (Settings → General → Device Management)

#### Android Device:
1. Enable Developer Options on device (tap Build Number 7 times in About Phone)
2. Enable USB Debugging in Developer Options
3. Connect device via USB
4. Run: `npm run android`
5. Accept USB debugging prompt on device

---

## Testing Checklist

After installation, test these features:

### Basic Functionality
- [ ] App launches without crashes
- [ ] Can navigate between screens
- [ ] UI elements render correctly

### Wallet Integration
- [ ] Can connect MiniPay wallet (if on Android)
- [ ] Can see wallet address
- [ ] Can see wallet balance

### Game Features
- [ ] Can start single player game
- [ ] Snake moves and responds to controls
- [ ] Score updates correctly
- [ ] Game over works

### Push Notifications (Optional for now)
- [ ] App requests notification permission
- [ ] Can receive test notification

### Biometric Auth (if device supports)
- [ ] Biometric prompt appears
- [ ] Can authenticate with Face ID/Touch ID

---

## Troubleshooting

### Issue: "ERESOLVE unable to resolve dependency tree"

**Solution**: Use `npm install --legacy-peer-deps`

### Issue: "@notifee/react-native version not found"

**Solution**: Already fixed in package.json (version ^7.8.2)

### Issue: "Firebase not initialized" or "FirebaseApp not found"

**Solutions**:
1. Verify `google-services.json` and `GoogleService-Info.plist` are in correct locations
2. For iOS: Run `cd ios && pod install && cd ..`
3. For Android: Clean build: `cd android && ./gradlew clean && cd ..`
4. Rebuild the app

### Issue: "Metro bundler cannot resolve module"

**Solution**:
```bash
# Clear Metro cache
npm start -- --reset-cache

# Or
watchman watch-del-all
rm -rf node_modules
npm install --legacy-peer-deps
```

### Issue: TypeScript errors

**Solution**:
```bash
# Make sure all dependencies are installed
npm install --legacy-peer-deps

# Check TypeScript version
npm list typescript
```

### Issue: "Execution failed for task ':app:processDebugGoogleServices'"

**Solution**: Make sure `google-services.json` is at `mobile/android/app/google-services.json`

### Issue: iOS build fails with "No matching provisioning profile found"

**Solution**:
1. Open Xcode
2. Select project → Signing & Capabilities
3. Check "Automatically manage signing"
4. Select your Apple ID team

### Issue: "Unable to boot simulator"

**Solution**:
```bash
# Reset iOS simulator
xcrun simctl erase all

# Or open Xcode → Window → Devices and Simulators → Reset
```

---

## Next Steps

After successful installation:

1. **Test Wallet Connection**:
   - If on Android, test MiniPay integration
   - Try connecting to testnet (Celo Sepolia)

2. **Test Game Features**:
   - Play a single player game
   - Check if score is recorded
   - Try different game modes

3. **Test Smart Contract Integration**:
   - Get test CELO from faucet: https://faucet.celo.org/alfajores
   - Try claiming achievements
   - Test tournament features

4. **Backend API** (Optional):
   - Set up your backend server
   - Update API_BASE_URL and SOCKET_URL in .env
   - Test multiplayer features

---

## Support & Resources

- **Celo Documentation**: https://docs.celo.org/
- **React Native Documentation**: https://reactnative.dev/
- **Firebase Documentation**: https://firebase.google.com/docs
- **WalletConnect Documentation**: https://docs.walletconnect.com/

---

## Summary Checklist

Before running the app, make sure you have:

- [x] ✅ Created Firebase project
- [x] ✅ Downloaded `GoogleService-Info.plist` (iOS)
- [x] ✅ Downloaded `google-services.json` (Android)
- [x] ✅ Placed Firebase config files in correct locations
- [x] ✅ Created WalletConnect project and got Project ID
- [x] ✅ Created `mobile/.env` file
- [x] ✅ Filled in all required values in `.env`
- [x] ✅ Verified contract addresses in `.env`
- [x] ✅ Ran `npm install --legacy-peer-deps`
- [x] ✅ (iOS only) Ran `pod install`
- [ ] 🔄 Run app on simulator/device
- [ ] 🔄 Test basic functionality
- [ ] 🔄 Test wallet connection
- [ ] 🔄 Test game features

---

## Quick Reference

### Most Important Values Needed:

1. **WalletConnect Project ID** → Get from https://cloud.walletconnect.com/
2. **Firebase iOS Config** → Get `GoogleService-Info.plist` from Firebase Console
3. **Firebase Android Config** → Get `google-services.json` from Firebase Console

### Already Configured:

- ✅ Contract addresses (deployed to Celo Sepolia)
- ✅ Package dependencies (@notifee/react-native fixed)
- ✅ TypeScript configuration
- ✅ React Native setup

---

**Good luck with your mobile app! 🚀**

If you run into any issues, check the Troubleshooting section or reach out for help.
