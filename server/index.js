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
async function initializeConnections() {
  try {
    // Use HTTP RPC providers for more reliable connections
    const scrollRpcUrl = process.env.SCROLL_RPC_URL;
    const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;

    if (!scrollRpcUrl || !sepoliaRpcUrl) {
      throw new Error("RPC URLs not configured in environment variables");
    }

    console.log("Initializing HTTP RPC providers...");
    provider = new ethers.JsonRpcProvider(scrollRpcUrl);
    sepoliaProvider = new ethers.JsonRpcProvider(sepoliaRpcUrl);
    
    // Wait for providers to be ready
    console.log("Waiting for Scroll provider to be ready...");
    await provider.ready;
    console.log("Scroll provider is ready");
    
    console.log("Waiting for Sepolia provider to be ready...");
    await sepoliaProvider.ready;
    console.log("Sepolia provider is ready");
    
    contract = new ethers.Contract(contractAddress, contractABI, provider);
    sepoliaContract = new ethers.Contract(sepoliaContractAddress, contractABI, sepoliaProvider);
    
    console.log("RPC connections initialized successfully");
    reconnectAttempts = 0; // Reset reconnect counter on successful connection
  } catch (error) {
    console.error("Failed to initialize RPC connections:", error);
    handleReconnect();
  }
}

// Set up event listeners with error handling
async function setupEventListeners() {
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
    try {
      console.log("Setting up event listener for RandomNumberRequested...");
      
      // Use a polling approach with HTTP RPC
      const pollInterval = setInterval(async () => {
        try {
          const filter = {
            address: contractAddress,
            topics: [ethers.id("RandomNumberRequested(uint256,address)")]
          };
          
          const logs = await provider.getLogs(filter);
          
          for (const log of logs) {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog) {
              const [requestId, requester] = parsedLog.args;
              await eventListener(requestId, requester);
            }
          }
        } catch (error) {
          console.error("Error polling for events:", error);
          if (error.message && error.message.includes("401")) {
            console.error("Authentication error while polling events");
            clearInterval(pollInterval);
            handleReconnect();
          }
        }
      }, 10000); // Poll every 10 seconds
      
      // Store the interval ID for cleanup
      provider.pollInterval = pollInterval;
      
      console.log("Event polling set up successfully");
    } catch (error) {
      console.error("Error setting up event polling:", error);
      throw error; // Re-throw to trigger reconnection
    }

  } catch (error) {
    console.error("Failed to set up event listeners:", error);
    handleReconnect();
  }
}

// Handle reconnection logic
async function handleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(`Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Please check your configuration.`);
    return;
  }
  
  reconnectAttempts++;
  console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${RECONNECT_INTERVAL/1000} seconds...`);
  
  setTimeout(async () => {
    console.log("Reinitializing connections...");
    await initializeConnections();
    await setupEventListeners();
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
(async () => {
  try {
    await initializeConnections();
    await setupEventListeners();
  } catch (error) {
    console.error("Failed to initialize system:", error);
  }
})();

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
  
  // Clear intervals
  if (provider) {
    if (provider.pollInterval) {
      clearInterval(provider.pollInterval);
    }
  }
  if (sepoliaProvider) {
    if (sepoliaProvider.pollInterval) {
      clearInterval(sepoliaProvider.pollInterval);
    }
  }
  
  // Close WebSocket connections
  if (provider) {
    provider.destroy();
  }
  if (sepoliaProvider) {
    sepoliaProvider.destroy();
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