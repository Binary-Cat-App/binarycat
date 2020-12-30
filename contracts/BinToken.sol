pragma solidity ^0.6.8;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract BinToken is ERC20{
    using SafeMath for uint256;

    string public constant NAME = "Bin Token";
    string public constant SYMBOL = "BIN";
    uint8 public constant DECIMALS = 18;
    uint256 public constant INITIAL_SUPPLY = 1000000000 * (10 ** uint256(DECIMALS));

    struct Account {
        uint balance;
	    uint lastDividends;
    }

    mapping(address => Account) accounts;
    mapping (address => mapping(address => uint)) allowed;





    modifier updateAccount(address account) {
        uint dividends = ownedDividends(account);
        address payable _to = payable(account);
	    if(dividends > 0) {
            _to.transfer(dividends);
	    }
        accounts[account].lastDividends = address(this).balance;
	    _;
    }

    constructor()
        ERC20(NAME, SYMBOL) public
    {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
   
    function ownedDividends(address account) internal view returns (uint) {
       uint newDividends = address(this).balance.sub(accounts[account].lastDividends);
       return (accounts[account].balance.mul(newDividends)).div(totalSupply());
    }

    function mint(address account, uint256 amount) public returns (bool) {
        _mint(account, amount);
        return true;
    }

     function transfer(address to, uint tokens) public override updateAccount(msg.sender) updateAccount(to) returns (bool success) {
        accounts[msg.sender].balance = accounts[msg.sender].balance.sub(tokens);
	    accounts[to].balance = accounts[to].balance.add(tokens);
	    Transfer(msg.sender, to, tokens);
	    success = true;
    }

    function transferFrom(address from, address to, uint tokens) public override updateAccount(from) updateAccount(to) returns (bool success) {
        require(allowed[from][msg.sender] >= tokens);
        accounts[from].balance = accounts[from].balance - tokens;
  	    allowed[from][msg.sender] = allowed[from][msg.sender] - tokens;
  	    accounts[to].balance = accounts[to].balance + tokens;
  	    Transfer(from, to, tokens);
  	    success = true;
    }








}
