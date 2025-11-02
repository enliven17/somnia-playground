'use client'

import { Editor } from '@monaco-editor/react'
import { useEffect, useRef } from 'react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string
  onCursorPositionChange?: (line: number, column: number) => void
  onCodeSelection?: (selectedCode: string) => void
}

export default function CodeEditor({ 
  value, 
  onChange, 
  language = 'solidity',
  height = '500px',
  onCursorPositionChange,
  onCodeSelection
}: CodeEditorProps) {
  const editorRef = useRef<any>(null)

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor

    // Add selection change listener
    editor.onDidChangeCursorSelection((e: any) => {
      if (onCursorPositionChange) {
        const position = editor.getPosition()
        if (position) {
          onCursorPositionChange(position.lineNumber, position.column)
        }
      }

      // Handle code selection
      if (onCodeSelection) {
        const selection = editor.getSelection()
        if (selection && !selection.isEmpty()) {
          const selectedText = editor.getModel()?.getValueInRange(selection)
          if (selectedText && selectedText.trim().length > 0) {
            onCodeSelection(selectedText)
          }
        }
      }
    })

    // Configure Solidity language support
    monaco.languages.register({ id: 'solidity' })
    
    monaco.languages.setMonarchTokensProvider('solidity', {
      tokenizer: {
        root: [
          [/pragma\s+solidity/, 'keyword'],
          [/contract\s+\w+/, 'keyword'],
          [/function\s+\w+/, 'keyword'],
          [/\b(uint256|uint|int|bool|address|string|bytes|mapping)\b/, 'type'],
          [/\b(public|private|internal|external|pure|view|payable|constant)\b/, 'keyword'],
          [/\b(if|else|for|while|do|break|continue|return|throw|emit|require|assert|revert)\b/, 'keyword'],
          [/\b(true|false|null|undefined)\b/, 'constant'],
          [/\/\/.*$/, 'comment'],
          [/\/\*[\s\S]*?\*\//, 'comment'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string'],
          [/\d+/, 'number'],
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, 'string', '@pop']
        ]
      }
    })

    // Set editor theme
    monaco.editor.defineTheme('somnia-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569CD6' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'comment', foreground: '6A9955' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
      }
    })

    monaco.editor.setTheme('somnia-theme')
  }

  return (
    <div className="relative">
      <div className="glass border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            contextmenu: true,
            selectOnLineNumbers: true,
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 12,
            lineNumbersMinChars: 3,
            fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
            fontLigatures: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            padding: { top: 20, bottom: 20 },
          }}
        />
      </div>
    </div>
  )
}