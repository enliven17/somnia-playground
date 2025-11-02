import { NextRequest, NextResponse } from 'next/server';
import solc from 'solc';

export async function POST(request: NextRequest) {
  try {
    const { source, contractName } = await request.json();

    if (!source) {
      return NextResponse.json(
        { error: 'Source code is required' },
        { status: 400 }
      );
    }

    // Basic syntax validation
    if (!source.includes('pragma solidity') || !source.includes('contract ')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Solidity contract: Missing pragma or contract declaration'
      });
    }

    // Extract contract name from source if not provided
    const contractNameMatch = source.match(/contract\s+(\w+)/);
    const extractedContractName = contractNameMatch ? contractNameMatch[1] : (contractName || 'Contract');

    // Prepare input for solc
    const input = {
      language: 'Solidity',
      sources: {
        'contract.sol': {
          content: source,
        },
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode.object'],
          },
        },
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    };

    try {
      // Compile with solc
      const output = JSON.parse(solc.compile(JSON.stringify(input)));

      // Check for compilation errors
      if (output.errors) {
        const errors = output.errors.filter((error: any) => error.severity === 'error');
        if (errors.length > 0) {
          return NextResponse.json({
            success: false,
            error: errors.map((e: any) => e.formattedMessage).join('\n')
          });
        }
      }

      // Get compiled contract
      const contractFile = output.contracts['contract.sol'];
      if (!contractFile || !contractFile[extractedContractName]) {
        return NextResponse.json({
          success: false,
          error: `Contract '${extractedContractName}' not found in compilation output`
        });
      }

      const contract = contractFile[extractedContractName];
      const abi = contract.abi;
      const bytecode = '0x' + contract.evm.bytecode.object;

      if (!bytecode || bytecode === '0x') {
        return NextResponse.json({
          success: false,
          error: 'No bytecode generated - contract may be abstract or have compilation issues'
        });
      }

      return NextResponse.json({
        success: true,
        abi: abi,
        bytecode: bytecode,
        contractName: extractedContractName,
        message: 'Contract compiled successfully'
      });

    } catch (compileError) {
      console.error('Solc compilation error:', compileError);
      return NextResponse.json({
        success: false,
        error: 'Compilation failed: ' + (compileError instanceof Error ? compileError.message : 'Unknown compilation error')
      });
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'API error: ' + (error instanceof Error ? error.message : 'Unknown error')
    });
  }
}