
# Simple VRF System

A decentralized Verifiable Random Function (VRF) system implemented on EVM-compatible blockchains. This system provides secure, verifiable random numbers through a three-component architecture.

## System Architecture

This project consists of three main components:

1. **Smart Contracts** - Core blockchain logic for random number requests and verification
2. **Oracle Server** - Off-chain service that generates and signs random numbers
3. **Client Application** - React-based frontend for interacting with the system

## How It Works

### Random Number Request Flow

1. A user interacts with the client application to request a random number
2. The request is sent to the `V2TestOracleRandomNumber` contract, which forwards it to the `OracleRandomNumber` contract
3. The `OracleRandomNumber` contract:
   - Assigns a unique request ID
   - Stores the request details
   - Emits a `RandomNumberRequested` event

### Oracle Server Process

1. The oracle server (index.js) listens for `RandomNumberRequested` events
2. When an event is detected, the server:
   - Generates a random number using `ethers.toBigInt(ethers.randomBytes(32))`
   - Creates a message hash combining the request ID and random number
   - Signs this hash using the oracle's private key (ECDSA signature)
   - Calls the `fulfillRandomNumber` function with the random number and signature

### ECDSA Verification Process

The ECDSA signature verification works as follows:

1. **Signature Creation** (Server-side):
   ```javascript
   // Create message hash from requestId and randomNumber
   const messageHash = ethers.keccak256(
     ethers.AbiCoder.defaultAbiCoder().encode(
       ["uint256", "uint256"],
       [requestId, randomNumber]
     )
   );
   // Sign the message hash with the oracle's private key
   const signature = await wallet.signMessage(ethers.getBytes(messageHash));
   ```

2. **Signature Verification** (Contract-side):
   ```solidity
   function verifySignature(uint256 _requestId, uint256 _randomNumber, bytes memory _signature) internal view returns (bool) {
       // Create the same message hash
       bytes32 messageHash = keccak256(abi.encodePacked(_requestId, _randomNumber));
       // Get Ethereum signed message hash
       bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
       // Recover signer from signature and verify it matches the oracle address
       return recoverSigner(ethSignedMessageHash, _signature) == oracle;
   }
   ```

3. The contract only accepts the random number if the recovered signer matches the authorized oracle address

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- NPM or Yarn
- MetaMask or another Ethereum wallet
- Access to Scroll Sepolia testnet (or other EVM-compatible network)

### Smart Contract Deployment

1. Navigate to the Hardhat directory:
   ```bash
   cd hardhat
   npm install
   ```

2. Create a `.env` file with:
   ```
   ALCHEMY_KEY=your_alchemy_api_key
   P_KEY=your_private_key
   RPC_URL=your_rpc_endpoint
   SCROLL_KEY=your_scroll_scan_api_key
   ```

3. Deploy the contracts:
   ```bash
   npx hardhat ignition deploy ./ignition/modules/Oracle.js --network scrollSepolia
   npx hardhat ignition deploy ./ignition/modules/V2TestOracleRandomNumber.js --network scrollSepolia
   ```

### Oracle Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file with:
   ```
   PRIVATE_KEY=your_oracle_wallet_private_key
   ORACLE_CONTRACT_ADDRESS=0x48D93Bfccbb24d8cf0C968F187DC5a92c3378bee // or your deployed oracle address
   SCROLL_RPC_URL=https://scroll-public.scroll-testnet.quiknode.pro
   ```

3. Start the oracle server:
   ```bash
   node index.js
   ```

### Client Application Setup

1. Navigate to the client directory:
   ```bash
   cd client
   npm install
   ```

2. Create a `.env` file based on the `.env.example` template

3. Start the client application:
   ```bash
   npm run dev
   ```

## Testing the System

### Manual Testing with Test Script

Test the random number generation manually:
```bash
cd hardhat
node scripts/test.js
```

### Using the Client Application

1. Connect your MetaMask wallet to the application
2. Click the "Request Random Number" button
3. Confirm the transaction in MetaMask
4. Wait for the oracle to fulfill the request
5. The random number will be displayed once fulfilled

## Contract Addresses (Scroll Sepolia)

- Oracle Contract: `0x48D93Bfccbb24d8cf0C968F187DC5a92c3378bee`
- V2TestOracleRandomNumber: `0x125186D9fA999830Dd1160D5C51454B7aCc10e33`
- Oracle Wallet: `0x630b8297b00Ac8b3bB7a384F85806b82EFAfa107`

## Security Considerations

- The oracle's private key should be kept secure
- This implementation is for educational purposes
- For production use, consider a battle-tested solution like Chainlink VRF

## License

This project is available under the MIT License.
```