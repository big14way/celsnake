const { ethers } = require("hardhat");
const fs = require('fs');

/**
 * Deploy SocialFeatures Contract
 *
 * This script deploys the SocialFeatures contract which handles:
 * - Friend system (requests, accepts, blocks)
 * - Referral system with rewards
 * - Player profiles
 */

async function main() {
  console.log("🚀 Deploying SocialFeatures Contract...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CELO\n");

  // Deploy SocialFeatures
  console.log("📜 Deploying SocialFeatures...");
  const SocialFeatures = await ethers.getContractFactory("SocialFeatures");
  const socialFeatures = await SocialFeatures.deploy();
  await socialFeatures.waitForDeployment();

  const contractAddress = await socialFeatures.getAddress();
  console.log("✅ SocialFeatures deployed to:", contractAddress);
  console.log("   Transaction hash:", socialFeatures.deploymentTransaction().hash);

  // Fund the referral treasury with initial CELO
  const initialTreasuryFunding = ethers.parseEther("1.0"); // 1 CELO
  console.log("\n💰 Funding referral treasury with 1 CELO...");

  const fundTx = await socialFeatures.fundReferralTreasury({
    value: initialTreasuryFunding,
  });
  await fundTx.wait();

  console.log("✅ Treasury funded successfully");
  console.log("   Transaction hash:", fundTx.hash);

  // Get current treasury balance
  const treasuryBalance = await socialFeatures.referralTreasury();
  console.log("   Current treasury balance:", ethers.formatEther(treasuryBalance), "CELO");

  // Display referral reward settings
  const referrerRewardBps = await socialFeatures.referrerRewardBps();
  const refereeRewardBps = await socialFeatures.refereeRewardBps();
  const minReferralReward = await socialFeatures.minReferralReward();
  const maxReferralReward = await socialFeatures.maxReferralReward();

  console.log("\n⚙️  Referral Reward Settings:");
  console.log("   Referrer Reward:", Number(referrerRewardBps) / 100, "%");
  console.log("   Referee Reward:", Number(refereeRewardBps) / 100, "%");
  console.log("   Min Reward:", ethers.formatEther(minReferralReward), "CELO");
  console.log("   Max Reward:", ethers.formatEther(maxReferralReward), "CELO");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  const network = await deployer.provider.getNetwork();
  console.log("Network:", network.name || "unknown");
  console.log("Chain ID:", network.chainId || "unknown");
  console.log("Deployer:", deployer.address);
  console.log("SocialFeatures Address:", contractAddress);
  console.log("=".repeat(60));

  console.log("\n📝 Next Steps:");
  console.log("1. Update src/contracts/addresses.ts with the new contract address:");
  console.log(`   SocialFeatures: "${contractAddress}",`);
  console.log("\n2. Update src/utils/socialContract.ts with the contract address:");
  console.log(`   export const SOCIAL_CONTRACT_ADDRESS = '${contractAddress}' as Address;`);
  console.log("\n3. Verify the contract on CeloScan:");
  console.log(`   npx hardhat verify --network celoSepolia ${contractAddress}`);
  console.log("\n4. Test the deployment:");
  console.log("   - Create a profile");
  console.log("   - Send a friend request");
  console.log("   - Create a referral code");
  console.log("\n✨ Deployment Complete!\n");

  // Save deployment info to file
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    socialFeatures: contractAddress,
    treasuryBalance: ethers.formatEther(treasuryBalance),
    timestamp: new Date().toISOString(),
  };

  if (!fs.existsSync('deployments')) {
    fs.mkdirSync('deployments');
  }

  fs.writeFileSync(
    'deployments/social-features.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to: deployments/social-features.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed!");
    console.error(error);
    process.exit(1);
  });
