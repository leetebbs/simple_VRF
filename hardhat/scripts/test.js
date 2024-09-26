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
    await tx.wait();  // Wait for the transaction to be mined

    console.log("Random number requested, transaction hash:", tx.hash);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
