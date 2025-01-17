// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentSharing {
    struct Document {
        string name;
        string ipfsHash;
        address owner;
        mapping(address => bool) sharedWith;
        address[] sharedWithArray;
        uint256 timestamp;
        string[] tags;
    }

    mapping(bytes32 => Document) private documents;
    mapping(address => bytes32[]) private ownerDocuments;

    event DocumentUploaded(bytes32 indexed docId, string name, string ipfsHash, address indexed owner, uint256 timestamp);
    event DocumentShared(bytes32 indexed docId, address indexed from, address indexed to);
    event AccessRevoked(bytes32 indexed docId, address indexed recipient);
    event DocumentDeleted(bytes32 indexed docId);

   
    function uploadDocument(string memory name, string memory ipfsHash) public {
        require(bytes(name).length > 0, "Document name cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");

        bytes32 docId = keccak256(abi.encodePacked(name, msg.sender, block.timestamp));
        require(bytes(documents[docId].name).length == 0, "Document already exists");

        Document storage newDocument = documents[docId];
        newDocument.name = name;
        newDocument.ipfsHash = ipfsHash;
        newDocument.owner = msg.sender;
        newDocument.timestamp = block.timestamp;

        ownerDocuments[msg.sender].push(docId);

        emit DocumentUploaded(docId, name, ipfsHash, msg.sender, block.timestamp);
    }

   
    function getDocument(bytes32 docId)
        public
        view
        returns (
            string memory name,
            string memory ipfsHash,
            address owner,
            address[] memory sharedWithArray,
            uint256 timestamp
        )
    {
        Document storage doc = documents[docId];
        require(bytes(doc.name).length > 0, "Document does not exist");
        require(hasAccess(docId, msg.sender), "Access denied");

        return (doc.name, doc.ipfsHash, doc.owner, doc.sharedWithArray, doc.timestamp);
    }

    
    function shareDocument(bytes32 docId, address recipient) public {
        require(recipient != address(0), "Invalid recipient address");
        Document storage doc = documents[docId];
        require(msg.sender == doc.owner, "Only the owner can share the document");
        require(!doc.sharedWith[recipient], "Document already shared with this recipient");

        doc.sharedWith[recipient] = true;
        doc.sharedWithArray.push(recipient);

        emit DocumentShared(docId, msg.sender, recipient);
    }

    function deleteDocument(bytes32 docId) public {
        Document storage doc = documents[docId];
        require(msg.sender == doc.owner, "Only the owner can delete the document");

        delete documents[docId];

        bytes32[] storage ownerDocList = ownerDocuments[msg.sender];
        for (uint256 i = 0; i < ownerDocList.length; i++) {
            if (ownerDocList[i] == docId) {
                ownerDocList[i] = ownerDocList[ownerDocList.length - 1];
                ownerDocList.pop();
                break;
            }
        }

        emit DocumentDeleted(docId);
    }

   
    function hasAccess(bytes32 docId, address user) public view returns (bool) {
        Document storage doc = documents[docId];
        return user == doc.owner || doc.sharedWith[user];
    }

   
    function addTags(bytes32 docId, string[] memory newTags) public {
        Document storage doc = documents[docId];
        require(msg.sender == doc.owner, "Only the owner can add tags");

        for (uint256 i = 0; i < newTags.length; i++) {
            doc.tags.push(newTags[i]);
        }
    }

  
    function searchByTag(string memory tag) public view returns (bytes32[] memory docIds) {
        uint256 count = 0;
        bytes32[] memory results = new bytes32[](ownerDocuments[msg.sender].length);

        for (uint256 i = 0; i < ownerDocuments[msg.sender].length; i++) {
            bytes32 docId = ownerDocuments[msg.sender][i];
            Document storage doc = documents[docId];

            for (uint256 j = 0; j < doc.tags.length; j++) {
                if (keccak256(abi.encodePacked(doc.tags[j])) == keccak256(abi.encodePacked(tag))) {
                    results[count] = docId;
                    count++;
                    break;
                }
            }
        }

        bytes32[] memory filteredResults = new bytes32[](count);
        for (uint256 k = 0; k < count; k++) {
            filteredResults[k] = results[k];
        }

        return filteredResults;
    }


    function getDocumentsByOwner(address owner) public view returns (bytes32[] memory) {
        return ownerDocuments[owner];
    }
}
