# Multiplayer Architecture Design

## Overview
Real-time multiplayer mode for Celo Snake using WebSocket communication, turn-based gameplay, and enhanced smart contracts.

## Architecture Components

### 1. **Backend: WebSocket Server**
- **Technology:** Socket.IO (compatible with serverless via Vercel)
- **Hosting:** Vercel Serverless Functions + Socket.IO adapter
- **Responsibilities:**
  - Room management and matchmaking
  - Game state synchronization
  - Turn validation and anti-cheat
  - Real-time event broadcasting

### 2. **Frontend: Multiplayer Client**
- **Technology:** Socket.IO Client
- **Components:**
  - `MultiplayerLobby` - Room browser and matchmaking
  - `MultiplayerGame` - Shared game board with turn-based logic
  - `useMultiplayer` - Custom hook for WebSocket state
- **State Management:** React Context + Hooks

### 3. **Smart Contract: Multiplayer Extensions**
- **New Contract:** `MultiplayerSnakesGame.sol`
- **Features:**
  - Multi-player bet pooling
  - Winner-takes-all or proportional distribution
  - Room validation and finalization
  - Anti-cheat: commit-reveal for dice rolls

### 4. **Game Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                     MULTIPLAYER FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. MATCHMAKING PHASE
   ├─ Player creates room (difficulty + bet amount)
   ├─ Room listed in lobby
   ├─ Other players join room
   └─ Room full → Start game

2. BETTING PHASE
   ├─ All players call smart contract placeBet()
   ├─ Bets pooled in contract
   ├─ Game seed generated (commit-reveal)
   └─ Board generated deterministically

3. GAMEPLAY PHASE (Turn-Based)
   ├─ Player 1 rolls dice
   │   ├─ Commit hash to contract
   │   ├─ Reveal after delay
   │   └─ WebSocket broadcasts move
   ├─ Animations for all players
   ├─ Player lands on snake → Eliminated
   ├─ Player reaches end or 5 rolls → Finished
   └─ Repeat for each player

4. RESOLUTION PHASE
   ├─ All players finished/eliminated
   ├─ Calculate winners and shares
   ├─ Smart contract distributes prize pool
   └─ Return to lobby
```

### 5. **Anti-Cheat Mechanisms**

#### a) Commit-Reveal for Dice Rolls
```solidity
// Player commits hash before roll
commit(keccak256(abi.encodePacked(dice1, dice2, secret)))

// After delay, player reveals
reveal(dice1, dice2, secret)

// Contract validates: keccak256(dice1, dice2, secret) == committed_hash
```

#### b) Server-Side Validation
- WebSocket server validates all moves against game rules
- Invalid moves disconnect player and forfeit bet
- Board state synchronized from trusted source

#### c) Time Limits
- 30 seconds per turn
- Miss turn → Auto-eliminated
- Prevents griefing and stalling

### 6. **Prize Distribution Models**

#### Model A: Winner-Takes-All
```
Winner receives: (totalBets * 0.97) // 3% house fee
Losers receive: 0
```

#### Model B: Proportional (Top 3)
```
1st place: 60% of pool
2nd place: 25% of pool
3rd place: 10% of pool
House fee: 5%
```

#### Model C: Survival Bonus
```
Completed game without snake: Share 80% of pool proportionally
Hit snake: Lose bet
House fee: 5%
```

### 7. **Technical Stack**

```typescript
// Backend
- socket.io ^4.7.0
- redis-adapter (for scaling)
- vercel (deployment)

// Frontend
- socket.io-client ^4.7.0
- react-query (server state)
- zustand (client state)

// Smart Contract
- Solidity ^0.8.20
- OpenZeppelin Contracts (security)
- Commit-reveal pattern
```

### 8. **Data Models**

```typescript
interface Room {
  id: string;
  difficulty: Difficulty;
  betAmount: string;
  maxPlayers: number;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  boardSeed: string;
  createdAt: number;
}

interface Player {
  address: string;
  nickname: string;
  position: number;
  eliminated: boolean;
  finishedAt?: number;
  multiplier: number;
}

interface GameState {
  roomId: string;
  board: BoardCell[][];
  path: PathCell[];
  currentTurnPlayer: string;
  turnStartTime: number;
  players: Map<string, PlayerState>;
}

interface Turn {
  player: string;
  dice1: number;
  dice2: number;
  commitment: string;
  revealed: boolean;
  validatedBy: string[];
}
```

### 9. **WebSocket Events**

```typescript
// Client → Server
'room:create'
'room:join'
'room:leave'
'game:roll'
'game:reveal'
'game:forfeit'

// Server → Client
'room:created'
'room:updated'
'room:player_joined'
'room:player_left'
'game:started'
'game:turn_started'
'game:move_made'
'game:player_eliminated'
'game:finished'
'game:error'
```

### 10. **Security Considerations**

1. **Rate Limiting:** 10 actions per minute per address
2. **Signature Verification:** All actions signed with wallet
3. **State Validation:** Server is source of truth
4. **Timeout Protection:** Auto-kick inactive players
5. **Replay Protection:** Nonces for all transactions
6. **Balance Checks:** Verify player can afford bet

### 11. **Scalability**

- **Horizontal Scaling:** Redis adapter for Socket.IO
- **Room Sharding:** 100 rooms per server instance
- **Connection Pool:** 1000 concurrent connections
- **CDN:** Static assets via Vercel Edge Network

### 12. **Development Phases**

#### Phase 1: Core Infrastructure (Week 1-2)
- [ ] WebSocket server setup
- [ ] Smart contract extensions
- [ ] Basic room management
- [ ] Testing framework

#### Phase 2: Game Logic (Week 3-4)
- [ ] Turn-based mechanics
- [ ] State synchronization
- [ ] Commit-reveal implementation
- [ ] Anti-cheat validation

#### Phase 3: UI/UX (Week 5-6)
- [ ] Multiplayer lobby
- [ ] In-game player list
- [ ] Spectator mode
- [ ] Chat system (optional)

#### Phase 4: Testing & Launch (Week 7-8)
- [ ] Load testing (100+ concurrent games)
- [ ] Security audit
- [ ] Beta testing with users
- [ ] Production deployment

### 13. **Monitoring & Analytics**

```typescript
// Track metrics
- Active rooms count
- Players online
- Average game duration
- Elimination rate by difficulty
- Prize pool distribution
- Server response times
- Error rates
```

### 14. **Alternative: Simplified Approach**

For faster MVP, consider:
- **Peer-to-Peer WebRTC** instead of server
- **2-player only** initially
- **No commit-reveal** (trust-based for beta)
- **Client-side validation** with post-game verification

---

## Implementation Priority

1. **High Priority:**
   - Smart contract multiplayer extensions
   - WebSocket server core
   - Turn-based game logic
   - Basic UI (lobby + game)

2. **Medium Priority:**
   - Anti-cheat mechanisms
   - Prize distribution models
   - Spectator mode
   - Leaderboard integration

3. **Low Priority:**
   - Chat system
   - Replay system
   - Advanced matchmaking (ELO)
   - Tournament mode

---

## Next Steps

1. Choose deployment approach (serverless vs dedicated)
2. Implement smart contract extensions
3. Build WebSocket server
4. Create multiplayer UI components
5. Integration testing
6. Security audit
7. Beta launch
