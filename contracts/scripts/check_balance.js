import hre from "hardhat";

async function main() {
  const connection = await hre.network.create();
  const { ethers } = connection;
  const [deployer] = await ethers.getSigners();
  
  console.log("Wallet Address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Morph Testnet Balance:", ethers.formatEther(balance), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
