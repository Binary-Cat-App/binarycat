pragma solidity ^0.6.8;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BinToken.sol";

//SPDX-License-Identifier: UNLICENSED
contract BinaryBet {
    using SafeMath for uint256;
    IERC20 public binToken;

    event Staked(address user, uint amount);
    event Unstaked(address user, uint amount);
    struct StakingAccount {
        uint stakedBin;
        uint lastReleased; //Global acummulated value of new_rewards/total_staked when user last got rewards. 
    }

    mapping(address => StakingAccount) stakingBalance;
    uint accumulatedRewards; //(per staked token)

    constructor(address token) public {
        binToken = BinToken(token);
    }

    function receiveFunds () public payable {
        uint value = msg.value;
        accumulatedRewards = accumulatedRewards.add(value.div(binToken.balanceOf(address(this))));
    }

    function stake(uint amount) external{
        require(amount > 0);
        uint allowance = binToken.allowance(msg.sender, address(this));
        require(allowance >= amount);

        release(msg.sender);

        binToken.transferFrom(msg.sender, address(this), amount);
        stakingBalance[msg.sender].stakedBin = stakingBalance[msg.sender].stakedBin.add(amount);
        stakingBalance[msg.sender].lastReleased = accumulatedRewards;

        emit Staked(msg.sender, amount);
    }

    function unstake(uint amount) external {
        require(amount > 0);
        require(amount <= stakingBalance[msg.sender].stakedBin);

        stakingBalance[msg.sender].stakedBin = stakingBalance[msg.sender].stakedBin.sub(amount);

        release(msg.sender);

        binToken.transfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function release (address user) public {
        StakingAccount storage balance = stakingBalance[user];
        uint amount = (accumulatedRewards.sub(balance.lastReleased)).mul(balance.stakedBin);
        
        accumulatedRewards = accumulatedRewards.sub(amount.div( binToken.balanceOf(address(this))));
        balance.lastReleased = accumulatedRewards;                                                        
        
        payable(user).transfer(amount);
        
    }

}

