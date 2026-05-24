const ethers = require('ethers');
const db = require('./db');
require('dotenv').config();

// Human-readable ABI for capturing the exact PaymentSettled event
const B2B_SETTLEMENT_ABI = [
  "event PaymentSettled(string indexed invoiceId, address indexed buyer, address indexed supplier, uint256 amount, uint256 timestamp)"
];

async function startListener() {
  const rpcUrl = process.env.MORPH_TESTNET_RPC || "https://rpc-hoodi.morph.network";
  const contractAddress = process.env.SETTLEMENT_CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error("❌ Listener Error: SETTLEMENT_CONTRACT_ADDRESS is not defined in your backend/.env file.");
    return;
  }

  console.log(`🚀 Starting blockchain listener daemon...`);
  console.log(`📡 Connecting to RPC node: ${rpcUrl}`);
  console.log(`🎯 Targeting settlement contract: ${contractAddress}`);

  try {
    // Ethers v5 provider instantiation
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, B2B_SETTLEMENT_ABI, provider);

    // Bind event listener
    contract.on("PaymentSettled", async (invoiceId, buyer, supplier, amount, timestamp, event) => {
      console.log(`\n🔔 Event Captured: PaymentSettled`);
      console.log(`   - Invoice ID: ${invoiceId}`);
      console.log(`   - Buyer:      ${buyer}`);
      console.log(`   - Supplier:   ${supplier}`);
      console.log(`   - Amount:     ${ethers.utils.formatUnits(amount, 6)} mUSDC`);
      console.log(`   - TX Hash:    ${event.transactionHash}`);

      try {
        // Update Supabase invoice ledger to 'settled' and save tx_hash
        const updateQuery = `
          UPDATE invoices
          SET status = 'settled', tx_hash = $1
          WHERE id = $2
        `;
        const result = await db.query(updateQuery, [event.transactionHash, invoiceId]);

        if (result.rowCount > 0) {
          console.log(`   ✅ Database updated: marked invoice ${invoiceId} as settled.`);
        } else {
          console.log(`   ⚠️ Database sync: Invoice ${invoiceId} not found in database, but settled on-chain.`);
        }
      } catch (dbError) {
        console.error("   ❌ Database Sync Error:", dbError.message);
      }
    });

    console.log("   ✅ Event listener successfully bound. Awaiting on-chain transactions...");
  } catch (error) {
    console.error("❌ Blockchain Listener Initialization Failed:", error.message);
    console.log("   Daemon will run in offline mode. Local triggers will still function.");
  }
}

// Export for execution startup inside Express server
module.exports = { startListener };
