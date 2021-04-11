const { expect } = require("chai");

describe("BinaryBets Pool Creation", function () {
    it("Should update the pool", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");

        let bet = await BinaryBet.deploy(10, 30, 1);
        await bet.deployed();
        let result = await bet.updatePool(100,150, 0, 10)
        expect(result[0]).to.equal(110);
        expect(result[1]).to.equal(150);

        result = await bet.updatePool(200,80, 0, 30)
        expect(result[0]).to.equal(230);
        expect(result[1]).to.equal(80);

        result = await bet.updatePool(200,80, 1, 30)
        expect(result[0]).to.equal(200);
        expect(result[1]).to.equal(110);

        result = await bet.updatePool(10,0, 1, 150)
        expect(result[0]).to.equal(10);
        expect(result[1]).to.equal(150);
    });

});
