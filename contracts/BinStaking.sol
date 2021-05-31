pragma solidity ^0.6.8;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BinToken.sol";

//SPDX-License-Identifier: UNLICENSED
contract BinaryStaking {
    using SafeMath for uint256;
    IERC20 public binToken;

    address payable owner;
    uint constant MUL_CONST = 1000;
    struct StakingAccount {
        uint stakedBin;
        uint valueWhenLastReleased; //Global accumulated value of new_rewards/total_staked when user last got rewards. 
    }

    mapping(address => StakingAccount) stakingBalance;
    uint accumulatedRewards; //(per staked token)

    event Staked(address indexed user, uint amount);
    event Unstaked(address indexed user, uint amount);

    constructor(address token) public {
        owner = msg.sender;
        binToken = BinToken(token);
    }

    function receiveFunds() public payable {
        uint value = msg.value;
        if (binToken.balanceOf(address(this)) != 0) {
            accumulatedRewards = accumulatedRewards.add(value.mul(MUL_CONST).div(binToken.balanceOf(address(this))));
        }
        else {
            owner.transfer(value);
        }
    }

    function stake(uint amount) external{
        require(amount > 0, "Amount should be greater than 0");
        if (stakingBalance[msg.sender].stakedBin != 0) {
            release(msg.sender);
        }

        binToken.transferFrom(msg.sender, address(this), amount);
        stakingBalance[msg.sender].stakedBin = stakingBalance[msg.sender].stakedBin.add(amount);

        emit Staked(msg.sender, amount);
    }

    function unstake(uint amount) external {
        require(amount > 0, "Amount should be greater than 0");
        require(amount <= stakingBalance[msg.sender].stakedBin, "Cannot unstake more than balance");

        release(msg.sender);
        stakingBalance[msg.sender].stakedBin = stakingBalance[msg.sender].stakedBin.sub(amount);

        binToken.transfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function release (address user) public {
        if (accumulatedRewards == 0){
            return;
        }
        uint amount = ownedDividends(user);
        accumulatedRewards = accumulatedRewards.sub(amount.mul(MUL_CONST).div( binToken.balanceOf(address(this))));
        stakingBalance[user].valueWhenLastReleased = accumulatedRewards;                                                        
        
        payable(user).transfer(amount);
    }

    function ownedDividends(address user) public view returns(uint) {
        StakingAccount memory balance = stakingBalance[user];
        return ((accumulatedRewards.sub(balance.valueWhenLastReleased)).mul(balance.stakedBin)).div(MUL_CONST);
    }

}

