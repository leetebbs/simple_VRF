import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import WalletConnection from './WalletConnection';
import { abi, testContractAddress } from '../config.js';

function RandomNumberDemo() {
  const [connectedAccount, setConnectedAccount] = useState('');
  const [contractInstance, setContractInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [randomNumber, setRandomNumber] = useState(null);
  const [isCheckingFulfillment, setIsCheckingFulfillment] = useState(false);
  const [lastRequestTimestamp, setLastRequestTimestamp] = useState(0);

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

  const pollForRandomNumber = useCallback(async () => {
    setIsCheckingFulfillment(true);
    let attempts = 0;
    const maxAttempts = 30;
    
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
    }, 4000);
    
    return () => clearInterval(checkInterval);
  }, [checkRandomNumberFulfilled, getRandomNumber]);

  const requestRandomNumber = async () => {
    if (!contractInstance) {
      console.error("Contract is not initialized");
      return;
    }
    
    setIsLoading(true);
    setRandomNumber(null);
    
    try {
      const tx = await contractInstance.requestRandomNumber();
      const receipt = await tx.wait();
      
      console.log("Transaction successful:", tx.hash);
      
      setLastRequestTimestamp(Date.now());
      
      await pollForRandomNumber();
    } catch (error) {
      console.error("Error requesting random number:", error);
      setIsCheckingFulfillment(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}

export default RandomNumberDemo;