task("user:bets", "Get user bets in window")
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
        let BinaryBet = await deployments.get("BinaryBet");

        let user = taskArgs.user
        if (typeof user == 'undefined') {
            const [signer] = await ethers.getSigners();
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

task("user:deposit", "Deposits Matic")
  .addPositionalParam(
    "amount", 
    "Amount to deposit",
  )
  .setAction(async (taskArgs) => {
        const { deployments, ethers } = hre;
        const [signer] = await ethers.getSigners();

        let BinaryBet = await deployments.get("BinaryBet");
        let bet = await ethers.getContractAt(
            BinaryBet.abi,
            BinaryBet.address
        );

        let value = ethers.utils.parseEther(taskArgs.amount)
        await bet.connect(signer).deposit({value: value})
        console.log("Deposited %s Matic", taskArgs.amount)
  });

task("user:withdraw", "Withdraw Matic")
  .addPositionalParam(
    "amount", 
    "Amount to withdraw",
  )
  .setAction(async (taskArgs) => {
        const { deployments, ethers } = hre;
        const [signer] = await ethers.getSigners();

        let BinaryBet = await deployments.get("BinaryBet");
        let bet = await ethers.getContractAt(
            BinaryBet.abi,
            BinaryBet.address
        );

        let value = ethers.utils.parseEther(taskArgs.amount)
        await bet.connect(signer).withdraw(value)
        console.log("Withdrew %s Matic", taskArgs.amount)
  });

task("user:balance", "Prints user balance")
  .addOptionalParam(
    "user", 
    "Address of the user"
  )
  .setAction(async (taskArgs) => {
        const { deployments, ethers } = hre;

        let user = taskArgs.user
        if (typeof user == 'undefined') {
            const [signer] = await ethers.getSigners();
            user = await signer.getAddress(); 
        }

        let BinaryBet = await deployments.get("BinaryBet");
        let bet = await ethers.getContractAt(
            BinaryBet.abi,
            BinaryBet.address
        );

        let balance = await bet.balance(user)
        console.log("Balance: %s Matic", ethers.utils.formatEther(balance))
  });


task("user:update", "Updates user balance in chain")
  .addOptionalParam(
    "user", 
    "Address of the user"
  )
  .setAction(async (taskArgs) => {
        const { deployments, ethers } = hre;
        const [signer] = await ethers.getSigners();

        let user = taskArgs.user
        if (typeof user == 'undefined') {
            user = await signer.getAddress(); 
        }

        let BinaryBet = await deployments.get("BinaryBet");
        let bet = await ethers.getContractAt(
            BinaryBet.abi,
            BinaryBet.address
        );
      await bet.connect(signer).updateBalance(user)
  });
module.exports = {};
