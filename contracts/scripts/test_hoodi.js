import hre from "hardhat";

async function main() {
  const address = "0xc8fa457a916952d58d62A3fF6E81cfa577d533e4";
  const rpcUrl = "https://rpc-hoodi.morph.network";
  
  console.log("Connecting to Hoodi RPC:", rpcUrl);
  
  const connection = await hre.network.create();
  const { ethers } = connection;
  
  // Custom provider to bypass hardhat config URL
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const balance = await provider.getBalance(address);
  
  console.log("Hoodi RPC Balance:", ethers.formatEther(balance), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
