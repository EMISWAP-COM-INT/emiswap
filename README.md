# Emiswap

AMM with a beautiful mind

## Factory Address
[https://etherscan.io/address/0x...](https://etherscan.io/address/0x...)

## Swap
```solidity
/**
* @param src address of the source token to exchange
* @param dst token address that will received
* @param amount amount to exchange
* @param minReturn minimal amount of the dst token that will receive (if result < minReturn then transaction fails)
* @param referral 1/20 from LP fees will be minted to referral wallet address (in liquidity token) (in case of address(0) no mints) 
* @return result received amount
*/
function swap(address src, address dst, uint256 amount, uint256 minReturn, address referral) external payable returns(uint256 result);
```

## Deposit
```solidity
/**
* @dev provide liquidity to the pool and earn on trading fees
* @param amounts [amount0, amount1] for liquidity provision (each amount sorted by token0 and token1) 
* @param minAmounts minimal amounts that will be charged from sender address to liquidity pool (each amount sorted by token0 and token1) 
* @return fairSupply received liquidity token amount
*/
function deposit(uint256[] calldata amounts, uint256[] calldata minAmounts) external payable returns(uint256 fairSupply);
```

## Withdraw
```solidity
/**
* @dev withdraw liquidity from the pool
* @param amount amount to burn in exchange for underlying tokens
* @param minReturns minimal amounts that will be transferred to sender address in underlying tokens  (each amount sorted by token0 and token1) 
*/
function withdraw(uint256 amount, uint256[] memory minReturns) external;
```

## Create new pool
```solidity
/**
* @dev tokens will be sorted and stored according to token0 < token1
* @param tokenA 
* @param tokenB 
* @return pool created pool address
*/
function deploy(address tokenA, address tokenB) public returns(address pool);
```
