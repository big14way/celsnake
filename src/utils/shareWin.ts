/**
 * Share Win Utility
 * Handles sharing game wins to various social platforms
 */

import type { SharePlatform, ShareData } from '../types/social';
import toast from 'react-hot-toast';

/**
 * Generate share text for a win
 */
export const generateWinShareText = (
  winAmount: string,
  multiplier: number,
  difficulty: string
): string => {
  const emojis = {
    easy: '🟢',
    medium: '🟡',
    hard: '🔴',
    expert: '🟣',
    master: '⚫',
  };

  const emoji = emojis[difficulty as keyof typeof emojis] || '🎲';

  return `🎉 Just won ${winAmount} CELO on Celo Snake! ${emoji}
${multiplier}x multiplier on ${difficulty} difficulty!
Think you can beat my score? Play now! 🐍`;
};

/**
 * Generate share text for an achievement
 */
export const generateAchievementShareText = (
  achievementName: string,
  achievementTier: string
): string => {
  const tierEmojis = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    special: '⭐',
  };

  const emoji = tierEmojis[achievementTier.toLowerCase() as keyof typeof tierEmojis] || '🏆';

  return `${emoji} Unlocked "${achievementName}" achievement on Celo Snake!
Join me and start earning achievements! 🎮`;
};

/**
 * Generate share text for tournament win
 */
export const generateTournamentShareText = (
  tournamentName: string,
  placement: number,
  prizeWon: string
): string => {
  const placementEmojis: { [key: number]: string } = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
  };

  const emoji = placementEmojis[placement] || '🏆';

  return `${emoji} Placed #${placement} in "${tournamentName}" tournament on Celo Snake!
Prize: ${prizeWon} CELO
Think you can compete? Join the next tournament! 🎮`;
};

/**
 * Share to Twitter/X
 */
export const shareToTwitter = (shareData: ShareData): void => {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareData.text
  )}&url=${encodeURIComponent(shareData.url)}`;

  window.open(twitterUrl, '_blank', 'width=550,height=420');
};

/**
 * Share to Telegram
 */
export const shareToTelegram = (shareData: ShareData): void => {
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    shareData.url
  )}&text=${encodeURIComponent(shareData.text)}`;

  window.open(telegramUrl, '_blank');
};

/**
 * Share to WhatsApp
 */
export const shareToWhatsApp = (shareData: ShareData): void => {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${shareData.text}\n${shareData.url}`
  )}`;

  window.open(whatsappUrl, '_blank');
};

/**
 * Share to Discord (copies to clipboard)
 */
export const shareToDiscord = async (shareData: ShareData): Promise<void> => {
  try {
    await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    toast.success('Copied to clipboard! Paste in Discord', { duration: 5000 });
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    toast.error('Failed to copy to clipboard');
  }
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (shareData: ShareData): Promise<void> => {
  try {
    await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    toast.success('Copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    toast.error('Failed to copy to clipboard');
  }
};

/**
 * Use Web Share API if available
 */
export const useNativeShare = async (shareData: ShareData): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: shareData.title,
      text: shareData.text,
      url: shareData.url,
    });
    return true;
  } catch (error) {
    // User cancelled or error occurred
    console.error('Native share failed:', error);
    return false;
  }
};

/**
 * Main share function that routes to appropriate platform
 */
export const shareWin = async (
  platform: SharePlatform,
  shareData: ShareData
): Promise<void> => {
  switch (platform) {
    case 'twitter':
      shareToTwitter(shareData);
      break;
    case 'telegram':
      shareToTelegram(shareData);
      break;
    case 'whatsapp':
      shareToWhatsApp(shareData);
      break;
    case 'discord':
      await shareToDiscord(shareData);
      break;
    case 'copy':
      await copyToClipboard(shareData);
      break;
    default:
      console.error('Unknown share platform:', platform);
      toast.error('Unknown share platform');
  }
};

/**
 * Generate share URL with referral code
 */
export const generateShareURL = (
  baseUrl: string = window.location.origin,
  referralCode?: string,
  params?: Record<string, string>
): string => {
  const url = new URL(baseUrl);

  if (referralCode) {
    url.searchParams.set('ref', referralCode);
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
};

/**
 * Create share data for win
 */
export const createWinShareData = (
  winAmount: string,
  multiplier: number,
  difficulty: string,
  referralCode?: string
): ShareData => {
  const text = generateWinShareText(winAmount, multiplier, difficulty);
  const url = generateShareURL(undefined, referralCode);

  return {
    title: 'Celo Snake - Big Win!',
    text,
    url,
    platform: 'twitter', // default, will be overridden
  };
};

/**
 * Create share data for achievement
 */
export const createAchievementShareData = (
  achievementName: string,
  achievementTier: string,
  referralCode?: string
): ShareData => {
  const text = generateAchievementShareText(achievementName, achievementTier);
  const url = generateShareURL(undefined, referralCode);

  return {
    title: 'Celo Snake - Achievement Unlocked!',
    text,
    url,
    platform: 'twitter',
  };
};

/**
 * Create share data for tournament win
 */
export const createTournamentShareData = (
  tournamentName: string,
  placement: number,
  prizeWon: string,
  referralCode?: string
): ShareData => {
  const text = generateTournamentShareText(tournamentName, placement, prizeWon);
  const url = generateShareURL(undefined, referralCode);

  return {
    title: 'Celo Snake - Tournament Victory!',
    text,
    url,
    platform: 'twitter',
  };
};

/**
 * Show share dialog with multiple options
 */
export const showShareDialog = async (
  shareData: ShareData,
  onPlatformSelect: (platform: SharePlatform) => void
): Promise<void> => {
  // Try native share first on mobile
  if (navigator.share && /mobile/i.test(navigator.userAgent)) {
    const shared = await useNativeShare(shareData);
    if (shared) return;
  }

  // Otherwise, show custom share dialog
  // This would be handled by a React component in the actual implementation
  // For now, we just trigger the callback with 'copy' as default
  onPlatformSelect('copy');
};
