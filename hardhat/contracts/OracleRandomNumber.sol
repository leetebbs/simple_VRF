// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OracleRandomNumber {
    // Events
    event RandomNumberRequested(uint256 indexed requestId, address indexed requester);
    event RandomNumberFulfilled(uint256 indexed requestId, uint256 randomNumber, address indexed requester);

    address public oracle;
    address owner;
    uint256 public nextRequestId;

    struct RandomRequest {
        address requester;
        bool fulfilled;
        uint256 randomNumber;
    }

    mapping(uint256 => RandomRequest) public requests;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor(address _oracle) {
        oracle = _oracle;
        nextRequestId = 1;
        owner = msg.sender;
    }

    // Function to request a random number
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

    // Oracle fulfills the random number request
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

    // Verify the oracle's signature
    function verifySignature(uint256 _requestId, uint256 _randomNumber, bytes memory _signature) internal view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(_requestId, _randomNumber));
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        return recoverSigner(ethSignedMessageHash, _signature) == oracle;
    }

    // Helper function to check if an address is a contract
    function isContract(address account) internal view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    // Helper function to get the Ethereum signed message hash
    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    // Helper function to recover the signer of a signature
    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    // Helper function to split the signature into r, s, and v components
    function splitSignature(bytes memory _signature) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(_signature.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
    }

    // Function to change the oracle (add appropriate access control)
    function changeOracle(address newOracle) public onlyOwner {
        oracle = newOracle;
    }

    // Function to get the random number for a specific request
    function getRandomNumber(uint256 _requestId) public view returns (uint256, bool) {
        RandomRequest storage request = requests[_requestId];
        return (request.randomNumber, request.fulfilled);
    }
}
