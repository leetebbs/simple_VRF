const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OracleRandomNumber and TestOracleRandomNumber", function () {
  let OracleRandomNumber, oracleRandomNumber, TestOracleRandomNumber, testOracleRandomNumber;
  let deployer, oracle, user;

  before(async function () {
    [deployer, oracle, user] = await ethers.getSigners();

    // Deploy the OracleRandomNumber contract
    OracleRandomNumber = await ethers.getContractFactory("OracleRandomNumber");
    oracleRandomNumber = await OracleRandomNumber.deploy(oracle.address);
    await oracleRandomNumber.waitForDeployment();  // Use waitForDeployment in ethers.js v6
    console.log("OracleRandomNumber deployed to:", await oracleRandomNumber.getAddress());

    // Verify the oracleRandomNumber contract is not null and has a valid address
    expect(ethers.isAddress(await oracleRandomNumber.getAddress())).to.be.true;

    // Deploy the TestOracleRandomNumber contract, passing the address of OracleRandomNumber
    TestOracleRandomNumber = await ethers.getContractFactory("TestOracleRandomNumber");
    testOracleRandomNumber = await TestOracleRandomNumber.deploy(await oracleRandomNumber.getAddress());
    await testOracleRandomNumber.waitForDeployment();  // Use waitForDeployment in ethers.js v6
    console.log("TestOracleRandomNumber deployed to:", await testOracleRandomNumber.getAddress());

    // Verify the testOracleRandomNumber contract is not null and has a valid address
    expect(ethers.isAddress(await testOracleRandomNumber.getAddress())).to.be.true;
  });

  it("Should request a random number from OracleRandomNumber", async function () {
    // User requests a random number
    const tx = await testOracleRandomNumber.attach(await testOracleRandomNumber.getAddress()).connect(user).requestRandomNumber();
    await tx.wait();

    // Get requestId and ensure it's treated as BigInt
    const nextRequestId = await oracleRandomNumber.nextRequestId();  // nextRequestId is likely BigInt
    const requestId = nextRequestId - 1n;  // Use BigInt subtraction (note the `n` suffix)
    const request = await oracleRandomNumber.requests(requestId);
    expect(request.requester).to.equal(await testOracleRandomNumber.getAddress());
    expect(request.fulfilled).to.equal(false);

    console.log("Random number requested with requestId:", requestId.toString());  // Convert BigInt to string for logging
  });

  it("Should fulfill the random number request and callback TestOracleRandomNumber", async function () {
    const nextRequestId = await oracleRandomNumber.nextRequestId();
    const requestId = nextRequestId - 1n;  // BigInt arithmetic for requestId

    // Oracle fulfills the random number request with a signature
    const randomNumber = BigInt(Math.floor(Math.random() * 1000));  // Use BigInt for random numbers
    const messageHash = ethers.solidityPackedKeccak256(
      ["uint256", "uint256"],
      [requestId, randomNumber]
    );
    const ethSignedMessageHash = ethers.hashMessage(ethers.getBytes(messageHash));
    const signature = await oracle.signMessage(ethers.getBytes(messageHash));

    // Call fulfillRandomNumber to complete the request
    const tx = await oracleRandomNumber.connect(oracle).fulfillRandomNumber(
      requestId,
      randomNumber,
      signature
    );
    await tx.wait();

    // Verify that the random number has been fulfilled
    const request = await oracleRandomNumber.requests(requestId);
    expect(request.fulfilled).to.equal(true);
    expect(request.randomNumber).to.equal(randomNumber);

    // Check that TestOracleRandomNumber received the random number via callback
    const fulfilled = await testOracleRandomNumber.isRandomNumberFulfilled();
    expect(fulfilled).to.equal(true);

    const receivedRandomNumber = await testOracleRandomNumber.getRandomNumber();
    expect(receivedRandomNumber).to.equal(randomNumber);

    console.log("Random number fulfilled and received by TestOracleRandomNumber:", receivedRandomNumber.toString());
  });
});
