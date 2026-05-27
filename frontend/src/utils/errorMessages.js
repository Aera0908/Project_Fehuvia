/**
 * Fehuvia Error Message Utility
 * Translates raw technical errors (MetaMask, ethers, network) into
 * concise, user-friendly descriptions — never exposing internal logs.
 */

/**
 * Maps a raw error object/string to a friendly user-facing message.
 * @param {Error|string} err - The caught error
 * @param {string} context - The operation context (e.g. 'settlement', 'bridge', 'wallet')
 * @returns {string} A clean, friendly error message
 */
export function getFriendlyError(err, context = 'general') {
  const raw = (err?.message || err?.reason || String(err) || '').toLowerCase();

  // ── MetaMask / Wallet Rejection ─────────────────────────────────────────
  if (
    raw.includes('user rejected') ||
    raw.includes('user denied') ||
    raw.includes('action_rejected') ||
    raw.includes('ethers-user-denied') ||
    raw.includes('rejected the request')
  ) {
    return 'Transaction cancelled. You rejected the wallet request.';
  }

  // ── Insufficient Funds (Gas) ────────────────────────────────────────────
  if (
    raw.includes('insufficient funds') ||
    raw.includes('out of gas') ||
    raw.includes('gas required exceeds')
  ) {
    return 'Your wallet does not have enough ETH to cover the gas fee. Please add testnet ETH and try again.';
  }

  // ── Insufficient Token Balance ──────────────────────────────────────────
  if (
    raw.includes('insufficient') && (raw.includes('usdc') || raw.includes('balance') || raw.includes('allowance'))
  ) {
    return 'Insufficient mUSDC balance. Please mint more tokens via the Treasury Bridge first.';
  }

  // ── Network / Chain Mismatch ────────────────────────────────────────────
  if (
    raw.includes('wrong network') ||
    raw.includes('chain') ||
    raw.includes('network') ||
    raw.includes('chainid')
  ) {
    return 'Wallet is on the wrong network. Please switch to Morph Testnet (Chain ID: 2910).';
  }

  // ── No Wallet / Extension Not Found ────────────────────────────────────
  if (
    raw.includes('no ethereum provider') ||
    raw.includes('ethereum is not defined') ||
    raw.includes('not installed') ||
    raw.includes('evm browser wallet is required')
  ) {
    return 'No EVM wallet detected. Please install MetaMask and connect to continue.';
  }

  // ── Contract Revert / Execution Error ──────────────────────────────────
  if (
    raw.includes('execution reverted') ||
    raw.includes('revert') ||
    raw.includes('call exception') ||
    raw.includes('contract call')
  ) {
    if (context === 'settlement') {
      return 'The settlement contract rejected this transaction. Check your USDC allowance or invoice details.';
    }
    if (context === 'bridge') {
      return 'The bridge contract rejected this transaction. Verify your token balance and try again.';
    }
    return 'The smart contract rejected the transaction. Please try again or contact support.';
  }

  // ── Authorization / Session ─────────────────────────────────────────────
  if (
    raw.includes('authorization required') ||
    raw.includes('unauthorized') ||
    raw.includes('session expired') ||
    raw.includes('jwt')
  ) {
    return 'Your session has expired. Please log in again to continue.';
  }

  // ── Database / Server Sync ──────────────────────────────────────────────
  if (
    raw.includes('server_unavailable') ||
    raw.includes('database') ||
    raw.includes('sync failed') ||
    raw.includes('backend') ||
    raw.includes('failed to fetch') ||
    raw.includes('networkerror') ||
    raw.includes('load failed')
  ) {
    if (context === 'settlement') {
      return 'Settlement was recorded on-chain, but the Fehuvia database failed to sync. Refresh to check status.';
    }
    if (context === 'bridge') {
      return 'Bridge transaction completed on-chain, but the ledger sync encountered an issue. Refresh to check.';
    }
    return 'Unable to reach the Fehuvia server. Please check your connection and try again.';
  }

  // ── Transaction Timeout / Pending ──────────────────────────────────────
  if (
    raw.includes('timeout') ||
    raw.includes('transaction not mined') ||
    raw.includes('replacement fee too low')
  ) {
    return 'The transaction is taking longer than expected. It may still be pending — check the explorer before retrying.';
  }

  // ── Generic Nonce / Pending Queue ──────────────────────────────────────
  if (raw.includes('nonce') || raw.includes('already known')) {
    return 'A previous transaction is still pending. Wait for it to confirm in your wallet before trying again.';
  }

  // ── Fallback by Context ─────────────────────────────────────────────────
  const contextMessages = {
    settlement: 'Invoice settlement failed. Please ensure your wallet is connected and has sufficient mUSDC.',
    bridge:     'Bridge conversion failed. Please ensure your wallet is connected to Morph Testnet.',
    wallet:     'Wallet action failed. Please authorize the request in your wallet extension.',
    bank:       'Bank operation failed. Please check your connection and try again.',
    upload:     'Invoice upload failed. Please check your inputs and try again.',
    schedule:   'Failed to postpone the invoice. Please check your connection and try again.',
    general:    'An unexpected error occurred. Please try again.',
  };

  return contextMessages[context] || contextMessages.general;
}

/**
 * Returns a short 2-3 word label for the toast badge (txHash field).
 * @param {string} context
 * @returns {string}
 */
export function getErrorBadge(context = 'general') {
  const badges = {
    settlement: 'Settlement Failed',
    bridge:     'Bridge Failed',
    wallet:     'Wallet Error',
    bank:       'Bank Error',
    upload:     'Upload Failed',
    schedule:   'Schedule Error',
    general:    'Action Failed',
  };
  return badges[context] || badges.general;
}
