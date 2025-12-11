# Celo Snake - Play-to-Earn Social Gaming Platform

A mobile-first, blockchain-based snake dice game built on **Celo** with **MiniPay** support. Roll the dice, avoid the snakes, collect multipliers, earn CELO, and connect with friends!

## 🌐 Live on Celo Mainnet

**🎮 Play Now:** [https://celo-snake.vercel.app](https://celo-snake.vercel.app)

**📊 Verify Smart Contracts on Celoscan:**
- All 6 contracts deployed on **Celo Mainnet (Chain ID: 42220)**
- [View Deployer Wallet & All Contracts](https://celoscan.io/address/0xCBb2e2fCa3CB099bBDC44cc44E6d262BB5931600)
- [SnakesGameV2](https://celoscan.io/address/0xDd0a88d55df383A6A09ccE8AD1eD3EE2aF465B63) | [MultiplayerSnakesGameV2](https://celoscan.io/address/0x9B143C2C7A7f3F74FDe53D4c432f9B76024c5d99) | [TournamentManager](https://celoscan.io/address/0x5c0E4e1Cd82C8FE1A0Af2128d61618B4e9574c34)
- [SnakeAchievementNFT](https://celoscan.io/address/0xCeD1E5701E5915C3c658A1AE79D9294BAd497A99) | [AchievementTracker](https://celoscan.io/address/0x3967c36F5989273f413fcDF7Ed6Fe0f4C191617C) | [SocialFeatures](https://celoscan.io/address/0x6b2Af490bE227a05F4Df79E7cFA28e2B0972581a)

**📱 Mobile Apps:**
- iOS & Android apps with MiniPay integration (see [mobile/](mobile/) directory)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Problem We're Solving](#problem-were-solving)
- [Our Solution](#our-solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Smart Contracts](#smart-contracts)
- [Game Rules](#game-rules)
- [Testing](#testing)
- [Deployment](#deployment)
- [License](#license)

---

## 📝 Overview

Celo Snake is a comprehensive play-to-earn gaming platform built for the Celo ecosystem. Players place bets, roll dice to move across a 5x5 board, collect multipliers, and cash out their winnings - all on the Celo blockchain! The game features single-player, multiplayer, tournaments, NFT achievements, and social features for a complete gaming experience.

---

## 🎯 Problem We're Solving

The traditional gaming industry lacks transparency, fair monetization, and social connectivity for players. Centralized platforms control player earnings, impose high fees, and provide no real ownership of in-game assets.

**Key Issues:**
- **High Complexity:** Most blockchain games require extensive crypto knowledge
- **Poor Mobile Experience:** Limited mobile-first blockchain gaming options
- **Expensive Transactions:** High gas fees make micro-transactions unfeasible
- **Limited Accessibility:** Difficult onboarding for newcomers to Web3
- **Lack of Community:** Players can't easily connect and compete with friends

---

## 💡 Our Solution

Celo Snake addresses these challenges by leveraging Celo's mobile-first blockchain infrastructure:

- **Transparent Gameplay:** All game logic and payouts handled by smart contracts
- **True Ownership:** Players control their earnings and NFT achievements
- **Mobile-Optimized:** Seamless MiniPay integration for on-the-go gaming
- **Low-Cost Transactions:** Celo's efficient blockchain enables affordable gameplay
- **Easy Onboarding:** Simple wallet connection via WalletConnect & RainbowKit
- **Social Features:** Connect with friends, chat in real-time, and share achievements
- **Viral Growth:** Built-in referral system with automatic rewards

---

## 🕹️ Features

### Core Gameplay
- **Dice-Based Gameplay:** Roll two dice to move across the board
- **Play-to-Earn:** Win CELO by avoiding snakes and collecting multipliers
- **Multiple Difficulty Levels:** Easy, Medium, Hard, Expert, Master
- **Game State Persistence:** Resume your game anytime
- **Game History:** Track all your past games

### 🎮 Multiplayer Mode
- **Real-Time Multiplayer:** Compete with 2-4 players simultaneously
- **Custom Rooms:** Create private rooms with custom bet amounts
- **Prize Models:** Winner-takes-all, Proportional split, or Survival bonus
- **Anti-Cheat System:** Commit-reveal dice rolling pattern
- **Turn Timeout Protection:** Automatic elimination for inactive players

### 🏆 Tournament System
- **Scheduled Tournaments:** Daily, weekly, and monthly competitions
- **Multiple Formats:** Single elimination, double elimination, round robin, Swiss system
- **Entry Fee-Based:** Guaranteed prize pools with sponsor support
- **Live Brackets:** Real-time tournament bracket visualization
- **Leaderboards:** Track standings and player rankings
- **Prize Distribution:** Automated payouts to top 8 finishers
- **NFT Gating:** Exclusive tournaments for Gold+ NFT holders
- **Tournament History:** Complete stats and performance tracking

### 🎖️ NFT Achievement System
- **32 Unique Achievements:** Bronze, Silver, Gold, Platinum, and Special tiers
- **Auto-Minting:** Achievements automatically minted on milestone completion
- **Fee Discounts:** NFT holders get up to 50% discount on house fees
- **Tournament Access:** Gold+ tier unlocks exclusive tournaments
- **Limited Supply:** Rare achievements with capped supply
- **On-Chain Verification:** All achievements stored on Celo blockchain

### 🌐 Social Features (NEW!)
- **Friend System:** Send, accept, and manage friend requests on-chain
- **Real-Time Chat:** Global and friend-to-friend messaging via Socket.io
- **Activity Feed:** Share wins, achievements, and big plays
- **Referral System:** Generate unique codes, earn 5% on referred bets (3% for referees)
- **Game Invites:** Challenge friends to private matches
- **Social Profiles:** Customizable nicknames and online status
- **Block/Unblock:** Privacy controls for unwanted interactions
- **Share Wins:** One-click sharing to Twitter, Telegram, WhatsApp, Discord
- **Content Moderation:** Built-in profanity filter and spam protection

### 💰 Wallet Integration
- **MiniPay Support:** Seamless integration with Celo's mobile wallet
- **WalletConnect:** Connect with any Web3 wallet via RainbowKit
- **Multi-Wallet Support:** MetaMask, Trust Wallet, Coinbase Wallet, and more

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Socket.io Server** - WebSocket server for real-time features
- **Express** - HTTP server (optional)

### Blockchain
- **Celo** - Layer 2 blockchain
- **Solidity 0.8.20** - Smart contracts
- **Viem 2.x** - Ethereum library
- **Wagmi 2.x** - React hooks for Ethereum
- **RainbowKit 2.x** - Wallet connection UI
- **Hardhat** - Development environment

### Integration
- **WalletConnect** - Multi-wallet support
- **MiniPay** - Celo's mobile wallet

---

## 🚦 Getting Started

### Web App

#### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask, MiniPay, etc.)
- Celo testnet tokens (get from [Celo Faucet](https://faucet.celo.org/alfajores))

### Mobile App (NEW!)

For detailed mobile app setup instructions, see [MOBILE_SETUP_GUIDE.md](MOBILE_SETUP_GUIDE.md)

#### Quick Mobile Setup

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Firebase:**
   - Download `GoogleService-Info.plist` (iOS) from Firebase Console
   - Download `google-services.json` (Android) from Firebase Console
   - Place in respective directories (see guide)

4. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase and WalletConnect credentials
   ```

5. **Run the app:**
   ```bash
   # iOS (requires CocoaPods)
   cd ios && pod install && cd ..
   npm run ios
   
   # Android
   npm run android
   ```

See [READY_TO_TEST.md](READY_TO_TEST.md) for complete testing instructions.

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/big14way/celsnake.git
    cd celsnake
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set up environment variables:**
    ```bash
    cp .env.example .env
    ```
    Then edit `.env` with your values:
    ```env
    VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
    VITE_CONTRACT_ADDRESS=0x6315d606bBfcC28d9f037A7bdB1dCb21387cEA73
    VITE_MULTIPLAYER_CONTRACT_ADDRESS=0x7f59A01F0BfD7970846Db71814c9A17F488CCfcF
    VITE_TOURNAMENT_CONTRACT_ADDRESS=0x7BE60377E17aD50b289F306996fa31494364c56a
    VITE_ACHIEVEMENT_NFT_ADDRESS=0x6559B28fd6bEc8ff450D4f654841AADa273ac876
    VITE_ACHIEVEMENT_TRACKER_ADDRESS=0x85e3569ef3DDEE12Bb68772d2Cf73612e82e39Ea
    VITE_SOCIAL_CONTRACT_ADDRESS=0x445383147Ad5Aba947C1b2aeE6dD607E26dfFCEB
    VITE_SOCKET_URL=http://localhost:3001
    VITE_NETWORK=testnet
    ```

4. **Start the Socket.io server:**
    ```bash
    npm run dev:socket
    ```

5. **Start the frontend (in a new terminal):**
    ```bash
    npm run dev
    ```

6. **Open your browser:**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

---

## 📜 Smart Contracts

All contracts are deployed on **Celo Mainnet** (Chain ID: 42220)

### Deployed Contracts

| Contract | Address | Description |
|----------|---------|-------------|
| SnakesGameV2 | `0xDd0a88d55df383A6A09ccE8AD1eD3EE2aF465B63` | Single-player game logic |
| MultiplayerSnakesGameV2 | `0x9B143C2C7A7f3F74FDe53D4c432f9B76024c5d99` | Multiplayer game rooms |
| TournamentManager | `0x5c0E4e1Cd82C8FE1A0Af2128d61618B4e9574c34` | Tournament system |
| SnakeAchievementNFT | `0xCeD1E5701E5915C3c658A1AE79D9294BAd497A99` | Achievement NFTs |
| AchievementTracker | `0x3967c36F5989273f413fcDF7Ed6Fe0f4C191617C` | Achievement tracking |
| SocialFeatures | `0x6b2Af490bE227a05F4Df79E7cFA28e2B0972581a` | Social networking |

### Contract Features

#### SnakesGameV2
- Start games with custom bet amounts
- Roll dice with on-chain verification
- Cash out anytime
- Automatic payout on game over
- House fee: 2.5% (reduced for NFT holders)

#### MultiplayerSnakesGameV2
- Create/join rooms with 2-4 players
- Commit-reveal dice rolling (anti-cheat)
- Multiple prize distribution models
- Automatic turn timeout protection
- Winner/loser verification

#### TournamentManager
- Schedule tournaments with entry fees
- Multiple tournament formats
- Automated bracket management
- Prize pool distribution (top 8)
- Sponsor contributions
- NFT-gated tournaments

#### SocialFeatures
- On-chain friend system
- Referral code generation
- Automatic referral rewards (5% + 3%)
- Treasury management
- Profile management
- Block/unblock functionality

---

## 🎲 Game Rules

### Board Layout
- **5x5 Grid:** 25 positions total
- **Starting Position:** Bottom-left (Position 0)
- **Winning Position:** Top-right (Position 24)

### Gameplay
1. **Place Bet:** Choose difficulty and bet amount
2. **Roll Dice:** Two dice determine movement (2-12 spaces)
3. **Snakes:** Landing on a snake reduces your multiplier
4. **Multipliers:** Each successful move increases your multiplier
5. **Cash Out:** Cash out anytime or reach position 24 to win

### Difficulty Levels
- **Easy:** Fewest snakes, lower multipliers
- **Medium:** Balanced risk/reward
- **Hard:** More snakes, higher multipliers
- **Expert:** High risk, high reward
- **Master:** Maximum difficulty, maximum potential

### Multiplayer Rules
- **Turn-Based:** Players take turns rolling dice
- **Timeout:** 30 seconds per turn (configurable)
- **Elimination:** Landing on a snake eliminates you
- **Winner:** Last player standing or first to position 24

---

## 🧪 Testing

### Run Smart Contract Tests

```bash
npx hardhat test
```

### Test Coverage

- **Single Player:** 100% (15/15 tests passing)
- **Multiplayer:** 100% (12/12 tests passing)
- **Tournament:** 100% (10/10 tests passing)
- **NFT System:** 100% (8/8 tests passing)
- **Social Features:** 100% (15/15 tests passing)

### Quick Test Guide

See [QUICK_TEST.md](QUICK_TEST.md) for step-by-step testing instructions.

---

## 🚀 Deployment

### Deploy Smart Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to Celo Sepolia
npx hardhat run scripts/deploy.js --network celoSepolia

# Verify contracts
npx hardhat verify --network celoSepolia <CONTRACT_ADDRESS>
```

### Deploy Frontend (Vercel)

1. **Install Vercel CLI:**
    ```bash
    npm i -g vercel
    ```

2. **Deploy:**
    ```bash
    npm run build
    vercel --prod
    ```

3. **Add Environment Variables:**
   In your Vercel dashboard, add all variables from `.env`.

### Deploy Socket.io Server

The Socket.io server needs to be deployed separately for real-time features:

```bash
# Option 1: Deploy to Heroku
heroku create
git push heroku main

# Option 2: Deploy to Railway
railway up

# Option 3: Deploy to your own server
pm2 start dev-server.js --name "celo-snake-socket"
```

Update `VITE_SOCKET_URL` in your frontend environment variables to point to your deployed server.

---

## 🎯 Milestones Completed

### ✅ Milestone 1: Core Game (100%)
- Single-player gameplay
- Smart contract integration
- Wallet connection
- Basic UI/UX

### ✅ Milestone 2.1: Multiplayer Mode (100%)
- Real-time multiplayer rooms
- Commit-reveal dice system
- Anti-cheat mechanisms
- Turn-based gameplay

### ✅ Milestone 2.2: NFT Achievements (100%)
- 32 unique achievements
- Auto-minting system
- Fee discounts
- Limited supply NFTs

### ✅ Milestone 2.3: Tournament System (100%)
- Scheduled tournaments
- Multiple formats
- Live brackets
- Automated payouts

### ✅ Milestone 3: Social Features (100%)
- Friend system (on-chain)
- Real-time chat (Socket.io)
- Referral rewards (5% + 3%)
- Activity feed
- Share functionality
- Game invites
- Content moderation

### ✅ Milestone 4: Native Mobile App (100% - NEW!)
- **React Native iOS & Android app**
- **MiniPay mobile wallet integration**
- **Firebase services** (Push notifications, Analytics, Crashlytics)
- **Biometric authentication** (Face ID / Touch ID)
- **Haptic feedback** for enhanced gameplay
- **Offline game caching** (MMKV storage)
- **Mobile-optimized UI/UX** with native navigation
- **All game features** (Single-player, Multiplayer, Tournaments)
- **Complete social integration** (Friends, Chat, Referrals)
- **NFT achievements** on mobile
- **TypeScript-safe codebase** (0 errors)
- **Production-ready** for App Store & Google Play

---

## 📊 Project Statistics

- **Total Lines of Code:** ~25,000+
- **Smart Contracts:** 6 deployed
- **Contract Functions:** 100+
- **Frontend Components:** 50+ (Web + Mobile)
- **Mobile Screens:** 14
- **Test Coverage:** 100% (60/60 tests passing)
- **Platforms:** Web, iOS, Android
- **Documentation Pages:** 8+
- **Supported Wallets:** 10+
- **Mobile Features:** Push notifications, Biometrics, Haptics, Offline caching

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Celo Foundation** - For the amazing blockchain infrastructure
- **WalletConnect** - For seamless wallet integration
- **RainbowKit** - For beautiful wallet UI components
- **Hardhat** - For the development environment
- **Socket.io** - For real-time communication

---

## 📞 Support

- **GitHub Issues:** [Report bugs or request features](https://github.com/big14way/celsnake/issues)
- **Twitter:** [@celosnake](https://twitter.com/celosnake)
- **Email:** support@celosnake.com

---

## 🗺️ Roadmap

### Phase 1 (Completed)
- ✅ Core single-player game
- ✅ Smart contract integration
- ✅ MiniPay support

### Phase 2 (Completed)
- ✅ Multiplayer mode
- ✅ NFT achievement system
- ✅ Tournament platform

### Phase 3 (Completed)
- ✅ Social features
- ✅ Referral system
- ✅ Real-time chat

### Phase 4 (Completed - NEW!)
- ✅ Native mobile app (iOS/Android)
- ✅ MiniPay mobile integration
- ✅ Mobile-optimized UI/UX
- ✅ Push notifications
- ✅ Biometric authentication
- ✅ Offline game caching

### Phase 5 (Future)
- 🔄 Guild/Clan system
- 🔄 Enhanced analytics
- 🔄 Mainnet deployment
- 🔄 Cross-chain support

---

**Built with ❤️ on Celo**

*Making blockchain gaming accessible, fair, and social for everyone.*
