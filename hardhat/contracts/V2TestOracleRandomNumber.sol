// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OracleRandomNumber.sol";

contract TestOracleRandomNumberV2 {
    OracleRandomNumber public oracleContract;
    
    // Track the latest oracle request ID for the current user
    mapping(address => uint256) public userLatestRequestId;
    
    // Map oracle request IDs to random numbers
    mapping(uint256 => uint256) public oracleIdToRandomNumber;
    
    // Map oracle request IDs to fulfillment status
    mapping(uint256 => bool) public requestFulfillmentStatus;

    // Event for logging the random number received with request ID
    event RandomNumberLogged(uint256 oracleRequestId, uint256 randomNumber);
    event RandomNumberRequested(address indexed user, uint256 oracleRequestId);

    constructor(address _oracleContractAddress) {
        // Set the address of the deployed OracleRandomNumber contract
        oracleContract = OracleRandomNumber(_oracleContractAddress);
    }

    // Function to request a random number from the OracleRandomNumber contract
    function requestRandomNumber() public returns (uint256) {
        // Get a new request ID directly from the oracle
        uint256 oracleRequestId = oracleContract.requestRandomNumber();
        
        // Map this request ID to the user
        userLatestRequestId[msg.sender] = oracleRequestId;
        
        emit RandomNumberRequested(msg.sender, oracleRequestId);
        
        return oracleRequestId;
    }

    // This function should be called by the oracle after fulfilling the random number
    function fulfillRandomNumber(uint256 _randomNumber) public {
        // Only allow the oracle contract to fulfill the random number
        require(msg.sender == address(oracleContract), "Only oracle contract can fulfill this");
        
        // Find the request ID - we need to look it up in the oracle contract
        // This is a workaround since the oracle doesn't pass the request ID to us
        uint256 latestRequestId = oracleContract.nextRequestId() - 1;
        
        // Store the received random number
        oracleIdToRandomNumber[latestRequestId] = _randomNumber;
        requestFulfillmentStatus[latestRequestId] = true;

        // Emit event for logging purposes
        emit RandomNumberLogged(latestRequestId, _randomNumber);
    }

    // Check if a user's latest random number request has been fulfilled
    function isRandomNumberFulfilled(address user) public view returns (bool) {
        uint256 requestId = userLatestRequestId[user];
        if (requestId == 0) return false; // No requests yet
        return requestFulfillmentStatus[requestId];
    }
    
    // Simplified version for current caller
    function isRandomNumberFulfilled() public view returns (bool) {
        return isRandomNumberFulfilled(msg.sender);
    }

    // Get the random number for a specific request ID
    function getRandomNumberByOracleId(uint256 oracleRequestId) public view returns (uint256) {
        require(requestFulfillmentStatus[oracleRequestId], "This request is not fulfilled yet");
        return oracleIdToRandomNumber[oracleRequestId];
    }
    
    // Get the current user's latest random number
    function getRandomNumber() public view returns (uint256) {
        uint256 requestId = userLatestRequestId[msg.sender];
        require(requestId > 0, "No random number requested yet");
        require(requestFulfillmentStatus[requestId], "Random number not yet fulfilled");
        return oracleIdToRandomNumber[requestId];
    }

    // Get the oracle request ID for a user's latest request
    function getUserLatestRequestId(address user) public view returns (uint256) {
        return userLatestRequestId[user];
    }

    // Get the current user's latest oracle request ID
    function getLatestRequestId() public view returns (uint256) {
        return userLatestRequestId[msg.sender];
    }
}