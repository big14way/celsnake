# Celo Snake - Play-to-Earn Game

A mobile-first, blockchain-based snake dice game built on **Celo** with **MiniPay** support. Roll the dice, avoid the snakes, collect multipliers, and earn CELO!

**Live Demo:** [https://celo-snake.vercel.app](https://celo-snake.vercel.app)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Problem We're Solving](#problem-were-solving)
- [Our Solution](#our-solution)
- [Mission Summary](#mission-summary)
- [Why Celo?](#why-celo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Smart Contract](#smart-contract)
- [Game Rules](#game-rules)
- [MiniPay Integration](#minipay-integration)
- [Project Structure](#project-structure)
- [Demo Video](#demo-video)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Support](#support)
- [Roadmap](#roadmap)

---

## 📝 Overview

Celo Snake is a play-to-earn gaming dApp built for the Celo Hackathon. Players place bets, roll dice to move across a 5x5 board, collect multipliers, and cash out their winnings - all on the Celo blockchain! The game is designed for mobile, prioritizes fast onboarding, low transaction fees, and fair, transparent gameplay.

---

## 🎯 Problem We're Solving

The traditional gaming industry lacks transparency and fair monetization for players. Centralized platforms control player earnings, impose high fees, and provide no real ownership of in-game assets.

**Key Issues:**
- *High Complexity*: Most blockchain games require extensive crypto knowledge
- *Poor Mobile Experience*: Limited mobile-first blockchain gaming options
- *Expensive Transactions*: High gas fees make micro-transactions unfeasible
- *Limited Accessibility*: Difficult onboarding for newcomers to Web3

---

## 💡 Our Solution

Celo Snake addresses these challenges by leveraging Celo's mobile-first blockchain infrastructure:

- **Transparent Gameplay:** All game logic and payouts handled by smart contracts
- **True Ownership:** Players control their earnings through their wallets
- **Mobile-Optimized:** Seamless MiniPay integration for on-the-go gaming
- **Low-Cost Transactions:** Celo's efficient L2 enables affordable gameplay
- **Easy Onboarding:** Simple wallet connection via WalletConnect & RainbowKit
- **Instant Payouts:** Cash out anytime with immediate on-chain settlements

---

## 🚀 Mission Summary

Our mission is to make blockchain gaming accessible, fair, and fun for everyone. By building on Celo, we're creating a play-to-earn experience that's:

1. **Mobile-First:** Optimized for MiniPay users in emerging markets
2. **Provably Fair:** On-chain verification of all game outcomes
3. **Financially Inclusive:** Low fees enable micro-betting for all users
4. **User-Friendly:** No crypto expertise required to start playing
5. **Sustainable:** Built on Celo's carbon-negative blockchain

We believe gaming should reward players for their time and skill, and Celo's technology makes this vision achievable at scale.

---

## 🌱 Why Celo?

- **Mobile-First:** Optimized for mobile users with MiniPay integration
- **Fast & Cheap:** Low transaction fees and quick confirmations
- **Accessible:** Easy onboarding for users new to crypto
- **Sustainable:** Built on a carbon-negative blockchain

---

## 🕹️ Features

### Core Gameplay
- **Dice-Based Gameplay:** Roll two dice to move across the board
- **Play-to-Earn:** Win CELO by avoiding snakes and collecting multipliers
- **Multiple Difficulty Levels:** Easy, Medium, Hard, Expert, Master
- **Game State Persistence:** Resume your game anytime
- **Game History:** Track all your past games

### Multiplayer Mode
- **Real-Time Multiplayer:** Compete with 2-4 players simultaneously
- **Custom Rooms:** Create private rooms with custom bet amounts
- **Prize Models:** Winner-takes-all, Proportional split, or Survival bonus
- **Anti-Cheat System:** Commit-reveal dice rolling pattern
- **Turn Timeout Protection:** Automatic elimination for inactive players

### 🏆 Tournament System (NEW!)
- **Scheduled Tournaments:** Daily, weekly, and monthly competitions
- **Multiple Formats:** Single elimination, double elimination, round robin, Swiss system
- **Entry Fee-Based:** Guaranteed prize pools with sponsor support
- **Live Brackets:** Real-time tournament bracket visualization
- **Leaderboards:** Track standings and player rankings
- **Prize Distribution:** Automated payouts to top 8 finishers (40%, 25%, 15%, 10%, 5%, 3%, 1%, 1%)
- **NFT Gating:** Exclusive tournaments for Gold+ NFT holders
- **Tournament History:** Complete stats and performance tracking

### NFT Achievement System
- **32 Unique Achievements:** Bronze, Silver, Gold, Platinum, and Special tiers
- **Auto-Minting:** Achievements automatically minted on milestone completion
- **Fee Discounts:** NFT holders get up to 50% discount on house fees
- **Tournament Access:** Gold+ tier unlocks exclusive tournaments
- **Limited Supply:** Rare achievements with capped supply

### Wallet Integration
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

### Blockchain
- **Celo** - Layer 2 blockchain (formerly L1)
- **Solidity** - Smart contracts
- **Viem 2.x** - Ethereum library
- **Wagmi 2.x** - React hooks for Ethereum
- **RainbowKit 2.x** - Wallet connection UI

### Integration
- **WalletConnect** - Multi-wallet support
- **MiniPay** - Celo's mobile wallet

---

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask, MiniPay, etc.)
- Celo testnet tokens (get from [Celo Faucet](https://faucet.celo.org/alfajores))

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
    Then edit `.env` with your values (see [Environment Variables](#environment-variables))

4. **Start the development server:**
    ```bash
    npm run dev
    ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```
The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following:

```env
# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Smart Contract Address (deployed on Celo)
VITE_CONTRACT_ADDRESS=0x...

# Network Environment
# Use 'testnet' for Alfajores testnet, 'mainnet' for Celo mainnet
VITE_NETWORK=testnet
```

### Getting a WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID
5. Paste it into your `.env` file

---

## 🚚 Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
    ```bash
    npm i -g vercel
    ```
2. **Deploy:**
    ```bash
    vercel
    ```
3. **Add Environment Variables:**  
   In your Vercel dashboard, add the environment variables from `.env`.

### Deploy to Netlify

1. **Install Netlify CLI:**
    ```bash
    npm i -g netlify-cli
    ```
2. **Build the project:**
    ```bash
    npm run build
    ```
3. **Deploy:**
    ```bash
    netlify deploy --prod
    ```
4. **Add Environment Variables:**  
   In your Netlify dashboard, add the environment variables from `.env`.

---

## ✨ Smart Contracts

The game uses multiple Solidity smart contracts deployed on Celo.

### Deployed Contract Addresses (Celo Sepolia Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| **SnakesGameV2** | `0x6315d606bBfcC28d9f037A7bdB1dCb21387cEA73` | Single-player game logic |
| **MultiplayerSnakesGameV2** | `0x7f59A01F0BfD7970846Db71814c9A17F488CCfcF` | Multiplayer rooms & matches |
| **SnakeAchievementNFT** | `0x6559B28fd6bEc8ff450D4f654841AADa273ac876` | ERC-1155 achievement NFTs |
| **AchievementTracker** | `0x85e3569ef3DDEE12Bb68772d2Cf73612e82e39Ea` | Progress tracking & auto-minting |
| **TournamentManager** | `0x7BE60377E17aD50b289F306996fa31494364c56a` | Tournament brackets & prizes |

**Block Explorer:**
View on [Celo Explorer](https://explorer.celo.org/alfajores)

### Contract Features

#### SnakesGameV2 (Single Player)
- Place bets in CELO
- Cash out winnings
- Reset active bets
- Change nickname
- View leaderboard

#### MultiplayerSnakesGameV2
- Create and join multiplayer rooms
- Multiple prize distribution models
- NFT holder benefits (fee discounts)
- Exclusive tournaments for Gold+ NFT holders

#### TournamentManager
- Create scheduled tournaments
- Register and unregister participants
- Automated bracket generation
- Prize pool management
- Sponsor support for guaranteed prizes
- Real-time standings and leaderboards

#### Achievement System
- 32 unique achievements across 5 tiers
- Automatic progress tracking
- NFT minting on milestone completion
- Fee discounts for NFT holders (1%-15% per achievement)
- Tournament eligibility (Gold+ required)

### Deploying the Contract

1. **Navigate to contracts directory:**
    ```bash
    cd contracts
    ```
2. **Install Hardhat (if not already):**
    ```bash
    npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
    ```
3. **Create deployment script:**  
   Create `scripts/deploy.js`:

    ```javascript
    async function main() {
      const SnakesGame = await ethers.getContractFactory("SnakesGame");
      const game = await SnakesGame.deploy();
      await game.deployed();
      console.log("SnakesGame deployed to:", game.address);
    }

    main().catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
    ```

4. **Configure Hardhat for Celo:**  
   Update `hardhat.config.js`:

    ```javascript
    require("@nomicfoundation/hardhat-toolbox");

    module.exports = {
      solidity: "0.8.20",
      networks: {
        alfajores: {
          url: "https://alfajores-forno.celo-testnet.org",
          accounts: [process.env.PRIVATE_KEY],
          chainId: 44787,
        },
        celo: {
          url: "https://forno.celo.org",
          accounts: [process.env.PRIVATE_KEY],
          chainId: 42220,
        },
      },
    };
    ```

5. **Deploy to Alfajores Testnet:**
    ```bash
    npx hardhat run scripts/deploy.js --network alfajores
    ```

6. **Update contract address:**  
   Copy the deployed address and update your `.env`:

    ```env
    VITE_CONTRACT_ADDRESS=0x...
    ```

---

## 🎲 Game Rules

### How to Play

1. **Connect your wallet**
2. **Enter a nickname**
3. **Choose difficulty level:**
    - Easy: Fewer snakes, more multipliers
    - Medium: Balanced gameplay
    - Hard: More snakes, higher multipliers
    - Expert: Very challenging
    - Master: Extreme difficulty
4. **Place your bet** (minimum 0.01 CELO)
5. **Roll the dice** (up to 5 times per game)
6. **Land on multipliers** to increase your winnings
7. **Avoid snakes** (landing on a snake = game over)
8. **Cash out** anytime before 5 rolls to secure your profit

### Multiplier System

- **Standard multipliers:** 1.2x, 1.5x, 1.8x
- **Power multiplier:** 2x (stacks exponentially!)

Your total multiplier is calculated as:
```
Total = (1 + sum of non-2x multipliers) + (2^count of 2x multipliers) - 1
```

Example:
- Collect 1.5x + 2x + 1.2x
- Total = (1 + 0.5 + 0.2) + (2^1) - 1 = 2.7x

---

## 🏆 Tournament System

### Overview

The Tournament System enables scheduled competitions where players compete for guaranteed prize pools. Tournaments support multiple formats and provide automated bracket generation, real-time standings, and instant prize distribution.

### Tournament Formats

| Format | Description | Best For |
|--------|-------------|----------|
| **Single Elimination** | Lose once and you're out | Fast-paced, high stakes |
| **Double Elimination** | Second chance via loser's bracket | Competitive fairness |
| **Round Robin** | Everyone plays everyone | Skill-based rankings |
| **Swiss System** | Pair players with similar records | Large tournaments |
| **Ladder** | Continuous ranking system | Long-term competition |

### How to Join a Tournament

1. **Navigate to Tournament Mode** - Click the 🏆 Tournament button in the navigation
2. **Browse Tournaments** - View upcoming and active tournaments
3. **Check Requirements:**
   - Entry fee amount
   - NFT requirements (if any)
   - Participant limits
4. **Register** - Pay the entry fee to secure your spot
5. **Wait for Start** - Tournament begins when full or at scheduled time
6. **Compete** - Play your matches according to the bracket
7. **Collect Prizes** - Automated distribution to top 8 finishers

### Prize Distribution

**Top 8 Payout Structure:**
- 🥇 1st Place: 40% of prize pool
- 🥈 2nd Place: 25%
- 🥉 3rd Place: 15%
- 4th Place: 10%
- 5th Place: 5%
- 6th Place: 3%
- 7th Place: 1%
- 8th Place: 1%
- *House Fee: 5%*

### Tournament Features

#### Entry Fees & Prize Pools
- Entry fees range from 0.01 to 1.0 CELO
- Prize pool = (Entry Fee × Participants) + Sponsor Bonuses
- Guaranteed minimum prize pools for sponsored tournaments

#### NFT Gating
- **Public Tournaments:** Open to all players
- **Exclusive Tournaments:** Require Gold+ tier achievements
- NFT holders receive up to 50% discount on house fees

#### Recurring Tournaments
- **Daily:** Quick 8-16 player brackets
- **Weekly:** Larger competitions with bigger prizes
- **Monthly:** Championship events with boosted prize pools

#### Real-Time Features
- Live bracket visualization
- Match status updates
- Tournament chat (coming soon)
- Spectator mode for completed matches

### Creating a Tournament

**Requirements:**
- Be designated as admin (contact team)
- Provide entry fee and participant limits
- Optional: Add sponsor funds for guaranteed prizes

**Tournament Creation:**
```typescript
// Admin dashboard
{
  name: "Weekend Championship",
  type: TournamentType.SingleElimination,
  entryFee: parseEther("0.05"), // 0.05 CELO
  maxParticipants: 32,
  guaranteedPrize: parseEther("2.0"), // Sponsor adds 2 CELO
  requiresGoldNFT: true,
  difficulty: Difficulty.Expert
}
```

### Tournament Statistics

Track your performance:
- **Tournaments Played**: Total participation count
- **Tournaments Won**: 1st place finishes
- **Total Prizes**: Lifetime earnings
- **Best Placement**: Highest tournament finish
- **Win Rate**: Match wins vs losses
- **Current Rating**: Skill-based ranking (coming soon)

### Technical Details

**Bracket Generation:**
- Automatic pairing based on tournament type
- Seeded matchups for fair competition
- Bye assignments for odd participant counts

**Match Coordination:**
- Automated room creation for tournament matches
- Turn-based gameplay with timeouts
- Server-side result verification
- Cheating detection and penalties

**Smart Contract Integration:**
- On-chain tournament registration
- Decentralized prize pool management
- Transparent winner selection
- Automated prize distribution

### Deploying Tournament Contract

```bash
# Deploy TournamentManager
npx hardhat run scripts/deploy-tournament.ts --network celo-testnet

# Verify on CeloScan
npx hardhat verify --network celo-testnet <TOURNAMENT_ADDRESS> <MULTIPLAYER_ADDRESS> <ACHIEVEMENT_TRACKER_ADDRESS>
```

### Winning Formula

```
Profit = Bet Amount × Total Multiplier
```

---

## 📱 MiniPay Integration

**MiniPay** is Celo's mobile-first stablecoin wallet with 10M+ activated addresses. Our game is fully optimized for MiniPay users!

### 🎯 MiniPay Features

#### 1. **Auto-Detection & Connection**
- Automatically detects MiniPay environment
- No connect button needed (seamless auto-connect)
- Shows beautiful "MiniPay Mode" badge

#### 2. **Deeplink Support** 🔗
Share direct links to pre-configure the game:

```
https://celo-snake.vercel.app/?bet=0.5&difficulty=hard&nickname=Player1
```

**Supported Parameters:**
- `bet` - Pre-fill bet amount (e.g., `?bet=0.5`)
- `difficulty` - Pre-select difficulty: `easy`, `medium`, `hard`, `expert`, `master`
- `nickname` - Pre-fill nickname
- `autoConnect` - Auto-connect wallet on load

**Examples:**
```bash
# High roller link
?bet=1.0&difficulty=master

# Beginner link
?bet=0.01&difficulty=easy&nickname=Newbie

# Tournament link
?bet=0.5&difficulty=hard&autoConnect=true
```

#### 3. **cUSD Fee Payments** 💰
- MiniPay users can pay transaction fees in **cUSD** (stablecoin)
- No need to hold native CELO for gas
- Perfect for emerging markets

#### 4. **Mobile-Optimized UX** 📱
- **Larger Touch Targets:** Bigger buttons for easier tapping
- **Haptic Feedback:** Feel the dice roll and cashout
- **Responsive Design:** Optimized spacing for mobile screens
- **Shortened Addresses:** Cleaner display on small screens
- **Smooth Animations:** Active button press effects

#### 5. **Share Wins** 🎉
- Share your big wins via Web Share API
- Works with WhatsApp, Twitter, Facebook, etc.
- Fallback to clipboard on desktop

#### 6. **Persistent Storage** 💾
- Game state survives app backgrounding
- Never lose your progress
- Auto-requests persistent storage permission

#### 7. **PWA Support** 
- Installable as a Progressive Web App
- Full screen mode on mobile
- App-like experience

### 📲 Install MiniPay

- **Android:** [Google Play Store](https://play.google.com/store/apps/details?id=com.opera.minipay)
- **iOS:** [App Store](https://apps.apple.com/de/app/minipay-easy-global-wallet/id6504087257)
- **Opera Mini:** Built-in (enable in settings)

### 🧪 Testing MiniPay Integration

See **[MINIPAY_TESTING.md](./MINIPAY_TESTING.md)** for comprehensive testing guide.

**Quick Test (Browser):**
```javascript
// Simulate MiniPay in dev console
window.ethereum = window.ethereum || {};
window.ethereum.isMiniPay = true;
location.reload();
```

**Quick Test (Mobile):**
1. Deploy to Vercel: `npm run build && vercel`
2. Open in MiniPay app
3. Test deeplink: `https://your-app.vercel.app/?bet=0.5&difficulty=hard`

### 🎮 Using Deeplinks for Marketing

**Tournament Mode:**
```
https://celo-snake.vercel.app/?bet=0.5&difficulty=expert&nickname=Tournament
```

**Beginner Friendly:**
```
https://celo-snake.vercel.app/?bet=0.01&difficulty=easy
```

**High Roller:**
```
https://celo-snake.vercel.app/?bet=5.0&difficulty=master
```

Share these links on social media to onboard users directly into specific game modes!

### 📚 MiniPay Resources

- [MiniPay Overview](https://docs.celo.org/build-on-celo/build-on-minipay/overview)
- [MiniPay Quickstart](https://docs.celo.org/build-on-celo/build-on-minipay/quickstart)
- [MiniPay Code Library](https://docs.celo.org/build-on-celo/build-on-minipay/code-library)
- [MiniPay Deeplinks](https://docs.celo.org/build-on-celo/build-on-minipay/deeplinks)

---

## 📁 Project Structure

```
celo-snake-game/
│
├── contracts/              # Smart contracts
│   └── SnakesGame.sol      # Main game contract
├── public/                 # Static assets
│   └── sounds/             # Game sound effects
│   └── favicon.ico
├── src/
│   ├── components/         # React components
│   │   ├── App.tsx
│   │   ├── GameContainer.tsx
│   │   ├── GameBoard.tsx
│   │   ├── BetPanel.tsx
│   │   └── Leaderboard.tsx
│   ├── utils/              # Utility functions
│   │   ├── contract.ts     # Contract interactions
│   │   └── gameLogic.ts    # Game mechanics
│   ├── wagmi.config.ts     # Wagmi & RainbowKit config
│   ├── vite-env.d.ts       # TypeScript env definitions
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── .env                    # Environment variables (gitignored)
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
├── tailwind.config.js      # Tailwind CSS config
└── README.md               # This file
```

---

## 📺 Demo Video

**Recommended steps for your demo:**

1. Connecting wallet
2. Setting nickname
3. Placing a bet
4. Playing through a game (rolling dice, collecting multipliers)
5. Cashing out winnings
6. Viewing the leaderboard
7. MiniPay integration (if applicable)

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Connect wallet (MetaMask)
- [ ] Connect wallet (MiniPay on mobile)
- [ ] Set and change nickname
- [ ] Place bet with different amounts
- [ ] Play through all difficulty levels
- [ ] Test all game outcomes (win, lose, cashout)
- [ ] Verify leaderboard updates
- [ ] Check game history persistence
- [ ] Test on mobile devices
- [ ] Verify transaction confirmations

### Network Testing

Test on both networks:

- **Alfajores Testnet** (for development)
  - Chain ID: 44787
  - RPC: https://alfajores-forno.celo-testnet.org
  - Faucet: https://faucet.celo.org/alfajores

- **Celo Mainnet** (for production)
  - Chain ID: 42220
  - RPC: https://forno.celo.org

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙌 Acknowledgments

- **Celo Team** - For the amazing blockchain and hackathon
- **Rainbow** - For RainbowKit wallet connector
- **WalletConnect** - For multi-wallet support
- **Viem Team** - For the excellent Ethereum library

---

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/big14way/celsnake/issues)
- **Discussions:** [GitHub Discussions](https://github.com/big14way/celsnake/discussions)
- **Twitter:** [@big14teru]

---

## 🗺️ Roadmap

### Completed Features
- [x] Basic game mechanics
- [x] Smart contract deployment
- [x] Wallet integration
- [x] MiniPay support
- [x] Leaderboard system
- [x] Multiplayer mode (2-4 players)
- [x] NFT achievement system (32 unique achievements)
- [x] Tournament system (4 bracket formats)
- [x] Real-time coordination via WebSocket
- [x] Prize distribution automation

### Upcoming Features
- [ ] Social features (enhanced sharing)
- [ ] Tournament spectator mode
- [ ] Player profiles and stats
- [ ] Mobile app (React Native)
- [ ] Cross-chain integration
- [ ] Community governance

---

Built with ❤️ for the Celo Hackathon 2025

**Made possible by:** Celo, WalletConnect, RainbowKit, Viem, React, & the Web3 community

```
