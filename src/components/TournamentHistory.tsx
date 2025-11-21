/**
 * Tournament History Component
 * Display player's tournament history and statistics
 */

import React, { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useTournamentStore } from '../stores/tournamentStore';
import { formatTimestamp } from '../utils/tournamentContract';

export default function TournamentHistory() {
  const { address } = useAccount();
  const { userTournaments, userStats, fetchUserTournaments, fetchUserStats } = useTournamentStore();

  useEffect(() => {
    if (address) {
      fetchUserTournaments(address);
      fetchUserStats(address);
    }
  }, [address, fetchUserTournaments, fetchUserStats]);

  if (!address) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">Please connect your wallet to view tournament history</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-white mb-6">Tournament History</h2>

      {/* Stats Overview */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Tournaments Played</div>
            <div className="text-white text-3xl font-bold">
              {Number(userStats.tournamentsPlayed)}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Tournaments Won</div>
            <div className="text-green-400 text-3xl font-bold">
              {Number(userStats.tournamentsWon)}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Total Prizes</div>
            <div className="text-yellow-400 text-3xl font-bold">
              {(Number(userStats.totalPrizes) / 1e18).toFixed(3)}
            </div>
            <div className="text-gray-500 text-xs">CELO</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Best Placement</div>
            <div className="text-blue-400 text-3xl font-bold">
              {Number(userStats.bestPlacement) > 0 ? `#${Number(userStats.bestPlacement)}` : '-'}
            </div>
          </div>
        </div>
      )}

      {/* Win/Loss Record */}
      {userStats && Number(userStats.matchesWon) + Number(userStats.matchesLost) > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Match Record</h3>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-green-400 text-2xl font-bold">
                {Number(userStats.matchesWon)}
              </span>
              <span className="text-gray-400 ml-2">Wins</span>
            </div>
            <div className="text-gray-600 text-3xl">-</div>
            <div>
              <span className="text-red-400 text-2xl font-bold">
                {Number(userStats.matchesLost)}
              </span>
              <span className="text-gray-400 ml-2">Losses</span>
            </div>
            <div className="ml-auto">
              <span className="text-gray-400">Win Rate: </span>
              <span className="text-white text-xl font-bold">
                {(
                  (Number(userStats.matchesWon) /
                    (Number(userStats.matchesWon) + Number(userStats.matchesLost))) *
                  100
                ).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tournament List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Past Tournaments</h3>

        {userTournaments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No tournament history yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Join a tournament to start building your record!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {userTournaments.map((tournament) => (
              <div
                key={tournament.id.toString()}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-bold text-lg">{tournament.name}</h4>
                    <p className="text-gray-400 text-sm">
                      {formatTimestamp(tournament.tournamentStart)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 font-bold">
                      {(Number(tournament.entryFee) / 1e18).toFixed(3)} CELO
                    </div>
                    <div className="text-gray-500 text-xs">Entry Fee</div>
                  </div>
                </div>

                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Participants: </span>
                    <span className="text-white">
                      {Number(tournament.currentParticipants)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Prize Pool: </span>
                    <span className="text-yellow-400">
                      {(Number(tournament.prizePool) / 1e18).toFixed(3)} CELO
                    </span>
                  </div>
                  {tournament.status === 3 && (
                    <div>
                      <span className="text-green-400">✓ Finished</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
