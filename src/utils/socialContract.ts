/**
 * Social Features Contract Utilities
 * Handles interactions with the SocialFeatures smart contract
 */

import { encodeFunctionData, decodeFunctionResult, parseEther, formatEther } from 'viem';
import type { Address } from 'viem';
import toast from 'react-hot-toast';

// Social Features Contract ABI
export const SOCIAL_FEATURES_ABI = [
  {
    inputs: [{ name: '_nickname', type: 'string' }],
    name: 'createProfile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_nickname', type: 'string' },
      { name: '_allowFriendRequests', type: 'bool' },
    ],
    name: 'updateProfile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'updateLastActive',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_to', type: 'address' }],
    name: 'sendFriendRequest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_requestId', type: 'bytes32' }],
    name: 'acceptFriendRequest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_requestId', type: 'bytes32' }],
    name: 'rejectFriendRequest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_friend', type: 'address' }],
    name: 'removeFriend',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'blockUser',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'unblockUser',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_code', type: 'string' }],
    name: 'createReferralCode',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_code', type: 'string' },
      { name: '_referee', type: 'address' },
    ],
    name: 'registerReferral',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_referee', type: 'address' },
      { name: '_gameAmount', type: 'uint256' },
    ],
    name: 'rewardReferral',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_player1', type: 'address' },
      { name: '_player2', type: 'address' },
    ],
    name: 'isFriend',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_blocker', type: 'address' },
      { name: '_blocked', type: 'address' },
    ],
    name: 'isBlocked',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_player', type: 'address' }],
    name: 'getFriendCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_referrer', type: 'address' }],
    name: 'getReferralCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_referrer', type: 'address' }],
    name: 'getTotalReferralRewards',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_referee', type: 'address' }],
    name: 'getReferralInfo',
    outputs: [
      { name: 'referrer', type: 'address' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'rewarded', type: 'bool' },
      { name: 'rewardAmount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_player', type: 'address' }],
    name: 'getPlayerFriendRequests',
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'profiles',
    outputs: [
      { name: 'nickname', type: 'string' },
      { name: 'exists', type: 'bool' },
      { name: 'allowFriendRequests', type: 'bool' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'lastActive', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'fundReferralTreasury',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'referralTreasury',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Contract address (DEPLOYED - Nov 22, 2025)
export const SOCIAL_CONTRACT_ADDRESS = '0x445383147Ad5Aba947C1b2aeE6dD607E26dfFCEB' as Address;

/**
 * Helper to check if profile exists
 */
export const checkProfileExists = async (
  client: any,
  address: Address
): Promise<boolean> => {
  try {
    const result = await client.readContract({
      address: SOCIAL_CONTRACT_ADDRESS,
      abi: SOCIAL_FEATURES_ABI,
      functionName: 'profiles',
      args: [address],
    });

    return result[1]; // exists field
  } catch (error) {
    console.error('Error checking profile:', error);
    return false;
  }
};

/**
 * Create a new player profile
 */
export const createProfile = async (
  client: any,
  nickname: string
): Promise<{ hash?: string; error?: string }> => {
  try {
    const hash = await client.writeContract({
      address: SOCIAL_CONTRACT_ADDRESS,
      abi: SOCIAL_FEATURES_ABI,
      functionName: 'createProfile',
      args: [nickname],
    });

    toast.success('Profile created successfully!');
    return { hash };
  } catch (error: any) {
    console.error('Error creating profile:', error);
    const errorMessage = error.message || 'Failed to create profile';
    toast.error(errorMessage);
    return { error: errorMessage };
  }
};

/**
 * Update player profile
 */
export const updateProfile = async (
  client: any,
  nickname: string,
  allowFriendRequests: boolean
): Promise<{ hash?: string; error?: string }> => {
  try {
    const hash = await client.writeContract({
      address: SOCIAL_CONTRACT_ADDRESS,
      abi: SOCIAL_FEATURES_ABI,
      functionName: 'updateProfile',
      args: [nickname, allowFriendRequests],
    });

    toast.success('Profile updated successfully!');
    return { hash };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    const errorMessage = error.message || 'Failed to update profile';
    toast.error(errorMessage);
    return { error: errorMessage };
  }
};

/**
 * Send friend request
 */
export const sendFriendRequestOnChain = async (
  client: any,
  toAddress: Address
): Promise<{ hash?: string; error?: string }> => {
  try {
    const hash = await client.writeContract({
      address: SOCIAL_CONTRACT_ADDRESS,
      abi: SOCIAL_FEATURES_ABI,
      functionName: 'sendFriendRequest',
      args: [toAddress],
    });

    return { hash };
  } catch (error: any) {
    console.error('Error sending friend request:', error);
    const errorMessage = error.message || 'Failed to send friend request';
    toast.error(errorMessage);
    return { error: errorMessage };
  }
};

/**
 * Accept friend request
 */
export const acceptFriendRequestOnChain = async (
  client: any,
  requestId: string
): Promise<{ hash?: string; error?: string }> => {
  try {
    const hash = await client.writeContract({
      address: SOCIAL_CONTRACT_ADDRESS,
      abi: SOCIAL_FEATURES_ABI,
      functionName: 'acceptFriendRequest',
      args: [requestId as `0x${string}`],
    });

    return { hash };
  } catch (error: any) {
    console.error('Error accepting friend request:', error);
    const errorMessage = error.message || 'Failed to accept friend request';
    toast.error(errorMessage);
    return { error: errorMessage };
  }
};

/**
 * Remove friend
 */
export const removeFriendOnChain = async (
  client: any,
  friendAddress: Address
): Promise<{ hash?: string; error?: string }> => {
  try {
    const hash = await client.writeContract({
      address: SOCIAL_CONTRACT_ADDRESS,
      abi: SOCIAL_FEATURES_ABI,
      functionName: 'removeFriend',
      args: [friendAddress],
    });

    return { hash };
  } catch (error: any) {
    console.error('Error removing friend:', error);
    const errorMessage = error.message || 'Failed to remove friend';
    toast.error(errorMessage);
    return { error: errorMessage };
  }
};

/**
 * Block user
 */
export const blockUserOnChain = async (
  client: any,
  userAddress: Address
): Promise<{ hash?: string; error?: string }> => {
  try {
    const hash = await client.writeContract({
      address: SOCIAL_CONTRACT_ADDRESS,
      abi: SOCIAL_FEATURES_ABI,
      functionName: 'blockUser',
      args: [userAddress],
    });

    return { hash };
  } catch (error: any) {
    console.error('Error blocking user:', error);
    const errorMessage = error.message || 'Failed to block user';
    toast.error(errorMessage);
    return { error: errorMessage };
  }
};

/**
 * Create referral code
 */
export const createReferralCode = async (
  client: any,
  code: string
): Promise<{ hash?: string; error?: string }> => {
  try {
    const hash = await client.writeContract({
      address: SOCIAL_CONTRACT_ADDRESS,
      abi: SOCIAL_FEATURES_ABI,
      functionName: 'createReferralCode',
      args: [code],
    });

    toast.success('Referral code created!');
    return { hash };
  } catch (error: any) {
    console.error('Error creating referral code:', error);
    const errorMessage = error.message || 'Failed to create referral code';
    toast.error(errorMessage);
    return { error: errorMessage };
  }
};

/**
 * Register referral
 */
export const registerReferral = async (
  client: any,
  code: string,
  refereeAddress: Address
): Promise<{ hash?: string; error?: string }> => {
  try {
    const hash = await client.writeContract({
      address: SOCIAL_CONTRACT_ADDRESS,
      abi: SOCIAL_FEATURES_ABI,
      functionName: 'registerReferral',
      args: [code, refereeAddress],
    });

    return { hash };
  } catch (error: any) {
    console.error('Error registering referral:', error);
    const errorMessage = error.message || 'Failed to register referral';
    return { error: errorMessage };
  }
};

/**
 * Get friend count
 */
export const getFriendCount = async (
  client: any,
  address: Address
): Promise<number> => {
  try {
    const count = await client.readContract({
      address: SOCIAL_CONTRACT_ADDRESS,
      abi: SOCIAL_FEATURES_ABI,
      functionName: 'getFriendCount',
      args: [address],
    });

    return Number(count);
  } catch (error) {
    console.error('Error getting friend count:', error);
    return 0;
  }
};

/**
 * Get referral stats
 */
export const getReferralStats = async (
  client: any,
  address: Address
): Promise<{
  totalReferrals: number;
  totalRewards: string;
}> => {
  try {
    const [count, rewards] = await Promise.all([
      client.readContract({
        address: SOCIAL_CONTRACT_ADDRESS,
        abi: SOCIAL_FEATURES_ABI,
        functionName: 'getReferralCount',
        args: [address],
      }),
      client.readContract({
        address: SOCIAL_CONTRACT_ADDRESS,
        abi: SOCIAL_FEATURES_ABI,
        functionName: 'getTotalReferralRewards',
        args: [address],
      }),
    ]);

    return {
      totalReferrals: Number(count),
      totalRewards: formatEther(rewards),
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return {
      totalReferrals: 0,
      totalRewards: '0',
    };
  }
};

/**
 * Check if two players are friends
 */
export const checkIsFriend = async (
  client: any,
  player1: Address,
  player2: Address
): Promise<boolean> => {
  try {
    const isFriend = await client.readContract({
      address: SOCIAL_CONTRACT_ADDRESS,
      abi: SOCIAL_FEATURES_ABI,
      functionName: 'isFriend',
      args: [player1, player2],
    });

    return isFriend;
  } catch (error) {
    console.error('Error checking friend status:', error);
    return false;
  }
};

/**
 * Get referral treasury balance
 */
export const getReferralTreasuryBalance = async (client: any): Promise<string> => {
  try {
    const balance = await client.readContract({
      address: SOCIAL_CONTRACT_ADDRESS,
      abi: SOCIAL_FEATURES_ABI,
      functionName: 'referralTreasury',
    });

    return formatEther(balance);
  } catch (error) {
    console.error('Error getting treasury balance:', error);
    return '0';
  }
};

/**
 * Fund referral treasury
 */
export const fundReferralTreasury = async (
  client: any,
  amount: string
): Promise<{ hash?: string; error?: string }> => {
  try {
    const hash = await client.writeContract({
      address: SOCIAL_CONTRACT_ADDRESS,
      abi: SOCIAL_FEATURES_ABI,
      functionName: 'fundReferralTreasury',
      value: parseEther(amount),
    });

    toast.success(`Treasury funded with ${amount} CELO`);
    return { hash };
  } catch (error: any) {
    console.error('Error funding treasury:', error);
    const errorMessage = error.message || 'Failed to fund treasury';
    toast.error(errorMessage);
    return { error: errorMessage };
  }
};
