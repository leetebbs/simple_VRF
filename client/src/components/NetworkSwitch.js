class NetworkSwitch {
    constructor() {
      // Scroll Sepolia chain details
      this.SCROLL_SEPOLIA_CHAIN_ID = "0x8274f"; // 534351 in decimal
      this.SCROLL_SEPOLIA_DETAILS = {
        chainId: this.SCROLL_SEPOLIA_CHAIN_ID,
        chainName: "Scroll Sepolia",
        nativeCurrency: {
          name: "Ethereum",
          symbol: "ETH",
          decimals: 18
        },
        rpcUrls: ["https://sepolia-rpc.scroll.io"],
        blockExplorerUrls: ["https://sepolia-explorer.scroll.io"]
      };
    }
  
    // Function to switch the network to Scroll Sepolia
    async switchToScrollSepolia() {
      try {
        // Try to switch to the network
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: this.SCROLL_SEPOLIA_CHAIN_ID }],
        });
        return true;
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [this.SCROLL_SEPOLIA_DETAILS],
            });
            return true;
          } catch (addError) {
            console.error("Error adding Scroll Sepolia network:", addError);
            return false;
          }
        }
        console.error("Error switching to Scroll Sepolia network:", switchError);
        return false;
      }
    }
  }
  
  export default NetworkSwitch;