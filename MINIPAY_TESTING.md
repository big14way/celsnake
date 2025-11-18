# MiniPay Integration Testing Guide

## Overview
This guide helps you test the MiniPay integration locally and on mobile devices.

## Features Implemented

### 1. **MiniPay Detection** ✅
- Automatically detects MiniPay environment
- Shows "MiniPay Mode" badge when running in MiniPay
- Hides WalletConnect button (MiniPay auto-connects)

### 2. **Deeplink Support** ✅
- URL parameters for pre-filling game settings
- Example: `?bet=0.1&difficulty=hard&nickname=Player1`
- Supported parameters:
  - `bet` - Pre-fill bet amount
  - `difficulty` - Pre-select difficulty (easy/medium/hard/expert/master)
  - `nickname` - Pre-fill nickname
  - `autoConnect` - Auto-connect wallet (true/false)

### 3. **cUSD Fee Payments** ✅
- Added cUSD token addresses for testnet and mainnet
- MiniPay users can pay transaction fees in stablecoins
- Reduces friction for users in emerging markets

### 4. **Mobile Optimizations** ✅
- Larger touch targets for MiniPay users (bigger buttons)
- Haptic feedback on dice rolls and cashouts
- Responsive padding and spacing
- Shortened address display for mobile screens
- Active button press animations

### 5. **Share Functionality** ✅
- Share wins on social media via Web Share API
- Fallback to clipboard copy if sharing unavailable
- Shows after winning games

### 6. **Persistent Storage** ✅
- Requests persistent storage for game data
- Prevents data loss when app is backgrounded

### 7. **PWA/Manifest** ✅
- Complete manifest.json for app discovery
- MiniPay-specific metadata
- Icons and theme colors configured

## Testing Locally

### 1. Simulate MiniPay Environment

Add this to your browser console to simulate MiniPay:

```javascript
// Enable MiniPay simulation
window.ethereum = window.ethereum || {};
window.ethereum.isMiniPay = true;

// Reload the page
location.reload();
```

Or add this temporarily to your code for development:
```javascript
// In src/utils/minipay.ts, modify isMiniPay():
export const isMiniPay = (): boolean => {
  return true; // Force MiniPay mode for testing
};
```

### 2. Test Deeplinks Locally

Start your dev server and test these URLs:

```bash
# Pre-filled bet
http://localhost:5173/?bet=0.5

# Pre-filled bet + difficulty
http://localhost:5173/?bet=0.5&difficulty=hard

# Full deeplink
http://localhost:5173/?bet=0.1&difficulty=expert&nickname=TestPlayer

# Auto-connect (for MiniPay)
http://localhost:5173/?autoConnect=true&bet=0.2
```

### 3. Test on Mobile Emulator

Chrome DevTools:
1. Open DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Select a mobile device (iPhone, Android)
4. Test touch interactions and responsive design

## Testing on Real Mobile Device

### Option 1: Local Network Testing

1. Start dev server:
```bash
npm run dev
```

2. Find your local IP:
```bash
# On macOS/Linux
ifconfig | grep "inet "

# On Windows
ipconfig
```

3. Update Vite config to allow network access (if needed):
```javascript
// vite.config.ts
export default {
  server: {
    host: '0.0.0.0',
    port: 5173
  }
}
```

4. Access from mobile:
```
http://YOUR_LOCAL_IP:5173
```

### Option 2: Deployed Testing

1. Deploy to Vercel/Netlify:
```bash
npm run build
vercel deploy
```

2. Test MiniPay deeplinks:
```
https://your-app.vercel.app/?bet=0.5&difficulty=hard
```

## Testing in Real MiniPay

### 1. Install MiniPay
- **Android**: [Google Play Store](https://play.google.com/store/apps/details?id=com.opera.minipay)
- **iOS**: [App Store](https://apps.apple.com/de/app/minipay-easy-global-wallet/id6504087257)
- **Opera Mini**: Built-in (enable in settings)

### 2. Access Your dApp
1. Open MiniPay app
2. Navigate to the Discover/Apps section
3. Enter your app URL: `https://celo-snake.vercel.app`

### 3. Test Features
- ✅ Auto-connect (no connect button)
- ✅ Place bet and play game
- ✅ Roll dice (feel haptic feedback)
- ✅ Cashout (feel haptic feedback)
- ✅ Share win on social media
- ✅ Close app and reopen (data persists)

## Testing Checklist

### MiniPay Detection
- [ ] Badge shows "MiniPay Mode" when running in MiniPay
- [ ] Connect button hidden in MiniPay
- [ ] Connect button visible in regular browsers
- [ ] Address shortened for mobile display

### Deeplinks
- [ ] `?bet=0.5` pre-fills bet amount
- [ ] `?difficulty=hard` pre-selects difficulty
- [ ] `?nickname=Test` pre-fills nickname
- [ ] Multiple parameters work together

### Mobile UX
- [ ] Buttons larger on mobile (MiniPay mode)
- [ ] Touch targets easy to hit
- [ ] Haptic feedback on roll (if supported)
- [ ] Haptic feedback on cashout (if supported)
- [ ] Animations smooth on mobile

### Share Feature
- [ ] Share button appears after winning
- [ ] Web Share API works on mobile
- [ ] Fallback to clipboard on desktop
- [ ] Copied text includes win amount and URL

### Persistence
- [ ] Game state survives page refresh
- [ ] Game history persists
- [ ] Nickname saved across sessions

### Network & Transactions
- [ ] Connects to Celo Sepolia testnet
- [ ] Bet transaction succeeds
- [ ] Cashout transaction succeeds
- [ ] Nickname change succeeds
- [ ] Network warning shows if wrong network

## Troubleshooting

### MiniPay Not Detected
- Check console: `window.ethereum.isMiniPay`
- Try forcing detection (see "Simulate MiniPay" above)
- Ensure latest MiniPay version

### Deeplinks Not Working
- Check URL parameters are properly encoded
- Test in regular browser first
- Check browser console for errors

### Haptic Feedback Not Working
- Only works on mobile devices
- Requires user interaction first
- Check device settings (vibration enabled)

### Share Not Working
- Web Share API requires HTTPS
- Fallback should copy to clipboard
- Check browser console for errors

## Environment Variables

Ensure these are set:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_CONTRACT_ADDRESS=0x9C7af8B9e41555ce384a67f563Fa0d20D1dD9DFc
VITE_NETWORK=testnet
```

## MiniPay-Specific Features to Test

1. **Fee Currency (cUSD)**
   - MiniPay users pay fees in cUSD instead of CELO
   - Check transaction receipt for `feeCurrency` field

2. **Phone Number Mapping** (Future)
   - SocialConnect integration
   - Display phone numbers instead of addresses

3. **App Discovery** (Production)
   - Submit app to MiniPay app discovery
   - Test featured app placement

## Resources

- [MiniPay Docs](https://docs.celo.org/build-on-celo/build-on-minipay/overview)
- [MiniPay Quickstart](https://docs.celo.org/build-on-celo/build-on-minipay/quickstart)
- [Celo Faucet](https://faucet.celo.org/celo-sepolia)
- [Celo Explorer](https://explorer.celo.org)

## Contact

For issues or questions:
- GitHub Issues: [Your Repo]
- Discord: [Celo Community](https://discord.com/invite/celo)
