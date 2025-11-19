import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import SnakeAchievementNFTAbi from '../contracts/SnakeAchievementNFT.json';
import AchievementTrackerAbi from '../contracts/AchievementTracker.json';

/**
 * Hook to get all achievements owned by the connected wallet
 */
export function usePlayerAchievements() {
  const { address } = useAccount();

  const { data: achievements, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.SnakeAchievementNFT as `0x${string}`,
    abi: SnakeAchievementNFTAbi,
    functionName: 'getPlayerAchievements',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    achievements: achievements as bigint[] | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get achievement details for a specific achievement ID
 */
export function useAchievementDetails(achievementId: number) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.SnakeAchievementNFT as `0x${string}`,
    abi: SnakeAchievementNFTAbi,
    functionName: 'getAchievement',
    args: [BigInt(achievementId)],
  });

  if (!data) {
    return { achievement: null, isLoading, error };
  }

  const [name, description, tier, maxSupply, currentSupply, active] = data as [
    string,
    string,
    bigint,
    bigint,
    bigint,
    boolean
  ];

  return {
    achievement: {
      id: achievementId,
      name,
      description,
      tier: Number(tier),
      maxSupply: Number(maxSupply),
      currentSupply: Number(currentSupply),
      active,
    },
    isLoading,
    error,
  };
}

/**
 * Hook to get multiple achievement details at once
 */
export function useAchievementsDetails(achievementIds: number[]) {
  const contracts = achievementIds.map((id) => ({
    address: CONTRACT_ADDRESSES.SnakeAchievementNFT as `0x${string}`,
    abi: SnakeAchievementNFTAbi,
    functionName: 'getAchievement',
    args: [BigInt(id)],
  }));

  const { data, isLoading, error } = useReadContracts({
    contracts,
  });

  const achievements = data?.map((result, index) => {
    if (result.status === 'failure' || !result.result) {
      return null;
    }

    const [name, description, tier, maxSupply, currentSupply, active] =
      result.result as [string, string, bigint, bigint, bigint, boolean];

    return {
      id: achievementIds[index],
      name,
      description,
      tier: Number(tier),
      maxSupply: Number(maxSupply),
      currentSupply: Number(currentSupply),
      active,
    };
  });

  return {
    achievements: achievements?.filter((a) => a !== null),
    isLoading,
    error,
  };
}

/**
 * Hook to get player's NFT-based discount percentage
 */
export function usePlayerDiscount() {
  const { address } = useAccount();

  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.AchievementTracker as `0x${string}`,
    abi: AchievementTrackerAbi,
    functionName: 'getPlayerDiscount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    discount: data ? Number(data) : 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to check if player is eligible for exclusive tournaments
 */
export function useExclusiveTournamentEligibility() {
  const { address } = useAccount();

  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.AchievementTracker as `0x${string}`,
    abi: AchievementTrackerAbi,
    functionName: 'isEligibleForExclusiveTournaments',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    isEligible: !!data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get player's game progress statistics
 */
export function usePlayerProgress() {
  const { address } = useAccount();

  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.AchievementTracker as `0x${string}`,
    abi: AchievementTrackerAbi,
    functionName: 'getPlayerProgress',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  if (!data) {
    return { progress: null, isLoading, error, refetch };
  }

  const [
    totalGames,
    totalWins,
    currentWinStreak,
    longestWinStreak,
    totalBetAmount,
    totalWinnings,
    multiplayerWins,
    tournamentWins,
    tournamentParticipations,
    highestScore,
    firstWin,
  ] = data as [
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    boolean
  ];

  return {
    progress: {
      totalGames: Number(totalGames),
      totalWins: Number(totalWins),
      currentWinStreak: Number(currentWinStreak),
      longestWinStreak: Number(longestWinStreak),
      totalBetAmount: totalBetAmount.toString(),
      totalWinnings: totalWinnings.toString(),
      multiplayerWins: Number(multiplayerWins),
      tournamentWins: Number(tournamentWins),
      tournamentParticipations: Number(tournamentParticipations),
      highestScore: Number(highestScore),
      firstWin,
    },
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to check if player has a specific achievement
 */
export function useHasAchievement(achievementId: number) {
  const { address } = useAccount();

  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.SnakeAchievementNFT as `0x${string}`,
    abi: SnakeAchievementNFTAbi,
    functionName: 'hasAchievement',
    args: address && achievementId ? [address, BigInt(achievementId)] : undefined,
    query: {
      enabled: !!address && !!achievementId,
    },
  });

  return {
    hasAchievement: !!data,
    isLoading,
    error,
  };
}

/**
 * Hook to get NFT balance for a specific achievement
 */
export function useAchievementBalance(achievementId: number) {
  const { address } = useAccount();

  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.SnakeAchievementNFT as `0x${string}`,
    abi: SnakeAchievementNFTAbi,
    functionName: 'balanceOf',
    args: address && achievementId ? [address, BigInt(achievementId)] : undefined,
    query: {
      enabled: !!address && !!achievementId,
    },
  });

  return {
    balance: data ? Number(data) : 0,
    isLoading,
    error,
  };
}

/**
 * Combined hook to get all achievement-related data for the connected player
 */
export function usePlayerAchievementData() {
  const { achievements, isLoading: achievementsLoading, refetch: refetchAchievements } = usePlayerAchievements();
  const { discount, isLoading: discountLoading, refetch: refetchDiscount } = usePlayerDiscount();
  const { isEligible, isLoading: eligibilityLoading, refetch: refetchEligibility } = useExclusiveTournamentEligibility();
  const { progress, isLoading: progressLoading, refetch: refetchProgress } = usePlayerProgress();

  const achievementIds = achievements?.map((id) => Number(id)) || [];
  const { achievements: achievementDetails, isLoading: detailsLoading } = useAchievementsDetails(achievementIds);

  const refetchAll = () => {
    refetchAchievements();
    refetchDiscount();
    refetchEligibility();
    refetchProgress();
  };

  return {
    achievements: achievementDetails || [],
    discount,
    isEligible,
    progress,
    isLoading: achievementsLoading || discountLoading || eligibilityLoading || progressLoading || detailsLoading,
    refetchAll,
  };
}

/**
 * Achievement tier names and colors
 */
export const ACHIEVEMENT_TIERS = {
  1: { name: 'Bronze', color: '#CD7F32' },
  2: { name: 'Silver', color: '#C0C0C0' },
  3: { name: 'Gold', color: '#FFD700' },
  4: { name: 'Platinum', color: '#E5E4E2' },
  5: { name: 'Special', color: '#9B59B6' },
};

/**
 * Get tier info for an achievement
 */
export function getTierInfo(tier: number) {
  return ACHIEVEMENT_TIERS[tier as keyof typeof ACHIEVEMENT_TIERS] || { name: 'Unknown', color: '#808080' };
}
