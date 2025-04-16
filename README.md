## Simple VRF System

This project implements a decentralized VRF (Verifiable Random Function) oracle system on the blockchain, with three main components:

1. **Smart Contracts** - Manages random number requests and verification on-chain
2. **Oracle Server** - Generates secure random numbers and signs them cryptographically 
3. **Client Application** - Provides a user interface for interacting with the VRF system

## Project Structure

```
simple_VRF/
├── client/             # Frontend application built with React + Vite
├── hardhat/            # Smart contract development environment
│   ├── contracts/      # Solidity smart contracts
│   ├── ignition/       # Deployment modules
│   ├── scripts/        # Utility scripts
│   └── test/           # Contract test files
└── server/             # Oracle server that generates and signs random numbers
```

## Components

### Smart Contracts

The project includes two main smart contracts:
- **OracleRandomNumber**: The core contract that manages random number requests and verification
- **TestOracleRandomNumber**: An example contract for testing the random number generation functionality

Key features:
- Request random numbers from the blockchain
- Cryptographic verification of oracle-provided random numbers
- Event emissions for request and fulfillment tracking

### Oracle Server

The server component listens for random number requests from the smart contract and provides cryptographically verifiable responses.

Features:
- Event listening for `RandomNumberRequested` events
- Secure random number generation
- Cryptographic signing of random numbers
- Submission of random numbers back to the smart contract

### Client Application

A React-based frontend for interacting with the VRF system.

## Setup and Configuration

### Prerequisites
- Node.js (v14+)
- NPM or Yarn
- MetaMask or another Ethereum wallet

### Environment Variables

#### Hardhat (.env)
```
ALCHEMY_KEY=your_alchemy_api_key
P_KEY=your_private_key
RPC_URL=your_rpc_endpoint
SCROLL_KEY=your_scroll_scan_api_key
```

#### Server (.env)
```
PRIVATE_KEY=your_oracle_wallet_private_key
ORACLE_CONTRACT_ADDRESS=deployed_contract_address
RPC_URL=your_rpc_endpoint
```

#### Client (.env)
See .env.example in the client directory

## Deployment

### Smart Contracts
```bash
cd hardhat
npm install
# Deploy the Oracle contract
npx hardhat ignition deploy ./ignition/modules/Oracle.js --network scrollSepolia
# Deploy the TestOracleRandomNumber contract
npx hardhat ignition deploy ./ignition/modules/TestOracleRandomNumber.js --network scrollSepolia
```

### Oracle Server
```bash
cd server
npm install
node index.js
```

### Client Application
```bash
cd client
npm install
npm run dev
```

## Testing

Run tests for the smart contracts:
```bash
cd hardhat
npx hardhat test
```

Test the random number generation manually:
```bash
cd hardhat
node scripts/test.js
```

## Key Addresses

- Oracle Wallet: 0x630b8297b00Ac8b3bB7a384F85806b82EFAfa107
- Oracle Contract: 0x48D93Bfccbb24d8cf0C968F187DC5a92c3378bee
- Test Contract: 0x550FcE3eEb258B0d49fB31AEdBE87f8BD534747A

## Network

This project is configured to deploy to the Scroll Sepolia testnet.

## Learn More

- This project uses [Hardhat](https://hardhat.org/) for Ethereum development
- [Hardhat Ignition](https://hardhat.org/ignition) is used for deployment management
- [Ethers.js](https://docs.ethers.org/) for blockchain interaction

## License

This project is open-source and available under the MIT License.