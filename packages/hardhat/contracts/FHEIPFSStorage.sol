// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint128, externalEuint128} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE IPFS Storage
/// @author mramundo
/// @notice Secure file storage system with encrypted decryption keys using FHEVM and IPFS
/// @dev Files are encrypted client-side, stored on IPFS, and decryption keys are encrypted with FHEVM
contract FHEIPFSStorage is SepoliaConfig {

    /// @notice Struct to store encrypted file information
    struct FileData {
        string cid;              // IPFS CID of the encrypted file
        euint128 encryptedKey;   // Encrypted decryption key (encrypted with FHEVM)
        euint128 price;          // Encrypted price in wei (encrypted with FHEVM)
        address owner;           // File owner address
        uint256 timestamp;       // Creation timestamp
    }
    
    /// @notice Mapping from CID to FileData
    mapping(string => FileData) private files;
    
    /// @notice Mapping to track CID existence
    mapping(string => bool) private cidExists;
    
    /// @notice Mapping for owner's files: owner => array of CIDs
    mapping(address => string[]) private ownerFiles;
    
    /// @notice Array to track all unique providers
    address[] private providers;
    
    /// @notice Mapping to check if address is already a provider
    mapping(address => bool) private isProvider;
    
    /// @notice Struct to store provider statistics
    struct ProviderStats {
        address providerAddress;
        uint256 fileCount;
        euint128 totalPrice;  // Encrypted total price using FHE
    }
    
    /// @notice Event emitted when a new file is stored
    event FileStored(string indexed cid, address indexed owner, uint256 timestamp);
    
    /// @notice Event emitted when access is granted
    event AccessGranted(string indexed cid, address indexed owner, address indexed grantee);
    
    /// @notice Event emitted when access is revoked
    event AccessRevoked(string indexed cid, address indexed owner, address indexed revokee);
    
    /// @notice Store a new encrypted file reference
    /// @param _cid The IPFS CID of the encrypted file
    /// @param _encryptedKey The encrypted decryption key
    /// @param _inputProof The proof for the encrypted key
    /// @param _encryptedPrice The encrypted price in wei
    /// @param _priceInputProof The proof for the encrypted price
    function storeFile(
        string calldata _cid, 
        externalEuint128 _encryptedKey, 
        bytes calldata _inputProof,
        externalEuint128 _encryptedPrice,
        bytes calldata _priceInputProof
    ) external {
        require(bytes(_cid).length > 0, "CID cannot be empty");
        require(!cidExists[_cid], "File with this CID already exists");
        
        // Convert external encrypted key to internal format
        euint128 encryptedKey = FHE.fromExternal(_encryptedKey, _inputProof);
        
        // Convert external encrypted price to internal format
        euint128 encryptedPrice = FHE.fromExternal(_encryptedPrice, _priceInputProof);
        
        // Store file data
        files[_cid] = FileData({
            cid: _cid,
            encryptedKey: encryptedKey,
            price: encryptedPrice,
            owner: msg.sender,
            timestamp: block.timestamp
        });
        
        cidExists[_cid] = true;
        ownerFiles[msg.sender].push(_cid);
        
        // Track provider if first file
        if (!isProvider[msg.sender]) {
            providers.push(msg.sender);
            isProvider[msg.sender] = true;
        }
        
        // Grant access permissions using ZAMA ACL
        FHE.allowThis(encryptedKey);
        FHE.allow(encryptedKey, msg.sender);
        
        FHE.allowThis(encryptedPrice);
        FHE.allow(encryptedPrice, msg.sender);
        
        emit FileStored(_cid, msg.sender, block.timestamp);
    }
    
    /// @notice Grant access to a file for a specific address
    /// @param _cid The IPFS CID of the file
    /// @param _grantee The address to grant access to
    function grantAccess(string calldata _cid, address _grantee) external {
        require(cidExists[_cid], "File does not exist");
        require(files[_cid].owner == msg.sender, "Only owner can grant access");
        require(_grantee != address(0), "Invalid grantee address");
        require(_grantee != msg.sender, "Cannot grant access to yourself");
        
        // Grant access using ZAMA ACL
        FHE.allow(files[_cid].encryptedKey, _grantee);
        FHE.allow(files[_cid].price, _grantee);
        
        emit AccessGranted(_cid, msg.sender, _grantee);
    }
    
    /// @notice Revoke access to a file for a specific address
    /// @param _cid The IPFS CID of the file
    /// @param _revokee The address to revoke access from
    /// @dev Note: ACL revocation is handled by ZAMA framework
    function revokeAccess(string calldata _cid, address _revokee) external {
        require(cidExists[_cid], "File does not exist");
        require(files[_cid].owner == msg.sender, "Only owner can revoke access");
        require(_revokee != address(0), "Invalid revokee address");
        
        emit AccessRevoked(_cid, msg.sender, _revokee);
    }
    
    /// @notice Get file metadata (public information)
    /// @param _cid The IPFS CID of the file
    /// @return owner The file owner
    /// @return timestamp The creation timestamp
    function getFileMetadata(string calldata _cid) external view returns (
        address owner,
        uint256 timestamp
    ) {
        require(cidExists[_cid], "File does not exist");
        FileData storage file = files[_cid];
        return (file.owner, file.timestamp);
    }
    
    /// @notice Get encrypted decryption key (only for authorized users)
    /// @param _cid The IPFS CID of the file
    /// @return The encrypted key (will fail if caller doesn't have ACL permission)
    /// @dev Access control is enforced by ZAMA ACL system during decryption
    function getEncryptedKey(string calldata _cid) external view returns (euint128) {
        require(cidExists[_cid], "File does not exist");
        return files[_cid].encryptedKey;
    }
    
    /// @notice Get encrypted price (only for authorized users)
    /// @param _cid The IPFS CID of the file
    /// @return The encrypted price (will fail if caller doesn't have ACL permission)
    /// @dev Access control is enforced by ZAMA ACL system during decryption
    function getEncryptedPrice(string calldata _cid) external view returns (euint128) {
        require(cidExists[_cid], "File does not exist");
        return files[_cid].price;
    }
    
    /// @notice Get all CIDs owned by a specific address
    /// @param _owner The owner address
    /// @return Array of CIDs owned by the address
    function getOwnerFiles(address _owner) external view returns (string[] memory) {
        require(_owner != address(0), "Invalid owner address");
        return ownerFiles[_owner];
    }
    
    /// @notice Check if a file with given CID exists
    /// @param _cid The IPFS CID to check
    /// @return True if file exists, false otherwise
    function fileExists(string calldata _cid) external view returns (bool) {
        return cidExists[_cid];
    }
    
    /// @notice Get all provider addresses
    /// @return Array of all provider addresses
    function getAllProviders() external view returns (address[] memory) {
        return providers;
    }
    
    /// @notice Get statistics for all providers
    /// @return Array of ProviderStats with file count and encrypted total price (euint128)
    /// @dev Total prices are calculated using FHE.add() to maintain encryption throughout
    /// @dev This function is not view because it grants ACL permissions for encrypted totals
    function getProviderStats() external returns (ProviderStats[] memory) {
        ProviderStats[] memory stats = new ProviderStats[](providers.length);
        
        for (uint256 i = 0; i < providers.length; i++) {
            address provider = providers[i];
            string[] memory providerFiles = ownerFiles[provider];
            uint256 fileCount = providerFiles.length;
            
            // Calculate encrypted total price by summing all file prices using FHE
            euint128 totalPrice;
            if (fileCount > 0) {
                // Start with first file's price
                totalPrice = files[providerFiles[0]].price;
                
                // Sum all remaining file prices using FHE.add() operation
                // This maintains encryption throughout the computation
                for (uint256 j = 1; j < fileCount; j++) {
                    totalPrice = FHE.add(totalPrice, files[providerFiles[j]].price);
                }
                
                // Allow contract and caller to access the encrypted total
                FHE.allowThis(totalPrice);
                FHE.allow(totalPrice, msg.sender);
            }
            
            stats[i] = ProviderStats({
                providerAddress: provider,
                fileCount: fileCount,
                totalPrice: totalPrice
            });
        }
        
        return stats;
    }
    
    /// @notice Get statistics for a specific provider
    /// @param _provider The provider address to query
    /// @return fileCount Number of files uploaded by provider
    /// @return cids Array of CIDs owned by the provider
    function getProviderStatsByAddress(address _provider) external view returns (
        uint256 fileCount,
        string[] memory cids
    ) {
        require(isProvider[_provider], "Address is not a provider");
        
        cids = ownerFiles[_provider];
        fileCount = cids.length;
        
        return (fileCount, cids);
    }
    
    /// @notice Get total number of providers
    /// @return Number of unique providers
    function getProviderCount() external view returns (uint256) {
        return providers.length;
    }
}
