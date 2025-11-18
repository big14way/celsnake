/**
 * MiniPay Integration Utilities
 * Provides detection, deeplink handling, and MiniPay-specific features
 */

export interface MiniPayDeeplinkParams {
  bet?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert' | 'master';
  nickname?: string;
  autoConnect?: boolean;
}

/**
 * Detects if the app is running in MiniPay environment
 */
export const isMiniPay = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const ethereum = (window as any).ethereum;
  
  // Check for MiniPay flag
  if (ethereum?.isMiniPay) return true;
  
  // Check for Opera Mini user agent (fallback)
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.includes('opios') || userAgent.includes('oprmini')) {
    return true;
  }
  
  return false;
};

/**
 * Checks if the device is mobile
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Parse deeplink parameters from URL
 */
export const parseDeeplinkParams = (): MiniPayDeeplinkParams => {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const result: MiniPayDeeplinkParams = {};
  
  const bet = params.get('bet');
  if (bet) result.bet = bet;
  
  const difficulty = params.get('difficulty');
  if (difficulty && ['easy', 'medium', 'hard', 'expert', 'master'].includes(difficulty)) {
    result.difficulty = difficulty as any;
  }
  
  const nickname = params.get('nickname');
  if (nickname) result.nickname = decodeURIComponent(nickname);
  
  const autoConnect = params.get('autoConnect');
  if (autoConnect === 'true') result.autoConnect = true;
  
  return result;
};

/**
 * Generate a MiniPay deeplink URL
 */
export const generateDeeplink = (
  baseUrl: string,
  params?: MiniPayDeeplinkParams
): string => {
  if (!params) return baseUrl;
  
  const url = new URL(baseUrl);
  
  if (params.bet) url.searchParams.set('bet', params.bet);
  if (params.difficulty) url.searchParams.set('difficulty', params.difficulty);
  if (params.nickname) url.searchParams.set('nickname', encodeURIComponent(params.nickname));
  if (params.autoConnect) url.searchParams.set('autoConnect', 'true');
  
  return url.toString();
};

/**
 * Get MiniPay-optimized transaction config
 * This enables cUSD fee payments for lower costs
 */
export const getMiniPayTxConfig = () => {
  if (!isMiniPay()) return {};
  
  return {
    // MiniPay supports fee currency (pay fees in cUSD)
    feeCurrency: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1', // cUSD on testnet
  };
};

/**
 * Haptic feedback for mobile devices (MiniPay)
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
  if (typeof window === 'undefined') return;
  
  // Vibration API
  if (navigator.vibrate) {
    const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 50;
    navigator.vibrate(duration);
  }
  
  // iOS haptic feedback (if available)
  const haptic = (window as any).webkit?.messageHandlers?.haptic;
  if (haptic) {
    haptic.postMessage({ type });
  }
};

/**
 * Share functionality for MiniPay users
 */
export const shareGame = async (
  _score: number,
  profit: string,
  appUrl: string
): Promise<boolean> => {
  const text = `I just won ${profit} CELO playing Celo Snake! 🐍🎲 Can you beat my score? Play now!`;
  const url = appUrl;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Celo Snake - Play to Earn',
        text,
        url,
      });
      return true;
    } catch (err) {
      // User cancelled or error occurred
      return false;
    }
  }
  
  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Request persistent storage for game data
 * Important for MiniPay to avoid data loss
 */
export const requestPersistentStorage = async (): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !navigator.storage) return false;
  
  try {
    const isPersisted = await navigator.storage.persisted();
    if (isPersisted) return true;
    
    const result = await navigator.storage.persist();
    return result;
  } catch (err) {
    console.warn('Persistent storage not available:', err);
    return false;
  }
};

/**
 * Format address for mobile display (shorter)
 */
export const formatAddressForMobile = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Get MiniPay-specific metadata for app discovery
 */
export const getMiniPayMetadata = () => ({
  name: 'Celo Snake',
  description: 'Play-to-earn snake dice game with instant CELO rewards',
  icon: '/favicon.ico',
  categories: ['games', 'defi', 'play-to-earn'],
  minVersion: '1.0.0',
  keywords: ['snake', 'dice', 'play-to-earn', 'celo', 'gaming', 'rewards'],
});
