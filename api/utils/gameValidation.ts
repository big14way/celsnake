/**
 * Server-side game validation logic
 * Validates moves against game rules to prevent cheating
 */

export interface Position {
  row: number;
  col: number;
}

export interface Snake {
  start: number;
  end: number;
}

export interface Ladder {
  start: number;
  end: number;
}

/**
 * Generate deterministic board from seed
 * Must match client-side generation
 */
export function generateBoardFromSeed(seed: string, difficulty: string): {
  snakes: Snake[];
  ladders: Ladder[];
} {
  // Seeded random number generator
  let seedValue = 0;
  for (let i = 0; i < seed.length; i++) {
    seedValue = (seedValue * 31 + seed.charCodeAt(i)) >>> 0;
  }

  const random = () => {
    seedValue = (seedValue * 1103515245 + 12345) >>> 0;
    return (seedValue / 0x100000000);
  };

  const snakes: Snake[] = [];
  const ladders: Ladder[] = [];

  // Difficulty-based counts
  const counts = {
    easy: { snakes: 3, ladders: 5 },
    medium: { snakes: 5, ladders: 5 },
    hard: { snakes: 8, ladders: 4 },
  }[difficulty] || { snakes: 5, ladders: 5 };

  const usedPositions = new Set<number>();

  // Generate snakes
  for (let i = 0; i < counts.snakes; i++) {
    let start, end;
    let attempts = 0;
    do {
      start = Math.floor(random() * 80) + 20; // 20-99
      end = Math.floor(random() * (start - 10)) + 2; // 2 to start-10
      attempts++;
    } while ((usedPositions.has(start) || usedPositions.has(end) || start <= end) && attempts < 100);

    if (attempts < 100) {
      snakes.push({ start, end });
      usedPositions.add(start);
      usedPositions.add(end);
    }
  }

  // Generate ladders
  for (let i = 0; i < counts.ladders; i++) {
    let start, end;
    let attempts = 0;
    do {
      start = Math.floor(random() * 80) + 2; // 2-81
      end = Math.floor(random() * (98 - start)) + start + 5; // start+5 to 98
      attempts++;
    } while ((usedPositions.has(start) || usedPositions.has(end) || end <= start) && attempts < 100);

    if (attempts < 100) {
      ladders.push({ start, end });
      usedPositions.add(start);
      usedPositions.add(end);
    }
  }

  return { snakes, ladders };
}

/**
 * Validate a move is legal
 * @param currentPosition - Player's current position
 * @param diceRoll - Sum of dice rolled
 * @param newPosition - Claimed new position
 * @param boardSeed - Board seed for validation
 * @param difficulty - Game difficulty
 * @returns { valid: boolean, actualPosition: number, message?: string }
 */
export function validateMove(
  currentPosition: number,
  diceRoll: number,
  newPosition: number,
  boardSeed: string,
  difficulty: string
): { valid: boolean; actualPosition: number; message?: string } {
  // Basic validation
  if (currentPosition < 0 || currentPosition > 100) {
    return { valid: false, actualPosition: currentPosition, message: 'Invalid current position' };
  }

  if (diceRoll < 2 || diceRoll > 12) {
    return { valid: false, actualPosition: currentPosition, message: 'Invalid dice roll' };
  }

  // Calculate expected position
  let expectedPosition = currentPosition + diceRoll;

  // Check if move would exceed board
  if (expectedPosition > 100) {
    expectedPosition = currentPosition; // Stay in place
  }

  // Check for snakes and ladders
  const { snakes, ladders } = generateBoardFromSeed(boardSeed, difficulty);

  // Check for snake
  const snake = snakes.find(s => s.start === expectedPosition);
  if (snake) {
    expectedPosition = snake.end;
  }

  // Check for ladder
  const ladder = ladders.find(l => l.start === expectedPosition);
  if (ladder) {
    expectedPosition = ladder.end;
  }

  // Validate claimed position matches expected
  if (newPosition !== expectedPosition) {
    return {
      valid: false,
      actualPosition: expectedPosition,
      message: `Invalid move: expected ${expectedPosition}, claimed ${newPosition}`,
    };
  }

  return { valid: true, actualPosition: expectedPosition };
}

/**
 * Check if position is a losing position (snake head)
 */
export function isLosingPosition(position: number, boardSeed: string, difficulty: string): boolean {
  const { snakes } = generateBoardFromSeed(boardSeed, difficulty);
  return snakes.some(s => s.start === position && s.end === 0);
}

/**
 * Check if player has won
 */
export function hasWon(position: number): boolean {
  return position === 100;
}

/**
 * Calculate player score based on position and time
 */
export function calculateScore(position: number, finishTime: number, startTime: number): number {
  if (position !== 100) return 0;

  const timeBonus = Math.max(0, 10000 - (finishTime - startTime));
  return position * 100 + timeBonus;
}
