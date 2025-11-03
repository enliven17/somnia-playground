const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy SendenSomnia contract
  const SendenSomnia = await hre.ethers.getContractFactory("SendenSomnia");
  // Compute Somnia-aware gas limit based on bytecode length
  const bytecode = SendenSomnia.bytecode || SendenSomnia.deploy.bytecode || "0x";
  const byteLen = bytecode.length > 2 ? Math.floor((bytecode.length - 2) / 2) : 0;
  const perByteCost = 3125n; // Somnia deployment cost per byte
  const deployBytecodeCost = BigInt(byteLen) * perByteCost;
  const overhead = 1_500_000n; // constructor/logs/storage overhead
  const buffer = (deployBytecodeCost + overhead) / 4n; // +25%
  const gasLimit = deployBytecodeCost + overhead + buffer;

  const maxPriorityFeePerGas = hre.ethers.parseUnits ? hre.ethers.parseUnits('2', 'gwei') : 2_000_000_000;
  const maxFeePerGas = hre.ethers.parseUnits ? hre.ethers.parseUnits('50', 'gwei') : 50_000_000_000;
  const sendenSomnia = await SendenSomnia.deploy(1000000, {
    gasLimit,
    maxPriorityFeePerGas,
    maxFeePerGas,
  }); // 1M initial supply

  await sendenSomnia.waitForDeployment();
  const contractAddress = await sendenSomnia.getAddress();

  console.log("SendenSomnia deployed to:", contractAddress);
  console.log("Transaction hash:", sendenSomnia.deploymentTransaction().hash);
  
  // Verify contract on explorer (if supported)
  console.log("Contract deployed successfully!");
  console.log("Explorer URL:", `https://shannon-explorer.somnia.network/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });