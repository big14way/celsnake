/**
 * Tournament Match Component
 * Display current match in tournament
 */

import React from 'react';
import type { MatchInfo } from '../types/tournament';
import { MatchStatus } from '../types/tournament';

interface TournamentMatchProps {
  match: MatchInfo;
  onStartMatch?: () => void;
}

export default function TournamentMatch({ match, onStartMatch }: TournamentMatchProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          Round {Number(match.roundNumber)} - Match {Number(match.matchNumber)}
        </h3>
        <div className="inline-flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            match.status === MatchStatus.Pending
              ? 'bg-yellow-600 text-white'
              : match.status === MatchStatus.InProgress
              ? 'bg-blue-600 text-white'
              : match.status === MatchStatus.Completed
              ? 'bg-green-600 text-white'
              : 'bg-gray-600 text-white'
          }`}>
            {match.status === MatchStatus.Pending && 'Waiting to Start'}
            {match.status === MatchStatus.InProgress && 'In Progress'}
            {match.status === MatchStatus.Completed && 'Completed'}
            {match.status === MatchStatus.Cancelled && 'Cancelled'}
          </span>
        </div>
      </div>

      {/* Players */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {match.players.map((player, index) => (
          <div
            key={player}
            className={`bg-gray-700 rounded-lg p-6 ${
              match.winner && match.winner.toLowerCase() === player.toLowerCase()
                ? 'ring-2 ring-green-500'
                : ''
            }`}
          >
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-2">Player {index + 1}</div>
              <div className="text-white font-mono text-lg mb-2">
                {`${player.slice(0, 8)}...${player.slice(-6)}`}
              </div>
              {match.winner && match.winner.toLowerCase() === player.toLowerCase() && (
                <div className="text-green-400 font-bold text-sm">
                  ✓ Winner
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {match.status === MatchStatus.Pending && onStartMatch && (
        <div className="text-center">
          <button
            onClick={onStartMatch}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Start Match
          </button>
        </div>
      )}

      {match.status === MatchStatus.InProgress && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-blue-400">
            <div className="animate-pulse w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="font-semibold">Match in progress...</span>
          </div>
        </div>
      )}
    </div>
  );
}
