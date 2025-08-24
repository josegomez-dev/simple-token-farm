require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.22",
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        auto: true,
        interval: 0
      }
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/your-project-id",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      // Remove fixed gas settings to use automatic estimation
      timeout: 120000 // Increased timeout for slow transactions
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
    gasPrice: 21,
    showMethodSig: true,
    showTime: true
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || ""
  }
};


