import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Button from './ui/Button';
import Card from './ui/Card';
import { abi, testContractAddress } from '../config';

// Network configuration
const SCROLL_SEPOLIA_CHAIN_ID = "0x8274f"; // Chain ID for Scroll Sepolia (534351 in decimal)
const SCROLL_SEPOLIA_PARAMS = {
  chainId: SCROLL_SEPOLIA_CHAIN_ID,
  chainName: "Scroll Sepolia",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia-rpc.scroll.io"],
  blockExplorerUrls: ["https://sepolia.scrollscan.com"],
};

// Helper function to get a prettier network name
const getNetworkDisplayName = (networkName: string) => {
  if (networkName.toLowerCase().includes('scroll') && networkName.toLowerCase().includes('sepolia')) {
    return 'Scroll Sepolia';
  }
  return networkName || 'Unknown Network';
};

interface WalletConnectorProps {
  onContractReady: (contract: ethers.Contract) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({ 
  onContractReady, 
  isConnected, 
  setIsConnected 
}) => {
  const [connectedAccount, setConnectedAccount] = useState('');
  const [network, setNetwork] = useState('Scroll Sepolia');
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  
  // Check if user is on the correct network
  const checkNetwork = useCallback(async () => {
    if (!(window as any).ethereum) return false;
    
    try {
      const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
      const isCorrectNetwork = chainId === SCROLL_SEPOLIA_CHAIN_ID;
      setIsWrongNetwork(!isCorrectNetwork);
      return isCorrectNetwork;
    } catch (error) {
      console.error("Error checking network:", error);
      return false;
    }
  }, []);
  
  // Switch network to Scroll Sepolia
  const switchToScrollSepolia = async () => {
    if (!(window as any).ethereum) return false;
    
    try {
      // Try to switch to the network
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SCROLL_SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SCROLL_SEPOLIA_PARAMS],
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
  };

  const connectWallet = async () => {
    if ((window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        
        // Check if we're on the correct network
        const isCorrectNetwork = await checkNetwork();
        
        if (!isCorrectNetwork) {
          // Attempt to switch to Scroll Sepolia
          const switched = await switchToScrollSepolia();
          if (!switched) {
            setIsWrongNetwork(true);
            alert("Please switch to Scroll Sepolia network in your wallet");
            return;
          }
        }
        
        if (accounts.length > 0) {
          setConnectedAccount(accounts[0]);
          setIsConnected(true);
          setIsWrongNetwork(false);
          setupContract(accounts[0]);
        }
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert('Please install MetaMask to use this feature');
    }
  };
  
  const setupContract = useCallback(async (account: string) => {
    if (!account) return;
    
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(testContractAddress, abi, signer);
      onContractReady(contract);
      
      const network = await provider.getNetwork();
      const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
    
      // Set the network name with chainId
      const networkName = getNetworkDisplayName(network.name || 'Unknown');
      setNetwork(`${networkName} (${parseInt(chainId, 16)})`);
    } catch (error) {
      console.error("Error setting up contract:", error);
    }
  }, [onContractReady]);
  
  useEffect(() => {
    if (connectedAccount) {
      setupContract(connectedAccount);
    }
  }, [connectedAccount, setupContract]);

  // Listen for chain changes
  useEffect(() => {
    if ((window as any).ethereum) {
      const handleChainChanged = (chainId: string) => {
        const isCorrect = chainId === SCROLL_SEPOLIA_CHAIN_ID;
        setIsWrongNetwork(!isCorrect);
        
        if (!isCorrect) {
          setIsConnected(false);
        } else if (connectedAccount) {
          setupContract(connectedAccount);
        }
      };
      
      // Subscribe to chainChanged events
      (window as any).ethereum.on('chainChanged', handleChainChanged);
      
      // Check network on initial load
      checkNetwork();
      
      // Cleanup
      return () => {
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkNetwork, connectedAccount, setIsConnected, setupContract]);
  
  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-2">Network Status</h2>
        <div className="space-y-3">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isConnected && !isWrongNetwork ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-slate-300">
              {isConnected && !isWrongNetwork 
                ? 'Connected' 
                : isWrongNetwork 
                  ? 'Wrong Network' 
                  : 'Disconnected'}
            </span>
          </div>
          
          {isConnected ? (
            <>
              <div className="py-1 px-3 bg-navy-800 rounded-md text-sm">
                <p className="text-slate-400 text-xs">Account</p>
                <p className="font-mono">{connectedAccount.slice(0, 6)}...{connectedAccount.slice(-4)}</p>
              </div>
              <div className={`py-1 px-3 ${isWrongNetwork ? 'bg-red-900/30' : 'bg-navy-800'} rounded-md text-sm`}>
                <p className="text-slate-400 text-xs">Network</p>
                <p className="flex items-center">
                  {isWrongNetwork ? (
                    'Switch to Scroll Sepolia'
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      {network}
                    </>
                  )}
                </p>
              </div>
              
              {isWrongNetwork && (
                <div className="py-2">
                  <Button 
                    onClick={switchToScrollSepolia} 
                    className="w-full bg-red-500 hover:bg-red-600"
                  >
                    Switch Network
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-4">
              <Button 
                onClick={connectWallet} 
                className="w-full"
              >
                Connect Wallet
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default WalletConnector;