// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SocialFeatures
 * @dev Manages social networking features including friends, referrals, and rewards
 */
contract SocialFeatures is Ownable, ReentrancyGuard {

    // ============ Structs ============

    struct PlayerProfile {
        string nickname;
        bool exists;
        bool allowFriendRequests;
        uint256 createdAt;
        uint256 lastActive;
    }

    struct FriendRequest {
        address from;
        address to;
        uint256 timestamp;
        bool exists;
        bool accepted;
    }

    struct Referral {
        address referrer;
        address referee;
        uint256 timestamp;
        bool rewarded;
        uint256 rewardAmount;
    }

    // ============ State Variables ============

    // Player profiles
    mapping(address => PlayerProfile) public profiles;

    // Friends: player => friend => isFriend
    mapping(address => mapping(address => bool)) public friends;

    // Friend counts
    mapping(address => uint256) public friendCounts;

    // Friend requests: requestId => FriendRequest
    mapping(bytes32 => FriendRequest) public friendRequests;

    // Player friend requests: player => requestId[]
    mapping(address => bytes32[]) public playerFriendRequests;

    // Blocked users: blocker => blocked => isBlocked
    mapping(address => mapping(address => bool)) public blockedUsers;

    // Referral codes: code => referrer address
    mapping(string => address) public referralCodes;

    // Referrals: referee => Referral
    mapping(address => Referral) public referrals;

    // Referrer stats: referrer => total referrals
    mapping(address => uint256) public referralCounts;

    // Total rewards earned from referrals
    mapping(address => uint256) public referralRewards;

    // Referral reward percentages (in basis points, 100 = 1%)
    uint256 public referrerRewardBps = 500; // 5%
    uint256 public refereeRewardBps = 300; // 3%

    // Minimum referral reward (in wei)
    uint256 public minReferralReward = 0.001 ether;

    // Maximum referral reward (in wei)
    uint256 public maxReferralReward = 1 ether;

    // Treasury for referral rewards
    uint256 public referralTreasury;

    // ============ Events ============

    event ProfileCreated(address indexed player, string nickname);
    event ProfileUpdated(address indexed player, string nickname);
    event FriendRequestSent(address indexed from, address indexed to, bytes32 requestId);
    event FriendRequestAccepted(address indexed from, address indexed to);
    event FriendRequestRejected(address indexed from, address indexed to);
    event FriendRemoved(address indexed player1, address indexed player2);
    event UserBlocked(address indexed blocker, address indexed blocked);
    event UserUnblocked(address indexed blocker, address indexed unblocked);
    event ReferralCodeCreated(address indexed referrer, string code);
    event ReferralRegistered(address indexed referrer, address indexed referee, string code);
    event ReferralRewarded(address indexed referrer, address indexed referee, uint256 referrerReward, uint256 refereeReward);
    event TreasuryFunded(address indexed funder, uint256 amount);
    event TreasuryWithdrawn(address indexed recipient, uint256 amount);

    // ============ Constructor ============

    constructor() Ownable(msg.sender) {}

    // ============ Profile Functions ============

    function createProfile(string memory _nickname) external {
        require(!profiles[msg.sender].exists, "Profile already exists");
        require(bytes(_nickname).length > 0, "Nickname cannot be empty");
        require(bytes(_nickname).length <= 32, "Nickname too long");

        profiles[msg.sender] = PlayerProfile({
            nickname: _nickname,
            exists: true,
            allowFriendRequests: true,
            createdAt: block.timestamp,
            lastActive: block.timestamp
        });

        emit ProfileCreated(msg.sender, _nickname);
    }

    function updateProfile(string memory _nickname, bool _allowFriendRequests) external {
        require(profiles[msg.sender].exists, "Profile does not exist");
        require(bytes(_nickname).length > 0, "Nickname cannot be empty");
        require(bytes(_nickname).length <= 32, "Nickname too long");

        profiles[msg.sender].nickname = _nickname;
        profiles[msg.sender].allowFriendRequests = _allowFriendRequests;
        profiles[msg.sender].lastActive = block.timestamp;

        emit ProfileUpdated(msg.sender, _nickname);
    }

    function updateLastActive() external {
        require(profiles[msg.sender].exists, "Profile does not exist");
        profiles[msg.sender].lastActive = block.timestamp;
    }

    // ============ Friend System ============

    function sendFriendRequest(address _to) external {
        require(profiles[msg.sender].exists, "Sender profile does not exist");
        require(profiles[_to].exists, "Recipient profile does not exist");
        require(profiles[_to].allowFriendRequests, "Recipient not accepting friend requests");
        require(msg.sender != _to, "Cannot send friend request to yourself");
        require(!friends[msg.sender][_to], "Already friends");
        require(!blockedUsers[_to][msg.sender], "You are blocked by this user");
        require(!blockedUsers[msg.sender][_to], "You have blocked this user");

        bytes32 requestId = keccak256(abi.encodePacked(msg.sender, _to, block.timestamp));
        require(!friendRequests[requestId].exists, "Request already exists");

        friendRequests[requestId] = FriendRequest({
            from: msg.sender,
            to: _to,
            timestamp: block.timestamp,
            exists: true,
            accepted: false
        });

        playerFriendRequests[_to].push(requestId);

        emit FriendRequestSent(msg.sender, _to, requestId);
    }

    function acceptFriendRequest(bytes32 _requestId) external {
        FriendRequest storage request = friendRequests[_requestId];
        require(request.exists, "Request does not exist");
        require(request.to == msg.sender, "Not the recipient");
        require(!request.accepted, "Already accepted");

        request.accepted = true;

        // Add as friends (bidirectional)
        friends[request.from][request.to] = true;
        friends[request.to][request.from] = true;

        friendCounts[request.from]++;
        friendCounts[request.to]++;

        emit FriendRequestAccepted(request.from, request.to);
    }

    function rejectFriendRequest(bytes32 _requestId) external {
        FriendRequest storage request = friendRequests[_requestId];
        require(request.exists, "Request does not exist");
        require(request.to == msg.sender, "Not the recipient");
        require(!request.accepted, "Already accepted");

        delete friendRequests[_requestId];

        emit FriendRequestRejected(request.from, request.to);
    }

    function removeFriend(address _friend) external {
        require(friends[msg.sender][_friend], "Not friends");

        friends[msg.sender][_friend] = false;
        friends[_friend][msg.sender] = false;

        friendCounts[msg.sender]--;
        friendCounts[_friend]--;

        emit FriendRemoved(msg.sender, _friend);
    }

    function blockUser(address _user) external {
        require(msg.sender != _user, "Cannot block yourself");
        require(!blockedUsers[msg.sender][_user], "Already blocked");

        blockedUsers[msg.sender][_user] = true;

        // Remove friendship if exists
        if (friends[msg.sender][_user]) {
            friends[msg.sender][_user] = false;
            friends[_user][msg.sender] = false;
            friendCounts[msg.sender]--;
            friendCounts[_user]--;
        }

        emit UserBlocked(msg.sender, _user);
    }

    function unblockUser(address _user) external {
        require(blockedUsers[msg.sender][_user], "Not blocked");

        blockedUsers[msg.sender][_user] = false;

        emit UserUnblocked(msg.sender, _user);
    }

    // ============ Referral System ============

    function createReferralCode(string memory _code) external {
        require(profiles[msg.sender].exists, "Profile does not exist");
        require(bytes(_code).length >= 4, "Code too short");
        require(bytes(_code).length <= 16, "Code too long");
        require(referralCodes[_code] == address(0), "Code already exists");

        referralCodes[_code] = msg.sender;

        emit ReferralCodeCreated(msg.sender, _code);
    }

    function registerReferral(string memory _code, address _referee) external {
        require(referralCodes[_code] != address(0), "Invalid referral code");
        require(profiles[_referee].exists, "Referee profile does not exist");
        require(referrals[_referee].referrer == address(0), "Referee already referred");
        require(referralCodes[_code] != _referee, "Cannot refer yourself");

        address referrer = referralCodes[_code];

        referrals[_referee] = Referral({
            referrer: referrer,
            referee: _referee,
            timestamp: block.timestamp,
            rewarded: false,
            rewardAmount: 0
        });

        referralCounts[referrer]++;

        emit ReferralRegistered(referrer, _referee, _code);
    }

    function rewardReferral(address _referee, uint256 _gameAmount) external nonReentrant {
        Referral storage referral = referrals[_referee];
        require(referral.referrer != address(0), "No referral found");
        require(!referral.rewarded, "Already rewarded");
        require(_gameAmount > 0, "Invalid game amount");

        // Calculate rewards
        uint256 referrerReward = (_gameAmount * referrerRewardBps) / 10000;
        uint256 refereeReward = (_gameAmount * refereeRewardBps) / 10000;

        // Apply limits
        if (referrerReward < minReferralReward) referrerReward = minReferralReward;
        if (referrerReward > maxReferralReward) referrerReward = maxReferralReward;
        if (refereeReward < minReferralReward) refereeReward = minReferralReward;
        if (refereeReward > maxReferralReward) refereeReward = maxReferralReward;

        uint256 totalReward = referrerReward + refereeReward;
        require(referralTreasury >= totalReward, "Insufficient treasury balance");

        // Mark as rewarded
        referral.rewarded = true;
        referral.rewardAmount = referrerReward;

        // Update stats
        referralRewards[referral.referrer] += referrerReward;

        // Deduct from treasury
        referralTreasury -= totalReward;

        // Transfer rewards
        payable(referral.referrer).transfer(referrerReward);
        payable(_referee).transfer(refereeReward);

        emit ReferralRewarded(referral.referrer, _referee, referrerReward, refereeReward);
    }

    // ============ View Functions ============

    function isFriend(address _player1, address _player2) external view returns (bool) {
        return friends[_player1][_player2];
    }

    function isBlocked(address _blocker, address _blocked) external view returns (bool) {
        return blockedUsers[_blocker][_blocked];
    }

    function getFriendCount(address _player) external view returns (uint256) {
        return friendCounts[_player];
    }

    function getReferralCount(address _referrer) external view returns (uint256) {
        return referralCounts[_referrer];
    }

    function getTotalReferralRewards(address _referrer) external view returns (uint256) {
        return referralRewards[_referrer];
    }

    function getReferralInfo(address _referee) external view returns (
        address referrer,
        uint256 timestamp,
        bool rewarded,
        uint256 rewardAmount
    ) {
        Referral memory referral = referrals[_referee];
        return (
            referral.referrer,
            referral.timestamp,
            referral.rewarded,
            referral.rewardAmount
        );
    }

    function getPlayerFriendRequests(address _player) external view returns (bytes32[] memory) {
        return playerFriendRequests[_player];
    }

    // ============ Admin Functions ============

    function setReferralRewards(uint256 _referrerBps, uint256 _refereeBps) external onlyOwner {
        require(_referrerBps <= 1000, "Referrer reward too high"); // Max 10%
        require(_refereeBps <= 1000, "Referee reward too high"); // Max 10%

        referrerRewardBps = _referrerBps;
        refereeRewardBps = _refereeBps;
    }

    function setReferralRewardLimits(uint256 _min, uint256 _max) external onlyOwner {
        require(_min <= _max, "Invalid limits");

        minReferralReward = _min;
        maxReferralReward = _max;
    }

    function fundReferralTreasury() external payable {
        require(msg.value > 0, "Must send CELO");
        referralTreasury += msg.value;
        emit TreasuryFunded(msg.sender, msg.value);
    }

    function withdrawFromTreasury(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount <= referralTreasury, "Insufficient treasury balance");

        referralTreasury -= _amount;
        payable(owner()).transfer(_amount);

        emit TreasuryWithdrawn(owner(), _amount);
    }

    // Allow contract to receive CELO
    receive() external payable {
        referralTreasury += msg.value;
        emit TreasuryFunded(msg.sender, msg.value);
    }
}
