pragma solidity ^0.6.8;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract BinToken is ERC20{
    using SafeMath for uint256;

    string public constant NAME = "KITTY";
    string public constant SYMBOL = "KITTY";
    uint8 public constant DECIMALS = 18;
    uint256 public constant INITIAL_SUPPLY = 100000000 * (10 ** uint256(DECIMALS));


    mapping (address => mapping(address => uint)) allowed;

    constructor()
        ERC20(NAME, SYMBOL) public
    {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}
