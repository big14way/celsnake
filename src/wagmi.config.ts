import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { celo, celoAlfajores } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set');
}

// Determine which network to use based on environment
const isTestnet = import.meta.env.VITE_NETWORK === 'testnet';

export const config = getDefaultConfig({
  appName: 'Celo Snake Game',
  projectId,
  chains: isTestnet ? [celoAlfajores] : [celo, celoAlfajores],
  ssr: false,
});

export const CURRENT_CHAIN = isTestnet ? celoAlfajores : celo;
