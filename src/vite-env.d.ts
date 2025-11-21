/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_CONTRACT_ADDRESS: string
  readonly VITE_MULTIPLAYER_CONTRACT_ADDRESS: string
  readonly VITE_ACHIEVEMENT_CONTRACT_ADDRESS: string
  readonly VITE_TOURNAMENT_CONTRACT_ADDRESS: string
  readonly VITE_NETWORK: 'testnet' | 'mainnet'
  readonly VITE_SOCKET_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
