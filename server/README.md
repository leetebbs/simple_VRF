# Simple VRF (Verifiable Random Function) System

A decentralized, verifiable random number generation system built on Ethereum/EVM-compatible blockchains.

## System Overview

This system implements a Verifiable Random Function (VRF) pattern through a three-component architecture:

1. `OracleRandomNumber.sol` - The core smart contract
2. `TestOracleRandomNumber.sol` - A consumer contract
3. `index.js` - An off-chain oracle server

## How the System Works

1. **Request Flow**:
   - A user or contract calls `requestRandomNumber()` on the `OracleRandomNumber` contract
   - The contract emits a `RandomNumberRequested` event with a unique `requestId`
   - The request is stored in the `requests` mapping

2. **Oracle Server Actions**:
   - The server (`index.js`) listens for `RandomNumberRequested` events
   - When an event is detected, the server:
     - Generates a random number using `generateRandomNumber()`
     - Signs the `requestId` and random number using the oracle's private key
     - Calls `fulfillRandomNumber()` on the smart contract with the random number and signature

3. **Fulfillment Flow**:
   - `OracleRandomNumber` verifies the signature using `verifySignature()`
   - If valid, it stores the random number and marks the request as fulfilled
   - If the requester is a contract, it calls `fulfillRandomNumber()` on that contract
   - It emits a `RandomNumberFulfilled` event

4. **Consumer Contract**:
   - `TestOracleRandomNumber` can request random numbers
   - It receives the result through its `fulfillRandomNumber()` function
   - It stores the random number and emits a `RandomNumberLogged` event

## Security Features

- **Signature Verification**: The system uses ECDSA signatures to verify that random numbers come from the authorized oracle
- **Contract Verification**: The `OracleRandomNumber` contract checks:
  - Only the designated oracle can fulfill requests
  - Each request can only be fulfilled once
  - The signature provided matches the expected data
- **Access Control**: The contract owner can change the oracle address if needed

## Setup Instructions

1. Clone this repository
2. Install dependencies: `npm install`
3. Create a `.env` file with:
4. Deploy the contracts using Hardhat
5. Update the `contractAddress` in `index.js`
6. Start the oracle server: `node index.js`

## Security Considerations

- The oracle's private key should be kept secure
- This is a simplified implementation for educational purposes
- In production, consider using a battle-tested solution like Chainlink VRF

## License

MIT