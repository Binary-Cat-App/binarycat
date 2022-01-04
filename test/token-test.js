const { expect } = require("chai");
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const {deployMockContract} = require('@ethereum-waffle/mock-contract');
const { deployments, ethers } = require("hardhat");
const AGGREGATOR = require('../artifacts/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol/AggregatorV3Interface.json')

describe("Token",function () {

    const IDO_BALANCE = ethers.utils.parseEther("12500000")
    const INITIAL_BALANCE = ethers.utils.parseEther("100000000")
    const REMAINING_BALANCE = INITIAL_BALANCE.sub(IDO_BALANCE)

    beforeEach(async function () {
        [owner, ido, account2, account3, ...addrs] = await ethers.getSigners();
        provider = ethers.provider
        BinToken = await ethers.getContractFactory("BinToken");
        token = await BinToken.deploy(ido.address);

        lockDate = Date.now() + 100
        Lock = await ethers.getContractFactory("KittyTimeLock");
        lock = await Lock.deploy(token.address, owner.address, lockDate);
    });

    it("Should deploy correct balance", async function () {
        let ido_balance = await token.balanceOf(ido.address)
        let owner_balance = await token.balanceOf(owner.address)

        expect(ido_balance.toString()).to.equal(IDO_BALANCE)
        expect((owner_balance.add(ido_balance)).toString()).to.equal(INITIAL_BALANCE)
    });

    it("Should not allow release before date", async function () {
        await token.connect(owner).transfer(lock.address, REMAINING_BALANCE)
        await expect(
            lock.connect(owner).release()
      ).to.be.revertedWith("TokenTimelock: current time is before release time");


        await provider.send("evm_increaseTime", [
                Number(10),
            ]);
        await provider.send("evm_mine");

            balance = await token.balanceOf(lock.address)

        await expect(
            lock.connect(owner).release()
      ).to.be.revertedWith("TokenTimelock: current time is before release time");

    });

    it("Should release tokens to owner", async function () {
        await token.connect(owner).transfer(lock.address, REMAINING_BALANCE)
        let balance = await token.balanceOf(owner.address)

        await provider.send("evm_increaseTime", [
                Number(lockDate + 100000),
            ]);
        await provider.send("evm_mine");

        await lock.connect(owner).release()
        let finalBalance = await token.balanceOf(owner.address)

        expect((finalBalance.sub(balance)).toString()).to.equal(REMAINING_BALANCE.toString());
    });
});
