const hre = require("hardhat");
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const address = deployer.address;
  console.log("\n🔑 Current Deployer Wallet");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("Address:", address);
  const balance = await hre.ethers.provider.getBalance(address);
  console.log("Balance:", hre.ethers.formatEther(balance), "CELO");
  console.log("═══════════════════════════════════════════════════════════\n");
}
main();
