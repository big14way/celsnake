// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SnakesGameV2WithSelfProtocol
 * @dev Enhanced version of SnakesGameV2 with Self Protocol identity verification
 * @notice This contract allows verified users to play the snake game with proof of humanity
 */
contract SnakesGameV2WithSelfProtocol is ReentrancyGuard {
    address public owner;

    /// @dev Self Protocol Identity Verification Hub V2 address on Celo Mainnet
    address public constant SELF_VERIFICATION_HUB = 0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF;

    /// @dev Self Protocol scope seed for verification
    uint256 public scopeSeed;

    /// @dev Verification configuration ID for Self Protocol
    bytes32 public verificationConfigId;

    /// @dev Mapping to track verified users and their verification expiry
    mapping(address => uint256) public verifiedUsers;

    /// @dev Default verification validity period (30 days)
    uint256 public constant VERIFICATION_VALIDITY = 30 days;

    /// @dev Flag to enable/disable verification requirement
    bool public verificationRequired;

    /// @dev Reference to AchievementTracker contract
    address public achievementTracker;

    /// @dev House fee percentage (in basis points, 100 = 1%)
    uint256 public constant HOUSE_FEE_BASIS_POINTS = 250; // 2.5%

    // Game state tracking
    struct GameState {
        uint256 betAmount;
        uint256 multiplier;
        uint256 position;
        uint8 difficulty;
        bool active;
        bool verified; // Whether player was verified when starting game
    }

    mapping(address => GameState) public games;
    mapping(uint8 => uint256[]) public snakePositions;

    // Events
    event GameStarted(address indexed player, uint256 betAmount, uint8 difficulty, bool verified);
    event DiceRolled(address indexed player, uint256 diceRoll, uint256 newPosition, uint256 newMultiplier);
    event GameEnded(address indexed player, uint256 payout, bool won);
    event UserVerified(address indexed user, uint256 expiryTimestamp);
    event VerificationRequirementChanged(bool enabled);
    event HouseFeeCollected(uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier gameActive() {
        require(games[msg.sender].active, "No active game");
        _;
    }

    modifier onlyVerified() {
        if (verificationRequired) {
            require(isVerified(msg.sender), "User not verified");
        }
        _;
    }

    /**
     * @dev Constructor initializes the contract with verification settings
     * @param _achievementTracker Address of the achievement tracker contract
     * @param _verificationRequired Whether to require verification initially
     * @param _scopeSeed Scope seed for Self Protocol
     */
    constructor(
        address _achievementTracker,
        bool _verificationRequired,
        uint256 _scopeSeed
    ) {
        owner = msg.sender;
        achievementTracker = _achievementTracker;
        verificationRequired = _verificationRequired;
        scopeSeed = _scopeSeed;

        // Initialize snake positions for different difficulty levels
        _initializeSnakePositions();
    }

    /**
     * @dev Initialize snake positions for each difficulty level
     */
    function _initializeSnakePositions() private {
        // Easy (3 snakes)
        snakePositions[0] = [uint256(7), uint256(15), uint256(22)];

        // Medium (5 snakes)
        snakePositions[1] = [uint256(6), uint256(11), uint256(15), uint256(19), uint256(23)];

        // Hard (7 snakes)
        snakePositions[2] = [uint256(5), uint256(8), uint256(12), uint256(15), uint256(18), uint256(21), uint256(23)];

        // Expert (9 snakes)
        snakePositions[3] = [uint256(4), uint256(7), uint256(10), uint256(13), uint256(15), uint256(17), uint256(19), uint256(21), uint256(23)];

        // Master (11 snakes)
        snakePositions[4] = [uint256(3), uint256(6), uint256(8), uint256(11), uint256(13), uint256(15), uint256(17), uint256(19), uint256(21), uint256(22), uint256(23)];
    }

    /**
     * @dev Start a new game
     * @param difficulty Game difficulty (0-4)
     */
    function startGame(uint8 difficulty) external payable nonReentrant onlyVerified {
        require(!games[msg.sender].active, "Game already active");
        require(msg.value > 0, "Bet amount must be > 0");
        require(difficulty <= 4, "Invalid difficulty");

        games[msg.sender] = GameState({
            betAmount: msg.value,
            multiplier: 100, // Start at 1.0x (100 basis points)
            position: 0,
            difficulty: difficulty,
            active: true,
            verified: verificationRequired && isVerified(msg.sender)
        });

        emit GameStarted(msg.sender, msg.value, difficulty, games[msg.sender].verified);
    }

    /**
     * @dev Roll the dice and move
     */
    function rollDice() external nonReentrant gameActive {
        GameState storage game = games[msg.sender];

        // Generate pseudo-random dice roll (2-12)
        uint256 diceRoll = _generateDiceRoll();
        uint256 newPosition = game.position + diceRoll;

        // Check if position exceeds board (24)
        if (newPosition > 24) {
            newPosition = 24;
        }

        // Check for snake collision
        bool hitSnake = _checkSnakeCollision(newPosition, game.difficulty);

        if (hitSnake) {
            // Hit a snake - reduce multiplier and possibly end game
            if (game.multiplier > 50) {
                game.multiplier = game.multiplier / 2;
            } else {
                // Game over - lost
                _endGame(msg.sender, false);
                return;
            }
        } else {
            // Safe move - increase multiplier
            game.multiplier = game.multiplier + (10 * (game.difficulty + 1));
        }

        game.position = newPosition;

        // Check if won (reached position 24)
        if (newPosition == 24) {
            _endGame(msg.sender, true);
        }

        emit DiceRolled(msg.sender, diceRoll, newPosition, game.multiplier);
    }

    /**
     * @dev Cash out current winnings
     */
    function cashOut() external nonReentrant gameActive {
        _endGame(msg.sender, true);
    }

    /**
     * @dev End game and pay out (or lose bet)
     */
    function _endGame(address player, bool won) private {
        GameState storage game = games[player];
        uint256 payout = 0;

        if (won && game.position > 0) {
            // Calculate payout based on multiplier
            uint256 grossPayout = (game.betAmount * game.multiplier) / 100;

            // Deduct house fee
            uint256 fee = (grossPayout * HOUSE_FEE_BASIS_POINTS) / 10000;
            payout = grossPayout - fee;

            // Transfer payout to player
            (bool success, ) = payable(player).call{value: payout}("");
            require(success, "Payout transfer failed");

            emit HouseFeeCollected(fee);
        }

        // Mark game as inactive
        game.active = false;

        emit GameEnded(player, payout, won);
    }

    /**
     * @dev Generate pseudo-random dice roll (2-12)
     */
    function _generateDiceRoll() private view returns (uint256) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            games[msg.sender].position
        )));
        return (random % 11) + 2; // 2-12
    }

    /**
     * @dev Check if a position has a snake
     */
    function _checkSnakeCollision(uint256 position, uint8 difficulty) private view returns (bool) {
        uint256[] memory snakes = snakePositions[difficulty];
        for (uint256 i = 0; i < snakes.length; i++) {
            if (snakes[i] == position) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Manually verify a user (called by backend after Self Protocol proof validation)
     * @param user Address of the user to verify
     */
    function verifyUser(address user) external onlyOwner {
        require(user != address(0), "Zero address");
        uint256 expiryTimestamp = block.timestamp + VERIFICATION_VALIDITY;
        verifiedUsers[user] = expiryTimestamp;
        emit UserVerified(user, expiryTimestamp);
    }

    /**
     * @dev Batch verify multiple users
     * @param users Array of user addresses to verify
     */
    function verifyUsers(address[] calldata users) external onlyOwner {
        uint256 expiryTimestamp = block.timestamp + VERIFICATION_VALIDITY;
        for (uint256 i = 0; i < users.length; i++) {
            require(users[i] != address(0), "Zero address");
            verifiedUsers[users[i]] = expiryTimestamp;
            emit UserVerified(users[i], expiryTimestamp);
        }
    }

    /**
     * @dev Check if a user is verified and verification hasn't expired
     * @param user Address to check
     * @return bool True if user is verified and verification is valid
     */
    function isVerified(address user) public view returns (bool) {
        if (!verificationRequired) {
            return true; // If verification not required, all users are "verified"
        }
        return verifiedUsers[user] > block.timestamp;
    }

    /**
     * @dev Get verification expiry timestamp for a user
     * @param user Address to check
     * @return uint256 Expiry timestamp (0 if not verified)
     */
    function getVerificationExpiry(address user) external view returns (uint256) {
        return verifiedUsers[user];
    }

    /**
     * @dev Toggle verification requirement
     * @param _required Whether to require verification
     */
    function setVerificationRequired(bool _required) external onlyOwner {
        verificationRequired = _required;
        emit VerificationRequirementChanged(_required);
    }

    /**
     * @dev Update verification config ID
     * @param _configId New verification configuration ID
     */
    function setVerificationConfigId(bytes32 _configId) external onlyOwner {
        verificationConfigId = _configId;
    }

    /**
     * @dev Get current game state for a player
     */
    function getGameState(address player) external view returns (
        uint256 betAmount,
        uint256 multiplier,
        uint256 position,
        uint8 difficulty,
        bool active,
        bool verified
    ) {
        GameState memory game = games[player];
        return (
            game.betAmount,
            game.multiplier,
            game.position,
            game.difficulty,
            game.active,
            game.verified
        );
    }

    /**
     * @dev Owner can withdraw accumulated house fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Get contract balance (house fees)
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
