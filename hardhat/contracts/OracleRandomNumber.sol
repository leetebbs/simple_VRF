// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title OracleRandomNumber
 * @dev A contract that facilitates the generation of verifiable random numbers
 * through an oracle service. The contract stores, manages, and verifies requests
 * for random numbers with cryptographic verification.
 */
contract OracleRandomNumber {
    // Events
    /**
     * @dev Emitted when a random number is requested
     * @param requestId The unique identifier for the request
     * @param requester The address that initiated the request
     */
    event RandomNumberRequested(uint256 indexed requestId, address indexed requester);
    
    /**
     * @dev Emitted when a random number request is fulfilled
     * @param requestId The unique identifier for the fulfilled request
     * @param randomNumber The generated random number
     * @param requester The address that initiated the request
     */
    event RandomNumberFulfilled(uint256 indexed requestId, uint256 randomNumber, address indexed requester);

    /// @notice Address of the oracle service authorized to fulfill random number requests
    address public oracle;
    
    /// @notice Address of the contract owner
    address owner;
    
    /// @notice Counter for request IDs
    uint256 public nextRequestId;

    /**
     * @dev Structure to store random number requests
     * @param requester The address requesting the random number
     * @param fulfilled Boolean indicating if the request has been fulfilled
     * @param randomNumber The generated random number (zero if unfulfilled)
     */
    struct RandomRequest {
        address requester;
        bool fulfilled;
        uint256 randomNumber;
    }

    /// @notice Mapping from request ID to request details
    mapping(uint256 => RandomRequest) public requests;

    /**
     * @dev Restricts function access to the contract owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    /**
     * @dev Initializes the contract with the oracle address
     * @param _oracle Address of the authorized oracle service
     */
    constructor(address _oracle) {
        oracle = _oracle;
        nextRequestId = 1;
        owner = msg.sender;
    }

    /**
     * @dev Allows any address to request a random number
     * @return requestId The unique identifier for the random number request
     */
    function requestRandomNumber() public returns (uint256) {
        uint256 requestId = nextRequestId++;
        requests[requestId] = RandomRequest({
            requester: msg.sender, // Store the requester address (could be an EOA or another contract)
            fulfilled: false,
            randomNumber: 0
        });

        emit RandomNumberRequested(requestId, msg.sender);
        return requestId;
    }

    /**
     * @dev Fulfills a random number request with cryptographic verification
     * @param _requestId The ID of the request to fulfill
     * @param _randomNumber The random number provided by the oracle
     * @param _signature The oracle's cryptographic signature of the random number
     */
    function fulfillRandomNumber(uint256 _requestId, uint256 _randomNumber, bytes memory _signature) public {
        require(msg.sender == oracle, "Only the oracle can fulfill the request");
        require(!requests[_requestId].fulfilled, "Request already fulfilled");
        require(verifySignature(_requestId, _randomNumber, _signature), "Invalid signature");

        RandomRequest storage request = requests[_requestId];
        request.fulfilled = true;
        request.randomNumber = _randomNumber;

        // Notify the requester (which could be a contract like TestOracleRandomNumber) with the fulfilled random number
        if (isContract(request.requester)) {
            // Call the fulfillRandomNumber function on the requester contract
            (bool success, ) = request.requester.call(
                abi.encodeWithSignature("fulfillRandomNumber(uint256)", _randomNumber)
            );
            require(success, "Callback to the requester contract failed");
        }

        emit RandomNumberFulfilled(_requestId, _randomNumber, request.requester);
    }

    /**
     * @dev Verifies the oracle's signature for a random number
     * @param _requestId The ID of the request being fulfilled
     * @param _randomNumber The random number to verify
     * @param _signature The cryptographic signature to verify
     * @return True if the signature is valid, false otherwise
     */
    function verifySignature(uint256 _requestId, uint256 _randomNumber, bytes memory _signature) internal view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(_requestId, _randomNumber));
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        return recoverSigner(ethSignedMessageHash, _signature) == oracle;
    }

    /**
     * @dev Checks if an address is a contract
     * @param account The address to check
     * @return True if the address contains contract code, false otherwise
     */
    function isContract(address account) internal view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    /**
     * @dev Creates the Ethereum signed message hash following EIP-191
     * @param _messageHash The original message hash
     * @return The Ethereum signed message hash
     */
    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    /**
     * @dev Recovers the address that signed a message
     * @param _ethSignedMessageHash The Ethereum signed message hash
     * @param _signature The signature to verify
     * @return The address that created the signature
     */
    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    /**
     * @dev Splits a signature into its r, s, v components
     * @param _signature The signature to split
     * @return r The r component of the signature
     * @return s The s component of the signature
     * @return v The v component of the signature
     */
    function splitSignature(bytes memory _signature) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(_signature.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
    }

    /**
     * @dev Updates the address of the oracle service
     * @param newOracle The address of the new oracle service
     */
    function changeOracle(address newOracle) public onlyOwner {
        oracle = newOracle;
    }

    /**
     * @dev Retrieves the random number for a specific request
     * @param _requestId The ID of the request
     * @return The random number and whether the request has been fulfilled
     */
    function getRandomNumber(uint256 _requestId) public view returns (uint256, bool) {
        RandomRequest storage request = requests[_requestId];
        return (request.randomNumber, request.fulfilled);
    }
}
