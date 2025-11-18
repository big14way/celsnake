import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { celo, celoSepolia } from 'wagmi/chains';
import { http } from 'viem';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set');
}

// Determine which network to use based on environment
const isTestnet = import.meta.env.VITE_NETWORK === 'testnet';

// cUSD token addresses for fee payments (MiniPay support)
export const CUSD_ADDRESS = {
  mainnet: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  testnet: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
} as const;

export const config = getDefaultConfig({
  appName: 'Celo Snake Game',
  projectId,
  chains: isTestnet ? [celoSepolia] : [celo, celoSepolia],
  ssr: false,
  transports: {
    [celo.id]: http(),
    [celoSepolia.id]: http(),
  },
});

export const CURRENT_CHAIN = isTestnet ? celoSepolia : celo;
export const CURRENT_CUSD_ADDRESS = isTestnet ? CUSD_ADDRESS.testnet : CUSD_ADDRESS.mainnet;
