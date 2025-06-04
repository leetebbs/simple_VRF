const dotenv = require("dotenv");
dotenv.config();
const ethers = require("ethers");
const crypto = require("crypto");
const express = require("express");
const app = express();
const privateKey = process.env.PRIVATE_KEY; // Oracle signer wallet PK
const contractAddress = "0x48D93Bfccbb24d8cf0C968F187DC5a92c3378bee"; // Oracle contract address on scroll sepolia
const sepoliaContractAddress = "0x7f18276fc5e832a60073bEAe5EcfE3C58A460187"; // Oracle contract address on sepolia
const contractABI = require("./contractABI");

// Connection management variables
let provider;
let sepoliaProvider;
let contract;
let sepoliaContract;
let eventListener;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 30000; // 30 seconds

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Initialize providers and contracts
function initializeConnections() {
  try {
    provider = new ethers.JsonRpcProvider(process.env.SCROLL_RPC_URL);
    sepoliaProvider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    
    contract = new ethers.Contract(contractAddress, contractABI, provider);
    sepoliaContract = new ethers.Contract(sepoliaContractAddress, contractABI, sepoliaProvider);
    
    console.log("Connections initialized successfully");
    reconnectAttempts = 0; // Reset reconnect counter on successful connection
  } catch (error) {
    console.error("Failed to initialize connections:", error);
    handleReconnect();
  }
}

// Set up event listeners with error handling
function setupEventListeners() {
  try {
    // Remove any existing listeners to prevent duplicates
    if (eventListener) {
      contract.removeListener("RandomNumberRequested", eventListener);
    }
    
    // Define the event handler function
    eventListener = async (requestId, requester) => {
      try {
        console.log(`Random number requested by: ${requester} with requestId: ${requestId}`);

        // Generate a random number
        const randomNumber = generateRandomNumber();
        console.log("Generated random number:", randomNumber);
        
        // Sign the random number with requestId
        const result = await signRandomNumber(requestId, randomNumber, privateKey);
        console.log("Generated random number and signature:", result);

        // Fulfill the random number request
        await fulfillRandomNumber(requestId, randomNumber, result.signature);
      } catch (error) {
        console.error(`Error processing request ${requestId}:`, error);
      }
    };

    // Set up the event listener with error handling
    contract.on("RandomNumberRequested", eventListener);
    console.log("Event listeners set up successfully");
    
    // Set up error handlers for the provider
    provider.on("error", (error) => {
      console.error("Provider error:", error);
      if (error.message && error.message.includes("filter not found")) {
        console.log("Filter expired, refreshing...");
        setupEventListeners();
      } else {
        handleReconnect();
      }
    });

    // Add block listener to keep connection alive
    provider.on("block", () => {
      // This helps keep the connection alive
    });

  } catch (error) {
    console.error("Failed to set up event listeners:", error);
    handleReconnect();
  }
}

// Handle reconnection logic
function handleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(`Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Please check your configuration.`);
    return;
  }
  
  reconnectAttempts++;
  console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${RECONNECT_INTERVAL/1000} seconds...`);
  
  setTimeout(() => {
    console.log("Reinitializing connections...");
    initializeConnections();
    setupEventListeners();
  }, RECONNECT_INTERVAL);
}

// Fulfill the random number request with error handling
async function fulfillRandomNumber(requestId, randomNumber, signature) {
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
    const contractWithSigner = contract.connect(wallet);
    console.log("Trying to fulfill");
    
    const tx = await contractWithSigner.fulfillRandomNumber(
      requestId,
      randomNumber,
      signature
    );
    console.log(`Transaction sent: ${tx.hash}`);

    // Wait for transaction confirmation
    await tx.wait();
    console.log(`Transaction confirmed for request ${requestId}`);
  } catch (error) {
    console.error(`Error fulfilling random number for request ${requestId}:`, error);
    // If this is a provider error, attempt reconnection
    if (error.code && (error.code === 'NETWORK_ERROR' || error.code === 'SERVER_ERROR' || error.message.includes('filter'))) {
      handleReconnect();
    }
  }
}

// Generate a random number
function generateRandomNumber() {
  return ethers.toBigInt(ethers.randomBytes(32));
}

// Sign the random number using a private key
async function signRandomNumber(requestId, randomNumber, privateKey) {
  const wallet = new ethers.Wallet(privateKey);
  const messageHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256", "uint256"],
      [requestId, randomNumber]
    )
  );
  const signature = await wallet.signMessage(ethers.getBytes(messageHash));

  return {
    requestId: requestId,
    randomNumber: randomNumber,
    signature: signature,
  };
}

// Initialize the system
initializeConnections();
setupEventListeners();

// Set up a periodic reconnection to prevent filter expiration
const FILTER_REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes (reduced from 4 to be more proactive)
setInterval(() => {
  console.log("Refreshing event filters...");
  try {
    setupEventListeners();
  } catch (error) {
    console.error("Error during filter refresh:", error);
    handleReconnect();
  }
}, FILTER_REFRESH_INTERVAL);

// Express server setup
const server = app.listen(3000, () => {
  console.log("Oracle server running on port 3000");
});

// Graceful shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  // Remove event listeners
  if (eventListener) {
    contract.removeListener("RandomNumberRequested", eventListener);
  }
  
  // Close the server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  
  // Force exit if it takes too long
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}