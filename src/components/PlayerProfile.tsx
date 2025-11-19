import React from 'react';
import { useAccount } from 'wagmi';
import { usePlayerAchievementData, getTierInfo } from '../hooks/useAchievements';

interface PlayerProfileProps {
  onClose: () => void;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ onClose }) => {
  const { address } = useAccount();
  const { achievements, discount, isEligible, progress, isLoading } = usePlayerAchievementData();

  if (!address) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-900 border-2 border-blue-500 rounded-lg p-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Player Profile</h2>
          <p className="text-gray-400">Please connect your wallet to view your profile.</p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-900 border-2 border-blue-500 rounded-lg p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  const totalAchievements = achievements.length;
  const winRate = progress?.totalGames ? ((progress.totalWins / progress.totalGames) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-gray-900 border-2 border-blue-500 rounded-lg p-6 max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Player Profile</h2>
            <p className="text-gray-400 text-sm font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Games</p>
            <p className="text-2xl font-bold text-white">{progress?.totalGames || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Wins</p>
            <p className="text-2xl font-bold text-green-500">{progress?.totalWins || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-blue-500">{winRate}%</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Win Streak</p>
            <p className="text-2xl font-bold text-yellow-500">{progress?.currentWinStreak || 0}</p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500 rounded-lg p-4 mb-6">
          <h3 className="text-xl font-bold text-white mb-3">NFT Holder Benefits</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-purple-300 font-semibold">Fee Discount</p>
                <p className="text-2xl font-bold text-white">{discount}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">{isEligible ? '🏆' : '🔒'}</span>
              </div>
              <div>
                <p className="text-blue-300 font-semibold">Exclusive Tournaments</p>
                <p className={`text-sm font-bold ${isEligible ? 'text-green-400' : 'text-gray-400'}`}>
                  {isEligible ? 'Unlocked' : 'Earn Gold+ Achievement'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-white">
              Achievements
              <span className="text-gray-400 text-lg ml-2">
                ({totalAchievements}/32)
              </span>
            </h3>
            {totalAchievements > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-400">Collection Progress</p>
                <div className="w-48 h-2 bg-gray-700 rounded-full mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${(totalAchievements / 32) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {totalAchievements === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
              <p className="text-4xl mb-4">🎮</p>
              <p className="text-gray-400 text-lg mb-2">No achievements yet!</p>
              <p className="text-gray-500 text-sm">
                Play games, win matches, and earn NFT achievements to unlock exclusive benefits
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-2">
              {achievements.map((achievement) => {
                const tierInfo = getTierInfo(achievement.tier);
                return (
                  <div
                    key={achievement.id}
                    className="bg-gray-800 border-2 rounded-lg p-4 hover:scale-105 transition-transform"
                    style={{ borderColor: tierInfo.color }}
                  >
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl"
                      style={{ backgroundColor: `${tierInfo.color}20` }}
                    >
                      🏅
                    </div>
                    <h4 className="text-white font-bold text-center text-sm mb-1">
                      {achievement.name}
                    </h4>
                    <p className="text-gray-400 text-xs text-center mb-2">
                      {achievement.description}
                    </p>
                    <div className="text-center">
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${tierInfo.color}20`,
                          color: tierInfo.color,
                        }}
                      >
                        {tierInfo.name}
                      </span>
                    </div>
                    {achievement.maxSupply > 0 && (
                      <p className="text-xs text-gray-500 text-center mt-2">
                        {achievement.currentSupply}/{achievement.maxSupply} minted
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Additional Stats */}
        {progress && (
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Longest Win Streak</p>
              <p className="text-xl font-bold text-yellow-400">{progress.longestWinStreak}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Multiplayer Wins</p>
              <p className="text-xl font-bold text-blue-400">{progress.multiplayerWins}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Tournament Wins</p>
              <p className="text-xl font-bold text-purple-400">{progress.tournamentWins}</p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-bold"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
};

export default PlayerProfile;
