// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SnakeAchievementNFT
 * @dev ERC-1155 NFT contract for Celo Snake Game achievements and rewards
 *
 * Achievement Tiers:
 * - Bronze (1-10): Basic achievements
 * - Silver (11-20): Intermediate achievements
 * - Gold (21-30): Advanced achievements
 * - Platinum (31-40): Elite achievements
 * - Special (41-50): Tournament winners and special events
 *
 * Holder Benefits:
 * - Fee discounts based on NFT holdings
 * - Access to exclusive tournaments
 * - Special game modes
 */
contract SnakeAchievementNFT is ERC1155, Ownable, ERC1155Supply {
    using Strings for uint256;

    // Token IDs for different achievements
    uint256 public constant FIRST_WIN = 1;
    uint256 public constant GAMES_10 = 2;
    uint256 public constant GAMES_50 = 3;
    uint256 public constant GAMES_100 = 4;
    uint256 public constant GAMES_500 = 5;
    uint256 public constant PERFECT_GAME = 6;
    uint256 public constant WIN_STREAK_5 = 7;
    uint256 public constant WIN_STREAK_10 = 8;
    uint256 public constant HIGH_ROLLER = 9;
    uint256 public constant MULTIPLAYER_WINNER = 10;

    // Silver tier
    uint256 public constant GAMES_1000 = 11;
    uint256 public constant WIN_STREAK_20 = 12;
    uint256 public constant TOURNAMENT_PARTICIPANT = 13;
    uint256 public constant BIG_WINNER = 14;
    uint256 public constant LUCKY_PLAYER = 15;
    uint256 public constant COMEBACK_KING = 16;
    uint256 public constant SNAKE_SURVIVOR = 17;
    uint256 public constant LADDER_MASTER = 18;
    uint256 public constant SPEED_PLAYER = 19;
    uint256 public constant GENEROUS_BETTOR = 20;

    // Gold tier
    uint256 public constant GAMES_5000 = 21;
    uint256 public constant TOURNAMENT_WINNER = 22;
    uint256 public constant LEGENDARY_STREAK = 23;
    uint256 public constant WHALE = 24;
    uint256 public constant SPEEDRUN_MASTER = 25;

    // Platinum tier
    uint256 public constant GAMES_10000 = 31;
    uint256 public constant HALL_OF_FAME = 32;
    uint256 public constant GRANDMASTER = 33;
    uint256 public constant ULTIMATE_CHAMPION = 34;

    // Special edition
    uint256 public constant SEASON_1_CHAMPION = 41;
    uint256 public constant GENESIS_PLAYER = 42;
    uint256 public constant COMMUNITY_HERO = 43;

    // Base URI for metadata
    string private _baseURI;

    // Mapping to track if achievement was claimed
    mapping(address => mapping(uint256 => bool)) public achievementClaimed;

    // Achievement metadata
    struct Achievement {
        string name;
        string description;
        uint256 tier; // 1=Bronze, 2=Silver, 3=Gold, 4=Platinum, 5=Special
        uint256 maxSupply;
        bool active;
    }

    mapping(uint256 => Achievement) public achievements;

    // Authorized minters (game contracts)
    mapping(address => bool) public authorizedMinters;

    // Events
    event AchievementMinted(
        address indexed player,
        uint256 indexed tokenId,
        string achievementName
    );
    event AchievementDefined(
        uint256 indexed tokenId,
        string name,
        uint256 tier
    );
    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);
    event BaseURIUpdated(string newBaseURI);

    /**
     * @dev Constructor
     * @param baseURI_ Base URI for token metadata
     */
    constructor(string memory baseURI_)
        ERC1155(baseURI_)
        Ownable(msg.sender)
    {
        _baseURI = baseURI_;
        _initializeAchievements();
    }

    /**
     * @dev Initialize all achievement definitions
     */
    function _initializeAchievements() private {
        // Bronze tier
        _defineAchievement(FIRST_WIN, "First Victory", "Win your first game", 1, 0);
        _defineAchievement(GAMES_10, "Getting Started", "Play 10 games", 1, 0);
        _defineAchievement(GAMES_50, "Regular Player", "Play 50 games", 1, 0);
        _defineAchievement(GAMES_100, "Dedicated", "Play 100 games", 1, 0);
        _defineAchievement(GAMES_500, "Committed", "Play 500 games", 1, 0);
        _defineAchievement(PERFECT_GAME, "Perfect Roll", "Complete game without hitting a snake", 1, 0);
        _defineAchievement(WIN_STREAK_5, "On Fire", "Win 5 games in a row", 1, 0);
        _defineAchievement(WIN_STREAK_10, "Unstoppable", "Win 10 games in a row", 1, 0);
        _defineAchievement(HIGH_ROLLER, "High Roller", "Place a bet of 10 CELO or more", 1, 0);
        _defineAchievement(MULTIPLAYER_WINNER, "Multiplayer Champion", "Win a multiplayer game", 1, 0);

        // Silver tier
        _defineAchievement(GAMES_1000, "Veteran", "Play 1000 games", 2, 0);
        _defineAchievement(WIN_STREAK_20, "Dominating", "Win 20 games in a row", 2, 0);
        _defineAchievement(TOURNAMENT_PARTICIPANT, "Tournament Ready", "Participate in a tournament", 2, 0);
        _defineAchievement(BIG_WINNER, "Big Winner", "Win 100 CELO total", 2, 0);
        _defineAchievement(LUCKY_PLAYER, "Lucky Star", "Win with exactly 100 on final roll", 2, 0);
        _defineAchievement(COMEBACK_KING, "Comeback King", "Win after being behind 50+ points", 2, 0);
        _defineAchievement(SNAKE_SURVIVOR, "Snake Survivor", "Land on 10 snakes and still win", 2, 0);
        _defineAchievement(LADDER_MASTER, "Ladder Master", "Use 15 ladders in one game", 2, 0);
        _defineAchievement(SPEED_PLAYER, "Speed Player", "Complete 100 games in 24 hours", 2, 0);
        _defineAchievement(GENEROUS_BETTOR, "Generous Bettor", "Bet 50 CELO total", 2, 0);

        // Gold tier
        _defineAchievement(GAMES_5000, "Elite", "Play 5000 games", 3, 1000);
        _defineAchievement(TOURNAMENT_WINNER, "Tournament Victor", "Win a tournament", 3, 500);
        _defineAchievement(LEGENDARY_STREAK, "Legendary", "Win 50 games in a row", 3, 100);
        _defineAchievement(WHALE, "Whale", "Bet 1000 CELO total", 3, 500);
        _defineAchievement(SPEEDRUN_MASTER, "Speedrun King", "Win in under 2 minutes", 3, 1000);

        // Platinum tier
        _defineAchievement(GAMES_10000, "Grandmaster", "Play 10000 games", 4, 100);
        _defineAchievement(HALL_OF_FAME, "Hall of Fame", "Top 10 all-time wins", 4, 50);
        _defineAchievement(GRANDMASTER, "Grandmaster", "Reach top rank", 4, 100);
        _defineAchievement(ULTIMATE_CHAMPION, "Ultimate Champion", "Win 1000 games", 4, 50);

        // Special edition
        _defineAchievement(SEASON_1_CHAMPION, "Season 1 Champion", "Win Season 1 Championship", 5, 1);
        _defineAchievement(GENESIS_PLAYER, "Genesis Player", "Played in beta/launch week", 5, 1000);
        _defineAchievement(COMMUNITY_HERO, "Community Hero", "Outstanding community contribution", 5, 50);
    }

    /**
     * @dev Define or update an achievement
     */
    function _defineAchievement(
        uint256 tokenId,
        string memory name,
        string memory description,
        uint256 tier,
        uint256 maxSupply
    ) private {
        achievements[tokenId] = Achievement({
            name: name,
            description: description,
            tier: tier,
            maxSupply: maxSupply,
            active: true
        });

        emit AchievementDefined(tokenId, name, tier);
    }

    /**
     * @dev Mint achievement NFT to player
     * @param to Player address
     * @param tokenId Achievement token ID
     */
    function mintAchievement(address to, uint256 tokenId)
        external
    {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(),
            "Not authorized to mint"
        );
        require(achievements[tokenId].active, "Achievement not active");
        require(!achievementClaimed[to][tokenId], "Achievement already claimed");

        Achievement memory achievement = achievements[tokenId];

        // Check max supply if set
        if (achievement.maxSupply > 0) {
            require(
                totalSupply(tokenId) < achievement.maxSupply,
                "Max supply reached"
            );
        }

        achievementClaimed[to][tokenId] = true;
        _mint(to, tokenId, 1, "");

        emit AchievementMinted(to, tokenId, achievement.name);
    }

    /**
     * @dev Batch mint multiple achievements
     * @param to Player address
     * @param tokenIds Array of achievement token IDs
     */
    function mintAchievementBatch(address to, uint256[] memory tokenIds)
        external
    {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(),
            "Not authorized to mint"
        );

        uint256[] memory amounts = new uint256[](tokenIds.length);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(achievements[tokenIds[i]].active, "Achievement not active");
            require(!achievementClaimed[to][tokenIds[i]], "Achievement already claimed");

            Achievement memory achievement = achievements[tokenIds[i]];

            if (achievement.maxSupply > 0) {
                require(
                    totalSupply(tokenIds[i]) < achievement.maxSupply,
                    "Max supply reached"
                );
            }

            achievementClaimed[to][tokenIds[i]] = true;
            amounts[i] = 1;

            emit AchievementMinted(to, tokenIds[i], achievement.name);
        }

        _mintBatch(to, tokenIds, amounts, "");
    }

    /**
     * @dev Get tier discount for player based on NFT holdings
     * @param player Player address
     * @return Discount percentage (0-50)
     */
    function getPlayerDiscount(address player) external view returns (uint256) {
        uint256 bronzeCount = 0;
        uint256 silverCount = 0;
        uint256 goldCount = 0;
        uint256 platinumCount = 0;
        uint256 specialCount = 0;

        // Count achievements by tier
        for (uint256 i = 1; i <= 43; i++) {
            if (balanceOf(player, i) > 0) {
                uint256 tier = achievements[i].tier;
                if (tier == 1) bronzeCount++;
                else if (tier == 2) silverCount++;
                else if (tier == 3) goldCount++;
                else if (tier == 4) platinumCount++;
                else if (tier == 5) specialCount++;
            }
        }

        // Calculate discount (max 50%)
        uint256 discount = 0;
        discount += bronzeCount; // 1% per bronze
        discount += silverCount * 2; // 2% per silver
        discount += goldCount * 5; // 5% per gold
        discount += platinumCount * 10; // 10% per platinum
        discount += specialCount * 15; // 15% per special

        return discount > 50 ? 50 : discount;
    }

    /**
     * @dev Check if player has specific achievement
     * @param player Player address
     * @param tokenId Achievement token ID
     * @return True if player has achievement
     */
    function hasAchievement(address player, uint256 tokenId)
        external
        view
        returns (bool)
    {
        return balanceOf(player, tokenId) > 0;
    }

    /**
     * @dev Get all achievements for a player
     * @param player Player address
     * @return Array of token IDs player owns
     */
    function getPlayerAchievements(address player)
        external
        view
        returns (uint256[] memory)
    {
        uint256[] memory owned = new uint256[](43);
        uint256 count = 0;

        for (uint256 i = 1; i <= 43; i++) {
            if (balanceOf(player, i) > 0) {
                owned[count] = i;
                count++;
            }
        }

        // Create properly sized array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = owned[i];
        }

        return result;
    }

    /**
     * @dev Get achievement details
     */
    function getAchievement(uint256 tokenId)
        external
        view
        returns (
            string memory name,
            string memory description,
            uint256 tier,
            uint256 maxSupply,
            uint256 currentSupply,
            bool active
        )
    {
        Achievement memory achievement = achievements[tokenId];
        return (
            achievement.name,
            achievement.description,
            achievement.tier,
            achievement.maxSupply,
            totalSupply(tokenId),
            achievement.active
        );
    }

    /**
     * @dev Set base URI for metadata
     * @param newBaseURI New base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /**
     * @dev Get URI for token metadata
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(_baseURI, tokenId.toString(), ".json"));
    }

    /**
     * @dev Authorize address to mint achievements
     * @param minter Address to authorize
     */
    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAuthorized(minter);
    }

    /**
     * @dev Revoke minter authorization
     * @param minter Address to revoke
     */
    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRevoked(minter);
    }

    /**
     * @dev Update achievement active status
     */
    function setAchievementActive(uint256 tokenId, bool active) external onlyOwner {
        achievements[tokenId].active = active;
    }

    // Required override for ERC1155Supply
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    /**
     * @dev Check if player is eligible for exclusive tournaments
     * @param player Player address
     * @return True if player has Gold tier or higher
     */
    function isEligibleForExclusiveTournaments(address player)
        external
        view
        returns (bool)
    {
        // Check if player has any Gold, Platinum, or Special achievements
        for (uint256 i = 21; i <= 43; i++) {
            if (balanceOf(player, i) > 0) {
                return true;
            }
        }
        return false;
    }
}
