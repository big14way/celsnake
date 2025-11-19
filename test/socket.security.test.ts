/**
 * WebSocket Server Security Tests
 * Tests for commit-reveal, rate limiting, and validation
 */

import { describe, it, expect } from '@jest/globals';
import {
  checkRateLimit,
  validateDiceValues,
  createDiceCommit,
  verifyDiceReveal,
  generateSecret,
  validateRoomParams,
  sanitizeString,
} from '../api/utils/security';

describe('Security Utils', () => {
  describe('Rate Limiting', () => {
    it('should allow requests under rate limit', () => {
      const socketId = 'test-socket-1';

      for (let i = 0; i < 10; i++) {
        const limited = checkRateLimit(socketId, 10, 60000);
        expect(limited).toBe(false);
      }
    });

    it('should block requests exceeding rate limit', () => {
      const socketId = 'test-socket-2';

      // Use up the limit
      for (let i = 0; i < 10; i++) {
        checkRateLimit(socketId, 10, 60000);
      }

      // Next request should be blocked
      const limited = checkRateLimit(socketId, 10, 60000);
      expect(limited).toBe(true);
    });

    it('should reset rate limit after window expires', async () => {
      const socketId = 'test-socket-3';
      const windowMs = 100; // Short window for testing

      // Use up the limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit(socketId, 5, windowMs);
      }

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, windowMs + 50));

      // Should allow new requests
      const limited = checkRateLimit(socketId, 5, windowMs);
      expect(limited).toBe(false);
    });
  });

  describe('Commit-Reveal Pattern', () => {
    it('should create consistent hashes for same input', () => {
      const dice1 = 3;
      const dice2 = 5;
      const secret = 'test-secret-123';

      const hash1 = createDiceCommit(dice1, dice2, secret);
      const hash2 = createDiceCommit(dice1, dice2, secret);

      expect(hash1).toBe(hash2);
    });

    it('should create different hashes for different inputs', () => {
      const secret = 'test-secret-123';

      const hash1 = createDiceCommit(1, 1, secret);
      const hash2 = createDiceCommit(6, 6, secret);

      expect(hash1).not.toBe(hash2);
    });

    it('should verify correct reveal', () => {
      const dice1 = 4;
      const dice2 = 2;
      const secret = 'test-secret-456';

      const commitHash = createDiceCommit(dice1, dice2, secret);
      const valid = verifyDiceReveal(commitHash, dice1, dice2, secret);

      expect(valid).toBe(true);
    });

    it('should reject incorrect reveal - wrong dice', () => {
      const secret = 'test-secret-789';

      const commitHash = createDiceCommit(3, 5, secret);
      const valid = verifyDiceReveal(commitHash, 6, 6, secret); // Different dice

      expect(valid).toBe(false);
    });

    it('should reject incorrect reveal - wrong secret', () => {
      const dice1 = 3;
      const dice2 = 5;

      const commitHash = createDiceCommit(dice1, dice2, 'secret1');
      const valid = verifyDiceReveal(commitHash, dice1, dice2, 'secret2'); // Different secret

      expect(valid).toBe(false);
    });

    it('should generate unique secrets', () => {
      const secret1 = generateSecret();
      const secret2 = generateSecret();
      const secret3 = generateSecret();

      expect(secret1).not.toBe(secret2);
      expect(secret2).not.toBe(secret3);
      expect(secret1.length).toBeGreaterThan(0);
    });
  });

  describe('Dice Validation', () => {
    it('should accept valid dice values', () => {
      expect(validateDiceValues(1, 1)).toBe(true);
      expect(validateDiceValues(6, 6)).toBe(true);
      expect(validateDiceValues(3, 4)).toBe(true);
    });

    it('should reject dice values out of range', () => {
      expect(validateDiceValues(0, 3)).toBe(false);
      expect(validateDiceValues(7, 3)).toBe(false);
      expect(validateDiceValues(3, 0)).toBe(false);
      expect(validateDiceValues(3, 7)).toBe(false);
    });

    it('should reject non-integer dice values', () => {
      expect(validateDiceValues(3.5, 2)).toBe(false);
      expect(validateDiceValues(1, 2.5)).toBe(false);
    });
  });

  describe('Room Parameter Validation', () => {
    it('should accept valid room parameters', () => {
      const params = {
        host: '0x1234567890123456789012345678901234567890',
        nickname: 'Player1',
        difficulty: 'medium',
        betAmount: '0.1',
        maxPlayers: 4,
      };

      const result = validateRoomParams(params);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid host address', () => {
      const params = {
        host: '',
        nickname: 'Player1',
        difficulty: 'medium',
        betAmount: '0.1',
        maxPlayers: 4,
      };

      const result = validateRoomParams(params);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('host');
    });

    it('should reject invalid nickname', () => {
      const params = {
        host: '0x1234567890123456789012345678901234567890',
        nickname: 'ThisNicknameIsTooLongAndShouldBeRejected',
        difficulty: 'medium',
        betAmount: '0.1',
        maxPlayers: 4,
      };

      const result = validateRoomParams(params);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('nickname');
    });

    it('should reject invalid difficulty', () => {
      const params = {
        host: '0x1234567890123456789012345678901234567890',
        nickname: 'Player1',
        difficulty: 'impossible',
        betAmount: '0.1',
        maxPlayers: 4,
      };

      const result = validateRoomParams(params);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('difficulty');
    });

    it('should reject invalid max players', () => {
      const params1 = {
        host: '0x1234567890123456789012345678901234567890',
        nickname: 'Player1',
        difficulty: 'medium',
        betAmount: '0.1',
        maxPlayers: 1, // Too few
      };

      const params2 = {
        ...params1,
        maxPlayers: 10, // Too many
      };

      expect(validateRoomParams(params1).valid).toBe(false);
      expect(validateRoomParams(params2).valid).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test');
    });

    it('should limit length', () => {
      const longString = 'a'.repeat(200);
      const sanitized = sanitizeString(longString, 50);
      expect(sanitized.length).toBe(50);
    });

    it('should remove dangerous characters', () => {
      const dangerous = '<script>alert("xss")</script>';
      const sanitized = sanitizeString(dangerous);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    it('should preserve safe characters', () => {
      const safe = 'Player123 (Cool)';
      const sanitized = sanitizeString(safe);
      expect(sanitized).toContain('Player123');
      expect(sanitized).toContain('Cool');
    });
  });
});
