require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  paths: {
    artifacts: "./artifacts",
},
  solidity: "0.8.0", 
  networks: {
    scrollSepolia: {
      url: process.env.SCROLL_RPC_URL,
      chainId: 534351,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
};
