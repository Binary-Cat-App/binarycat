task("update_price", "Updates the price for the window if not yet updated", async function (
  taskArguments,
  hre,
) {
        const { deployments, ethers } = hre;
        const [signer] = await ethers.getSigners();
        let BinaryBet = await deployments.get("BinaryBet");

        let bet = await ethers.getContractAt(
            BinaryBet.abi,
            BinaryBet.address
        );

        let duration = await bet.windowDuration()
        let firstBlock = await bet.firstBlock()
        let firstWindow = await bet.firstWindow()
        let offset = await bet.windowOffset()
        let block = ethers.provider.getBlockNumber()
        let windowNumber = await bet.getWindowNumber(block, duration, firstBlock, offset, firstWindow);

        let price = await bet.windowPrice(windowNumber)
        if (price == 0) {
            await bet.connect(signer).updatePrice()
            let newPrice = await bet.windowPrice(windowNumber)
            console.log('price updated: ', newPrice.toString())
        }
        else {
            console.log('already updated')
        }
});

task("place_bet", "Place bet on platform")
  .addParam("side", "down: 0 | up: 1")
  .addParam("bet", "Value to bet in Matic")
  .addParam("value", "value to send with transaction in Matic")
  .setAction(async (taskArgs) => {
        const { deployments, ethers } = hre;
        const [signer] = await ethers.getSigners();
        let BinaryBet = await deployments.get("BinaryBet");

        let bet = await ethers.getContractAt(
            BinaryBet.abi,
            BinaryBet.address
        );
      let betValue = ethers.utils.parseEther(taskArgs.bet)
      let txValue = ethers.utils.parseEther(taskArgs.value)

      await bet.connect(signer).placeBet(betValue, taskArgs.side, {value: txValue})
  });

module.exports = {};


