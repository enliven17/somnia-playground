import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { REGISTRY_ADDRESS, REGISTRY_ABI } from '@/constants/registry'

export async function POST(request: NextRequest) {
  try {
    const { bytecode, abi, privateKey } = await request.json()

    if (!bytecode || !abi) {
      return NextResponse.json(
        { success: false, error: 'Missing bytecode or ABI' },
        { status: 400 }
      )
    }

    if (!privateKey) {
      return NextResponse.json({
        success: false,
        error: 'Private key is required for deployment'
      })
    }

    // Validate private key format
    if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
      return NextResponse.json({
        success: false,
        error: 'Invalid private key format'
      })
    }

    // Connect to Somnia testnet
    const provider = new ethers.JsonRpcProvider('https://dream-rpc.somnia.network')
    const wallet = new ethers.Wallet(privateKey, provider)

    // Check wallet balance
    const balance = await provider.getBalance(wallet.address)
    if (balance === BigInt(0)) {
      return NextResponse.json({
        success: false,
        error: `Insufficient balance. Please fund your wallet: ${wallet.address}`
      })
    }

    // Create contract factory
    const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet)

    // Compute Somnia-aware gas limit
    // Somnia charges 3125 gas per byte of deployed bytecode
    const byteLen = (bytecode?.length ?? 2) > 2 ? Math.floor((bytecode.length - 2) / 2) : 0
    const perByteCost = 3125n
    const deployBytecodeCost = BigInt(byteLen) * perByteCost
    // Add larger overhead for constructor execution, logs, storage ops, and cold accesses
    const overhead = 3_000_000n
    // Safety buffer (50%) to tolerate cold reads/writes and logs
    const buffer = (deployBytecodeCost + overhead) / 2n
    const gasLimit = deployBytecodeCost + overhead + buffer

    // Deploy contract with EIP-1559 fee fields (preferred)
    const maxPriorityFeePerGas = ethers.parseUnits('2', 'gwei')
    const maxFeePerGas = ethers.parseUnits('50', 'gwei')

    const contract = await contractFactory.deploy({
      gasLimit,
      maxPriorityFeePerGas,
      maxFeePerGas
    })

    // Wait for deployment
    await contract.waitForDeployment()
    const contractAddress = await contract.getAddress()

    // Best-effort on-chain registration with the PlaygroundRegistry
    // Signed by treasury (server), not by end-user wallet
    const registryEnv = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || process.env.REGISTRY_ADDRESS || REGISTRY_ADDRESS
    if (registryEnv) {
      try {
        const treasuryPk = process.env.TREASURY_PRIVATE_KEY || process.env.REGISTRY_SIGNER_PRIVATE_KEY
        if (!treasuryPk) {
          console.warn('Registry: missing TREASURY_PRIVATE_KEY; skipping registration')
        } else {
          const treasurySigner = new ethers.Wallet(treasuryPk, provider)
          const rawRegistry = registryEnv.trim()
          const isHex40 = /^0x[0-9a-fA-F]{40}$/.test(rawRegistry)
          if (!isHex40 || rawRegistry.toUpperCase() === '0XREGISTRY_ADDRESS_FROM_DEPLOY') {
            console.warn(`Registry: invalid NEXT_PUBLIC_REGISTRY_ADDRESS value '${rawRegistry}', skipping registration`)
          } else {
            const registryAddress = ethers.getAddress(rawRegistry)
          const deployedAddress = ethers.getAddress(contractAddress.trim())
            const registry = new ethers.Contract(registryAddress, REGISTRY_ABI, treasurySigner)
            // Estimate gas with buffer; fallback to 1,000,000
            let regGas = 1_000_000n
            try {
              const est = await registry.registerDeployment.estimateGas(deployedAddress, 'playground:v1')
              regGas = (est * 150n) / 100n
            } catch {}
            const regTx = await registry.registerDeployment(deployedAddress, 'playground:v1', {
              gasLimit: regGas,
              maxPriorityFeePerGas,
              maxFeePerGas,
            })
          await regTx.wait()
          }
        }
      } catch (e) {
        // swallow registry error to not block the main deployment
        console.warn('Registry registration failed:', e)
      }
    }

    return NextResponse.json({
      success: true,
      contractAddress,
      transactionHash: contract.deploymentTransaction()?.hash,
      deployerAddress: wallet.address,
      networkInfo: {
        chainId: 50312,
        networkName: 'Somnia Testnet',
        explorerUrl: `https://shannon-explorer.somnia.network/address/${contractAddress}`,
        txExplorerUrl: `https://shannon-explorer.somnia.network/tx/${contract.deploymentTransaction()?.hash}`
      }
    })

  } catch (error: any) {
    console.error('Deployment error:', error)

    let errorMessage = 'Deployment failed'

    if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Insufficient funds for deployment'
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = 'Network connection error'
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json({
      success: false,
      error: errorMessage
    })
  }
}