import { NextRequest, NextResponse } from 'next/server';
import * as solc from 'solc';
import * as fs from 'node:fs';
import * as path from 'node:path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const source: string = body.source || body.code;
    const contractNameProvided: string | undefined = body.contractName;

    if (!source || typeof source !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Source code is required' },
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
    const extractedContractName = contractNameMatch ? contractNameMatch[1] : (contractNameProvided || 'Contract');

    // Prepare solc input
    const filename = 'Contract.sol';
    const input = {
      language: 'Solidity',
      sources: {
        [filename]: { content: source },
      },
      settings: {
        optimizer: { enabled: true, runs: 200 },
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode.object']
          }
        }
      }
    } as const;

    function findImports(importPath: string): { contents?: string; error?: string } {
      try {
        // Support node_modules (e.g., @openzeppelin/...)
        const nodeModulesPath = path.join(process.cwd(), 'node_modules', importPath);
        if (fs.existsSync(nodeModulesPath)) {
          return { contents: fs.readFileSync(nodeModulesPath, 'utf8') };
        }
        // Relative imports next to the file (not used by default editor, but safe)
        const relativePath = path.join(process.cwd(), importPath);
        if (fs.existsSync(relativePath)) {
          return { contents: fs.readFileSync(relativePath, 'utf8') };
        }
        return { error: `Import not found: ${importPath}` };
      } catch (e: any) {
        return { error: `Import read error: ${e?.message || e}` };
      }
    }

    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

    if (output.errors && output.errors.length) {
      const errors = output.errors.filter((e: any) => e.severity === 'error');
      if (errors.length > 0) {
        return NextResponse.json({
          success: false,
          error: errors.map((e: any) => e.formattedMessage || e.message).join('\n')
        });
      }
    }

    const contractFile = output.contracts?.[filename];
    if (!contractFile) {
      return NextResponse.json({ success: false, error: 'No contract output produced' });
    }

    const availableNames = Object.keys(contractFile);
    const nameToUse = availableNames.includes(extractedContractName)
      ? extractedContractName
      : availableNames[0];

    const compiled = contractFile[nameToUse];
    const abi = compiled.abi;
    const bytecodeObject = compiled.evm?.bytecode?.object || '';
    const bytecode = bytecodeObject ? ('0x' + bytecodeObject) : '0x';

    if (!bytecode || bytecode === '0x') {
      return NextResponse.json({
        success: false,
        error: 'No bytecode generated - contract may be abstract or compile failed'
      });
    }

    return NextResponse.json({
      success: true,
      abi,
      bytecode,
      contractName: nameToUse,
      message: 'Contract compiled successfully (local solc)'
    });

  } catch (error: any) {
    console.error('Compilation API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Compilation failed: ' + (error?.message || String(error))
    }, { status: 500 });
  }
}