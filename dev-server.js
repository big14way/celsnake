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

// In-memory storage
const rooms = new Map();
const playerRooms = new Map();
const diceCommits = new Map();
const turnTimers = new Map();

// Constants
const TURN_TIMEOUT_MS = 60000;
const RATE_LIMIT_ACTIONS = 10;
const RATE_LIMIT_WINDOW = 60000;

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
