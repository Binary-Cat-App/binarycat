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

    function share (value, total, share) {
        //console.log( (value.mul(share).div(total)).toString()  )
        return value.mul(share).div(total)
    }

    function payoff(upStake, downStake, poolUp, poolDown, betResult) {
        let US = new BN(upStake)
        let DS = new BN(downStake)
        let PU = new BN(poolUp)
        let PD = new BN(poolDown)
        let PT = PU.add(PD)
        let result = 0
        if (betResult === 1 & poolUp != 0) {result = share(PT, PU, US)}
        else if (betResult === 0 & poolDown !=0) {result = share(PT, PD, DS)}
        else if (betResult == 2) {return US.add(DS)}
        return result

    }

    it("Should get the correct bet payoff", async function () {
        const BinaryBet = await ethers.getContractFactory("BinaryBet");
        const bet = await BinaryBet.deploy(30, 1);
        await bet.deployed();

        let result = await bet.settleBet("78000000000000000000", "5000000000000000000", "1708000000000000000000", "1931000000000000000000", 0);
        result = result[0]
        let value = payoff("78000000000000000000", "5000000000000000000", "1708000000000000000000", "1931000000000000000000", 0).toString() 
        //expect(result.toString()).to.equal(value.toString());

        let US = ["78000000000000000000", "23000000000000000000", "8000000000000000000", "81000000000000000000", "7000000000000000000", "96000000000000000000", "81000000000000000000", "62000000000000000000", "60000000000000000000", "5000000000000000000", "10000000000000000000", "45000000000000000000", "72000000000000000000", "63000000000000000000", "4000000000000000000", "89000000000000000000", "4000000000000000000", "57000000000000000000", "13000000000000000000", "91000000000000000000", "31000000000000000000", "16000000000000000000", "1000000000000000000", "10000000000000000000", "47000000000000000000", "45000000000000000000", "53000000000000000000", "80000000000000000000", "39000000000000000000", "91000000000000000000", "70000000000000000000", "0000000000000000000", "0000000000000000000", "0000000000000000000", "0000000000000000000"]
        let DS = ["5000000000000000000", "29000000000000000000", "2000000000000000000", "12000000000000000000", "1000000000000000000", "36000000000000000000", "45000000000000000000", "96000000000000000000", "48000000000000000000", "33000000000000000000", "77000000000000000000", "59000000000000000000", "86000000000000000000", "38000000000000000000", "21000000000000000000", "5000000000000000000", "86000000000000000000", "63000000000000000000", "100000000000000000000", "68000000000000000000", "15000000000000000000", "25000000000000000000", "73000000000000000000", "33000000000000000000", "3000000000000000000", "46000000000000000000", "10000000000000000000", "0000000000000000000", "0000000000000000000", "0000000000000000000", "0000000000000000000", "0000000000000000000", "74000000000000000000", "61000000000000000000", "8000000000000000000","4000000000000000000"]
        let PU = ["1708000000000000000000", "1116000000000000000000", "1319000000000000000000", "1912000000000000000000", "1667000000000000000000", "1175000000000000000000", "1646000000000000000000", "1831000000000000000000", "1721000000000000000000", "1280000000000000000000", "1965000000000000000000", "1199000000000000000000", "1300000000000000000000", "1556000000000000000000", "1299000000000000000000", "1853000000000000000000", "1164000000000000000000", "1806000000000000000000", "1741000000000000000000", "1972000000000000000000", "1684000000000000000000", "1046000000000000000000", "1142000000000000000000", "1837000000000000000000", "1567000000000000000000", "1123000000000000000000", "1516000000000000000000", "1929000000000000000000", "1558000000000000000000", "1904000000000000000000", "1646000000000000000000", "1844000000000000000000", "1578000000000000000000", "1554000000000000000000", "139000000000000000000","5000000000000000000"]
        let PD = ["1931000000000000000000", "1912000000000000000000", "1035000000000000000000", "1725000000000000000000", "1306000000000000000000", "1230000000000000000000", "1650000000000000000000", "1907000000000000000000", "1697000000000000000000", "1029000000000000000000", "1596000000000000000000", "1854000000000000000000", "1952000000000000000000", "1582000000000000000000", "1026000000000000000000", "1904000000000000000000", "1620000000000000000000", "1114000000000000000000", "1245000000000000000000", "1092000000000000000000", "1531000000000000000000", "1645000000000000000000", "1960000000000000000000", "1996000000000000000000", "1359000000000000000000", "1437000000000000000000", "1781000000000000000000", "1416000000000000000000", "1670000000000000000000", "1562000000000000000000", "1454000000000000000000", "1448000000000000000000", "1968000000000000000000", "1078000000000000000000", "133000000000000000000","4000000000000000000"]
        let side = [0, 2, 1, 2, 2, 1, 2, 0, 2, 1, 1, 2, 2, 2, 0, 2, 1, 1, 2, 0, 2, 1, 1, 0, 0, 2, 0, 1, 2, 1, 0, 0, 2, 0, 1]

        for (let i = 0; i < US.length; i++) {
            let us = US[i]
            let ds = DS[i]
            let pd = PD[i]
            let pu = PU[i]
            let s = side[i]

            let value1 = payoff(us, ds, pu, pd, s).toString()
            let result1 = await bet.settleBet(us, ds, pu, pd, s)
            result1 = result1[0]
            //expect(result1.toString()).to.equal(value1.toString());
            console.log(value1, result1.toString(), "\n")
        }

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
