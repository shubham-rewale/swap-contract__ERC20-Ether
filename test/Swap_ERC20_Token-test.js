const erc20TokenABI = require("@uniswap/v2-core/build/ERC20.json");
const UniswapV2Router02 = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const expect = chai.expect;
const { ethers } = require("hardhat");


describe("Testing Swap_ERC20_Token Contract", function () {

  const uniswapRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
  const batAddress = '0x0D8775F648430679A709E98d2b0Cb6250d2887EF';
  let uniswapRouter;
  let batInstance
  let Swap_ERC20_Token_Instance;
  let firstAccount;
  let secondAccount; 
  let thirdAccount;
  

  beforeEach( async () => {
    [firstAccount, secondAccount, thirdAccount] = await ethers.getSigners();
    uniswapRouter = new ethers.Contract(uniswapRouterAddress, UniswapV2Router02.abi, secondAccount);
    const WETH = await uniswapRouter.WETH();
    const path = [WETH, batAddress];
    await uniswapRouter.swapETHForExactTokens(ethers.utils.parseUnits('50', 18), path, secondAccount.address, Date.now() + 10000, { value: ethers.utils.parseEther('5') });
    const Swap_ERC20_Token = await ethers.getContractFactory("Swap_ERC20_Token");
    Swap_ERC20_Token_Instance = await Swap_ERC20_Token.deploy();
    batInstance = new ethers.Contract(batAddress, erc20TokenABI.abi, secondAccount);
    await batInstance.approve(Swap_ERC20_Token_Instance.address, ethers.utils.parseUnits('15', 18));
  });

  it("User should be able to swap exact amount of tokens for Ether", async function () {
    await expect(Swap_ERC20_Token_Instance.connect(secondAccount).swapTokensForEth(batAddress, 10, ethers.utils.parseUnits('0.00200000000000000', 'ether')))
                .to.emit(Swap_ERC20_Token_Instance, 'tokensSwapped')
                .withArgs(ethers.utils.parseUnits('10', 18), ethers.utils.parseUnits('0.002803091192052716', 'ether'));
  });

  it("User should be able to withdraw its ether balance from contract", async function () {
    await Swap_ERC20_Token_Instance.connect(secondAccount).swapTokensForEth(batAddress, 10, ethers.utils.parseUnits('0.00200000000000000', 'ether'));
    const balance = await Swap_ERC20_Token_Instance.viewUserBalance(secondAccount.address);
    await expect(Swap_ERC20_Token_Instance.connect(secondAccount).withdrawUserBalance(balance))
                .to.emit(Swap_ERC20_Token_Instance, 'withdrawalEvent')
                .withArgs(secondAccount.address, balance);
  });

});
