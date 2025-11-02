'use client';

import { useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseEther, encodeFunctionData, createContract } from 'viem';

interface DeploymentResult {
  address: string;
  transactionHash: string;
}

export function useContractDeploy() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const deployContract = async (contractCode: string, contractName: string) => {
    if (!isConnected || !walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    setIsDeploying(true);
    setError(null);
    setDeploymentResult(null);

    try {
      // Check wallet balance first
      const balance = await publicClient?.getBalance({ address });
      if (!balance || balance === 0n) {
        throw new Error('Insufficient balance. Please add STT tokens to your wallet.');
      }

      // Compile contract using Solidity compiler API
      const compileResponse = await fetch('/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: contractCode,
          contractName: contractName,
        }),
      });

      if (!compileResponse.ok) {
        throw new Error('Failed to compile contract');
      }

      const compilationResult = await compileResponse.json();

      if (!compilationResult.success) {
        throw new Error(`Compilation failed: ${compilationResult.error}`);
      }

      const { bytecode, abi } = compilationResult;

      if (!bytecode || bytecode === '0x') {
        throw new Error('No bytecode generated from compilation');
      }

      // Estimate gas first
      let gasEstimate;
      try {
        gasEstimate = await publicClient?.estimateContractDeployGas({
          abi,
          bytecode: bytecode as `0x${string}`,
          account: address,
        });
      } catch (gasError) {
        console.warn('Gas estimation failed, using default:', gasError);
        gasEstimate = 3000000n; // Default 3M gas
      }

      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate ? (gasEstimate * 120n) / 100n : 3000000n;

      // Deploy contract with estimated gas
      const hash = await walletClient.deployContract({
        abi,
        bytecode: bytecode as `0x${string}`,
        account: address,
        gas: gasLimit,
      });

      // Wait for transaction receipt
      const receipt = await publicClient?.waitForTransactionReceipt({ 
        hash,
        timeout: 60000 // 60 second timeout
      });

      if (!receipt?.contractAddress) {
        throw new Error('Contract deployment failed - no contract address returned');
      }

      const result = {
        address: receipt.contractAddress,
        transactionHash: hash,
        success: true,
        networkInfo: {
          explorerUrl: `https://shannon-explorer.somnia.network/address/${receipt.contractAddress}`,
          txExplorerUrl: `https://shannon-explorer.somnia.network/tx/${hash}`,
        }
      };

      setDeploymentResult(result);
      return result;
    } catch (err) {
      console.error('Deployment error:', err);
      let errorMessage = 'Unknown error occurred';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle specific error types
        if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds. Please add STT tokens to your wallet.';
        } else if (err.message.includes('gas')) {
          errorMessage = 'Gas estimation failed. The contract may have issues or network is congested.';
        } else if (err.message.includes('revert')) {
          errorMessage = 'Transaction reverted. Check your contract code for errors.';
        } else if (err.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsDeploying(false);
    }
  };

  const reset = () => {
    setDeploymentResult(null);
    setError(null);
    setIsDeploying(false);
  };

  return {
    deployContract,
    isDeploying,
    deploymentResult,
    error,
    reset,
    isConnected,
  };
}