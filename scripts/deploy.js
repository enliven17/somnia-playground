const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy SendenSomnia contract
  const SendenSomnia = await hre.ethers.getContractFactory("SendenSomnia");
  const sendenSomnia = await SendenSomnia.deploy(1000000); // 1M initial supply

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