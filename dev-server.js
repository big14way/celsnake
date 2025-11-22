/**
 * Development WebSocket Server
 * Runs the Socket.IO server locally for testing
 */

const { createServer } = require('http');
const { Server } = require('socket.io');

// Import security utils (using require for Node.js)
const crypto = require('crypto');

// Rate limiting storage
const rateLimitMap = new Map();

function checkRateLimit(socketId, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(socketId);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(socketId, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count++;
  return false;
}

function createDiceCommit(dice1, dice2, secret) {
  const data = `${dice1}:${dice2}:${secret}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

function verifyDiceReveal(commitHash, dice1, dice2, secret) {
  const computedHash = createDiceCommit(dice1, dice2, secret);
  return computedHash === commitHash;
}

function validateDiceValues(dice1, dice2) {
  return (
    Number.isInteger(dice1) &&
    Number.isInteger(dice2) &&
    dice1 >= 1 &&
    dice1 <= 6 &&
    dice2 >= 1 &&
    dice2 <= 6
  );
}

function validateRoomParams(params) {
  if (!params.host || typeof params.host !== 'string') {
    return { valid: false, error: 'Invalid host address' };
  }

  if (!params.nickname || typeof params.nickname !== 'string' || params.nickname.length > 20) {
    return { valid: false, error: 'Invalid nickname (max 20 chars)' };
  }

  if (!params.difficulty || !['easy', 'medium', 'hard'].includes(params.difficulty)) {
    return { valid: false, error: 'Invalid difficulty' };
  }

  if (!params.betAmount || typeof params.betAmount !== 'string') {
    return { valid: false, error: 'Invalid bet amount' };
  }

  if (!params.maxPlayers || params.maxPlayers < 2 || params.maxPlayers > 6) {
    return { valid: false, error: 'Invalid max players (2-6)' };
  }

  return { valid: true };
}

function sanitizeString(input, maxLength = 100) {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '');
}

// In-memory storage - Multiplayer
const rooms = new Map();
const playerRooms = new Map();
const diceCommits = new Map();
const turnTimers = new Map();

// In-memory storage - Social Features
const playerProfiles = new Map(); // address -> { nickname, allowFriendRequests, createdAt, lastActive }
const friendRequests = new Map(); // requestId -> { id, from, fromNickname, to, toNickname, status, createdAt }
const friends = new Map(); // address -> Set of friend addresses
const blockedUsers = new Map(); // address -> Set of blocked addresses
const chatMessages = new Map(); // messageId -> { id, from, fromNickname, to, roomId, type, message, timestamp }
const globalMessages = []; // Array of global chat messages
const friendChatHistory = new Map(); // `${addr1}_${addr2}` -> Array of messages
const socialActivities = []; // Array of social activities
const referralCodes = new Map(); // code -> address
const referrals = new Map(); // referee address -> { referrer, referee, code, timestamp, rewarded }
const playerSockets = new Map(); // address -> socketId (for online status)
const gameInvites = new Map(); // inviteId -> { id, from, to, roomId, gameMode, status, createdAt, expiresAt }

// Constants
const TURN_TIMEOUT_MS = 60000;
const RATE_LIMIT_ACTIONS = 10;
const RATE_LIMIT_WINDOW = 60000;
const MAX_GLOBAL_MESSAGES = 100;
const MAX_ACTIVITY_FEED = 200;
const INVITE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// Create HTTP server
const httpServer = createServer();

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

console.log('🚀 Development WebSocket Server starting...');

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // CREATE ROOM
  socket.on('room:create', (data) => {
    try {
      if (checkRateLimit(socket.id, RATE_LIMIT_ACTIONS, RATE_LIMIT_WINDOW)) {
        socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' });
        return;
      }

      const validation = validateRoomParams(data);
      if (!validation.valid) {
        socket.emit('error', { message: validation.error });
        return;
      }

      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const room = {
        id: roomId,
        host: data.host,
        difficulty: data.difficulty,
        betAmount: data.betAmount,
        maxPlayers: data.maxPlayers,
        players: [{
          address: data.host,
          nickname: sanitizeString(data.nickname, 20),
          socketId: socket.id,
          position: 0,
          eliminated: false,
          score: 0,
          timeoutCount: 0,
        }],
        status: 'waiting',
        currentTurn: 0,
        boardSeed: '',
        createdAt: Date.now(),
      };

      rooms.set(roomId, room);
      playerRooms.set(socket.id, roomId);
      socket.join(roomId);

      socket.emit('room:created', { room });
      io.emit('rooms:updated', { rooms: Array.from(rooms.values()) });

      console.log('📦 Room created:', roomId);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  // JOIN ROOM
  socket.on('room:join', (data) => {
    try {
      if (checkRateLimit(socket.id, RATE_LIMIT_ACTIONS, RATE_LIMIT_WINDOW)) {
        socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' });
        return;
      }

      const room = rooms.get(data.roomId);

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.status !== 'waiting') {
        socket.emit('error', { message: 'Room not accepting players' });
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        socket.emit('error', { message: 'Room is full' });
        return;
      }

      if (room.players.some(p => p.address === data.address)) {
        socket.emit('error', { message: 'Already in room' });
        return;
      }

      const player = {
        address: data.address,
        nickname: sanitizeString(data.nickname, 20),
        socketId: socket.id,
        position: 0,
        eliminated: false,
        score: 0,
        timeoutCount: 0,
      };

      room.players.push(player);
      playerRooms.set(socket.id, data.roomId);
      socket.join(data.roomId);

      io.to(data.roomId).emit('room:player_joined', { room, player });
      io.emit('rooms:updated', { rooms: Array.from(rooms.values()) });

      console.log(`👤 Player ${data.address} joined room ${data.roomId}`);

      // Auto-start if room is full
      if (room.players.length === room.maxPlayers) {
        startGame(data.roomId);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // LEAVE ROOM
  socket.on('room:leave', () => {
    handlePlayerLeave(socket.id);
  });

  // DICE COMMIT
  socket.on('game:dice_commit', (data) => {
    try {
      if (checkRateLimit(socket.id, RATE_LIMIT_ACTIONS, RATE_LIMIT_WINDOW)) {
        socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' });
        return;
      }

      const roomId = playerRooms.get(socket.id);
      if (!roomId) return;

      const room = rooms.get(roomId);
      if (!room || room.status !== 'playing') return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player) return;

      const currentPlayer = room.players[room.currentTurn];
      if (currentPlayer.socketId !== socket.id) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }

      diceCommits.set(socket.id, {
        socketId: socket.id,
        commitHash: data.commitHash,
        timestamp: Date.now(),
      });

      socket.emit('game:commit_received', { success: true });
      console.log(`🎲 Commit received from ${player.address}`);
    } catch (error) {
      console.error('Error processing commit:', error);
      socket.emit('error', { message: 'Failed to process commit' });
    }
  });

  // DICE REVEAL
  socket.on('game:dice_reveal', (data) => {
    try {
      if (checkRateLimit(socket.id, RATE_LIMIT_ACTIONS, RATE_LIMIT_WINDOW)) {
        socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' });
        return;
      }

      const roomId = playerRooms.get(socket.id);
      if (!roomId) return;

      const room = rooms.get(roomId);
      if (!room || room.status !== 'playing') return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player) return;

      const currentPlayer = room.players[room.currentTurn];
      if (currentPlayer.socketId !== socket.id) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }

      const commit = diceCommits.get(socket.id);
      if (!commit) {
        socket.emit('error', { message: 'No commit found. Must commit before reveal.' });
        return;
      }

      if (Date.now() - commit.timestamp > 5 * 60 * 1000) {
        diceCommits.delete(socket.id);
        socket.emit('error', { message: 'Commit expired. Please roll again.' });
        return;
      }

      if (!validateDiceValues(data.dice1, data.dice2)) {
        socket.emit('error', { message: 'Invalid dice values' });
        return;
      }

      if (!verifyDiceReveal(commit.commitHash, data.dice1, data.dice2, data.secret)) {
        console.error(`🚫 Cheating detected from ${player.address}`);
        socket.emit('error', { message: 'Invalid reveal: does not match commit' });

        player.eliminated = true;
        io.to(roomId).emit('game:player_eliminated', {
          player: player.address,
          reason: 'cheating',
        });

        diceCommits.delete(socket.id);
        checkGameEnd(roomId);
        return;
      }

      diceCommits.delete(socket.id);

      const timer = turnTimers.get(socket.id);
      if (timer) {
        clearTimeout(timer);
        turnTimers.delete(socket.id);
      }

      const move = data.dice1 + data.dice2;
      const oldPosition = player.position;
      let newPosition = oldPosition + move;

      if (newPosition > 100) {
        newPosition = oldPosition;
      }

      player.position = newPosition;

      io.to(roomId).emit('game:move_made', {
        player: player.address,
        dice1: data.dice1,
        dice2: data.dice2,
        newPosition: newPosition,
      });

      console.log(`🎲 Player ${player.address} rolled ${data.dice1}+${data.dice2}, position: ${oldPosition} -> ${newPosition}`);

      if (newPosition === 100) {
        player.finishedAt = Date.now();
        player.score = 10000 + Math.max(0, 10000 - (Date.now() - (room.startedAt || Date.now())));

        io.to(roomId).emit('game:player_finished', {
          player: player.address,
          score: player.score,
        });
      }

      if (player.eliminated || player.finishedAt) {
        checkGameEnd(roomId);
      }

      setTimeout(() => {
        nextTurn(roomId);
      }, 2000);
    } catch (error) {
      console.error('Error processing reveal:', error);
      socket.emit('error', { message: 'Failed to process reveal' });
    }
  });

  // GET ROOMS
  socket.on('rooms:get', () => {
    socket.emit('rooms:list', { rooms: Array.from(rooms.values()) });
  });

  // ========================================
  // SOCIAL FEATURES
  // ========================================

  // SOCIAL: Create/Update Profile
  socket.on('social:create_profile', (data) => {
    try {
      const { address, nickname } = data;

      if (!address || !nickname) {
        socket.emit('error', { message: 'Address and nickname required' });
        return;
      }

      const sanitizedNickname = sanitizeString(nickname, 32);

      playerProfiles.set(address, {
        nickname: sanitizedNickname,
        allowFriendRequests: true,
        createdAt: Date.now(),
        lastActive: Date.now(),
      });

      playerSockets.set(address, socket.id);

      socket.emit('social:profile_loaded', {
        profile: {
          address,
          nickname: sanitizedNickname,
          isOnline: true,
          friends: friends.get(address)?.size || 0,
        }
      });

      console.log(`👤 Profile created for ${address}: ${sanitizedNickname}`);
    } catch (error) {
      console.error('Error creating profile:', error);
      socket.emit('error', { message: 'Failed to create profile' });
    }
  });

  // SOCIAL: Friend Request
  socket.on('social:friend_request', (data) => {
    try {
      const { from, fromNickname, to, toNickname } = data;

      if (!from || !to) {
        socket.emit('error', { message: 'Invalid friend request data' });
        return;
      }

      // Check if already friends
      const userFriends = friends.get(from) || new Set();
      if (userFriends.has(to)) {
        socket.emit('error', { message: 'Already friends' });
        return;
      }

      // Check if blocked
      const blocked = blockedUsers.get(to) || new Set();
      if (blocked.has(from)) {
        socket.emit('error', { message: 'Cannot send request to this user' });
        return;
      }

      const requestId = `fr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const request = {
        id: requestId,
        from,
        fromNickname: sanitizeString(fromNickname, 32),
        to,
        toNickname: sanitizeString(toNickname, 32),
        status: 'pending',
        createdAt: Date.now(),
      };

      friendRequests.set(requestId, request);

      // Notify recipient
      const recipientSocket = playerSockets.get(to);
      if (recipientSocket) {
        io.to(recipientSocket).emit('social:friend_request_received', { request });
      }

      socket.emit('social:friend_request_sent', { request });
      console.log(`👥 Friend request: ${from} -> ${to}`);
    } catch (error) {
      console.error('Error sending friend request:', error);
      socket.emit('error', { message: 'Failed to send friend request' });
    }
  });

  // SOCIAL: Accept Friend Request
  socket.on('social:accept_friend', (data) => {
    try {
      const { requestId } = data;
      const request = friendRequests.get(requestId);

      if (!request) {
        socket.emit('error', { message: 'Request not found' });
        return;
      }

      // Add as friends (bidirectional)
      const fromFriends = friends.get(request.from) || new Set();
      fromFriends.add(request.to);
      friends.set(request.from, fromFriends);

      const toFriends = friends.get(request.to) || new Set();
      toFriends.add(request.from);
      friends.set(request.to, toFriends);

      // Update request status
      request.status = 'accepted';
      request.respondedAt = Date.now();

      // Notify both parties
      const senderSocket = playerSockets.get(request.from);
      if (senderSocket) {
        io.to(senderSocket).emit('social:friend_added', {
          friend: {
            address: request.to,
            nickname: request.toNickname,
            isOnline: playerSockets.has(request.to),
            addedAt: Date.now(),
          }
        });
      }

      const recipientSocket = playerSockets.get(request.to);
      if (recipientSocket) {
        io.to(recipientSocket).emit('social:friend_added', {
          friend: {
            address: request.from,
            nickname: request.fromNickname,
            isOnline: playerSockets.has(request.from),
            addedAt: Date.now(),
          }
        });
      }

      console.log(`✅ Friend request accepted: ${request.from} <-> ${request.to}`);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      socket.emit('error', { message: 'Failed to accept friend request' });
    }
  });

  // SOCIAL: Reject Friend Request
  socket.on('social:reject_friend', (data) => {
    try {
      const { requestId } = data;
      const request = friendRequests.get(requestId);

      if (!request) {
        socket.emit('error', { message: 'Request not found' });
        return;
      }

      friendRequests.delete(requestId);
      console.log(`❌ Friend request rejected: ${request.from} -> ${request.to}`);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      socket.emit('error', { message: 'Failed to reject friend request' });
    }
  });

  // SOCIAL: Remove Friend
  socket.on('social:remove_friend', (data) => {
    try {
      const { from, to } = data;

      const fromFriends = friends.get(from) || new Set();
      fromFriends.delete(to);
      if (fromFriends.size === 0) {
        friends.delete(from);
      }

      const toFriends = friends.get(to) || new Set();
      toFriends.delete(from);
      if (toFriends.size === 0) {
        friends.delete(to);
      }

      // Notify both parties
      const toSocket = playerSockets.get(to);
      if (toSocket) {
        io.to(toSocket).emit('social:friend_removed', { address: from });
      }

      console.log(`👋 Friend removed: ${from} <-> ${to}`);
    } catch (error) {
      console.error('Error removing friend:', error);
      socket.emit('error', { message: 'Failed to remove friend' });
    }
  });

  // SOCIAL: Block User
  socket.on('social:block_user', (data) => {
    try {
      const { from, to } = data;

      const userBlocked = blockedUsers.get(from) || new Set();
      userBlocked.add(to);
      blockedUsers.set(from, userBlocked);

      // Remove friendship if exists
      const fromFriends = friends.get(from);
      if (fromFriends) {
        fromFriends.delete(to);
      }

      const toFriends = friends.get(to);
      if (toFriends) {
        toFriends.delete(from);
      }

      console.log(`🚫 User blocked: ${from} blocked ${to}`);
    } catch (error) {
      console.error('Error blocking user:', error);
      socket.emit('error', { message: 'Failed to block user' });
    }
  });

  // SOCIAL: Unblock User
  socket.on('social:unblock_user', (data) => {
    try {
      const { from, to } = data;

      const userBlocked = blockedUsers.get(from);
      if (userBlocked) {
        userBlocked.delete(to);
        if (userBlocked.size === 0) {
          blockedUsers.delete(from);
        }
      }

      console.log(`✅ User unblocked: ${from} unblocked ${to}`);
    } catch (error) {
      console.error('Error unblocking user:', error);
      socket.emit('error', { message: 'Failed to unblock user' });
    }
  });

  // SOCIAL: Send Message
  socket.on('social:send_message', (message) => {
    try {
      const { from, fromNickname, to, roomId, type, message: text } = message;

      if (!text || text.trim().length === 0) {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }

      if (text.length > 500) {
        socket.emit('error', { message: 'Message too long (max 500 characters)' });
        return;
      }

      const sanitizedMessage = sanitizeString(text, 500);
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const fullMessage = {
        id: messageId,
        from,
        fromNickname: sanitizeString(fromNickname, 32),
        to,
        roomId,
        type,
        message: sanitizedMessage,
        timestamp: Date.now(),
      };

      chatMessages.set(messageId, fullMessage);

      if (type === 'global') {
        globalMessages.push(fullMessage);
        if (globalMessages.length > MAX_GLOBAL_MESSAGES) {
          globalMessages.shift();
        }
        io.emit('social:message_received', { message: fullMessage });
      } else if (type === 'friend' && to) {
        // Friend-to-friend chat
        const chatKey = [from, to].sort().join('_');
        const history = friendChatHistory.get(chatKey) || [];
        history.push(fullMessage);
        friendChatHistory.set(chatKey, history);

        const recipientSocket = playerSockets.get(to);
        if (recipientSocket) {
          io.to(recipientSocket).emit('social:message_received', { message: fullMessage });
        }
        socket.emit('social:message_received', { message: fullMessage });
      } else if (type === 'room' && roomId) {
        io.to(roomId).emit('social:message_received', { message: fullMessage });
      }

      console.log(`💬 Message sent: ${type} from ${fromNickname}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // SOCIAL: Get Friends
  socket.on('social:get_friends', (data) => {
    try {
      const { address } = data;
      const userFriends = friends.get(address) || new Set();

      const friendsList = Array.from(userFriends).map(friendAddr => {
        const profile = playerProfiles.get(friendAddr);
        return {
          address: friendAddr,
          nickname: profile?.nickname || 'Unknown',
          isOnline: playerSockets.has(friendAddr),
          addedAt: Date.now(),
        };
      });

      socket.emit('social:friends_list', { friends: friendsList });
    } catch (error) {
      console.error('Error getting friends:', error);
      socket.emit('error', { message: 'Failed to get friends' });
    }
  });

  // SOCIAL: Get Friend Requests
  socket.on('social:get_friend_requests', (data) => {
    try {
      const { address } = data;
      const requests = Array.from(friendRequests.values())
        .filter(req => req.to === address && req.status === 'pending');

      socket.emit('social:friend_requests_list', { requests });
    } catch (error) {
      console.error('Error getting friend requests:', error);
      socket.emit('error', { message: 'Failed to get friend requests' });
    }
  });

  // SOCIAL: Post Activity
  socket.on('social:post_activity', (data) => {
    try {
      const { type, player, playerNickname, data: activityData } = data;

      const activity = {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        player,
        playerNickname: sanitizeString(playerNickname, 32),
        data: activityData,
        timestamp: Date.now(),
        likes: 0,
        comments: [],
        shares: 0,
      };

      socialActivities.unshift(activity);
      if (socialActivities.length > MAX_ACTIVITY_FEED) {
        socialActivities.pop();
      }

      io.emit('social:activity_posted', { activity });
      console.log(`📰 Activity posted: ${type} by ${playerNickname}`);
    } catch (error) {
      console.error('Error posting activity:', error);
      socket.emit('error', { message: 'Failed to post activity' });
    }
  });

  // SOCIAL: Get Activities
  socket.on('social:get_activities', () => {
    try {
      socket.emit('social:activities_list', { activities: socialActivities.slice(0, 50) });
    } catch (error) {
      console.error('Error getting activities:', error);
      socket.emit('error', { message: 'Failed to get activities' });
    }
  });

  // SOCIAL: Like Activity
  socket.on('social:like_activity', (data) => {
    try {
      const { activityId } = data;
      const activity = socialActivities.find(a => a.id === activityId);

      if (activity) {
        activity.likes++;
        io.emit('social:activity_updated', { activity });
      }
    } catch (error) {
      console.error('Error liking activity:', error);
      socket.emit('error', { message: 'Failed to like activity' });
    }
  });

  // SOCIAL: Comment on Activity
  socket.on('social:comment_activity', (data) => {
    try {
      const { activityId, from, fromNickname, message } = data;
      const activity = socialActivities.find(a => a.id === activityId);

      if (activity) {
        const comment = {
          id: `cmt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          from,
          fromNickname: sanitizeString(fromNickname, 32),
          message: sanitizeString(message, 200),
          timestamp: Date.now(),
        };

        activity.comments.push(comment);
        io.emit('social:activity_updated', { activity });
      }
    } catch (error) {
      console.error('Error commenting on activity:', error);
      socket.emit('error', { message: 'Failed to comment on activity' });
    }
  });

  // SOCIAL: Share Activity
  socket.on('social:share_activity', (data) => {
    try {
      const { activityId } = data;
      const activity = socialActivities.find(a => a.id === activityId);

      if (activity) {
        activity.shares++;
        io.emit('social:activity_updated', { activity });
      }
    } catch (error) {
      console.error('Error sharing activity:', error);
    }
  });

  // SOCIAL: Generate Referral Code
  socket.on('social:generate_referral_code', (data) => {
    try {
      const { address } = data;

      // Generate unique code
      const code = `CELO${address.slice(2, 8).toUpperCase()}`;

      if (referralCodes.has(code)) {
        socket.emit('error', { message: 'Referral code already exists' });
        return;
      }

      referralCodes.set(code, address);

      const stats = {
        referralCode: code,
        referralLink: `https://celo-snake.vercel.app/?ref=${code}`,
        totalReferrals: Array.from(referrals.values()).filter(r => r.referrer === address).length,
        totalRewards: '0',
        successfulReferrals: Array.from(referrals.values()).filter(r => r.referrer === address && r.rewarded).length,
        pendingRewards: '0',
      };

      socket.emit('social:referral_code_generated', { stats });
      console.log(`🎁 Referral code generated: ${code} for ${address}`);
    } catch (error) {
      console.error('Error generating referral code:', error);
      socket.emit('error', { message: 'Failed to generate referral code' });
    }
  });

  // SOCIAL: Track Referral
  socket.on('social:track_referral', (data) => {
    try {
      const { code, referee } = data;
      const referrer = referralCodes.get(code);

      if (!referrer) {
        socket.emit('error', { message: 'Invalid referral code' });
        return;
      }

      if (referrer === referee) {
        socket.emit('error', { message: 'Cannot refer yourself' });
        return;
      }

      if (referrals.has(referee)) {
        socket.emit('error', { message: 'Already referred' });
        return;
      }

      const referral = {
        referrer,
        referee,
        code,
        timestamp: Date.now(),
        rewarded: false,
        rewardAmount: '0',
      };

      referrals.set(referee, referral);
      console.log(`🎁 Referral tracked: ${referee} referred by ${referrer} (code: ${code})`);
    } catch (error) {
      console.error('Error tracking referral:', error);
      socket.emit('error', { message: 'Failed to track referral' });
    }
  });

  // SOCIAL: Get Referrals
  socket.on('social:get_referrals', (data) => {
    try {
      const { address } = data;

      const myReferrals = Array.from(referrals.values())
        .filter(r => r.referrer === address);

      const code = Array.from(referralCodes.entries())
        .find(([_, addr]) => addr === address)?.[0] || null;

      const stats = code ? {
        referralCode: code,
        referralLink: `https://celo-snake.vercel.app/?ref=${code}`,
        totalReferrals: myReferrals.length,
        totalRewards: '0',
        successfulReferrals: myReferrals.filter(r => r.rewarded).length,
        pendingRewards: '0',
      } : null;

      socket.emit('social:referrals_list', { referrals: myReferrals, stats });
    } catch (error) {
      console.error('Error getting referrals:', error);
      socket.emit('error', { message: 'Failed to get referrals' });
    }
  });

  // SOCIAL: Send Game Invite
  socket.on('social:send_game_invite', (data) => {
    try {
      const { from, fromNickname, to, toNickname, gameMode, difficulty, betAmount, message } = data;

      const inviteId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const invite = {
        id: inviteId,
        from,
        fromNickname: sanitizeString(fromNickname, 32),
        to,
        toNickname: sanitizeString(toNickname, 32),
        gameMode,
        difficulty,
        betAmount,
        message: message ? sanitizeString(message, 200) : undefined,
        status: 'pending',
        createdAt: Date.now(),
        expiresAt: Date.now() + INVITE_EXPIRY_MS,
      };

      gameInvites.set(inviteId, invite);

      // Notify recipient
      const recipientSocket = playerSockets.get(to);
      if (recipientSocket) {
        io.to(recipientSocket).emit('social:game_invite_received', { invite });
      }

      console.log(`🎮 Game invite sent: ${from} -> ${to}`);
    } catch (error) {
      console.error('Error sending game invite:', error);
      socket.emit('error', { message: 'Failed to send game invite' });
    }
  });

  // SOCIAL: Accept Game Invite
  socket.on('social:accept_game_invite', (data) => {
    try {
      const { inviteId } = data;
      const invite = gameInvites.get(inviteId);

      if (!invite) {
        socket.emit('error', { message: 'Invite not found' });
        return;
      }

      if (Date.now() > invite.expiresAt) {
        socket.emit('error', { message: 'Invite expired' });
        gameInvites.delete(inviteId);
        return;
      }

      invite.status = 'accepted';

      // Notify sender
      const senderSocket = playerSockets.get(invite.from);
      if (senderSocket) {
        io.to(senderSocket).emit('social:game_invite_accepted', { invite });
      }

      console.log(`✅ Game invite accepted: ${inviteId}`);
    } catch (error) {
      console.error('Error accepting game invite:', error);
      socket.emit('error', { message: 'Failed to accept game invite' });
    }
  });

  // SOCIAL: Decline Game Invite
  socket.on('social:decline_game_invite', (data) => {
    try {
      const { inviteId } = data;
      const invite = gameInvites.get(inviteId);

      if (invite) {
        invite.status = 'declined';
        gameInvites.delete(inviteId);
      }

      console.log(`❌ Game invite declined: ${inviteId}`);
    } catch (error) {
      console.error('Error declining game invite:', error);
    }
  });

  // SOCIAL: Get Game Invites
  socket.on('social:get_game_invites', (data) => {
    try {
      const { address } = data;
      const now = Date.now();

      const invites = Array.from(gameInvites.values())
        .filter(inv => inv.to === address && inv.status === 'pending' && inv.expiresAt > now);

      socket.emit('social:game_invites_list', { invites });
    } catch (error) {
      console.error('Error getting game invites:', error);
      socket.emit('error', { message: 'Failed to get game invites' });
    }
  });

  // SOCIAL: Load Profile
  socket.on('social:load_profile', (data) => {
    try {
      const { address } = data;
      const profile = playerProfiles.get(address);

      if (profile) {
        const userFriends = friends.get(address) || new Set();
        socket.emit('social:profile_loaded', {
          profile: {
            address,
            nickname: profile.nickname,
            isOnline: playerSockets.has(address),
            friends: userFriends.size,
            createdAt: profile.createdAt,
            lastActive: profile.lastActive,
          }
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      socket.emit('error', { message: 'Failed to load profile' });
    }
  });

  // ========================================
  // END SOCIAL FEATURES
  // ========================================

  // DISCONNECT
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    handlePlayerLeave(socket.id);

    diceCommits.delete(socket.id);
    const timer = turnTimers.get(socket.id);
    if (timer) {
      clearTimeout(timer);
      turnTimers.delete(socket.id);
    }

    // Remove from online players
    for (const [address, socketId] of playerSockets.entries()) {
      if (socketId === socket.id) {
        playerSockets.delete(address);
        console.log(`👋 ${address} went offline`);
        break;
      }
    }
  });
});

function handlePlayerLeave(socketId) {
  const roomId = playerRooms.get(socketId);
  if (!roomId) return;

  const room = rooms.get(roomId);
  if (!room) return;

  room.players = room.players.filter(p => p.socketId !== socketId);
  playerRooms.delete(socketId);

  if (room.players.length === 0 || room.status === 'waiting') {
    rooms.delete(roomId);
    const timer = turnTimers.get(socketId);
    if (timer) clearTimeout(timer);
  } else {
    if (room.host === getPlayerAddress(socketId, room)) {
      room.host = room.players[0].address;
    }

    io.to(roomId).emit('room:player_left', { room });
    checkGameEnd(roomId);
  }

  io.emit('rooms:updated', { rooms: Array.from(rooms.values()) });
}

function startGame(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.status = 'playing';
  room.boardSeed = `${Date.now()}_${Math.random()}`;
  room.currentTurn = 0;
  room.startedAt = Date.now();

  io.to(roomId).emit('game:started', {
    room,
    boardSeed: room.boardSeed,
  });

  const firstPlayer = room.players[0];
  io.to(roomId).emit('game:turn_started', {
    player: firstPlayer.address,
    turnNumber: 0,
  });

  setTurnTimeout(roomId, firstPlayer.socketId);

  console.log('🎮 Game started in room:', roomId);
}

function nextTurn(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.status !== 'playing') return;

  let nextTurnIndex = (room.currentTurn + 1) % room.players.length;
  let attempts = 0;

  while (attempts < room.players.length) {
    const nextPlayer = room.players[nextTurnIndex];
    if (!nextPlayer.eliminated && !nextPlayer.finishedAt) {
      break;
    }
    nextTurnIndex = (nextTurnIndex + 1) % room.players.length;
    attempts++;
  }

  if (attempts >= room.players.length) {
    checkGameEnd(roomId);
    return;
  }

  room.currentTurn = nextTurnIndex;
  const currentPlayer = room.players[nextTurnIndex];

  io.to(roomId).emit('game:turn_started', {
    player: currentPlayer.address,
    turnNumber: room.currentTurn,
  });

  setTurnTimeout(roomId, currentPlayer.socketId);
}

function setTurnTimeout(roomId, socketId) {
  const existingTimer = turnTimers.get(socketId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'playing') return;

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return;

    console.log(`⏰ Turn timeout for player ${player.address}`);

    player.timeoutCount++;

    if (player.timeoutCount >= 2) {
      player.eliminated = true;
      io.to(roomId).emit('game:player_eliminated', {
        player: player.address,
        reason: 'timeout',
      });

      checkGameEnd(roomId);
    } else {
      io.to(socketId).emit('game:timeout_warning', {
        message: `Turn timeout! ${2 - player.timeoutCount} warnings remaining.`,
      });
    }

    nextTurn(roomId);
  }, TURN_TIMEOUT_MS);

  turnTimers.set(socketId, timer);
}

function checkGameEnd(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const activePlayers = room.players.filter(p => !p.eliminated && !p.finishedAt);

  if (activePlayers.length === 0) {
    room.status = 'finished';

    room.players.forEach(p => {
      const timer = turnTimers.get(p.socketId);
      if (timer) {
        clearTimeout(timer);
        turnTimers.delete(p.socketId);
      }
    });

    const finishedPlayers = room.players.filter(p => p.finishedAt);
    finishedPlayers.sort((a, b) => b.score - a.score);

    io.to(roomId).emit('game:finished', {
      room,
      winners: finishedPlayers.map(p => ({
        address: p.address,
        nickname: p.nickname,
        score: p.score,
      })),
    });

    console.log('🏁 Game finished in room:', roomId);

    setTimeout(() => {
      rooms.delete(roomId);
      io.emit('rooms:updated', { rooms: Array.from(rooms.values()) });
    }, 30000);
  }
}

function getPlayerAddress(socketId, room) {
  return room.players.find(p => p.socketId === socketId)?.address;
}

// Start server
const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`✅ WebSocket server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO endpoint ready`);
  console.log(`🎮 Ready for multiplayer connections!`);
});
