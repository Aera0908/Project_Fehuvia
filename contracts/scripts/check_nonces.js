import hre from "hardhat";

async function main() {
  console.log("Connecting to network...");
  const connection = await hre.network.create();
  const { ethers } = connection;
  const [deployer] = await ethers.getSigners();
  const address = deployer.address;

  try {
    const latestNonce = await ethers.provider.getTransactionCount(address, 'latest');
    const pendingNonce = await ethers.provider.getTransactionCount(address, 'pending');
    const balance = await ethers.provider.getBalance(address);
    const feeData = await ethers.provider.getFeeData();

    console.log("-----------------------------------------");
    console.log("Wallet Address:", address);
    console.log("Latest Confirmed Nonce:", latestNonce);
    console.log("Pending Nonce (incl. mempool):", pendingNonce);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    console.log("Gas Price (Current):", feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : 'unknown', "gwei");
    console.log("Max Fee Per Gas:", feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : 'unknown', "gwei");
    console.log("Max Priority Fee Per Gas:", feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : 'unknown', "gwei");
    console.log("-----------------------------------------");

    if (pendingNonce > latestNonce) {
      console.log(`There are ${pendingNonce - latestNonce} stuck transaction(s).`);
      console.log(`Stuck Nonces: ${Array.from({ length: pendingNonce - latestNonce }, (_, i) => latestNonce + i).join(', ')}`);
    } else {
      console.log("No stuck transactions in the mempool.");
    }
  } catch (err) {
    console.error("Error checking nonces:", err.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
