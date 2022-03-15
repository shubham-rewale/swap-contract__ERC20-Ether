//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@uniswap/v2-core/contracts/interfaces/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract Swap_ERC20_Token {

    IUniswapV2Router02 private uniswapRouter;
    IERC20 private token;

    mapping(address => uint) private userEtherBalance;
    
    event tokensSwapped(uint _inputTokens, uint _outputEther); 
    event withdrawalEvent(address user, uint _amount);
    
    constructor() {
        uniswapRouter = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    }

    function swapTokensForEth(address _tokenAddress, uint _tokenAmount, uint _amountOutMin) public {
        
        require(_tokenAddress != address(0), 'token address is not valid');
        token = IERC20(_tokenAddress);
        uint amountToSwap = _tokenAmount * 10 ** token.decimals();
        require(token.transferFrom(msg.sender, address(this), amountToSwap), 'transfer of tokens failed');
        require(token.approve(address(uniswapRouter), amountToSwap), 'approve failed.');
        address[] memory path = new address[](2);
        path[0] = _tokenAddress;
        path[1] = uniswapRouter.WETH();
        uint[] memory res = uniswapRouter.swapExactTokensForETH(amountToSwap, _amountOutMin, path, address(this), block.timestamp);
        userEtherBalance[msg.sender] += res[1];
        emit tokensSwapped(res[0], res[1]);
    }

    function viewUserBalance(address _userAddress) public view returns(uint balanceAmount) {
        balanceAmount = userEtherBalance[_userAddress];
    }

    function withdrawUserBalance(uint _amountToWithdraw) public {
        require(_amountToWithdraw <= userEtherBalance[msg.sender], 'not enough funds');
        userEtherBalance[msg.sender] -= _amountToWithdraw;
        payable(msg.sender).transfer(_amountToWithdraw);
        emit withdrawalEvent(msg.sender, _amountToWithdraw); 
    }

    receive() external payable {

    }

}
