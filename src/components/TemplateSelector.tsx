'use client'

import { useState } from 'react'
import { ChevronDownIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { CONTRACT_TEMPLATES } from '@/lib/contractTemplates'
import { ContractTemplate } from '@/types/contract'

interface TemplateSelectorProps {
  onSelectTemplate: (template: ContractTemplate) => void
}

export default function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary flex items-center space-x-2 hover-lift group"
      >
        <SparklesIcon className="h-4 w-4 group-hover:text-somnia-400 transition-colors" />
        <span className="font-medium">Templates</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-80 glass-card shadow-2xl z-[9999] border border-white/20" 
               style={{ animation: 'slideInUp 0.3s ease-out' }}>
            
            {/* Header */}
            <div className="p-3 border-b border-white/20">
              <h3 className="text-sm font-semibold text-white">Choose Template</h3>
            </div>

          {/* Templates List */}
          <div className="max-h-64 overflow-y-auto">
            {CONTRACT_TEMPLATES.map((template, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelectTemplate(template)
                  setIsOpen(false)
                }}
                className="w-full p-3 text-left hover:bg-white/10 border-b border-white/5 last:border-b-0 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    template.category === 'token' ? 'bg-blue-500/20 text-blue-300' :
                    template.category === 'defi' ? 'bg-green-500/20 text-green-300' :
                    template.category === 'nft' ? 'bg-purple-500/20 text-purple-300' :
                    template.category === 'governance' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    <span className="text-sm">
                      {template.category === 'token' ? '🪙' :
                       template.category === 'defi' ? '💰' :
                       template.category === 'nft' ? '🎨' :
                       template.category === 'governance' ? '🗳️' :
                       '🔧'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white group-hover:text-somnia-300 transition-colors text-sm">
                      {template.name}
                    </div>
                    <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors mt-1">
                      {template.description}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    template.category === 'token' ? 'bg-blue-500/20 text-blue-300' :
                    template.category === 'defi' ? 'bg-green-500/20 text-green-300' :
                    template.category === 'nft' ? 'bg-purple-500/20 text-purple-300' :
                    template.category === 'governance' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {template.category}
                  </div>
                </div>
              </button>
            ))}
          </div>
          </div>
        </>
      )}
    </div>
  )
}