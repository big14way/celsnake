import React, { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { contractConfig, formatEther, CELO_NETWORK_INFO } from '../utils/contract';

interface LeaderboardPlayer {
  addr: string;
  nickname: string;
  totalWinnings: bigint;
}

const Leaderboard = () => {
  const { data: leaderboardData, isLoading, refetch } = useReadContract({
    ...contractConfig,
    functionName: 'getLeaderboard',
  });

  const players = (leaderboardData as LeaderboardPlayer[]) || [];

  useEffect(() => {
    // Listen for custom refresh event
    const handler = () => { refetch(); };
    window.addEventListener('refreshLeaderboard', handler);
    return () => window.removeEventListener('refreshLeaderboard', handler);
  }, [refetch]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div className="bg-[#232e38] p-10 rounded-2xl w-full max-w-md">
      <h3 className="text-white font-bold text-3xl mb-4">Leaderboard</h3>
      {isLoading ? (
        <div className="text-gray-400 text-center">Loading...</div>
      ) : players.length === 0 ? (
        <div className="text-gray-400 text-center">No players yet</div>
      ) : (
        <>
          <div className="flex justify-between items-center text-white text-base mb-2 px-1">
            <span className="font-bold">&nbsp;</span>
            <span className="font-bold text-green-400">Profit</span>
          </div>
          <div className="space-y-4">
            {players.map((player, index) => (
              <div key={player.addr} className="flex justify-between items-center text-white text-xl">
                <div className="flex items-center gap-4">
                  <span className="text-yellow-400 font-bold text-2xl">#{index + 1}</span>
                  <span className="truncate max-w-32 font-bold">{player.nickname}</span>
                </div>
                <span className="text-green-400 font-bold text-xl">
                  {Number(formatEther(player.totalWinnings)).toFixed(3)} {CELO_NETWORK_INFO.nativeCurrency.symbol}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      <button
        onClick={() => refetch()}
        className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white text-xl py-4 rounded-xl font-bold"
      >
        Refresh
      </button>
    </div>
  );
};

export default Leaderboard;
