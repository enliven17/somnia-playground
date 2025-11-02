import { NetworkConfig } from '@/types/contract'

export const SOMNIA_TESTNET: NetworkConfig = {
  name: 'Somnia Testnet',
  chainId: 50311,
  rpcUrl: 'https://dream-rpc.somnia.network',
  explorerUrl: 'https://shannon-explorer.somnia.network',
  symbol: 'STT',
  isTestnet: true
}

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  SOMNIA_TESTNET
]

export const DEFAULT_NETWORK = SOMNIA_TESTNET