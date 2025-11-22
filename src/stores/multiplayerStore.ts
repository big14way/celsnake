/**
 * Multiplayer State Management with Zustand
 * Enhanced with commit-reveal pattern and toast notifications
 */

import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import type { MultiplayerState, Room, GameMove, CreateRoomParams } from '../types/multiplayer';
import { rollAndCommitDice } from '../utils/diceCommitReveal';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

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
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to multiplayer server');
      set({ connected: true, socket });
      // Expose socket globally for socialStore
      (window as any).multiplayerSocket = socket;
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
      toast.error(message || 'An error occurred');
    });

    // Commit received acknowledgment
    socket.on('game:commit_received', () => {
      console.log('Commit received by server');
    });

    // Timeout warning
    socket.on('game:timeout_warning', ({ message }: { message: string }) => {
      toast(message, { icon: '⚠️', duration: 5000 });
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

  // Roll dice with commit-reveal pattern
  rollDice: async () => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    try {
      // Phase 1: Generate dice and commit
      const { dice1, dice2, secret, commitHash } = await rollAndCommitDice();

      console.log('Committing dice roll...');

      // Send commit to server
      socket.emit('game:dice_commit', { commitHash });

      // Wait for commit acknowledgment (with timeout)
      const commitAck = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 5000);

        socket.once('game:commit_received', () => {
          clearTimeout(timeout);
          resolve(true);
        });
      });

      if (!commitAck) {
        toast.error('Commit timeout. Please try again.');
        return;
      }

      // Phase 2: Reveal dice values
      console.log('Revealing dice roll...');
      socket.emit('game:dice_reveal', { dice1, dice2, secret });

      toast.success(`Rolled ${dice1} + ${dice2} = ${dice1 + dice2}`);
    } catch (error) {
      console.error('Error rolling dice:', error);
      toast.error('Failed to roll dice');
    }
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
