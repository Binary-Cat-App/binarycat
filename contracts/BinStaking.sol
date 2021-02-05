pragma solidity ^0.6.8;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BinToken.sol";

//SPDX-License-Identifier: UNLICENSED
contract BinaryStaking {
    using SafeMath for uint256;
    IERC20 public binToken;

    address payable owner;
    uint MUL_CONST = 1000;
    event Staked(address user, uint amount);
    event Unstaked(address user, uint amount);
    struct StakingAccount {
        uint stakedBin;
        uint lastReleased; //Global acummulated value of new_rewards/total_staked when user last got rewards. 
    }

    mapping(address => StakingAccount) stakingBalance;
    uint accumulatedRewards; //(per staked token)

    constructor(address token) public {
        owner = msg.sender;
        binToken = BinToken(token);
    }

    function receiveFunds() public payable {
        uint value = msg.value;
        if (binToken.balanceOf(address(this)) != 0) {
            accumulatedRewards = accumulatedRewards.add(value.div(binToken.balanceOf(address(this))).mul(MUL_CONST));
        }
        else {
            owner.transfer(value);
        }
    }

    function stake(uint amount) external{
        require(amount > 0);
        uint allowance = binToken.allowance(msg.sender, address(this));
        require(allowance >= amount);

        if (stakingBalance[msg.sender].stakedBin != 0) {
            release(msg.sender);
        }

        binToken.transferFrom(msg.sender, address(this), amount);
        stakingBalance[msg.sender].stakedBin = stakingBalance[msg.sender].stakedBin.add(amount);
        stakingBalance[msg.sender].lastReleased = accumulatedRewards;

        emit Staked(msg.sender, amount);
    }

    function unstake(uint amount) external {
        require(amount > 0);
        require(amount <= stakingBalance[msg.sender].stakedBin);

        release(msg.sender);
        stakingBalance[msg.sender].stakedBin = stakingBalance[msg.sender].stakedBin.sub(amount);

        binToken.transfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function release (address user) public {
        if (accumulatedRewards == 0){
            return;
        }
        StakingAccount storage balance = stakingBalance[user];
        uint amount = (accumulatedRewards.sub(balance.lastReleased)).mul(balance.stakedBin).div(MUL_CONST);
        
        accumulatedRewards = accumulatedRewards.sub(amount.div( binToken.balanceOf(address(this))));
        balance.lastReleased = accumulatedRewards;                                                        
        
        payable(user).transfer(amount);
        
    }

}

