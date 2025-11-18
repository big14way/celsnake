const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultiplayerSnakesGame", function () {
  let game;
  let owner;
  let player1;
  let player2;
  let player3;
  let player4;

  const BET_AMOUNT = ethers.parseEther("0.1");
  const Difficulty = { Easy: 0, Medium: 1, Hard: 2, Expert: 3, Master: 4 };
  const PrizeModel = { WinnerTakesAll: 0, Proportional: 1, Survival: 2 };
  const RoomStatus = { Waiting: 0, Playing: 1, Finished: 2, Cancelled: 3 };

  beforeEach(async function () {
    [owner, player1, player2, player3, player4] = await ethers.getSigners();

    const MultiplayerSnakesGame = await ethers.getContractFactory("MultiplayerSnakesGame");
    game = await MultiplayerSnakesGame.deploy();
    await game.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await game.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct constants", async function () {
      expect(await game.HOUSE_FEE_PERCENT()).to.equal(5);
      expect(await game.MAX_PLAYERS_PER_ROOM()).to.equal(4);
      expect(await game.TURN_TIMEOUT()).to.equal(60);
    });
  });

  describe("Room Creation", function () {
    it("Should create a room successfully", async function () {
      await expect(
        game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 2, PrizeModel.WinnerTakesAll, { value: BET_AMOUNT })
      )
        .to.emit(game, "RoomCreated")
        .withArgs(1, player1.address, Difficulty.Easy, BET_AMOUNT);

      const roomInfo = await game.getRoomInfo(1);
      expect(roomInfo.id).to.equal(1);
      expect(roomInfo.host).to.equal(player1.address);
      expect(roomInfo.betAmount).to.equal(BET_AMOUNT);
      expect(roomInfo.maxPlayers).to.equal(2);
      expect(roomInfo.currentPlayers).to.equal(1);
      expect(roomInfo.status).to.equal(RoomStatus.Waiting);
    });

    it("Should fail with zero bet amount", async function () {
      await expect(
        game.connect(player1).createRoom(Difficulty.Easy, 0, 2, PrizeModel.WinnerTakesAll, { value: 0 })
      ).to.be.revertedWith("Bet amount must be > 0");
    });

    it("Should fail with invalid max players", async function () {
      await expect(
        game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 1, PrizeModel.WinnerTakesAll, { value: BET_AMOUNT })
      ).to.be.revertedWith("Invalid max players");

      await expect(
        game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 5, PrizeModel.WinnerTakesAll, { value: BET_AMOUNT })
      ).to.be.revertedWith("Invalid max players");
    });

    it("Should increment room IDs", async function () {
      await game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 2, PrizeModel.WinnerTakesAll, { value: BET_AMOUNT });
      await game.connect(player2).createRoom(Difficulty.Medium, BET_AMOUNT, 3, PrizeModel.Proportional, { value: BET_AMOUNT });

      expect(await game.nextRoomId()).to.equal(3);
    });
  });

  describe("Joining Rooms", function () {
    beforeEach(async function () {
      await game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 2, PrizeModel.WinnerTakesAll, { value: BET_AMOUNT });
    });

    it("Should allow player to join room with correct bet", async function () {
      await expect(
        game.connect(player2).joinRoom(1, { value: BET_AMOUNT })
      )
        .to.emit(game, "PlayerJoined")
        .withArgs(1, player2.address);

      const roomInfo = await game.getRoomInfo(1);
      expect(roomInfo.currentPlayers).to.equal(2);
      expect(roomInfo.prizePool).to.equal(BET_AMOUNT * BigInt(2)); // Host + Joiner
    });

    it("Should fail with incorrect bet amount", async function () {
      await expect(
        game.connect(player2).joinRoom(1, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("Incorrect bet amount");
    });

    it("Should fail if room doesn't exist", async function () {
      await expect(
        game.connect(player2).joinRoom(999, { value: BET_AMOUNT })
      ).to.be.revertedWith("Room does not exist");
    });

    it("Should fail if already joined", async function () {
      // Create room with 3 max players so we can test joining twice
      await game.connect(player3).createRoom(Difficulty.Easy, BET_AMOUNT, 3, PrizeModel.WinnerTakesAll, { value: BET_AMOUNT });
      await game.connect(player2).joinRoom(2, { value: BET_AMOUNT });
      
      await expect(
        game.connect(player2).joinRoom(2, { value: BET_AMOUNT })
      ).to.be.revertedWith("Already joined");
    });

    it("Should fail if room is full", async function () {
      // Room 1 has max 2 players (host + 1 more)
      await game.connect(player2).joinRoom(1, { value: BET_AMOUNT });
      // Now room is full and auto-started
      
      // Try to join - should fail because room is now Playing, not Waiting
      await expect(
        game.connect(player3).joinRoom(1, { value: BET_AMOUNT })
      ).to.be.revertedWith("Room not accepting players");
    });

    it("Should auto-start game when room is full", async function () {
      await expect(
        game.connect(player2).joinRoom(1, { value: BET_AMOUNT })
      ).to.emit(game, "GameStarted");

      const roomInfo = await game.getRoomInfo(1);
      expect(roomInfo.status).to.equal(RoomStatus.Playing);
    });
  });

  describe("Leaving Rooms", function () {
    beforeEach(async function () {
      await game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 3, PrizeModel.WinnerTakesAll, { value: BET_AMOUNT });
      await game.connect(player2).joinRoom(1, { value: BET_AMOUNT });
    });

    it("Should allow player to leave before game starts", async function () {
      const balanceBefore = await ethers.provider.getBalance(player2.address);
      
      await expect(
        game.connect(player2).leaveRoom(1)
      ).to.emit(game, "PlayerLeft");

      const balanceAfter = await ethers.provider.getBalance(player2.address);
      expect(balanceAfter).to.be.gt(balanceBefore); // Got refund minus gas

      const roomInfo = await game.getRoomInfo(1);
      expect(roomInfo.currentPlayers).to.equal(1);
    });

    it("Should fail to leave after game started", async function () {
      await game.connect(player3).joinRoom(1, { value: BET_AMOUNT });
      // Room is full, game started

      await expect(
        game.connect(player2).leaveRoom(1)
      ).to.be.revertedWith("Cannot leave after game started");
    });

    it("Should fail if not in room", async function () {
      await expect(
        game.connect(player4).leaveRoom(1)
      ).to.be.revertedWith("Not in room");
    });
  });

  describe("Game Mechanics", function () {
    beforeEach(async function () {
      // Create and fill room
      await game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 2, PrizeModel.WinnerTakesAll, { value: BET_AMOUNT });
      await game.connect(player2).joinRoom(1, { value: BET_AMOUNT });
      // Game should auto-start
    });

    it("Should finish player with score", async function () {
      const score = 1000;
      
      await expect(
        game.connect(player1).finishPlayer(1, score)
      )
        .to.emit(game, "PlayerFinished")
        .withArgs(1, player1.address, score);
    });

    it("Should eliminate player", async function () {
      // Player 1 finishes
      await game.connect(player1).finishPlayer(1, 1000);
      
      // Player 2 eliminated (only for testing - in prod this would be oracle-only)
      await expect(
        game.connect(player2).eliminatePlayer(1, player2.address)
      ).to.emit(game, "PlayerEliminated");
    });

    it("Should finish game and distribute prizes", async function () {
      // Player 1 finishes with high score
      await game.connect(player1).finishPlayer(1, 2000);
      
      // Player 2 finishes with lower score
      await expect(
        game.connect(player2).finishPlayer(1, 1000)
      ).to.emit(game, "GameFinished");

      const roomInfo = await game.getRoomInfo(1);
      expect(roomInfo.status).to.equal(RoomStatus.Finished);
    });

    it("Should track player stats", async function () {
      await game.connect(player1).finishPlayer(1, 2000);
      await game.connect(player2).finishPlayer(1, 1000);

      const stats = await game.getPlayerStats(player1.address);
      expect(stats.totalGames).to.equal(1);
      expect(stats.wins).to.equal(1);
      expect(stats.totalEarnings).to.be.gt(0);
    });
  });

  describe("Prize Distribution Models", function () {
    it("Should distribute winner-takes-all correctly", async function () {
      await game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 2, PrizeModel.WinnerTakesAll, { value: BET_AMOUNT });
      await game.connect(player2).joinRoom(1, { value: BET_AMOUNT });

      const balanceBefore = await ethers.provider.getBalance(player1.address);

      // Player 1 wins with higher score
      await game.connect(player1).finishPlayer(1, 2000);
      await game.connect(player2).finishPlayer(1, 1000);

      const balanceAfter = await ethers.provider.getBalance(player1.address);
      
      // Winner should receive ~95% of prize pool (2 * BET_AMOUNT * 0.95)
      const expectedPrize = (BET_AMOUNT * BigInt(2) * BigInt(95)) / BigInt(100);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should distribute proportional prizes for top 3", async function () {
      await game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 3, PrizeModel.Proportional, { value: BET_AMOUNT });
      await game.connect(player2).joinRoom(1, { value: BET_AMOUNT });
      await game.connect(player3).joinRoom(1, { value: BET_AMOUNT });

      // Players finish with different scores
      await game.connect(player1).finishPlayer(1, 3000); // 1st: 60%
      await game.connect(player2).finishPlayer(1, 2000); // 2nd: 25%
      await game.connect(player3).finishPlayer(1, 1000); // 3rd: 10%

      // All should receive something
      const stats1 = await game.getPlayerStats(player1.address);
      const stats2 = await game.getPlayerStats(player2.address);
      const stats3 = await game.getPlayerStats(player3.address);

      expect(stats1.totalEarnings).to.be.gt(stats2.totalEarnings);
      expect(stats2.totalEarnings).to.be.gt(stats3.totalEarnings);
    });

    it("Should distribute survival bonuses equally", async function () {
      await game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 3, PrizeModel.Survival, { value: BET_AMOUNT });
      await game.connect(player2).joinRoom(1, { value: BET_AMOUNT });
      await game.connect(player3).joinRoom(1, { value: BET_AMOUNT });

      // Two players survive, one eliminated
      await game.connect(player1).finishPlayer(1, 1000);
      await game.connect(player2).finishPlayer(1, 1500);
      await game.connect(player3).eliminatePlayer(1, player3.address);

      // Survivors should split prize equally
      const stats1 = await game.getPlayerStats(player1.address);
      const stats2 = await game.getPlayerStats(player2.address);

      expect(stats1.totalEarnings).to.approximately(stats2.totalEarnings, ethers.parseEther("0.01"));
    });
  });

  describe("Room Management", function () {
    it("Should get active rooms list", async function () {
      await game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 2, PrizeModel.WinnerTakesAll, { value: BET_AMOUNT });
      await game.connect(player2).createRoom(Difficulty.Medium, BET_AMOUNT, 3, PrizeModel.Proportional, { value: BET_AMOUNT });

      const activeRooms = await game.getActiveRooms();
      expect(activeRooms.length).to.equal(2);
    });

    it("Should get room players", async function () {
      await game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 3, PrizeModel.WinnerTakesAll, { value: BET_AMOUNT });
      await game.connect(player2).joinRoom(1, { value: BET_AMOUNT });

      const players = await game.getRoomPlayers(1);
      expect(players.length).to.equal(2);
      expect(players[0]).to.equal(player1.address);
      expect(players[1]).to.equal(player2.address);
    });

    it("Should remove finished rooms from active list", async function () {
      // Create a 3-player room so it stays in Waiting status
      await game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 3, PrizeModel.WinnerTakesAll, { value: BET_AMOUNT });

      let activeRooms = await game.getActiveRooms();
      expect(activeRooms.length).to.equal(1); // Room waiting

      // Fill the room
      await game.connect(player2).joinRoom(1, { value: BET_AMOUNT });
      await game.connect(player3).joinRoom(1, { value: BET_AMOUNT });
      // Now room is playing

      activeRooms = await game.getActiveRooms();
      expect(activeRooms.length).to.equal(0); // Room playing, removed from active

      // Finish game
      await game.connect(player1).finishPlayer(1, 2000);
      await game.connect(player2).finishPlayer(1, 1500);
      await game.connect(player3).finishPlayer(1, 1000);

      activeRooms = await game.getActiveRooms();
      expect(activeRooms.length).to.equal(0); // Room finished, still not in active
    });
  });

  describe("Nickname Management", function () {
    it("Should set nickname", async function () {
      await game.connect(player1).setNickname("Player One");
      
      const stats = await game.getPlayerStats(player1.address);
      expect(stats.nickname).to.equal("Player One");
    });

    it("Should fail with empty nickname", async function () {
      await expect(
        game.connect(player1).setNickname("")
      ).to.be.revertedWith("Invalid nickname");
    });

    it("Should fail with nickname too long", async function () {
      await expect(
        game.connect(player1).setNickname("ThisNicknameIsWayTooLongAndShouldFail")
      ).to.be.revertedWith("Invalid nickname");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to withdraw fees", async function () {
      // Create and complete a game to generate fees
      await game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 2, PrizeModel.WinnerTakesAll, { value: BET_AMOUNT });
      await game.connect(player2).joinRoom(1, { value: BET_AMOUNT });
      
      // Check owner balance before game ends
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      await game.connect(player1).finishPlayer(1, 2000);
      await game.connect(player2).finishPlayer(1, 1000);

      // After game ends, 5% house fee should have been transferred to owner automatically
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      const expectedFee = (BET_AMOUNT * BigInt(2) * BigInt(5)) / BigInt(100);
      
      // Owner balance should have increased by approximately the house fee
      expect(ownerBalanceAfter).to.be.closeTo(ownerBalanceBefore + expectedFee, ethers.parseEther("0.001"));
    });

    it("Should fail if non-owner tries to withdraw", async function () {
      await expect(
        game.connect(player1).withdraw(ethers.parseEther("0.1"))
      ).to.be.revertedWith("Only owner");
    });

    it("Should allow owner to transfer ownership", async function () {
      await game.connect(owner).transferOwnership(player1.address);
      expect(await game.owner()).to.equal(player1.address);
    });

    it("Should fail to transfer ownership to zero address", async function () {
      await expect(
        game.connect(owner).transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle all players eliminated", async function () {
      await game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 2, PrizeModel.WinnerTakesAll, { value: BET_AMOUNT });
      await game.connect(player2).joinRoom(1, { value: BET_AMOUNT });

      // Both players eliminated
      await game.connect(player1).eliminatePlayer(1, player1.address);
      await game.connect(player2).eliminatePlayer(1, player2.address);

      const roomInfo = await game.getRoomInfo(1);
      expect(roomInfo.status).to.equal(RoomStatus.Finished);
    });

    it("Should handle single player finishing", async function () {
      await game.connect(player1).createRoom(Difficulty.Easy, BET_AMOUNT, 2, PrizeModel.Survival, { value: BET_AMOUNT });
      await game.connect(player2).joinRoom(1, { value: BET_AMOUNT });

      // One finishes, one eliminated
      await game.connect(player1).finishPlayer(1, 1000);
      await game.connect(player2).eliminatePlayer(1, player2.address);

      const stats = await game.getPlayerStats(player1.address);
      expect(stats.wins).to.equal(1);
    });
  });
});
