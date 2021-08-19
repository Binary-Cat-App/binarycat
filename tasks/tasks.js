task("update_price", "Updates the price for the window if not yet updated", async function (
  taskArguments,
  hre,
) {
        const { deployments, ethers } = hre;
        const [signer] = await ethers.getSigners();
        let BinaryBet = await deployments.get("BinaryBet");
        let windowNumber = await hre.run("current_window")

        let bet = await ethers.getContractAt(
            BinaryBet.abi,
            BinaryBet.address
        );

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
      console.log("Betted %s Matic in %s", taskArgs.bet, taskArgs.side == "1"? "up":"down" )
  });

task("current_window", "Gets current betting window", async function (
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
        console.log('Current window number:', windowNumber.toString())
        return windowNumber

});

task("mine", "Mine KITTY tokens by betting in both sides each window")
  .addParam("bet", "Value to bet in each side")
  .addParam("value", "value to send with transaction for each side")
  .addParam("timeout", "time in miliseconds between checks")
  .addOptionalParam(
    "onlyfirst", 
    "If true, only bets if the price for the window has no price yet ",
    false,
    types.boolean
  )
  .setAction(async (taskArgs) => {
        const { deployments, ethers } = hre;
        const [signer] = await ethers.getSigners();
        let BinaryBet = await deployments.get("BinaryBet");

        let bet = await ethers.getContractAt(
            BinaryBet.abi,
            BinaryBet.address
        );

      while (true) {
        await new Promise(r => setTimeout(r, taskArgs.timeout));
        let windowNumber = await hre.run("current_window")
        let price = await bet.windowPrice(windowNumber)

        if (price.toString() != "0" && taskArgs.onlyfirst) {
            console.log("Price already updated and --onlyFirst flag activated")
            continue;
        }

        let betValue = ethers.utils.parseEther(taskArgs.bet)

        let stake = await hre.run('user_stake')
        let stakeDown = stake[0]
        let stakeUp = stake[1]

        if (betValue >= stakeUp) {
            await hre.run("place_bet", {side: '1', bet:  ethers.utils.formatEther(betValue.sub(stakeUp)), value: taskArgs.value} )
        }

        if (betValue >= stakeDown) {
            await hre.run("place_bet", {side: '0', bet: ethers.utils.formatEther(betValue.sub(stakeDown)), value: taskArgs.value} )
        }

      }
  });

task("user_stake", "Get user stake in window")
  .addOptionalParam(
    "user", 
    "Address of the user"
  )
  .addOptionalParam(
    "window", 
    "Betting window"
  )
  .setAction(async (taskArgs) => {
        const { deployments, ethers } = hre;
        const [signer] = await ethers.getSigners();
        let BinaryBet = await deployments.get("BinaryBet");

        let user = taskArgs.user
        if (typeof user == 'undefined') {
            user = await signer.getAddress(); 
        }

        let window = taskArgs.window
        if (typeof window == 'undefined') {
            window = await hre.run("current_window"); 
        }

        let bet = await ethers.getContractAt(
            BinaryBet.abi,
            BinaryBet.address
        );
        stake = await bet.getUserStake(window, user)
        console.log("user %s", user)
        console.log("Stake down: %s Matic", ethers.utils.formatEther(stake[0]))
        console.log("Stake up: %s Matic", ethers.utils.formatEther(stake[1]))
        return stake;
  });

task("pool_size", "Get window pool size")
  .addOptionalParam(
    "window", 
    "Betting window"
  )
  .setAction(async (taskArgs) => {
        const { deployments, ethers } = hre;
        const [signer] = await ethers.getSigners();
        let BinaryBet = await deployments.get("BinaryBet");

        let window = taskArgs.window
        if (typeof window == 'undefined') {
            window = await hre.run("current_window"); 
        }

        let bet = await ethers.getContractAt(
            BinaryBet.abi,
            BinaryBet.address
        );
        pool = await bet.getPoolValues(window)
        console.log("Pool down: %s Matic", ethers.utils.formatEther(pool[0]))
        console.log("Pool up: %s Matic", ethers.utils.formatEther(pool[1]))
        return pool;
  });

task("kitty_balance", "Get KITTY balance")
  .addOptionalParam(
    "user", 
    "Address of the user"
  )
  .setAction(async (taskArgs) => {
        const { deployments, ethers } = hre;
        const [signer] = await ethers.getSigners();
        let BinToken = await deployments.get("BinToken");

        let user = taskArgs.user
        if (typeof user == 'undefined') {
            user = await signer.getAddress(); 
        }

        let token = await ethers.getContractAt(
            BinToken.abi,
            BinToken.address
        );
        let balance = await token.balanceOf(user)
        console.log("user %s", user)
        console.log("User balance: %s KITTY", ethers.utils.formatEther(balance))
  });

module.exports = {};


