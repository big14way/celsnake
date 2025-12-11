const hre = require("hardhat");
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceInCelo = Number(balance) / 1e18;
  console.log("Balance:", balanceInCelo, "CELO");
  console.log("Required: ~0.21 CELO");
  if (balanceInCelo < 0.21) {
    console.log("Need to add:", (0.21 - balanceInCelo).toFixed(4), "CELO");
  }
}
main();
