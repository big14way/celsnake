/**
 * Tournament Contract Interaction Utilities
 * Handles all smart contract interactions for tournaments
 */

import { parseEther, formatEther } from 'viem';
import {
  TournamentType,
  RecurrenceType,
} from '../types/tournament';
import type {
  TournamentInfo,
  MatchInfo,
  PlayerTournamentStats,
  CreateTournamentParams,
} from '../types/tournament';

// Tournament Manager Contract Address (Celo Sepolia)
export const TOURNAMENT_CONTRACT_ADDRESS = (import.meta.env.VITE_TOURNAMENT_CONTRACT_ADDRESS || '0x7BE60377E17aD50b289F306996fa31494364c56a') as `0x${string}`;

// Contract ABI (subset - only functions we need)
export const TOURNAMENT_MANAGER_ABI = [
  // Read functions
  {
    inputs: [{ name: 'tournamentId', type: 'uint256' }],
    name: 'getTournamentInfo',
    outputs: [{
      components: [
        { name: 'id', type: 'uint256' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'tournamentType', type: 'uint8' },
        { name: 'status', type: 'uint8' },
        { name: 'recurrence', type: 'uint8' },
        { name: 'entryFee', type: 'uint256' },
        { name: 'minParticipants', type: 'uint256' },
        { name: 'maxParticipants', type: 'uint256' },
        { name: 'currentParticipants', type: 'uint256' },
        { name: 'prizePool', type: 'uint256' },
        { name: 'guaranteedPrize', type: 'uint256' },
        { name: 'registrationStart', type: 'uint256' },
        { name: 'registrationEnd', type: 'uint256' },
        { name: 'tournamentStart', type: 'uint256' },
        { name: 'creator', type: 'address' },
        { name: 'sponsor', type: 'address' },
        { name: 'requiresGoldNFT', type: 'bool' },
        { name: 'difficulty', type: 'uint8' },
        { name: 'currentRound', type: 'uint256' },
      ],
      type: 'tuple',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tournamentId', type: 'uint256' }],
    name: 'getTournamentParticipants',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tournamentId', type: 'uint256' }],
    name: 'getTournamentResults',
    outputs: [
      { name: 'winners', type: 'address[]' },
      { name: 'prizes', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tournamentId', type: 'uint256' }],
    name: 'getTournamentMatches',
    outputs: [{
      components: [
        { name: 'matchId', type: 'uint256' },
        { name: 'tournamentId', type: 'uint256' },
        { name: 'roundNumber', type: 'uint256' },
        { name: 'matchNumber', type: 'uint256' },
        { name: 'roomId', type: 'uint256' },
        { name: 'players', type: 'address[]' },
        { name: 'winner', type: 'address' },
        { name: 'status', type: 'uint8' },
        { name: 'startTime', type: 'uint256' },
      ],
      type: 'tuple[]',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'matchId', type: 'uint256' }],
    name: 'getMatchInfo',
    outputs: [{
      components: [
        { name: 'matchId', type: 'uint256' },
        { name: 'tournamentId', type: 'uint256' },
        { name: 'roundNumber', type: 'uint256' },
        { name: 'matchNumber', type: 'uint256' },
        { name: 'roomId', type: 'uint256' },
        { name: 'players', type: 'address[]' },
        { name: 'winner', type: 'address' },
        { name: 'status', type: 'uint8' },
        { name: 'startTime', type: 'uint256' },
      ],
      type: 'tuple',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getActiveTournaments',
    outputs: [{
      components: [
        { name: 'id', type: 'uint256' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'tournamentType', type: 'uint8' },
        { name: 'status', type: 'uint8' },
        { name: 'recurrence', type: 'uint8' },
        { name: 'entryFee', type: 'uint256' },
        { name: 'minParticipants', type: 'uint256' },
        { name: 'maxParticipants', type: 'uint256' },
        { name: 'currentParticipants', type: 'uint256' },
        { name: 'prizePool', type: 'uint256' },
        { name: 'guaranteedPrize', type: 'uint256' },
        { name: 'registrationStart', type: 'uint256' },
        { name: 'registrationEnd', type: 'uint256' },
        { name: 'tournamentStart', type: 'uint256' },
        { name: 'creator', type: 'address' },
        { name: 'sponsor', type: 'address' },
        { name: 'requiresGoldNFT', type: 'bool' },
        { name: 'difficulty', type: 'uint8' },
        { name: 'currentRound', type: 'uint256' },
      ],
      type: 'tuple[]',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getUpcomingTournaments',
    outputs: [{
      components: [
        { name: 'id', type: 'uint256' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'tournamentType', type: 'uint8' },
        { name: 'status', type: 'uint8' },
        { name: 'recurrence', type: 'uint8' },
        { name: 'entryFee', type: 'uint256' },
        { name: 'minParticipants', type: 'uint256' },
        { name: 'maxParticipants', type: 'uint256' },
        { name: 'currentParticipants', type: 'uint256' },
        { name: 'prizePool', type: 'uint256' },
        { name: 'guaranteedPrize', type: 'uint256' },
        { name: 'registrationStart', type: 'uint256' },
        { name: 'registrationEnd', type: 'uint256' },
        { name: 'tournamentStart', type: 'uint256' },
        { name: 'creator', type: 'address' },
        { name: 'sponsor', type: 'address' },
        { name: 'requiresGoldNFT', type: 'bool' },
        { name: 'difficulty', type: 'uint8' },
        { name: 'currentRound', type: 'uint256' },
      ],
      type: 'tuple[]',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'limit', type: 'uint256' }],
    name: 'getFinishedTournaments',
    outputs: [{
      components: [
        { name: 'id', type: 'uint256' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'tournamentType', type: 'uint8' },
        { name: 'status', type: 'uint8' },
        { name: 'recurrence', type: 'uint8' },
        { name: 'entryFee', type: 'uint256' },
        { name: 'minParticipants', type: 'uint256' },
        { name: 'maxParticipants', type: 'uint256' },
        { name: 'currentParticipants', type: 'uint256' },
        { name: 'prizePool', type: 'uint256' },
        { name: 'guaranteedPrize', type: 'uint256' },
        { name: 'registrationStart', type: 'uint256' },
        { name: 'registrationEnd', type: 'uint256' },
        { name: 'tournamentStart', type: 'uint256' },
        { name: 'creator', type: 'address' },
        { name: 'sponsor', type: 'address' },
        { name: 'requiresGoldNFT', type: 'bool' },
        { name: 'difficulty', type: 'uint8' },
        { name: 'currentRound', type: 'uint256' },
      ],
      type: 'tuple[]',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'player', type: 'address' }],
    name: 'getPlayerStats',
    outputs: [{
      components: [
        { name: 'tournamentsPlayed', type: 'uint256' },
        { name: 'tournamentsWon', type: 'uint256' },
        { name: 'totalPrizes', type: 'uint256' },
        { name: 'matchesWon', type: 'uint256' },
        { name: 'matchesLost', type: 'uint256' },
        { name: 'bestPlacement', type: 'uint256' },
        { name: 'currentRating', type: 'uint256' },
      ],
      type: 'tuple',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'player', type: 'address' }],
    name: 'getPlayerTournaments',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { name: '_name', type: 'string' },
      { name: '_description', type: 'string' },
      { name: '_tournamentType', type: 'uint8' },
      { name: '_entryFee', type: 'uint256' },
      { name: '_minParticipants', type: 'uint256' },
      { name: '_maxParticipants', type: 'uint256' },
      { name: '_registrationStart', type: 'uint256' },
      { name: '_registrationEnd', type: 'uint256' },
      { name: '_tournamentStart', type: 'uint256' },
      { name: '_requiresGoldNFT', type: 'bool' },
      { name: '_difficulty', type: 'uint8' },
      { name: '_recurrence', type: 'uint8' },
    ],
    name: 'createTournament',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'tournamentId', type: 'uint256' }],
    name: 'registerForTournament',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'tournamentId', type: 'uint256' }],
    name: 'unregisterFromTournament',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'tournamentId', type: 'uint256' }],
    name: 'sponsorTournament',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'tournamentId', type: 'uint256' }],
    name: 'startTournament',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'matchId', type: 'uint256' },
      { name: 'winner', type: 'address' },
      { name: 'scores', type: 'uint256[]' },
    ],
    name: 'submitMatchResult',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tournamentId', type: 'uint256' },
      { name: 'reason', type: 'string' },
    ],
    name: 'cancelTournament',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tournamentId', type: 'uint256' },
      { indexed: false, name: 'name', type: 'string' },
      { indexed: false, name: 'tournamentType', type: 'uint8' },
      { indexed: false, name: 'entryFee', type: 'uint256' },
      { indexed: false, name: 'maxParticipants', type: 'uint256' },
      { indexed: false, name: 'creator', type: 'address' },
    ],
    name: 'TournamentCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tournamentId', type: 'uint256' },
      { indexed: true, name: 'player', type: 'address' },
    ],
    name: 'PlayerRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tournamentId', type: 'uint256' },
      { indexed: false, name: 'participantCount', type: 'uint256' },
    ],
    name: 'TournamentStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tournamentId', type: 'uint256' },
      { indexed: false, name: 'roundNumber', type: 'uint256' },
      { indexed: false, name: 'matchCount', type: 'uint256' },
    ],
    name: 'RoundStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'matchId', type: 'uint256' },
      { indexed: false, name: 'winner', type: 'address' },
    ],
    name: 'MatchCompleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tournamentId', type: 'uint256' },
      { indexed: false, name: 'winners', type: 'address[]' },
      { indexed: false, name: 'prizes', type: 'uint256[]' },
    ],
    name: 'TournamentFinished',
    type: 'event',
  },
] as const;

/**
 * Format tournament data from contract
 */
export function formatTournamentInfo(rawData: any): TournamentInfo {
  return {
    id: rawData.id,
    name: rawData.name,
    description: rawData.description,
    tournamentType: rawData.tournamentType,
    status: rawData.status,
    recurrence: rawData.recurrence,
    entryFee: rawData.entryFee,
    minParticipants: rawData.minParticipants,
    maxParticipants: rawData.maxParticipants,
    currentParticipants: rawData.currentParticipants,
    prizePool: rawData.prizePool,
    guaranteedPrize: rawData.guaranteedPrize,
    registrationStart: rawData.registrationStart,
    registrationEnd: rawData.registrationEnd,
    tournamentStart: rawData.tournamentStart,
    creator: rawData.creator,
    sponsor: rawData.sponsor,
    requiresGoldNFT: rawData.requiresGoldNFT,
    difficulty: rawData.difficulty,
    currentRound: rawData.currentRound,
  };
}

/**
 * Format match data from contract
 */
export function formatMatchInfo(rawData: any): MatchInfo {
  return {
    matchId: rawData.matchId,
    tournamentId: rawData.tournamentId,
    roundNumber: rawData.roundNumber,
    matchNumber: rawData.matchNumber,
    roomId: rawData.roomId,
    players: rawData.players,
    winner: rawData.winner,
    status: rawData.status,
    startTime: rawData.startTime,
  };
}

/**
 * Format player stats from contract
 */
export function formatPlayerStats(rawData: any): PlayerTournamentStats {
  return {
    tournamentsPlayed: rawData.tournamentsPlayed,
    tournamentsWon: rawData.tournamentsWon,
    totalPrizes: rawData.totalPrizes,
    matchesWon: rawData.matchesWon,
    matchesLost: rawData.matchesLost,
    bestPlacement: rawData.bestPlacement,
    currentRating: rawData.currentRating,
  };
}

/**
 * Calculate recommended entry fee based on tournament type
 */
export function getRecommendedEntryFee(type: TournamentType): bigint {
  switch (type) {
    case TournamentType.SingleElimination:
      return parseEther('0.01'); // 0.01 CELO
    case TournamentType.DoubleElimination:
      return parseEther('0.02'); // 0.02 CELO
    case TournamentType.RoundRobin:
      return parseEther('0.015'); // 0.015 CELO
    case TournamentType.Swiss:
      return parseEther('0.015'); // 0.015 CELO
    case TournamentType.Ladder:
      return parseEther('0.005'); // 0.005 CELO
    default:
      return parseEther('0.01');
  }
}

/**
 * Calculate prize distribution
 */
export function calculatePrizeDistribution(
  prizePool: bigint,
  participantCount: number
): bigint[] {
  const prizes: bigint[] = [];
  const houseFee = (prizePool * BigInt(5)) / BigInt(100);
  const distributionPool = prizePool - houseFee;

  // Percentages for top 8
  const percentages = [40, 25, 15, 10, 5, 3, 1, 1];
  const payoutCount = Math.min(participantCount, 8);

  for (let i = 0; i < payoutCount; i++) {
    const prize = (distributionPool * BigInt(percentages[i])) / BigInt(100);
    prizes.push(prize);
  }

  return prizes;
}

/**
 * Get tournament type name
 */
export function getTournamentTypeName(type: TournamentType): string {
  switch (type) {
    case TournamentType.SingleElimination:
      return 'Single Elimination';
    case TournamentType.DoubleElimination:
      return 'Double Elimination';
    case TournamentType.RoundRobin:
      return 'Round Robin';
    case TournamentType.Swiss:
      return 'Swiss System';
    case TournamentType.Ladder:
      return 'Ladder';
    default:
      return 'Unknown';
  }
}

/**
 * Get tournament status name
 */
export function getTournamentStatusName(status: number): string {
  const statuses = ['Registration', 'Starting', 'In Progress', 'Finished', 'Cancelled'];
  return statuses[status] || 'Unknown';
}

/**
 * Get recurrence type name
 */
export function getRecurrenceTypeName(recurrence: RecurrenceType): string {
  switch (recurrence) {
    case RecurrenceType.None:
      return 'One-time';
    case RecurrenceType.Daily:
      return 'Daily';
    case RecurrenceType.Weekly:
      return 'Weekly';
    case RecurrenceType.Monthly:
      return 'Monthly';
    default:
      return 'Unknown';
  }
}

/**
 * Check if tournament registration is open
 */
export function isRegistrationOpen(tournament: TournamentInfo): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return (
    tournament.status === 0 && // Registration status
    now >= tournament.registrationStart &&
    now <= tournament.registrationEnd &&
    tournament.currentParticipants < tournament.maxParticipants
  );
}

/**
 * Check if tournament is full
 */
export function isTournamentFull(tournament: TournamentInfo): boolean {
  return tournament.currentParticipants >= tournament.maxParticipants;
}

/**
 * Get time until tournament starts
 */
export function getTimeUntilStart(tournament: TournamentInfo): number {
  const now = Math.floor(Date.now() / 1000);
  const start = Number(tournament.tournamentStart);
  return Math.max(0, start - now);
}

/**
 * Get time until registration ends
 */
export function getTimeUntilRegistrationEnds(tournament: TournamentInfo): number {
  const now = Math.floor(Date.now() / 1000);
  const end = Number(tournament.registrationEnd);
  return Math.max(0, end - now);
}

/**
 * Format time duration (seconds to human readable)
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

/**
 * Format timestamp to date string
 */
export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
}
