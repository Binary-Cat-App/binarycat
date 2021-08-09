const { expect } = require("chai");
const { BN, expectEvent, expectRevert, time, balance } = require('@openzeppelin/test-helpers');

describe("Staking",function () {
    beforeEach(async function () {
        provider = ethers.provider;
        BinaryBet = await ethers.getContractFactory("BinaryBet");
        BinaryStaking = await ethers.getContractFactory("BinaryStaking");
        BinToken = await ethers.getContractFactory("BinToken");

        [owner, account1, account2, account3, ...addrs] = await ethers.getSigners();
        bet = await BinaryBet.deploy(30, 1);
        token = await BinToken.deploy();
        stk = await BinaryStaking.deploy(token.address);
        await bet.setStakingAddress(stk.address);

        await token.connect(owner).transfer(account1.address, ethers.utils.parseEther("1000"));
        await token.connect(owner).transfer(account2.address, ethers.utils.parseEther("1000"));
        await token.connect(owner).transfer(account3.address, ethers.utils.parseEther("1000"));
    });

    it("Should transfer fee to owner if no stakers", async function () {
        let balance0 = await provider.getBalance(owner.address);

        await stk.connect(account1).receiveFunds({value: 1000})
        let balance1 = await provider.getBalance(owner.address);
        let result = balance1.sub(balance0)  
        expect(result.toString()).to.equal("1000");

        await stk.connect(account1).receiveFunds({value: 3000})
        let balance2 = await provider.getBalance(owner.address);
        result = balance2.sub(balance1)  
        expect(result.toString()).to.equal("3000");

        await stk.connect(account1).receiveFunds({value: 1592})
        balance3 = await provider.getBalance(owner.address);
        result = balance3.sub(balance2)  
        expect(result.toString()).to.equal("1592");

        await stk.connect(account1).receiveFunds({value: 4216421461})
        let balance4 = await provider.getBalance(owner.address);
        result = balance4.sub(balance3)  
        expect(result.toString()).to.equal("4216421461");
    });

    it("Should update the staked balance on stake", async function () {
        let value = ethers.utils.parseEther("100")
        await token.connect(account1).approve(stk.address, value)
        await stk.connect(account1).stake(value)
        let stk_account = await stk.stakingBalance(account1.address);
        expect(stk_account.stakedBin.toString()).to.equal(value)

        value = ethers.utils.parseEther("14.5")
        await token.connect(account2).approve(stk.address, value)
        await stk.connect(account2).stake(value)
        stk_account = await stk.stakingBalance(account2.address);
        expect(stk_account.stakedBin.toString()).to.equal(value)
    });

    it("Should update staked balance on unstake", async function () {
        let stakedValue = ethers.utils.parseEther("14.5")
        await token.connect(account2).approve(stk.address, stakedValue)
        await stk.connect(account2).stake(stakedValue)
        stk_account0 = await stk.stakingBalance(account2.address);

        let unstakedValue = ethers.utils.parseEther("6.46")
        await stk.connect(account2).unstake(unstakedValue)
        stk_account1 = await stk.stakingBalance(account2.address);
        let result = stk_account0.stakedBin.sub(stk_account1.stakedBin)
        expect(result.toString()).to.equal(unstakedValue)

        unstakedValue = ethers.utils.parseEther("8.6")
        await expect(
            stk.connect(account2).unstake(unstakedValue)
      ).to.be.revertedWith("Cannot unstake more than balance");

    });

    function toWad (x) {
        return Math.floor(Math.pow(10, 27)*x)
    }
    it("Should update accumulated rewards and contract balance", async function () {
        let stakedValue = ethers.utils.parseEther("14.5")
        await token.connect(account1).approve(stk.address, stakedValue)
        await stk.connect(account1).stake(stakedValue)

        await stk.connect(owner).receiveFunds({value: 1510})
        let expectedBalance = 1510;
        let balance = await provider.getBalance(stk.address);
        expect(balance.toString()).to.equal(expectedBalance.toString())

        let expected = toWad(1510/stakedValue)
        let result = await stk.accumulatedRewards()
        expect(result.toString()).to.equal(expected.toString())

        stakedValue2 = ethers.utils.parseEther("20.23")
        await token.connect(account2).approve(stk.address, stakedValue2)
        await stk.connect(account2).stake(stakedValue2)
        await stk.connect(owner).receiveFunds({value: 2312})

        result = await stk.accumulatedRewards()
        expected = toWad(1510/stakedValue + 2312/stakedValue2)

        expectedBalance = 1510 + 2312
        balance = await provider.getBalance(stk.address);
        expect(balance.toString()).to.equal(expectedBalance.toString())

    });

    it("Should calculate dividends for one staker", async function () {
        let initialBalance = await provider.getBalance(account1.address) 
        let stakedValue = ethers.utils.parseEther("14.5")
        await token.connect(account1).approve(stk.address, stakedValue, {gasPrice: 0})
        await stk.connect(account1).stake(stakedValue,{gasPrice: 0})

        let divValue1 = 1510
        await stk.connect(owner).receiveFunds({value: divValue1})
        let dividends = await stk.ownedDividends(account1.address)
        expect(dividends -  divValue1).to.be.below(1);

        
        stakedValue = ethers.utils.parseEther("13.2")
        await token.connect(account1).approve(stk.address, stakedValue, {gasPrice: 0})
        await stk.connect(account1).stake(stakedValue, {gasPrice: 0})
        dividends = await stk.ownedDividends(account1.address)
        expect(dividends.toString()).to.equal("0")
        bal = await provider.getBalance(account1.address)

        let divValue2 = 3302
        await stk.connect(owner).receiveFunds({value: divValue2})
        let divValue3 = 39102
        await stk.connect(owner).receiveFunds({value: divValue3})

        dividends = await stk.ownedDividends(account1.address)
        expect(dividends -  divValue2 - divValue3).to.be.below(1);
        await stk.connect(account1).release({gasPrice: 0})
        dividends = await stk.ownedDividends(account1.address)
        expect(dividends.toString()).to.equal("0")
        bal = await provider.getBalance(account1.address)

        let finalBalance = await provider.getBalance(account1.address) 
        let deltaBalance = finalBalance.sub(initialBalance);
        expect(deltaBalance - (divValue1 + divValue2 + divValue3)).to.be.below(1);
    });

    it("Should split dividends independent of release time", async function () {
        let divArray = Array.from({length: 40}, () => Math.floor(Math.random() * 1000000 + 10000000000000));
        let divSum = divArray.reduce((a, b) => a + b, 0);
        let initialBalance1 = await provider.getBalance(account1.address) 
        let initialBalance2 = await provider.getBalance(account2.address) 

        
        let stakedValue = ethers.utils.parseEther("14.5")
        await token.connect(account1).approve(stk.address, stakedValue, {gasPrice: 0})
        await stk.connect(account1).stake(stakedValue,{gasPrice: 0})
        await token.connect(account2).approve(stk.address, stakedValue, {gasPrice: 0})
        await stk.connect(account2).stake(stakedValue,{gasPrice: 0})

        for(i=0; i<= divArray.length; i++) {
            let divValue = divArray[i]
            await stk.connect(owner).receiveFunds({value: divValue})
            //await stk.connect(account2).release({gasPrice: 0 })
        }

        ownedDiv1 = await stk.ownedDividends(account1.address);
        ownedDiv2 = await stk.ownedDividends(account2.address);
        expect(ownedDiv1.toString()).to.equal(ownedDiv2.toString())
        expect(ownedDiv1 - Math.floor(divSum/2)).to.be.below(1);
        expect(ownedDiv2 - Math.floor(divSum/2)).to.be.below(1);
    });

});
