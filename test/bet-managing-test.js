const { expect } = require("chai");
const {
    BN,           // Big Number support
} = require('@openzeppelin/test-helpers');

describe("BinaryBets Bet management", function () {
    it("Should get the correct bet result", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");

        const bet = await BinaryBet.deploy(10, 30, 1);
        await bet.deployed();

        // function betResult(uint referencePrice, uint settlementPrice) public pure returns(BetResult)

        let result = await bet.betResult(100, 110);
        expect(result).to.equal(1);

        result = await bet.betResult(100, 100);
        expect(result).to.equal(2);

        result = await bet.betResult(115, 710);
        expect(result).to.equal(1);

        result = await bet.betResult(155, 10);
        expect(result).to.equal(0);

        result = await bet.betResult(100, 85);
        expect(result).to.equal(0);

        result = await bet.betResult(10, 10);
        expect(result).to.equal(2);


        result = await bet.betResult(115, 110);
        expect(result).to.equal(0);

        result = await bet.betResult(175, 310);
        expect(result).to.equal(1);
    });

    it("Should get the correct bet payoff", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");
        const bet = await BinaryBet.deploy(10, 30, 1);
        await bet.deployed();
        // function settleBet(uint upStake, uint downStake, uint poolUp, uint poolDown, uint8 betResult) public pure returns (uint gain) 
        let result = await bet.settleBet(78, 5, 1708, 1931, 0);
        value = new BN(9);
        expect(result).to.equal(9);

        result = await bet.settleBet(23, 29, 1116, 1912, 2);
        expect(result).to.equal(52);

        result = await bet.settleBet(8, 2, 1319, 1035, 1);
        expect(result).to.equal(14);

        result = await bet.settleBet(81, 12, 1912, 1725, 2);
        expect(result).to.equal(93);

        result = await bet.settleBet(7, 1, 1667, 1306, 2);
        expect(result).to.equal(8);

        result = await bet.settleBet(96, 36, 1175, 1230, 1);
        expect(result).to.equal(196);

        result = await bet.settleBet(81, 45, 1646, 1650, 2);
        expect(result).to.equal(126);

        result = await bet.settleBet(62, 96, 1831, 1907, 0);
        expect(result).to.equal(188);

        result = await bet.settleBet(60, 48, 1721, 1697, 2);
        expect(result).to.equal(108);

        result = await bet.settleBet(5, 33, 1280, 1029, 1);
        expect(result).to.equal(9);

        result = await bet.settleBet(10, 77, 1965, 1596, 1);
        expect(result).to.equal(18);

        result = await bet.settleBet(45, 59, 1199, 1854, 2);
        expect(result).to.equal(104);

        result = await bet.settleBet(72, 86, 1300, 1952, 2);
        expect(result).to.equal(158);

        result = await bet.settleBet(63, 38, 1556, 1582, 2);
        expect(result).to.equal(101);

        result = await bet.settleBet(4, 21, 1299, 1026, 0);
        expect(result).to.equal(47);

        result = await bet.settleBet(89, 5, 1853, 1904, 2);
        expect(result).to.equal(94);

        result = await bet.settleBet(4, 86, 1164, 1620, 1);
        expect(result).to.equal(9);

        result = await bet.settleBet(57, 63, 1806, 1114, 1);
        expect(result).to.equal(92);

        result = await bet.settleBet(13, 100, 1741, 1245, 2);
        expect(result).to.equal(113);

        result = await bet.settleBet(91, 68, 1972, 1092, 0);
        expect(result).to.equal(190);

        result = await bet.settleBet(31, 15, 1684, 1531, 2);
        expect(result).to.equal(46);

        result = await bet.settleBet(16, 25, 1046, 1645, 1);
        expect(result).to.equal(41);

        result = await bet.settleBet(1, 73, 1142, 1960, 1);
        expect(result).to.equal(2);

        result = await bet.settleBet(10, 33, 1837, 1996, 0);
        expect(result).to.equal(63);


        result = await bet.settleBet(47, 3, 1567, 1359, 0);
        expect(result).to.equal(6);

        result = await bet.settleBet(45, 46, 1123, 1437, 2);
        expect(result).to.equal(91);

        result = await bet.settleBet(53, 10, 1516, 1781, 0);
        expect(result).to.equal(18);

        result = await bet.settleBet(80, 0, 1929, 1416, 1);
        expect(result).to.equal(138);

        result = await bet.settleBet(39, 0, 1558, 1670, 2);
        expect(result).to.equal(39);

        result = await bet.settleBet(91, 0, 1904, 1562, 1);
        expect(result).to.equal(165);

        result = await bet.settleBet(70, 0, 1646, 1454, 0);
        expect(result).to.equal(0);

        result = await bet.settleBet(0, 0, 1844, 1448, 0);
        expect(result).to.equal(0);

        result = await bet.settleBet(0, 74, 1578, 1968, 2);
        expect(result).to.equal(74);

        result = await bet.settleBet(0, 61, 1554, 1078, 0);
        expect(result).to.equal(148);

        result = await bet.settleBet(0, 84, 1395, 1334, 0);
        expect(result).to.equal(171);



    });

});
