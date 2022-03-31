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
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./BetLibrary.sol";
import "./BinToken.sol";

contract DailyPool {
    AggregatorV3Interface internal priceFeed;
    BinToken immutable token;

    mapping(address => BetLibrary.User) user;
    mapping(uint256 => BetLibrary.Pool) public pools; //windowNumber => Pool

    uint public windowDuration;
    uint public deployTimestamp;

    mapping(uint => uint) public windowPrice;

    //EVENTS
    event NewBet(
        address indexed user,
        uint256 indexed windowNumber,
        uint256 value,
        uint8 side
    );
    event BetSettled(
        uint256 indexed windowNumber,
        address indexed user,
        uint256 gain
    );
    event PriceUpdated(uint256 indexed windowNumber, uint256 price);

    constructor(
        uint _windowDuration,
        address tokenContract,
        address aggregator
    ) {
        priceFeed = AggregatorV3Interface(aggregator);
        token = BinToken(tokenContract);
        windowDuration = _windowDuration;
        deployTimestamp = block.timestamp;
    }

    function placeBet(uint8 side, uint value) external payable {
        require(value > 0, "Only strictly positive values");
        updatePrice();
        updateBalance(msg.sender);

        token.transferFrom(msg.sender, address(this), value);
        uint256 windowNumber = BetLibrary.getWindowNumber(
            block.timestamp,
            windowDuration,
            deployTimestamp);


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

        emit NewBet(msg.sender, windowNumber, value, side);
    }

    function updateBalance(address _user) public{
        BetLibrary.User storage userData = user[_user];
        if (userData.bets.length == 0) {
            //No bets to settle
            return;
        }

        uint256 totalGain = 0;
        for (uint256 i = userData.bets.length; i > 0; i--) {
            /*Maximum number of itens in list is 2, when the user bets
              on 2 subsequent windows and the first window is not yet settled.
            */
            uint256 window = userData.bets[i - 1];
            uint256 currentWindow = BetLibrary.getWindowNumber(
                block.timestamp,
                windowDuration,
                deployTimestamp);
            (
                uint256 referencePrice,
                uint256 settlementPrice
            ) = getWindowBetPrices(window);

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
            uint256 windowGain = settleBet(
                stake.upValue,
                stake.downValue,
                pool.upValue,
                pool.downValue,
                result
            );

            totalGain += windowGain;

            emit BetSettled(window, _user, windowGain);
        }


        if (totalGain > 0) {
            token.transfer(_user, totalGain);
        }
    }

    function settleBet(
        uint256 upStake,
        uint256 downStake,
        uint256 poolUp,
        uint256 poolDown,
        uint8 res
    ) public pure returns (uint256 gain) {
        BetLibrary.BetResult result = BetLibrary.BetResult(res);
        uint256 poolTotal = poolUp + poolDown;
        if (result == BetLibrary.BetResult.up && poolUp != 0) {
            //(upStake/poolUp)*poolTotal
            gain = BetLibrary.sharePool(poolTotal, upStake, poolUp);
        } else if (result == BetLibrary.BetResult.down && poolDown != 0) {
            //(downStake/poolDown)*poolTotal
            gain = BetLibrary.sharePool(poolTotal, downStake, poolDown);
        } else if (result == BetLibrary.BetResult.tie) {
            gain = upStake + downStake;
        } else {
            //if winning pool is empty the losers get money back.
            gain = upStake + downStake;
        }
    }

    function updatePrice() public {
        uint256 window = BetLibrary.getWindowNumber(
            block.timestamp,
            windowDuration,
            deployTimestamp
        );
        if (windowPrice[window] == 0) {
            windowPrice[window] = priceOracle();
            emit PriceUpdated(window, windowPrice[window]);
        }
    }

    function priceOracle() internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price);
    }

    function getWindowBetPrices(uint256 window)
        public
        view
        returns (uint256, uint256)
    {
        return (windowPrice[window + 1], windowPrice[window + 2]);
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
