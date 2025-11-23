export interface WalletConfig {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}

export interface ConnectedWallet {
  address: string;
  chainId: number;
  balance?: string;
  provider: 'minipay' | 'walletconnect' | 'metamask' | 'other';
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}
