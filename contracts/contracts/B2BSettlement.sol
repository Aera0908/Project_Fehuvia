// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title B2BSettlement
 * @dev Manages secure B2B stablecoin settlement on Morph L2, tracking invoice clearing states and emitting events for database synchronization.
 */
contract B2BSettlement {
    // Reference to the stablecoin token contract used for B2B settlements
    IERC20 public immutable stablecoin;

    // Tracks invoice IDs to enforce unique settlement constraints and prevent double-payment exploits
    mapping(string => bool) public settledInvoices;

    // Event captured by our Express backend daemon process to index and update invoice state
    event PaymentSettled(
        string indexed invoiceId,
        address indexed buyer,
        address indexed supplier,
        uint256 amount,
        uint256 timestamp
    );

    constructor(address _stablecoinAddress) {
        require(_stablecoinAddress != address(0), "Invalid stablecoin address");
        stablecoin = IERC20(_stablecoinAddress);
    }

    /**
     * @dev Settles a registered invoice by transferring stablecoins from msg.sender directly to the supplier.
     * @param invoiceId The unique alphanumeric ID string of the B2B invoice.
     * @param supplier The wallet address of the supplier receiving the stablecoin funds.
     * @param amount The stablecoin transfer value, matching the token's decimal precision.
     */
    function settleInvoice(
        string calldata invoiceId,
        address supplier,
        uint256 amount
    ) external {
        require(bytes(invoiceId).length > 0, "Invoice ID cannot be empty");
        require(supplier != address(0), "Invalid supplier address");
        require(amount > 0, "Amount must be greater than zero");
        require(!settledInvoices[invoiceId], "Invoice already settled");

        // Effects: Flag invoice as settled prior to execution (Checks-Effects-Interactions pattern)
        settledInvoices[invoiceId] = true;

        // Interactions: Route Mock USDC transfer from msg.sender to the supplier
        bool success = stablecoin.transferFrom(msg.sender, supplier, amount);
        require(success, "Stablecoin transfer failed");

        // Event Telemetry
        emit PaymentSettled(invoiceId, msg.sender, supplier, amount, block.timestamp);
    }
}
