const { expect } = require("chai");

describe("BinaryBets Pool Creation", function () {
    it("Should create the pool if pool does not exist", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");

        let bet = await BinaryBet.deploy(10, 30, 2);
        await bet.deployed();

        let windowNumber = 6
        let value = 10;
        let bet_block = 168;

        // function createPool (uint windowNumber, uint startingBlock, uint value, uint8 side) public {
        await bet.createPool(windowNumber, 160, value, 0)

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
        await bet.createPool(windowNumber, 190, value, 1)

        pool = await bet.getPoolValues(windowNumber);

        expect(pool[0]).to.equal(220);
        expect(pool[1]).to.equal(0);
        expect(pool[2]).to.equal(value);
        expect(pool[3]).to.equal(100);

    });

    it("Should not create the pool if pool exists", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");

        let bet = await BinaryBet.deploy(10, 30, 2);
        await bet.deployed();

        let windowNumber = 6
        let value = 10;
        let bet_block = 168;

        // function createPool (uint windowNumber, uint startingBlock, uint value, uint8 side) public {
        await bet.createPool(windowNumber, 160, value, 0);

        await expect(
            bet.createPool(windowNumber, 160, value, 0)
        ).to.be.revertedWith("pool already exists");

        await expect(
            bet.createPool(windowNumber, 160, 15, 1)
        ).to.be.revertedWith("pool already exists");

        await bet.createPool(7, 190, value, 1)

    });



    it("Should update the pool", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");

        let bet = await BinaryBet.deploy(10, 30, 2);
        await bet.deployed();

        const windowNumber = 7

        await bet.createPool(windowNumber, 190, 10, 1)

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
