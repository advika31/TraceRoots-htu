// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TraceRoots {

    struct Batch {
        string batchId;
        string cropType;
        bytes32 originHash;
        uint256 expiryDate;
        uint256 timestamp;
    }

    mapping(string => Batch) private batches;

    event BatchCreated(
        string batchId,
        string cropType,
        bytes32 originHash,
        uint256 expiryDate,
        uint256 timestamp
    );

    function createBatch(
        string memory _batchId,
        string memory _cropType,
        bytes32 _originHash,
        uint256 _expiryDate
    ) public {
        require(batches[_batchId].timestamp == 0, "Batch already exists");
        require(_expiryDate > block.timestamp, "Invalid expiry");

        batches[_batchId] = Batch({
            batchId: _batchId,
            cropType: _cropType,
            originHash: _originHash,
            expiryDate: _expiryDate,
            timestamp: block.timestamp
        });

        emit BatchCreated(
            _batchId,
            _cropType,
            _originHash,
            _expiryDate,
            block.timestamp
        );
    }

    function getBatch(string memory _batchId)
        public
        view
        returns (
            string memory,
            string memory,
            bytes32,
            uint256,
            uint256
        )
    {
        Batch memory b = batches[_batchId];
        require(b.timestamp != 0, "Batch not found");

        return (
            b.batchId,
            b.cropType,
            b.originHash,
            b.expiryDate,
            b.timestamp
        );
    }
}
