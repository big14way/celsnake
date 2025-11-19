/**
 * Game Validation Tests
 * Tests for server-side move validation
 */

import { describe, it, expect } from '@jest/globals';
import {
  validateMove,
  hasWon,
  calculateScore,
  generateBoardFromSeed,
} from '../api/utils/gameValidation';

describe('Game Validation', () => {
  describe('Board Generation', () => {
    it('should generate consistent boards from same seed', () => {
      const seed = 'test-seed-123';
      const difficulty = 'medium';

      const board1 = generateBoardFromSeed(seed, difficulty);
      const board2 = generateBoardFromSeed(seed, difficulty);

      expect(board1.snakes).toEqual(board2.snakes);
      expect(board1.ladders).toEqual(board2.ladders);
    });

    it('should generate different boards from different seeds', () => {
      const difficulty = 'medium';

      const board1 = generateBoardFromSeed('seed1', difficulty);
      const board2 = generateBoardFromSeed('seed2', difficulty);

      expect(board1.snakes).not.toEqual(board2.snakes);
    });

    it('should generate correct number of snakes/ladders for difficulty', () => {
      const seed = 'test-seed';

      const easy = generateBoardFromSeed(seed, 'easy');
      const medium = generateBoardFromSeed(seed, 'medium');
      const hard = generateBoardFromSeed(seed, 'hard');

      expect(easy.snakes.length).toBeLessThan(medium.snakes.length);
      expect(medium.snakes.length).toBeLessThan(hard.snakes.length);
      expect(easy.ladders.length).toBeGreaterThan(hard.ladders.length);
    });
  });

  describe('Move Validation', () => {
    it('should validate simple forward move', () => {
      const result = validateMove(0, 5, 5, 'test-seed', 'medium');

      expect(result.valid).toBe(true);
      expect(result.actualPosition).toBe(5);
    });

    it('should prevent moves beyond 100', () => {
      const result = validateMove(98, 5, 98, 'test-seed', 'medium');

      expect(result.valid).toBe(true);
      expect(result.actualPosition).toBe(98); // Should stay at 98
    });

    it('should reject invalid dice roll', () => {
      const result = validateMove(10, 13, 23, 'test-seed', 'medium');

      expect(result.valid).toBe(false);
    });

    it('should reject invalid current position', () => {
      const result = validateMove(-5, 5, 0, 'test-seed', 'medium');

      expect(result.valid).toBe(false);
    });

    it('should calculate move correctly with snake', () => {
      const seed = 'snake-test';
      const board = generateBoardFromSeed(seed, 'medium');

      // Find a snake position
      if (board.snakes.length > 0) {
        const snake = board.snakes[0];
        const startPos = snake.start - 5;
        const diceRoll = 5;

        const result = validateMove(startPos, diceRoll, snake.end, seed, 'medium');

        expect(result.valid).toBe(true);
        expect(result.actualPosition).toBe(snake.end);
      }
    });

    it('should calculate move correctly with ladder', () => {
      const seed = 'ladder-test';
      const board = generateBoardFromSeed(seed, 'medium');

      // Find a ladder position
      if (board.ladders.length > 0) {
        const ladder = board.ladders[0];
        const startPos = ladder.start - 3;
        const diceRoll = 3;

        const result = validateMove(startPos, diceRoll, ladder.end, seed, 'medium');

        expect(result.valid).toBe(true);
        expect(result.actualPosition).toBe(ladder.end);
      }
    });

    it('should detect cheating - wrong claimed position', () => {
      const result = validateMove(10, 5, 20, 'test-seed', 'medium');

      expect(result.valid).toBe(false);
      expect(result.actualPosition).toBe(15);
      expect(result.message).toContain('Invalid move');
    });
  });

  describe('Win Condition', () => {
    it('should detect win at position 100', () => {
      expect(hasWon(100)).toBe(true);
    });

    it('should not detect win before position 100', () => {
      expect(hasWon(99)).toBe(false);
      expect(hasWon(50)).toBe(false);
      expect(hasWon(0)).toBe(false);
    });
  });

  describe('Score Calculation', () => {
    it('should return 0 for non-winning position', () => {
      const score = calculateScore(50, Date.now(), Date.now());
      expect(score).toBe(0);
    });

    it('should calculate score with time bonus', () => {
      const startTime = Date.now();
      const finishTime = startTime + 5000; // 5 seconds

      const score = calculateScore(100, finishTime, startTime);

      expect(score).toBeGreaterThan(10000); // Base score
      expect(score).toBeLessThan(20000); // Base score + max time bonus
    });

    it('should give higher score for faster completion', () => {
      const startTime = Date.now();
      const fastFinish = startTime + 1000; // 1 second
      const slowFinish = startTime + 9000; // 9 seconds

      const fastScore = calculateScore(100, fastFinish, startTime);
      const slowScore = calculateScore(100, slowFinish, startTime);

      expect(fastScore).toBeGreaterThan(slowScore);
    });

    it('should not give negative time bonus', () => {
      const startTime = Date.now();
      const finishTime = startTime + 20000; // 20 seconds (very slow)

      const score = calculateScore(100, finishTime, startTime);

      expect(score).toBeGreaterThanOrEqual(10000); // Should still get base score
    });
  });
});
