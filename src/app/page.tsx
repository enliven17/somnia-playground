'use client'

import { useState, useRef } from 'react'
import CodeEditor from '@/components/CodeEditor'
import ContractPanel from '@/components/ContractPanel'
import AIAssistant from '@/components/AIAssistant'
import WalletInput from '@/components/WalletInput'
import WalletConnect from '@/components/WalletConnect'
import NewFileModal from '@/components/NewFileModal'
import CodeAnalysisMenu from '@/components/CodeAnalysisMenu'
import { useToast } from '@/contexts/ToastContext'
import { useContractDeploy } from '@/hooks/useContractDeploy'
import { useAccount } from 'wagmi'
import { AIAssistantRef } from '@/components/AIAssistant'

const defaultContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MyContract {
    string public message;
    address public owner;
    
    event MessageUpdated(string newMessage);
    
    constructor() {
        message = "Hello Somnia!";
        owner = msg.sender;
    }
    
    function updateMessage(string memory _newMessage) public {
        require(msg.sender == owner, "Only owner can update message");
        message = _newMessage;
        emit MessageUpdated(_newMessage);
    }
    
    function getMessage() public view returns (string memory) {
        return message;
    }
}`

export default function Home() {
  const [contractCode, setContractCode] = useState<string>(defaultContract)
  const [isCompiling, setIsCompiling] = useState(false)
  const [compilationResult, setCompilationResult] = useState<any>(null)
  const [privateKey, setPrivateKey] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  
  // Wallet hooks
  const { address, isConnected } = useAccount()
  const { deployContract, isDeploying, deploymentResult, error: deployError, reset } = useContractDeploy()
  
  // Code analysis states
  const [selectedCode, setSelectedCode] = useState('')
  const [showAnalysisMenu, setShowAnalysisMenu] = useState(false)
  const [analysisMenuPosition, setAnalysisMenuPosition] = useState({ x: 0, y: 0 })
  const aiAssistantRef = useRef<AIAssistantRef>(null)
  const [currentFileName, setCurrentFileName] = useState('MyContract.sol')
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false)
  const [openFiles, setOpenFiles] = useState<string[]>(['MyContract.sol'])
  const [fileContents, setFileContents] = useState<Record<string, string>>({
    'MyContract.sol': defaultContract
  })
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '$ somnia-playground',
    'Welcome to Somnia Smart Contract IDE',
    'Ready to compile and deploy contracts to Somnia testnet'
  ])
  const { showToast } = useToast()

  const addTerminalLog = (message: string) => {
    setTerminalLogs(prev => [...prev, message])
  }

  const handleCodeSelection = (code: string) => {
    if (code.trim().length > 10) { // Minimum kod uzunluğu
      setSelectedCode(code)
      
      // Mouse pozisyonunu al
      const handleMouseMove = (e: MouseEvent) => {
        setAnalysisMenuPosition({ x: e.clientX + 10, y: e.clientY + 10 })
        setShowAnalysisMenu(true)
        document.removeEventListener('mousemove', handleMouseMove)
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      
      // 100ms sonra mouse listener'ı kaldır
      setTimeout(() => {
        document.removeEventListener('mousemove', handleMouseMove)
      }, 100)
    }
  }

  const handleCodeAnalysis = (type: 'explain' | 'security' | 'optimize', code: string) => {
    let prompt = ''
    
    switch (type) {
      case 'explain':
        prompt = `Please explain this Solidity code in detail:\n\n\`\`\`solidity\n${code}\n\`\`\``
        break
      case 'security':
        prompt = `Please analyze this Solidity code for security vulnerabilities and suggest improvements:\n\n\`\`\`solidity\n${code}\n\`\`\``
        break
      case 'optimize':
        prompt = `Please suggest gas optimizations and improvements for this Solidity code:\n\n\`\`\`solidity\n${code}\n\`\`\``
        break
    }
    
    // AI Assistant'a mesaj gönder
    if (aiAssistantRef.current) {
      aiAssistantRef.current.sendAnalysisMessage(prompt)
    }
    
    addTerminalLog(`$ Analyzing selected code (${type})...`)
    showToast(`Analyzing code for ${type}...`, 'info')
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col">
      {/* IDE Header/Menu Bar */}
      <div className="bg-[#2d2d30] border-b border-[#3e3e42] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-sm">Somnia Playground</span>
          
          {/* Menu Items */}
          <div className="flex items-center space-x-1 text-sm">
            <button className="px-3 py-1 hover:bg-[#3e3e42] rounded text-gray-300 hover:text-white transition-colors">
              File
            </button>
            <button className="px-3 py-1 hover:bg-[#3e3e42] rounded text-gray-300 hover:text-white transition-colors">
              Edit
            </button>
            <button className="px-3 py-1 hover:bg-[#3e3e42] rounded text-gray-300 hover:text-white transition-colors">
              View
            </button>
            <button className="px-3 py-1 hover:bg-[#3e3e42] rounded text-gray-300 hover:text-white transition-colors">
              Terminal
            </button>
            <button className="px-3 py-1 hover:bg-[#3e3e42] rounded text-gray-300 hover:text-white transition-colors">
              Help
            </button>
          </div>
        </div>

        {/* Right side - Wallet and Network status */}
        <div className="flex items-center space-x-4">
          <WalletConnect />
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-300">Somnia Testnet</span>
          </div>
          <a 
            href="https://docs.somnia.network/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            Docs ↗
          </a>
          <a 
            href="https://shannon-explorer.somnia.network/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            Explorer ↗
          </a>
        </div>
      </div>

      {/* Main IDE Layout */}
      <div className="flex-1 flex">


        {/* Explorer Panel */}
        <div className="w-64 bg-[#252526] border-r border-[#3e3e42] flex flex-col">
          <div className="p-3 border-b border-[#3e3e42] flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Explorer</h3>
            <button 
              onClick={() => setIsNewFileModalOpen(true)}
              className="text-gray-400 hover:text-white text-lg hover:bg-[#3e3e42] w-6 h-6 rounded flex items-center justify-center transition-colors"
              title="New File"
            >
              +
            </button>
          </div>
          <div className="flex-1 p-2">
            <div className="space-y-1">
              {/* Contract Files */}
              {openFiles.map((fileName) => (
                <div 
                  key={fileName}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                    currentFileName === fileName ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e] text-gray-300'
                  }`}
                  onClick={() => {
                    setCurrentFileName(fileName)
                    const fileContent = fileContents[fileName] || ''
                    setContractCode(fileContent)
                  }}
                >
                  <span className="text-xs">📄</span>
                  <span className="text-sm">{fileName}</span>
                </div>
              ))}
              
              {/* Static Files */}
              <div className="flex items-center space-x-2 p-2 hover:bg-[#2a2d2e] rounded cursor-pointer text-gray-500">
                <span className="text-xs">⚙️</span>
                <span className="text-sm">hardhat.config.js</span>
              </div>
              <div className="flex items-center space-x-2 p-2 hover:bg-[#2a2d2e] rounded cursor-pointer text-gray-500">
                <span className="text-xs">📦</span>
                <span className="text-sm">package.json</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          <div className="bg-[#2d2d30] border-b border-[#3e3e42] flex items-center px-2">
            <div className="flex items-center bg-[#1e1e1e] border-r border-[#3e3e42]">
              <div className="flex items-center space-x-2 px-4 py-2 bg-[#1e1e1e] text-white border-t-2 border-blue-500">
                <span className="text-xs">📄</span>
                <span className="text-sm">{currentFileName}</span>
                <button className="text-gray-400 hover:text-white ml-2">×</button>
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex">
            {/* Code Editor */}
            <div className="flex-1 bg-[#1e1e1e] relative">
              <CodeEditor
                value={fileContents[currentFileName] || ''}
                onChange={(newCode) => {
                  setContractCode(newCode)
                  setFileContents(prev => ({
                    ...prev,
                    [currentFileName]: newCode
                  }))
                }}
                language="solidity"
                height="calc(100vh - 120px)"
                onCodeSelection={handleCodeSelection}
                onCursorPositionChange={(line, column) => {
                  setCursorPosition({ line, column })
                }}
              />
              
              {/* Code Analysis Menu */}
              {showAnalysisMenu && selectedCode && (
                <CodeAnalysisMenu
                  selectedCode={selectedCode}
                  position={analysisMenuPosition}
                  onAnalyze={handleCodeAnalysis}
                  onClose={() => {
                    setShowAnalysisMenu(false)
                    setSelectedCode('')
                  }}
                />
              )}
            </div>

            {/* Right Panel */}
            <div className="w-80 bg-[#252526] border-l border-[#3e3e42] flex flex-col">
              {/* Panel Header */}
              <div className="bg-[#2d2d30] border-b border-[#3e3e42] px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-300">Contract Tools</h3>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {!isConnected && (
                    <WalletInput 
                      onWalletChange={(key, address) => {
                        setPrivateKey(key)
                        setWalletAddress(address)
                      }}
                    />
                  )}
                  
                  <ContractPanel
              contractCode={contractCode}
              isCompiling={isCompiling}
              isDeploying={isDeploying}
              compilationResult={compilationResult}
              deploymentResult={deploymentResult}
              onCompile={async () => {
                setIsCompiling(true)
                addTerminalLog(`$ Compiling ${currentFileName}...`)
                
                try {
                  // Try simple compiler first, fallback to hardhat
                  let response = await fetch('/api/compile-simple', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: contractCode })
                  })
                  
                  let result = await response.json()
                  
                  // If simple compiler fails, try hardhat
                  if (!result.success) {
                    addTerminalLog('Simple compiler failed, trying Hardhat...')
                    response = await fetch('/api/compile', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ code: contractCode })
                    })
                    result = await response.json()
                  }
                  
                  setCompilationResult(result)
                  
                  if (result.success) {
                    addTerminalLog('✅ Compilation successful!')
                    showToast('Contract compiled successfully!', 'success')
                  } else {
                    addTerminalLog(`❌ Compilation failed: ${result.error}`)
                    showToast('Compilation failed', 'error')
                  }
                } catch (error) {
                  const errorResult = { error: 'Compilation failed: ' + error }
                  setCompilationResult(errorResult)
                  addTerminalLog(`❌ Compilation error: ${error}`)
                  showToast('Compilation error occurred', 'error')
                } finally {
                  setIsCompiling(false)
                }
              }}
              onDeploy={async () => {
                if (!compilationResult?.success) return
                
                // Check if wallet is connected or private key is provided
                if (!isConnected && !privateKey) {
                  showToast('Please connect your wallet or configure private key', 'warning')
                  return
                }
                
                addTerminalLog(`$ Deploying ${currentFileName} to Somnia testnet...`)
                
                try {
                  let result;
                  
                  if (isConnected) {
                    // Use wallet deployment
                    addTerminalLog('Using connected wallet for deployment...')
                    result = await deployContract(contractCode, currentFileName.replace('.sol', ''))
                    
                    if (result) {
                      addTerminalLog('🚀 Deployment successful!')
                      addTerminalLog(`📍 Contract: ${result.address}`)
                      addTerminalLog(`🔗 Transaction: ${result.transactionHash}`)
                      showToast('Contract deployed successfully!', 'success')
                    }
                  } else {
                    // Use private key deployment (legacy method)
                    addTerminalLog('Using private key for deployment...')
                    const response = await fetch('/api/deploy', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        bytecode: compilationResult.bytecode,
                        abi: compilationResult.abi,
                        privateKey: privateKey
                      })
                    })
                    result = await response.json()
                    
                    if (result.success) {
                      addTerminalLog('🚀 Deployment successful!')
                      addTerminalLog(`📍 Contract: ${result.contractAddress}`)
                      addTerminalLog(`🔗 Transaction: ${result.transactionHash}`)
                      showToast('Contract deployed successfully!', 'success')
                    } else {
                      addTerminalLog(`❌ Deployment failed: ${result.error}`)
                      showToast('Deployment failed', 'error')
                    }
                  }
                } catch (error) {
                  addTerminalLog(`❌ Deployment error: ${error}`)
                  showToast('Deployment error occurred', 'error')
                }
              }}
              walletAddress={isConnected ? address : walletAddress}
              hasWallet={isConnected || !!privateKey}
            />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Panel - Terminal/Output */}
          <div className="h-48 bg-[#1e1e1e] border-t border-[#3e3e42] flex flex-col">
            {/* Terminal Tabs */}
            <div className="bg-[#2d2d30] border-b border-[#3e3e42] flex items-center px-2">
              <button className="px-3 py-1 text-sm bg-[#1e1e1e] text-white border-t-2 border-green-500">
                Terminal
              </button>
              <button className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-[#3e3e42] transition-colors">
                Output
              </button>
              <button className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-[#3e3e42] transition-colors">
                Problems
              </button>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 p-3 font-mono text-xs text-gray-300 bg-[#1e1e1e] overflow-y-auto">
              <div className="space-y-1">
                {terminalLogs.map((log, index) => (
                  <div key={index} className={`${
                    log.startsWith('$') ? 'text-green-400' : 
                    log.includes('✅') ? 'text-green-300' :
                    log.includes('❌') ? 'text-red-300' :
                    log.includes('🚀') ? 'text-blue-300' :
                    log.includes('📍') ? 'text-yellow-300' :
                    log.includes('🔗') ? 'text-cyan-300' :
                    'text-gray-400'
                  }`}>
                    {log}
                  </div>
                ))}
                <div className="flex items-center">
                  <span className="text-green-400">$ </span>
                  <div className="w-1 h-3 bg-white ml-1 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-[#007acc] text-white px-4 py-1 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <span>Ln 1, Col 1</span>
          <span>Solidity</span>
          <span>UTF-8</span>
          <span>CRLF</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Chain ID: 50312</span>
          <span>Gas Price: 20 gwei</span>
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Connected</span>
          </span>
        </div>
      </div>

      {/* New File Modal */}
      <NewFileModal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        onConfirm={(fileName) => {
          const newFileName = fileName + '.sol'
          const newFileContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ${fileName} {
    // Your contract code here
}`
          
          setCurrentFileName(newFileName)
          setOpenFiles(prev => [...prev, newFileName])
          setFileContents(prev => ({
            ...prev,
            [newFileName]: newFileContent
          }))
          setContractCode(newFileContent)
          showToast(`Created new contract: ${newFileName}`, 'success')
        }}
      />

      {/* AI Assistant */}
      <AIAssistant 
        ref={aiAssistantRef}
        contractCode={contractCode} 
        onCodeInsert={(code) => {
          setContractCode(code)
          setFileContents(prev => ({
            ...prev,
            [currentFileName]: code
          }))
          showToast('Code inserted from AI Assistant!', 'success')
        }}
      />
    </div>
  )
}