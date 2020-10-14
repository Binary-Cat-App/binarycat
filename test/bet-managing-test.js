const { expect } = require("chai");

describe("BinaryBets Bet management", function () {
    it("Should get the correct bet result", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");

        const bet = await BinaryBet.deploy(10, 30, 2, 1);
        await bet.deployed();

        // function betResult(uint8 betSide, uint referencePrice, uint settlementPrice) public pure returns(BetResult)

        let result = await bet.betResult(0, 100, 110);
        expect(result).to.equal(1);

        result = await bet.betResult(0, 100, 100);
        expect(result).to.equal(2);

        result = await bet.betResult(0, 115, 110);
        expect(result).to.equal(0);

        result = await bet.betResult(0, 155, 310);
        expect(result).to.equal(1);

        result = await bet.betResult(1, 100, 110);
        expect(result).to.equal(0);

        result = await bet.betResult(1, 10, 10);
        expect(result).to.equal(2);


        result = await bet.betResult(1, 115, 110);
        expect(result).to.equal(1);

        result = await bet.betResult(1, 155, 310);
        expect(result).to.equal(0);
    });

});
