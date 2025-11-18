# =
 Celo Snake - Play-to-Earn Game

A mobile-first, blockchain-based snake dice game built on **Celo** with **MiniPay** support. Roll the dice, avoid the snakes, collect multipliers, and earn CELO!

**Live Demo:** [https://celo-snake.vercel.app](https://celo-snake.vercel.app)

## =� Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Smart Contract](#smart-contract)
- [Game Rules](#game-rules)
- [MiniPay Integration](#minipay-integration)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## <� Overview

Celo Snake is a play-to-earn gaming dApp built for the Celo Hackathon. Players place bets, roll dice to move across a 5x5 board, collect multipliers, and cash out their winnings - all on the Celo blockchain.

## 🎯 Problem We're Solving

The traditional gaming industry lacks transparency and fair monetization for players. Centralized platforms control player earnings, impose high fees, and provide no real ownership of in-game assets. Additionally, blockchain gaming often faces barriers to entry:

- **High Complexity:** Most blockchain games require extensive crypto knowledge
- **Poor Mobile Experience:** Limited mobile-first blockchain gaming options
- **Expensive Transactions:** High gas fees make micro-transactions unfeasible
- **Limited Accessibility:** Difficult onboarding for newcomers to Web3

## 💡 Our Solution

Celo Snake addresses these challenges by leveraging Celo's mobile-first blockchain infrastructure:

- **Transparent Gameplay:** All game logic and payouts handled by smart contracts
- **True Ownership:** Players control their earnings through their wallets
- **Mobile-Optimized:** Seamless MiniPay integration for on-the-go gaming
- **Low-Cost Transactions:** Celo's efficient L2 enables affordable gameplay
- **Easy Onboarding:** Simple wallet connection via WalletConnect & RainbowKit
- **Instant Payouts:** Cash out anytime with immediate on-chain settlements

## 🚀 Mission Summary

Our mission is to make blockchain gaming accessible, fair, and fun for everyone. By building on Celo, we're creating a play-to-earn experience that's:

1. **Mobile-First:** Optimized for MiniPay users in emerging markets
2. **Provably Fair:** On-chain verification of all game outcomes
3. **Financially Inclusive:** Low fees enable micro-betting for all users
4. **User-Friendly:** No crypto expertise required to start playing
5. **Sustainable:** Built on Celo's carbon-negative blockchain

We believe gaming should reward players for their time and skill, and Celo's technology makes this vision achievable at scale.

### Why Celo?

- **Mobile-First:** Optimized for mobile users with MiniPay integration
- **Fast & Cheap:** Low transaction fees and quick confirmations
- **Accessible:** Easy onboarding for users new to crypto
- **Sustainable:** Built on a carbon-negative blockchain

## ( Features

- <� **Dice-Based Gameplay:** Roll two dice to move across the board
- =� **Play-to-Earn:** Win CELO by avoiding snakes and collecting multipliers
- =� **MiniPay Support:** Seamless integration with Celo's mobile wallet
- = **WalletConnect:** Connect with any Web3 wallet via RainbowKit
- <� **Leaderboard:** Compete with other players
- <� **Multiple Difficulty Levels:** Easy, Medium, Hard, Expert, Master
- =� **Game State Persistence:** Resume your game anytime
- =� **Game History:** Track all your past games

## =� Tech Stack

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

## =� Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask, MiniPay, etc.)
- Celo testnet tokens (get from [Celo Faucet](https://faucet.celo.org/alfajores))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/big14way/celsnake.git
   cd celsnake
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your values (see [Environment Variables](#environment-variables))

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

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

## = Environment Variables

Create a `.env` file in the root directory with the following variables:

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

## =� Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add Environment Variables**

   In your Vercel dashboard, add the environment variables from `.env`

### Deploy to Netlify

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Add Environment Variables**

   In your Netlify dashboard, add the environment variables from `.env`

## =� Smart Contract

The game uses a Solidity smart contract deployed on Celo.

### Contract Address

- **Celo Sepolia Testnet:** `0x9C7af8B9e41555ce384a67f563Fa0d20D1dD9DFc`
- **Celo Mainnet:** TBD

**Block Explorer:**
- View on Celo Explorer: [https://explorer.celo.org/alfajores/address/0x9C7af8B9e41555ce384a67f563Fa0d20D1dD9DFc](https://explorer.celo.org/alfajores/address/0x9C7af8B9e41555ce384a67f563Fa0d20D1dD9DFc)

### Contract Features

-  Place bets in CELO
-  Cash out winnings
-  Reset active bets
-  Change nickname
-  View leaderboard
-  Get contract balance

### Deploying the Contract

1. **Navigate to contracts directory**
   ```bash
   cd contracts
   ```

2. **Install Hardhat** (if not already installed)
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

3. **Create deployment script**

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

4. **Configure Hardhat for Celo**

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

5. **Deploy to Alfajores Testnet**
   ```bash
   npx hardhat run scripts/deploy.js --network alfajores
   ```

6. **Update contract address**

   Copy the deployed contract address and update it in `.env`:
   ```env
   VITE_CONTRACT_ADDRESS=0x...
   ```

## <� Game Rules

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
- Your total multiplier is calculated as:
  ```
  Total = (1 + sum of non-2x multipliers) + (2^count of 2x multipliers) - 1
  ```

  Example:
  - Collect 1.5x + 2x + 1.2x
  - Total = (1 + 0.5 + 0.2) + (2^1) - 1 = 2.7x

### Winning Formula

```
Profit = Bet Amount � Total Multiplier
```

## =� MiniPay Integration

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

## =� Project Structure

```
celo-snake-game/
   contracts/              # Smart contracts
      SnakesGame.sol     # Main game contract
   public/                # Static assets
      sounds/           # Game sound effects
      favicon.ico
   src/
      components/        # React components
         App.tsx       # Main app wrapper
         GameContainer.tsx  # Game logic & state
         GameBoard.tsx      # Visual game board
         BetPanel.tsx       # Betting interface
         Leaderboard.tsx    # Player rankings
      utils/             # Utility functions
         contract.ts    # Contract interactions
         gameLogic.ts   # Game mechanics
      wagmi.config.ts    # Wagmi & RainbowKit config
      vite-env.d.ts      # TypeScript env definitions
      main.tsx           # App entry point
      index.css          # Global styles
   .env                   # Environment variables (gitignored)
   .env.example           # Environment template
   .gitignore             # Git ignore rules
   package.json           # Dependencies
   tsconfig.json          # TypeScript config
   vite.config.ts         # Vite config
   tailwind.config.js     # Tailwind CSS config
   README.md              # This file
```

## <� Demo Video

[Create a 4-minute demo video showing:]

1. Connecting wallet
2. Setting nickname
3. Placing a bet
4. Playing through a game (rolling dice, collecting multipliers)
5. Cashing out winnings
6. Viewing the leaderboard
7. MiniPay integration (if applicable)

## >� Testing

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

## > Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## =� License

This project is licensed under the MIT License.

## =O Acknowledgments

- **Celo Team** - For the amazing blockchain and hackathon
- **Rainbow** - For RainbowKit wallet connector
- **WalletConnect** - For multi-wallet support
- **Viem Team** - For the excellent Ethereum library

## =� Support

- **Issues:** [GitHub Issues](https://github.com/big14way/celsnake/issues)
- **Discussions:** [GitHub Discussions](https://github.com/big14way/celsnake/discussions)
- **Twitter:** [@big14teru]

## <� Roadmap

- [x] Basic game mechanics
- [x] Smart contract deployment
- [x] Wallet integration
- [x] MiniPay support
- [x] Leaderboard
- [ ] Multiplayer mode
- [ ] NFT rewards
- [ ] Tournament system
- [ ] Social features (share wins)
- [ ] Mobile app (React Native)

---

Built with d for the Celo Hackathon 2025

**Made possible by:** Celo, WalletConnect, RainbowKit, Viem, React, & the Web3 community
