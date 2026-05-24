import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: "0.8.24",
  networks: {
    morphTestnet: {
      type: "http",
      url: process.env.MORPH_TESTNET_RPC || "https://rpc-hoodi.morph.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 2818
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  }
});
