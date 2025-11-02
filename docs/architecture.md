# Somnia Playground Architecture

## System Overview

```mermaid
graph TB
    A[User Interface] --> B[Code Editor]
    A --> C[Contract Panel]
    A --> D[AI Assistant]
    
    B --> E[Monaco Editor]
    B --> F[File Management]
    
    C --> G[Compile Tab]
    C --> H[Deploy Tab]
    C --> I[Interact Tab]
    
    G --> J["API: /compile"]
    H --> K["API: /deploy"]
    I --> L[Contract Functions]
    
    D --> M["API: /ai-assistant"]
    M --> N[Groq API]
    M --> O[Rule-based Fallback]
    
    J --> P[Solidity Compiler]
    K --> Q[Somnia Testnet]
    
    Q --> R["Chain ID: 50311"]
    Q --> S[Block Explorer]
```

## Component Structure

```mermaid
graph LR
    A[App] --> B[Header]
    A --> C[CodeEditor]
    A --> D[ContractPanel]
    A --> E[AIAssistant]
    A --> F[WalletInput]
    
    C --> G[Monaco Editor]
    C --> H[File Tabs]
    
    D --> I[Compile]
    D --> J[Deploy]
    D --> K[Interact]
    
    E --> L[Chat Interface]
    E --> M[Quick Actions]
```

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Editor**: Monaco Editor (VS Code engine)
- **Styling**: Tailwind CSS
- **Blockchain**: Somnia Testnet (EVM-compatible)
- **AI**: Groq API with Llama 3.1
- **Deployment**: Vercel