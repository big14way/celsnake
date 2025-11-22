const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SocialFeatures Contract", function () {
  let socialFeatures;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    const SocialFeatures = await ethers.getContractFactory("SocialFeatures");
    socialFeatures = await SocialFeatures.deploy();
    await socialFeatures.waitForDeployment();

    // Fund the treasury
    await socialFeatures.fundReferralTreasury({ value: ethers.parseEther("10") });
  });

  describe("Profile Management", function () {
    it("Should create a profile", async function () {
      await socialFeatures.connect(user1).createProfile("Alice");

      const profile = await socialFeatures.getProfile(user1.address);
      expect(profile.nickname).to.equal("Alice");
      expect(profile.allowFriendRequests).to.be.true;
    });

    it("Should update a profile", async function () {
      await socialFeatures.connect(user1).createProfile("Alice");
      await socialFeatures.connect(user1).updateProfile("AliceUpdated", false);

      const profile = await socialFeatures.getProfile(user1.address);
      expect(profile.nickname).to.equal("AliceUpdated");
      expect(profile.allowFriendRequests).to.be.false;
    });

    it("Should fail to create profile with empty nickname", async function () {
      await expect(
        socialFeatures.connect(user1).createProfile("")
      ).to.be.revertedWith("Nickname cannot be empty");
    });
  });

  describe("Friend System", function () {
    beforeEach(async function () {
      await socialFeatures.connect(user1).createProfile("Alice");
      await socialFeatures.connect(user2).createProfile("Bob");
    });

    it("Should send a friend request", async function () {
      await socialFeatures.connect(user1).sendFriendRequest(user2.address);

      const requests = await socialFeatures.getFriendRequests(user2.address);
      expect(requests.length).to.equal(1);
      expect(requests[0].from).to.equal(user1.address);
    });

    it("Should accept a friend request", async function () {
      await socialFeatures.connect(user1).sendFriendRequest(user2.address);
      const requests = await socialFeatures.getFriendRequests(user2.address);
      const requestId = requests[0].id;

      await socialFeatures.connect(user2).acceptFriendRequest(requestId);

      expect(await socialFeatures.areFriends(user1.address, user2.address)).to.be.true;
      expect(await socialFeatures.getFriendCount(user1.address)).to.equal(1);
      expect(await socialFeatures.getFriendCount(user2.address)).to.equal(1);
    });

    it("Should remove a friend", async function () {
      await socialFeatures.connect(user1).sendFriendRequest(user2.address);
      const requests = await socialFeatures.getFriendRequests(user2.address);
      await socialFeatures.connect(user2).acceptFriendRequest(requests[0].id);

      await socialFeatures.connect(user1).removeFriend(user2.address);

      expect(await socialFeatures.areFriends(user1.address, user2.address)).to.be.false;
    });

    it("Should block a user", async function () {
      await socialFeatures.connect(user1).blockUser(user2.address);

      expect(await socialFeatures.isBlocked(user1.address, user2.address)).to.be.true;
    });

    it("Should unblock a user", async function () {
      await socialFeatures.connect(user1).blockUser(user2.address);
      await socialFeatures.connect(user1).unblockUser(user2.address);

      expect(await socialFeatures.isBlocked(user1.address, user2.address)).to.be.false;
    });

    it("Should fail to send friend request to blocked user", async function () {
      await socialFeatures.connect(user2).blockUser(user1.address);

      await expect(
        socialFeatures.connect(user1).sendFriendRequest(user2.address)
      ).to.be.revertedWith("You are blocked by this user");
    });

    it("Should fail to send friend request to yourself", async function () {
      await expect(
        socialFeatures.connect(user1).sendFriendRequest(user1.address)
      ).to.be.revertedWith("Cannot send friend request to yourself");
    });
  });

  describe("Referral System", function () {
    beforeEach(async function () {
      await socialFeatures.connect(user1).createProfile("Alice");
      await socialFeatures.connect(user2).createProfile("Bob");
    });

    it("Should create a referral code", async function () {
      await socialFeatures.connect(user1).createReferralCode("ALICE123");

      const code = await socialFeatures.getReferralCode(user1.address);
      expect(code).to.equal("ALICE123");
    });

    it("Should register a referral", async function () {
      await socialFeatures.connect(user1).createReferralCode("ALICE123");
      await socialFeatures.connect(user2).registerReferral("ALICE123", user2.address);

      const referrer = await socialFeatures.getReferrer(user2.address);
      expect(referrer).to.equal(user1.address);
    });

    it("Should distribute referral rewards", async function () {
      await socialFeatures.connect(user1).createReferralCode("ALICE123");
      await socialFeatures.connect(user2).registerReferral("ALICE123", user2.address);

      const betAmount = ethers.parseEther("1.0");

      const user1BalanceBefore = await ethers.provider.getBalance(user1.address);
      const user2BalanceBefore = await ethers.provider.getBalance(user2.address);

      await socialFeatures.connect(owner).rewardReferral(user2.address, betAmount);

      const user1BalanceAfter = await ethers.provider.getBalance(user1.address);
      const user2BalanceAfter = await ethers.provider.getBalance(user2.address);

      // Referrer gets 5% (500 bps)
      const referrerReward = betAmount.mul(500).div(10000);
      // Referee gets 3% (300 bps)
      const refereeReward = betAmount.mul(300).div(10000);

      expect(user1BalanceAfter.sub(user1BalanceBefore)).to.equal(referrerReward);
      expect(user2BalanceAfter.sub(user2BalanceBefore)).to.equal(refereeReward);
    });

    it("Should fail to create duplicate referral code", async function () {
      await socialFeatures.connect(user1).createReferralCode("ALICE123");

      await expect(
        socialFeatures.connect(user2).createReferralCode("ALICE123")
      ).to.be.revertedWith("Referral code already exists");
    });

    it("Should fail to refer yourself", async function () {
      await socialFeatures.connect(user1).createReferralCode("ALICE123");

      await expect(
        socialFeatures.connect(user1).registerReferral("ALICE123", user1.address)
      ).to.be.revertedWith("Cannot refer yourself");
    });

    it("Should fail to register with invalid code", async function () {
      await expect(
        socialFeatures.connect(user2).registerReferral("INVALID", user2.address)
      ).to.be.revertedWith("Invalid referral code");
    });
  });

  describe("Treasury Management", function () {
    it("Should fund the treasury", async function () {
      const fundAmount = ethers.parseEther("5");
      await socialFeatures.fundReferralTreasury({ value: fundAmount });

      const balance = await socialFeatures.referralTreasury();
      expect(balance).to.be.gte(fundAmount);
    });

    it("Should allow owner to withdraw from treasury", async function () {
      const withdrawAmount = ethers.parseEther("1");

      await socialFeatures.connect(owner).withdrawFromTreasury(withdrawAmount);

      const balance = await socialFeatures.referralTreasury();
      expect(balance).to.equal(ethers.parseEther("9"));
    });

    it("Should fail non-owner withdrawal", async function () {
      const withdrawAmount = ethers.parseEther("1");

      await expect(
        socialFeatures.connect(user1).withdrawFromTreasury(withdrawAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Reward Settings", function () {
    it("Should allow owner to update referral rewards", async function () {
      await socialFeatures.connect(owner).setReferralRewards(1000, 500); // 10% and 5%

      const referrerBps = await socialFeatures.referrerRewardBps();
      const refereeBps = await socialFeatures.refereeRewardBps();

      expect(referrerBps).to.equal(1000);
      expect(refereeBps).to.equal(500);
    });

    it("Should fail if referral rewards exceed 100%", async function () {
      await expect(
        socialFeatures.connect(owner).setReferralRewards(6000, 5000)
      ).to.be.revertedWith("Total rewards cannot exceed 100%");
    });

    it("Should fail non-owner reward update", async function () {
      await expect(
        socialFeatures.connect(user1).setReferralRewards(1000, 500)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Security & Edge Cases", function () {
    beforeEach(async function () {
      await socialFeatures.connect(user1).createProfile("Alice");
      await socialFeatures.connect(user2).createProfile("Bob");
    });

    it("Should handle multiple friend requests correctly", async function () {
      await socialFeatures.connect(user1).createProfile("Charlie");
      await socialFeatures.connect(user3).createProfile("Dave");

      await socialFeatures.connect(user1).sendFriendRequest(user2.address);
      await socialFeatures.connect(user3).sendFriendRequest(user2.address);

      const requests = await socialFeatures.getFriendRequests(user2.address);
      expect(requests.length).to.equal(2);
    });

    it("Should prevent duplicate friend requests", async function () {
      await socialFeatures.connect(user1).sendFriendRequest(user2.address);

      await expect(
        socialFeatures.connect(user1).sendFriendRequest(user2.address)
      ).to.be.revertedWith("Friend request already sent");
    });

    it("Should handle blocking and unblocking correctly", async function () {
      await socialFeatures.connect(user1).sendFriendRequest(user2.address);
      const requests = await socialFeatures.getFriendRequests(user2.address);
      await socialFeatures.connect(user2).acceptFriendRequest(requests[0].id);

      // Block should remove friendship
      await socialFeatures.connect(user1).blockUser(user2.address);
      expect(await socialFeatures.areFriends(user1.address, user2.address)).to.be.false;
    });

    it("Should track friend count correctly", async function () {
      await socialFeatures.connect(user3).createProfile("Charlie");

      // User1 sends requests to User2 and User3
      await socialFeatures.connect(user1).sendFriendRequest(user2.address);
      await socialFeatures.connect(user1).sendFriendRequest(user3.address);

      const requests2 = await socialFeatures.getFriendRequests(user2.address);
      const requests3 = await socialFeatures.getFriendRequests(user3.address);

      await socialFeatures.connect(user2).acceptFriendRequest(requests2[0].id);
      await socialFeatures.connect(user3).acceptFriendRequest(requests3[0].id);

      expect(await socialFeatures.getFriendCount(user1.address)).to.equal(2);
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should efficiently handle large friend lists", async function () {
      await socialFeatures.connect(user1).createProfile("Alice");

      // Create 10 users and add them as friends
      const users = [];
      for (let i = 0; i < 10; i++) {
        const [_, ...rest] = await ethers.getSigners();
        users.push(rest[i]);
        await socialFeatures.connect(rest[i]).createProfile(`User${i}`);
        await socialFeatures.connect(user1).sendFriendRequest(rest[i].address);
        const requests = await socialFeatures.getFriendRequests(rest[i].address);
        await socialFeatures.connect(rest[i]).acceptFriendRequest(requests[0].id);
      }

      expect(await socialFeatures.getFriendCount(user1.address)).to.equal(10);
    });
  });
});
