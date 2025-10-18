// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Data Storage with IPFS Integration
/// @author mramundo
/// @notice Contract for storing encrypted data references with FHEVM and IPFS
contract FHEDataStorage is SepoliaConfig {

    /// @notice Struct to store data items with metadata
    struct DataItem {
        euint32 id;         // Encrypted unique identifier (used as decryption key)
        address owner;      // Address of the data owner
        string ipfsUrl;     // IPFS URL for the stored file
        uint256 timestamp;  // Timestamp when data was saved
    }
    
    /// @notice Counter for generating unique encrypted IDs
    euint32 private _nextId;
    
    /// @notice Array to store all data items
    DataItem[] private dataItems;
    
    /// @notice Mapping to store indices of data items for each address
    mapping(address => uint256[]) private userDataIndices;
    
    /// @notice Mapping to track access permissions: itemIndex => requester => hasAccess
    mapping(uint256 => mapping(address => bool)) private itemAccessPermissions;
    
    /// @notice Event emitted when new data is stored
    event DataStored(euint32 indexed encryptedId, address indexed owner, uint256 index, uint256 timestamp, string ipfsUrl);
    
    /// @notice Event emitted when data access is granted
    event DataAccessGranted(uint256 indexed itemIndex, address indexed owner, address indexed requester);
    
    /// @notice Event emitted when data access is revoked
    event DataAccessRevoked(uint256 indexed itemIndex, address indexed owner, address indexed requester);
    
    /// @notice Save a new data item
    /// @param _ipfsUrl The IPFS URL for the stored file
    /// @return encryptedId The encrypted ID that serves as the decryption key
    function saveDataItem(string calldata _ipfsUrl) external returns (euint32 encryptedId) {
        require(bytes(_ipfsUrl).length > 0, "IPFS URL cannot be empty");
        
        // Increment the encrypted ID counter (starts from 1)
        _nextId = FHE.add(_nextId, FHE.asEuint32(1));
        
        // Create the encrypted ID
        encryptedId = _nextId;
        
        // Add to storage
        uint256 index = dataItems.length;
        dataItems.push(DataItem({
            id: encryptedId,
            owner: msg.sender,
            ipfsUrl: _ipfsUrl,
            timestamp: block.timestamp
        }));
        
        // Update user's data indices
        userDataIndices[msg.sender].push(index);
        
        // Grant owner access to the encrypted ID
        FHE.allowThis(encryptedId);
        FHE.allow(encryptedId, msg.sender);
        
        // Grant owner access to their own data
        itemAccessPermissions[index][msg.sender] = true;
        
        emit DataStored(encryptedId, msg.sender, index, block.timestamp, _ipfsUrl);
        
        return encryptedId;
    }
    
    /// @notice Grant access to a specific data item
    /// @param _itemIndex The index of the data item
    /// @param _requester The address to grant access to
    function grantItemAccess(uint256 _itemIndex, address _requester) external {
        require(_itemIndex < dataItems.length, "Invalid item index");
        require(dataItems[_itemIndex].owner == msg.sender, "Only owner can grant access");
        require(_requester != address(0), "Invalid requester address");
        require(_requester != msg.sender, "Cannot grant access to yourself");
        
        // Grant permission
        itemAccessPermissions[_itemIndex][_requester] = true;
        
        // Allow the requester to access the encrypted ID
        FHE.allow(dataItems[_itemIndex].id, _requester);
        
        emit DataAccessGranted(_itemIndex, msg.sender, _requester);
    }
    
    /// @notice Revoke access from a specific data item
    /// @param _itemIndex The index of the data item
    /// @param _requester The address to revoke access from
    function revokeItemAccess(uint256 _itemIndex, address _requester) external {
        require(_itemIndex < dataItems.length, "Invalid item index");
        require(dataItems[_itemIndex].owner == msg.sender, "Only owner can revoke access");
        require(_requester != address(0), "Invalid requester address");
        
        // Revoke permission
        itemAccessPermissions[_itemIndex][_requester] = false;
        
        emit DataAccessRevoked(_itemIndex, msg.sender, _requester);
    }
    
    /// @notice Get encrypted ID for decryption (only for authorized users)
    /// @param _itemIndex The index of the data item
    /// @param _requester The address requesting access
    /// @return The encrypted ID if the requester has access
    /// @dev This function verifies contract-level permissions
    function getEncryptedId(uint256 _itemIndex, address _requester) external view returns (euint32) {
        require(_itemIndex < dataItems.length, "Invalid item index");
        require(_requester != address(0), "Invalid requester address");
        DataItem storage item = dataItems[_itemIndex];
        
        // Check if requester has access
        require(
            item.owner == _requester || itemAccessPermissions[_itemIndex][_requester],
            "Access denied: caller is not authorized"
        );
        
        return item.id;
    }
    
    /// @notice Get data item details by index for a specific requester
    /// @param _itemIndex The index of the data item
    /// @param _requester The address requesting access
    /// @return owner The owner address
    /// @return ipfsUrl The IPFS URL
    /// @return timestamp The creation timestamp
    function getMyDataItem(uint256 _itemIndex, address _requester) external view returns (
        address owner,
        string memory ipfsUrl,
        uint256 timestamp
    ) {
        require(_itemIndex < dataItems.length, "Invalid item index");
        require(_requester != address(0), "Invalid requester address");
        DataItem storage item = dataItems[_itemIndex];
        
        // Check if requester has access
        require(
            item.owner == _requester || itemAccessPermissions[_itemIndex][_requester],
            "Access denied: caller is not authorized"
        );
        
        return (item.owner, item.ipfsUrl, item.timestamp);
    }
    
    /// @notice Get data item details (without encrypted ID)
    /// @param _itemIndex The index of the data item
    /// @param _requester The address requesting access (use msg.sender from client)
    /// @return owner The owner address
    /// @return ipfsUrl The IPFS URL
    /// @return timestamp The creation timestamp
    function getDataItem(uint256 _itemIndex, address _requester) external view returns (
        address owner,
        string memory ipfsUrl,
        uint256 timestamp
    ) {
        require(_itemIndex < dataItems.length, "Invalid item index");
        require(_requester != address(0), "Invalid requester address");
        DataItem storage item = dataItems[_itemIndex];
        
        // Check if requester has access
        require(
            item.owner == _requester || itemAccessPermissions[_itemIndex][_requester],
            "Access denied: caller is not authorized"
        );
        
        return (item.owner, item.ipfsUrl, item.timestamp);
    }
    
    /// @notice Get all data item indices for a specific owner
    /// @param _owner The address to query data for
    /// @return An array of indices belonging to the specified address
    function getMyDataIndices(address _owner) external view returns (uint256[] memory) {
        require(_owner != address(0), "Invalid owner address");
        return userDataIndices[_owner];
    }
    
    /// @notice Get all data item indices for a specific owner
    /// @param _owner The address to query data for
    /// @return An array of indices belonging to the specified address
    function getDataIndicesByOwner(address _owner) external view returns (uint256[] memory) {
        require(_owner != address(0), "Invalid owner address");
        return userDataIndices[_owner];
    }
    
    /// @notice Check if an address has access to a specific data item
    /// @param _itemIndex The index of the data item
    /// @param _requester The address to check access for
    /// @return True if the requester has access, false otherwise
    function hasItemAccess(uint256 _itemIndex, address _requester) external view returns (bool) {
        require(_itemIndex < dataItems.length, "Invalid item index");
        require(_requester != address(0), "Invalid requester address");
        DataItem storage item = dataItems[_itemIndex];
        return item.owner == _requester || itemAccessPermissions[_itemIndex][_requester];
    }
    
    /// @notice Get the total number of data items
    /// @return The total count of stored data items
    function getTotalDataItems() external view returns (uint256) {
        return dataItems.length;
    }
}
