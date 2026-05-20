require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    morphTestnet: {
      url: process.env.MORPH_TESTNET_RPC || "https://rpc-testnet.morphl2.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 2710
    }
  }
};
