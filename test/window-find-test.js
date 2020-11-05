const { expect } = require("chai");

describe("BinaryBets Windows", function () {
    it("Should find the correct starting timestamp for the window", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");

        let bet = await BinaryBet.deploy(10, 30, 1);
        await bet.deployed();
        expect(await bet.getWindowStartingTimestamp(12)).to.equal(340);
        expect(await bet.getWindowStartingTimestamp(10)).to.equal(280);
        expect(await bet.getWindowStartingTimestamp(21)).to.equal(610);

        bet = await BinaryBet.deploy(5, 12, 1);
        await bet.deployed();
        expect(await bet.getWindowStartingTimestamp(12)).to.equal(137);
        expect(await bet.getWindowStartingTimestamp(10)).to.equal(113);
        expect(await bet.getWindowStartingTimestamp(35)).to.equal(413);



    });


    it("Should find the correct window number for timestamp", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");

        let bet = await BinaryBet.deploy(10, 30, 1);
        await bet.deployed();
        expect(await bet.getTimestampWindow(168)).to.equal(6);
        expect(await bet.getTimestampWindow(330)).to.equal(11);
        expect(await bet.getTimestampWindow(749)).to.equal(25);

        bet = await BinaryBet.deploy(5, 12, 1);
        await bet.deployed();
        expect(await bet.getTimestampWindow(162)).to.equal(14);
        expect(await bet.getTimestampWindow(235)).to.equal(20);
        expect(await bet.getTimestampWindow(779)).to.equal(65);


    });

});
