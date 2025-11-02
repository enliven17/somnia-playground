'use client'

import { useState } from 'react'
import { EyeIcon, EyeSlashIcon, WalletIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { ethers } from 'ethers'

interface WalletInputProps {
  onWalletChange: (privateKey: string, address: string) => void
}

export default function WalletInput({ onWalletChange }: WalletInputProps) {
  const [privateKey, setPrivateKey] = useState('')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState('')

  const validatePrivateKey = (key: string) => {
    try {
      if (!key) {
        setWalletAddress('')
        setIsValid(false)
        setError('')
        onWalletChange('', '')
        return
      }

      // Remove 0x prefix if present
      const cleanKey = key.startsWith('0x') ? key.slice(2) : key

      // Check if it's a valid hex string of correct length
      if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
        setError('Invalid private key format')
        setIsValid(false)
        setWalletAddress('')
        onWalletChange('', '')
        return
      }

      // Create wallet to get address
      const wallet = new ethers.Wallet('0x' + cleanKey)
      setWalletAddress(wallet.address)
      setIsValid(true)
      setError('')
      onWalletChange('0x' + cleanKey, wallet.address)
    } catch (err) {
      setError('Invalid private key')
      setIsValid(false)
      setWalletAddress('')
      onWalletChange('', '')
    }
  }

  const handlePrivateKeyChange = (value: string) => {
    setPrivateKey(value)
    validatePrivateKey(value)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 mb-3">
        <WalletIcon className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">Wallet Configuration</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">
            Private Key
          </label>
          <div className="relative">
            <input
              type={showPrivateKey ? 'text' : 'password'}
              value={privateKey}
              onChange={(e) => handlePrivateKeyChange(e.target.value)}
              placeholder="0x..."
              className={`w-full p-2 pr-10 bg-[#3c3c3c] border rounded text-sm text-white placeholder-gray-500 ${
                error ? 'border-red-500' : isValid ? 'border-green-500' : 'border-[#5a5a5a]'
              } focus:border-blue-500 focus:outline-none transition-colors`}
            />
            <button
              type="button"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
            >
              {showPrivateKey ? (
                <EyeSlashIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-xs mt-1 flex items-center space-x-1">
              <span>⚠️</span>
              <span>{error}</span>
            </p>
          )}
        </div>

        {walletAddress && (
          <div className="bg-[#2d4a2d] border border-green-600 rounded p-3">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircleIcon className="h-4 w-4 text-green-400" />
              <span className="text-green-300 font-medium text-sm">Wallet Connected</span>
            </div>
            <div className="text-xs text-gray-300">
              <div className="font-mono bg-[#1e1e1e] p-2 rounded text-xs break-all border border-[#3e3e42]">
                {walletAddress}
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#4a3d2d] border border-yellow-600 rounded p-3">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-400 text-sm">⚠️</span>
            <div className="text-yellow-200 text-xs">
              <div className="font-medium mb-1">Security Warning:</div>
              <div className="text-xs text-yellow-300">
                Only use testnet private keys. Never share your private key.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}