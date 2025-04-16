import { useState, useEffect, useCallback } from 'react';
import './App.css';
import WalletConnection from './components/WalletConnection';
import { abi, testContractAddress } from './config.js';
import { ethers } from 'ethers';

function App() {
  const [connectedAccount, setConnectedAccount] = useState('');
  const [contractInstance, setContractInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [randomNumber, setRandomNumber] = useState(null);
  const [isCheckingFulfillment, setIsCheckingFulfillment] = useState(false);

  const setupContract = useCallback(async () => {
    if (!connectedAccount) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(testContractAddress, abi, signer);
      setContractInstance(contract);
    } catch (error) {
      console.error("Error setting up contract:", error);
    }
  }, [connectedAccount]);

  useEffect(() => {
    if (connectedAccount) {
      setupContract();
    }
  }, [connectedAccount, setupContract]);

  const handleConnect = (account) => {
    setConnectedAccount(account);
  };

  const checkRandomNumberFulfilled = useCallback(async () => {
    if (!contractInstance) return false;
    
    try {
      const isFulfilled = await contractInstance.isRandomNumberFulfilled();
      return isFulfilled;
    } catch (error) {
      console.error("Error checking if random number is fulfilled:", error);
      return false;
    }
  }, [contractInstance]);

  const getRandomNumber = useCallback(async () => {
    if (!contractInstance) return;
    
    try {
      const number = await contractInstance.getRandomNumber();
      setRandomNumber(number.toString());
    } catch (error) {
      console.error("Error getting random number:", error);
    } finally {
      setIsCheckingFulfillment(false);
    }
  }, [contractInstance]);

  // Polling function to check if random number is fulfilled
  const pollForRandomNumber = useCallback(async () => {
    setIsCheckingFulfillment(true);
    let attempts = 0;
    const maxAttempts = 30; // Stop checking after 30 attempts (about 2 minutes with 4 second intervals)
    
    const checkInterval = setInterval(async () => {
      attempts += 1;
      
      const isFulfilled = await checkRandomNumberFulfilled();
      
      if (isFulfilled) {
        clearInterval(checkInterval);
        await getRandomNumber();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.log("Reached maximum attempts. Random number might not be fulfilled yet.");
        setIsCheckingFulfillment(false);
      }
    }, 4000); // Check every 4 seconds
    
    return () => clearInterval(checkInterval);
  }, [checkRandomNumberFulfilled, getRandomNumber]);

  const requestRandomNumber = async () => {
    if (!contractInstance) {
      console.error("Contract is not initialized");
      return;
    }
    
    setIsLoading(true);
    setRandomNumber(null); // Clear any previous random number
    
    try {
      const tx = await contractInstance.requestRandomNumber();
      await tx.wait();
      console.log("Transaction successful:", tx.hash);
      // Start polling for the random number
      await pollForRandomNumber();
    } catch (error) {
      console.error("Error requesting random number:", error);
      setIsCheckingFulfillment(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="app-container">
      <div>
        <h1>Random Number Demo</h1>
      </div>
      <WalletConnection onConnect={handleConnect} />
      {connectedAccount && (
        <div className="random-number-container">
          <button 
            onClick={requestRandomNumber} 
            disabled={isLoading || !contractInstance || isCheckingFulfillment}
          >
            {isLoading ? 'Processing...' : 'Get Random Number'}
          </button>
          
          {isCheckingFulfillment && (
            <div className="status-message">
              Waiting for oracle to fulfill random number...
            </div>
          )}
          
          {randomNumber !== null && (
            <div className="result">
              <h2>Random Number:</h2>
              <p className="random-number">{randomNumber}</p>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
}

export default App;
