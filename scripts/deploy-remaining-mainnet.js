const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Resuming Celo Mainnet Deployment...\n");
  console.log("═══════════════════════════════════════════════════════════");

  // Already deployed addresses
  const deployedAddresses = {
    VITE_ACHIEVEMENT_NFT_ADDRESS: "0xCeD1E5701E5915C3c658A1AE79D9294BAd497A99",
    VITE_ACHIEVEMENT_TRACKER_ADDRESS: "0x3967c36F5989273f413fcDF7Ed6Fe0f4C191617C"
  };

  console.log("\n✅ Already Deployed:");
  console.log("   SnakeAchievementNFT:", deployedAddresses.VITE_ACHIEVEMENT_NFT_ADDRESS);
  console.log("   AchievementTracker:", deployedAddresses.VITE_ACHIEVEMENT_TRACKER_ADDRESS);

  try {
    // Step 3: Deploy SnakesGameV2 (requires AchievementTracker)
    console.log("\n📝 [3/6] Deploying SnakesGameV2...");
    const SnakesGameV2 = await hre.ethers.getContractFactory("SnakesGameV2");
    const snakesGameV2 = await SnakesGameV2.deploy(
      deployedAddresses.VITE_ACHIEVEMENT_TRACKER_ADDRESS
    );
    await snakesGameV2.waitForDeployment();
    deployedAddresses.VITE_CONTRACT_ADDRESS = await snakesGameV2.getAddress();
    console.log("✅ SnakesGameV2 deployed to:", deployedAddresses.VITE_CONTRACT_ADDRESS);

    // Step 4: Deploy MultiplayerSnakesGameV2 (requires AchievementTracker)
    console.log("\n📝 [4/6] Deploying MultiplayerSnakesGameV2...");
    const MultiplayerSnakesGameV2 = await hre.ethers.getContractFactory("MultiplayerSnakesGameV2");
    const multiplayerGame = await MultiplayerSnakesGameV2.deploy(
      deployedAddresses.VITE_ACHIEVEMENT_TRACKER_ADDRESS
    );
    await multiplayerGame.waitForDeployment();
    deployedAddresses.VITE_MULTIPLAYER_CONTRACT_ADDRESS = await multiplayerGame.getAddress();
    console.log("✅ MultiplayerSnakesGameV2 deployed to:", deployedAddresses.VITE_MULTIPLAYER_CONTRACT_ADDRESS);

    // Step 5: Deploy TournamentManager (requires MultiplayerGame and AchievementTracker)
    console.log("\n📝 [5/6] Deploying TournamentManager...");
    const TournamentManager = await hre.ethers.getContractFactory("TournamentManager");
    const tournamentManager = await TournamentManager.deploy(
      deployedAddresses.VITE_MULTIPLAYER_CONTRACT_ADDRESS,
      deployedAddresses.VITE_ACHIEVEMENT_TRACKER_ADDRESS
    );
    await tournamentManager.waitForDeployment();
    deployedAddresses.VITE_TOURNAMENT_CONTRACT_ADDRESS = await tournamentManager.getAddress();
    console.log("✅ TournamentManager deployed to:", deployedAddresses.VITE_TOURNAMENT_CONTRACT_ADDRESS);

    // Step 6: Deploy SocialFeatures (no dependencies)
    console.log("\n📝 [6/6] Deploying SocialFeatures...");
    const SocialFeatures = await hre.ethers.getContractFactory("SocialFeatures");
    const socialFeatures = await SocialFeatures.deploy();
    await socialFeatures.waitForDeployment();
    deployedAddresses.VITE_SOCIAL_CONTRACT_ADDRESS = await socialFeatures.getAddress();
    console.log("✅ SocialFeatures deployed to:", deployedAddresses.VITE_SOCIAL_CONTRACT_ADDRESS);

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🎉 All contracts deployed successfully!");
    console.log("═══════════════════════════════════════════════════════════\n");

    // Display all addresses
    console.log("📋 Deployed Contract Addresses:\n");
    Object.entries(deployedAddresses).forEach(([key, address]) => {
      console.log(`${key}=${address}`);
    });

    // Save addresses to file
    const addressesFile = path.join(__dirname, '..', 'deployed-mainnet-addresses.json');
    fs.writeFileSync(addressesFile, JSON.stringify(deployedAddresses, null, 2));
    console.log(`\n💾 Addresses saved to: ${addressesFile}`);

    // Update .env file
    console.log("\n📝 Updating .env file...");
    updateEnvFile(deployedAddresses);

    // Update README.md
    console.log("📝 Updating README.md...");
    updateReadme(deployedAddresses);

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("✅ DEPLOYMENT COMPLETE!");
    console.log("═══════════════════════════════════════════════════════════\n");

    console.log("📋 Next Steps:");
    console.log("1. Verify contracts on Celoscan:");
    console.log("   npx hardhat verify --network celo <ADDRESS>\n");
    console.log("2. Rebuild frontend:");
    console.log("   npm run build\n");
    console.log("3. Test the application:");
    console.log("   npm run preview\n");
    console.log("4. Deploy to production:");
    console.log("   vercel --prod\n");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    console.log("\n📋 Partially deployed addresses:");
    Object.entries(deployedAddresses).forEach(([key, address]) => {
      console.log(`${key}=${address}`);
    });
    process.exit(1);
  }
}

function updateEnvFile(addresses) {
  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    console.log("⚠️  .env file not found, creating new one...");
    fs.writeFileSync(envPath, '');
  }

  let envContent = fs.readFileSync(envPath, 'utf8');

  // Update or add each address
  Object.entries(addresses).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  });

  // Update network to mainnet
  const networkRegex = /^VITE_NETWORK=.*$/m;
  if (networkRegex.test(envContent)) {
    envContent = envContent.replace(networkRegex, 'VITE_NETWORK=mainnet');
  } else {
    envContent += '\nVITE_NETWORK=mainnet';
  }

  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env file updated with mainnet addresses");
}

function updateReadme(addresses) {
  const readmePath = path.join(__dirname, '..', 'README.md');

  if (!fs.existsSync(readmePath)) {
    console.log("⚠️  README.md not found, skipping...");
    return;
  }

  let readmeContent = fs.readFileSync(readmePath, 'utf8');

  // Update the contract addresses table
  const tableStart = readmeContent.indexOf('| Contract | Address | Description |');
  const tableEnd = readmeContent.indexOf('\n\n', tableStart);

  if (tableStart !== -1 && tableEnd !== -1) {
    const newTable = `| Contract | Address | Description |
|----------|---------|-------------|
| SnakesGameV2 | \`${addresses.VITE_CONTRACT_ADDRESS}\` | Single-player game logic |
| MultiplayerSnakesGameV2 | \`${addresses.VITE_MULTIPLAYER_CONTRACT_ADDRESS}\` | Multiplayer game rooms |
| TournamentManager | \`${addresses.VITE_TOURNAMENT_CONTRACT_ADDRESS}\` | Tournament system |
| SnakeAchievementNFT | \`${addresses.VITE_ACHIEVEMENT_NFT_ADDRESS}\` | Achievement NFTs |
| AchievementTracker | \`${addresses.VITE_ACHIEVEMENT_TRACKER_ADDRESS}\` | Achievement tracking |
| SocialFeatures | \`${addresses.VITE_SOCIAL_CONTRACT_ADDRESS}\` | Social networking |`;

    readmeContent = readmeContent.substring(0, tableStart) + newTable + readmeContent.substring(tableEnd);

    // Update network mention from testnet to mainnet
    readmeContent = readmeContent.replace(
      'All contracts are deployed on **Celo Sepolia Testnet** (Chain ID: 11142220)',
      'All contracts are deployed on **Celo Mainnet** (Chain ID: 42220)'
    );
  }

  fs.writeFileSync(readmePath, readmeContent);
  console.log("✅ README.md updated with mainnet addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
