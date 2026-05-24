import { ethers } from "ethers";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly resolve the absolute path to the .env file in the contracts directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.MORPH_TESTNET_RPC || "https://rpc-hoodi.morph.network";

  if (!privateKey) {
    console.error("Error: PRIVATE_KEY is not defined in your contracts/.env file.");
    process.exit(1);
  }

  try {
    const wallet = new ethers.Wallet(privateKey);
    console.log("\n=========================================");
    console.log(`Your Configured Wallet Address:`);
    console.log(`-> ${wallet.address}`);
    console.log("=========================================\n");

    console.log("Connecting to Morph L2 Testnet to query live balance...");
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const balance = await provider.getBalance(wallet.address);
    const formattedBalance = ethers.formatEther(balance);

    console.log("-----------------------------------------");
    console.log(`On-Chain Balance:   ${formattedBalance} ETH`);
    console.log("-----------------------------------------");

    if (balance === 0n) {
      console.log(`\n⚠️  Status: UNPAID. The faucet transaction has not completed or you have not requested funds yet.`);
      console.log(`Please visit the Morph Testnet Faucet and request funds for:`);
      console.log(`-> ${wallet.address}`);
    } else {
      console.log(`\n✅ Status: READY! You have enough testnet ETH to proceed with deployment.`);
    }

    console.log("\nVerify directly on the Explorer:");
    console.log(`-> https://explorer-testnet.morphl2.io/address/${wallet.address}`);
    console.log("=========================================\n");
  } catch (error) {
    console.error("Error connecting to network or parsing key:", error.message);
  }
}

main();
