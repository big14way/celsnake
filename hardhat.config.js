require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const { vars } = require("hardhat/config");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [vars.get("DEPLOYER_PRIVATE_KEY")],
      chainId: 44787,
      timeout: 120000,
    },
    celoSepolia: {
      url: "https://rpc.ankr.com/celo_sepolia",
      accounts: [vars.get("DEPLOYER_PRIVATE_KEY")],
      chainId: 11142220,
      timeout: 120000,
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: [vars.get("DEPLOYER_PRIVATE_KEY")],
      chainId: 42220,
      timeout: 120000,
    },
  },
  etherscan: {
    apiKey: {
      alfajores: vars.get("ETHERSCAN_API_KEY", process.env.CELOSCAN_API_KEY || "any_non_empty_string"),
      celoSepolia: "no_api_key_needed",
      celo: vars.get("ETHERSCAN_API_KEY", process.env.CELOSCAN_API_KEY || "any_non_empty_string"),
    },
    customChains: [
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io"
        }
      },
      {
        network: "celoSepolia",
        chainId: 11142220,
        urls: {
          apiURL: "https://api-sepolia.celoscan.io/api",
          browserURL: "https://sepolia.celoscan.io"
        }
      },
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io"
        }
      }
    ]
  },
  sourcify: {
    enabled: false
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
