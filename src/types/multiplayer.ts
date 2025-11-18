/**
 * Multiplayer Types and Interfaces
 */

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'master';
export type RoomStatus = 'waiting' | 'playing' | 'finished' | 'cancelled';
export type PrizeModel = 'winner_takes_all' | 'proportional' | 'survival';

export interface Player {
  address: string;
  nickname: string;
  socketId?: string;
  position: number;
  eliminated: boolean;
  finishedAt?: number;
  score: number;
  multiplier: number;
}

export interface Room {
  id: string;
  host: string;
  difficulty: Difficulty;
  betAmount: string;
  maxPlayers: number;
  players: Player[];
  status: RoomStatus;
  currentTurn: number;
  boardSeed: string;
  prizePool?: string;
  createdAt: number;
}

export interface GameMove {
  player: string;
  dice1: number;
  dice2: number;
  newPosition: number;
  timestamp: number;
}

export interface MultiplayerState {
  // Connection
  connected: boolean;
  socket: any | null;
  
  // Rooms
  rooms: Room[];
  currentRoom: Room | null;
  
  // Game state
  isPlaying: boolean;
  currentTurnPlayer: string | null;
  gameHistory: GameMove[];
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  createRoom: (params: CreateRoomParams) => void;
  joinRoom: (roomId: string, address: string, nickname: string) => void;
  leaveRoom: () => void;
  rollDice: (dice1: number, dice2: number) => void;
  eliminatePlayer: () => void;
  finishGame: (score: number) => void;
  fetchRooms: () => void;
}

export interface CreateRoomParams {
  host: string;
  nickname: string;
  difficulty: Difficulty;
  betAmount: string;
  maxPlayers: number;
}

export interface ContractRoom {
  id: bigint;
  host: string;
  difficulty: number;
  betAmount: bigint;
  maxPlayers: bigint;
  currentPlayers: bigint;
  prizeModel: number;
  status: number;
  prizePool: bigint;
}
