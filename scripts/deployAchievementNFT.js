const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SnakeAchievementNFT contract...\n");

  // Get the contract factory
  const SnakeAchievementNFT = await hre.ethers.getContractFactory("SnakeAchievementNFT");

  // Set base URI (can be updated later with actual IPFS CID)
  const baseURI = "ipfs://QmPlaceholder/";

  console.log("📝 Deployment parameters:");
  console.log(`   Base URI: ${baseURI}`);
  console.log("");

  // Deploy the contract
  console.log("⏳ Deploying contract...");
  const achievementNFT = await SnakeAchievementNFT.deploy(baseURI);

  await achievementNFT.waitForDeployment();

  const address = await achievementNFT.getAddress();
  console.log("✅ SnakeAchievementNFT deployed to:", address);
  console.log("");

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const owner = await achievementNFT.owner();
  console.log("   Contract owner:", owner);

  const firstAchievement = await achievementNFT.getAchievement(1);
  console.log(`   First achievement: ${firstAchievement.name}`);
  console.log("");

  // Display next steps
  console.log("📋 Next steps:");
  console.log(`1. Verify contract on block explorer:`);
  console.log(`   npx hardhat verify --network celoTestnet ${address} "${baseURI}"`);
  console.log("");
  console.log("2. Update baseURI with actual IPFS CID:");
  console.log(`   await contract.setBaseURI("ipfs://YOUR_CID/")`);
  console.log("");
  console.log("3. Authorize game contracts to mint achievements:");
  console.log(`   await contract.authorizeMinter(GAME_CONTRACT_ADDRESS)`);
  console.log("");

  // Save deployment info
  const fs = require('fs');
  const path = require('path');

  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: address,
    deployer: owner,
    baseURI: baseURI,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `SnakeAchievementNFT_${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployments/");
  console.log("");
  console.log("🎉 Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
