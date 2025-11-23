const hre = require("hardhat");

async function main() {
  const contractAddress = "0x445383147Ad5Aba947C1b2aeE6dD607E26dfFCEB";

  console.log("Checking contract at:", contractAddress);
  console.log("Network:", (await hre.ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);

  // Check if contract exists
  const code = await hre.ethers.provider.getCode(contractAddress);

  if (code === "0x") {
    console.log("❌ No contract found at this address");
    console.log("\nThe contract may not be deployed or the address is incorrect.");
    return;
  }

  console.log("✅ Contract exists!");
  console.log("Code length:", code.length, "bytes");

  // Try to interact with contract
  try {
    const SocialFeatures = await hre.ethers.getContractFactory("SocialFeatures");
    const contract = SocialFeatures.attach(contractAddress);

    const owner = await contract.owner();
    console.log("\n📋 Contract Details:");
    console.log("Owner:", owner);

    const referrerReward = await contract.referrerRewardBps();
    console.log("Referrer reward:", Number(referrerReward) / 100, "%");

    const refereeReward = await contract.refereeRewardBps();
    console.log("Referee reward:", Number(refereeReward) / 100, "%");

    const minReward = await contract.minReferralReward();
    console.log("Min reward:", hre.ethers.formatEther(minReward), "CELO");

    const maxReward = await contract.maxReferralReward();
    console.log("Max reward:", hre.ethers.formatEther(maxReward), "CELO");

    const treasury = await contract.referralTreasury();
    console.log("Treasury balance:", hre.ethers.formatEther(treasury), "CELO");

    console.log("\n✅ Contract is deployed and functional!");

    // Correct explorer URLs
    console.log("\n🔗 View on explorers:");
    console.log("Celo Explorer:", `https://explorer.celo.org/celo-sepolia/address/${contractAddress}`);
    console.log("CeloScan:", `https://celoscan.io/address/${contractAddress}`);

  } catch (error) {
    console.error("❌ Error reading contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
