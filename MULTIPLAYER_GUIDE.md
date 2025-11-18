# Multiplayer Mode - User & Developer Guide

## 🎮 Overview

Celo Snake now features **real-time multiplayer** mode, allowing 2-4 players to compete simultaneously on the same board in turn-based gameplay.

---

## 🚀 Features

### Core Multiplayer Features
✅ **Real-time Room System** - Create and join game rooms  
✅ **Turn-Based Gameplay** - Players take turns rolling dice  
✅ **Live Player Tracking** - See all players' positions in real-time  
✅ **Multiple Prize Models** - Winner-takes-all, Proportional, or Survival  
✅ **Smart Contract Integration** - On-chain prize distribution  
✅ **WebSocket Communication** - Instant synchronization across clients  
✅ **Anti-Cheat Validation** - Server-side move verification  

---

## 📖 How to Play Multiplayer

### Step 1: Switch to Multiplayer Mode
Click the **"Multiplayer 🎮"** button in the top-right corner

### Step 2: Create or Join a Room

**Create Room:**
1. Click "Create Room"
2. Enter your nickname
3. Select difficulty (Easy/Medium/Hard/Expert/Master)
4. Set bet amount
5. Choose max players (2-4)
6. Click "Create"

**Join Room:**
1. Browse available rooms in the lobby
2. Click "Join Room" on any open room
3. Enter your nickname
4. Wait for other players

### Step 3: Play the Game
- Game starts automatically when room is full
- Players take turns rolling dice
- **Your Turn:** Click "Roll Dice 🎲" button
- **Other Players' Turns:** Watch their moves in real-time
- Land on multipliers to increase score
- Land on snakes = eliminated
- Complete 5 rolls or reach the end to finish

### Step 4: Win Prizes
- Top scorers win based on prize model
- Prizes distributed automatically via smart contract
- View results and return to lobby

---

## 💰 Prize Distribution Models

### 1. Winner-Takes-All (Default)
- Highest scorer wins entire prize pool (minus 5% house fee)
- Most competitive, highest risk/reward

### 2. Proportional (Top 3)
- 1st Place: 60% of prize pool
- 2nd Place: 25% of prize pool
- 3rd Place: 10% of prize pool
- House Fee: 5%

### 3. Survival
- All players who finish without hitting snakes split 95% of pool equally
- Hit a snake = lose your bet
- House Fee: 5%

---

## 🛠️ Technical Architecture

### Components Created

```
api/
  └── socket.ts              # WebSocket server (Vercel serverless)

src/
  ├── types/
  │   └── multiplayer.ts     # TypeScript interfaces
  ├── stores/
  │   └── multiplayerStore.ts # Zustand state management
  ├── components/
  │   ├── MultiplayerContainer.tsx  # Main container
  │   ├── MultiplayerLobby.tsx      # Room browser
  │   └── MultiplayerGame.tsx       # Game UI
  └── App.tsx                # Mode toggle integration

contracts/
  └── MultiplayerSnakesGame.sol # Smart contract
```

### State Management (Zustand)
- **Connection State:** WebSocket connection status
- **Room State:** Current room, players, game status
- **Game State:** Turn tracking, move history, player positions

### WebSocket Events

**Client → Server:**
- `room:create` - Create new room
- `room:join` - Join existing room
- `room:leave` - Leave room
- `game:roll` - Roll dice (player's turn)
- `game:eliminated` - Player hit snake
- `game:finished` - Player completed game
- `rooms:get` - Fetch active rooms

**Server → Client:**
- `room:created` - Room successfully created
- `room:player_joined` - Player joined room
- `room:player_left` - Player left room
- `game:started` - Game begins
- `game:turn_started` - Player's turn begins
- `game:move_made` - Player rolled dice
- `game:player_eliminated` - Player hit snake
- `game:finished` - Game over, winners announced

---

## 🔧 Deployment Guide

### 1. Deploy Smart Contract

```bash
cd contracts
npx hardhat compile

# Deploy to Celo Sepolia Testnet
npx hardhat run scripts/deploy-multiplayer.js --network celoSepolia

# Save the deployed address
```

### 2. Update Frontend Config

Create `src/utils/multiplayerContract.ts`:

```typescript
export const MULTIPLAYER_CONTRACT_ADDRESS = '0x...'; // Your deployed address
export const MULTIPLAYER_CONTRACT_ABI = [...]; // Copy from artifacts
```

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_SOCKET_URL=https://your-app.vercel.app
# - VITE_MULTIPLAYER_CONTRACT=0x...
```

### 4. Test WebSocket Connection

The WebSocket server runs on `/api/socket` endpoint via Vercel serverless functions.

---

## 🧪 Testing Guide

### Local Testing

1. **Start Dev Server:**
```bash
npm run dev
```

2. **Open Multiple Browser Windows:**
- Window 1: Create a room
- Window 2: Join the room
- Test gameplay with both players

3. **Test Scenarios:**
- ✅ Create room
- ✅ Join room
- ✅ Leave room before game starts
- ✅ Turn-based rolling
- ✅ Player elimination (hit snake)
- ✅ Player finish (complete 5 rolls)
- ✅ Prize distribution

### Production Testing

1. **Deploy to testnet** (Celo Sepolia)
2. **Test with real wallets** and test CELO
3. **Monitor WebSocket connections** in Vercel logs
4. **Verify smart contract calls** in Celo Explorer

---

## 🔒 Security Features

### Server-Side Validation
- All moves validated on server
- Invalid moves = disconnection
- Prevents cheating via client manipulation

### Smart Contract Safety
- Bet amounts locked in contract
- Automated prize distribution
- Owner-only withdrawal functions
- Reentrancy guards (OpenZeppelin)

### Rate Limiting
- 10 actions per minute per player
- Prevents spam and DOS attacks

### Timeout Protection
- 60-second turn limit
- Inactive players auto-eliminated
- Prevents griefing

---

## 📊 Monitoring & Analytics

Track these metrics:
- Active rooms count
- Players online
- Average game duration
- Elimination rate by difficulty
- Prize pool distribution
- Server response times
- Error rates

---

## 🐛 Troubleshooting

### "Not connected to server"
- Check if WebSocket URL is correct
- Verify Vercel deployment is live
- Check browser console for connection errors

### "Room not found"
- Room may have been deleted
- Refresh lobby to see current rooms

### "Not your turn"
- Wait for current player to finish
- Check player list to see turn order

### Transaction Fails
- Ensure sufficient CELO balance
- Check bet amount matches room requirement
- Verify wallet is connected

---

## 🎯 Performance Optimization

### For Production

1. **Use Redis for State Management:**
```bash
npm install @socket.io/redis-adapter redis
```

2. **Enable Compression:**
```typescript
io.use(compression());
```

3. **Add Rate Limiting:**
```typescript
import rateLimit from 'express-rate-limit';
```

4. **CDN for Static Assets:**
- Use Vercel Edge Network
- Optimize images and bundle size

---

## 🚧 Known Limitations (MVP)

- **No Spectator Mode** (planned for v2)
- **No Chat System** (planned for v2)
- **No Replays** (planned for v2)
- **Max 4 Players** per room (scalable to 8+)
- **In-Memory State** (use Redis for production scale)

---

## 🔮 Future Enhancements

### Planned for v2.0
- [ ] Spectator mode
- [ ] In-game chat
- [ ] Tournament system
- [ ] Replay system
- [ ] ELO ranking system
- [ ] Custom room settings
- [ ] Private rooms with passwords
- [ ] Mobile app (React Native)

---

## 💡 Tips for Best Experience

1. **Stable Internet:** Multiplayer requires good connection
2. **Desktop Recommended:** Better for turn-based gameplay
3. **Fair Play:** Don't disconnect mid-game (forfeits bet)
4. **Test First:** Use testnet before real money games
5. **Watch Turns:** Pay attention to whose turn it is

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/big14way/celsnake/issues)
- **Discord:** Join Celo Community Discord
- **Documentation:** [Full Docs](./MULTIPLAYER_ARCHITECTURE.md)

---

## ✅ Checklist for Launch

### Pre-Launch
- [ ] Smart contract deployed and verified
- [ ] Frontend connected to contract
- [ ] WebSocket server tested
- [ ] Load testing completed (100+ concurrent users)
- [ ] Security audit passed
- [ ] Beta testing with users
- [ ] Documentation complete

### Launch
- [ ] Deploy to production (Vercel)
- [ ] Announce on social media
- [ ] Monitor server performance
- [ ] Collect user feedback
- [ ] Fix bugs quickly

### Post-Launch
- [ ] Analyze metrics
- [ ] Gather user feedback
- [ ] Plan v2 features
- [ ] Scale infrastructure if needed

---

Built with ❤️ for the Celo community  
**Milestone 2.1: Multiplayer Mode** - ✅ Complete
