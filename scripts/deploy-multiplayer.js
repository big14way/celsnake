const hre = require("hardhat");

async function main() {
  console.log("Deploying MultiplayerSnakesGame contract...");

  const MultiplayerSnakesGame = await hre.ethers.getContractFactory("MultiplayerSnakesGame");
  const contract = await MultiplayerSnakesGame.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("MultiplayerSnakesGame deployed to:", address);
  
  // Wait for block confirmations
  console.log("Waiting for block confirmations...");
  await contract.deploymentTransaction().wait(5);
  
  console.log("Contract deployed and confirmed!");
  console.log("\nAdd this to your .env file:");
  console.log(`VITE_MULTIPLAYER_CONTRACT_ADDRESS=${address}`);
  
  console.log("\nVerify with:");
  console.log(`npx hardhat verify --network celoSepolia ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
