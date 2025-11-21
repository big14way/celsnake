/**
 * Tournament Container
 * Main wrapper for tournament features
 */

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useTournamentStore } from '../stores/tournamentStore';
import { useMultiplayerStore } from '../stores/multiplayerStore';
import TournamentLobby from './TournamentLobby';
import TournamentBracket from './TournamentBracket';
import TournamentMatch from './TournamentMatch';
import TournamentHistory from './TournamentHistory';
import toast from 'react-hot-toast';

type TournamentView = 'lobby' | 'details' | 'match' | 'history';

export default function TournamentContainer() {
  const { address } = useAccount();
  const { connected, socket } = useMultiplayerStore();
  const {
    currentTournament,
    currentBracket,
    currentStandings,
    setSocket,
    fetchTournaments,
    fetchUserTournaments,
  } = useTournamentStore();

  const [view, setView] = useState<TournamentView>('lobby');

  // Set socket instance for tournament store
  useEffect(() => {
    if (socket) {
      setSocket(socket);
    }
  }, [socket, setSocket]);

  // Fetch tournaments on mount
  useEffect(() => {
    if (connected) {
      fetchTournaments();
    }
  }, [connected, fetchTournaments]);

  // Fetch user tournaments
  useEffect(() => {
    if (connected && address) {
      fetchUserTournaments(address);
    }
  }, [connected, address, fetchUserTournaments]);

  // Check if user needs to connect
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-800 rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Tournament Mode
          </h2>
          <p className="text-gray-400 mb-6">
            Connect to the server to view and join tournaments
          </p>
          <button
            onClick={() => useMultiplayerStore.getState().connect()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Connect to Server
          </button>
        </div>
      </div>
    );
  }

  // Check wallet connection
  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-800 rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Connect Wallet
          </h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to participate in tournaments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setView('lobby')}
          className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
            view === 'lobby'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Tournament Lobby
        </button>
        <button
          onClick={() => setView('details')}
          disabled={!currentTournament}
          className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
            view === 'details'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          Tournament Details
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
            view === 'history'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          My History
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-gray-900 rounded-lg shadow-xl">
        {view === 'lobby' && (
          <TournamentLobby onSelectTournament={() => setView('details')} />
        )}

        {view === 'details' && currentTournament && (
          <div className="p-6">
            <div className="mb-6">
              <button
                onClick={() => setView('lobby')}
                className="text-blue-400 hover:text-blue-300 mb-4"
              >
                ← Back to Lobby
              </button>

              <h2 className="text-3xl font-bold text-white mb-2">
                {currentTournament.name}
              </h2>
              <p className="text-gray-400">{currentTournament.description}</p>
            </div>

            {/* Tournament Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Entry Fee</div>
                <div className="text-white text-xl font-bold">
                  {(Number(currentTournament.entryFee) / 1e18).toFixed(3)} CELO
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Prize Pool</div>
                <div className="text-white text-xl font-bold">
                  {(Number(currentTournament.prizePool) / 1e18).toFixed(3)} CELO
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Participants</div>
                <div className="text-white text-xl font-bold">
                  {Number(currentTournament.currentParticipants)} / {Number(currentTournament.maxParticipants)}
                </div>
              </div>
            </div>

            {/* Bracket Visualization */}
            {currentBracket && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Tournament Bracket</h3>
                <TournamentBracket bracket={currentBracket} />
              </div>
            )}

            {/* Standings */}
            {currentStandings.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Standings</h3>
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-white">Rank</th>
                        <th className="px-4 py-3 text-left text-white">Player</th>
                        <th className="px-4 py-3 text-center text-white">Wins</th>
                        <th className="px-4 py-3 text-center text-white">Losses</th>
                        <th className="px-4 py-3 text-right text-white">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStandings.map((standing) => (
                        <tr
                          key={standing.player}
                          className="border-t border-gray-700 hover:bg-gray-750"
                        >
                          <td className="px-4 py-3 text-white font-bold">#{standing.rank}</td>
                          <td className="px-4 py-3 text-white font-mono text-sm">
                            {standing.nickname || `${standing.player.slice(0, 6)}...${standing.player.slice(-4)}`}
                          </td>
                          <td className="px-4 py-3 text-center text-green-400">{standing.wins}</td>
                          <td className="px-4 py-3 text-center text-red-400">{standing.losses}</td>
                          <td className="px-4 py-3 text-right text-white">{standing.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'history' && <TournamentHistory />}
      </div>
    </div>
  );
}
