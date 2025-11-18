/**
 * Multiplayer State Management with Zustand
 */

import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import type { MultiplayerState, Room, GameMove, CreateRoomParams } from '../types/multiplayer';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  // Initial state
  connected: false,
  socket: null,
  rooms: [],
  currentRoom: null,
  isPlaying: false,
  currentTurnPlayer: null,
  gameHistory: [],

  // Connect to WebSocket server
  connect: () => {
    const socket: Socket = io(SOCKET_URL, {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to multiplayer server');
      set({ connected: true, socket });
      get().fetchRooms();
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from multiplayer server');
      set({ connected: false });
    });

    // Room events
    socket.on('room:created', ({ room }: { room: Room }) => {
      console.log('Room created:', room);
      set({ currentRoom: room });
      get().fetchRooms();
    });

    socket.on('room:player_joined', ({ room }: { room: Room }) => {
      console.log('Player joined:', room);
      set({ currentRoom: room });
      get().fetchRooms();
    });

    socket.on('room:player_left', ({ room }: { room: Room }) => {
      console.log('Player left:', room);
      set({ currentRoom: room });
      get().fetchRooms();
    });

    socket.on('rooms:updated', ({ rooms }: { rooms: Room[] }) => {
      set({ rooms: rooms.filter(r => r.status === 'waiting') });
    });

    socket.on('rooms:list', ({ rooms }: { rooms: Room[] }) => {
      set({ rooms: rooms.filter(r => r.status === 'waiting') });
    });

    // Game events
    socket.on('game:started', ({ room, boardSeed }: { room: Room; boardSeed: string }) => {
      console.log('Game started:', room, boardSeed);
      set({ 
        currentRoom: room, 
        isPlaying: true,
        gameHistory: [],
      });
    });

    socket.on('game:turn_started', ({ player }: { player: string }) => {
      console.log('Turn started for:', player);
      set({ currentTurnPlayer: player });
    });

    socket.on('game:move_made', (move: GameMove) => {
      console.log('Move made:', move);
      set(state => ({
        gameHistory: [...state.gameHistory, { ...move, timestamp: Date.now() }],
      }));
    });

    socket.on('game:player_eliminated', ({ player }: { player: string }) => {
      console.log('Player eliminated:', player);
      const currentRoom = get().currentRoom;
      if (currentRoom) {
        const updatedPlayers = currentRoom.players.map(p =>
          p.address === player ? { ...p, eliminated: true } : p
        );
        set({ currentRoom: { ...currentRoom, players: updatedPlayers } });
      }
    });

    socket.on('game:player_finished', ({ player, score }: { player: string; score: number }) => {
      console.log('Player finished:', player, score);
      const currentRoom = get().currentRoom;
      if (currentRoom) {
        const updatedPlayers = currentRoom.players.map(p =>
          p.address === player 
            ? { ...p, score, finishedAt: Date.now() } 
            : p
        );
        set({ currentRoom: { ...currentRoom, players: updatedPlayers } });
      }
    });

    socket.on('game:finished', ({ room, winners }: { room: Room; winners: any[] }) => {
      console.log('Game finished:', room, winners);
      set({ 
        currentRoom: room, 
        isPlaying: false,
        currentTurnPlayer: null,
      });
    });

    // Error handling
    socket.on('error', ({ message }: { message: string }) => {
      console.error('Socket error:', message);
      alert(`Error: ${message}`);
    });

    set({ socket });
  },

  // Disconnect from server
  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ 
        socket: null, 
        connected: false,
        currentRoom: null,
        isPlaying: false,
      });
    }
  },

  // Create a new room
  createRoom: (params: CreateRoomParams) => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }

    socket.emit('room:create', params);
  },

  // Join an existing room
  joinRoom: (roomId: string, address: string, nickname: string) => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }

    socket.emit('room:join', { roomId, address, nickname });
  },

  // Leave current room
  leaveRoom: () => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }

    socket.emit('room:leave');
    set({ 
      currentRoom: null, 
      isPlaying: false,
      currentTurnPlayer: null,
      gameHistory: [],
    });
  },

  // Roll dice (player's turn)
  rollDice: (dice1: number, dice2: number) => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }

    socket.emit('game:roll', { dice1, dice2 });
  },

  // Mark player as eliminated
  eliminatePlayer: () => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }

    socket.emit('game:eliminated');
  },

  // Finish game with final score
  finishGame: (score: number) => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }

    socket.emit('game:finished', { score });
  },

  // Fetch list of active rooms
  fetchRooms: () => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }

    socket.emit('rooms:get');
  },
}));
