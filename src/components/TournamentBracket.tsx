/**
 * Tournament Bracket Visualization
 * SVG-based bracket rendering for tournaments
 */

import React from 'react';
import type { TournamentBracket, BracketNode, TournamentType } from '../types/tournament';
import { getRoundName, getMatchStatusColor } from '../utils/bracketGenerator';
import { MatchStatus } from '../types/tournament';

interface TournamentBracketProps {
  bracket: TournamentBracket;
}

export default function TournamentBracket({ bracket }: TournamentBracketProps) {
  if (!bracket || bracket.rounds.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">No bracket data available</p>
      </div>
    );
  }

  // Calculate SVG dimensions
  const matchHeight = 80;
  const matchWidth = 200;
  const roundSpacing = 250;
  const verticalSpacing = 20;

  const maxMatchesInRound = Math.max(...bracket.rounds.map(r => r.length));
  const svgHeight = Math.max(400, maxMatchesInRound * (matchHeight + verticalSpacing) + 100);
  const svgWidth = bracket.rounds.length * roundSpacing + 100;

  return (
    <div className="bg-gray-800 rounded-lg p-6 overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        className="mx-auto"
        style={{ minWidth: '100%' }}
      >
        {/* Render rounds */}
        {bracket.rounds.map((round, roundIndex) => (
          <g key={roundIndex}>
            {/* Round label */}
            <text
              x={roundIndex * roundSpacing + 50}
              y={30}
              className="fill-gray-400 text-sm font-bold"
            >
              {getRoundName(roundIndex + 1, bracket.totalRounds)}
            </text>

            {/* Matches in this round */}
            {round.map((match, matchIndex) => {
              const x = roundIndex * roundSpacing + 50;
              const y = matchIndex * (matchHeight + verticalSpacing) * Math.pow(2, roundIndex) + 60;

              return (
                <g key={match.matchId}>
                  {/* Connection lines to previous matches */}
                  {roundIndex > 0 && match.previousMatchIds && match.previousMatchIds.length > 0 && (
                    <ConnectorLines
                      currentX={x}
                      currentY={y + matchHeight / 2}
                      previousRound={bracket.rounds[roundIndex - 1]}
                      previousMatchIds={match.previousMatchIds}
                      roundSpacing={roundSpacing}
                      matchHeight={matchHeight}
                      verticalSpacing={verticalSpacing}
                      roundIndex={roundIndex}
                    />
                  )}

                  {/* Match box */}
                  <MatchBox
                    match={match}
                    x={x}
                    y={y}
                    width={matchWidth}
                    height={matchHeight}
                  />
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

interface MatchBoxProps {
  match: BracketNode;
  x: number;
  y: number;
  width: number;
  height: number;
}

function MatchBox({ match, x, y, width, height }: MatchBoxProps) {
  const statusColor = getMatchStatusColor(match.status);
  const playerHeight = (height - 10) / 2;

  return (
    <g>
      {/* Match container */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        className="fill-gray-700 stroke-gray-600"
        strokeWidth="2"
        rx="4"
      />

      {/* Status indicator */}
      <rect
        x={x}
        y={y}
        width="4"
        height={height}
        fill={statusColor}
        rx="4"
      />

      {/* Match number */}
      <text
        x={x + 10}
        y={y - 5}
        className="fill-gray-500 text-xs"
      >
        Match #{match.matchNumber}
      </text>

      {/* Player 1 */}
      {match.players[0] && (
        <g>
          <rect
            x={x + 5}
            y={y + 5}
            width={width - 10}
            height={playerHeight}
            className={`fill-gray-600 ${
              match.winner && match.winner.toLowerCase() === match.players[0].address.toLowerCase()
                ? 'stroke-green-500'
                : 'stroke-gray-500'
            }`}
            strokeWidth={match.winner && match.winner.toLowerCase() === match.players[0].address.toLowerCase() ? '2' : '1'}
            rx="3"
          />
          <text
            x={x + 15}
            y={y + playerHeight / 2 + 10}
            className="fill-white text-sm"
          >
            {match.players[0].nickname ||
              `${match.players[0].address.slice(0, 6)}...${match.players[0].address.slice(-4)}`}
          </text>
          {match.players[0].score !== undefined && (
            <text
              x={x + width - 25}
              y={y + playerHeight / 2 + 10}
              className="fill-white text-sm font-bold"
            >
              {match.players[0].score}
            </text>
          )}
        </g>
      )}

      {/* Player 2 */}
      {match.players[1] && (
        <g>
          <rect
            x={x + 5}
            y={y + playerHeight + 10}
            width={width - 10}
            height={playerHeight}
            className={`fill-gray-600 ${
              match.winner && match.winner.toLowerCase() === match.players[1].address.toLowerCase()
                ? 'stroke-green-500'
                : 'stroke-gray-500'
            }`}
            strokeWidth={match.winner && match.winner.toLowerCase() === match.players[1].address.toLowerCase() ? '2' : '1'}
            rx="3"
          />
          <text
            x={x + 15}
            y={y + playerHeight + playerHeight / 2 + 15}
            className="fill-white text-sm"
          >
            {match.players[1].nickname ||
              `${match.players[1].address.slice(0, 6)}...${match.players[1].address.slice(-4)}`}
          </text>
          {match.players[1].score !== undefined && (
            <text
              x={x + width - 25}
              y={y + playerHeight + playerHeight / 2 + 15}
              className="fill-white text-sm font-bold"
            >
              {match.players[1].score}
            </text>
          )}
        </g>
      )}

      {/* Bye indicator */}
      {match.players.length === 1 && (
        <text
          x={x + 15}
          y={y + height - 15}
          className="fill-gray-400 text-xs italic"
        >
          (Bye)
        </text>
      )}

      {/* Winner indicator */}
      {match.winner && match.status === MatchStatus.Completed && (
        <text
          x={x + width / 2}
          y={y + height + 15}
          className="fill-green-400 text-xs text-center"
          textAnchor="middle"
        >
          ✓ Winner
        </text>
      )}

      {/* Status badge */}
      {match.status === MatchStatus.InProgress && (
        <rect
          x={x + width - 50}
          y={y - 20}
          width="45"
          height="18"
          className="fill-blue-600"
          rx="9"
        />
      )}
      {match.status === MatchStatus.InProgress && (
        <text
          x={x + width - 27}
          y={y - 7}
          className="fill-white text-xs font-bold"
          textAnchor="middle"
        >
          LIVE
        </text>
      )}
    </g>
  );
}

interface ConnectorLinesProps {
  currentX: number;
  currentY: number;
  previousRound: BracketNode[];
  previousMatchIds: string[];
  roundSpacing: number;
  matchHeight: number;
  verticalSpacing: number;
  roundIndex: number;
}

function ConnectorLines({
  currentX,
  currentY,
  previousRound,
  previousMatchIds,
  roundSpacing,
  matchHeight,
  verticalSpacing,
  roundIndex,
}: ConnectorLinesProps) {
  return (
    <>
      {previousMatchIds.map((prevMatchId, index) => {
        const prevMatch = previousRound.find(m => m.matchId === prevMatchId);
        if (!prevMatch) return null;

        const prevMatchIndex = previousRound.indexOf(prevMatch);
        const prevX = (roundIndex - 1) * roundSpacing + 50 + 200; // End of previous match box
        const prevY = prevMatchIndex * (matchHeight + verticalSpacing) * Math.pow(2, roundIndex - 1) + 60 + matchHeight / 2;

        // Draw L-shaped connector
        return (
          <g key={prevMatchId}>
            <line
              x1={prevX}
              y1={prevY}
              x2={prevX + roundSpacing / 2 - 100}
              y2={prevY}
              className="stroke-gray-600"
              strokeWidth="2"
            />
            <line
              x1={prevX + roundSpacing / 2 - 100}
              y1={prevY}
              x2={prevX + roundSpacing / 2 - 100}
              y2={currentY}
              className="stroke-gray-600"
              strokeWidth="2"
            />
            <line
              x1={prevX + roundSpacing / 2 - 100}
              y1={currentY}
              x2={currentX}
              y2={currentY}
              className="stroke-gray-600"
              strokeWidth="2"
            />
          </g>
        );
      })}
    </>
  );
}
