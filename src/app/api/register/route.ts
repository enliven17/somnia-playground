import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { REGISTRY_ADDRESS, REGISTRY_ABI } from '@/constants/registry'

export async function POST(request: NextRequest) {
  try {
    const { contractAddress, metadataURI } = await request.json()

    // Prefer live env at runtime (dev server), fallback to build-time constant
    const registryEnv = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || process.env.REGISTRY_ADDRESS || REGISTRY_ADDRESS
    if (!registryEnv) {
      return NextResponse.json({ success: false, error: 'Registry address not configured' }, { status: 400 })
    }
    const rawRegistry = registryEnv.trim()
    const isHex40 = /^0x[0-9a-fA-F]{40}$/.test(rawRegistry)
    if (!isHex40 || rawRegistry.toUpperCase() === '0XREGISTRY_ADDRESS_FROM_DEPLOY') {
      return NextResponse.json({ success: false, error: `Invalid registry address value: ${rawRegistry}. Set NEXT_PUBLIC_REGISTRY_ADDRESS to the deployed address.` }, { status: 400 })
    }

    if (!contractAddress || typeof contractAddress !== 'string' || !contractAddress.startsWith('0x')) {
      return NextResponse.json({ success: false, error: 'Invalid contractAddress' }, { status: 400 })
    }

    const treasuryPk = process.env.TREASURY_PRIVATE_KEY || process.env.REGISTRY_SIGNER_PRIVATE_KEY
    if (!treasuryPk) {
      return NextResponse.json({ success: false, error: 'Server missing TREASURY_PRIVATE_KEY' }, { status: 500 })
    }

    const provider = new ethers.JsonRpcProvider('https://dream-rpc.somnia.network')
    const treasury = new ethers.Wallet(treasuryPk, provider)

    // Normalize addresses to avoid ENS resolution attempts
    const registryAddress = ethers.getAddress(rawRegistry)
    const deployedAddress = ethers.getAddress((contractAddress as string).trim())

    const maxPriorityFeePerGas = ethers.parseUnits('2', 'gwei')
    const maxFeePerGas = ethers.parseUnits('50', 'gwei')

    const registry = new ethers.Contract(registryAddress, REGISTRY_ABI, treasury)
    // Try gas estimation with generous buffer; fallback to 1,000,000
    let gasLimit = 1_000_000n
    try {
      const estimate = await registry.registerDeployment.estimateGas(deployedAddress, metadataURI ?? 'playground:v1')
      gasLimit = (estimate * 150n) / 100n
    } catch {}
    const tx = await registry.registerDeployment(deployedAddress, metadataURI ?? 'playground:v1', {
      gasLimit,
      maxPriorityFeePerGas,
      maxFeePerGas,
    })
    const receipt = await tx.wait()

    return NextResponse.json({ success: true, txHash: receipt?.hash || tx.hash })
  } catch (e: any) {
    console.error('Registry register error:', e)
    return NextResponse.json({ success: false, error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


