const { expect } = require("chai");

describe("BinaryBets Pool Creation", function () {
    it("Should create the pool if pool does not exist", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");

        let bet = await BinaryBet.deploy(10, 30, 2, 1);
        await bet.deployed();

        let windowNumber = 6
        let value = 10;
        let bet_block = 168;

        // function updatePool (uint windowNumber, uint startingBlock, uint value, uint8 side) public {
        await bet.updatePool(windowNumber, value, 0)

        //    function getPoolValues(uint windowNumber) public view returns (uint, uint, uint, uint) 
        let pool = await bet.getPoolValues(windowNumber);

        /*
        struct Pool {
            uint settlementBlock;
            uint upValue;
            uint downValue;
            uint referencePrice;
        }
        */
        expect(pool[0]).to.equal(190);
        expect(pool[1]).to.equal(value);
        expect(pool[2]).to.equal(0);
        expect(pool[3]).to.equal(100);


        windowNumber = 7;
        value = 55;
        bet_block = 194;
        await bet.updatePool(windowNumber, value, 1)

        pool = await bet.getPoolValues(windowNumber);

        expect(pool[0]).to.equal(220);
        expect(pool[1]).to.equal(0);
        expect(pool[2]).to.equal(value);
        expect(pool[3]).to.equal(100);

    });




    it("Should update the pool", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");

        let bet = await BinaryBet.deploy(10, 30, 2, 1);
        await bet.deployed();

        const windowNumber = 7

        await bet.updatePool(windowNumber, 10, 1)

        // function updatePool (uint windowNumber, uint value, uint8 side) public 
        await bet.updatePool(windowNumber, 10, 1)
        let pool = await bet.getPoolValues(windowNumber);
        expect(pool[1]).to.equal(0);
        expect(pool[2]).to.equal(20);

        await bet.updatePool(windowNumber, 15, 1)
        pool = await bet.getPoolValues(windowNumber);
        expect(pool[1]).to.equal(0);
        expect(pool[2]).to.equal(35);

        await bet.updatePool(windowNumber, 7, 0)
        pool = await bet.getPoolValues(windowNumber);
        expect(pool[1]).to.equal(7);
        expect(pool[2]).to.equal(35);

        await bet.updatePool(windowNumber, 8, 1)
        pool = await bet.getPoolValues(windowNumber);
        expect(pool[1]).to.equal(7);
        expect(pool[2]).to.equal(43);

    });

});
