import React from 'react';

const About: React.FC = () => {
  return (
    // Add padding and max-width for better centering and spacing
    <div className="container mx-auto max-w-3xl px-4 py-12"> 
      <h1 className="text-4xl font-bold mb-6 text-teal-400 text-center">About RandomizeX</h1> 
      
      {/* Use a consistent container for content sections */}
      <div className="space-y-8 text-gray-300"> 
        <p className="text-lg leading-relaxed">
          This application demonstrates a custom Verifiable Random Function (VRF) system
          designed to generate provably fair and verifiable random numbers directly on the blockchain.
        </p>
        
        <section> {/* Use section tags for semantic structure */}
          <h2 className="text-2xl font-semibold mb-3 text-teal-500 border-b border-gray-700 pb-2">How It Works</h2>
          <p className="leading-relaxed">
            When you request a random number through this interface, a transaction is initiated targeting the <code className="bg-gray-700 px-1 rounded text-sm">TestOracleRandomNumberV2</code> smart contract. This contract, in turn, calls the core <code className="bg-gray-700 px-1 rounded text-sm">OracleRandomNumber</code> contract. An off-chain oracle server, constantly monitoring for such requests, securely generates a random number. This number is then cryptographically signed using ECDSA and submitted back to the blockchain along with the signature, providing verifiable proof of its integrity and origin.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-teal-500 border-b border-gray-700 pb-2">System Architecture</h2>
          <ul className="list-disc list-inside space-y-2 pl-4"> {/* Style the list */}
            <li><strong>Smart Contracts:</strong> Handle on-chain request logic and signature verification.</li>
            <li><strong>Off-chain Oracle Server:</strong> Responsible for secure random number generation and signing.</li>
            <li><strong>ECDSA Signatures:</strong> Provide cryptographic proof of randomness integrity.</li>
            <li><strong>React.js Frontend:</strong> Offers a user-friendly interface for interaction.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-teal-500 border-b border-gray-700 pb-2">Technology Stack</h2>
          <ul className="list-disc list-inside space-y-2 pl-4"> {/* Style the list */}
            <li>Frontend Framework: <strong className="text-teal-400">React.js</strong> with <strong className="text-teal-400">Tailwind CSS</strong></li>
            <li>Blockchain: <strong className="text-teal-400">Ethereum</strong> (via Scroll Sepolia Testnet)</li>
            <li>Smart Contract Language: <strong className="text-teal-400">Solidity</strong></li>
            <li>Randomness Generation: Custom VRF implementation using <strong className="text-teal-400">ECDSA</strong></li>
            <li>Blockchain Interaction Library: <strong className="text-teal-400">Ethers.js</strong></li>
            <li>Deployment Target: <strong className="text-teal-400">Scroll Sepolia Testnet</strong></li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default About;