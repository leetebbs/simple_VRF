import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import NetworkSwitch from './NetworkSwitch';

const WalletConnection = ({ onConnect }) => {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState('');

  // Scroll Sepolia chain details
  const SCROLL_SEPOLIA_CHAIN_ID = "0x8274f"; // 534351 in decimal
  
  const connectWallet = async () => {
    try {
      // Check if window.ethereum is available
      if (window.ethereum) {
        // Request access to the user's accounts
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Check current network and switch if needed
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(currentChainId);
        
        if (currentChainId !== SCROLL_SEPOLIA_CHAIN_ID) {
          console.log("Wrong network. Switching to Scroll Sepolia...");
          const networkSwitch = new NetworkSwitch();
          const switched = await networkSwitch.switchToScrollSepolia();
          if (!switched) {
            alert("Please switch to Scroll Sepolia network to use this application");
            return;
          }
        }
        
        // Create a new provider using ethers v6
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Get the signer (account)
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setAccount(address);
        setIsConnected(true);
        console.log("Connected to wallet:", address);
        
        // Pass connected account back to parent component
        if (onConnect) onConnect(address);
      } else {
        alert("Please install MetaMask or another Ethereum wallet to use this application");
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  // Listen for chain changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (newChainId) => {
        setChainId(newChainId);
        if (newChainId !== SCROLL_SEPOLIA_CHAIN_ID) {
          setIsConnected(false);
          alert("Please switch to Scroll Sepolia network");
        } else if (account) {
          setIsConnected(true);
        }
      });
    }
    
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [account]);

  return (
    <div>
      <button onClick={connectWallet}>
        {isConnected 
          ? `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`
          : 'Connect Wallet'}
      </button>
      {isConnected && (
        <div className="wallet-info">
          <p>Connected Account: {account}</p>
          <p>Network: Scroll Sepolia</p>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;