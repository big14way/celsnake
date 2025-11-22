const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SocialFeatures Contract - Core Functions", function () {
  let socialFeatures;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const SocialFeatures = await ethers.getContractFactory("SocialFeatures");
    socialFeatures = await SocialFeatures.deploy();
    await socialFeatures.waitForDeployment();

    // Fund the treasury
    await socialFeatures.fundReferralTreasury({ value: ethers.parseEther("10") });
  });

  describe("Profile & Friend System", function () {
    it("Should create profiles and become friends", async function () {
      // Create profiles
      await socialFeatures.connect(user1).createProfile("Alice");
      await socialFeatures.connect(user2).createProfile("Bob");

      // Send friend request
      await socialFeatures.connect(user1).sendFriendRequest(user2.address);

      // Get request IDs
      const requestIds = await socialFeatures.getPlayerFriendRequests(user2.address);
      expect(requestIds.length).to.equal(1);

      // Accept friend request
      await socialFeatures.connect(user2).acceptFriendRequest(requestIds[0]);

      // Verify friendship
      expect(await socialFeatures.isFriend(user1.address, user2.address)).to.be.true;
      expect(await socialFeatures.getFriendCount(user1.address)).to.equal(1);
      expect(await socialFeatures.getFriendCount(user2.address)).to.equal(1);
    });

    it("Should block and unblock users", async function () {
      await socialFeatures.connect(user1).createProfile("Alice");
      await socialFeatures.connect(user2).createProfile("Bob");

      // Block user
      await socialFeatures.connect(user1).blockUser(user2.address);
      expect(await socialFeatures.isBlocked(user1.address, user2.address)).to.be.true;

      // Unblock user
      await socialFeatures.connect(user1).unblockUser(user2.address);
      expect(await socialFeatures.isBlocked(user1.address, user2.address)).to.be.false;
    });

    it("Should prevent blocked users from sending friend requests", async function () {
      await socialFeatures.connect(user1).createProfile("Alice");
      await socialFeatures.connect(user2).createProfile("Bob");

      await socialFeatures.connect(user2).blockUser(user1.address);

      await expect(
        socialFeatures.connect(user1).sendFriendRequest(user2.address)
      ).to.be.revertedWith("You are blocked by this user");
    });
  });

  describe("Referral System", function () {
    it("Should create referral code and register referral", async function () {
      await socialFeatures.connect(user1).createProfile("Alice");
      await socialFeatures.connect(user2).createProfile("Bob");

      // Create referral code
      await socialFeatures.connect(user1).createReferralCode("ALICE123");

      // Register referral
      await socialFeatures.connect(user2).registerReferral("ALICE123", user2.address);

      // Verify referral info (contract returns: referrer, timestamp, rewarded, rewardAmount)
      const referralInfo = await socialFeatures.getReferralInfo(user2.address);
      expect(referralInfo.referrer).to.equal(user1.address);
      expect(referralInfo.rewarded).to.be.false;
    });

    it("Should distribute referral rewards correctly", async function () {
      await socialFeatures.connect(user1).createProfile("Alice");
      await socialFeatures.connect(user2).createProfile("Bob");

      await socialFeatures.connect(user1).createReferralCode("ALICE123");
      await socialFeatures.connect(user2).registerReferral("ALICE123", user2.address);

      const betAmount = ethers.parseEther("1.0");
      const user1BalanceBefore = await ethers.provider.getBalance(user1.address);
      const user2BalanceBefore = await ethers.provider.getBalance(user2.address);

      // Reward referral (only owner can call this)
      await socialFeatures.connect(owner).rewardReferral(user2.address, betAmount);

      const user1BalanceAfter = await ethers.provider.getBalance(user1.address);
      const user2BalanceAfter = await ethers.provider.getBalance(user2.address);

      // Referrer gets 5% (500 bps) = 0.05 CELO
      const expectedReferrerReward = betAmount * 500n / 10000n;
      // Referee gets 3% (300 bps) = 0.03 CELO
      const expectedRefereeReward = betAmount * 300n / 10000n;

      expect(user1BalanceAfter - user1BalanceBefore).to.equal(expectedReferrerReward);
      expect(user2BalanceAfter - user2BalanceBefore).to.equal(expectedRefereeReward);
    });

    it("Should prevent duplicate referral codes", async function () {
      await socialFeatures.connect(user1).createProfile("Alice");
      await socialFeatures.connect(user2).createProfile("Bob");

      await socialFeatures.connect(user1).createReferralCode("ALICE123");

      await expect(
        socialFeatures.connect(user2).createReferralCode("ALICE123")
      ).to.be.reverted; // Will fail with "Code already exists"
    });

    it("Should prevent self-referral", async function () {
      await socialFeatures.connect(user1).createProfile("Alice");

      await socialFeatures.connect(user1).createReferralCode("ALICE123");

      await expect(
        socialFeatures.connect(user1).registerReferral("ALICE123", user1.address)
      ).to.be.revertedWith("Cannot refer yourself");
    });
  });

  describe("Treasury Management", function () {
    it("Should fund treasury and track balance", async function () {
      const currentBalance = await socialFeatures.referralTreasury();
      const additionalFunding = ethers.parseEther("5");

      await socialFeatures.fundReferralTreasury({ value: additionalFunding });

      const newBalance = await socialFeatures.referralTreasury();
      expect(newBalance).to.equal(currentBalance + additionalFunding);
    });

    it("Should allow owner to withdraw from treasury", async function () {
      const withdrawAmount = ethers.parseEther("1");
      const balanceBefore = await socialFeatures.referralTreasury();

      await socialFeatures.connect(owner).withdrawFromTreasury(withdrawAmount);

      const balanceAfter = await socialFeatures.referralTreasury();
      expect(balanceAfter).to.equal(balanceBefore - withdrawAmount);
    });

    it("Should prevent non-owner from withdrawing", async function () {
      const withdrawAmount = ethers.parseEther("1");

      await expect(
        socialFeatures.connect(user1).withdrawFromTreasury(withdrawAmount)
      ).to.be.reverted; // Will fail with custom error from Ownable
    });
  });

  describe("Reward Configuration", function () {
    it("Should allow owner to update referral rewards", async function () {
      await socialFeatures.connect(owner).setReferralRewards(1000, 500); // 10% and 5%

      const referrerBps = await socialFeatures.referrerRewardBps();
      const refereeBps = await socialFeatures.refereeRewardBps();

      expect(referrerBps).to.equal(1000);
      expect(refereeBps).to.equal(500);
    });

    it("Should prevent excessive reward percentages", async function () {
      await expect(
        socialFeatures.connect(owner).setReferralRewards(6000, 5000) // 60% + 50% = 110%
      ).to.be.reverted; // Will fail with "Referrer reward too high" or similar
    });
  });

  describe("Security & Edge Cases", function () {
    it("Should prevent sending friend request to yourself", async function () {
      await socialFeatures.connect(user1).createProfile("Alice");

      await expect(
        socialFeatures.connect(user1).sendFriendRequest(user1.address)
      ).to.be.revertedWith("Cannot send friend request to yourself");
    });

    it("Should prevent creating duplicate profiles", async function () {
      await socialFeatures.connect(user1).createProfile("Alice");

      await expect(
        socialFeatures.connect(user1).createProfile("Alice2")
      ).to.be.revertedWith("Profile already exists");
    });

    it("Should remove friendship when blocking", async function () {
      await socialFeatures.connect(user1).createProfile("Alice");
      await socialFeatures.connect(user2).createProfile("Bob");

      // Become friends
      await socialFeatures.connect(user1).sendFriendRequest(user2.address);
      const requestIds = await socialFeatures.getPlayerFriendRequests(user2.address);
      await socialFeatures.connect(user2).acceptFriendRequest(requestIds[0]);

      expect(await socialFeatures.isFriend(user1.address, user2.address)).to.be.true;

      // Block should remove friendship
      await socialFeatures.connect(user1).blockUser(user2.address);
      expect(await socialFeatures.isFriend(user1.address, user2.address)).to.be.false;
    });
  });
});
