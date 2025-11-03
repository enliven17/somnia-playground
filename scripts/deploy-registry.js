const hre = require("hardhat");
require('dotenv').config({ path: '.env.local' });

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying PlaygroundRegistry with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Get treasury address from environment
  const treasury = process.env.TREASURY_ADDRESS;
  if (!treasury) {
    throw new Error("TREASURY_ADDRESS environment variable is required");
  }

  console.log("Treasury address:", treasury);

  // Deploy PlaygroundRegistry
  const Registry = await hre.ethers.getContractFactory("PlaygroundRegistry");
  
  // Compute Somnia-aware gas limit based on bytecode length
  const bytecode = Registry.bytecode || "0x";
  const byteLen = bytecode.length > 2 ? Math.floor((bytecode.length - 2) / 2) : 0;
  const perByteCost = 3125n; // Somnia deployment cost per byte
  const deployBytecodeCost = BigInt(byteLen) * perByteCost;
  const overhead = 3_000_000n; // constructor/logs/storage overhead
  const buffer = (deployBytecodeCost + overhead) / 2n; // +50% buffer
  const gasLimit = deployBytecodeCost + overhead + buffer;

  const maxPriorityFeePerGas = hre.ethers.parseUnits ? hre.ethers.parseUnits('2', 'gwei') : 2_000_000_000;
  const maxFeePerGas = hre.ethers.parseUnits ? hre.ethers.parseUnits('50', 'gwei') : 50_000_000_000;

  console.log("Deploying with gas limit:", gasLimit.toString());

  const registry = await Registry.deploy(treasury, {
    gasLimit,
    maxPriorityFeePerGas,
    maxFeePerGas,
  });

  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  
  console.log("PlaygroundRegistry deployed to:", registryAddress);
  console.log("Transaction hash:", registry.deploymentTransaction().hash);
  console.log("Explorer URL:", `https://shannon-explorer.somnia.network/address/${registryAddress}`);
  
  // Save the deployed address to environment
  console.log("\nAdd this to your .env.local file:");
  console.log(`NEXT_PUBLIC_REGISTRY_ADDRESS=${registryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });