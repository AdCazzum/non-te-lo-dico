// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title A simple FHE data storage contract
/// @author mramundo
/// @notice A very basic example contract showing how to work with encrypted data using FHEVM.
contract FHEDataStorage is SepoliaConfig {

    /// @notice Struct to store data items with metadata
    struct DataItem {
        euint32 id;         // Encrypted unique identifier (starts from 1)
        address owner;      // Address of the data owner
        string category;    // Category identifier for the data type
        string data;        // Data string
        uint256 timestamp;  // Timestamp when data was saved
    }
    
    /// @notice Counter for generating unique encrypted IDs
    euint32 private _nextId;
    
    /// @notice Array to store all data items
    DataItem[] private dataItems;
    
    /// @notice Mapping to store indices of data items for each address
    mapping(address => uint256[]) private userDataIndices;
    
    /// @notice Mapping to track access permissions: owner => requester => hasAccess
    mapping(address => mapping(address => bool)) private dataAccessPermissions;
    
    /// @notice Event emitted when new data is stored
    event DataStored(euint32 indexed id, address indexed owner, uint256 index, uint256 timestamp);
    
    /// @notice Event emitted when data access is granted
    event DataAccessGranted(address indexed owner, address indexed requester);
    
    /// @notice Event emitted when data access is revoked
    event DataAccessRevoked(address indexed owner, address indexed requester);
    
    /// @notice Save a new data item
    /// @param _data The data string to store
    /// @param _category The category identifier for the data type
    function save(string calldata _data, string calldata _category) external {
        require(bytes(_data).length > 0, "Data cannot be empty");
        require(bytes(_category).length > 0, "Category cannot be empty");
        
        // Increment the encrypted ID counter (starts from 1)
        _nextId = FHE.add(_nextId, FHE.asEuint32(1));
        
        // Add to storage
        uint256 index = dataItems.length;
        dataItems.push(DataItem({
            id: _nextId,
            owner: msg.sender,
            category: _category,
            data: _data,
            timestamp: block.timestamp
        }));
        
        // Update user's data indices
        userDataIndices[msg.sender].push(index);
        
        // Allow access to the encrypted ID
        FHE.allowThis(_nextId);
        FHE.allow(_nextId, msg.sender);
        
        emit DataStored(_nextId, msg.sender, index, block.timestamp);
    }
    
    /// @notice Retrieve all data items for a specific address
    /// @param _owner The address to query data for
    /// @return An array of DataItem structs belonging to the specified address
    function getDataByOwner(address _owner) external view returns (DataItem[] memory) {
        // Check if msg.sender has permission to access the owner's data
        require(
            msg.sender == _owner || dataAccessPermissions[_owner][msg.sender],
            "Access denied: caller is not authorized to view this data"
        );

        uint256[] memory indices = userDataIndices[_owner];
        DataItem[] memory result = new DataItem[](indices.length);
        
        for (uint256 i = 0; i < indices.length; i++) {
            DataItem memory item = dataItems[indices[i]];
            
            // Check if msg.sender is allowed to access this specific data item
            require(FHE.isSenderAllowed(item.id), "Access denied: caller is not authorized to view this data");
            
            result[i] = item;
        }
        
        return result;
    }

    /// @notice Grant data access to another address
    /// @param _requester The address to grant access to
    /// @dev Only the data owner (msg.sender) can grant access to their data
    function allowDataAccess(address _requester) external {
        require(_requester != address(0), "Invalid requester address");
        require(_requester != msg.sender, "Cannot grant access to yourself");
        
        dataAccessPermissions[msg.sender][_requester] = true;
        
        // Grant access to all encrypted IDs owned by msg.sender
        uint256[] memory indices = userDataIndices[msg.sender];
        for (uint256 i = 0; i < indices.length; i++) {
            FHE.allow(dataItems[indices[i]].id, _requester);
        }
        
        emit DataAccessGranted(msg.sender, _requester);
    }

    /// @notice Revoke data access from an address
    /// @param _requester The address to revoke access from
    /// @dev Only the data owner (msg.sender) can revoke access to their data
    function revokeDataAccess(address _requester) external {
        require(_requester != address(0), "Invalid requester address");
        
        dataAccessPermissions[msg.sender][_requester] = false;
        
        emit DataAccessRevoked(msg.sender, _requester);
    }
    
    /// @notice Check if an address has access to another address's data
    /// @param _owner The data owner address
    /// @param _requester The address requesting access
    /// @return True if the requester has access, false otherwise
    function hasDataAccess(address _owner, address _requester) external view returns (bool) {
        return _owner == _requester || dataAccessPermissions[_owner][_requester];
    }
}
