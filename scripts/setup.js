const fs = require('fs');
const path = require('path');

console.log('🚀 Somnia Playground Setup');
console.log('================================');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  
  const envExample = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  
  console.log('✅ .env.local created successfully!');
  console.log('⚠️  Please add your PRIVATE_KEY to .env.local');
} else {
  console.log('✅ .env.local already exists');
}

// Check if contracts directory exists
const contractsDir = path.join(process.cwd(), 'contracts');
if (!fs.existsSync(contractsDir)) {
  console.log('📁 Creating contracts directory...');
  fs.mkdirSync(contractsDir, { recursive: true });
  console.log('✅ Contracts directory created');
}

// Check if temp directory exists
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  console.log('📁 Creating temp directory...');
  fs.mkdirSync(tempDir, { recursive: true });
  console.log('✅ Temp directory created');
}

console.log('');
console.log('🎉 Setup completed successfully!');
console.log('');
console.log('Next steps:');
console.log('1. Add your private key to .env.local');
console.log('2. Make sure you have testnet STT tokens');
console.log('3. Run: npm run dev');
console.log('');
console.log('📚 Useful links:');
console.log('- Somnia Docs: https://docs.somnia.network/');
console.log('- Testnet Explorer: https://shannon-explorer.somnia.network/');
console.log('- Somnia Faucet: https://faucet.somnia.network');