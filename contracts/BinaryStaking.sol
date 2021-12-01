// Copyright 2021 Binary Cat Ltd.

// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./BinToken.sol";

contract BinaryStaking is ERC20 {
    string public constant NAME = "Staked KITTY";
    string public constant SYMBOL = "sKITTY";
    uint8 public constant DECIMALS = 18;

    IERC20 public binToken;

    uint256 internal constant PRECISION_CONSTANT = 1e27;
    address payable owner;

    mapping(address => uint256) public valueWhenLastReleased;
    uint256 public accumulatedRewards; //(per staked token)

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event Release(address indexed user, uint256 amount);
    event Reward(uint256 amount);

    constructor(address token) ERC20(NAME, SYMBOL){
        owner = payable(msg.sender);
        binToken = BinToken(token);
    }

    function receiveFunds() public payable {
        uint256 value = msg.value;
        if (totalSupply() != 0) {
            accumulatedRewards =
                accumulatedRewards +
                (value * PRECISION_CONSTANT) /
                totalSupply();
        } else {
            owner.transfer(value);
        }
        emit Reward(value);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Amount should be greater than 0");
        release(msg.sender);
        require(binToken.transferFrom(msg.sender, address(this), amount));
        _mint(msg.sender, amount);
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(amount > 0, "Amount should be greater than 0");
        require(
            amount <= balanceOf(msg.sender),
            "Cannot unstake more than balance"
        );

        release(msg.sender);
        _burn(msg.sender, amount);

        binToken.transfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function release(address user) public {
        if (accumulatedRewards == 0) {
            return;
        }
        uint256 amount = ownedDividends(user);
        valueWhenLastReleased[user] = accumulatedRewards;

        if (amount > 0) {
            payable(user).transfer(amount);
            emit Release(user, amount);
        }
    }

    function ownedDividends(address user) public view returns (uint256) {
        return
            (balanceOf(user) *
                (accumulatedRewards - valueWhenLastReleased[user])) /
            PRECISION_CONSTANT;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal virtual override 
    {
        super._beforeTokenTransfer(from, to, amount);
        release(from);
        release(to);
    }
}
