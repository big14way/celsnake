/**
 * Deployment Script for TournamentManager Contract
 * Deploys to Celo Sepolia Testnet
 */

const hre = require("hardhat");

async function main() {
  console.log('🏆 Tournament Manager Deployment Script\n');

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', hre.ethers.formatEther(balance), 'CELO\n');

  // Contract addresses (deployed on Celo Sepolia)
  const MULTIPLAYER_GAME_ADDRESS = '0x7f59A01F0BfD7970846Db71814c9A17F488CCfcF'; // MultiplayerSnakesGameV2
  const ACHIEVEMENT_TRACKER_ADDRESS = '0x85e3569ef3DDEE12Bb68772d2Cf73612e82e39Ea'; // AchievementTracker

  const networkInfo = await hre.ethers.provider.getNetwork();
  console.log('Network:', networkInfo.name);
  console.log('Chain ID:', networkInfo.chainId.toString());

  console.log('Using dependencies:');
  console.log('- MultiplayerGame:', MULTIPLAYER_GAME_ADDRESS);
  console.log('- AchievementTracker:', ACHIEVEMENT_TRACKER_ADDRESS);
  console.log('');

  // Deploy TournamentManager
  console.log('📦 Deploying TournamentManager...');
  const TournamentManager = await hre.ethers.getContractFactory('TournamentManager');
  const tournamentManager = await TournamentManager.deploy(
    MULTIPLAYER_GAME_ADDRESS,
    ACHIEVEMENT_TRACKER_ADDRESS
  );

  await tournamentManager.waitForDeployment();
  const tournamentAddress = await tournamentManager.getAddress();

  console.log('✅ TournamentManager deployed to:', tournamentAddress);
  console.log('');

  // Verify deployment
  console.log('🔍 Verifying deployment...');
  const owner = await tournamentManager.owner();
  console.log('Contract owner:', owner);
  console.log('Deployer:', deployer.address);
  console.log('Owner matches deployer:', owner === deployer.address);
  console.log('');

  // Summary
  console.log('📋 Deployment Summary');
  console.log('═══════════════════════════════════════════════════');
  console.log('TournamentManager:    ', tournamentAddress);
  console.log('MultiplayerGame:      ', MULTIPLAYER_GAME_ADDRESS);
  console.log('AchievementTracker:   ', ACHIEVEMENT_TRACKER_ADDRESS);
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  // Next steps
  console.log('📝 Next Steps:');
  console.log('1. Verify the contract on CeloScan:');
  console.log(`   npx hardhat verify --network celo-testnet ${tournamentAddress} ${MULTIPLAYER_GAME_ADDRESS} ${ACHIEVEMENT_TRACKER_ADDRESS}`);
  console.log('');
  console.log('2. Update frontend config with tournament contract address');
  console.log('');
  console.log('3. Optional: Set admin address if different from owner:');
  console.log('   await tournamentManager.setAdmin(ADMIN_ADDRESS)');
  console.log('');
  console.log('4. Create initial tournaments for testing');
  console.log('');

  // Save deployment info to file
  const fs = require('fs');
  const network = await hre.ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      TournamentManager: tournamentAddress,
      MultiplayerSnakesGameV2: MULTIPLAYER_GAME_ADDRESS,
      AchievementTracker: ACHIEVEMENT_TRACKER_ADDRESS,
    },
  };

  fs.writeFileSync(
    'tournament-deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('💾 Deployment info saved to tournament-deployment.json');
  console.log('');
  console.log('✨ Deployment complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
