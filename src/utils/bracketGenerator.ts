import {
  BracketNode,
  TournamentBracket,
  TournamentType,
  MatchStatus,
  MatchInfo,
} from '../types/tournament';

/**
 * Generate tournament bracket visualization data from matches
 */
export class BracketGenerator {
  /**
   * Generate bracket structure for single elimination tournament
   */
  static generateSingleEliminationBracket(
    tournamentId: string,
    matches: MatchInfo[]
  ): TournamentBracket {
    if (matches.length === 0) {
      return {
        tournamentId,
        type: TournamentType.SingleElimination,
        rounds: [],
        totalRounds: 0,
      };
    }

    // Group matches by round
    const matchesByRound = new Map<number, MatchInfo[]>();
    let maxRound = 0;

    matches.forEach((match) => {
      const round = Number(match.roundNumber);
      if (!matchesByRound.has(round)) {
        matchesByRound.set(round, []);
      }
      matchesByRound.get(round)!.push(match);
      maxRound = Math.max(maxRound, round);
    });

    // Sort matches within each round by match number
    matchesByRound.forEach((roundMatches) => {
      roundMatches.sort((a, b) => Number(a.matchNumber) - Number(b.matchNumber));
    });

    // Calculate bracket positions
    const rounds: BracketNode[][] = [];
    const nodeMap = new Map<string, BracketNode>();

    for (let roundNum = 1; roundNum <= maxRound; roundNum++) {
      const roundMatches = matchesByRound.get(roundNum) || [];
      const roundNodes: BracketNode[] = [];

      roundMatches.forEach((match, matchIndex) => {
        const matchId = match.matchId.toString();
        const spacing = 100; // vertical spacing between matches
        const roundWidth = 250; // horizontal spacing between rounds

        const node: BracketNode = {
          matchId,
          roundNumber: Number(match.roundNumber),
          matchNumber: Number(match.matchNumber),
          players: match.players.map((addr) => ({
            address: addr,
            nickname: undefined,
            score: undefined,
          })),
          winner: match.winner !== '0x0000000000000000000000000000000000000000'
            ? match.winner
            : undefined,
          status: match.status,
          position: {
            x: (roundNum - 1) * roundWidth,
            y: matchIndex * spacing * Math.pow(2, roundNum - 1),
          },
        };

        // Link to next round match
        if (roundNum < maxRound) {
          const nextRoundMatches = matchesByRound.get(roundNum + 1) || [];
          const nextMatchIndex = Math.floor(matchIndex / 2);
          if (nextMatchIndex < nextRoundMatches.length) {
            node.nextMatchId = nextRoundMatches[nextMatchIndex].matchId.toString();
          }
        }

        roundNodes.push(node);
        nodeMap.set(matchId, node);
      });

      rounds.push(roundNodes);
    }

    // Set previous match links
    rounds.forEach((roundNodes, roundIndex) => {
      if (roundIndex > 0) {
        roundNodes.forEach((node, nodeIndex) => {
          const prevMatchIndex1 = nodeIndex * 2;
          const prevMatchIndex2 = nodeIndex * 2 + 1;
          const prevRound = rounds[roundIndex - 1];

          node.previousMatchIds = [];
          if (prevMatchIndex1 < prevRound.length) {
            node.previousMatchIds.push(prevRound[prevMatchIndex1].matchId);
          }
          if (prevMatchIndex2 < prevRound.length) {
            node.previousMatchIds.push(prevRound[prevMatchIndex2].matchId);
          }
        });
      }
    });

    return {
      tournamentId,
      type: TournamentType.SingleElimination,
      rounds,
      totalRounds: maxRound,
    };
  }

  /**
   * Generate bracket for round robin (grid layout)
   */
  static generateRoundRobinBracket(
    tournamentId: string,
    matches: MatchInfo[],
    participants: `0x${string}`[]
  ): TournamentBracket {
    // Round robin doesn't have traditional brackets, but we can show a grid
    const nodes: BracketNode[] = matches.map((match, index) => ({
      matchId: match.matchId.toString(),
      roundNumber: 1, // All matches are effectively "round 1"
      matchNumber: Number(match.matchNumber),
      players: match.players.map((addr) => ({
        address: addr,
        nickname: undefined,
        score: undefined,
      })),
      winner: match.winner !== '0x0000000000000000000000000000000000000000'
        ? match.winner
        : undefined,
      status: match.status,
      position: this.calculateRoundRobinPosition(index, matches.length),
    }));

    return {
      tournamentId,
      type: TournamentType.RoundRobin,
      rounds: [nodes],
      totalRounds: 1,
    };
  }

  /**
   * Generate bracket for Swiss system
   */
  static generateSwissBracket(
    tournamentId: string,
    matches: MatchInfo[]
  ): TournamentBracket {
    // Group by round
    const matchesByRound = new Map<number, MatchInfo[]>();
    let maxRound = 0;

    matches.forEach((match) => {
      const round = Number(match.roundNumber);
      if (!matchesByRound.has(round)) {
        matchesByRound.set(round, []);
      }
      matchesByRound.get(round)!.push(match);
      maxRound = Math.max(maxRound, round);
    });

    const rounds: BracketNode[][] = [];

    for (let roundNum = 1; roundNum <= maxRound; roundNum++) {
      const roundMatches = matchesByRound.get(roundNum) || [];
      const roundNodes: BracketNode[] = roundMatches.map((match, index) => ({
        matchId: match.matchId.toString(),
        roundNumber: Number(match.roundNumber),
        matchNumber: Number(match.matchNumber),
        players: match.players.map((addr) => ({
          address: addr,
          nickname: undefined,
          score: undefined,
        })),
        winner: match.winner !== '0x0000000000000000000000000000000000000000'
          ? match.winner
          : undefined,
        status: match.status,
        position: {
          x: (roundNum - 1) * 250,
          y: index * 100,
        },
      }));

      rounds.push(roundNodes);
    }

    return {
      tournamentId,
      type: TournamentType.Swiss,
      rounds,
      totalRounds: maxRound,
    };
  }

  /**
   * Calculate position for round robin grid layout
   */
  private static calculateRoundRobinPosition(
    index: number,
    totalMatches: number
  ): { x: number; y: number } {
    const matchesPerRow = Math.ceil(Math.sqrt(totalMatches));
    const row = Math.floor(index / matchesPerRow);
    const col = index % matchesPerRow;

    return {
      x: col * 200,
      y: row * 100,
    };
  }

  /**
   * Calculate the number of rounds needed for single elimination
   */
  static calculateEliminationRounds(participantCount: number): number {
    return Math.ceil(Math.log2(participantCount));
  }

  /**
   * Calculate the number of rounds for Swiss system
   */
  static calculateSwissRounds(participantCount: number): number {
    // Typical Swiss system uses log2(participants) rounds
    return Math.ceil(Math.log2(participantCount));
  }

  /**
   * Generate seeded bracket (higher seeds vs lower seeds)
   */
  static generateSeededPairings(
    players: `0x${string}`[],
    seeds: number[]
  ): [number, number][] {
    if (players.length !== seeds.length) {
      throw new Error('Players and seeds arrays must have the same length');
    }

    // Sort players by seed
    const seededPlayers = players
      .map((player, index) => ({ player, seed: seeds[index] }))
      .sort((a, b) => a.seed - b.seed);

    const pairings: [number, number][] = [];
    const playerCount = seededPlayers.length;

    // Classic seeding: 1 vs n, 2 vs n-1, etc.
    for (let i = 0; i < Math.floor(playerCount / 2); i++) {
      const topSeedIndex = i;
      const bottomSeedIndex = playerCount - 1 - i;
      pairings.push([topSeedIndex, bottomSeedIndex]);
    }

    return pairings;
  }

  /**
   * Check if bracket is complete
   */
  static isBracketComplete(bracket: TournamentBracket): boolean {
    if (bracket.rounds.length === 0) return false;

    // Check if final round has a winner
    const finalRound = bracket.rounds[bracket.rounds.length - 1];
    if (finalRound.length === 0) return false;

    const finalMatch = finalRound[0];
    return (
      finalMatch.status === MatchStatus.Completed &&
      finalMatch.winner !== undefined
    );
  }

  /**
   * Get current active matches
   */
  static getActiveMatches(bracket: TournamentBracket): BracketNode[] {
    const activeMatches: BracketNode[] = [];

    bracket.rounds.forEach((round) => {
      round.forEach((match) => {
        if (
          match.status === MatchStatus.Pending ||
          match.status === MatchStatus.InProgress
        ) {
          activeMatches.push(match);
        }
      });
    });

    return activeMatches;
  }

  /**
   * Get next match for a player
   */
  static getNextMatchForPlayer(
    bracket: TournamentBracket,
    playerAddress: `0x${string}`
  ): BracketNode | null {
    for (const round of bracket.rounds) {
      for (const match of round) {
        if (
          match.status === MatchStatus.Pending &&
          match.players.some((p) => p.address.toLowerCase() === playerAddress.toLowerCase())
        ) {
          return match;
        }
      }
    }
    return null;
  }

  /**
   * Get player's path through bracket
   */
  static getPlayerPath(
    bracket: TournamentBracket,
    playerAddress: `0x${string}`
  ): BracketNode[] {
    const path: BracketNode[] = [];

    bracket.rounds.forEach((round) => {
      round.forEach((match) => {
        if (
          match.players.some((p) => p.address.toLowerCase() === playerAddress.toLowerCase())
        ) {
          path.push(match);
        }
      });
    });

    return path.sort((a, b) => a.roundNumber - b.roundNumber);
  }

  /**
   * Validate bracket structure
   */
  static validateBracket(bracket: TournamentBracket): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (bracket.rounds.length === 0) {
      errors.push('Bracket has no rounds');
      return { valid: false, errors };
    }

    // Check that each round has the correct number of matches
    if (bracket.type === TournamentType.SingleElimination) {
      for (let i = 0; i < bracket.rounds.length - 1; i++) {
        const currentRound = bracket.rounds[i];
        const nextRound = bracket.rounds[i + 1];

        // Next round should have half the matches (or ceiling if odd)
        const expectedNextRoundMatches = Math.ceil(currentRound.length / 2);
        if (nextRound.length !== expectedNextRoundMatches) {
          errors.push(
            `Round ${i + 1} should lead to ${expectedNextRoundMatches} matches in round ${i + 2}, but found ${nextRound.length}`
          );
        }
      }

      // Final round should have exactly 1 match
      const finalRound = bracket.rounds[bracket.rounds.length - 1];
      if (finalRound.length !== 1) {
        errors.push(`Final round should have 1 match, but has ${finalRound.length}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate bracket from tournament type and participants
   */
  static generateBracket(
    tournamentId: string,
    type: TournamentType,
    matches: MatchInfo[],
    participants: `0x${string}`[] = []
  ): TournamentBracket {
    switch (type) {
      case TournamentType.SingleElimination:
      case TournamentType.DoubleElimination:
        return this.generateSingleEliminationBracket(tournamentId, matches);
      case TournamentType.RoundRobin:
        return this.generateRoundRobinBracket(tournamentId, matches, participants);
      case TournamentType.Swiss:
        return this.generateSwissBracket(tournamentId, matches);
      default:
        return {
          tournamentId,
          type,
          rounds: [],
          totalRounds: 0,
        };
    }
  }

  /**
   * Calculate approximate bracket dimensions for rendering
   */
  static calculateBracketDimensions(bracket: TournamentBracket): {
    width: number;
    height: number;
  } {
    if (bracket.rounds.length === 0) {
      return { width: 0, height: 0 };
    }

    let maxX = 0;
    let maxY = 0;

    bracket.rounds.forEach((round) => {
      round.forEach((match) => {
        maxX = Math.max(maxX, match.position.x);
        maxY = Math.max(maxY, match.position.y);
      });
    });

    return {
      width: maxX + 250, // Add space for last round
      height: maxY + 100, // Add space for last match
    };
  }
}

/**
 * Helper function to format round names
 */
export function getRoundName(roundNumber: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - roundNumber;

  if (roundsFromEnd === 0) return 'Final';
  if (roundsFromEnd === 1) return 'Semi-Finals';
  if (roundsFromEnd === 2) return 'Quarter-Finals';

  return `Round ${roundNumber}`;
}

/**
 * Helper to generate color for match status
 */
export function getMatchStatusColor(status: MatchStatus): string {
  switch (status) {
    case MatchStatus.Pending:
      return '#6B7280'; // gray
    case MatchStatus.InProgress:
      return '#3B82F6'; // blue
    case MatchStatus.Completed:
      return '#10B981'; // green
    case MatchStatus.Cancelled:
      return '#EF4444'; // red
    default:
      return '#6B7280';
  }
}
