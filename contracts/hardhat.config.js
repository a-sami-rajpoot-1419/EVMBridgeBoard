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
    // Hardhat local network
    hardhat: {
      chainId: 31337
    },
    // Localhost network
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    // Local Evmos node (Docker)
    evmos: {
      url: "http://localhost:8545",
      chainId: 9000,
      accounts: [
        "0x44D477C8124033A8E87060B5684BBD40803757C0610F57C06DFD7E075B5F0B60"  // validator
      ],
      gas: "auto",
      gasPrice: "auto"
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
