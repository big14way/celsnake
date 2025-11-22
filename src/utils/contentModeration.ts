/**
 * Content Moderation Utilities
 * Provides profanity filtering, spam detection, and message validation
 */

import type { ModerationFilter } from '../types/social';

// Common profanity words (basic list - extend as needed)
const PROFANITY_LIST = [
  'badword1',
  'badword2',
  // Add more as needed, but keep this list configurable
];

// Default moderation settings
export const DEFAULT_MODERATION_FILTER: ModerationFilter = {
  profanityFilter: true,
  spamFilter: true,
  maxMessageLength: 500,
  minMessageInterval: 1000, // 1 second between messages
  bannedWords: PROFANITY_LIST,
};

// Track message timestamps per user
const messageTimestamps: Map<string, number[]> = new Map();

/**
 * Check if message contains profanity
 */
export const containsProfanity = (message: string, bannedWords: string[]): boolean => {
  const lowerMessage = message.toLowerCase();

  for (const word of bannedWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerMessage)) {
      return true;
    }
  }

  return false;
};

/**
 * Filter profanity from message
 */
export const filterProfanity = (message: string, bannedWords: string[]): string => {
  let filtered = message;

  for (const word of bannedWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  }

  return filtered;
};

/**
 * Detect spam patterns
 */
export const isSpam = (message: string, userId: string, filter: ModerationFilter): boolean => {
  // Check message length
  if (message.length > filter.maxMessageLength) {
    return true;
  }

  // Check for repeated characters (e.g., "aaaaaaa")
  const repeatedCharsRegex = /(.)\1{9,}/;
  if (repeatedCharsRegex.test(message)) {
    return true;
  }

  // Check for excessive caps (more than 70% uppercase)
  const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
  if (capsRatio > 0.7 && message.length > 10) {
    return true;
  }

  // Check message frequency
  const now = Date.now();
  const userMessages = messageTimestamps.get(userId) || [];

  // Remove old timestamps (older than 10 seconds)
  const recentMessages = userMessages.filter((timestamp) => now - timestamp < 10000);

  // Check if too many messages in short time
  if (recentMessages.length >= 5) {
    return true;
  }

  // Check minimum interval between messages
  if (recentMessages.length > 0) {
    const lastMessage = recentMessages[recentMessages.length - 1];
    if (now - lastMessage < filter.minMessageInterval) {
      return true;
    }
  }

  // Update timestamps
  recentMessages.push(now);
  messageTimestamps.set(userId, recentMessages);

  return false;
};

/**
 * Validate message content
 */
export const validateMessage = (
  message: string,
  userId: string,
  filter: ModerationFilter = DEFAULT_MODERATION_FILTER
): { valid: boolean; reason?: string; filtered?: string } => {
  // Check if empty
  if (!message || message.trim().length === 0) {
    return { valid: false, reason: 'Message cannot be empty' };
  }

  // Check length
  if (message.length > filter.maxMessageLength) {
    return {
      valid: false,
      reason: `Message too long (max ${filter.maxMessageLength} characters)`,
    };
  }

  // Check for spam
  if (filter.spamFilter && isSpam(message, userId, filter)) {
    return { valid: false, reason: 'Message detected as spam' };
  }

  // Check for profanity
  if (filter.profanityFilter && containsProfanity(message, filter.bannedWords)) {
    return {
      valid: true,
      filtered: filterProfanity(message, filter.bannedWords),
    };
  }

  return { valid: true, filtered: message };
};

/**
 * Validate nickname
 */
export const validateNickname = (nickname: string): { valid: boolean; reason?: string } => {
  // Check length
  if (nickname.length < 2) {
    return { valid: false, reason: 'Nickname too short (min 2 characters)' };
  }

  if (nickname.length > 32) {
    return { valid: false, reason: 'Nickname too long (max 32 characters)' };
  }

  // Check for valid characters (alphanumeric, spaces, dashes, underscores)
  const validCharsRegex = /^[a-zA-Z0-9\s\-_]+$/;
  if (!validCharsRegex.test(nickname)) {
    return {
      valid: false,
      reason: 'Nickname contains invalid characters (only letters, numbers, spaces, dashes, and underscores allowed)',
    };
  }

  // Check for profanity
  if (containsProfanity(nickname, PROFANITY_LIST)) {
    return { valid: false, reason: 'Nickname contains inappropriate content' };
  }

  return { valid: true };
};

/**
 * Validate bio text
 */
export const validateBio = (bio: string): { valid: boolean; reason?: string } => {
  const maxBioLength = 200;

  if (bio.length > maxBioLength) {
    return { valid: false, reason: `Bio too long (max ${maxBioLength} characters)` };
  }

  // Check for profanity
  if (containsProfanity(bio, PROFANITY_LIST)) {
    return { valid: false, reason: 'Bio contains inappropriate content' };
  }

  return { valid: true };
};

/**
 * Sanitize HTML to prevent XSS
 */
export const sanitizeHTML = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Format message for display
 */
export const formatMessage = (message: string): string => {
  // Sanitize HTML
  const sanitized = sanitizeHTML(message);

  // Convert URLs to links (simple implementation)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const withLinks = sanitized.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

  return withLinks;
};

/**
 * Clear message history for a user (called when user logs out)
 */
export const clearMessageHistory = (userId: string): void => {
  messageTimestamps.delete(userId);
};

/**
 * Get rate limit info for user
 */
export const getRateLimitInfo = (userId: string): {
  messagesInLast10s: number;
  canSendMessage: boolean;
  waitTime: number;
} => {
  const now = Date.now();
  const userMessages = messageTimestamps.get(userId) || [];
  const recentMessages = userMessages.filter((timestamp) => now - timestamp < 10000);

  const canSendMessage = recentMessages.length < 5;
  const waitTime = recentMessages.length > 0
    ? Math.max(0, DEFAULT_MODERATION_FILTER.minMessageInterval - (now - recentMessages[recentMessages.length - 1]))
    : 0;

  return {
    messagesInLast10s: recentMessages.length,
    canSendMessage,
    waitTime,
  };
};
