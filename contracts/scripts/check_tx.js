import hre from "hardhat";

async function main() {
  const address = "0xc8fa457a916952d58d62A3fF6E81cfa577d533e4";
  const rpcUrl = "https://rpc-hoodi.morph.network";
  
  console.log("Connecting to Hoodi RPC:", rpcUrl);
  
  const connection = await hre.network.create();
  const { ethers } = connection;
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const count = await provider.getTransactionCount(address);
  const pendingCount = await provider.getTransactionCount(address, "pending");
  const balance = await provider.getBalance(address);
  const feeData = await provider.getFeeData();
  
  console.log("Address:", address);
  console.log("Confirmed Tx Count:", count);
  console.log("Pending Tx Count:", pendingCount);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("Gas Price (Current):", ethers.formatUnits(feeData.gasPrice || 0, "gwei"), "gwei");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
