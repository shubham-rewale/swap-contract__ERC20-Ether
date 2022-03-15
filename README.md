# Swap ERC20 Token for Ether

The Contract allows the fix amount of ERC20 tokens to be swapped for equal value of the Ether depending on the current exchange rate. It uses Uniswap V2 Router to perform the swap. Only ERC20 tokens listed on Uniswap can be swapped.

## Framework Used

The project uses Hard hat framework for testing and deploying the contract. Tests are written in mocha framework with the help of waffle. Ethereum mainnet fork is used for testing.
