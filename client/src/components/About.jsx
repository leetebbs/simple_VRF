import React from 'react';

const About = () => {
  return (
    <div className="about-container">
      <h1>About This Project</h1>
      <div className="about-content">
        <p>
          This application demonstrates a custom Verifiable Random Function (VRF) system
          to generate provably fair and verifiable random numbers on the blockchain.
        </p>
        
        <h2>How It Works</h2>
        <p>
          When you request a random number, a transaction is sent to the TestOracleRandomNumberV2 contract that 
          calls out to the OracleRandomNumber contract. An off-chain oracle server detects this request, 
          generates a random number, cryptographically signs it with ECDSA, and returns it to the blockchain
          with proof that it hasn't been tampered with.
        </p>
        
        <h2>System Architecture</h2>
        <ul>
          <li>Smart Contracts for on-chain request handling and verification</li>
          <li>Off-chain Oracle Server for secure random number generation</li>
          <li>ECDSA signatures for cryptographic verification</li>
          <li>React.js frontend for user interaction</li>
        </ul>
        
        <h2>Technology Used</h2>
        <ul>
          <li>React.js for the frontend</li>
          <li>Ethereum and Smart Contracts</li>
          <li>Custom VRF implementation using ECDSA signatures</li>
          <li>Ethers.js for blockchain interaction</li>
          <li>Deployed on Scroll Sepolia testnet</li>
        </ul>
      </div>
    </div>
  );
};

export default About;