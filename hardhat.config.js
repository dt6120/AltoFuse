require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",

  networks: {
    hardhat: {
      // forking: {
      //   url: "https://rpc-mumbai.maticvigil.com/" // `https://mainnet.infura.io/v3/${process.env.INFURA_ID}`
      // }
    },

    ropsten: {
      url: `https://ropsten.infura.io/v3/35fa8c9831434eb699bf01b4b792b660`,
      chainId: 3,
      accounts: {
        mnemonic: "hour burst all egg scatter social banana romance snack artwork library now",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 5
      },
      saveDeployments: true
    },

    rinkeby: {
      url: `https://rinkeby.infura.io/v3/35fa8c9831434eb699bf01b4b792b660`,
      chainId: 4,
      accounts: {
        mnemonic: "hour burst all egg scatter social banana romance snack artwork library now",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 5
      },
      saveDeployments: true
    },

    goerli: {
      url: `https://goerli.infura.io/v3/35fa8c9831434eb699bf01b4b792b660`,
      chainId: 5,
      accounts: {
        mnemonic: "hour burst all egg scatter social banana romance snack artwork library now",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 5
      },
      saveDeployments: true
    },

    kovan: {
      url: `https://kovan.infura.io/v3/35fa8c9831434eb699bf01b4b792b660`,
      chainId: 42,
      accounts: {
        mnemonic: "hour burst all egg scatter social banana romance snack artwork library now",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 5
      },
      saveDeployments: true
    },

    matic: {
      url: "https://rpc-mumbai.maticvigil.com/",
      chainId: 80001,
      accounts: {
        mnemonic: "hour burst all egg scatter social banana romance snack artwork library now",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 5
      },
      saveDeployments: true
    }
  },

  namedAccounts: {
    deployer: {
        default: 0,
        1: 0
    },
  },

  paths: {
    root: "./",
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};

