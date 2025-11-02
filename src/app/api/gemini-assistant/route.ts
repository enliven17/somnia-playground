import { NextRequest, NextResponse } from 'next/server';

// Gemini API endpoint - doğru format

// Somnia dokümantasyon bilgileri
const SOMNIA_DOCS = {
    overview: `
Somnia is a blockchain platform designed to facilitate decentralized applications and smart contracts. 
It uses a unique consensus mechanism and supports smart contracts for decentralized finance (DeFi) applications.

Key Features:
- EVM Compatible
- Fast transaction processing
- Low gas fees
- Developer-friendly tools
`,

    smartContracts: `
Smart Contract Development on Somnia:

1. Language: Solidity (same as Ethereum)
2. Compiler: Use Solidity 0.8.19 or later
3. Development tools: Remix, Hardhat, Truffle
4. Testnet RPC: https://dream-rpc.somnia.network
5. Explorer: https://shannon-explorer.somnia.network/

Best Practices:
- Always use latest Solidity version
- Enable optimizer for gas efficiency
- Use proper access controls
- Implement proper error handling
- Test thoroughly before mainnet deployment
`,

    deployment: `
Deploying Smart Contracts on Somnia:

1. Configure your wallet with Somnia testnet
2. Get testnet STT tokens from faucet
3. Compile your contract
4. Deploy using Remix, Hardhat, or Somnia Playground

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
2. Pack structs efficiently
3. Use events instead of storage for logs
4. Minimize external calls
5. Use libraries for common functions
6. Implement proper access patterns
7. Consider using proxy patterns for upgradability

Current gas price on Somnia testnet is around 20 gwei.`,

    security: `
Security Best Practices for Somnia:

1. Use OpenZeppelin contracts as base
2. Implement proper access controls
3. Use reentrancy guards
4. Validate all inputs
5. Handle edge cases
6. Use time locks for critical functions
7. Implement emergency stops
8. Regular security audits
`
};

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

export async function POST(request: NextRequest) {
    try {
        const { message, contractCode } = await request.json()

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            )
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            )
        }

        // Prepare context
        const relevantDocs = getRelevantDocs(message)
        
        const systemPrompt = `You are a Somnia AI Assistant, an expert in blockchain development and smart contracts specifically for the Somnia platform. 

SOMNIA PLATFORM INFO:
${relevantDocs}

Your capabilities:
- Help developers with Somnia smart contract development
- Provide accurate information about Somnia network
- Write, review, and improve smart contracts
- Analyze smart contracts for security and optimization
- Generate complete smart contract code when requested
- Give practical, actionable advice
- Be concise but thorough
- Always mention Somnia-specific details when relevant

Current context:
- User is working in Somnia Playground IDE
- Testnet Chain ID: 50312
- RPC: https://dream-rpc.somnia.network
- Explorer: https://shannon-explorer.somnia.network/

IMPORTANT CODING RULES:
1. You CAN use OpenZeppelin imports (@openzeppelin/contracts) - they are fully supported
2. For ERC20 tokens, prefer using OpenZeppelin's ERC20 implementation
3. For access control, use OpenZeppelin's Ownable or AccessControl
4. Include proper SPDX license, pragma directive, and all necessary functions
5. Use modern Solidity best practices and OpenZeppelin standards
6. Always use the latest stable versions of OpenZeppelin contracts

${contractCode ? `\nCurrent contract code:\n\`\`\`solidity\n${contractCode}\n\`\`\`` : ''}

User message: ${message}`

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: systemPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error('Gemini API error:', errorData)
            return NextResponse.json(
                { error: 'Failed to get response from Gemini API' },
                { status: 500 }
            )
        }

        const data = await response.json()
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            return NextResponse.json(
                { error: 'Invalid response from Gemini API' },
                { status: 500 }
            )
        }

        const aiResponse = data.candidates[0].content.parts[0].text

        return NextResponse.json({
            response: aiResponse,
            success: true
        })

    } catch (error) {
        console.error('Gemini Assistant error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}