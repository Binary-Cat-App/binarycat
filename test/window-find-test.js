const { expect } = require("chai");
const { BN, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { deployments, ethers } = require("hardhat");
const {deployMockContract} = require('@ethereum-waffle/mock-contract');
const AGGREGATOR = require('../artifacts/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol/AggregatorV3Interface.json')

describe("BinaryBets Windows",function () {

    beforeEach(async function () {
        [owner, account1, account2, account3, ...addrs] = await ethers.getSigners();
        mockAggregator = await deployMockContract(owner, AGGREGATOR.abi);
        aggregatorAddress = mockAggregator.address

        BinaryBet = await ethers.getContractFactory("BinaryBet");
        BinaryStaking = await ethers.getContractFactory("BinaryStaking");
        BinToken = await ethers.getContractFactory("BinToken");

        token = await BinToken.deploy(owner.address);
        stk = await BinaryStaking.deploy(token.address);
        bet = await BinaryBet.deploy(30, 1, mockAggregator.address, stk.address, token.address, 332);
    });

    it("Should find the correct starting block for the window", async function () {
        let windowDuration = 30;
        let firstTimestamp = 10;
        
        expect(await bet.getWindowStartingTimestamp(12, windowDuration, firstTimestamp)).to.equal(340);
        expect(await bet.getWindowStartingTimestamp(10, windowDuration, firstTimestamp)).to.equal(280);
        expect(await bet.getWindowStartingTimestamp(21, windowDuration, firstTimestamp)).to.equal(610);
        expect(await bet.getWindowStartingTimestamp(21, windowDuration, firstTimestamp)).to.equal(610);

        const BinaryBet = await ethers.getContractFactory("BinaryBet");
        bet = await BinaryBet.deploy(12, 1, mockAggregator.address, stk.address, token.address, 332);
        windowDuration = 12
        firstTimestamp = 5
        expect(await bet.getWindowStartingTimestamp(12, windowDuration, firstTimestamp)).to.equal(137);
        expect(await bet.getWindowStartingTimestamp(10, windowDuration, firstTimestamp)).to.equal(113);
        expect(await bet.getWindowStartingTimestamp(35, windowDuration, firstTimestamp)).to.equal(413);
    });

    it("Should find the correct window number for block", async function () {
        let windowDuration = 30;
        let firstTimestamp = 10;

        expect(await bet.getWindowNumber(10, windowDuration, firstTimestamp)).to.equal(1);
        expect(await bet.getWindowNumber(10, windowDuration, firstTimestamp)).to.equal(1);
        expect(await bet.getWindowNumber(168, windowDuration, firstTimestamp)).to.equal(6);
        expect(await bet.getWindowNumber(330, windowDuration, firstTimestamp)).to.equal(11);
        expect(await bet.getWindowNumber(749, windowDuration, firstTimestamp)).to.equal(25);

        const BinaryBet = await ethers.getContractFactory("BinaryBet");
        bet = await BinaryBet.deploy(12, 1, mockAggregator.address, stk.address, token.address, 332);
        windowDuration = 12;
        firstTimestamp = 5;
        expect(await bet.getWindowNumber(5, windowDuration, firstTimestamp)).to.equal(1);
        expect(await bet.getWindowNumber(162, windowDuration, firstTimestamp)).to.equal(14);
        expect(await bet.getWindowNumber(235, windowDuration, firstTimestamp)).to.equal(20);
        expect(await bet.getWindowNumber(779, windowDuration, firstTimestamp)).to.equal(65);
    });
});
