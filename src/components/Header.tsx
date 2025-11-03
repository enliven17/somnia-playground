'use client'

import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const registry = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS
  const registryUrl = registry
    ? `https://shannon-explorer.somnia.network/address/${registry}?tab=index`
    : undefined

  return (
    <header className="glass-header shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4 hover-lift">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover-glow">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Somnia Playground
              </h1>
              <p className="text-sm text-white/80">
                Testnet Smart Contract IDE
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="https://docs.somnia.network/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/90 hover:text-white transition-all duration-300 font-medium hover:scale-105"
            >
              Documentation
            </a>
            <a 
              href="https://shannon-explorer.somnia.network/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/90 hover:text-white transition-all duration-300 font-medium hover:scale-105"
            >
              Explorer
            </a>
            {registryUrl && (
              <a 
                href={registryUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white transition-all duration-300 font-medium hover:scale-105"
              >
                Contract
              </a>
            )}
            <div className="flex items-center space-x-3 glass rounded-full px-4 py-2">
              <div className="status-online"></div>
              <span className="text-sm text-white font-medium">
                Testnet Live
              </span>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden btn-icon text-white"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-white/20 glass-card mt-4 mx-4 rounded-2xl">
            <nav className="flex flex-col space-y-4 px-4">
              <a 
                href="https://docs.somnia.network/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white transition-all duration-300 font-medium py-2"
              >
                Documentation
              </a>
              <a 
                href="https://shannon-explorer.somnia.network/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white transition-all duration-300 font-medium py-2"
              >
                Explorer
              </a>
              <div className="flex items-center space-x-3 py-2">
                <div className="status-online"></div>
                <span className="text-sm text-white font-medium">
                  Connected to Testnet
                </span>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}