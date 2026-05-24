// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @dev A mock ERC-20 token simulating USDC stablecoin with 6 decimals and a faucet minting interface.
 */
contract MockUSDC is ERC20 {
    uint8 private constant _customDecimals = 6;

    constructor() ERC20("Mock USDC", "mUSDC") {
        // Mint 1,000,000 mUSDC to deployer upon initialization
        _mint(msg.sender, 1000000 * 10**_customDecimals);
    }

    /**
     * @dev Overrides decimals to match real USDC (6 decimals).
     */
    function decimals() public view virtual override returns (uint8) {
        return _customDecimals;
    }

    /**
     * @dev Public faucet function allowing anyone to mint mock USDC for testing purposes.
     * @param to The target address receiving the minted stablecoins.
     * @param amount The volume of stablecoins to mint (scaled by 10^6).
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
