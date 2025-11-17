const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SnakesGame contract to Celo Alfajores...\n");

  const SnakesGame = await hre.ethers.getContractFactory("SnakesGame");
  
  console.log("📝 Deployment in progress...");
  const snakesGame = await SnakesGame.deploy();
  
  await snakesGame.waitForDeployment();
  
  const address = await snakesGame.getAddress();
  
  console.log("\n✅ SUCCESS! SnakesGame deployed to:", address);
  console.log("\n📋 Next steps:");
  console.log("1. Update your .env file:");
  console.log(`   VITE_CONTRACT_ADDRESS=${address}`);
  console.log("\n2. Verify on Celo Explorer:");
  console.log(`   https://explorer.celo.org/alfajores/address/${address}`);
  console.log("\n3. Rebuild and redeploy your frontend");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
