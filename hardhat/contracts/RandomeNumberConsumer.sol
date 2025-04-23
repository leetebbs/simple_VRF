// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Interface for interacting with the OracleRandomNumber contract
 * Defines the functions required to request and retrieve random numbers
 */
interface IOracleRandomNumber {
    function requestRandomNumber() external returns (uint256);
    function getRandomNumber(uint256 _requestId) external view returns (uint256, bool);
    function nextRequestId() external view returns (uint256);
}

/**
 * @title RandomNumberConsumer
 * @dev A contract that consumes verifiable random numbers from the OracleRandomNumber contract
 * It requests random numbers and processes the callback containing the result
 */
contract RandomNumberConsumer {
    /// @notice Address of the contract owner
    address public owner;
    
    /// @notice Address of the oracle providing random numbers
    address public oracleAddress;
    
    /// @notice Interface to interact with the oracle contract
    IOracleRandomNumber public oracleContract;
    
    /// @notice Maps request IDs to their fulfilled random number values
    mapping(uint256 => uint256) public randomNumbers;
    
    /// @notice Tracks whether a request ID has been fulfilled
    mapping(uint256 => bool) public fulfilled;
    
    /**
     * @dev Emitted when a random number is requested from the oracle
     * @param requestId The unique identifier for the request
     */
    event RandomNumberRequested(uint256 indexed requestId);
    
    /**
     * @dev Emitted when a random number is received from the oracle
     * @param requestId The unique identifier for the fulfilled request
     * @param randomValue The random number value received
     */
    event RandomNumberReceived(uint256 indexed requestId, uint256 randomValue);

    /**
     * @dev Restricts function access to the contract owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @dev Initializes the contract with the oracle address
     * @param _oracleAddress Address of the random number oracle
     */
    constructor(address _oracleAddress) {
        owner = msg.sender;
        oracleAddress = _oracleAddress;
        oracleContract = IOracleRandomNumber(_oracleAddress);
    }

    /**
     * @dev Requests a random number from the oracle
     * @return requestId The unique identifier for the random number request
     */
    function requestRandom() public returns (uint256) {
        uint256 requestId = oracleContract.requestRandomNumber();
        emit RandomNumberRequested(requestId);
        return requestId;
    }

    /**
     * @dev Callback function that the oracle calls when the random number is ready
     * @param _randomNumber The generated random number
     * Note: In production, the oracle would typically provide both the requestId and random number
     */
    function fulfillRandomNumber(uint256 _randomNumber) external {
        // Make sure only the oracle contract can call this function
        require(msg.sender == oracleAddress, "Only oracle can fulfill");
        
        // In a real implementation, you would need to associate this random number
        // with the correct requestId. For simplicity, we're just storing the latest.
        uint256 lastRequestId = getLatestRequestId();
        randomNumbers[lastRequestId] = _randomNumber;
        fulfilled[lastRequestId] = true;
        
        emit RandomNumberReceived(lastRequestId, _randomNumber);
    }
    
    /**
     * @dev Helper function to get the latest request ID
     * @return The most recent request ID based on the oracle's counter
     * Note: In a production implementation, you'd likely track the requestIds explicitly
     */
    function getLatestRequestId() internal view returns (uint256) {
        return oracleContract.nextRequestId() - 1;
    }
    
    /**
     * @dev Retrieves a random number if it's been fulfilled
     * @param _requestId The ID of the request
     * @return The random number and whether the request has been fulfilled
     */
    function getRandomNumber(uint256 _requestId) public view returns (uint256, bool) {
        return (randomNumbers[_requestId], fulfilled[_requestId]);
    }
    
    /**
     * @dev Updates the oracle address if needed
     * @param _newOracleAddress The address of the new oracle
     */
    function setOracleAddress(address _newOracleAddress) public onlyOwner {
        oracleAddress = _newOracleAddress;
        oracleContract = IOracleRandomNumber(_newOracleAddress);
    }
    
    /**
     * @dev Example utility function demonstrating random number usage
     * @param _requestId The ID of the fulfilled random number request
     * @param _modulus The modulo to apply to the random number
     * @return The random number modulo _modulus (creates a bounded result)
     */
    function getRandomModulo(uint256 _requestId, uint256 _modulus) public view returns (uint256) {
        require(fulfilled[_requestId], "Random number not yet fulfilled");
        return randomNumbers[_requestId] % _modulus;
    }
}