import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { usePlayerAchievements, useAchievementsDetails, getTierInfo } from '../hooks/useAchievements';

// All achievement IDs defined in the contract
const ALL_ACHIEVEMENT_IDS = [
  // Bronze (1-10)
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  // Silver (11-20)
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  // Gold (21-25)
  21, 22, 23, 24, 25,
  // Platinum (31-34)
  31, 32, 33, 34,
  // Special (41-43)
  41, 42, 43,
];

interface AchievementBrowserProps {
  onClose: () => void;
}

const AchievementBrowser: React.FC<AchievementBrowserProps> = ({ onClose }) => {
  const { address } = useAccount();
  const { achievements: ownedIds } = usePlayerAchievements();
  const { achievements: allAchievements, isLoading } = useAchievementsDetails(ALL_ACHIEVEMENT_IDS);

  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const ownedSet = new Set(ownedIds?.map((id) => Number(id)) || []);

  // Filter achievements
  const filteredAchievements = allAchievements?.filter((achievement) => {
    if (!achievement) return false;

    // Filter by tier
    if (filterTier !== null && achievement.tier !== filterTier) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        achievement.name.toLowerCase().includes(query) ||
        achievement.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const tierCounts = {
    1: allAchievements?.filter((a) => a?.tier === 1).length || 0,
    2: allAchievements?.filter((a) => a?.tier === 2).length || 0,
    3: allAchievements?.filter((a) => a?.tier === 3).length || 0,
    4: allAchievements?.filter((a) => a?.tier === 4).length || 0,
    5: allAchievements?.filter((a) => a?.tier === 5).length || 0,
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-gray-900 border-2 border-purple-500 rounded-lg p-6 max-w-6xl w-full my-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Achievement Gallery</h2>
            <p className="text-gray-400">Discover all 32 achievements available in Snake Game</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />

          {/* Tier Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterTier(null)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterTier === null
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All ({ALL_ACHIEVEMENT_IDS.length})
            </button>
            {[1, 2, 3, 4, 5].map((tier) => {
              const tierInfo = getTierInfo(tier);
              return (
                <button
                  key={tier}
                  onClick={() => setFilterTier(tier)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filterTier === tier ? 'text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                  style={
                    filterTier === tier
                      ? { backgroundColor: tierInfo.color }
                      : undefined
                  }
                >
                  {tierInfo.name} ({tierCounts[tier as keyof typeof tierCounts]})
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Achievement Grid */}
        {!isLoading && filteredAchievements && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-2">
            {filteredAchievements.map((achievement) => {
              if (!achievement) return null;

              const isOwned = ownedSet.has(achievement.id);
              const tierInfo = getTierInfo(achievement.tier);
              const isLimited = achievement.maxSupply > 0;

              return (
                <div
                  key={achievement.id}
                  className={`bg-gray-800 border-2 rounded-lg p-4 transition-all ${
                    isOwned
                      ? 'border-opacity-100 hover:scale-105'
                      : 'border-opacity-30 opacity-60'
                  }`}
                  style={{ borderColor: tierInfo.color }}
                >
                  {/* Icon */}
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl relative"
                      style={{
                        backgroundColor: `${tierInfo.color}${isOwned ? '40' : '20'}`,
                      }}
                    >
                      {isOwned ? '🏅' : '🔒'}
                    </div>
                    {isOwned && address && (
                      <div className="absolute top-0 right-1/4 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        Owned
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <h4 className="text-white font-bold text-center mb-2">
                    {achievement.name}
                  </h4>
                  <p className="text-gray-400 text-sm text-center mb-3">
                    {achievement.description}
                  </p>

                  {/* Tier Badge */}
                  <div className="flex justify-center mb-2">
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${tierInfo.color}30`,
                        color: tierInfo.color,
                      }}
                    >
                      {tierInfo.name} Tier
                    </span>
                  </div>

                  {/* Supply Info */}
                  {isLimited && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Supply:</span>
                        <span className={achievement.currentSupply >= achievement.maxSupply ? 'text-red-400' : 'text-purple-400'}>
                          {achievement.currentSupply}/{achievement.maxSupply}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-700 rounded-full mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{
                            width: `${(achievement.currentSupply / achievement.maxSupply) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {!isLimited && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Unlimited Supply
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredAchievements?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-gray-400 text-lg">No achievements found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-white font-semibold mb-3">Tier Benefits:</h4>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getTierInfo(1).color }}
              />
              <span className="text-gray-400">
                <strong className="text-white">Bronze:</strong> 1% discount each
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getTierInfo(2).color }}
              />
              <span className="text-gray-400">
                <strong className="text-white">Silver:</strong> 2% discount each
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getTierInfo(3).color }}
              />
              <span className="text-gray-400">
                <strong className="text-white">Gold:</strong> 5% discount + Tournament access
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getTierInfo(4).color }}
              />
              <span className="text-gray-400">
                <strong className="text-white">Platinum:</strong> 10% discount each
              </span>
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getTierInfo(5).color }}
              />
              <span className="text-gray-400">
                <strong className="text-white">Special:</strong> 15% discount each (Ultra Rare)
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            💡 Maximum discount is capped at 50% across all achievements
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-bold"
        >
          Close Gallery
        </button>
      </div>
    </div>
  );
};

export default AchievementBrowser;
