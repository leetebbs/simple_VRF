const dotenv = require("dotenv");
dotenv.config();
const { ethers } = require("hardhat");
const testContractAddress = "0x550FcE3eEb258B0d49fB31AEdBE87f8BD534747A";
const abi = require("../artifacts/contracts/TestOracleRandomNumber.sol/TestOracleRandomNumber.json").abi;

// Set up the provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Get the signer using the private key from .env
const signer = new ethers.Wallet(process.env.P_KEY, provider);

// Connect the contract to the signer
const contractInstance = new ethers.Contract(testContractAddress, abi, signer);

async function main() {
    // Send a transaction to request a random number
    const tx = await contractInstance.requestRandomNumber();
    console.log("Random number requested, transaction hash:", tx.hash);
    await tx.wait();  // Wait for the transaction to be mined
    console.log("Waiting for oracle to fulfill the request...");
    
    // Adjust the number of attempts and delay based on network conditions
    let attempts = 20;
    
    while (attempts > 0) {
        try {
            // Check if the random number has been fulfilled
            const fulfilled = await contractInstance.isRandomNumberFulfilled();
            
            if (fulfilled) {
                // If fulfilled, get and log the random number
                const randomNumber = await contractInstance.getRandomNumber();
                console.log("Random number received:", randomNumber.toString());
                break;
            } else {
                console.log("Waiting for random number to be fulfilled...");
            }
        } catch (error) {
            console.log("Error checking random number status:", error.message);
        }
        
        // Wait for 3 seconds before trying again
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts--;
    }
    
    if (attempts === 0) {
        console.log("Timed out waiting for random number");
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
