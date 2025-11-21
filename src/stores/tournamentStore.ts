/**
 * Tournament State Management with Zustand
 * Manages tournament lifecycle, brackets, and real-time updates
 */

import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import type {
  TournamentInfo,
  MatchInfo,
  TournamentBracket,
  TournamentStanding,
  CreateTournamentParams,
  TournamentFilters,
  PlayerTournamentStats,
  TournamentStatus,
} from '../types/tournament';
import { BracketGenerator } from '../utils/bracketGenerator';

interface TournamentState {
  // Connection state (shares socket with multiplayer store)
  socket: Socket | null;

  // Tournament lists
  activeTournaments: TournamentInfo[];
  upcomingTournaments: TournamentInfo[];
  finishedTournaments: TournamentInfo[];

  // Current tournament context
  currentTournament: TournamentInfo | null;
  currentBracket: TournamentBracket | null;
  currentStandings: TournamentStanding[];
  currentMatches: MatchInfo[];

  // User's tournaments
  userTournaments: TournamentInfo[];
  userStats: PlayerTournamentStats | null;

  // Filters
  filters: TournamentFilters;

  // Loading states
  loading: {
    tournaments: boolean;
    bracket: boolean;
    registration: boolean;
  };

  // Actions
  setSocket: (socket: Socket | null) => void;

  // Tournament management
  fetchTournaments: (status?: TournamentStatus) => void;
  fetchTournamentDetails: (tournamentId: string) => void;
  fetchBracket: (tournamentId: string) => void;
  fetchStandings: (tournamentId: string) => void;
  fetchUserTournaments: (address: `0x${string}`) => void;
  fetchUserStats: (address: `0x${string}`) => void;

  // User actions
  createTournament: (params: CreateTournamentParams) => void;
  registerForTournament: (tournamentId: string) => void;
  unregisterFromTournament: (tournamentId: string) => void;

  // Filters
  setFilters: (filters: Partial<TournamentFilters>) => void;
  clearFilters: () => void;

  // Reset
  reset: () => void;
}

const initialState = {
  socket: null,
  activeTournaments: [],
  upcomingTournaments: [],
  finishedTournaments: [],
  currentTournament: null,
  currentBracket: null,
  currentStandings: [],
  currentMatches: [],
  userTournaments: [],
  userStats: null,
  filters: {},
  loading: {
    tournaments: false,
    bracket: false,
    registration: false,
  },
};

export const useTournamentStore = create<TournamentState>((set, get) => ({
  ...initialState,

  /**
   * Set socket instance (should be called from multiplayer store)
   */
  setSocket: (socket: Socket | null) => {
    // Remove old listeners
    const oldSocket = get().socket;
    if (oldSocket) {
      oldSocket.off('tournament:created');
      oldSocket.off('tournament:updated');
      oldSocket.off('tournament:registered');
      oldSocket.off('tournament:unregistered');
      oldSocket.off('tournament:started');
      oldSocket.off('tournament:round_started');
      oldSocket.off('tournament:match_created');
      oldSocket.off('tournament:match_started');
      oldSocket.off('tournament:match_completed');
      oldSocket.off('tournament:bracket_updated');
      oldSocket.off('tournament:standings_updated');
      oldSocket.off('tournament:finished');
      oldSocket.off('tournament:cancelled');
      oldSocket.off('tournament:list');
      oldSocket.off('tournament:error');
    }

    if (socket) {
      // Tournament lifecycle events
      socket.on('tournament:created', (tournament: TournamentInfo) => {
        console.log('Tournament created:', tournament);
        toast.success(`Tournament "${tournament.name}" created!`);
        get().fetchTournaments();
      });

      socket.on('tournament:updated', (tournament: TournamentInfo) => {
        console.log('Tournament updated:', tournament);
        const current = get().currentTournament;
        if (current && current.id === tournament.id) {
          set({ currentTournament: tournament });
        }
        get().fetchTournaments();
      });

      socket.on('tournament:registered', (tournamentId: string, player: `0x${string}`) => {
        console.log('Player registered:', tournamentId, player);
        const current = get().currentTournament;
        if (current && current.id.toString() === tournamentId) {
          get().fetchTournamentDetails(tournamentId);
        }
      });

      socket.on('tournament:unregistered', (tournamentId: string, player: `0x${string}`) => {
        console.log('Player unregistered:', tournamentId, player);
        const current = get().currentTournament;
        if (current && current.id.toString() === tournamentId) {
          get().fetchTournamentDetails(tournamentId);
        }
      });

      socket.on('tournament:started', (tournamentId: string, participantCount: number) => {
        console.log('Tournament started:', tournamentId, participantCount);
        toast(`Tournament started with ${participantCount} players!`, {
          icon: '🏆',
          duration: 5000,
        });
        get().fetchTournaments();
        get().fetchBracket(tournamentId);
      });

      socket.on('tournament:round_started', (tournamentId: string, roundNumber: number, matchCount: number) => {
        console.log('Round started:', tournamentId, roundNumber, matchCount);
        const current = get().currentTournament;
        if (current && current.id.toString() === tournamentId) {
          toast(`Round ${roundNumber} started with ${matchCount} matches!`, {
            icon: '⚔️',
          });
          get().fetchBracket(tournamentId);
        }
      });

      socket.on('tournament:match_created', (match: MatchInfo) => {
        console.log('Match created:', match);
        const current = get().currentTournament;
        if (current && current.id === match.tournamentId) {
          set(state => ({
            currentMatches: [...state.currentMatches, match],
          }));
        }
      });

      socket.on('tournament:match_started', (matchId: string, roomId: string) => {
        console.log('Match started:', matchId, roomId);
        const matches = get().currentMatches;
        const match = matches.find(m => m.matchId.toString() === matchId);
        if (match) {
          toast('Your match is starting!', { icon: '⚡' });
        }
      });

      socket.on('tournament:match_completed', (matchId: string, winner: `0x${string}`) => {
        console.log('Match completed:', matchId, winner);
        const current = get().currentTournament;
        if (current) {
          get().fetchBracket(current.id.toString());
          get().fetchStandings(current.id.toString());
        }
      });

      socket.on('tournament:bracket_updated', (bracket: TournamentBracket) => {
        console.log('Bracket updated:', bracket);
        set({ currentBracket: bracket });
      });

      socket.on('tournament:standings_updated', (standings: TournamentStanding[]) => {
        console.log('Standings updated:', standings);
        set({ currentStandings: standings });
      });

      socket.on('tournament:finished', (tournamentId: string, winners: `0x${string}`[], prizes: bigint[]) => {
        console.log('Tournament finished:', tournamentId, winners, prizes);
        toast('Tournament finished!', { icon: '🏁', duration: 5000 });
        get().fetchTournaments();
        const current = get().currentTournament;
        if (current && current.id.toString() === tournamentId) {
          get().fetchTournamentDetails(tournamentId);
        }
      });

      socket.on('tournament:cancelled', (tournamentId: string, reason: string) => {
        console.log('Tournament cancelled:', tournamentId, reason);
        toast.error(`Tournament cancelled: ${reason}`);
        get().fetchTournaments();
      });

      socket.on('tournament:list', (tournaments: TournamentInfo[]) => {
        console.log('Received tournament list:', tournaments.length);

        // Categorize tournaments by status
        const active = tournaments.filter(t => t.status === 2); // InProgress
        const upcoming = tournaments.filter(t => t.status === 0 || t.status === 1); // Registration or Starting
        const finished = tournaments.filter(t => t.status === 3); // Finished

        set({
          activeTournaments: active,
          upcomingTournaments: upcoming,
          finishedTournaments: finished,
          loading: { ...get().loading, tournaments: false },
        });
      });

      socket.on('tournament:error', (error: string) => {
        console.error('Tournament error:', error);
        toast.error(error);
        set({
          loading: {
            tournaments: false,
            bracket: false,
            registration: false,
          },
        });
      });
    }

    set({ socket });
  },

  /**
   * Fetch tournaments by status
   */
  fetchTournaments: (status?: TournamentStatus) => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }

    set(state => ({
      loading: { ...state.loading, tournaments: true },
    }));

    socket.emit('tournament:get_all', { status });
  },

  /**
   * Fetch detailed tournament information
   */
  fetchTournamentDetails: (tournamentId: string) => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }

    socket.emit('tournament:get_details', { tournamentId });

    // Also fetch bracket and standings
    get().fetchBracket(tournamentId);
    get().fetchStandings(tournamentId);
  },

  /**
   * Fetch tournament bracket
   */
  fetchBracket: (tournamentId: string) => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }

    set(state => ({
      loading: { ...state.loading, bracket: true },
    }));

    socket.emit('tournament:get_bracket', { tournamentId });

    // Listen for bracket response
    socket.once('tournament:bracket_updated', (bracket: TournamentBracket) => {
      set({
        currentBracket: bracket,
        loading: { ...get().loading, bracket: false },
      });
    });
  },

  /**
   * Fetch tournament standings
   */
  fetchStandings: (tournamentId: string) => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }

    socket.emit('tournament:get_standings', { tournamentId });

    // Listen for standings response
    socket.once('tournament:standings_updated', (standings: TournamentStanding[]) => {
      set({ currentStandings: standings });
    });
  },

  /**
   * Fetch user's tournament history
   */
  fetchUserTournaments: (address: `0x${string}`) => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }

    socket.emit('tournament:get_user_tournaments', { address });

    socket.once('tournament:user_tournaments', (tournaments: TournamentInfo[]) => {
      set({ userTournaments: tournaments });
    });
  },

  /**
   * Fetch user's tournament stats
   */
  fetchUserStats: (address: `0x${string}`) => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }

    socket.emit('tournament:get_user_stats', { address });

    socket.once('tournament:user_stats', (stats: PlayerTournamentStats) => {
      set({ userStats: stats });
    });
  },

  /**
   * Create a new tournament
   */
  createTournament: (params: CreateTournamentParams) => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    // Convert BigInt values to strings for Socket.IO serialization
    const serializedParams = {
      ...params,
      entryFee: params.entryFee.toString(),
      sponsorAmount: params.sponsorAmount?.toString() || '0',
    };

    socket.emit('tournament:create', serializedParams);
  },

  /**
   * Register for a tournament
   */
  registerForTournament: (tournamentId: string) => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    set(state => ({
      loading: { ...state.loading, registration: true },
    }));

    socket.emit('tournament:register', { tournamentId });

    // Listen for confirmation
    const handleSuccess = () => {
      toast.success('Successfully registered for tournament!');
      set(state => ({
        loading: { ...state.loading, registration: false },
      }));
      get().fetchTournamentDetails(tournamentId);
    };

    const handleError = (error: string) => {
      toast.error(error);
      set(state => ({
        loading: { ...state.loading, registration: false },
      }));
    };

    socket.once('tournament:registered', handleSuccess);
    socket.once('tournament:error', handleError);
  },

  /**
   * Unregister from a tournament
   */
  unregisterFromTournament: (tournamentId: string) => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('tournament:unregister', { tournamentId });

    socket.once('tournament:unregistered', () => {
      toast.success('Unregistered from tournament');
      get().fetchTournamentDetails(tournamentId);
    });
  },

  /**
   * Set tournament filters
   */
  setFilters: (filters: Partial<TournamentFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  /**
   * Clear all filters
   */
  clearFilters: () => {
    set({ filters: {} });
  },

  /**
   * Reset tournament state
   */
  reset: () => {
    set(initialState);
  },
}));

// Helper hook to get filtered tournaments
export function useFilteredTournaments() {
  const { upcomingTournaments, filters } = useTournamentStore();

  return upcomingTournaments.filter(tournament => {
    // Status filter
    if (filters.status && !filters.status.includes(tournament.status)) {
      return false;
    }

    // Type filter
    if (filters.type && !filters.type.includes(tournament.tournamentType)) {
      return false;
    }

    // Entry fee filter
    if (filters.entryFeeMin !== undefined && tournament.entryFee < filters.entryFeeMin) {
      return false;
    }
    if (filters.entryFeeMax !== undefined && tournament.entryFee > filters.entryFeeMax) {
      return false;
    }

    // NFT requirement filter
    if (filters.requiresGoldNFT !== undefined && tournament.requiresGoldNFT !== filters.requiresGoldNFT) {
      return false;
    }

    // Full tournaments filter
    if (filters.showFull === false && tournament.currentParticipants >= tournament.maxParticipants) {
      return false;
    }

    return true;
  });
}
