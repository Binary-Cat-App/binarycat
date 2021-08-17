pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";    

 contract OracleMock is AggregatorV3Interface{

    constructor() public {
    }

    /**
     * Returns the latest price
     */
    function latestRoundData() public override view returns (uint80, int, uint, uint, uint80) {
        return (1,1000000000,1,1,1);
    }

    function decimals() override
        external
        view
        returns (
            uint8
    ) {
        return 0;
    }

    function description() override
    external
    view
    returns (
      string memory
    ) {
        return "memory";
    }

    function version() override
        external
        view
        returns (
        uint256
        ) {
            return 0;
        }

    function getRoundData(
        uint80 _roundId
    )
        external
        view override
        returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
        ) {
            return (0,0,0,0,0);
        }
}
