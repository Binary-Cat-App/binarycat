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
import "./BinToken.sol";
import "./BinaryBet.sol";
import "./BetLibrary.sol";
import "hardhat/console.sol";

contract KittyPool {
    address public immutable BURN_ADDRESS;
    BinaryBet binarybet;

    mapping(address => BetLibrary.User) user;
    mapping(uint256 => BetLibrary.Pool) public pools; //windowNumber => Pool

    uint immutable fee;
    uint256 public immutable maxBurn;
    BinToken token;

    constructor(
        uint256 _fee,
        uint _maxBurn,
        address tokenContract,
        address binarybetContract,
        address burnAddress
    ) {
        require(_fee <= 100);
        fee = _fee;
        maxBurn = _maxBurn * 1e18;
        token = BinToken(tokenContract);
        binarybet = BinaryBet(binarybetContract);
        BURN_ADDRESS = burnAddress;
    }

    function placeBet(uint8 side, uint value) external payable {
        require(value > 0, "Only strictly positive values");
        binarybet.updatePrice();
        updateBalance(msg.sender);

        token.transferFrom(msg.sender, address(this), value);
        uint256 windowNumber = BetLibrary.getWindowNumber(
            block.timestamp,
            binarybet.windowDuration(),
            binarybet.deployTimestamp()
        );


        BetLibrary.User storage sender = user[msg.sender];
        if (sender.bets.length == 0 ||
            windowNumber != sender.bets[sender.bets.length - 1]) {
            /*
               Only adds to the list if its the first user bet on the window.
               If length is zero, the code only evaluates the first condition,
               avoiding the possible underflow length - 1.
            */
            sender.bets.push(windowNumber);
        }

        //Update the user stake and pool for the window.
        if (BetLibrary.BetSide(side) == BetLibrary.BetSide.up) {
            sender.stake[windowNumber].upValue += value;
            pools[windowNumber].upValue += value;
        }
        else {
            sender.stake[windowNumber].downValue += value;
            pools[windowNumber].downValue += value;
        }

        emit BetLibrary.NewBet(msg.sender, windowNumber, value, side);
    }

    function updateBalance(address _user) public{
        BetLibrary.User storage userData = user[_user];
        if (userData.bets.length == 0) {
            //No bets to settle
            return;
        }

        uint256 totalGain = 0;
        uint256 accumulatedFees = 0;
        for (uint256 i = userData.bets.length; i > 0; i--) {
            /*Maximum number of itens in list is 2, when the user bets
              on 2 subsequent windows and the first window is not yet settled.
            */
            uint256 window = userData.bets[i - 1];
            uint256 currentWindow = BetLibrary.getWindowNumber(
                block.timestamp,
                binarybet.windowDuration(),
                binarybet.deployTimestamp()
            );
            (
                uint256 referencePrice,
                uint256 settlementPrice
            ) = binarybet.getWindowBetPrices(window);

            BetLibrary.WindowStatus status = BetLibrary.windowStatus(
                window,
                currentWindow,
                referencePrice,
                settlementPrice
            );
            if (
                status == BetLibrary.WindowStatus.notFinalized ||
                status == BetLibrary.WindowStatus.waitingPrice
            ) {
                continue;
            }

            uint8 result;
            if (status == BetLibrary.WindowStatus.finalized) {
                result = BetLibrary.betResultBinary(referencePrice, settlementPrice);
            } else if (status == BetLibrary.WindowStatus.failedUpdate) {
                result = 2;
            }

            //Remove window from list of unsettled bets.
            userData.bets[i - 1] = userData.bets[
                userData.bets.length - 1
            ];
            userData.bets.pop();

            BetLibrary.Pool memory stake = userData.stake[window];
            BetLibrary.Pool memory pool = pools[window];
            (uint256 windowGain, uint256 fees) = settleBet(
                stake.upValue,
                stake.downValue,
                pool.upValue,
                pool.downValue,
                result
            );

            totalGain += windowGain;
            accumulatedFees += fees;

            emit BetLibrary.BetSettled(window, _user, windowGain);
        }


        if (totalGain > 0) {
            token.transfer(_user, totalGain);
        }

        if (accumulatedFees > 0) {
            if (token.balanceOf(address(binarybet)) > 0) {
                token.transfer(BURN_ADDRESS, accumulatedFees);
            }
            else {
                token.transfer(address(binarybet), accumulatedFees);
            }
        }
    }

    function settleBet(
        uint256 upStake,
        uint256 downStake,
        uint256 poolUp,
        uint256 poolDown,
        uint8 res
    ) public view returns (uint256 gain, uint256 fees) {
        BetLibrary.BetResult result = BetLibrary.BetResult(res);
        uint256 poolTotal = poolUp + poolDown;
        uint256 value;
        if (result == BetLibrary.BetResult.up && poolUp != 0) {
            //(upStake/poolUp)*poolTotal
            value = BetLibrary.sharePool(poolTotal, upStake, poolUp);
            fees = BetLibrary.computeFeeCapped(value, fee, maxBurn);
            gain = value - fees;
        } else if (result == BetLibrary.BetResult.down && poolDown != 0) {
            //(downStake/poolDown)*poolTotal
            value = BetLibrary.sharePool(poolTotal, downStake, poolDown);
            fees = BetLibrary.computeFeeCapped(value, fee, maxBurn);
            gain = value - fees;
        } else if (result == BetLibrary.BetResult.tie) {
            gain = upStake + downStake;
        } else {
            //If the winning pool is empty, all stake goes to the fees.
            gain = 0;
            fees = upStake + downStake;
        }
    }

    function getPoolValues(uint256 windowNumber)
        public
        view
        returns (uint256, uint256)
    {
        BetLibrary.Pool memory pool = pools[windowNumber];
        return (pool.downValue, pool.upValue);
    }

    function getUserStake(uint256 windowNumber, address _user)
        public
        view
        returns (uint256, uint256)
    {
        BetLibrary.Pool memory stake = user[_user].stake[windowNumber];
        return (stake.downValue, stake.upValue);
    }

    function getUserBetList(address _user, uint256 index)
        public
        view
        returns (uint256)
    {
        return user[_user].bets[index];
    }

    function betListLen(address _user) public view returns (uint256) {
        return user[_user].bets.length;
    }


}
