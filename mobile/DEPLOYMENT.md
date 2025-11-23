# Celo Snake Mobile - Deployment Guide

Complete guide for deploying the Celo Snake mobile app to iOS App Store and Google Play Store.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [iOS Deployment](#ios-deployment)
3. [Android Deployment](#android-deployment)
4. [Post-Deployment](#post-deployment)
5. [App Store Optimization](#app-store-optimization)

## Pre-Deployment Checklist

### Required Accounts
- [ ] Apple Developer Account ($99/year)
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Firebase Project configured
- [ ] Domain for privacy policy and terms

### App Assets
- [ ] App icons (1024x1024 for both platforms)
- [ ] Launch/Splash screens
- [ ] Screenshots for all device sizes
- [ ] Feature graphic (Android)
- [ ] App preview videos (optional but recommended)

### Legal Documents
- [ ] Privacy Policy URL
- [ ] Terms of Service URL
- [ ] Support/Contact URL
- [ ] Age rating information

### Testing
- [ ] Complete QA testing on iOS
- [ ] Complete QA testing on Android
- [ ] Test all wallet integrations
- [ ] Test push notifications
- [ ] Test biometric authentication
- [ ] Performance testing
- [ ] Security audit

## iOS Deployment

### Step 1: Configure App in Xcode

1. Open the project in Xcode:
   ```bash
   cd mobile/ios
   open CeloSnakeMobile.xcworkspace
   ```

2. Select the project in Navigator
3. Under "General" tab:
   - Set Display Name
   - Set Bundle Identifier (com.celosnake.mobile)
   - Set Version (e.g., 1.0.0)
   - Set Build number (e.g., 1)
   - Set Deployment Target (iOS 13.0+)

4. Under "Signing & Capabilities":
   - Select your Development Team
   - Enable "Automatically manage signing"
   - Add capabilities:
     - Push Notifications
     - Associated Domains (for deep linking)
     - App Groups (if needed)

### Step 2: Configure Info.plist

Add required privacy descriptions in `mobile/ios/CeloSnakeMobile/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to scan QR codes for quick wallet connections</string>

<key>NSFaceIDUsageDescription</key>
<string>We use Face ID to securely authenticate transactions and protect your wallet</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to let you share your achievements and high scores</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>We need permission to save screenshots of your achievements</string>

<key>NSUserTrackingUsageDescription</key>
<string>This allows us to provide personalized gaming experiences and show relevant content</string>
```

### Step 3: Build for Release

1. **Clean build folder**: Product → Clean Build Folder (Cmd+Shift+K)

2. **Archive the app**: Product → Archive

3. **Wait for archiving** to complete

### Step 4: Upload to App Store Connect

1. Open Organizer (Window → Organizer)
2. Select your archive
3. Click "Distribute App"
4. Choose "App Store Connect"
5. Select "Upload"
6. Complete the upload process

### Step 5: Create App Store Listing

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - Platform: iOS
   - Name: Celo Snake
   - Primary Language: English
   - Bundle ID: com.celosnake.mobile
   - SKU: celosnake-mobile-001

4. **App Information**:
   - Category: Games > Action
   - Subcategory: Arcade
   - Age Rating: 4+ (or appropriate rating)

5. **Pricing and Availability**:
   - Price: Free
   - Availability: All countries

6. **Version Information**:
   - Screenshots (required for all device sizes):
     - iPhone 6.7" (1290 x 2796)
     - iPhone 6.5" (1242 x 2688)
     - iPhone 5.5" (1242 x 2208)
     - iPad Pro 12.9" (2048 x 2732)
   - App Preview (optional video)
   - Description
   - Keywords
   - Support URL
   - Marketing URL (optional)
   - Privacy Policy URL

7. **Build**: Select your uploaded build

8. **App Review Information**:
   - Contact information
   - Demo account (if needed)
   - Notes for reviewer

9. **Submit for Review**

### Step 6: TestFlight (Optional)

Before full release, use TestFlight for beta testing:

1. In App Store Connect, go to TestFlight tab
2. Add internal testers (up to 100)
3. Share public link for external testers (up to 10,000)
4. Collect feedback and fix issues

## Android Deployment

### Step 1: Generate Signing Key

```bash
cd mobile/android/app

# Generate release keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore celo-snake-release.keystore \
  -alias celo-snake \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You'll be prompted for:
# - Keystore password (remember this!)
# - Key password (remember this!)
# - Your name, organization, etc.
```

**Important**: Store your keystore file and passwords securely!
- Never commit keystore to git
- Back up to secure location
- Store passwords in password manager

### Step 2: Configure Gradle

Create/edit `mobile/android/gradle.properties`:

```properties
CELO_SNAKE_UPLOAD_STORE_FILE=celo-snake-release.keystore
CELO_SNAKE_UPLOAD_KEY_ALIAS=celo-snake
CELO_SNAKE_UPLOAD_STORE_PASSWORD=your_keystore_password
CELO_SNAKE_UPLOAD_KEY_PASSWORD=your_key_password

# Optional: Enable newer features
android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xmx4096m
```

Edit `mobile/android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('CELO_SNAKE_UPLOAD_STORE_FILE')) {
                storeFile file(CELO_SNAKE_UPLOAD_STORE_FILE)
                storePassword CELO_SNAKE_UPLOAD_STORE_PASSWORD
                keyAlias CELO_SNAKE_UPLOAD_KEY_ALIAS
                keyPassword CELO_SNAKE_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 3: Update Version

Edit `mobile/android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.celosnake.mobile"
    minSdkVersion 21
    targetSdkVersion 34
    versionCode 1          // Increment for each release
    versionName "1.0.0"    // User-facing version
}
```

### Step 4: Build Release Bundle

```bash
cd mobile/android

# Build Android App Bundle (AAB) - Required for Play Store
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab

# Or build APK (for testing or alternative distribution)
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Step 5: Create Google Play Console Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in:
   - App name: Celo Snake
   - Default language: English (United States)
   - App or game: Game
   - Free or paid: Free
   - Declarations (read and accept)

4. **Dashboard Setup**:
   Complete all required sections:

   **Store Presence → Main Store Listing**:
   - App name: Celo Snake
   - Short description (80 chars)
   - Full description (4000 chars)
   - App icon: 512x512 PNG
   - Feature graphic: 1024x500 PNG
   - Screenshots:
     - Phone: At least 2 (1080x1920 to 3840x2160)
     - 7" Tablet: At least 2 (1200x1920 to 3840x2160)
     - 10" Tablet: At least 2 (1200x1920 to 3840x2160)

   **Store Presence → Store Settings**:
   - App category: Games > Action
   - Tags: Blockchain, Crypto, Gaming, etc.
   - Contact details
   - Privacy policy URL

   **Policy → App Content**:
   - Privacy policy URL
   - Ads declaration
   - Content rating questionnaire
   - Target audience
   - News app declaration
   - COVID-19 contact tracing/status apps
   - Data safety form

5. **Create Production Release**:
   - Go to "Production" in left menu
   - Click "Create new release"
   - Upload your AAB file
   - Fill in release name and notes
   - Review and roll out

### Step 6: Internal Testing (Recommended)

Before production:

1. Go to "Testing → Internal testing"
2. Create release
3. Upload AAB
4. Add test users
5. Share testing link
6. Collect feedback and fix issues

### Step 7: Submit for Review

1. Review all sections (must all have green checkmarks)
2. Submit app for review
3. Wait for approval (typically 1-3 days)

## Post-Deployment

### Monitor Performance

**iOS**:
- App Store Connect → Analytics
- TestFlight feedback
- Crash reports in Xcode Organizer

**Android**:
- Google Play Console → Statistics
- Pre-launch reports
- Android vitals
- Crash reports and ANRs

### Update Strategy

**Version Numbering**:
- Major.Minor.Patch (e.g., 1.0.0)
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

**Release Schedule**:
- Emergency fixes: As needed
- Patch updates: Weekly
- Minor updates: Monthly
- Major updates: Quarterly

### Rollout Strategy

**iOS**:
- Phased release (automatic over 7 days)
- Monitor for issues
- Pause if critical bugs found

**Android**:
- Staged rollout:
  - Day 1: 5% of users
  - Day 3: 10%
  - Day 5: 50%
  - Day 7: 100%
- Monitor crash rates and ratings
- Halt rollout if issues detected

## App Store Optimization (ASO)

### Keywords

**iOS** (100 characters):
```
snake,game,crypto,celo,blockchain,web3,nft,multiplayer,tournament,minipay
```

**Android** (750 characters):
Use in description naturally:
- Blockchain gaming
- Crypto rewards
- Multiplayer snake
- Tournament mode
- NFT achievements
- Celo network
- MiniPay integration
- Play to earn

### App Description Template

```
🐍 CELO SNAKE - PLAY, COMPETE, EARN! 🏆

Experience the classic snake game reimagined for the blockchain era!

⭐ KEY FEATURES:
• Classic snake gameplay with crypto rewards
• Multiplayer battles against real players
• Epic tournaments with big prizes
• Unlock NFT achievements
• Seamless MiniPay wallet integration
• Biometric security for your assets

🎮 GAME MODES:
• Single Player - Practice and earn rewards
• Multiplayer - Challenge friends and rivals
• Tournaments - Compete for top prizes

💰 BLOCKCHAIN POWERED:
• Built on Celo network
• Fast, low-cost transactions
• True ownership of achievements
• Instant crypto rewards

🔒 SECURITY:
• Face ID/Touch ID authentication
• Encrypted wallet storage
• Non-custodial - you own your assets

Download now and start earning while playing!

Join our community:
Discord: [link]
Twitter: [link]
Website: [link]
```

### Screenshots Best Practices

1. **Show key features**:
   - Gameplay
   - Wallet integration
   - Tournament brackets
   - Achievement collection
   - Leaderboards

2. **Add text overlays** highlighting:
   - "Play to Earn"
   - "Multiplayer Battles"
   - "NFT Achievements"
   - "Secure Wallet"

3. **Use consistent branding**:
   - App colors
   - Logo placement
   - Professional design

### Localization

Consider translating to:
- Spanish (es)
- Portuguese (pt-BR)
- French (fr)
- German (de)
- Japanese (ja)
- Korean (ko)
- Chinese Simplified (zh-CN)

## Support

- **Technical Issues**: support@celosnake.com
- **Business Inquiries**: business@celosnake.com
- **Community**: Discord/Telegram

## Additional Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Design Guidelines](https://developer.android.com/design)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://support.google.com/googleplay/android-developer/answer/9858738)
