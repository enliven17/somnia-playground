'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
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
  onAnalysisRequest?: (message: string) => void
}

export interface AIAssistantRef {
  sendAnalysisMessage: (message: string) => void
}

const AIAssistant = forwardRef<AIAssistantRef, AIAssistantProps>(({ contractCode, onCodeInsert }, ref) => {
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

  // Expose sendAnalysisMessage function to parent
  useImperativeHandle(ref, () => ({
    sendAnalysisMessage: (message: string) => {
      setInputMessage(message)
      setIsOpen(true)
      // Automatically send the message
      setTimeout(() => {
        sendMessage()
      }, 100)
    }
  }))

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
    { text: 'Write a simple ERC20 token with OpenZeppelin', icon: CodeBracketIcon },
    { text: 'Create a basic NFT (ERC721) contract', icon: CodeBracketIcon },
    { text: 'Explain this contract', icon: DocumentTextIcon },
    { text: 'How to deploy on Somnia?', icon: SparklesIcon },
    { text: 'Gas optimization tips', icon: SparklesIcon },
    { text: 'Security best practices', icon: SparklesIcon },
    { text: 'Write a voting contract with OpenZeppelin', icon: CodeBracketIcon },
    { text: 'Create a multi-signature wallet', icon: CodeBracketIcon },
  ]

  return (
    <>
      {/* AI Assistant Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-11 h-11 bg-[#2d2d30] hover:bg-[#3e3e42] border border-white/10 hover:border-white/20 text-white/80 hover:text-white rounded-lg transition-all duration-200 flex items-center justify-center z-50 group"
        style={{
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition: 'box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 25px rgba(139, 92, 246, 0.25), 0 8px 15px -3px rgba(0, 0, 0, 0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <SparklesIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
      </button>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
          <div className="w-[420px] h-[650px] bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <div className="bg-[#2d2d30] border-b border-white/10 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-4 w-4 text-white" />
                <div>
                  <h3 className="text-white font-medium text-sm">AI Assistant</h3>
                  <p className="text-white/80 text-xs">Somnia Expert</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.type === 'user'
                        ? 'bg-[#007acc] text-white'
                        : 'bg-[#252526] text-white border border-white/5'
                    } rounded-lg overflow-hidden`}
                  >
                    <div className="p-2.5">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      <p className="text-xs opacity-50 mt-1.5">
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
                  <div className="bg-[#252526] text-white border border-white/5 p-2.5 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="p-3 border-t border-white/5 max-h-44 overflow-y-auto">
                <p className="text-white/50 text-xs mb-2 font-medium">Quick actions</p>
                <div className="space-y-1">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(action.text)}
                      className="w-full text-left p-2 bg-[#252526] hover:bg-[#2d2d30] rounded-md text-xs text-white/70 hover:text-white/90 transition-all duration-150 border border-white/5 hover:border-white/10 flex items-center space-x-2"
                    >
                      <action.icon className="h-3 w-3 flex-shrink-0 opacity-60" />
                      <span className="truncate">{action.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/5">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about Somnia..."
                  className="flex-1 bg-[#252526] text-white placeholder-white/40 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#007acc] focus:bg-[#2d2d30] transition-all"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-[#007acc] hover:bg-[#005a9e] disabled:opacity-40 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors"
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
})

AIAssistant.displayName = 'AIAssistant'

export default AIAssistant