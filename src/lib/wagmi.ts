import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Somnia Testnet chain definition
export const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://somnia-testnet.socialscan.io',
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Somnia Playground',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '2f5a2b1c8d3e4f5a6b7c8d9e0f1a2b3c',
  chains: [somniaTestnet],
  ssr: true,
});