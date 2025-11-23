export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  gameOver: boolean;
  isPaused: boolean;
}

export interface GameStats {
  highScore: number;
  totalGames: number;
  totalScore: number;
  averageScore: number;
  wins: number;
  losses: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export interface PlayerProfile {
  address: string;
  username: string;
  stats: GameStats;
  achievements: Achievement[];
  friends: string[];
  createdAt: number;
}
