'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon,
  SparklesIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  hasCode?: boolean
}

interface AIAssistantProps {
  contractCode?: string
  onCodeInsert?: (code: string) => void
}

export default function AIAssistant({ contractCode, onCodeInsert }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your Somnia AI Assistant. I can help you with smart contract development, Somnia documentation, and answer questions about the platform. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/gemini-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          contractCode
        }),
      })

      const data = await response.json()

      // Check if response contains Solidity code
      const hasCode = data.response && data.response.includes('```solidity')

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        hasCode
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const extractSolidityCode = (content: string): string | null => {
    const codeMatch = content.match(/```solidity\n([\s\S]*?)\n```/)
    return codeMatch ? codeMatch[1] : null
  }

  const insertCodeToEditor = (content: string) => {
    const code = extractSolidityCode(content)
    if (code && onCodeInsert) {
      onCodeInsert(code)
    }
  }

  const quickActions = [
    { text: 'Write a simple ERC20 token contract', icon: CodeBracketIcon },
    { text: 'Create a basic NFT contract', icon: CodeBracketIcon },
    { text: 'Explain this contract', icon: DocumentTextIcon },
    { text: 'How to deploy on Somnia?', icon: SparklesIcon },
    { text: 'Gas optimization tips', icon: SparklesIcon },
    { text: 'Security best practices', icon: SparklesIcon },
    { text: 'Write a voting contract', icon: CodeBracketIcon },
    { text: 'Create a multi-signature wallet', icon: CodeBracketIcon },
  ]

  return (
    <>
      {/* AI Assistant Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
      >
        <SparklesIcon className="h-6 w-6" />
      </button>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
          <div className="w-[450px] h-[700px] bg-[#1e1e1e] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-6 w-6 text-white" />
                <div>
                  <h3 className="text-white font-semibold">AI Assistant</h3>
                  <p className="text-white/80 text-xs">Somnia Expert</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#2d2d30] text-white border border-white/10'
                    } rounded-2xl overflow-hidden`}
                  >
                    <div className="p-3">
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    {/* Code Insert Button */}
                    {message.type === 'assistant' && message.hasCode && onCodeInsert && (
                      <div className="border-t border-white/10 p-2">
                        <button
                          onClick={() => insertCodeToEditor(message.content)}
                          className="flex items-center space-x-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <PlusIcon className="h-3 w-3" />
                          <span>Insert code to editor</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#2d2d30] text-white border border-white/10 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="p-4 border-t border-white/10 max-h-48 overflow-y-auto">
                <p className="text-white/60 text-xs mb-2">Quick actions:</p>
                <div className="space-y-1">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(action.text)}
                      className="w-full text-left p-2 bg-[#2d2d30] hover:bg-[#3e3e42] rounded-lg text-xs text-white/80 hover:text-white transition-colors border border-white/10 flex items-center space-x-2"
                    >
                      <action.icon className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{action.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about Somnia..."
                  className="flex-1 bg-[#2d2d30] text-white placeholder-white/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}