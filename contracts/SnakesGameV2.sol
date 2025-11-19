// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AchievementTracker.sol";

/**
 * @title SnakesGameV2
 * @dev Enhanced single-player snake game with achievement tracking and NFT holder benefits
 */
contract SnakesGameV2 {
    address public owner;
    AchievementTracker public achievementTracker;

    struct Player {
        address addr;
        string nickname;
        uint256 totalWinnings;
    }

    struct Bet {
        uint256 amount;
        address player;
        string nickname;
        bool active;
        uint256 placedAt;
    }

    struct GameResult {
        address player;
        uint256 betAmount;
        uint256 payout;
        uint256 score;
        bool won;
        uint256 timestamp;
    }

    mapping(address => Bet) public bets;
    mapping(address => string) public nicknames;
    mapping(address => GameResult[]) public gameHistory;
    Player[] public leaderboard;

    event BetPlaced(address indexed player, string nickname, uint256 amount, uint256 discountApplied);
    event GameFinished(address indexed player, bool won, uint256 score, uint256 payout);
    event CashedOut(address indexed player, uint256 profit);
    event BetReset(address indexed player);
    event Withdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _achievementTracker) {
        owner = msg.sender;
        achievementTracker = AchievementTracker(_achievementTracker);
    }

    /**
     * @dev Place bet with NFT holder discount
     */
    function placeBet(string calldata nickname) external payable {
        require(msg.value > 0, "Bet must be > 0");

        // Reset previous bet if active
        if (bets[msg.sender].active) {
            bets[msg.sender].active = false;
            emit BetReset(msg.sender);
        }

        // Calculate discount based on NFT holdings
        uint256 discount = achievementTracker.getPlayerDiscount(msg.sender);

        string memory finalNickname;
        if (bytes(nicknames[msg.sender]).length == 0) {
            finalNickname = nickname;
        } else {
            finalNickname = nicknames[msg.sender];
        }

        bets[msg.sender] = Bet({
            amount: msg.value,
            player: msg.sender,
            nickname: finalNickname,
            active: true,
            placedAt: block.timestamp
        });

        if (bytes(nicknames[msg.sender]).length == 0) {
            nicknames[msg.sender] = nickname;
        }

        emit BetPlaced(msg.sender, bets[msg.sender].nickname, msg.value, discount);
    }

    /**
     * @dev Cash out after winning (with discount applied)
     */
    function cashout(uint256 score, bool won) external {
        Bet storage bet = bets[msg.sender];
        require(bet.active, "No active bet");
        require(score > 0, "Invalid score");

        bet.active = false;

        uint256 payout = 0;

        if (won) {
            // Calculate base payout (2x bet for win)
            uint256 basePayout = bet.amount * 2;

            // Apply NFT holder discount (reduces house fee)
            uint256 discount = achievementTracker.getPlayerDiscount(msg.sender);
            uint256 bonus = (basePayout * discount) / 100;
            payout = basePayout + bonus;

            // Ensure contract has enough balance
            if (payout > address(this).balance) {
                payout = address(this).balance;
            }

            if (payout > 0) {
                payable(msg.sender).transfer(payout);
                _updateLeaderboard(msg.sender, bet.nickname, payout);
            }

            // Record win in achievement tracker
            achievementTracker.recordWin(msg.sender, bet.amount, payout, score, false);
        } else {
            // Record loss in achievement tracker
            achievementTracker.recordLoss(msg.sender, bet.amount);
        }

        // Save game result to history
        gameHistory[msg.sender].push(GameResult({
            player: msg.sender,
            betAmount: bet.amount,
            payout: payout,
            score: score,
            won: won,
            timestamp: block.timestamp
        }));

        emit GameFinished(msg.sender, won, score, payout);
        if (won && payout > 0) {
            emit CashedOut(msg.sender, payout);
        }
    }

    /**
     * @dev Reset active bet
     */
    function resetBet() external {
        require(bets[msg.sender].active, "No active bet to reset");
        bets[msg.sender].active = false;
        emit BetReset(msg.sender);
    }

    /**
     * @dev Change nickname
     */
    function changeNickname(string calldata newNickname) external {
        require(bytes(newNickname).length > 0, "Nickname cannot be empty");
        nicknames[msg.sender] = newNickname;

        // Update nickname in active bet
        if (bets[msg.sender].active) {
            bets[msg.sender].nickname = newNickname;
        }

        // Update nickname in leaderboard
        for (uint i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].addr == msg.sender) {
                leaderboard[i].nickname = newNickname;
                break;
            }
        }
    }

    /**
     * @dev Withdraw funds (owner only)
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner).transfer(amount);
        emit Withdrawn(owner, amount);
    }

    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get player's game history
     */
    function getGameHistory(address player) external view returns (GameResult[] memory) {
        return gameHistory[player];
    }

    /**
     * @dev Get player's current discount based on NFT holdings
     */
    function getPlayerDiscount(address player) external view returns (uint256) {
        return achievementTracker.getPlayerDiscount(player);
    }

    /**
     * @dev Check if player can access exclusive tournaments
     */
    function canAccessExclusiveTournaments(address player) external view returns (bool) {
        return achievementTracker.isEligibleForExclusiveTournaments(player);
    }

    /**
     * @dev Update leaderboard
     */
    function _updateLeaderboard(address player, string memory nickname, uint256 profit) internal {
        bool found = false;
        for (uint i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].addr == player) {
                leaderboard[i].totalWinnings += profit;
                found = true;
                break;
            }
        }
        if (!found) {
            leaderboard.push(Player(player, nickname, profit));
        }
    }

    /**
     * @dev Get leaderboard (sorted by winnings)
     */
    function getLeaderboard() external view returns (Player[] memory) {
        Player[] memory sorted = new Player[](leaderboard.length);
        for (uint i = 0; i < leaderboard.length; i++) {
            sorted[i] = leaderboard[i];
        }

        // Bubble sort
        for (uint i = 0; i < sorted.length; i++) {
            for (uint j = i + 1; j < sorted.length; j++) {
                if (sorted[j].totalWinnings > sorted[i].totalWinnings) {
                    Player memory temp = sorted[i];
                    sorted[i] = sorted[j];
                    sorted[j] = temp;
                }
            }
        }
        return sorted;
    }

    /**
     * @dev Update achievement tracker address (owner only)
     */
    function setAchievementTracker(address _achievementTracker) external onlyOwner {
        require(_achievementTracker != address(0), "Invalid address");
        achievementTracker = AchievementTracker(_achievementTracker);
    }

    /**
     * @dev Fallback to receive ETH
     */
    receive() external payable {}
}
