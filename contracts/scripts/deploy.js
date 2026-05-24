import hre from "hardhat";

async function main() {
  console.log("Starting deployment of Fehuvia smart contracts...");

  // Create network connection explicitly for Hardhat 3
  const connection = await hre.network.create();
  const { ethers } = connection;

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  // 1. Deploy MockUSDC
  console.log("Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log(`MockUSDC successfully deployed to: ${mockUSDCAddress}`);

  // 2. Deploy B2BSettlement passing MockUSDC address
  console.log("Deploying B2BSettlement...");
  const B2BSettlement = await ethers.getContractFactory("B2BSettlement");
  const b2bSettlement = await B2BSettlement.deploy(mockUSDCAddress);
  await b2bSettlement.waitForDeployment();
  const b2bSettlementAddress = await b2bSettlement.getAddress();
  console.log(`B2BSettlement successfully deployed to: ${b2bSettlementAddress}`);

  console.log("\nDeployment completed successfully!");
  console.log("-----------------------------------------");
  console.log(`Mock USDC (mUSDC):  ${mockUSDCAddress}`);
  console.log(`B2B Settlement:      ${b2bSettlementAddress}`);
  console.log("-----------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
