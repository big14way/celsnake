// Copy of game logic from web version
export type PathCell = { x: number; y: number };
export type BoardCell =
  | { type: 'empty' }
  | { type: 'snake' }
  | { type: 'mult'; value: string }
  | { type: 'start' };

export const BOARD_SIZE = 4;

export function generatePath(): PathCell[] {
  const path: PathCell[] = [];
  // 4 right (y=0, x=0..3)
  for (let x = 0; x < 4; x++) path.push({ x, y: 0 });
  // 3 down (x=3, y=1..3)
  for (let y = 1; y < 4; y++) path.push({ x: 3, y });
  // 4 left (y=3, x=3..0)
  for (let x = 3; x >= 0; x--) path.push({ x, y: 3 });
  // 2 up (x=0, y=2..1)
  for (let y = 2; y >= 1; y--) path.push({ x: 0, y });
  return path;
}

function getRandomUnique(arr: number[], count: number): number[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export function generateBoard(difficulty: 'easy'|'medium'|'hard'|'expert'|'master'): BoardCell[][] {
  if (difficulty === 'easy') {
    const fixed: BoardCell[] = [
      { type: 'start' as const },
      { type: 'mult', value: '2.00x' },
      { type: 'mult', value: '1.30x' },
      { type: 'mult', value: '1.20x' },
      { type: 'mult', value: '1.10x' },
      { type: 'mult', value: '1.01x' },
      { type: 'snake' as const },
      { type: 'mult', value: '1.01x' },
      { type: 'mult', value: '1.10x' },
      { type: 'mult', value: '1.20x' },
      { type: 'mult', value: '1.30x' },
      { type: 'mult', value: '2.00x' },
      { type: 'mult', value: '1.01x' },
    ];
    const board: BoardCell[][] = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill({ type: 'empty' }));
    const path = generatePath();
    for (let i = 0; i < path.length; i++) {
      const { x, y } = path[i];
      board[y][x] = fixed[i];
    }
    return board;
  }

  // Other difficulties use similar logic as web version
  const snakesCount = { easy: 1, medium: 3, hard: 5, expert: 7, master: 9 }[difficulty];
  const multiplierRanges: Record<string, [number, number]> = {
    easy: [1.01, 2.00],
    medium: [1.11, 4.00],
    hard: [1.38, 7.50],
    expert: [3.82, 10.00],
    master: [17.64, 18.00],
  };
  const [minMult, maxMult] = multiplierRanges[difficulty];
  const board: BoardCell[][] = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill({ type: 'empty' }));
  const path = generatePath();

  const snakePositions = getRandomUnique([...Array(path.length - 1).keys()].map(i => i + 1), Math.min(snakesCount, path.length - 1));

  function randomMultiplier() {
    const val = Math.random() * (maxMult - minMult) + minMult;
    return val.toFixed(2) + 'x';
  }

  for (let i = 0; i < path.length; i++) {
    const { x, y } = path[i];
    if (i === 0) {
      board[y][x] = { type: 'start' };
    } else if (snakePositions.includes(i)) {
      board[y][x] = { type: 'snake' };
    } else {
      board[y][x] = { type: 'mult', value: randomMultiplier() };
    }
  }
  return board;
}
