/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_CONTRACT_ADDRESS: string
  readonly VITE_NETWORK: 'testnet' | 'mainnet'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
