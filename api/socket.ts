/**
 * Enhanced WebSocket Server for Multiplayer Rooms
 * Vercel Serverless Function with Socket.IO
 *
 * Security Features:
 * - Commit-reveal pattern for dice rolls
 * - Rate limiting per socket
 * - Server-side move validation
 * - Turn timeout enforcement
 * - Input sanitization and validation
 */

import { Server as SocketIOServer } from 'socket.io';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  checkRateLimit,
  validateDiceValues,
  verifyDiceReveal,
  validateRoomParams,
  sanitizeString,
  DiceCommit,
} from './utils/security';
import {
  validateMove,
  hasWon,
  isLosingPosition,
  calculateScore,
} from './utils/gameValidation';

// In-memory storage (use Redis/KV in production for persistence)
const rooms = new Map<string, Room>();
const playerRooms = new Map<string, string>();
const diceCommits = new Map<string, DiceCommit>(); // Store commits per player
const turnTimers = new Map<string, NodeJS.Timeout>(); // Turn timeout timers

// Constants
const TURN_TIMEOUT_MS = 60000; // 60 seconds
const RATE_LIMIT_ACTIONS = 10; // Max 10 actions per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute

// Room state interface
interface Room {
  id: string;
  host: string;
  difficulty: string;
  betAmount: string;
  maxPlayers: number;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  currentTurn: number;
  boardSeed: string;
  createdAt: number;
  startedAt?: number;
}

interface Player {
  address: string;
  nickname: string;
  socketId: string;
  position: number;
  eliminated: boolean;
  finishedAt?: number;
  score: number;
  timeoutCount: number; // Track timeout violations
}

// Initialize Socket.IO
let io: SocketIOServer;

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!io) {
    // @ts-ignore
    io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*', // Allow all origins in development, restrict in production
        methods: ['GET', 'POST'],
        credentials: true,
      },
      // Connection limits
      pingTimeout: 20000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6, // 1MB max message size
    });

    // @ts-ignore
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // ===== CREATE ROOM =====
      socket.on('room:create', (data: {
        host: string;
        nickname: string;
        difficulty: string;
        betAmount: string;
        maxPlayers: number;
      }) => {
        try {
          // Rate limiting
          if (checkRateLimit(socket.id, RATE_LIMIT_ACTIONS, RATE_LIMIT_WINDOW)) {
            socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' });
            return;
          }

          // Validate input
          const validation = validateRoomParams(data);
          if (!validation.valid) {
            socket.emit('error', { message: validation.error });
            return;
          }

          const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          const room: Room = {
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

          console.log('Room created:', roomId);
        } catch (error) {
          console.error('Error creating room:', error);
          socket.emit('error', { message: 'Failed to create room' });
        }
      });

      // ===== JOIN ROOM =====
      socket.on('room:join', (data: {
        roomId: string;
        address: string;
        nickname: string;
      }) => {
        try {
          // Rate limiting
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

          // Check if player already in room
          if (room.players.some(p => p.address === data.address)) {
            socket.emit('error', { message: 'Already in room' });
            return;
          }

          const player: Player = {
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

          console.log(`Player ${data.address} joined room ${data.roomId}`);

          // Auto-start if room is full
          if (room.players.length === room.maxPlayers) {
            startGame(data.roomId);
          }
        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // ===== LEAVE ROOM =====
      socket.on('room:leave', () => {
        handlePlayerLeave(socket.id);
      });

      // ===== COMMIT DICE ROLL (Phase 1) =====
      socket.on('game:dice_commit', (data: { commitHash: string }) => {
        try {
          // Rate limiting
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

          // Validate it's this player's turn
          const currentPlayer = room.players[room.currentTurn];
          if (currentPlayer.socketId !== socket.id) {
            socket.emit('error', { message: 'Not your turn' });
            return;
          }

          // Store commit
          diceCommits.set(socket.id, {
            socketId: socket.id,
            commitHash: data.commitHash,
            timestamp: Date.now(),
          });

          // Acknowledge commit received
          socket.emit('game:commit_received', { success: true });

          console.log(`Commit received from ${player.address}`);
        } catch (error) {
          console.error('Error processing commit:', error);
          socket.emit('error', { message: 'Failed to process commit' });
        }
      });

      // ===== REVEAL DICE ROLL (Phase 2) =====
      socket.on('game:dice_reveal', (data: { dice1: number; dice2: number; secret: string }) => {
        try {
          // Rate limiting
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

          // Validate it's this player's turn
          const currentPlayer = room.players[room.currentTurn];
          if (currentPlayer.socketId !== socket.id) {
            socket.emit('error', { message: 'Not your turn' });
            return;
          }

          // Get commit
          const commit = diceCommits.get(socket.id);
          if (!commit) {
            socket.emit('error', { message: 'No commit found. Must commit before reveal.' });
            return;
          }

          // Verify commit is recent (within 5 minutes)
          if (Date.now() - commit.timestamp > 5 * 60 * 1000) {
            diceCommits.delete(socket.id);
            socket.emit('error', { message: 'Commit expired. Please roll again.' });
            return;
          }

          // Validate dice values
          if (!validateDiceValues(data.dice1, data.dice2)) {
            socket.emit('error', { message: 'Invalid dice values' });
            return;
          }

          // Verify reveal matches commit
          if (!verifyDiceReveal(commit.commitHash, data.dice1, data.dice2, data.secret)) {
            console.error(`Cheating detected from ${player.address}: reveal doesn't match commit`);
            socket.emit('error', { message: 'Invalid reveal: does not match commit' });

            // Eliminate cheating player
            player.eliminated = true;
            io.to(roomId).emit('game:player_eliminated', {
              player: player.address,
              reason: 'cheating',
            });

            diceCommits.delete(socket.id);
            checkGameEnd(roomId);
            return;
          }

          // Clear commit
          diceCommits.delete(socket.id);

          // Clear turn timer
          const timer = turnTimers.get(socket.id);
          if (timer) {
            clearTimeout(timer);
            turnTimers.delete(socket.id);
          }

          // Calculate move
          const move = data.dice1 + data.dice2;
          const oldPosition = player.position;
          let newPosition = oldPosition + move;

          // Validate move server-side
          const validation = validateMove(
            oldPosition,
            move,
            newPosition,
            room.boardSeed,
            room.difficulty
          );

          if (!validation.valid) {
            console.error(`Invalid move from ${player.address}: ${validation.message}`);
            // Use server-calculated position
            newPosition = validation.actualPosition;
          } else {
            newPosition = validation.actualPosition;
          }

          player.position = newPosition;

          // Check for losing position
          if (isLosingPosition(newPosition, room.boardSeed, room.difficulty)) {
            player.eliminated = true;
            io.to(roomId).emit('game:player_eliminated', {
              player: player.address,
              reason: 'eliminated',
            });
          }

          // Check for win
          if (hasWon(newPosition)) {
            player.finishedAt = Date.now();
            player.score = calculateScore(newPosition, Date.now(), room.startedAt || Date.now());

            io.to(roomId).emit('game:player_finished', {
              player: player.address,
              score: player.score,
            });
          }

          // Broadcast move to all players in room
          io.to(roomId).emit('game:move_made', {
            player: player.address,
            dice1: data.dice1,
            dice2: data.dice2,
            newPosition: newPosition,
          });

          console.log(`Player ${player.address} rolled ${data.dice1}+${data.dice2}, position: ${oldPosition} -> ${newPosition}`);

          // Check if game ended
          if (player.eliminated || player.finishedAt) {
            checkGameEnd(roomId);
          }

          // Move to next turn after delay
          setTimeout(() => {
            nextTurn(roomId);
          }, 2000);
        } catch (error) {
          console.error('Error processing reveal:', error);
          socket.emit('error', { message: 'Failed to process reveal' });
        }
      });

      // ===== GET ACTIVE ROOMS =====
      socket.on('rooms:get', () => {
        socket.emit('rooms:list', { rooms: Array.from(rooms.values()) });
      });

      // ===== DISCONNECT =====
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        handlePlayerLeave(socket.id);

        // Clean up
        diceCommits.delete(socket.id);
        const timer = turnTimers.get(socket.id);
        if (timer) {
          clearTimeout(timer);
          turnTimers.delete(socket.id);
        }
      });
    });
  }

  res.end();
}

// ===== HELPER FUNCTIONS =====

function handlePlayerLeave(socketId: string) {
  const roomId = playerRooms.get(socketId);
  if (!roomId) return;

  const room = rooms.get(roomId);
  if (!room) return;

  room.players = room.players.filter(p => p.socketId !== socketId);
  playerRooms.delete(socketId);

  if (room.players.length === 0 || room.status === 'waiting') {
    // Delete empty room or waiting room
    rooms.delete(roomId);
    const timer = turnTimers.get(socketId);
    if (timer) clearTimeout(timer);
  } else {
    // Game in progress
    if (room.host === getPlayerAddress(socketId, room)) {
      // Assign new host
      room.host = room.players[0].address;
    }

    io.to(roomId).emit('room:player_left', { room });

    // Check if game should end
    checkGameEnd(roomId);
  }

  io.emit('rooms:updated', { rooms: Array.from(rooms.values()) });
}

function startGame(roomId: string) {
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

  // Start first turn with timeout
  const firstPlayer = room.players[0];
  io.to(roomId).emit('game:turn_started', {
    player: firstPlayer.address,
    turnNumber: 0,
  });

  // Set turn timeout
  setTurnTimeout(roomId, firstPlayer.socketId);

  console.log('Game started in room:', roomId);
}

function nextTurn(roomId: string) {
  const room = rooms.get(roomId);
  if (!room || room.status !== 'playing') return;

  // Find next non-eliminated, non-finished player
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
    // All players eliminated or finished
    checkGameEnd(roomId);
    return;
  }

  room.currentTurn = nextTurnIndex;
  const currentPlayer = room.players[nextTurnIndex];

  io.to(roomId).emit('game:turn_started', {
    player: currentPlayer.address,
    turnNumber: room.currentTurn,
  });

  // Set turn timeout
  setTurnTimeout(roomId, currentPlayer.socketId);
}

function setTurnTimeout(roomId: string, socketId: string) {
  // Clear any existing timer
  const existingTimer = turnTimers.get(socketId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  // Set new timeout
  const timer = setTimeout(() => {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'playing') return;

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return;

    console.log(`Turn timeout for player ${player.address}`);

    player.timeoutCount++;

    // After 2 timeouts, eliminate player
    if (player.timeoutCount >= 2) {
      player.eliminated = true;
      io.to(roomId).emit('game:player_eliminated', {
        player: player.address,
        reason: 'timeout',
      });

      checkGameEnd(roomId);
    } else {
      // Warning
      io.to(socketId).emit('game:timeout_warning', {
        message: `Turn timeout! ${2 - player.timeoutCount} warnings remaining.`,
      });
    }

    // Move to next turn
    nextTurn(roomId);
  }, TURN_TIMEOUT_MS);

  turnTimers.set(socketId, timer);
}

function checkGameEnd(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const activePlayers = room.players.filter(p => !p.eliminated && !p.finishedAt);

  if (activePlayers.length === 0) {
    // Game over
    room.status = 'finished';

    // Clear all timers
    room.players.forEach(p => {
      const timer = turnTimers.get(p.socketId);
      if (timer) {
        clearTimeout(timer);
        turnTimers.delete(p.socketId);
      }
    });

    // Find winners (highest scores among finished players)
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

    console.log('Game finished in room:', roomId);

    // Clean up room after delay
    setTimeout(() => {
      rooms.delete(roomId);
      io.emit('rooms:updated', { rooms: Array.from(rooms.values()) });
    }, 30000);
  }
}

function getPlayerAddress(socketId: string, room: Room): string | undefined {
  return room.players.find(p => p.socketId === socketId)?.address;
}

// Export config for Vercel
export const config = {
  api: {
    bodyParser: false,
  },
};
