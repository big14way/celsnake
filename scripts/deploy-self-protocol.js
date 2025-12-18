const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SnakesGameV2WithSelfProtocol to Celo Mainnet...\n");
  console.log("═══════════════════════════════════════════════════════════");

  // Configuration
  const ACHIEVEMENT_TRACKER_ADDRESS = "0x3967c36F5989273f413fcDF7Ed6Fe0f4C191617C"; // Already deployed
  const VERIFICATION_REQUIRED = false; // Start with verification optional
  const SCOPE_SEED = BigInt(Date.now()); // Unique scope seed

  console.log("\n📋 Deployment Configuration:");
  console.log("   Achievement Tracker:", ACHIEVEMENT_TRACKER_ADDRESS);
  console.log("   Verification Required:", VERIFICATION_REQUIRED);
  console.log("   Scope Seed:", SCOPE_SEED.toString());
  console.log("   SELF Hub Address: 0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF");

  try {
    console.log("\n📝 Deploying SnakesGameV2WithSelfProtocol...");
    const SnakesGameV2WithSelfProtocol = await hre.ethers.getContractFactory("SnakesGameV2WithSelfProtocol");

    const snakesGameWithSelf = await SnakesGameV2WithSelfProtocol.deploy(
      ACHIEVEMENT_TRACKER_ADDRESS,
      VERIFICATION_REQUIRED,
      SCOPE_SEED
    );

    await snakesGameWithSelf.waitForDeployment();

    const address = await snakesGameWithSelf.getAddress();

    console.log("✅ SnakesGameV2WithSelfProtocol deployed to:", address);

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("🎉 Deployment Complete!");
    console.log("═══════════════════════════════════════════════════════════\n");

    console.log("📋 Contract Details:");
    console.log(`   Address: ${address}`);
    console.log(`   Achievement Tracker: ${ACHIEVEMENT_TRACKER_ADDRESS}`);
    console.log(`   Verification Required: ${VERIFICATION_REQUIRED}`);
    console.log(`   Scope Seed: ${SCOPE_SEED.toString()}`);
    console.log(`   Celoscan: https://celoscan.io/address/${address}`);

    console.log("\n📋 Next Steps:");
    console.log("1. Verify contract on Celoscan:");
    console.log(`   npx hardhat verify --network celo ${address} ${ACHIEVEMENT_TRACKER_ADDRESS} ${VERIFICATION_REQUIRED} ${SCOPE_SEED.toString()}`);
    console.log("\n2. Enable SELF Protocol verification:");
    console.log("   - Call setVerificationRequired(true) when ready");
    console.log("   - Users will need to verify via SELF Protocol");
    console.log("\n3. Update frontend:");
    console.log(`   - Add contract address: ${address}`);
    console.log("   - Integrate SELF Protocol SDK for verification");
    console.log("\n4. Test verification flow:");
    console.log("   - Test with SELF Protocol verification");
    console.log("   - Ensure verified users can start games");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
