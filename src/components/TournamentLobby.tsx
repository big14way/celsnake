/**
 * Tournament Lobby
 * Browse and create tournaments
 */

import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useTournamentStore } from '../stores/tournamentStore';
import type { TournamentInfo } from '../types/tournament';
import {
  TournamentType,
  TournamentStatus,
  RecurrenceType,
  CreateTournamentParams,
} from '../types/tournament';
import {
  getTournamentTypeName,
  getTournamentStatusName,
  isRegistrationOpen,
  isTournamentFull,
  getTimeUntilStart,
  formatDuration,
  formatTimestamp,
  TOURNAMENT_CONTRACT_ADDRESS,
  TOURNAMENT_MANAGER_ABI,
} from '../utils/tournamentContract';
import toast from 'react-hot-toast';

interface TournamentLobbyProps {
  onSelectTournament: () => void;
}

export default function TournamentLobby({ onSelectTournament }: TournamentLobbyProps) {
  const { address } = useAccount();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active'>('upcoming');
  const [filters, setFilters] = useState<any>({});

  // Smart contract hooks for creating tournaments
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  // Read active tournaments from blockchain
  const { data: activeTournamentsData, refetch: refetchActive, isLoading: isLoadingActive } = useReadContract({
    address: TOURNAMENT_CONTRACT_ADDRESS,
    abi: TOURNAMENT_MANAGER_ABI,
    functionName: 'getActiveTournaments',
  });

  // Read upcoming tournaments from blockchain
  const { data: upcomingTournamentsData, refetch: refetchUpcoming, isLoading: isLoadingUpcoming } = useReadContract({
    address: TOURNAMENT_CONTRACT_ADDRESS,
    abi: TOURNAMENT_MANAGER_ABI,
    functionName: 'getUpcomingTournaments',
  });

  const activeTournaments = (activeTournamentsData as TournamentInfo[]) || [];
  const upcomingTournaments = (upcomingTournamentsData as TournamentInfo[]) || [];
  const filteredTournaments = activeTab === 'upcoming' ? upcomingTournaments : activeTournaments;
  const loading = { tournaments: isLoadingActive || isLoadingUpcoming, registration: false };

  // Debug logging
  useEffect(() => {
    console.log('=== Tournament Data Debug ===');
    console.log('Active tournaments raw:', activeTournamentsData);
    console.log('Upcoming tournaments raw:', upcomingTournamentsData);
    console.log('Active tournaments parsed:', activeTournaments);
    console.log('Upcoming tournaments parsed:', upcomingTournaments);
    console.log('Filtered tournaments:', filteredTournaments);
    console.log('Current tab:', activeTab);
    console.log('Loading state:', loading);
  }, [activeTournamentsData, upcomingTournamentsData, activeTournaments, upcomingTournaments, filteredTournaments, activeTab, loading]);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Create tournament form state
  const [formData, setFormData] = useState<Partial<CreateTournamentParams>>({
    name: '',
    description: '',
    tournamentType: TournamentType.SingleElimination,
    entryFee: parseEther('0.01'),
    minParticipants: 4,
    maxParticipants: 16,
    requiresGoldNFT: false,
    difficulty: 2, // Medium
    recurrence: RecurrenceType.None,
    sponsorAmount: BigInt(0),
  });

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      // Check if it was a tournament creation or registration
      toast.dismiss(); // Dismiss loading toast
      toast.success('Transaction successful!');

      // Reset form if it was tournament creation
      if (showCreateForm) {
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          tournamentType: TournamentType.SingleElimination,
          entryFee: parseEther('0.01'),
          minParticipants: 4,
          maxParticipants: 16,
          requiresGoldNFT: false,
          difficulty: 2,
          recurrence: RecurrenceType.None,
          sponsorAmount: BigInt(0),
        });
      }

      // Refetch tournaments from blockchain
      setTimeout(() => {
        refetchActive();
        refetchUpcoming();
      }, 2000); // Wait 2 seconds for blockchain to update
    }
  }, [isSuccess, refetchActive, refetchUpcoming, showCreateForm]);

  // Handle transaction error
  React.useEffect(() => {
    if (error) {
      toast.error(`Transaction failed: ${error.message}`);
    }
  }, [error]);

  const handleCreateTournament = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!formData.name || formData.name.length === 0) {
      toast.error('Please enter a tournament name');
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const regStart = now + 300; // Start in 5 minutes
    const regEnd = now + 3600; // End in 1 hour
    const tournamentStart = now + 3900; // Start 5 minutes after registration ends

    try {
      // Call smart contract to create tournament
      writeContract({
        address: TOURNAMENT_CONTRACT_ADDRESS,
        abi: TOURNAMENT_MANAGER_ABI,
        functionName: 'createTournament',
        args: [
          formData.name,                    // _name
          formData.description || '',       // _description
          formData.tournamentType!,         // _tournamentType
          formData.entryFee!,               // _entryFee
          BigInt(formData.minParticipants!),// _minParticipants
          BigInt(formData.maxParticipants!),// _maxParticipants
          BigInt(regStart),                 // _registrationStart
          BigInt(regEnd),                   // _registrationEnd
          BigInt(tournamentStart),          // _tournamentStart
          formData.requiresGoldNFT!,        // _requiresGoldNFT
          formData.difficulty!,             // _difficulty
          formData.recurrence!,             // _recurrence
        ],
        value: formData.sponsorAmount || BigInt(0), // Sponsor amount as msg.value
      });

      toast.loading('Creating tournament...');
    } catch (err) {
      console.error('Error creating tournament:', err);
      toast.error('Failed to create tournament');
    }
  };

  const handleRegister = async (tournamentId: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    // Find the tournament to get entry fee
    const tournament = [...activeTournaments, ...upcomingTournaments].find(
      t => t.id.toString() === tournamentId
    );

    if (!tournament) {
      toast.error('Tournament not found');
      return;
    }

    try {
      // Call smart contract to register for tournament
      writeContract({
        address: TOURNAMENT_CONTRACT_ADDRESS,
        abi: TOURNAMENT_MANAGER_ABI,
        functionName: 'registerForTournament',
        args: [BigInt(tournamentId)],
        value: tournament.entryFee, // Pay entry fee
      });

      toast.loading('Registering for tournament...');
    } catch (err) {
      console.error('Error registering for tournament:', err);
      toast.error('Failed to register for tournament');
    }
  };

  const handleViewDetails = (tournamentId: string) => {
    // Find the tournament in our lists
    const tournament = [...activeTournaments, ...upcomingTournaments].find(
      t => t.id.toString() === tournamentId
    );

    if (tournament) {
      // Set the tournament in the store using Zustand's setState
      useTournamentStore.setState({ currentTournament: tournament });
      console.log('Viewing tournament details:', tournament);
      onSelectTournament();
    } else {
      toast.error('Tournament not found');
    }
  };

  const tournaments = activeTab === 'upcoming' ? filteredTournaments : activeTournaments;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Tournament Lobby</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {showCreateForm ? 'Cancel' : '+ Create Tournament'}
        </button>
      </div>

      {/* Create Tournament Form */}
      {showCreateForm && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Create New Tournament</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Tournament Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Weekend Showdown"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Tournament Type</label>
              <select
                value={formData.tournamentType}
                onChange={(e) => setFormData({ ...formData, tournamentType: parseInt(e.target.value) })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={TournamentType.SingleElimination}>Single Elimination</option>
                <option value={TournamentType.DoubleElimination}>Double Elimination</option>
                <option value={TournamentType.RoundRobin}>Round Robin</option>
                <option value={TournamentType.Swiss}>Swiss System</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Entry Fee (CELO)</label>
              <input
                type="number"
                step="0.001"
                value={Number(formData.entryFee) / 1e18}
                onChange={(e) => setFormData({ ...formData, entryFee: parseEther(e.target.value || '0') })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Max Participants</label>
              <select
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={4}>4 Players</option>
                <option value={8}>8 Players</option>
                <option value={16}>16 Players</option>
                <option value={32}>32 Players</option>
                <option value={64}>64 Players</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Easy</option>
                <option value={1}>Medium</option>
                <option value={2}>Hard</option>
                <option value={3}>Expert</option>
                <option value={4}>Master</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiresGoldNFT}
                  onChange={(e) => setFormData({ ...formData, requiresGoldNFT: e.target.checked })}
                  className="mr-2 w-5 h-5"
                />
                <span>Require Gold+ NFT</span>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-400 text-sm mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              placeholder="Tournament details and rules..."
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleCreateTournament}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Create Tournament
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Upcoming ({upcomingTournaments.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          In Progress ({activeTournaments.length})
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Type</label>
            <select
              value={filters.type?.[0] ?? ''}
              onChange={(e) =>
                setFilters({ type: e.target.value ? [parseInt(e.target.value)] : undefined })
              }
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value={TournamentType.SingleElimination}>Single Elimination</option>
              <option value={TournamentType.DoubleElimination}>Double Elimination</option>
              <option value={TournamentType.RoundRobin}>Round Robin</option>
              <option value={TournamentType.Swiss}>Swiss</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Entry Fee</label>
            <select
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="low">Low ({"<"} 0.01 CELO)</option>
              <option value="medium">Medium (0.01-0.1 CELO)</option>
              <option value="high">High ({"> "}0.1 CELO)</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center text-white cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showFull ?? true}
                onChange={(e) => setFilters({ showFull: e.target.checked })}
                className="mr-2 w-4 h-4"
              />
              <span className="text-sm">Show Full</span>
            </label>
          </div>

          <div className="flex items-end">
            <label className="flex items-center text-white cursor-pointer">
              <input
                type="checkbox"
                checked={filters.requiresGoldNFT ?? false}
                onChange={(e) => setFilters({ requiresGoldNFT: e.target.checked || undefined })}
                className="mr-2 w-4 h-4"
              />
              <span className="text-sm">NFT Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tournament List */}
      {loading.tournaments ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 mt-4">Loading tournaments...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-400 text-lg">No tournaments found</p>
          <p className="text-gray-500 text-sm mt-2">
            Create a new tournament to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tournaments.map((tournament: TournamentInfo) => {
            const registrationOpen = isRegistrationOpen(tournament);
            const isFull = isTournamentFull(tournament);
            const timeUntilStart = getTimeUntilStart(tournament);

            return (
              <div
                key={tournament.id.toString()}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                      {tournament.requiresGoldNFT && (
                        <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded">
                          NFT Required
                        </span>
                      )}
                    </div>
                    {tournament.description && (
                      <p className="text-gray-400 text-sm mb-2">{tournament.description}</p>
                    )}
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-400">
                        Type: <span className="text-white">{getTournamentTypeName(tournament.tournamentType)}</span>
                      </span>
                      <span className="text-gray-400">
                        Status: <span className="text-white">{getTournamentStatusName(tournament.status)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">
                      {(Number(tournament.entryFee) / 1e18).toFixed(3)} CELO
                    </div>
                    <div className="text-gray-400 text-sm">Entry Fee</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Prize Pool</div>
                    <div className="text-white font-bold">
                      {(Number(tournament.prizePool) / 1e18).toFixed(3)} CELO
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Participants</div>
                    <div className="text-white font-bold">
                      {Number(tournament.currentParticipants)} / {Number(tournament.maxParticipants)}
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Starts In</div>
                    <div className="text-white font-bold">
                      {timeUntilStart > 0 ? formatDuration(timeUntilStart) : 'Started'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewDetails(tournament.id.toString())}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    View Details
                  </button>

                  {registrationOpen && (
                    <button
                      onClick={() => handleRegister(tournament.id.toString())}
                      disabled={isFull || loading.registration}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      {isFull ? 'Full' : loading.registration ? 'Registering...' : 'Register'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
