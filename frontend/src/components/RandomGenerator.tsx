import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { RefreshCw } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { useTheme } from '../context/ThemeContext';
import WalletConnector from './WalletConnector';
import ResultDisplay from './ResultDisplay';
import GeneratorHistory from './GeneratorHistory';
import { useRandomGenerator } from '../hooks/useRandomGenerator';

const RandomGenerator: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [contractInstance, setContractInstance] = useState<ethers.Contract | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { isDarkMode } = useTheme();
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  
  const {
    generatedNumber,
    isGenerating,
    isCheckingFulfillment,
    history,
    generateNumber: generateRandomNumber,
  } = useRandomGenerator();
  
  const handleContractReady = (contract: ethers.Contract) => {
    setContractInstance(contract);
  };
  
  const handleGenerateNumber = () => {
    if (contractInstance) {
      generateRandomNumber(contractInstance, 'integer');
    } else {
      alert("Please connect your wallet first");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-400 via-blue-400 to-purple-500 text-transparent bg-clip-text mb-4">
          Random Number Generator
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Generate truly random numbers with cryptographic security, powered by blockchain technology.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-visible">
          <div className="mb-8">            
            <div className="mt-8 space-y-6">              
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleGenerateNumber}
                  isLoading={isGenerating}
                  icon={<RefreshCw size={18} />}
                  className="w-full sm:w-auto"
                  disabled={!connected || isCheckingFulfillment || isWrongNetwork}
                >
                  {isWrongNetwork ? 'Wrong Network' : 'Generate Random Number'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
        
        <WalletConnector 
          onContractReady={handleContractReady} 
          isConnected={connected} 
          setIsConnected={setConnected} 
        />
      </div>
      
      <Card className="mt-6">
        <ResultDisplay 
          generatedNumber={generatedNumber}
          isGenerating={isGenerating}
          isCheckingFulfillment={isCheckingFulfillment}
          history={history}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
        />
        
        <GeneratorHistory 
          history={history} 
          visible={showHistory} 
        />
      </Card>
    </div>
  );
};

export default RandomGenerator;