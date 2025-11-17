const hre = require("hardhat");

async function main() {
  console.log("Checking wallet balance on Celo Alfajores...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "CELO");
  
  if (balance == 0n) {
    console.log("\n⚠️  WARNING: No balance! Get testnet CELO from:");
    console.log("https://faucet.celo.org/alfajores");
  }
}

main().catch(console.error);
