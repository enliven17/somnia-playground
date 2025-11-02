'use client'

import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon, 
  ShieldCheckIcon, 
  SparklesIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'

interface CodeAnalysisMenuProps {
  selectedCode: string
  position: { x: number; y: number }
  onAnalyze: (type: 'explain' | 'security' | 'optimize', code: string) => void
  onClose: () => void
}

export default function CodeAnalysisMenu({ 
  selectedCode, 
  position, 
  onAnalyze, 
  onClose 
}: CodeAnalysisMenuProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.code-analysis-menu')) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const analysisOptions = [
    {
      id: 'explain',
      label: 'Explain Code',
      icon: MagnifyingGlassIcon,
      description: 'Get detailed explanation',
      color: 'text-blue-400 hover:text-blue-300'
    },
    {
      id: 'security',
      label: 'Security Analysis',
      icon: ShieldCheckIcon,
      description: 'Check for vulnerabilities',
      color: 'text-red-400 hover:text-red-300'
    },
    {
      id: 'optimize',
      label: 'Optimize Code',
      icon: SparklesIcon,
      description: 'Suggest improvements',
      color: 'text-green-400 hover:text-green-300'
    }
  ]

  return (
    <div
      className={`fixed z-50 code-analysis-menu transition-all duration-200 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{
        left: Math.min(position.x, window.innerWidth - 280),
        top: Math.min(position.y, window.innerHeight - 200),
      }}
    >
      <div className="bg-[#1e1e1e] border border-white/20 rounded-xl shadow-2xl p-3 min-w-[260px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
          <div>
            <h3 className="text-white font-medium text-sm">Analyze Selection</h3>
            <p className="text-white/60 text-xs">
              {selectedCode.length > 50 
                ? `${selectedCode.substring(0, 50)}...` 
                : selectedCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Analysis Options */}
        <div className="space-y-1">
          {analysisOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onAnalyze(option.id as 'explain' | 'security' | 'optimize', selectedCode)
                onClose()
              }}
              className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <option.icon className={`h-4 w-4 ${option.color}`} />
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{option.label}</div>
                <div className="text-white/60 text-xs">{option.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-3 pt-2 border-t border-white/10">
          <div className="flex justify-between text-xs text-white/60">
            <span>Lines: {selectedCode.split('\n').length}</span>
            <span>Chars: {selectedCode.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}