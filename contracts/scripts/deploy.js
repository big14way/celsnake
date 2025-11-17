const hre = require("hardhat");

async function main() {
  console.log("Deploying SnakesGame contract to Celo...");

  // Get the contract factory
  const SnakesGame = await hre.ethers.getContractFactory("SnakesGame");
  
  // Deploy the contract
  console.log("Deployment in progress...");
  const snakesGame = await SnakesGame.deploy();
  
  await snakesGame.waitForDeployment();
  
  const address = await snakesGame.getAddress();
  
  console.log("✅ SnakesGame deployed to:", address);
  console.log("\nUpdate your .env file with:");
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);
  console.log("\nVerify on Celo Explorer:");
  console.log(`https://explorer.celo.org/alfajores/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
