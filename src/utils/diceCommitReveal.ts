/**
 * Client-side utilities for commit-reveal dice rolls
 */

/**
 * Generate a cryptographic hash using Web Crypto API
 * @param data - Data to hash
 * @returns Hex string hash
 */
async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate random secret for commit-reveal
 * @returns Random hex string
 */
export function generateSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a commit hash for dice values
 * @param dice1 - First dice value
 * @param dice2 - Second dice value
 * @param secret - Random secret string
 * @returns Promise<commit hash>
 */
export async function createDiceCommit(
  dice1: number,
  dice2: number,
  secret: string
): Promise<string> {
  const data = `${dice1}:${dice2}:${secret}`;
  return await sha256(data);
}

/**
 * Roll dice and create commit
 * @returns Promise<{ dice1, dice2, secret, commitHash }>
 */
export async function rollAndCommitDice(): Promise<{
  dice1: number;
  dice2: number;
  secret: string;
  commitHash: string;
}> {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const secret = generateSecret();
  const commitHash = await createDiceCommit(dice1, dice2, secret);

  return { dice1, dice2, secret, commitHash };
}
