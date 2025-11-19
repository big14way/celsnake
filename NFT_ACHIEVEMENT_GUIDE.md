# NFT Achievement System - Complete Guide

## Overview

The Celo Snake Game now features a comprehensive NFT achievement system that rewards players with ERC-1155 achievement badges. Players who hold achievement NFTs receive exclusive benefits including fee discounts and tournament access.

## Smart Contracts

### 1. SnakeAchievementNFT
**Address:** `0x6559B28fd6bEc8ff450D4f654841AADa273ac876`
**Network:** Celo Sepolia Testnet
**Standard:** ERC-1155 Multi-Token

**Features:**
- 32 unique achievements across 5 tiers
- Max supply enforcement for rare achievements
- Authorized minter system
- Player discount calculation (up to 50%)
- Tournament eligibility checks

### 2. AchievementTracker
**Address:** `0x85e3569ef3DDEE12Bb68772d2Cf73612e82e39Ea`
**Network:** Celo Sepolia Testnet

**Purpose:** Tracks player progress and automatically mints achievements when conditions are met

**Key Functions:**
- `recordWin()` - Record game wins and check achievements
- `recordLoss()` - Record game losses and update statistics
- `recordTournamentParticipation()` - Track tournament participation
- `recordTournamentWin()` - Award tournament victory achievements
- `getPlayerProgress()` - Get player's game statistics
- `getPlayerDiscount()` - Calculate NFT-based discount

### 3. SnakesGameV2
**Address:** `0x6315d606bBfcC28d9f037A7bdB1dCb21387cEA73`
**Network:** Celo Sepolia Testnet

**Enhanced single-player game contract with:**
- Automatic achievement tracking
- NFT holder discount application
- Game history recording
- Integration with AchievementTracker

### 4. MultiplayerSnakesGameV2
**Address:** `0x7f59A01F0BfD7970846Db71814c9A17F488CCfcF`
**Network:** Celo Sepolia Testnet

**Enhanced multiplayer game contract with:**
- Achievement tracking for multiplayer wins
- Exclusive tournament support (Gold+ holders only)
- Per-player NFT discount calculation
- Tournament win achievements

## Achievement Tiers & Benefits

### Bronze Tier (IDs: 1-10)
- **Count:** 10 achievements
- **Supply:** Unlimited
- **Discount:** 1% per achievement
- **Examples:** First Victory, Getting Started, High Roller

### Silver Tier (IDs: 11-20)
- **Count:** 10 achievements
- **Supply:** Unlimited
- **Discount:** 2% per achievement
- **Examples:** Veteran (1000 games), Big Winner, Lucky Star

### Gold Tier (IDs: 21-25)
- **Count:** 5 achievements
- **Supply:** Limited (100-1000 each)
- **Discount:** 5% per achievement
- **Special:** Unlocks exclusive tournament access
- **Examples:** Tournament Victor, Legendary Streak, Elite

### Platinum Tier (IDs: 31-34)
- **Count:** 4 achievements
- **Supply:** Very Limited (50-100 each)
- **Discount:** 10% per achievement
- **Examples:** Hall of Fame, Ultimate Champion

### Special Tier (IDs: 41-43)
- **Count:** 3 achievements
- **Supply:** Ultra Rare (1-1000 each)
- **Discount:** 15% per achievement
- **Examples:** Season 1 Champion (1 supply), Genesis Player

## How Achievements Are Earned

### Automatic Achievement Minting

Achievements are automatically minted when players reach milestones:

**Win-Based Achievements:**
- First win → FIRST_WIN (ID: 1)
- 10 wins → GETTING_STARTED (ID: 2)
- 50 wins → RISING_STAR (ID: 3)
- 100 wins → EXPERIENCED (ID: 4)

**Streak Achievements:**
- 5-win streak → ON_FIRE (ID: 5)
- 10-win streak → UNSTOPPABLE (ID: 6)
- 20-win streak → DOMINATING (ID: 12)
- 50-win streak → LEGENDARY (ID: 23)

**Betting Achievements:**
- Bet ≥ 1 CELO → HIGH_ROLLER (ID: 7)
- 50 CELO total bets → GENEROUS_BETTOR (ID: 20)
- 1000 CELO total bets → WHALE (ID: 24)

**Game Count Achievements:**
- 1000 games → VETERAN (ID: 11)
- 5000 games → ELITE (ID: 21)

**Multiplayer & Tournament:**
- First multiplayer win → MULTIPLAYER_CHAMPION (ID: 10)
- Tournament participation → TOURNAMENT_READY (ID: 13)
- Tournament win → TOURNAMENT_VICTOR (ID: 22)

## Frontend Integration

### React Hooks

The system provides custom hooks for easy integration:

```typescript
import {
  usePlayerAchievements,
  usePlayerDiscount,
  useExclusiveTournamentEligibility,
  usePlayerProgress,
  usePlayerAchievementData
} from './hooks/useAchievements';

function MyComponent() {
  const { achievements, isLoading } = usePlayerAchievements();
  const { discount } = usePlayerDiscount();
  const { isEligible } = useExclusiveTournamentEligibility();
  const { progress } = usePlayerProgress();

  // Or get everything at once:
  const {
    achievements,
    discount,
    isEligible,
    progress,
    refetchAll
  } = usePlayerAchievementData();
}
```

### UI Components

**PlayerProfile Component:**
- Displays player statistics
- Shows owned achievements
- Displays discount percentage
- Shows tournament eligibility

**AchievementBrowser Component:**
- Browse all 32 achievements
- Filter by tier
- Search by name/description
- View rarity and supply info
- See locked vs unlocked status

### Integration in App

```typescript
import PlayerProfile from './components/PlayerProfile';
import AchievementBrowser from './components/AchievementBrowser';

// In your component:
const [showProfile, setShowProfile] = useState(false);
const [showAchievements, setShowAchievements] = useState(false);

// Render modals:
{showProfile && <PlayerProfile onClose={() => setShowProfile(false)} />}
{showAchievements && <AchievementBrowser onClose={() => setShowAchievements(false)} />}
```

## Contract Interactions

### For Game Developers

**To record a game win:**
```solidity
// Call from your game contract (must be authorized)
achievementTracker.recordWin(
    playerAddress,
    betAmount,
    winnings,
    finalScore,
    isMultiplayer
);
```

**To record a game loss:**
```solidity
achievementTracker.recordLoss(playerAddress, betAmount);
```

**To record tournament events:**
```solidity
achievementTracker.recordTournamentParticipation(playerAddress);
achievementTracker.recordTournamentWin(playerAddress);
```

**To get player discount:**
```solidity
uint256 discount = achievementTracker.getPlayerDiscount(playerAddress);
// Returns 0-50 (percentage)
```

**To check tournament eligibility:**
```solidity
bool eligible = achievementTracker.isEligibleForExclusiveTournaments(playerAddress);
```

### Contract Authorization

Before game contracts can mint achievements, they must be authorized:

```bash
# 1. Authorize game contract on AchievementTracker
npx hardhat console --network celoSepolia

const tracker = await ethers.getContractAt("AchievementTracker", "0x85e3569ef3DDEE12Bb68772d2Cf73612e82e39Ea");
await tracker.authorizeGame("YOUR_GAME_CONTRACT_ADDRESS");
```

## Deployment

### Deploy New System

```bash
# Deploy all V2 contracts (requires existing SnakeAchievementNFT)
npx hardhat run scripts/deployV2System.js --network celoSepolia
```

This will:
1. Deploy AchievementTracker
2. Authorize AchievementTracker as NFT minter
3. Deploy SnakesGameV2
4. Deploy MultiplayerSnakesGameV2
5. Authorize game contracts on tracker
6. Generate frontend constants

### Verify Contracts

```bash
# Verify AchievementTracker
npx hardhat verify --network celoSepolia 0x85e3569ef3DDEE12Bb68772d2Cf73612e82e39Ea "0x6559B28fd6bEc8ff450D4f654841AADa273ac876"

# Verify SnakesGameV2
npx hardhat verify --network celoSepolia 0x6315d606bBfcC28d9f037A7bdB1dCb21387cEA73 "0x85e3569ef3DDEE12Bb68772d2Cf73612e82e39Ea"

# Verify MultiplayerSnakesGameV2
npx hardhat verify --network celoSepolia 0x7f59A01F0BfD7970846Db71814c9A17F488CCfcF "0x85e3569ef3DDEE12Bb68772d2Cf73612e82e39Ea"
```

## Testing

### Run Contract Tests

```bash
# Run all tests
npx hardhat test

# Test specific file
npx hardhat test test/SnakeAchievementNFT.test.js
```

**Test Coverage:**
- ✅ 53/53 NFT contract tests passing
- ✅ Minting, batch minting, discounts
- ✅ Tournament eligibility
- ✅ Supply limits and edge cases

### Frontend Testing

1. Connect wallet
2. Play games and check achievements appear
3. Verify discount is applied in game fees
4. Check tournament eligibility after earning Gold achievement
5. View profile to see stats and NFTs
6. Browse achievement gallery

## Metadata & IPFS

### Current Status
Metadata files are generated with placeholder IPFS URIs:
- Location: `metadata/*.json`
- Format: OpenSea compatible
- Count: 33 files (32 achievements + collection)

### To Upload to IPFS

1. **Create Achievement Badge Images**
   - Design 32 unique badge images (512x512px PNG)
   - Use tier-specific colors
   - Save as `1.png`, `2.png`, etc.

2. **Upload Images to IPFS**
   ```bash
   # Using Pinata, NFT.Storage, or similar
   # Get CID for images folder
   ```

3. **Update Metadata**
   - Replace `ipfs://QmPlaceholder/` with real CID
   - Upload metadata folder to IPFS
   - Get metadata CID

4. **Update Contract**
   ```bash
   npx hardhat console --network celoSepolia

   const nft = await ethers.getContractAt("SnakeAchievementNFT", "0x6559B28fd6bEc8ff450D4f654841AADa273ac876");
   await nft.setBaseURI("ipfs://YOUR_METADATA_CID/");
   ```

## Security Considerations

### Access Control
- ✅ Only authorized minters can mint NFTs
- ✅ Only authorized game contracts can report progress
- ✅ Owner-only functions for special minting
- ✅ Max supply enforced on-chain

### Anti-Cheat
- ✅ Double-claim prevention
- ✅ Server-authoritative game logic
- ✅ Achievement verification before minting

### Best Practices
- Always authorize official game contracts only
- Regularly audit minter list
- Monitor achievement minting patterns
- Implement rate limiting on frontend

## Troubleshooting

### Achievement Not Minting

**Check:**
1. Is the game contract authorized on AchievementTracker?
2. Does the player meet the achievement requirements?
3. Has the player already claimed this achievement?
4. Is the achievement active?
5. Has max supply been reached (for limited achievements)?

```bash
# Check if game is authorized
const authorized = await tracker.authorizedGames(gameContractAddress);

# Check if player has achievement
const hasIt = await nftContract.hasAchievement(playerAddress, achievementId);

# Check achievement status
const achievement = await nftContract.getAchievement(achievementId);
```

### Discount Not Applying

**Check:**
1. Does the player actually own achievement NFTs?
2. Is the game contract calling `getPlayerDiscount()`?
3. Is the discount calculation correct (check tier values)?

```bash
# Check player's achievements
const achievements = await nftContract.getPlayerAchievements(playerAddress);

# Check discount
const discount = await tracker.getPlayerDiscount(playerAddress);
```

### Frontend Not Loading Data

**Check:**
1. Are contract addresses correct in `src/contracts/addresses.ts`?
2. Are ABI files present in `src/contracts/`?
3. Is wallet connected?
4. Is network correct (Celo Sepolia)?

## Gas Optimization

- Batch minting saves 39% gas vs individual mints
- Use `mintAchievementBatch()` when minting multiple achievements
- Achievement checks use view functions (no gas)
- Efficient storage packing for Achievement struct

## Roadmap

### Future Enhancements
- [ ] Additional achievements for special events
- [ ] Seasonal achievement series
- [ ] Achievement trading/marketplace
- [ ] Leaderboard based on rare achievements
- [ ] Achievement-based tournaments with special rewards
- [ ] Cross-game achievement system
- [ ] Real achievement badge artwork on IPFS

## Support & Resources

### Documentation
- Smart Contract ABIs: `src/contracts/`
- Deployment Info: `deployments/`
- Metadata: `metadata/`
- Tests: `test/`

### Contract Addresses (Celo Sepolia)
- SnakeAchievementNFT: `0x6559B28fd6bEc8ff450D4f654841AADa273ac876`
- AchievementTracker: `0x85e3569ef3DDEE12Bb68772d2Cf73612e82e39Ea`
- SnakesGameV2: `0x6315d606bBfcC28d9f037A7bdB1dCb21387cEA73`
- MultiplayerSnakesGameV2: `0x7f59A01F0BfD7970846Db71814c9A17F488CCfcF`

### Block Explorer
- View contracts: https://explorer.celo.org/celo-sepolia/address/[ADDRESS]

---

**Last Updated:** November 19, 2025
**Version:** 2.0 (Milestone 2.2 Complete)
