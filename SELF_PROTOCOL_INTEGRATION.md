# SELF Protocol Integration Guide

## 🔐 Overview

This project integrates **SELF Protocol** for decentralized identity verification, ensuring only verified humans can play the game. SELF Protocol uses zero-knowledge proofs to verify users without compromising privacy.

## 📋 Deployed Contracts

### With SELF Protocol Verification
- **Contract:** SnakesGameV2WithSelfProtocol
- **Address:** `0xB20206e5B057627f7fC4bc414bec692D05231022`
- **Network:** Celo Mainnet (Chain ID: 42220)
- **Celoscan:** https://celoscan.io/address/0xB20206e5B057627f7fC4bc414bec692D05231022

### SELF Protocol Hub
- **IdentityVerificationHub V2:** `0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF`
- **Network:** Celo Mainnet
- **Documentation:** https://docs.self.xyz

## 🎯 Features

### Identity Verification
- **Proof of Humanity:** Only verified users can start games
- **Zero-Knowledge Proofs:** Privacy-preserving verification
- **Expiry Management:** Verifications valid for 30 days
- **Batch Verification:** Owner can verify multiple users at once

### Flexible Configuration
- **Toggle Verification:** Can enable/disable verification requirement
- **Manual Override:** Owner can manually verify users
- **Scope Seed:** Unique verification scope per deployment

## 🔧 Implementation Details

### Contract Features

```solidity
// SELF Protocol Configuration
address public constant SELF_VERIFICATION_HUB = 0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF;
uint256 public scopeSeed;
bytes32 public verificationConfigId;
bool public verificationRequired;

// Verification mapping
mapping(address => uint256) public verifiedUsers;
uint256 public constant VERIFICATION_VALIDITY = 30 days;
```

### Key Functions

#### User Functions
- `startGame(uint8 difficulty)` - Start a game (requires verification if enabled)
- `rollDice()` - Roll dice and move
- `cashOut()` - Cash out winnings
- `isVerified(address user)` - Check if user is verified

#### Owner Functions
- `verifyUser(address user)` - Manually verify a single user
- `verifyUsers(address[] users)` - Batch verify users
- `setVerificationRequired(bool required)` - Toggle verification requirement
- `setVerificationConfigId(bytes32 configId)` - Update verification config

## 🚀 How to Use

### For Players

1. **Get Verified via SELF Protocol**
   - Visit the game website
   - Connect your wallet
   - Complete SELF Protocol verification
   - Your verification is valid for 30 days

2. **Start Playing**
   - Once verified, you can start games
   - Place your bet
   - Roll dice and avoid snakes
   - Cash out when ready

### For Developers

#### 1. Install Dependencies

```bash
npm install @selfxyz/contracts
```

#### 2. Deploy Contract

```bash
npx hardhat run scripts/deploy-self-protocol.js --network celo
```

#### 3. Configure Verification

```javascript
// Enable verification requirement
await contract.setVerificationRequired(true);

// Manually verify a user (after backend validation)
await contract.verifyUser(userAddress);

// Batch verify users
await contract.verifyUsers([address1, address2, address3]);
```

#### 4. Frontend Integration

```javascript
// Check if user is verified
const isVerified = await contract.isVerified(userAddress);

// Get verification expiry
const expiry = await contract.getVerificationExpiry(userAddress);

// Start game (requires verification)
await contract.startGame(difficulty, { value: betAmount });
```

## 🔐 Security Features

### Verification Management
- **Expiry Tracking:** Verifications automatically expire after 30 days
- **Zero Address Check:** Prevents verification of invalid addresses
- **Owner-Only Functions:** Only owner can manually verify users
- **ReentrancyGuard:** Protects against reentrancy attacks

### Game Security
- **Verified Players Only:** Can require SELF Protocol verification
- **House Fee Protection:** 2.5% fee collected on winnings
- **Safe Transfers:** Uses OpenZeppelin's security patterns
- **State Management:** Proper game state tracking

## 📊 Verification Flow

```
1. User → SELF Protocol → Generate ZK Proof
                ↓
2. Backend → Validate Proof → Call verifyUser()
                ↓
3. Contract → Store Verification → Set Expiry (30 days)
                ↓
4. User → Start Game → Play Verified
                ↓
5. After 30 days → Re-verification Required
```

## 🧪 Testing

### Check Verification Status

```bash
# Using Hardhat console
npx hardhat console --network celo

# Check if user is verified
const contract = await ethers.getContractAt("SnakesGameV2WithSelfProtocol", "0xB20206e5B057627f7fC4bc414bec692D05231022");
const isVerified = await contract.isVerified("USER_ADDRESS");
console.log("Verified:", isVerified);

# Get verification expiry
const expiry = await contract.getVerificationExpiry("USER_ADDRESS");
console.log("Expires:", new Date(expiry * 1000));
```

### Manual Verification (Testing)

```bash
# Verify a user for testing
const contract = await ethers.getContractAt("SnakesGameV2WithSelfProtocol", "0xB20206e5B057627f7fC4bc414bec692D05231022");
await contract.verifyUser("USER_ADDRESS");
```

## 📚 Resources

### SELF Protocol Documentation
- **Main Docs:** https://docs.self.xyz
- **Smart Contract Integration:** https://docs.self.xyz/contract-integration/basic-integration
- **Deployed Contracts:** https://docs.self.xyz/contract-integration/deployed-contracts
- **Quickstart:** https://docs.self.xyz/use-self/quickstart

### Celo Resources
- **Celo Docs:** https://docs.celo.org
- **Celoscan:** https://celoscan.io
- **Celo Forum:** https://forum.celo.org

## 🔄 Migration Guide

### From Original SnakesGameV2

The SELF Protocol version maintains backward compatibility:

1. **Same Game Logic:** All game mechanics remain identical
2. **Optional Verification:** Can be disabled by owner
3. **Additional Features:** Adds verification without breaking existing functionality

### Key Differences

| Feature | Original | With SELF Protocol |
|---------|----------|-------------------|
| Verification | None | Optional SELF Protocol |
| User Tracking | None | Verified users mapping |
| Validity Period | N/A | 30 days |
| Manual Override | N/A | Owner can verify |

## 💡 Use Cases

### 1. Proof of Humanity
- Prevent bots from playing
- Ensure fair gameplay
- Build trust in the platform

### 2. Compliance
- Age verification (18+)
- Country restrictions
- KYC requirements

### 3. Tournament Access
- Verified-only tournaments
- Higher stakes for verified players
- Premium features for verified users

## 🎯 Roadmap

### Phase 1 (Completed) ✅
- Deploy SELF Protocol version
- Basic verification flow
- Manual verification by owner

### Phase 2 (In Progress) 🔄
- Frontend SELF Protocol SDK integration
- Automated verification flow
- User verification dashboard

### Phase 3 (Planned) 📋
- Age verification requirements
- Country-based restrictions
- Advanced verification configs

## 🤝 Contributing

We welcome contributions to improve SELF Protocol integration:

1. Fork the repository
2. Create a feature branch
3. Test thoroughly with SELF Protocol
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ using SELF Protocol on Celo**

*Making blockchain gaming accessible, fair, and verified for everyone.*
