require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");
dotenv.config();
const alchemyKey = process.env.ALCHEMY_KEY;
const account = process.env.P_KEY;
const scrollKey = process.env.SCROLL_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    scrollSepolia: {
      url: `https://scroll-sepolia.g.alchemy.com/v2/${alchemyKey}`,
      accounts: [account],
    },
  },
  etherscan: {
    apiKey:
    {
      scrollSepolia: scrollKey
    },
    customChains: [
      {
        network: "scrollSepolia",
        chainId: 534351,
        urls: {
          apiURL: "https://api-sepolia.scrollscan.com/api",
          browserURL: "https://sepolia.scrollscan.com"
        }
      }
    ]
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    // enabled: true
  }
  
};
