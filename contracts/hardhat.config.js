require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Local Ethermint node
    ethermint: {
      url: "http://localhost:8545",
      chainId: 9000,
      accounts: [
        // Default test account - REPLACE THIS IN PRODUCTION
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
      ],
      gas: "auto",
      gasPrice: "auto"
    },
    // Alias for convenience
    localhost: {
      url: "http://localhost:8545",
      chainId: 9000
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};
