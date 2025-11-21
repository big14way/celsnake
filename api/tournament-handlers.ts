/**
 * Tournament WebSocket Event Handlers
 * Manages tournament lifecycle, brackets, and match coordination
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import type {
  TournamentInfo,
  MatchInfo,
  TournamentBracket,
  TournamentStanding,
  CreateTournamentParams,
  TournamentType,
  TournamentStatus,
  MatchStatus,
} from '../src/types/tournament';

// In-memory storage (use Redis/KV in production)
const tournaments = new Map<string, StoredTournament>();
const matches = new Map<string, StoredMatch>();
const tournamentParticipants = new Map<string, Set<string>>(); // tournamentId => Set of addresses
const playerTournaments = new Map<string, string[]>(); // playerAddress => tournamentIds

interface StoredTournament extends Omit<TournamentInfo, 'id' | 'registrationStart' | 'registrationEnd' | 'tournamentStart' | 'currentRound'> {
  id: string;
  registrationStart: number;
  registrationEnd: number;
  tournamentStart: number;
  currentRound: number;
  participants: string[];
  winners: string[];
  prizes: string[];
  matches: string[];
}

interface StoredMatch extends Omit<MatchInfo, 'matchId' | 'tournamentId' | 'roundNumber' | 'matchNumber' | 'roomId' | 'startTime'> {
  matchId: string;
  tournamentId: string;
  roundNumber: number;
  matchNumber: number;
  roomId: string;
  startTime: number;
  scores: Map<string, number>;
}

/**
 * Register tournament event handlers
 */
export function registerTournamentHandlers(io: SocketIOServer, socket: Socket) {
  // ===== CREATE TOURNAMENT =====
  socket.on('tournament:create', async (params: CreateTournamentParams) => {
    try {
      // Validate params
      if (!params.name || params.name.length === 0) {
        socket.emit('tournament:error', 'Tournament name is required');
        return;
      }

      if (params.minParticipants < 2) {
        socket.emit('tournament:error', 'Minimum 2 participants required');
        return;
      }

      if (params.maxParticipants > 64) {
        socket.emit('tournament:error', 'Maximum 64 participants allowed');
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      if (params.registrationStart < now) {
        socket.emit('tournament:error', 'Registration start must be in the future');
        return;
      }

      // Generate tournament ID
      const tournamentId = `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const tournament: StoredTournament = {
        id: tournamentId,
        name: params.name,
        description: params.description,
        tournamentType: params.tournamentType,
        status: TournamentStatus.Registration,
        recurrence: params.recurrence,
        entryFee: params.entryFee,
        minParticipants: BigInt(params.minParticipants),
        maxParticipants: BigInt(params.maxParticipants),
        currentParticipants: BigInt(0),
        prizePool: params.sponsorAmount || BigInt(0),
        guaranteedPrize: params.sponsorAmount || BigInt(0),
        registrationStart: params.registrationStart,
        registrationEnd: params.registrationEnd,
        tournamentStart: params.tournamentStart,
        creator: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Set from contract
        sponsor: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        requiresGoldNFT: params.requiresGoldNFT,
        difficulty: params.difficulty,
        currentRound: 0,
        participants: [],
        winners: [],
        prizes: [],
        matches: [],
      };

      tournaments.set(tournamentId, tournament);
      tournamentParticipants.set(tournamentId, new Set());

      // Emit success
      socket.emit('tournament:created', convertToTournamentInfo(tournament));
      io.emit('tournament:updated', convertToTournamentInfo(tournament));

      console.log('Tournament created:', tournamentId);

      // Schedule auto-start
      scheduleAutoStart(io, tournamentId, params.tournamentStart);
    } catch (error) {
      console.error('Error creating tournament:', error);
      socket.emit('tournament:error', 'Failed to create tournament');
    }
  });

  // ===== REGISTER FOR TOURNAMENT =====
  socket.on('tournament:register', async (data: { tournamentId: string; address: string; nickname: string }) => {
    try {
      const tournament = tournaments.get(data.tournamentId);

      if (!tournament) {
        socket.emit('tournament:error', 'Tournament not found');
        return;
      }

      if (tournament.status !== TournamentStatus.Registration) {
        socket.emit('tournament:error', 'Registration is closed');
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      if (now < tournament.registrationStart) {
        socket.emit('tournament:error', 'Registration has not started yet');
        return;
      }

      if (now > tournament.registrationEnd) {
        socket.emit('tournament:error', 'Registration has ended');
        return;
      }

      const participants = tournamentParticipants.get(data.tournamentId);
      if (!participants) {
        socket.emit('tournament:error', 'Tournament data corrupted');
        return;
      }

      if (participants.has(data.address)) {
        socket.emit('tournament:error', 'Already registered');
        return;
      }

      if (participants.size >= Number(tournament.maxParticipants)) {
        socket.emit('tournament:error', 'Tournament is full');
        return;
      }

      // Add participant
      participants.add(data.address);
      tournament.participants.push(data.address);
      tournament.currentParticipants = BigInt(participants.size);
      tournament.prizePool += tournament.entryFee;

      // Track player tournaments
      if (!playerTournaments.has(data.address)) {
        playerTournaments.set(data.address, []);
      }
      playerTournaments.get(data.address)!.push(data.tournamentId);

      // Emit success
      io.to(data.tournamentId).emit('tournament:registered', data.tournamentId, data.address as `0x${string}`);
      io.emit('tournament:updated', convertToTournamentInfo(tournament));

      console.log(`Player ${data.address} registered for tournament ${data.tournamentId}`);

      // Auto-start if full
      if (participants.size === Number(tournament.maxParticipants)) {
        setTimeout(() => startTournament(io, data.tournamentId), 5000);
      }
    } catch (error) {
      console.error('Error registering for tournament:', error);
      socket.emit('tournament:error', 'Failed to register for tournament');
    }
  });

  // ===== UNREGISTER FROM TOURNAMENT =====
  socket.on('tournament:unregister', async (data: { tournamentId: string; address: string }) => {
    try {
      const tournament = tournaments.get(data.tournamentId);

      if (!tournament) {
        socket.emit('tournament:error', 'Tournament not found');
        return;
      }

      if (tournament.status !== TournamentStatus.Registration) {
        socket.emit('tournament:error', 'Cannot unregister after tournament starts');
        return;
      }

      const participants = tournamentParticipants.get(data.tournamentId);
      if (!participants || !participants.has(data.address)) {
        socket.emit('tournament:error', 'Not registered');
        return;
      }

      // Remove participant
      participants.delete(data.address);
      tournament.participants = tournament.participants.filter(p => p !== data.address);
      tournament.currentParticipants = BigInt(participants.size);
      tournament.prizePool -= tournament.entryFee;

      // Emit success
      io.to(data.tournamentId).emit('tournament:unregistered', data.tournamentId, data.address as `0x${string}`);
      io.emit('tournament:updated', convertToTournamentInfo(tournament));

      console.log(`Player ${data.address} unregistered from tournament ${data.tournamentId}`);
    } catch (error) {
      console.error('Error unregistering from tournament:', error);
      socket.emit('tournament:error', 'Failed to unregister from tournament');
    }
  });

  // ===== GET ALL TOURNAMENTS =====
  socket.on('tournament:get_all', (data?: { status?: TournamentStatus }) => {
    try {
      let tournamentList = Array.from(tournaments.values());

      if (data?.status !== undefined) {
        tournamentList = tournamentList.filter(t => t.status === data.status);
      }

      socket.emit('tournament:list', tournamentList.map(convertToTournamentInfo));
    } catch (error) {
      console.error('Error getting tournaments:', error);
      socket.emit('tournament:error', 'Failed to get tournaments');
    }
  });

  // ===== GET TOURNAMENT DETAILS =====
  socket.on('tournament:get_details', (data: { tournamentId: string }) => {
    try {
      const tournament = tournaments.get(data.tournamentId);

      if (!tournament) {
        socket.emit('tournament:error', 'Tournament not found');
        return;
      }

      socket.emit('tournament:updated', convertToTournamentInfo(tournament));
      socket.join(data.tournamentId);
    } catch (error) {
      console.error('Error getting tournament details:', error);
      socket.emit('tournament:error', 'Failed to get tournament details');
    }
  });

  // ===== GET TOURNAMENT BRACKET =====
  socket.on('tournament:get_bracket', (data: { tournamentId: string }) => {
    try {
      const tournament = tournaments.get(data.tournamentId);

      if (!tournament) {
        socket.emit('tournament:error', 'Tournament not found');
        return;
      }

      const bracket = generateBracket(data.tournamentId, tournament);
      socket.emit('tournament:bracket_updated', bracket);
    } catch (error) {
      console.error('Error getting bracket:', error);
      socket.emit('tournament:error', 'Failed to get bracket');
    }
  });

  // ===== GET TOURNAMENT STANDINGS =====
  socket.on('tournament:get_standings', (data: { tournamentId: string }) => {
    try {
      const tournament = tournaments.get(data.tournamentId);

      if (!tournament) {
        socket.emit('tournament:error', 'Tournament not found');
        return;
      }

      const standings = calculateStandings(data.tournamentId, tournament);
      socket.emit('tournament:standings_updated', standings);
    } catch (error) {
      console.error('Error getting standings:', error);
      socket.emit('tournament:error', 'Failed to get standings');
    }
  });

  // ===== SUBMIT MATCH RESULT (Admin only) =====
  socket.on('tournament:submit_result', (data: {
    matchId: string;
    winner: string;
    scores: { [address: string]: number };
  }) => {
    try {
      const match = matches.get(data.matchId);

      if (!match) {
        socket.emit('tournament:error', 'Match not found');
        return;
      }

      if (match.status !== MatchStatus.Pending && match.status !== MatchStatus.InProgress) {
        socket.emit('tournament:error', 'Match already completed');
        return;
      }

      // Update match
      match.winner = data.winner as `0x${string}`;
      match.status = MatchStatus.Completed;
      match.scores = new Map(Object.entries(data.scores));

      // Emit match completed
      io.to(match.tournamentId).emit('tournament:match_completed', data.matchId, data.winner as `0x${string}`);

      // Check if round is complete
      checkRoundComplete(io, match.tournamentId);
    } catch (error) {
      console.error('Error submitting match result:', error);
      socket.emit('tournament:error', 'Failed to submit match result');
    }
  });
}

/**
 * Start tournament and generate first round
 */
function startTournament(io: SocketIOServer, tournamentId: string) {
  const tournament = tournaments.get(tournamentId);
  if (!tournament) return;

  const participants = tournamentParticipants.get(tournamentId);
  if (!participants || participants.size < Number(tournament.minParticipants)) {
    console.log(`Tournament ${tournamentId} doesn't have enough participants`);
    return;
  }

  tournament.status = TournamentStatus.InProgress;
  tournament.currentRound = 1;

  // Generate first round matches
  const participantArray = Array.from(participants);
  const matchIds = generateMatches(tournamentId, tournament.tournamentType, participantArray, 1);
  tournament.matches.push(...matchIds);

  io.to(tournamentId).emit('tournament:started', tournamentId, participantArray.length);
  io.emit('tournament:updated', convertToTournamentInfo(tournament));

  console.log(`Tournament ${tournamentId} started with ${participantArray.length} participants`);
}

/**
 * Generate matches for a round
 */
function generateMatches(
  tournamentId: string,
  type: TournamentType,
  players: string[],
  roundNumber: number
): string[] {
  const matchIds: string[] = [];

  if (type === TournamentType.SingleElimination || type === TournamentType.DoubleElimination) {
    // Pair players sequentially
    const matchCount = Math.ceil(players.length / 2);

    for (let i = 0; i < matchCount; i++) {
      const player1 = players[i * 2];
      const player2 = players[i * 2 + 1];

      const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const matchPlayers = player2 ? [player1, player2] : [player1];

      const match: StoredMatch = {
        matchId,
        tournamentId,
        roundNumber,
        matchNumber: i + 1,
        roomId: '',
        players: matchPlayers as `0x${string}`[],
        winner: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        status: matchPlayers.length === 1 ? MatchStatus.Completed : MatchStatus.Pending,
        startTime: 0,
        scores: new Map(),
      };

      // If only one player (bye), they advance automatically
      if (matchPlayers.length === 1) {
        match.winner = player1 as `0x${string}`;
      }

      matches.set(matchId, match);
      matchIds.push(matchId);

      // Emit match created
      const io = getIoInstance();
      if (io) {
        io.to(tournamentId).emit('tournament:match_created', convertToMatchInfo(match));
      }
    }
  } else if (type === TournamentType.RoundRobin) {
    // Everyone plays everyone
    let matchNumber = 1;
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const matchId = `match_${Date.now()}_${matchNumber}_${Math.random().toString(36).substr(2, 9)}`;

        const match: StoredMatch = {
          matchId,
          tournamentId,
          roundNumber: 1,
          matchNumber: matchNumber++,
          roomId: '',
          players: [players[i], players[j]] as `0x${string}`[],
          winner: '0x0000000000000000000000000000000000000000' as `0x${string}`,
          status: MatchStatus.Pending,
          startTime: 0,
          scores: new Map(),
        };

        matches.set(matchId, match);
        matchIds.push(matchId);

        const io = getIoInstance();
        if (io) {
          io.to(tournamentId).emit('tournament:match_created', convertToMatchInfo(match));
        }
      }
    }
  } else if (type === TournamentType.Swiss) {
    // Pair players by similar record (for now, just pair sequentially)
    // In production, implement proper Swiss pairing algorithm
    const matchCount = Math.floor(players.length / 2);

    for (let i = 0; i < matchCount; i++) {
      const matchId = `match_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;

      const match: StoredMatch = {
        matchId,
        tournamentId,
        roundNumber,
        matchNumber: i + 1,
        roomId: '',
        players: [players[i * 2], players[i * 2 + 1]] as `0x${string}`[],
        winner: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        status: MatchStatus.Pending,
        startTime: 0,
        scores: new Map(),
      };

      matches.set(matchId, match);
      matchIds.push(matchId);

      const io = getIoInstance();
      if (io) {
        io.to(tournamentId).emit('tournament:match_created', convertToMatchInfo(match));
      }
    }
  }

  const io = getIoInstance();
  if (io) {
    io.to(tournamentId).emit('tournament:round_started', tournamentId, roundNumber, matchIds.length);
  }

  return matchIds;
}

/**
 * Check if current round is complete and advance
 */
function checkRoundComplete(io: SocketIOServer, tournamentId: string) {
  const tournament = tournaments.get(tournamentId);
  if (!tournament) return;

  const currentRoundMatches = tournament.matches
    .map(id => matches.get(id))
    .filter(m => m && m.roundNumber === tournament.currentRound);

  // Check if all matches in current round are complete
  const allComplete = currentRoundMatches.every(m => m?.status === MatchStatus.Completed);

  if (!allComplete) return;

  console.log(`Round ${tournament.currentRound} complete for tournament ${tournamentId}`);

  if (tournament.tournamentType === TournamentType.SingleElimination) {
    // Get winners from current round
    const winners = currentRoundMatches
      .map(m => m?.winner)
      .filter(w => w && w !== '0x0000000000000000000000000000000000000000') as string[];

    if (winners.length === 1) {
      // Tournament complete
      finalizeTournament(io, tournamentId, winners);
    } else {
      // Generate next round
      tournament.currentRound++;
      const nextRoundMatchIds = generateMatches(tournamentId, tournament.tournamentType, winners, tournament.currentRound);
      tournament.matches.push(...nextRoundMatchIds);
    }
  } else if (tournament.tournamentType === TournamentType.Swiss) {
    // Check if we've completed enough rounds (typically log2(participants))
    const targetRounds = Math.ceil(Math.log2(tournament.participants.length));
    if (tournament.currentRound >= targetRounds) {
      finalizeTournament(io, tournamentId, tournament.participants);
    } else {
      // Generate next round
      tournament.currentRound++;
      const nextRoundMatchIds = generateMatches(tournamentId, tournament.tournamentType, tournament.participants, tournament.currentRound);
      tournament.matches.push(...nextRoundMatchIds);
    }
  } else if (tournament.tournamentType === TournamentType.RoundRobin) {
    // Round robin is complete
    finalizeTournament(io, tournamentId, tournament.participants);
  }
}

/**
 * Finalize tournament and calculate winners
 */
function finalizeTournament(io: SocketIOServer, tournamentId: string, participants: string[]) {
  const tournament = tournaments.get(tournamentId);
  if (!tournament) return;

  tournament.status = TournamentStatus.Finished;

  // Calculate final standings
  const standings = calculateStandings(tournamentId, tournament);

  // Top 8 get prizes
  const winners = standings.slice(0, 8).map(s => s.player);
  const prizes = calculatePrizes(tournament.prizePool, winners.length);

  tournament.winners = winners;
  tournament.prizes = prizes.map(p => p.toString());

  io.to(tournamentId).emit('tournament:finished', tournamentId, winners as `0x${string}`[], prizes);
  io.emit('tournament:updated', convertToTournamentInfo(tournament));

  console.log(`Tournament ${tournamentId} finished. Winners:`, winners);
}

/**
 * Calculate tournament standings
 */
function calculateStandings(tournamentId: string, tournament: StoredTournament): TournamentStanding[] {
  const standings: TournamentStanding[] = [];
  const playerWins = new Map<string, number>();
  const playerLosses = new Map<string, number>();
  const playerScores = new Map<string, number>();

  // Initialize all participants
  tournament.participants.forEach(player => {
    playerWins.set(player, 0);
    playerLosses.set(player, 0);
    playerScores.set(player, 0);
  });

  // Count wins/losses from matches
  tournament.matches.forEach(matchId => {
    const match = matches.get(matchId);
    if (!match || match.status !== MatchStatus.Completed) return;

    match.players.forEach(player => {
      if (player === match.winner) {
        playerWins.set(player, (playerWins.get(player) || 0) + 1);
        playerScores.set(player, (playerScores.get(player) || 0) + (match.scores.get(player) || 0));
      } else {
        playerLosses.set(player, (playerLosses.get(player) || 0) + 1);
      }
    });
  });

  // Create standings
  tournament.participants.forEach(player => {
    standings.push({
      rank: 0, // Will be set after sorting
      player: player as `0x${string}`,
      wins: playerWins.get(player) || 0,
      losses: playerLosses.get(player) || 0,
      score: playerScores.get(player) || 0,
    });
  });

  // Sort by wins, then by score
  standings.sort((a, b) => {
    if (a.wins !== b.wins) return b.wins - a.wins;
    return b.score - a.score;
  });

  // Assign ranks
  standings.forEach((s, i) => {
    s.rank = i + 1;
  });

  return standings;
}

/**
 * Calculate prize distribution
 */
function calculatePrizes(prizePool: bigint, winnerCount: number): bigint[] {
  const prizes: bigint[] = [];
  const houseFee = (prizePool * BigInt(5)) / BigInt(100);
  const distributionPool = prizePool - houseFee;

  const percentages = [40, 25, 15, 10, 5, 3, 1, 1];
  const payoutCount = Math.min(winnerCount, 8);

  for (let i = 0; i < payoutCount; i++) {
    const prize = (distributionPool * BigInt(percentages[i])) / BigInt(100);
    prizes.push(prize);
  }

  return prizes;
}

/**
 * Generate bracket visualization data
 */
function generateBracket(tournamentId: string, tournament: StoredTournament): TournamentBracket {
  const rounds: any[][] = [];
  const matchesByRound = new Map<number, StoredMatch[]>();

  // Group matches by round
  tournament.matches.forEach(matchId => {
    const match = matches.get(matchId);
    if (!match) return;

    if (!matchesByRound.has(match.roundNumber)) {
      matchesByRound.set(match.roundNumber, []);
    }
    matchesByRound.get(match.roundNumber)!.push(match);
  });

  // Sort rounds
  const sortedRounds = Array.from(matchesByRound.keys()).sort((a, b) => a - b);

  sortedRounds.forEach(roundNum => {
    const roundMatches = matchesByRound.get(roundNum) || [];
    const roundNodes = roundMatches.map((match, index) => ({
      matchId: match.matchId,
      roundNumber: match.roundNumber,
      matchNumber: match.matchNumber,
      players: match.players.map(addr => ({ address: addr })),
      winner: match.winner !== '0x0000000000000000000000000000000000000000' ? match.winner : undefined,
      status: match.status,
      position: {
        x: (roundNum - 1) * 250,
        y: index * 100,
      },
    }));
    rounds.push(roundNodes);
  });

  return {
    tournamentId,
    type: tournament.tournamentType,
    rounds,
    totalRounds: sortedRounds.length,
  };
}

/**
 * Schedule auto-start for tournament
 */
function scheduleAutoStart(io: SocketIOServer, tournamentId: string, startTime: number) {
  const now = Math.floor(Date.now() / 1000);
  const delay = (startTime - now) * 1000;

  if (delay > 0) {
    setTimeout(() => {
      startTournament(io, tournamentId);
    }, delay);
  }
}

/**
 * Convert stored tournament to TournamentInfo
 */
function convertToTournamentInfo(tournament: StoredTournament): TournamentInfo {
  return {
    id: BigInt(tournament.id.split('_')[1] || 0),
    name: tournament.name,
    description: tournament.description,
    tournamentType: tournament.tournamentType,
    status: tournament.status,
    recurrence: tournament.recurrence,
    entryFee: tournament.entryFee,
    minParticipants: tournament.minParticipants,
    maxParticipants: tournament.maxParticipants,
    currentParticipants: tournament.currentParticipants,
    prizePool: tournament.prizePool,
    guaranteedPrize: tournament.guaranteedPrize,
    registrationStart: BigInt(tournament.registrationStart),
    registrationEnd: BigInt(tournament.registrationEnd),
    tournamentStart: BigInt(tournament.tournamentStart),
    creator: tournament.creator,
    sponsor: tournament.sponsor,
    requiresGoldNFT: tournament.requiresGoldNFT,
    difficulty: tournament.difficulty,
    currentRound: BigInt(tournament.currentRound),
  };
}

/**
 * Convert stored match to MatchInfo
 */
function convertToMatchInfo(match: StoredMatch): MatchInfo {
  return {
    matchId: BigInt(match.matchId.split('_')[1] || 0),
    tournamentId: BigInt(match.tournamentId.split('_')[1] || 0),
    roundNumber: BigInt(match.roundNumber),
    matchNumber: BigInt(match.matchNumber),
    roomId: BigInt(0),
    players: match.players,
    winner: match.winner,
    status: match.status,
    startTime: BigInt(match.startTime),
  };
}

// Global io instance (set from main socket handler)
let globalIo: SocketIOServer | null = null;

export function setIoInstance(io: SocketIOServer) {
  globalIo = io;
}

function getIoInstance(): SocketIOServer | null {
  return globalIo;
}
