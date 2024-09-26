// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OracleRandomNumber.sol";  // Make sure to import the OracleRandomNumber contract

contract TestOracleRandomNumber {
    OracleRandomNumber public oracleContract;
    bool public randomNumberReceived;
    uint256 public receivedRandomNumber;

    // Event for logging the random number received
    event RandomNumberLogged(uint256 randomNumber);

    constructor(address _oracleContractAddress) {
        // Set the address of the deployed OracleRandomNumber contract
        oracleContract = OracleRandomNumber(_oracleContractAddress);
    }

    // Function to request a random number from the OracleRandomNumber contract
    function requestRandomNumber() public {
        oracleContract.requestRandomNumber();
    }

    // This function should be called by the oracle after fulfilling the random number
    function fulfillRandomNumber(uint256 _randomNumber) public {
        // Only allow the oracle contract to fulfill the random number
        require(msg.sender == address(oracleContract), "Only oracle contract can fulfill this");
        
        // Store the received random number
        receivedRandomNumber = _randomNumber;
        randomNumberReceived = true;

        // Emit event for logging purposes
        emit RandomNumberLogged(_randomNumber);
    }

    // Check if the random number has been received
    function isRandomNumberFulfilled() public view returns (bool) {
        return randomNumberReceived;
    }

    // Return the received random number
    function getRandomNumber() public view returns (uint256) {
        require(randomNumberReceived, "Random number not yet fulfilled");
        return receivedRandomNumber;
    }
}
