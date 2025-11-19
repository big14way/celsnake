const fs = require('fs');
const path = require('path');

// Achievement metadata based on contract definitions
const achievements = {
  // Bronze Tier (1-10)
  1: {
    name: "First Victory",
    description: "Win your first game",
    tier: "Bronze",
    image: "ipfs://QmPlaceholder/1.png",
    attributes: [
      { trait_type: "Tier", value: "Bronze" },
      { trait_type: "Category", value: "Milestone" },
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Difficulty", value: "Easy" }
    ]
  },
  2: {
    name: "Getting Started",
    description: "Play 10 games",
    tier: "Bronze",
    image: "ipfs://QmPlaceholder/2.png",
    attributes: [
      { trait_type: "Tier", value: "Bronze" },
      { trait_type: "Category", value: "Milestone" },
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Games Required", value: "10" }
    ]
  },
  3: {
    name: "Regular Player",
    description: "Play 50 games",
    tier: "Bronze",
    image: "ipfs://QmPlaceholder/3.png",
    attributes: [
      { trait_type: "Tier", value: "Bronze" },
      { trait_type: "Category", value: "Milestone" },
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Games Required", value: "50" }
    ]
  },
  4: {
    name: "Dedicated",
    description: "Play 100 games",
    tier: "Bronze",
    image: "ipfs://QmPlaceholder/4.png",
    attributes: [
      { trait_type: "Tier", value: "Bronze" },
      { trait_type: "Category", value: "Milestone" },
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Games Required", value: "100" }
    ]
  },
  5: {
    name: "Committed",
    description: "Play 500 games",
    tier: "Bronze",
    image: "ipfs://QmPlaceholder/5.png",
    attributes: [
      { trait_type: "Tier", value: "Bronze" },
      { trait_type: "Category", value: "Milestone" },
      { trait_type: "Rarity", value: "Uncommon" },
      { trait_type: "Games Required", value: "500" }
    ]
  },
  6: {
    name: "Perfect Roll",
    description: "Complete game without hitting a snake",
    tier: "Bronze",
    image: "ipfs://QmPlaceholder/6.png",
    attributes: [
      { trait_type: "Tier", value: "Bronze" },
      { trait_type: "Category", value: "Skill" },
      { trait_type: "Rarity", value: "Uncommon" },
      { trait_type: "Difficulty", value: "Medium" }
    ]
  },
  7: {
    name: "On Fire",
    description: "Win 5 games in a row",
    tier: "Bronze",
    image: "ipfs://QmPlaceholder/7.png",
    attributes: [
      { trait_type: "Tier", value: "Bronze" },
      { trait_type: "Category", value: "Win Streak" },
      { trait_type: "Rarity", value: "Uncommon" },
      { trait_type: "Streak Required", value: "5" }
    ]
  },
  8: {
    name: "Unstoppable",
    description: "Win 10 games in a row",
    tier: "Bronze",
    image: "ipfs://QmPlaceholder/8.png",
    attributes: [
      { trait_type: "Tier", value: "Bronze" },
      { trait_type: "Category", value: "Win Streak" },
      { trait_type: "Rarity", value: "Rare" },
      { trait_type: "Streak Required", value: "10" }
    ]
  },
  9: {
    name: "High Roller",
    description: "Place a bet of 10 CELO or more",
    tier: "Bronze",
    image: "ipfs://QmPlaceholder/9.png",
    attributes: [
      { trait_type: "Tier", value: "Bronze" },
      { trait_type: "Category", value: "Betting" },
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Min Bet", value: "10 CELO" }
    ]
  },
  10: {
    name: "Multiplayer Champion",
    description: "Win a multiplayer game",
    tier: "Bronze",
    image: "ipfs://QmPlaceholder/10.png",
    attributes: [
      { trait_type: "Tier", value: "Bronze" },
      { trait_type: "Category", value: "Multiplayer" },
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Game Mode", value: "Multiplayer" }
    ]
  },

  // Silver Tier (11-20)
  11: {
    name: "Veteran",
    description: "Play 1000 games",
    tier: "Silver",
    image: "ipfs://QmPlaceholder/11.png",
    attributes: [
      { trait_type: "Tier", value: "Silver" },
      { trait_type: "Category", value: "Milestone" },
      { trait_type: "Rarity", value: "Rare" },
      { trait_type: "Games Required", value: "1000" }
    ]
  },
  12: {
    name: "Dominating",
    description: "Win 20 games in a row",
    tier: "Silver",
    image: "ipfs://QmPlaceholder/12.png",
    attributes: [
      { trait_type: "Tier", value: "Silver" },
      { trait_type: "Category", value: "Win Streak" },
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Streak Required", value: "20" }
    ]
  },
  13: {
    name: "Tournament Ready",
    description: "Participate in a tournament",
    tier: "Silver",
    image: "ipfs://QmPlaceholder/13.png",
    attributes: [
      { trait_type: "Tier", value: "Silver" },
      { trait_type: "Category", value: "Tournament" },
      { trait_type: "Rarity", value: "Uncommon" },
      { trait_type: "Game Mode", value: "Tournament" }
    ]
  },
  14: {
    name: "Big Winner",
    description: "Win 100 CELO total",
    tier: "Silver",
    image: "ipfs://QmPlaceholder/14.png",
    attributes: [
      { trait_type: "Tier", value: "Silver" },
      { trait_type: "Category", value: "Earnings" },
      { trait_type: "Rarity", value: "Rare" },
      { trait_type: "Total Winnings", value: "100 CELO" }
    ]
  },
  15: {
    name: "Lucky Star",
    description: "Win with exactly 100 on final roll",
    tier: "Silver",
    image: "ipfs://QmPlaceholder/15.png",
    attributes: [
      { trait_type: "Tier", value: "Silver" },
      { trait_type: "Category", value: "Luck" },
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Difficulty", value: "Hard" }
    ]
  },
  16: {
    name: "Comeback King",
    description: "Win after being behind 50+ points",
    tier: "Silver",
    image: "ipfs://QmPlaceholder/16.png",
    attributes: [
      { trait_type: "Tier", value: "Silver" },
      { trait_type: "Category", value: "Skill" },
      { trait_type: "Rarity", value: "Rare" },
      { trait_type: "Difficulty", value: "Hard" }
    ]
  },
  17: {
    name: "Snake Survivor",
    description: "Land on 10 snakes and still win",
    tier: "Silver",
    image: "ipfs://QmPlaceholder/17.png",
    attributes: [
      { trait_type: "Tier", value: "Silver" },
      { trait_type: "Category", value: "Resilience" },
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Snakes Survived", value: "10" }
    ]
  },
  18: {
    name: "Ladder Master",
    description: "Use 15 ladders in one game",
    tier: "Silver",
    image: "ipfs://QmPlaceholder/18.png",
    attributes: [
      { trait_type: "Tier", value: "Silver" },
      { trait_type: "Category", value: "Luck" },
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Ladders Used", value: "15" }
    ]
  },
  19: {
    name: "Speed Player",
    description: "Complete 100 games in 24 hours",
    tier: "Silver",
    image: "ipfs://QmPlaceholder/19.png",
    attributes: [
      { trait_type: "Tier", value: "Silver" },
      { trait_type: "Category", value: "Speed" },
      { trait_type: "Rarity", value: "Rare" },
      { trait_type: "Games Required", value: "100" }
    ]
  },
  20: {
    name: "Generous Bettor",
    description: "Bet 50 CELO total",
    tier: "Silver",
    image: "ipfs://QmPlaceholder/20.png",
    attributes: [
      { trait_type: "Tier", value: "Silver" },
      { trait_type: "Category", value: "Betting" },
      { trait_type: "Rarity", value: "Uncommon" },
      { trait_type: "Total Bet", value: "50 CELO" }
    ]
  },

  // Gold Tier (21-25)
  21: {
    name: "Elite",
    description: "Play 5000 games",
    tier: "Gold",
    image: "ipfs://QmPlaceholder/21.png",
    maxSupply: 1000,
    attributes: [
      { trait_type: "Tier", value: "Gold" },
      { trait_type: "Category", value: "Milestone" },
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Games Required", value: "5000" },
      { trait_type: "Max Supply", value: "1000" }
    ]
  },
  22: {
    name: "Tournament Victor",
    description: "Win a tournament",
    tier: "Gold",
    image: "ipfs://QmPlaceholder/22.png",
    maxSupply: 500,
    attributes: [
      { trait_type: "Tier", value: "Gold" },
      { trait_type: "Category", value: "Tournament" },
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Game Mode", value: "Tournament" },
      { trait_type: "Max Supply", value: "500" }
    ]
  },
  23: {
    name: "Legendary",
    description: "Win 50 games in a row",
    tier: "Gold",
    image: "ipfs://QmPlaceholder/23.png",
    maxSupply: 100,
    attributes: [
      { trait_type: "Tier", value: "Gold" },
      { trait_type: "Category", value: "Win Streak" },
      { trait_type: "Rarity", value: "Mythic" },
      { trait_type: "Streak Required", value: "50" },
      { trait_type: "Max Supply", value: "100" }
    ]
  },
  24: {
    name: "Whale",
    description: "Bet 1000 CELO total",
    tier: "Gold",
    image: "ipfs://QmPlaceholder/24.png",
    maxSupply: 500,
    attributes: [
      { trait_type: "Tier", value: "Gold" },
      { trait_type: "Category", value: "Betting" },
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Total Bet", value: "1000 CELO" },
      { trait_type: "Max Supply", value: "500" }
    ]
  },
  25: {
    name: "Speedrun King",
    description: "Win in under 2 minutes",
    tier: "Gold",
    image: "ipfs://QmPlaceholder/25.png",
    maxSupply: 1000,
    attributes: [
      { trait_type: "Tier", value: "Gold" },
      { trait_type: "Category", value: "Speed" },
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Time Limit", value: "2 minutes" },
      { trait_type: "Max Supply", value: "1000" }
    ]
  },

  // Platinum Tier (31-34)
  31: {
    name: "Grandmaster",
    description: "Play 10000 games",
    tier: "Platinum",
    image: "ipfs://QmPlaceholder/31.png",
    maxSupply: 100,
    attributes: [
      { trait_type: "Tier", value: "Platinum" },
      { trait_type: "Category", value: "Milestone" },
      { trait_type: "Rarity", value: "Mythic" },
      { trait_type: "Games Required", value: "10000" },
      { trait_type: "Max Supply", value: "100" }
    ]
  },
  32: {
    name: "Hall of Fame",
    description: "Top 10 all-time wins",
    tier: "Platinum",
    image: "ipfs://QmPlaceholder/32.png",
    maxSupply: 50,
    attributes: [
      { trait_type: "Tier", value: "Platinum" },
      { trait_type: "Category", value: "Leaderboard" },
      { trait_type: "Rarity", value: "Mythic" },
      { trait_type: "Ranking", value: "Top 10" },
      { trait_type: "Max Supply", value: "50" }
    ]
  },
  33: {
    name: "Grandmaster",
    description: "Reach top rank",
    tier: "Platinum",
    image: "ipfs://QmPlaceholder/33.png",
    maxSupply: 100,
    attributes: [
      { trait_type: "Tier", value: "Platinum" },
      { trait_type: "Category", value: "Rank" },
      { trait_type: "Rarity", value: "Mythic" },
      { trait_type: "Max Supply", value: "100" }
    ]
  },
  34: {
    name: "Ultimate Champion",
    description: "Win 1000 games",
    tier: "Platinum",
    image: "ipfs://QmPlaceholder/34.png",
    maxSupply: 50,
    attributes: [
      { trait_type: "Tier", value: "Platinum" },
      { trait_type: "Category", value: "Milestone" },
      { trait_type: "Rarity", value: "Mythic" },
      { trait_type: "Wins Required", value: "1000" },
      { trait_type: "Max Supply", value: "50" }
    ]
  },

  // Special Edition (41-43)
  41: {
    name: "Season 1 Champion",
    description: "Win Season 1 Championship",
    tier: "Special",
    image: "ipfs://QmPlaceholder/41.png",
    maxSupply: 1,
    attributes: [
      { trait_type: "Tier", value: "Special" },
      { trait_type: "Category", value: "Championship" },
      { trait_type: "Rarity", value: "Unique" },
      { trait_type: "Season", value: "1" },
      { trait_type: "Max Supply", value: "1" }
    ]
  },
  42: {
    name: "Genesis Player",
    description: "Played in beta/launch week",
    tier: "Special",
    image: "ipfs://QmPlaceholder/42.png",
    maxSupply: 1000,
    attributes: [
      { trait_type: "Tier", value: "Special" },
      { trait_type: "Category", value: "Genesis" },
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Period", value: "Launch Week" },
      { trait_type: "Max Supply", value: "1000" }
    ]
  },
  43: {
    name: "Community Hero",
    description: "Outstanding community contribution",
    tier: "Special",
    image: "ipfs://QmPlaceholder/43.png",
    maxSupply: 50,
    attributes: [
      { trait_type: "Tier", value: "Special" },
      { trait_type: "Category", value: "Community" },
      { trait_type: "Rarity", value: "Mythic" },
      { trait_type: "Max Supply", value: "50" }
    ]
  }
};

// Generate metadata files
const metadataDir = path.join(__dirname, '..', 'metadata');

// Create metadata directory if it doesn't exist
if (!fs.existsSync(metadataDir)) {
  fs.mkdirSync(metadataDir, { recursive: true });
}

// Generate JSON file for each achievement
Object.entries(achievements).forEach(([id, data]) => {
  const metadata = {
    name: data.name,
    description: data.description,
    image: data.image,
    external_url: `https://celo-snake.vercel.app/achievements/${id}`,
    attributes: data.attributes
  };

  if (data.maxSupply) {
    metadata.attributes.push({
      trait_type: "Limited Edition",
      value: "Yes"
    });
  }

  const filePath = path.join(metadataDir, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
  console.log(`✅ Generated metadata for achievement #${id}: ${data.name}`);
});

// Generate collection metadata
const collectionMetadata = {
  name: "Celo Snake Game Achievements",
  description: "Achievement NFTs for the Celo Snake Game. Earn badges by completing challenges, winning tournaments, and reaching milestones. Higher tier achievements unlock exclusive benefits like fee discounts and tournament access.",
  image: "ipfs://QmPlaceholder/collection.png",
  external_link: "https://celo-snake.vercel.app",
  seller_fee_basis_points: 0,
  fee_recipient: "0x0000000000000000000000000000000000000000"
};

fs.writeFileSync(
  path.join(metadataDir, 'collection.json'),
  JSON.stringify(collectionMetadata, null, 2)
);
console.log('✅ Generated collection metadata');

console.log(`\n🎉 Successfully generated metadata for ${Object.keys(achievements).length} achievements!`);
console.log(`📁 Metadata files saved to: ${metadataDir}`);
console.log('\n📝 Next steps:');
console.log('1. Replace placeholder IPFS hashes with actual image CIDs');
console.log('2. Upload metadata folder to IPFS');
console.log('3. Update contract baseURI with IPFS metadata folder CID');
