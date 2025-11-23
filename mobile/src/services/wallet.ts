import { ethers } from 'ethers';
import { Platform, Linking } from 'react-native';
import StorageService from './storage';
import { ConnectedWallet } from '../types/wallet';
import { CELO_CHAIN_ID } from '../config/constants';

export const WalletService = {
  // Detect MiniPay
  isMiniPay: (): boolean => {
    // MiniPay detection logic
    // Check if running in Opera Mini browser or MiniPay app
    return Platform.OS === 'android' &&
           (global as any).ethereum?.isMiniPay === true;
  },

  // Connect to MiniPay
  connectMiniPay: async (): Promise<ConnectedWallet | null> => {
    try {
      if (!WalletService.isMiniPay()) {
        console.log('MiniPay not detected');
        return null;
      }

      const ethereum = (global as any).ethereum;
      if (!ethereum) {
        throw new Error('MiniPay provider not found');
      }

      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      const chainId = await ethereum.request({ method: 'eth_chainId' });

      // Get balance
      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      const wallet: ConnectedWallet = {
        address,
        chainId: parseInt(chainId, 16),
        balance: ethers.formatEther(balance),
        provider: 'minipay',
      };

      // Store wallet info
      StorageService.setWalletAddress(address);
      StorageService.set('connected_wallet', wallet);

      return wallet;
    } catch (error) {
      console.error('MiniPay connection failed:', error);
      return null;
    }
  },

  // Open MiniPay app
  openMiniPay: async (): Promise<void> => {
    const miniPayUrl = 'minipay://';
    const canOpen = await Linking.canOpenURL(miniPayUrl);

    if (canOpen) {
      await Linking.openURL(miniPayUrl);
    } else {
      // Fallback to Play Store
      const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.opera.mini.native';
      await Linking.openURL(playStoreUrl);
    }
  },

  // Connect with WalletConnect (for non-MiniPay wallets)
  connectWalletConnect: async (): Promise<ConnectedWallet | null> => {
    try {
      // WalletConnect implementation
      // This would use @walletconnect/react-native-compat
      console.log('WalletConnect not yet implemented');
      return null;
    } catch (error) {
      console.error('WalletConnect connection failed:', error);
      return null;
    }
  },

  // Disconnect wallet
  disconnect: async (): Promise<void> => {
    try {
      StorageService.remove('wallet_address');
      StorageService.remove('connected_wallet');
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  },

  // Get connected wallet
  getConnectedWallet: (): ConnectedWallet | null => {
    return StorageService.get<ConnectedWallet>('connected_wallet');
  },

  // Check if wallet is connected
  isConnected: (): boolean => {
    const wallet = WalletService.getConnectedWallet();
    return wallet !== null;
  },

  // Get wallet balance
  getBalance: async (address: string): Promise<string> => {
    try {
      const wallet = WalletService.getConnectedWallet();
      if (!wallet) {
        throw new Error('No wallet connected');
      }

      const ethereum = (global as any).ethereum;
      if (!ethereum) {
        throw new Error('Provider not found');
      }

      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  },

  // Send transaction
  sendTransaction: async (to: string, value: string, data?: string): Promise<string | null> => {
    try {
      const wallet = WalletService.getConnectedWallet();
      if (!wallet) {
        throw new Error('No wallet connected');
      }

      const ethereum = (global as any).ethereum;
      if (!ethereum) {
        throw new Error('Provider not found');
      }

      const transactionParameters = {
        from: wallet.address,
        to,
        value: ethers.parseEther(value).toString(16),
        data: data || '0x',
      };

      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      return txHash;
    } catch (error) {
      console.error('Transaction failed:', error);
      return null;
    }
  },

  // Sign message
  signMessage: async (message: string): Promise<string | null> => {
    try {
      const wallet = WalletService.getConnectedWallet();
      if (!wallet) {
        throw new Error('No wallet connected');
      }

      const ethereum = (global as any).ethereum;
      if (!ethereum) {
        throw new Error('Provider not found');
      }

      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, wallet.address],
      });

      return signature;
    } catch (error) {
      console.error('Message signing failed:', error);
      return null;
    }
  },

  // Switch to Celo network
  switchToCeloNetwork: async (): Promise<boolean> => {
    const ethereum = (global as any).ethereum;
    if (!ethereum) {
      throw new Error('Provider not found');
    }

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CELO_CHAIN_ID.toString(16)}` }],
      });

      return true;
    } catch (error: any) {
      // If the chain hasn't been added, add it
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${CELO_CHAIN_ID.toString(16)}`,
                chainName: 'Celo Mainnet',
                nativeCurrency: {
                  name: 'CELO',
                  symbol: 'CELO',
                  decimals: 18,
                },
                rpcUrls: ['https://forno.celo.org'],
                blockExplorerUrls: ['https://explorer.celo.org'],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add Celo network:', addError);
          return false;
        }
      }
      console.error('Failed to switch to Celo network:', error);
      return false;
    }
  },
};

export default WalletService;
