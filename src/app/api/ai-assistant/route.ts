import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Somnia dokümantasyon bilgileri
const SOMNIA_DOCS = {
    overview: `
Somnia is a blockchain platform designed to facilitate decentralized applications and smart contracts. 
It uses a unique consensus mechanism and supports smart contracts for decentralized finance (DeFi) applications.

Key Features:
- EVM-compatible blockchain
- Testnet Chain ID: 102031
- Native token: CTC
- Gas price: typically 20 gwei
- Block time: ~6 seconds
`,

    smartContracts: `
Smart Contract Development on Somnia:

1. Language: Solidity (same as Ethereum)
2. Compiler: Use Solidity 0.8.19 or later
3. Development tools: Remix, Hardhat, Truffle
4. Testnet RPC: https://dream-rpc.somnia.network
5. Explorer: https://shannon-explorer.somnia.network/

Best Practices:
- Always use SPDX license identifier
- Implement proper access controls
- Use events for important state changes
- Consider gas optimization
- Test thoroughly on testnet before mainnet
`,

    deployment: `
Deploying Smart Contracts on Somnia:

1. Configure your wallet with Somnia testnet
2. Get testnet STT tokens from faucet
3. Compile your contract
4. Deploy using web3 tools or IDE
5. Verify contract on block explorer

Network Configuration:
- Network Name: Somnia Testnet
- RPC URL: https://dream-rpc.somnia.network
- Chain ID: 50312
- Currency Symbol: STT
- Block Explorer: https://shannon-explorer.somnia.network/
`,

    gasOptimization: `
Gas Optimization Tips for Somnia:

1. Use appropriate data types (uint256 vs uint8)
2. Pack struct variables efficiently
3. Use events instead of storing data when possible
4. Minimize external calls
5. Use view/pure functions when possible
6. Consider using libraries for common functions
7. Batch operations when possible
8. Use mapping instead of arrays for lookups
`,

    security: `
Security Best Practices:

1. Access Control:
   - Use OpenZeppelin's Ownable or AccessControl
   - Implement proper role-based permissions
   - Validate all inputs

2. Reentrancy Protection:
   - Use ReentrancyGuard
   - Follow checks-effects-interactions pattern
   - Be careful with external calls

3. Integer Overflow/Underflow:
   - Use SafeMath (or Solidity 0.8+ built-in protection)
   - Validate arithmetic operations

4. Common Vulnerabilities:
   - Avoid tx.origin for authorization
   - Be careful with delegatecall
   - Validate external contract calls
   - Use pull over push for payments
`
}

function getRelevantDocs(message: string): string {
    const lowerMessage = message.toLowerCase()
    let relevantInfo = SOMNIA_DOCS.overview

    if (lowerMessage.includes('deploy') || lowerMessage.includes('deployment')) {
        relevantInfo += '\n\n' + SOMNIA_DOCS.deployment
    }

    if (lowerMessage.includes('gas') || lowerMessage.includes('optimization')) {
        relevantInfo += '\n\n' + SOMNIA_DOCS.gasOptimization
    }

    if (lowerMessage.includes('security') || lowerMessage.includes('safe')) {
        relevantInfo += '\n\n' + SOMNIA_DOCS.security
    }

    if (lowerMessage.includes('contract') || lowerMessage.includes('solidity')) {
        relevantInfo += '\n\n' + SOMNIA_DOCS.smartContracts
    }

    return relevantInfo
}

function generateResponse(message: string, contractCode?: string): string {
    const lowerMessage = message.toLowerCase()

    // Contract analysis
    if (lowerMessage.includes('explain') && contractCode) {
        return analyzeContract(contractCode)
    }

    // Deployment help
    if (lowerMessage.includes('deploy')) {
        return `To deploy your contract on Somnia:

1. Configure Network: Add Somnia testnet to your wallet
   - RPC: https://dream-rpc.somnia.network
   - Chain ID: 50312

2. Get Test Tokens: Visit the Somnia faucet to get testnet STT

3. Compile: Make sure your contract compiles without errors

4. Deploy: Use the Deploy tab in this playground or your preferred tool

5. Verify: Check your contract on the block explorer

Need help with any specific step?`
    }

    // Gas optimization
    if (lowerMessage.includes('gas') || lowerMessage.includes('optimization')) {
        return `Here are key gas optimization tips for Somnia:

🔧 Storage Optimization:
- Pack struct variables (use uint128 instead of uint256 when possible)
- Use mapping instead of arrays for lookups
- Delete unused storage variables

⚡ Code Optimization:
- Use view/pure functions when possible
- Minimize external calls
- Batch operations together
- Use events instead of storing data

💡 Best Practices:
- Test gas usage on testnet first
- Use Solidity optimizer
- Consider using libraries for common functions

Current gas price on Somnia testnet is around 20 gwei.`
    }

    // Security advice
    if (lowerMessage.includes('security') || lowerMessage.includes('safe')) {
        return `🛡️ Security Best Practices for Somnia:

Access Control:
- Use OpenZeppelin's Ownable or AccessControl
- Implement proper role-based permissions
- Always validate inputs

Reentrancy Protection:
- Use ReentrancyGuard modifier
- Follow checks-effects-interactions pattern
- Be careful with external calls

Common Vulnerabilities:
- Never use tx.origin for authorization
- Validate all external contract calls
- Use pull over push for payments
- Be careful with delegatecall

Testing:
- Test thoroughly on testnet
- Use static analysis tools
- Consider formal verification for critical contracts

Would you like me to review your current contract for security issues?`
    }

    // General help
    return `I'm here to help with Somnia development! I can assist with:

📚 Documentation & Guides
- Smart contract development
- Deployment procedures
- Network configuration

🔧 Code Analysis
- Contract review and explanation
- Gas optimization suggestions
- Security best practices

💡 Quick Tips
- Somnia uses EVM, so Ethereum tools work
- Testnet Chain ID: 50312
- Block explorer: shannon-explorer.somnia.network

What specific topic would you like help with?`
}

function analyzeContract(contractCode: string): string {
    const analysis = []

    // Basic contract analysis
    if (contractCode.includes('contract ')) {
        const contractMatch = contractCode.match(/contract\s+(\w+)/)
        if (contractMatch) {
            analysis.push(`📋 Contract: ${contractMatch[1]}`)
        }
    }

    // Check for functions
    const functions = contractCode.match(/function\s+\w+/g)
    if (functions) {
        analysis.push(`🔧 Functions: Found ${functions.length} function(s)`)
    }

    // Check for events
    const events = contractCode.match(/event\s+\w+/g)
    if (events) {
        analysis.push(`📢 Events: Found ${events.length} event(s)`)
    }

    // Security checks
    const securityIssues = []
    if (!contractCode.includes('onlyOwner') && contractCode.includes('owner')) {
        securityIssues.push('Consider using access control modifiers')
    }
    if (contractCode.includes('transfer') && !contractCode.includes('ReentrancyGuard')) {
        securityIssues.push('Consider reentrancy protection for transfers')
    }

    let result = `🔍 Contract Analysis:\n\n${analysis.join('\n')}`

    if (securityIssues.length > 0) {
        result += `\n\n⚠️ Security Suggestions:\n${securityIssues.map(issue => `- ${issue}`).join('\n')}`
    }

    result += '\n\nWould you like me to explain any specific part of your contract?'

    return result
}

async function callGroqAPI(message: string, contractCode?: string, conversationHistory?: any[]): Promise<string> {
    if (!GROQ_API_KEY) {
        console.log('No Groq API key found, using fallback')
        return generateResponse(message, contractCode)
    }

    console.log('Using Groq API with key:', GROQ_API_KEY?.substring(0, 10) + '...')
  console.log('Environment:', process.env.NODE_ENV)
  console.log('All env keys:', Object.keys(process.env).filter(key => key.includes('GROQ')))

    try {
        const systemPrompt = `You are a Somnia AI Assistant, an expert in blockchain development and smart contracts specifically for the Somnia platform. 

SOMNIA PLATFORM INFO:
${Object.values(SOMNIA_DOCS).join('\n\n')}

Your role:
- Help developers with Somnia smart contract development
- Provide accurate information about Somnia network
- Analyze smart contracts for security and optimization
- Give practical, actionable advice
- Be concise but thorough
- Always mention Somnia-specific details when relevant

Current context:
- User is working in Somnia Playground IDE
- Testnet Chain ID: 50312
- RPC: https://dream-rpc.somnia.network
- Explorer: https://shannon-explorer.somnia.network/

${contractCode ? `\nCurrent contract code:\n\`\`\`solidity\n${contractCode}\n\`\`\`` : ''}`

        const messages = [
            { role: 'system', content: systemPrompt },
            ...(conversationHistory || []).slice(-4).map((msg: any) => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            { role: 'user', content: message }
        ]

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages,
                temperature: 0.7,
                max_tokens: 1000,
                top_p: 1,
                stream: false
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`Groq API error ${response.status}:`, errorText)
            throw new Error(`Groq API error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log('Groq API response:', data)
        return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    } catch (error) {
        console.error('Groq API error:', error)
        return generateResponse(message, contractCode) // Fallback to rule-based
    }
}

export async function POST(request: NextRequest) {
    try {
        const { message, contractCode, conversationHistory } = await request.json()

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        // Use Groq API for intelligent responses
        const response = await callGroqAPI(message, contractCode, conversationHistory)

        return NextResponse.json({ response })

    } catch (error) {
        console.error('AI Assistant error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}