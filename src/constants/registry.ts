export const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || '';

export const REGISTRY_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "treasuryAddress", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "deployedContract", "type": "address" },
      { "internalType": "string", "name": "metadataURI", "type": "string" }
    ],
    "name": "registerDeployment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "deployedContract", "type": "address" },
      { "internalType": "bytes32", "name": "tag", "type": "bytes32" }
    ],
    "name": "treasuryPing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "deployer", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "contractAddress", "type": "address" },
      { "indexed": true, "internalType": "uint64", "name": "chainId", "type": "uint64" },
      { "indexed": false, "internalType": "string", "name": "metadataURI", "type": "string" }
    ],
    "name": "DeploymentRegistered",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "totalDeployments",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "contractIndex",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;


