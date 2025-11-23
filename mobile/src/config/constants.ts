// Game Constants
export const GRID_SIZE = 20;
export const CELL_SIZE = 15;
export const INITIAL_SNAKE_LENGTH = 3;
export const GAME_SPEED = 150; // milliseconds

// Network Constants
export const CELO_CHAIN_ID = 42220;
export const CELO_ALFAJORES_CHAIN_ID = 44787;

// API Endpoints
export const API_BASE_URL = process.env.API_BASE_URL || 'https://your-api-url.com';
export const SOCKET_URL = process.env.SOCKET_URL || 'wss://your-socket-url.com';

// Contract Addresses (these should match your deployed contracts)
export const CONTRACT_ADDRESSES = {
  GAME: process.env.GAME_CONTRACT_ADDRESS || '0x...',
  TOURNAMENT: process.env.TOURNAMENT_CONTRACT_ADDRESS || '0x...',
  NFT: process.env.NFT_CONTRACT_ADDRESS || '0x...',
  ACHIEVEMENT: process.env.ACHIEVEMENT_CONTRACT_ADDRESS || '0x...',
  SOCIAL: process.env.SOCIAL_CONTRACT_ADDRESS || '0x...',
};

// WalletConnect Configuration
export const WALLET_CONNECT_PROJECT_ID = process.env.WALLET_CONNECT_PROJECT_ID || '';

// Storage Keys
export const STORAGE_KEYS = {
  WALLET_ADDRESS: 'wallet_address',
  USER_PROFILE: 'user_profile',
  GAME_STATS: 'game_stats',
  ACHIEVEMENTS: 'achievements',
  SETTINGS: 'settings',
  CACHED_GAMES: 'cached_games',
  BIOMETRIC_ENABLED: 'biometric_enabled',
};

// Feature Flags
export const FEATURES = {
  BIOMETRIC_AUTH: true,
  PUSH_NOTIFICATIONS: true,
  OFFLINE_MODE: true,
  HAPTIC_FEEDBACK: true,
  ANALYTICS: true,
};
