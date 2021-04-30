const { expect } = require("chai");
const {
    BN,           // Big Number support
    expectRevert,
} = require('@openzeppelin/test-helpers');

describe("BinaryBets Bet management", function () {
    it("Should get the correct bet result", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");

        const bet = await BinaryBet.deploy(30, 1);
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
        const bet = await BinaryBet.deploy(30, 1);
        await bet.deployed();
        let result = await bet.settleBet(78, 5, 1708, 1931, 0);
        result = result[0]
        value = new BN(9);
        expect(result).to.equal(9);

        result = await bet.settleBet(23, 29, 1116, 1912, 2);
        result = result[0]
        expect(result).to.equal(52);

        result = await bet.settleBet(8, 2, 1319, 1035, 1);
        result = result[0]
        expect(result).to.equal(14);

        result = await bet.settleBet(81, 12, 1912, 1725, 2);
        result = result[0]
        expect(result).to.equal(93);

        result = await bet.settleBet(7, 1, 1667, 1306, 2);
        result = result[0]
        expect(result).to.equal(8);

        result = await bet.settleBet(96, 36, 1175, 1230, 1);
        result = result[0]
        expect(result).to.equal(196);

        result = await bet.settleBet(81, 45, 1646, 1650, 2);
        result = result[0]
        expect(result).to.equal(126);

        result = await bet.settleBet(62, 96, 1831, 1907, 0);
        result = result[0]
        expect(result).to.equal(188);

        result = await bet.settleBet(60, 48, 1721, 1697, 2);
        result = result[0]
        expect(result).to.equal(108);

        result = await bet.settleBet(5, 33, 1280, 1029, 1);
        result = result[0]
        expect(result).to.equal(9);

        result = await bet.settleBet(10, 77, 1965, 1596, 1);
        result = result[0]
        expect(result).to.equal(18);

        result = await bet.settleBet(45, 59, 1199, 1854, 2);
        result = result[0]
        expect(result).to.equal(104);

        result = await bet.settleBet(72, 86, 1300, 1952, 2);
        result = result[0]
        expect(result).to.equal(158);

        result = await bet.settleBet(63, 38, 1556, 1582, 2);
        result = result[0]
        expect(result).to.equal(101);

        result = await bet.settleBet(4, 21, 1299, 1026, 0);
        result = result[0]
        expect(result).to.equal(47);

        result = await bet.settleBet(89, 5, 1853, 1904, 2);
        result = result[0]
        expect(result).to.equal(94);

        result = await bet.settleBet(4, 86, 1164, 1620, 1);
        result = result[0]
        expect(result).to.equal(9);

        result = await bet.settleBet(57, 63, 1806, 1114, 1);
        result = result[0]
        expect(result).to.equal(92);

        result = await bet.settleBet(13, 100, 1741, 1245, 2);
        result = result[0]
        expect(result).to.equal(113);

        result = await bet.settleBet(91, 68, 1972, 1092, 0);
        result = result[0]
        expect(result).to.equal(190);

        result = await bet.settleBet(31, 15, 1684, 1531, 2);
        result = result[0]
        expect(result).to.equal(46);

        result = await bet.settleBet(16, 25, 1046, 1645, 1);
        result = result[0]
        expect(result).to.equal(41);

        result = await bet.settleBet(1, 73, 1142, 1960, 1);
        result = result[0]
        expect(result).to.equal(2);

        result = await bet.settleBet(10, 33, 1837, 1996, 0);
        result = result[0]
        expect(result).to.equal(63);


        result = await bet.settleBet(47, 3, 1567, 1359, 0);
        result = result[0]
        expect(result).to.equal(6);

        result = await bet.settleBet(45, 46, 1123, 1437, 2);
        result = result[0]
        expect(result).to.equal(91);

        result = await bet.settleBet(53, 10, 1516, 1781, 0);
        result = result[0]
        expect(result).to.equal(18);

        result = await bet.settleBet(80, 0, 1929, 1416, 1);
        result = result[0]
        expect(result).to.equal(138);

        result = await bet.settleBet(39, 0, 1558, 1670, 2);
        result = result[0]
        expect(result).to.equal(39);

        result = await bet.settleBet(91, 0, 1904, 1562, 1);
        result = result[0]
        expect(result).to.equal(165);

        result = await bet.settleBet(70, 0, 1646, 1454, 0);
        result = result[0]
        expect(result).to.equal(0);

        result = await bet.settleBet(0, 0, 1844, 1448, 0);
        result = result[0]
        expect(result).to.equal(0);

        result = await bet.settleBet(0, 74, 1578, 1968, 2);
        result = result[0]
        expect(result).to.equal(74);

        result = await bet.settleBet(0, 61, 1554, 1078, 0);
        result = result[0]
        expect(result).to.equal(148);

        result = await bet.settleBet(0, 84, 1395, 1334, 0);
        result = result[0]
        expect(result).to.equal(171);

        result = await bet.settleBet(0, 84, 0, 1334, 1);
        result = result[1]
        expect(result).to.equal(84);

        result = await bet.settleBet(100, 0, 450, 0, 0);
        result = result[1]
        expect(result).to.equal(100);
    });
    
    it("Should bet with deposited funds", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");
        const BinaryStaking = await ethers.getContractFactory("BinaryStaking");
        const BinToken = await ethers.getContractFactory("BinToken");
        const [owner, account1] = await ethers.getSigners();

        const bet = await BinaryBet.deploy(30, 1);
        await bet.deployed();

        const token = await BinToken.deploy();
        await token.deployed();

        await bet.connect(account1).deposit({value:100});

        const stk = await BinaryStaking.deploy(token.address);
        await stk.deployed()

        let balance = await bet.getBalance(account1._address);
        expect(balance).to.equal(100);

        await bet.setStakingAddress(stk.address);
        await bet.connect(account1).placeBet(100, 0);
    });

    it("Should bet with sent funds", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");
        const BinaryStaking = await ethers.getContractFactory("BinaryStaking");
        const BinToken = await ethers.getContractFactory("BinToken");
        const [owner, account1] = await ethers.getSigners();

        const bet = await BinaryBet.deploy(30, 1);
        await bet.deployed();

        const token = await BinToken.deploy();
        await token.deployed();

        const stk = await BinaryStaking.deploy(token.address);
        await stk.deployed()

        await bet.setStakingAddress(stk.address);
        await bet.connect(account1).placeBet(100, 0, {value: 100});
    });

    it("Should revert without enough funds", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");
        const [owner, account1] = await ethers.getSigners();

        const bet = await BinaryBet.deploy(30, 1);
        await bet.deployed();
        await bet.connect(account1).deposit({value:100});

        await bet.connect(account1).placeBet(250, 0, {value: 100})
    });

    it("Should accumulate fees", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");
        const BinaryStaking = await ethers.getContractFactory("BinaryStaking");
        const BinToken = await ethers.getContractFactory("BinToken");

        const [owner, account1, account2, account3] = await ethers.getSigners();

        const bet = await BinaryBet.deploy(30, 1);
        await bet.deployed();
        const token = await BinToken.deploy();
        await token.deployed();

        const stk = await BinaryStaking.deploy(token.address);
        await stk.deployed()

        await bet.setStakingAddress(stk.address);
        await bet.connect(account1).placeBet(100, 0, {value: 100})
        let fee = await bet.accumulatedFees()
        expect(fee).to.equal(1);

        await bet.connect(account2).placeBet(200, 0, {value: 200})
        fee = await bet.accumulatedFees()
        expect(fee).to.equal(3);
        
        await bet.connect(account3).placeBet(500, 0, {value: 500})
        fee = await bet.accumulatedFees()
        expect(fee).to.equal(8);

    });

    it("Should update pool", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");
        const [owner, account1, account2, account3] = await ethers.getSigners();

        const bet = await BinaryBet.deploy(30, 0);
        await bet.deployed();
        await bet.connect(account1).placeBet(100, 0, {value: 100})
        let pool = await bet.getPoolValues(1)
        expect(pool[0]).to.equal(100);
        expect(pool[1]).to.equal(0);

        await bet.connect(account2).placeBet(200, 0, {value: 200})
        pool = await bet.getPoolValues(1)
        expect(pool[0]).to.equal(300);
        expect(pool[1]).to.equal(0);
        
        await bet.connect(account3).placeBet(500, 1, {value: 500})
        pool = await bet.getPoolValues(1)
        expect(pool[0]).to.equal(300);
        expect(pool[1]).to.equal(500);
    });

    it("Should update stake", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");
        const [owner, account1, account2, account3] = await ethers.getSigners();

        const bet = await BinaryBet.deploy(200, 0);
        await bet.deployed();
        await bet.connect(account1).placeBet(100, 0, {value: 100})
        let stake = await bet.getUserStake(1, account1._address)
        expect(stake[0]).to.equal(100);
        expect(stake[1]).to.equal(0);

        await bet.connect(account2).placeBet(200, 0, {value: 200})
        stake = await bet.getUserStake(1, account2._address)
        expect(stake[0]).to.equal(200);
        expect(stake[1]).to.equal(0);
        
        await bet.connect(account3).placeBet(500, 1, {value: 500})
        stake = await bet.getUserStake(1, account3._address)
        expect(stake[0]).to.equal(0);
        expect(stake[1]).to.equal(500);
    });

    it("Should update last betted window", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");
        const [owner, account1, account2, account3] = await ethers.getSigners();

        const bet = await BinaryBet.deploy(100, 0);
        await bet.deployed();
        await bet.connect(account1).placeBet(100, 0, {value: 100})
        let lastBet = await bet.userBets(account1._address, 0)
        expect(lastBet).to.equal(1);

    });

});
