/**
 * WebSocket Server for Multiplayer Rooms
 * Vercel Serverless Function with Socket.IO
 */

import { Server as SocketIOServer } from 'socket.io';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage (use Redis in production)
const rooms = new Map();
const playerRooms = new Map();

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
}

interface Player {
  address: string;
  nickname: string;
  socketId: string;
  position: number;
  eliminated: boolean;
  finishedAt?: number;
  score: number;
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
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL 
          : '*',
        methods: ['GET', 'POST'],
      },
    });

    // @ts-ignore
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Create room
      socket.on('room:create', (data: {
        host: string;
        nickname: string;
        difficulty: string;
        betAmount: string;
        maxPlayers: number;
      }) => {
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const room: Room = {
          id: roomId,
          host: data.host,
          difficulty: data.difficulty,
          betAmount: data.betAmount,
          maxPlayers: data.maxPlayers,
          players: [{
            address: data.host,
            nickname: data.nickname,
            socketId: socket.id,
            position: 0,
            eliminated: false,
            score: 0,
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
      });

      // Join room
      socket.on('room:join', (data: {
        roomId: string;
        address: string;
        nickname: string;
      }) => {
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

        const player: Player = {
          address: data.address,
          nickname: data.nickname,
          socketId: socket.id,
          position: 0,
          eliminated: false,
          score: 0,
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
      });

      // Leave room
      socket.on('room:leave', () => {
        const roomId = playerRooms.get(socket.id);
        if (!roomId) return;

        const room = rooms.get(roomId);
        if (!room) return;

        room.players = room.players.filter(p => p.socketId !== socket.id);
        playerRooms.delete(socket.id);
        socket.leave(roomId);

        if (room.players.length === 0) {
          rooms.delete(roomId);
        } else {
          // If host left, assign new host
          if (room.host === getPlayerAddress(socket.id, room)) {
            room.host = room.players[0].address;
          }
          io.to(roomId).emit('room:player_left', { room });
        }

        io.emit('rooms:updated', { rooms: Array.from(rooms.values()) });
      });

      // Roll dice
      socket.on('game:roll', (data: { dice1: number; dice2: number }) => {
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

        // Validate dice
        if (data.dice1 < 1 || data.dice1 > 6 || data.dice2 < 1 || data.dice2 > 6) {
          socket.emit('error', { message: 'Invalid dice values' });
          return;
        }

        const move = data.dice1 + data.dice2;
        player.position += move;

        // Broadcast move to all players in room
        io.to(roomId).emit('game:move_made', {
          player: player.address,
          dice1: data.dice1,
          dice2: data.dice2,
          newPosition: player.position,
        });

        console.log(`Player ${player.address} rolled ${data.dice1}+${data.dice2}, position: ${player.position}`);

        // Move to next turn after delay
        setTimeout(() => {
          nextTurn(roomId);
        }, 2000);
      });

      // Player eliminated
      socket.on('game:eliminated', () => {
        const roomId = playerRooms.get(socket.id);
        if (!roomId) return;

        const room = rooms.get(roomId);
        if (!room) return;

        const player = room.players.find(p => p.socketId === socket.id);
        if (!player) return;

        player.eliminated = true;
        
        io.to(roomId).emit('game:player_eliminated', {
          player: player.address,
        });

        checkGameEnd(roomId);
      });

      // Player finished
      socket.on('game:finished', (data: { score: number }) => {
        const roomId = playerRooms.get(socket.id);
        if (!roomId) return;

        const room = rooms.get(roomId);
        if (!room) return;

        const player = room.players.find(p => p.socketId === socket.id);
        if (!player) return;

        player.score = data.score;
        player.finishedAt = Date.now();

        io.to(roomId).emit('game:player_finished', {
          player: player.address,
          score: data.score,
        });

        checkGameEnd(roomId);
      });

      // Get active rooms
      socket.on('rooms:get', () => {
        socket.emit('rooms:list', { rooms: Array.from(rooms.values()) });
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        const roomId = playerRooms.get(socket.id);
        if (roomId) {
          const room = rooms.get(roomId);
          if (room) {
            room.players = room.players.filter(p => p.socketId !== socket.id);
            
            if (room.players.length === 0 || room.status === 'waiting') {
              rooms.delete(roomId);
            } else {
              io.to(roomId).emit('room:player_disconnected', { 
                room,
                disconnectedPlayer: getPlayerAddress(socket.id, room)
              });
            }
            
            io.emit('rooms:updated', { rooms: Array.from(rooms.values()) });
          }
          
          playerRooms.delete(socket.id);
        }
      });
    });
  }

  res.end();
}

// Helper functions
function startGame(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.status = 'playing';
  room.boardSeed = `${Date.now()}_${Math.random()}`;
  room.currentTurn = 0;

  io.to(roomId).emit('game:started', {
    room,
    boardSeed: room.boardSeed,
  });

  // Start first turn
  const firstPlayer = room.players[0];
  io.to(roomId).emit('game:turn_started', {
    player: firstPlayer.address,
    turnNumber: 0,
  });

  console.log('Game started in room:', roomId);
}

function nextTurn(roomId: string) {
  const room = rooms.get(roomId);
  if (!room || room.status !== 'playing') return;

  // Find next non-eliminated player
  let nextTurnIndex = (room.currentTurn + 1) % room.players.length;
  let attempts = 0;
  
  while (room.players[nextTurnIndex].eliminated && attempts < room.players.length) {
    nextTurnIndex = (nextTurnIndex + 1) % room.players.length;
    attempts++;
  }

  if (attempts >= room.players.length) {
    // All players eliminated
    checkGameEnd(roomId);
    return;
  }

  room.currentTurn = nextTurnIndex;
  const currentPlayer = room.players[nextTurnIndex];

  io.to(roomId).emit('game:turn_started', {
    player: currentPlayer.address,
    turnNumber: room.currentTurn,
  });
}

function checkGameEnd(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const activePlayers = room.players.filter(p => !p.eliminated && !p.finishedAt);
  
  if (activePlayers.length === 0) {
    // Game over
    room.status = 'finished';

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
