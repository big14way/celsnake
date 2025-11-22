/**
 * Social Features Types and Interfaces
 *
 * Defines data structures for friend system, chat, social feed,
 * referrals, and other social networking features
 */

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';
export type ChatType = 'global' | 'friend' | 'room';
export type ActivityType = 'win' | 'achievement' | 'tournament_win' | 'milestone' | 'referral';

// Friend System
export interface FriendRequest {
  id: string;
  from: string;
  fromNickname: string;
  to: string;
  toNickname: string;
  status: FriendRequestStatus;
  createdAt: number;
  respondedAt?: number;
}

export interface Friend {
  address: string;
  nickname: string;
  addedAt: number;
  lastOnline?: number;
  isOnline: boolean;
  totalGames?: number;
  totalWins?: number;
}

// Chat System
export interface ChatMessage {
  id: string;
  from: string;
  fromNickname: string;
  to?: string; // For friend chat
  roomId?: string; // For room chat
  type: ChatType;
  message: string;
  timestamp: number;
  read?: boolean;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  messages: ChatMessage[];
  unreadCount: number;
  lastMessage?: ChatMessage;
  createdAt: number;
}

// Social Feed
export interface SocialActivity {
  id: string;
  type: ActivityType;
  player: string;
  playerNickname: string;
  data: ActivityData;
  timestamp: number;
  likes: number;
  comments: Comment[];
  shares: number;
}

export interface ActivityData {
  // For wins
  winAmount?: string;
  multiplier?: number;
  difficulty?: string;

  // For achievements
  achievementId?: number;
  achievementName?: string;
  achievementTier?: string;

  // For tournaments
  tournamentId?: string;
  tournamentName?: string;
  placement?: number;
  prizeWon?: string;

  // For milestones
  milestone?: string;
  value?: number;

  // For referrals
  referredPlayer?: string;
  referralReward?: string;
}

export interface Comment {
  id: string;
  from: string;
  fromNickname: string;
  message: string;
  timestamp: number;
}

// Referral System
export interface Referral {
  code: string;
  referrer: string;
  referrerNickname: string;
  referee?: string;
  refereeNickname?: string;
  status: 'pending' | 'completed' | 'rewarded';
  rewardAmount?: string;
  createdAt: number;
  completedAt?: number;
}

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalRewards: string;
  pendingRewards: string;
  referralCode: string;
  referralLink: string;
}

// Player Profile (Enhanced)
export interface PlayerProfile {
  address: string;
  nickname: string;
  avatar?: string;
  bio?: string;

  // Game Stats
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  totalEarnings: string;
  biggestWin: string;

  // Social Stats
  friends: number;
  achievements: number;
  tournamentsWon: number;
  referrals: number;

  // Activity
  joinedAt: number;
  lastActive: number;
  isOnline: boolean;

  // Privacy
  isPrivate: boolean;
  allowFriendRequests: boolean;
  showOnLeaderboard: boolean;
}

// Social Settings
export interface SocialSettings {
  allowFriendRequests: boolean;
  allowGameInvites: boolean;
  showOnlineStatus: boolean;
  allowMessagesFrom: 'everyone' | 'friends' | 'none';
  notifyOnFriendRequest: boolean;
  notifyOnMessage: boolean;
  notifyOnGameInvite: boolean;
  shareWinsAutomatically: boolean;
}

// Game Invites
export interface GameInvite {
  id: string;
  from: string;
  fromNickname: string;
  to: string;
  toNickname: string;
  roomId?: string;
  gameMode: 'single' | 'multi' | 'tournament';
  difficulty?: string;
  betAmount?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: number;
  expiresAt: number;
}

// Social State (Zustand Store)
export interface SocialState {
  // Friends
  friends: Friend[];
  friendRequests: FriendRequest[];
  blockedUsers: string[];

  // Chat
  chatRooms: ChatRoom[];
  globalMessages: ChatMessage[];
  unreadMessages: number;

  // Social Feed
  activities: SocialActivity[];

  // Referrals
  myReferralStats: ReferralStats | null;
  referrals: Referral[];

  // Game Invites
  gameInvites: GameInvite[];

  // Profile
  myProfile: PlayerProfile | null;
  settings: SocialSettings;

  // Friend Actions
  sendFriendRequest: (to: string, toNickname: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  removeFriend: (address: string) => void;
  blockUser: (address: string) => void;
  unblockUser: (address: string) => void;

  // Chat Actions
  sendMessage: (type: ChatType, message: string, to?: string, roomId?: string) => void;
  markMessagesAsRead: (chatRoomId: string) => void;
  loadChatHistory: (chatRoomId: string) => void;

  // Social Feed Actions
  postActivity: (activity: Omit<SocialActivity, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares'>) => void;
  likeActivity: (activityId: string) => void;
  commentOnActivity: (activityId: string, message: string) => void;
  shareActivity: (activityId: string, platform: SharePlatform) => void;

  // Referral Actions
  generateReferralCode: () => void;
  trackReferral: (code: string, referee: string) => void;
  claimReferralReward: (referralId: string) => void;

  // Game Invite Actions
  sendGameInvite: (invite: Omit<GameInvite, 'id' | 'createdAt' | 'expiresAt' | 'status'>) => void;
  acceptGameInvite: (inviteId: string) => void;
  declineGameInvite: (inviteId: string) => void;

  // Profile Actions
  updateProfile: (updates: Partial<PlayerProfile>) => void;
  updateSettings: (updates: Partial<SocialSettings>) => void;
  loadProfile: (address: string) => void;

  // Utility Actions
  fetchFriends: () => void;
  fetchFriendRequests: () => void;
  fetchActivities: () => void;
  fetchReferrals: () => void;
  fetchGameInvites: () => void;
}

// Share Platform Types
export type SharePlatform = 'twitter' | 'discord' | 'telegram' | 'whatsapp' | 'copy';

export interface ShareData {
  title: string;
  text: string;
  url: string;
  platform: SharePlatform;
}

// Content Moderation
export interface ModerationFilter {
  profanityFilter: boolean;
  spamFilter: boolean;
  maxMessageLength: number;
  minMessageInterval: number; // milliseconds
  bannedWords: string[];
}

export interface ModerationAction {
  type: 'warning' | 'mute' | 'ban';
  user: string;
  reason: string;
  duration?: number; // milliseconds
  timestamp: number;
  moderator: string;
}
