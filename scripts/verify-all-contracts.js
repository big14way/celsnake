/**
 * Verify All Deployed Contracts on CeloScan Sepolia
 *
 * This script verifies all 6 deployed contracts with their constructor arguments
 */

const hre = require("hardhat");

async function main() {
  console.log('🔍 Verifying all contracts on CeloScan Sepolia...\n');

  const contracts = [
    {
      name: 'SnakeAchievementNFT',
      address: '0x6559B28fd6bEc8ff450D4f654841AADa273ac876',
      constructorArgs: ['ipfs://QmPlaceholder/']
    },
    {
      name: 'AchievementTracker',
      address: '0x85e3569ef3DDEE12Bb68772d2Cf73612e82e39Ea',
      constructorArgs: [
        '0x6559B28fd6bEc8ff450D4f654841AADa273ac876'  // achievementNFT (only 1 arg)
      ]
    },
    {
      name: 'SnakesGameV2',
      address: '0x6315d606bBfcC28d9f037A7bdB1dCb21387cEA73',
      constructorArgs: [
        '0x85e3569ef3DDEE12Bb68772d2Cf73612e82e39Ea'  // achievementTracker
      ]
    },
    {
      name: 'MultiplayerSnakesGameV2',
      address: '0x7f59A01F0BfD7970846Db71814c9A17F488CCfcF',
      constructorArgs: [
        '0x85e3569ef3DDEE12Bb68772d2Cf73612e82e39Ea'  // achievementTracker
      ]
    },
    {
      name: 'TournamentManager',
      address: '0x7BE60377E17aD50b289F306996fa31494364c56a',
      constructorArgs: [
        '0x7f59A01F0BfD7970846Db71814c9A17F488CCfcF', // multiplayerGame
        '0x85e3569ef3DDEE12Bb68772d2Cf73612e82e39Ea'  // achievementTracker
      ]
    },
    {
      name: 'SocialFeatures',
      address: '0x445383147Ad5Aba947C1b2aeE6dD607E26dfFCEB',
      constructorArgs: []
    }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const contract of contracts) {
    console.log(`\n📄 Verifying ${contract.name}...`);
    console.log(`   Address: ${contract.address}`);

    try {
      await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.constructorArgs,
      });

      console.log(`✅ ${contract.name} verified successfully!`);
      successCount++;
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`✅ ${contract.name} is already verified`);
        successCount++;
      } else {
        console.log(`❌ ${contract.name} verification failed:`);
        console.log(`   ${error.message}`);
        failCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}/${contracts.length}`);
  console.log(`❌ Failed: ${failCount}/${contracts.length}`);
  console.log('='.repeat(60));

  console.log('\n🔗 View contracts on CeloScan:');
  contracts.forEach(contract => {
    console.log(`${contract.name}:`);
    console.log(`  https://sepolia.celoscan.io/address/${contract.address}\n`);
  });

  console.log('✨ Verification process complete!\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
