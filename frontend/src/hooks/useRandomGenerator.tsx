import { useCallback, useState } from 'react';
import { ethers } from 'ethers';
import { GeneratedNumber, NumberFormat } from '../types';

export const useRandomGenerator = () => {
  const [generatedNumber, setGeneratedNumber] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingFulfillment, setIsCheckingFulfillment] = useState(false);
  const [history, setHistory] = useState<GeneratedNumber[]>([]);
  const [lastRequestTimestamp, setLastRequestTimestamp] = useState(0);
  
  const checkRandomNumberFulfilled = useCallback(async (contractInstance: ethers.Contract) => {
    if (!contractInstance) return false;
    
    try {
      const isFulfilled = await contractInstance.isRandomNumberFulfilled();
      return isFulfilled;
    } catch (error) {
      console.error("Error checking if random number is fulfilled:", error);
      return false;
    }
  }, []);
  
  const getRandomNumber = useCallback(async (contractInstance: ethers.Contract, activeFormat: NumberFormat) => {
    if (!contractInstance) return;
    
    try {
      // Get the raw number from the contract
      const number = await contractInstance.getRandomNumber();
      
      // Convert BigNumber to string directly without formatting
      const rawNumber = number.toString();
      console.log("Raw blockchain number:", rawNumber);
      
      // Set the raw value directly
      setGeneratedNumber(rawNumber);
      
      // Add to history
      const newEntry = {
        value: rawNumber,
        format: activeFormat,
        timestamp: new Date(),
      };
      
      setHistory(prev => [newEntry, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error("Error getting random number:", error);
    } finally {
      setIsCheckingFulfillment(false);
      setIsGenerating(false);
    }
  }, []);
  
  const pollForRandomNumber = useCallback(async (contractInstance: ethers.Contract, activeFormat: NumberFormat) => {
    setIsCheckingFulfillment(true);
    let attempts = 0;
    const maxAttempts = 30;
    
    const checkInterval = setInterval(async () => {
      attempts += 1;
      
      const isFulfilled = await checkRandomNumberFulfilled(contractInstance);
      
      if (isFulfilled) {
        clearInterval(checkInterval);
        await getRandomNumber(contractInstance, activeFormat);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.log("Reached maximum attempts. Random number might not be fulfilled yet.");
        setIsCheckingFulfillment(false);
        setIsGenerating(false);
      }
    }, 4000);
    
    return () => clearInterval(checkInterval);
  }, [checkRandomNumberFulfilled, getRandomNumber]);
  
  const generateNumber = async (contractInstance: ethers.Contract, activeFormat: NumberFormat) => {
    if (!contractInstance) {
      return;
    }
    
    setIsGenerating(true);
    setGeneratedNumber(null);
    
    try {
      const tx = await contractInstance.requestRandomNumber();
      const receipt = await tx.wait();
      
      console.log("Transaction successful:", tx.hash);
      
      setLastRequestTimestamp(Date.now());
      
      await pollForRandomNumber(contractInstance, activeFormat);
    } catch (error) {
      console.error("Error requesting random number:", error);
      setIsCheckingFulfillment(false);
      setIsGenerating(false);
    }
  };

  return {
    generatedNumber,
    isGenerating,
    isCheckingFulfillment, 
    history,
    lastRequestTimestamp,
    generateNumber,
    setGeneratedNumber,
  };
};