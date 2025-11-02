'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface NewFileModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (fileName: string) => void
}

export default function NewFileModal({ isOpen, onClose, onConfirm }: NewFileModalProps) {
  const [fileName, setFileName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (fileName.trim()) {
      onConfirm(fileName.trim())
      setFileName('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div className="bg-[#2d2d30] border border-[#3e3e42] rounded-lg shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#3e3e42]">
            <h3 className="text-lg font-semibold text-white">New Contract</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contract Name
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. MyToken, Marketplace"
                className="w-full p-3 bg-[#3c3c3c] border border-[#5a5a5a] rounded text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1">
                File will be saved as {fileName || 'ContractName'}.sol
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#3e3e42] rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!fileName.trim()}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}