const dotenv = require("dotenv");
dotenv.config();
const ethers = require("ethers");
const crypto = require("crypto");
const express = require("express");
const app = express();
const privateKey = process.env.PRIVATE_KEY;
const contractAddress = process.env.ORACLE_CONTRACT_ADDRESS;
const contractABI = require("./contractABI");
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Initialize ethers.js Contract object
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Listen for smart contract events
function listenForRandomNumberRequests() {
  contract.on("RandomNumberRequested", async (requestId, requester) => {
    console.log(`Random number requested by: ${requester} with requestId: ${requestId}`);

    // Generate a random number
    const randomNumber = generateRandomNumber();
    console.log("Generated random number:", randomNumber);
    
    // Sign the random number with requestId
    const result = await signRandomNumber(requestId, randomNumber, privateKey);

    console.log("Generated random number and signature:", result);

    // Fulfill the random number request
    await fulfillRandomNumber(requestId, randomNumber, result.signature);
  });
}

// Fulfill the random number request
async function fulfillRandomNumber(requestId, randomNumber, signature) {
  const wallet = new ethers.Wallet(privateKey, provider); // Signer with private key
  const contractWithSigner = contract.connect(wallet); // Connect the contract with the signer
  console.log("Trying to fulfill");
  const tx = await contractWithSigner.fulfillRandomNumber(
    requestId,
    randomNumber,
    signature
  );
  console.log(`Transaction sent: ${tx.hash}`);

  // Wait for transaction confirmation
  await tx.wait();
  console.log(`Transaction confirmed`);
}

// Call the function to start listening for events
listenForRandomNumberRequests();

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

//express server
app.get("/", (req, res) => {
  res.send("Server running!");
});

app.listen(3000, () => {
  console.log("Oracle server running on port 3000");
});
