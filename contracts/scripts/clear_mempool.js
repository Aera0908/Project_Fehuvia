import hre from "hardhat";

async function main() {
  console.log("Connecting to network to clear mempool...");
  const connection = await hre.network.create();
  const { ethers } = connection;
  const [deployer] = await ethers.getSigners();
  const address = deployer.address;

  const latestNonce = await ethers.provider.getTransactionCount(address, 'latest');
  const pendingNonce = await ethers.provider.getTransactionCount(address, 'pending');

  console.log(`Address: ${address}`);
  console.log(`Latest Confirmed Nonce: ${latestNonce}`);
  console.log(`Pending Nonce Count: ${pendingNonce}`);

  if (pendingNonce <= latestNonce) {
    console.log("No pending transactions to clear. Mempool is clean!");
    return;
  }

  const stuckCount = pendingNonce - latestNonce;
  console.log(`Detected ${stuckCount} stuck transaction(s). Preparing to overwrite nonces from ${latestNonce} to ${pendingNonce - 1}...`);

  // We will overwrite each stuck nonce with a 0-ETH self-transfer and a solid gas price.
  // 5 gwei is well above the current network price of ~0.2 gwei, ensuring immediate validation.
  const gasPrice = ethers.parseUnits("5", "gwei");

  for (let nonce = latestNonce; nonce < pendingNonce; nonce++) {
    console.log(`\nOverwriting nonce ${nonce}...`);
    try {
      const tx = await deployer.sendTransaction({
        to: address,
        value: 0,
        nonce: nonce,
        gasPrice: gasPrice,
        gasLimit: 21000
      });
      console.log(`Replacement Tx sent! Hash: ${tx.hash}`);
      console.log("Waiting for confirmation...");
      await tx.wait();
      console.log(`Nonce ${nonce} cleared successfully!`);
    } catch (err) {
      console.error(`Error clearing nonce ${nonce}:`, err.message);
      // If we get an error about "nonce too low" or "replacement transaction underpriced",
      // it means the nonce has already been cleared or we need a higher gas price.
    }
  }

  const finalLatest = await ethers.provider.getTransactionCount(address, 'latest');
  console.log("\n-----------------------------------------");
  console.log("Mempool cleanup finished.");
  console.log(`Final Confirmed Nonce: ${finalLatest}`);
  console.log("-----------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Cleanup script failed:", error);
    process.exit(1);
  });
