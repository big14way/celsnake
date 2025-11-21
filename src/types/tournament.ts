export enum TournamentType {
  SingleElimination = 0,
  DoubleElimination = 1,
  RoundRobin = 2,
  Swiss = 3,
  Ladder = 4,
}

export enum TournamentStatus {
  Registration = 0,
  Starting = 1,
  InProgress = 2,
  Finished = 3,
  Cancelled = 4,
}

export enum MatchStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3,
}

export enum RecurrenceType {
  None = 0,
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
}

export interface TournamentInfo {
  id: bigint;
  name: string;
  description: string;
  tournamentType: TournamentType;
  status: TournamentStatus;
  recurrence: RecurrenceType;
  entryFee: bigint;
  minParticipants: bigint;
  maxParticipants: bigint;
  currentParticipants: bigint;
  prizePool: bigint;
  guaranteedPrize: bigint;
  registrationStart: bigint;
  registrationEnd: bigint;
  tournamentStart: bigint;
  creator: `0x${string}`;
  sponsor: `0x${string}`;
  requiresGoldNFT: boolean;
  difficulty: number;
  currentRound: bigint;
}

export interface MatchInfo {
  matchId: bigint;
  tournamentId: bigint;
  roundNumber: bigint;
  matchNumber: bigint;
  roomId: bigint;
  players: `0x${string}`[];
  winner: `0x${string}`;
  status: MatchStatus;
  startTime: bigint;
}

export interface PlayerTournamentStats {
  tournamentsPlayed: bigint;
  tournamentsWon: bigint;
  totalPrizes: bigint;
  matchesWon: bigint;
  matchesLost: bigint;
  bestPlacement: bigint;
  currentRating: bigint;
}

export interface BracketNode {
  matchId: string;
  roundNumber: number;
  matchNumber: number;
  players: {
    address: `0x${string}`;
    nickname?: string;
    score?: number;
  }[];
  winner?: `0x${string}`;
  status: MatchStatus;
  position: {
    x: number;
    y: number;
  };
  nextMatchId?: string;
  previousMatchIds?: string[];
}

export interface TournamentBracket {
  tournamentId: string;
  type: TournamentType;
  rounds: BracketNode[][];
  totalRounds: number;
}

export interface TournamentStanding {
  rank: number;
  player: `0x${string}`;
  nickname?: string;
  wins: number;
  losses: number;
  score: number;
  prize?: bigint;
}

export interface CreateTournamentParams {
  name: string;
  description: string;
  tournamentType: TournamentType;
  entryFee: bigint;
  minParticipants: number;
  maxParticipants: number;
  registrationStart: number; // timestamp
  registrationEnd: number; // timestamp
  tournamentStart: number; // timestamp
  requiresGoldNFT: boolean;
  difficulty: number;
  recurrence: RecurrenceType;
  sponsorAmount?: bigint;
}

export interface TournamentFilters {
  status?: TournamentStatus[];
  type?: TournamentType[];
  entryFeeMin?: bigint;
  entryFeeMax?: bigint;
  requiresGoldNFT?: boolean;
  showFull?: boolean;
}

// WebSocket event types
export interface TournamentSocketEvents {
  // Client -> Server
  'tournament:create': (params: CreateTournamentParams) => void;
  'tournament:register': (tournamentId: string) => void;
  'tournament:unregister': (tournamentId: string) => void;
  'tournament:get_all': () => void;
  'tournament:get_details': (tournamentId: string) => void;
  'tournament:get_bracket': (tournamentId: string) => void;
  'tournament:get_standings': (tournamentId: string) => void;

  // Server -> Client
  'tournament:created': (tournament: TournamentInfo) => void;
  'tournament:updated': (tournament: TournamentInfo) => void;
  'tournament:registered': (tournamentId: string, player: `0x${string}`) => void;
  'tournament:unregistered': (tournamentId: string, player: `0x${string}`) => void;
  'tournament:started': (tournamentId: string, participantCount: number) => void;
  'tournament:round_started': (tournamentId: string, roundNumber: number, matchCount: number) => void;
  'tournament:match_created': (match: MatchInfo) => void;
  'tournament:match_started': (matchId: string, roomId: string) => void;
  'tournament:match_completed': (matchId: string, winner: `0x${string}`) => void;
  'tournament:bracket_updated': (bracket: TournamentBracket) => void;
  'tournament:standings_updated': (standings: TournamentStanding[]) => void;
  'tournament:finished': (tournamentId: string, winners: `0x${string}`[], prizes: bigint[]) => void;
  'tournament:cancelled': (tournamentId: string, reason: string) => void;
  'tournament:list': (tournaments: TournamentInfo[]) => void;
  'tournament:error': (error: string) => void;
}
