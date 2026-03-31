require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  paths: {
    artifacts: "./artifacts",
<<<<<<< HEAD
  },
  solidity: "0.8.0",
  networks: {
    scrollSepolia: {
      url: process.env.RPC_URL,
      chainId: 534351,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
};
=======
},
  solidity: "0.8.0", // Specify the Solidity version
  networks: {
    scrollSepolia: {
      url: process.env.SCROLL_RPC_URL, // Scroll Sepolia RPC URL from .env
      chainId: 534351, // Chain ID for Scroll Sepolia
      accounts: [`0x${process.env.PRIVATE_KEY}`], // Private key from .env
    },
  },
};
>>>>>>> 5790e3a492a910629bcb14e998bb9842d8a17463
