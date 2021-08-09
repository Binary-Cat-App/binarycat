const { expect } = require("chai");
const { BN, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');

describe("BinaryBets Windows",function () {
    beforeEach(async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");
        let bet = await BinaryBet.deploy(30, 1);
    });
    it("Should find the correct starting block for the window", async function () {
        let windowDuration = 30;
        let firstBlock = 10;
        
        expect(await bet.getWindowStartingBlock(12, windowDuration, firstBlock, 0)).to.equal(340);
        expect(await bet.getWindowStartingBlock(10, windowDuration, firstBlock,0)).to.equal(280);
        expect(await bet.getWindowStartingBlock(21, windowDuration, firstBlock,0)).to.equal(610);
        expect(await bet.getWindowStartingBlock(21, windowDuration, firstBlock,0)).to.equal(610);

        const BinaryBet = await ethers.getContractFactory("BinaryBet");
        bet = await BinaryBet.deploy(12, 1);
        await bet.deployed();
        windowDuration = 12
        firstBlock = 5
        expect(await bet.getWindowStartingBlock(12, windowDuration, firstBlock,0)).to.equal(137);
        expect(await bet.getWindowStartingBlock(10, windowDuration, firstBlock, 0)).to.equal(113);
        expect(await bet.getWindowStartingBlock(35, windowDuration, firstBlock, 0)).to.equal(413);
    });

    it("Should find the correct starting block for the window with offset", async function () {
        let windowDuration = 50;
        let firstBlock = 100;
        
        expect(await bet.getWindowStartingBlock(4, windowDuration, firstBlock, 3)).to.equal(100);
        expect(await bet.getWindowStartingBlock(5, windowDuration, firstBlock, 3)).to.equal(150);
        expect(await bet.getWindowStartingBlock(6, windowDuration,firstBlock, 3)).to.equal(200);

    });

    it("Should find the correct window number for block", async function () {
        let windowDuration = 30;
        let firstBlock = 10;

        expect(await bet.getWindowNumber(10, windowDuration, firstBlock, 0, 1)).to.equal(1);
        expect(await bet.getWindowNumber(10, windowDuration, firstBlock, 0, 1)).to.equal(1);
        expect(await bet.getWindowNumber(168, windowDuration, firstBlock, 0, 1)).to.equal(6);
        expect(await bet.getWindowNumber(330, windowDuration, firstBlock, 0, 1)).to.equal(11);
        expect(await bet.getWindowNumber(749, windowDuration, firstBlock, 0, 1)).to.equal(25);

        const BinaryBet = await ethers.getContractFactory("BinaryBet");
        bet = await BinaryBet.deploy(12, 1);
        await bet.deployed();
        windowDuration = 12;
        firstBlock = 5;
        expect(await bet.getWindowNumber(5, windowDuration, firstBlock, 0, 1)).to.equal(1);
        expect(await bet.getWindowNumber(4, windowDuration, firstBlock, 0, 1)).to.equal(1);
        expect(await bet.getWindowNumber(162, windowDuration, firstBlock, 0, 1)).to.equal(14);
        expect(await bet.getWindowNumber(235, windowDuration, firstBlock, 0, 1)).to.equal(20);
        expect(await bet.getWindowNumber(779, windowDuration, firstBlock, 0, 1)).to.equal(65);
    });

    it("Should find the correct window number for block with offset", async function () {
        let windowDuration = 50;
        let firstBlock = 100;
        expect(await bet.getWindowNumber(125, windowDuration, firstBlock, 3, 3)).to.equal(4);
        expect(await bet.getWindowNumber(149, windowDuration, firstBlock, 3, 3)).to.equal(4);
        expect(await bet.getWindowNumber(150, windowDuration, firstBlock, 3, 3)).to.equal(5);
        expect(await bet.getWindowNumber(180, windowDuration, firstBlock, 3, 3)).to.equal(5);
        expect(await bet.getWindowNumber(200, windowDuration, firstBlock, 3, 3)).to.equal(6);
        expect(await bet.getWindowNumber(249, windowDuration, firstBlock, 3, 3)).to.equal(6);
    });

});
