const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

/**
 * Deploy the complete V2 achievement system:
 * 1. AchievementTracker (uses existing SnakeAchievementNFT)
 * 2. SnakesGameV2 (enhanced single-player)
 * 3. MultiplayerSnakesGameV2 (enhanced multiplayer)
 */
async function main() {
  console.log("🚀 Deploying V2 Achievement System...\\n");

  // Read existing NFT deployment
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  const nftDeploymentPath = path.join(deploymentsDir, `SnakeAchievementNFT_${hre.network.name}.json`);

  let achievementNFTAddress;
  if (fs.existsSync(nftDeploymentPath)) {
    const nftDeployment = JSON.parse(fs.readFileSync(nftDeploymentPath, 'utf8'));
    achievementNFTAddress = nftDeployment.contractAddress;
    console.log(`✅ Found existing SnakeAchievementNFT: ${achievementNFTAddress}\\n`);
  } else {
    console.error("❌ SnakeAchievementNFT not deployed! Deploy it first using deployAchievementNFT.js");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "CELO\\n");

  // Step 1: Deploy AchievementTracker
  console.log("⏳ Deploying AchievementTracker...");
  const AchievementTracker = await hre.ethers.getContractFactory("AchievementTracker");
  const achievementTracker = await AchievementTracker.deploy(achievementNFTAddress);
  await achievementTracker.waitForDeployment();
  const trackerAddress = await achievementTracker.getAddress();
  console.log("✅ AchievementTracker deployed to:", trackerAddress);
  console.log("");

  // Step 2: Authorize AchievementTracker as minter on NFT contract
  console.log("⏳ Authorizing AchievementTracker as NFT minter...");
  const SnakeAchievementNFT = await hre.ethers.getContractFactory("SnakeAchievementNFT");
  const nftContract = SnakeAchievementNFT.attach(achievementNFTAddress);
  const authTx = await nftContract.authorizeMinter(trackerAddress);
  await authTx.wait();
  console.log("✅ AchievementTracker authorized");
  console.log("");

  // Step 3: Deploy SnakesGameV2
  console.log("⏳ Deploying SnakesGameV2...");
  const SnakesGameV2 = await hre.ethers.getContractFactory("SnakesGameV2");
  const snakesGameV2 = await SnakesGameV2.deploy(trackerAddress);
  await snakesGameV2.waitForDeployment();
  const singlePlayerAddress = await snakesGameV2.getAddress();
  console.log("✅ SnakesGameV2 deployed to:", singlePlayerAddress);
  console.log("");

  // Step 4: Deploy MultiplayerSnakesGameV2
  console.log("⏳ Deploying MultiplayerSnakesGameV2...");
  const MultiplayerSnakesGameV2 = await hre.ethers.getContractFactory("MultiplayerSnakesGameV2");
  const multiplayerGameV2 = await MultiplayerSnakesGameV2.deploy(trackerAddress);
  await multiplayerGameV2.waitForDeployment();
  const multiplayerAddress = await multiplayerGameV2.getAddress();
  console.log("✅ MultiplayerSnakesGameV2 deployed to:", multiplayerAddress);
  console.log("");

  // Step 5: Authorize game contracts to report progress to tracker
  console.log("⏳ Authorizing game contracts on AchievementTracker...");
  const authSingleTx = await achievementTracker.authorizeGame(singlePlayerAddress);
  await authSingleTx.wait();
  console.log("✅ SnakesGameV2 authorized");

  const authMultiTx = await achievementTracker.authorizeGame(multiplayerAddress);
  await authMultiTx.wait();
  console.log("✅ MultiplayerSnakesGameV2 authorized");
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    contracts: {
      SnakeAchievementNFT: achievementNFTAddress,
      AchievementTracker: trackerAddress,
      SnakesGameV2: singlePlayerAddress,
      MultiplayerSnakesGameV2: multiplayerAddress
    }
  };

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `V2System_${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployments/");
  console.log("");

  // Display summary
  console.log("========================================");
  console.log("🎉 V2 System Deployment Complete!");
  console.log("========================================");
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log("   SnakeAchievementNFT:      ", achievementNFTAddress);
  console.log("   AchievementTracker:       ", trackerAddress);
  console.log("   SnakesGameV2:             ", singlePlayerAddress);
  console.log("   MultiplayerSnakesGameV2:  ", multiplayerAddress);
  console.log("");

  console.log("📋 Next Steps:");
  console.log("1. Verify contracts on block explorer:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${trackerAddress} "${achievementNFTAddress}"`);
  console.log(`   npx hardhat verify --network ${hre.network.name} ${singlePlayerAddress} "${trackerAddress}"`);
  console.log(`   npx hardhat verify --network ${hre.network.name} ${multiplayerAddress} "${trackerAddress}"`);
  console.log("");
  console.log("2. Update frontend with new contract addresses");
  console.log("");
  console.log("3. Test achievement minting:");
  console.log("   - Play games and win to earn achievements");
  console.log("   - Check NFT balance increases");
  console.log("   - Verify discounts apply correctly");
  console.log("");
  console.log("4. Fund game contracts with CELO for payouts");
  console.log("");

  // Create a frontend constants file
  const constantsContent = `// Auto-generated contract addresses
// Generated on: ${new Date().toISOString()}
// Network: ${hre.network.name}

export const CONTRACT_ADDRESSES = {
  SnakeAchievementNFT: "${achievementNFTAddress}",
  AchievementTracker: "${trackerAddress}",
  SnakesGameV2: "${singlePlayerAddress}",
  MultiplayerSnakesGameV2: "${multiplayerAddress}",

  // Legacy contracts (for reference)
  SnakesGame: "TO_BE_FILLED",
  MultiplayerSnakesGame: "TO_BE_FILLED"
};

export const NETWORK = "${hre.network.name}";
export const CHAIN_ID = ${hre.network.config.chainId};
`;

  const srcDir = path.join(__dirname, '..', 'src', 'contracts');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(srcDir, 'addresses.ts'),
    constantsContent
  );

  console.log("💾 Frontend constants generated at src/contracts/addresses.ts");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
