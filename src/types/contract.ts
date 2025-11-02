export interface ContractTemplate {
  name: string
  description: string
  code: string
  category: 'token' | 'defi' | 'nft' | 'governance' | 'utility'
}

export interface CompilationResult {
  success: boolean
  abi?: any[]
  bytecode?: string
  error?: string
  output?: string
}

export interface DeploymentResult {
  success: boolean
  contractAddress?: string
  transactionHash?: string
  deployerAddress?: string
  networkInfo?: {
    chainId: number
    networkName: string
    explorerUrl: string
  }
  error?: string
}

export interface NetworkConfig {
  name: string
  chainId: number
  rpcUrl: string
  explorerUrl: string
  symbol: string
  isTestnet: boolean
}