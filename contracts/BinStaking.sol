pragma solidity ^0.8.0;
//import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BinToken.sol";
import "./libraries/WadRayMath.sol";

//SPDX-License-Identifier: UNLICENSED
contract BinaryStaking {
    using WadRayMath for uint256;
    IERC20 public binToken;

    address payable owner;
    struct StakingAccount {
        uint stakedBin; //WAD
        uint valueWhenLastReleased; //Global accumulated value of new_rewards/total_staked when user last got rewards (RAY/WAD). 
    }

    mapping(address => StakingAccount) stakingBalance;
    uint accumulatedRewards; //(per staked token) RAY/WAD

    event Staked(address indexed user, uint amount);
    event Unstaked(address indexed user, uint amount);

    constructor(address token) public {
        owner = payable(msg.sender);
        binToken = BinToken(token);
    }

    function receiveFunds() public payable {
        uint value = msg.value;
        if (binToken.balanceOf(address(this)) != 0) {
            accumulatedRewards = accumulatedRewards + value.wadToRay()/binToken.balanceOf(address(this)); //RAY/WAD
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
        stakingBalance[msg.sender].stakedBin = stakingBalance[msg.sender].stakedBin + amount;

        emit Staked(msg.sender, amount);
    }

    function unstake(uint amount) external {
        require(amount > 0, "Amount should be greater than 0");
        require(amount <= stakingBalance[msg.sender].stakedBin, "Cannot unstake more than balance");

        release(msg.sender);
        stakingBalance[msg.sender].stakedBin = stakingBalance[msg.sender].stakedBin - amount;

        binToken.transfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function release (address user) public {
        if (accumulatedRewards == 0){
            return;
        }
        uint amount = ownedDividends(user); //WAD
        accumulatedRewards = accumulatedRewards - amount.wadToRay()/binToken.balanceOf(address(this)); //RAY/WAD
        stakingBalance[user].valueWhenLastReleased = accumulatedRewards;                                                        
        
        payable(user).transfer(amount);
    }

    function ownedDividends(address user) public view returns(uint) {
        StakingAccount memory balance = stakingBalance[user];
        return balance.stakedBin.wadMul( (accumulatedRewards - balance.valueWhenLastReleased).rayToWad() );
    }

}

