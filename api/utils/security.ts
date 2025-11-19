/**
 * Security utilities for multiplayer game
 * - Commit-reveal pattern for dice rolls
 * - Rate limiting
 * - Input validation
 */

import { createHash, randomBytes } from 'crypto';

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiting middleware
 * @param socketId - Socket ID to track
 * @param limit - Max actions per window
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limit exceeded
 */
export function checkRateLimit(
  socketId: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(socketId);

  if (!record || now > record.resetAt) {
    // New window
    rateLimitMap.set(socketId, {
      count: 1,
      resetAt: now + windowMs,
    });
    return false;
  }

  if (record.count >= limit) {
    // Rate limit exceeded
    return true;
  }

  // Increment count
  record.count++;
  return false;
}

/**
 * Clean up old rate limit records
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);

/**
 * Commit-reveal pattern for dice rolls
 */

export interface DiceCommit {
  socketId: string;
  commitHash: string;
  timestamp: number;
}

export interface DiceReveal {
  dice1: number;
  dice2: number;
  secret: string;
}

/**
 * Generate a commit hash for dice values
 * @param dice1 - First dice value
 * @param dice2 - Second dice value
 * @param secret - Random secret string
 * @returns Hash of dice values + secret
 */
export function createDiceCommit(dice1: number, dice2: number, secret: string): string {
  const data = `${dice1}:${dice2}:${secret}`;
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Verify dice reveal matches commit
 * @param commitHash - Original commit hash
 * @param dice1 - Revealed first dice
 * @param dice2 - Revealed second dice
 * @param secret - Revealed secret
 * @returns true if reveal matches commit
 */
export function verifyDiceReveal(
  commitHash: string,
  dice1: number,
  dice2: number,
  secret: string
): boolean {
  const computedHash = createDiceCommit(dice1, dice2, secret);
  return computedHash === commitHash;
}

/**
 * Generate random secret for commit-reveal
 * @returns Random hex string
 */
export function generateSecret(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Validate dice values are within bounds
 * @param dice1 - First dice value
 * @param dice2 - Second dice value
 * @returns true if valid
 */
export function validateDiceValues(dice1: number, dice2: number): boolean {
  return (
    Number.isInteger(dice1) &&
    Number.isInteger(dice2) &&
    dice1 >= 1 &&
    dice1 <= 6 &&
    dice2 >= 1 &&
    dice2 <= 6
  );
}

/**
 * Validate room parameters
 */
export function validateRoomParams(params: any): { valid: boolean; error?: string } {
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

/**
 * Sanitize user input
 */
export function sanitizeString(input: string, maxLength: number = 100): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Basic XSS prevention
}
