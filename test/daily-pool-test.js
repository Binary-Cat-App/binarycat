const { expect } = require("chai");
const {
    BN,           // Big Number support
    } = require('@openzeppelin/test-helpers');
const {deployMockContract} = require('@ethereum-waffle/mock-contract');
const { deployments, ethers } = require("hardhat");
const AGGREGATOR = require('../artifacts/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol/AggregatorV3Interface.json')

describe("KITTY pool", function () {
    let owner;
    let account1;
    let account2;
    let account3;

    let BinaryBet
    let BinToken
    let DailyPool
    let aggregatorAddress



      beforeEach(async function () {
        [owner, account1, account2, account3, burn, ...addrs] = await ethers.getSigners();
        provider = ethers.provider;

        mockAggregator = await deployMockContract(owner, AGGREGATOR.abi);
        aggregatorAddress = mockAggregator.address

        Library = await ethers.getContractFactory("BetLibrary")
        lib = await Library.deploy();

        BinaryBet = await ethers.getContractFactory("BinaryBet");
        BinaryStaking = await ethers.getContractFactory("BinaryStaking");
        BinToken = await ethers.getContractFactory("BinToken");
        DailyPool = await ethers.getContractFactory("DailyPool", {
            libraries: {
                BetLibrary: lib.address,
            }
        ,});

        token = await BinToken.deploy(owner.address);
        stk = await BinaryStaking.deploy(token.address);
        bet = await BinaryBet.deploy(30, 2, aggregatorAddress, stk.address, token.address, 332);
        dpool = await DailyPool.deploy(8640, token.address, bet.address)

        await mockAggregator.mock.latestRoundData.returns(100, 100,100,100,100);

        token.connect(owner).transfer(bet.address, 1000)

        token.connect(owner).transfer(account1.address, 100000)
        token.connect(owner).transfer(account2.address, 100000)
        token.connect(owner).transfer(account3.address, 100000)

        token.connect(account1).approve(dpool.address, 100000)
        token.connect(account2).approve(dpool.address, 100000)
        token.connect(account3).approve(dpool.address, 100000)
  });

    async function mine(blocks) {
        for (i = 0; i <= blocks; i++) {
            await network.provider.send("evm_mine");
        }
    }

    

    it("Should bet with sent funds", async function () {
        await dpool.connect(account1).placeBet(0, 1000);
    });

    it("Should revert zero value bet", async function () {
        await expect(
            dpool.connect(account1).placeBet(0, 0)
      ).to.be.revertedWith("Only strictly positive values");
    });

    it("Should update pool", async function () {
        await dpool.connect(account1).placeBet(0, 100)
        let pool = await dpool.getPoolValues(1)
        expect(pool[0]).to.equal(100);
        expect(pool[1]).to.equal(0);

        await dpool.connect(account2).placeBet(0, 200)
        pool = await dpool.getPoolValues(1)
        expect(pool[0]).to.equal(300);
        expect(pool[1]).to.equal(0);
        
        await dpool.connect(account3).placeBet(1, 500)
        pool = await dpool.getPoolValues(1)
        expect(pool[0]).to.equal(300);
        expect(pool[1]).to.equal(500);
    });

    it("Should update stake", async function () {
        await dpool.connect(account1).placeBet(0, 100)
        let stake = await dpool.getUserStake(1, account1.address)
        expect(stake[0]).to.equal(100);
        expect(stake[1]).to.equal(0);

        await dpool.connect(account2).placeBet(0, 200)
        stake = await dpool.getUserStake(1, account2.address)
        expect(stake[0]).to.equal(200);
        expect(stake[1]).to.equal(0);
        
        await dpool.connect(account3).placeBet(1, 500)
        stake = await dpool.getUserStake(1, account3.address)
        expect(stake[0]).to.equal(0);
        expect(stake[1]).to.equal(500);
    });


    it("Should settle bet and burn fees", async function () {
        let balance3Initial = await token.balanceOf(account3.address)
        let balance2Initial = await token.balanceOf(account2.address)

        await dpool.connect(account3).placeBet(0, 200)
        await dpool.connect(account2).placeBet(1, 200)


        await provider.send("evm_increaseTime", [
                Number(8640),
            ]);
        await provider.send("evm_mine");

        await mockAggregator.mock.latestRoundData.returns(101, 101,101,101,101);
        await bet.connect(owner).updatePrice()

        await provider.send("evm_increaseTime", [
                Number(8640),
            ]);
        await provider.send("evm_mine");

        await mockAggregator.mock.latestRoundData.returns(102, 102,102,102,102);
        await bet.connect(owner).updatePrice()
        
        await dpool.connect(owner).updateBalance(account3.address)
        await dpool.connect(owner).updateBalance(account2.address)


        let balance3Final = await token.balanceOf(account3.address)
        let balance2Final = await token.balanceOf(account2.address)

        expect((balance2Final.sub(balance2Initial)).toString()).to.equal('200')
        expect((balance3Final.sub(balance3Initial)).toString()).to.equal('-200')
    });
});

