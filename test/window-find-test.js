const { expect } = require("chai");

describe("BinaryBets Windows", function () {
    it("Should find the correct starting timestamp for the window", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");

        let bet = await BinaryBet.deploy(10, 30, 2, 1);
        await bet.deployed();
        expect(await bet.getWindowStartingTimestamp(12)).to.equal(340);
        expect(await bet.getWindowStartingTimestamp(10)).to.equal(280);
        expect(await bet.getWindowStartingTimestamp(21)).to.equal(610);

        bet = await BinaryBet.deploy(5, 12, 4, 1);
        await bet.deployed();
        expect(await bet.getWindowStartingTimestamp(12)).to.equal(137);
        expect(await bet.getWindowStartingTimestamp(10)).to.equal(113);
        expect(await bet.getWindowStartingTimestamp(35)).to.equal(413);



    });

    it("Should find the correct last bet timestamp for the window", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");

        let bet = await BinaryBet.deploy(10, 30, 2, 1);
        await bet.deployed();
        expect(await bet.getWindowLastBettingTimestamp(340)).to.equal(342);
        expect(await bet.getWindowLastBettingTimestamp(280)).to.equal(282);
        expect(await bet.getWindowLastBettingTimestamp(610)).to.equal(612);

        bet = await BinaryBet.deploy(5, 12, 4, 1);
        await bet.deployed();
        expect(await bet.getWindowLastBettingTimestamp(137)).to.equal(141);
        expect(await bet.getWindowLastBettingTimestamp(113)).to.equal(117);
        expect(await bet.getWindowLastBettingTimestamp(413)).to.equal(417);

    });

    it("Should find the correct window number for timestamp", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");

        let bet = await BinaryBet.deploy(10, 30, 2, 1);
        await bet.deployed();
        expect(await bet.getTimestampWindow(168)).to.equal(6);
        expect(await bet.getTimestampWindow(330)).to.equal(11);
        expect(await bet.getTimestampWindow(749)).to.equal(25);

        bet = await BinaryBet.deploy(5, 12, 4, 1);
        await bet.deployed();
        expect(await bet.getTimestampWindow(162)).to.equal(14);
        expect(await bet.getTimestampWindow(235)).to.equal(20);
        expect(await bet.getTimestampWindow(779)).to.equal(65);


    });

});
