import { NextRequest, NextResponse } from 'next/server'

// Simple mock compiler for development
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid contract code' },
        { status: 400 }
      )
    }

    // Basic syntax validation
    const errors = validateSolidity(code)
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: errors.join('\n')
      })
    }

    // Extract contract name
    const contractName = extractContractName(code)
    
    // Generate mock ABI based on functions found in code
    const abi = generateMockABI(code)
    
    // Generate mock bytecode (this is just for demo - not real bytecode)
    const bytecode = generateMockBytecode(contractName)

    return NextResponse.json({
      success: true,
      abi,
      bytecode,
      output: `Contract ${contractName} compiled successfully (mock compilation)`
    })

  } catch (error: any) {
    console.error('Compilation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

function validateSolidity(code: string): string[] {
  const errors: string[] = []

  // Check for pragma
  if (!code.includes('pragma solidity')) {
    errors.push('Missing pragma solidity directive')
  }

  // Check for contract declaration
  if (!code.match(/contract\s+\w+/)) {
    errors.push('No contract declaration found')
  }

  // Check for basic syntax issues
  const openBraces = (code.match(/{/g) || []).length
  const closeBraces = (code.match(/}/g) || []).length
  if (openBraces !== closeBraces) {
    errors.push('Mismatched braces')
  }

  const openParens = (code.match(/\(/g) || []).length
  const closeParens = (code.match(/\)/g) || []).length
  if (openParens !== closeParens) {
    errors.push('Mismatched parentheses')
  }

  return errors
}

function extractContractName(code: string): string {
  const match = code.match(/contract\s+(\w+)/)
  return match ? match[1] : 'TempContract'
}

function generateMockABI(code: string): any[] {
  const abi: any[] = []

  // Extract constructor
  const constructorMatch = code.match(/constructor\s*\([^)]*\)/)
  if (constructorMatch) {
    abi.push({
      type: 'constructor',
      inputs: [],
      stateMutability: 'nonpayable'
    })
  }

  // Extract functions
  const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*(public|private|internal|external)?\s*(view|pure|payable)?\s*(returns\s*\([^)]*\))?/g
  let match
  while ((match = functionRegex.exec(code)) !== null) {
    const name = match[1]
    const visibility = match[2] || 'public'
    const stateMutability = match[3] || 'nonpayable'
    
    if (visibility === 'public' || visibility === 'external') {
      abi.push({
        type: 'function',
        name,
        inputs: [],
        outputs: [],
        stateMutability: stateMutability === 'payable' ? 'payable' : stateMutability === 'view' ? 'view' : stateMutability === 'pure' ? 'pure' : 'nonpayable'
      })
    }
  }

  // Extract public variables
  const publicVarRegex = /(\w+)\s+public\s+(\w+)/g
  let varMatch
  while ((varMatch = publicVarRegex.exec(code)) !== null) {
    const name = varMatch[2]
    abi.push({
      type: 'function',
      name,
      inputs: [],
      outputs: [{ type: varMatch[1], name: '' }],
      stateMutability: 'view'
    })
  }

  // Extract events
  const eventRegex = /event\s+(\w+)\s*\([^)]*\)/g
  let eventMatch
  while ((eventMatch = eventRegex.exec(code)) !== null) {
    const name = eventMatch[1]
    abi.push({
      type: 'event',
      name,
      inputs: [],
      anonymous: false
    })
  }

  return abi
}

function generateMockBytecode(contractName: string): string {
  // Generate a mock bytecode that looks realistic but is not functional
  const baseCode = '608060405234801561001057600080fd5b50'
  const contractHash = contractName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const mockCode = contractHash.toString(16).padStart(8, '0').repeat(20)
  return '0x' + baseCode + mockCode
}