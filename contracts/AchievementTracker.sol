// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SnakeAchievementNFT.sol";

/**
 * @title AchievementTracker
 * @dev Tracks player progress and automatically mints achievement NFTs when conditions are met
 * @notice This contract is authorized to mint achievements on the SnakeAchievementNFT contract
 */
contract AchievementTracker {
    SnakeAchievementNFT public achievementNFT;
    address public owner;

    // Track game statistics per player
    struct PlayerProgress {
        uint256 totalGames;
        uint256 totalWins;
        uint256 currentWinStreak;
        uint256 longestWinStreak;
        uint256 totalBetAmount;
        uint256 totalWinnings;
        uint256 multiplayerWins;
        uint256 tournamentWins;
        uint256 tournamentParticipations;
        uint256 highestScore;
        bool firstWin;
    }

    mapping(address => PlayerProgress) public playerProgress;
    mapping(address => bool) public authorizedGames;

    event ProgressUpdated(address indexed player, string metric, uint256 value);
    event AchievementEarned(address indexed player, uint256 indexed achievementId, string achievementName);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAuthorizedGame() {
        require(authorizedGames[msg.sender] || msg.sender == owner, "Unauthorized game contract");
        _;
    }

    constructor(address _achievementNFT) {
        achievementNFT = SnakeAchievementNFT(_achievementNFT);
        owner = msg.sender;
    }

    /**
     * @dev Authorize a game contract to report progress
     */
    function authorizeGame(address gameContract) external onlyOwner {
        authorizedGames[gameContract] = true;
    }

    /**
     * @dev Revoke authorization from a game contract
     */
    function revokeGame(address gameContract) external onlyOwner {
        authorizedGames[gameContract] = false;
    }

    /**
     * @dev Record a game win and check for achievements
     */
    function recordWin(
        address player,
        uint256 betAmount,
        uint256 winnings,
        uint256 score,
        bool isMultiplayer
    ) external onlyAuthorizedGame {
        PlayerProgress storage progress = playerProgress[player];

        progress.totalGames++;
        progress.totalWins++;
        progress.currentWinStreak++;
        progress.totalBetAmount += betAmount;
        progress.totalWinnings += winnings;

        if (score > progress.highestScore) {
            progress.highestScore = score;
        }

        if (progress.currentWinStreak > progress.longestWinStreak) {
            progress.longestWinStreak = progress.currentWinStreak;
        }

        if (isMultiplayer) {
            progress.multiplayerWins++;
        }

        // Check and mint achievements
        _checkWinAchievements(player, betAmount);

        emit ProgressUpdated(player, "totalWins", progress.totalWins);
    }

    /**
     * @dev Record a game loss
     */
    function recordLoss(address player, uint256 betAmount) external onlyAuthorizedGame {
        PlayerProgress storage progress = playerProgress[player];

        progress.totalGames++;
        progress.currentWinStreak = 0; // Reset streak on loss
        progress.totalBetAmount += betAmount;

        // Check game count achievements
        _checkGameCountAchievements(player);
        _checkBettingAchievements(player);

        emit ProgressUpdated(player, "totalGames", progress.totalGames);
    }

    /**
     * @dev Record tournament participation
     */
    function recordTournamentParticipation(address player) external onlyAuthorizedGame {
        PlayerProgress storage progress = playerProgress[player];
        progress.tournamentParticipations++;

        // Mint tournament participant achievement (ID: 13)
        _mintAchievementIfEligible(player, 13, "Tournament Ready");

        emit ProgressUpdated(player, "tournamentParticipations", progress.tournamentParticipations);
    }

    /**
     * @dev Record tournament win
     */
    function recordTournamentWin(address player) external onlyAuthorizedGame {
        PlayerProgress storage progress = playerProgress[player];
        progress.tournamentWins++;

        // Mint tournament winner achievement (ID: 22 - Gold tier)
        _mintAchievementIfEligible(player, 22, "Tournament Victor");

        emit ProgressUpdated(player, "tournamentWins", progress.tournamentWins);
    }

    /**
     * @dev Check and mint win-related achievements
     */
    function _checkWinAchievements(address player, uint256 betAmount) private {
        PlayerProgress storage progress = playerProgress[player];

        // First win achievement (ID: 1)
        if (progress.totalWins == 1) {
            _mintAchievementIfEligible(player, 1, "First Victory");
        }

        // Game milestone achievements
        if (progress.totalWins == 10) {
            _mintAchievementIfEligible(player, 2, "Getting Started");
        }
        if (progress.totalWins == 50) {
            _mintAchievementIfEligible(player, 3, "Rising Star");
        }
        if (progress.totalWins == 100) {
            _mintAchievementIfEligible(player, 4, "Experienced");
        }

        // Win streak achievements
        if (progress.currentWinStreak == 5) {
            _mintAchievementIfEligible(player, 5, "On Fire");
        }
        if (progress.currentWinStreak == 10) {
            _mintAchievementIfEligible(player, 6, "Unstoppable");
        }
        if (progress.currentWinStreak == 20) {
            _mintAchievementIfEligible(player, 12, "Dominating");
        }
        if (progress.currentWinStreak == 50) {
            _mintAchievementIfEligible(player, 23, "Legendary");
        }

        // High roller achievement (bet >= 1 ether)
        if (betAmount >= 1 ether) {
            _mintAchievementIfEligible(player, 7, "High Roller");
        }

        // Multiplayer win achievement (ID: 10)
        if (progress.multiplayerWins == 1) {
            _mintAchievementIfEligible(player, 10, "Multiplayer Champion");
        }
    }

    /**
     * @dev Check and mint game count achievements
     */
    function _checkGameCountAchievements(address player) private {
        PlayerProgress storage progress = playerProgress[player];

        // Total games played achievements
        if (progress.totalGames == 1000) {
            _mintAchievementIfEligible(player, 11, "Veteran");
        }
        if (progress.totalGames == 5000) {
            _mintAchievementIfEligible(player, 21, "Elite");
        }
    }

    /**
     * @dev Check and mint betting-related achievements
     */
    function _checkBettingAchievements(address player) private {
        PlayerProgress storage progress = playerProgress[player];

        // Total bet amount achievements
        if (progress.totalBetAmount >= 50 ether) {
            _mintAchievementIfEligible(player, 20, "Generous Bettor");
        }
        if (progress.totalBetAmount >= 1000 ether) {
            _mintAchievementIfEligible(player, 24, "Whale");
        }

        // Total winnings achievements
        if (progress.totalWinnings >= 100 ether) {
            _mintAchievementIfEligible(player, 14, "Big Winner");
        }
    }

    /**
     * @dev Internal function to mint achievement if player doesn't have it
     */
    function _mintAchievementIfEligible(address player, uint256 achievementId, string memory achievementName) private {
        // Check if player already has this achievement
        if (!achievementNFT.hasAchievement(player, achievementId)) {
            try achievementNFT.mintAchievement(player, achievementId) {
                emit AchievementEarned(player, achievementId, achievementName);
            } catch {
                // Achievement minting failed (max supply reached, inactive, etc.)
                // Silently continue - don't revert the entire transaction
            }
        }
    }

    /**
     * @dev Manually mint achievement (owner only, for special cases)
     */
    function mintSpecialAchievement(address player, uint256 achievementId) external onlyOwner {
        achievementNFT.mintAchievement(player, achievementId);

        (string memory name,,,,,) = achievementNFT.getAchievement(achievementId);
        emit AchievementEarned(player, achievementId, name);
    }

    /**
     * @dev Batch mint achievements (owner only)
     */
    function mintSpecialAchievementBatch(address player, uint256[] memory achievementIds) external onlyOwner {
        achievementNFT.mintAchievementBatch(player, achievementIds);

        for (uint256 i = 0; i < achievementIds.length; i++) {
            (string memory name,,,,,) = achievementNFT.getAchievement(achievementIds[i]);
            emit AchievementEarned(player, achievementIds[i], name);
        }
    }

    /**
     * @dev Get player progress
     */
    function getPlayerProgress(address player) external view returns (PlayerProgress memory) {
        return playerProgress[player];
    }

    /**
     * @dev Get player's current discount percentage based on NFT holdings
     */
    function getPlayerDiscount(address player) external view returns (uint256) {
        return achievementNFT.getPlayerDiscount(player);
    }

    /**
     * @dev Check if player is eligible for exclusive tournaments
     */
    function isEligibleForExclusiveTournaments(address player) external view returns (bool) {
        return achievementNFT.isEligibleForExclusiveTournaments(player);
    }

    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
